import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalArea,
  formatClinicalTitle,
  isTechnicalSourceLabel,
  parseClinicalText,
  toReadableCase,
} from "../src/lib/clinical-text.ts";

const text = (parts) => parts.map((part) => part.text).join("");

test("junta frases quebradas no meio pela importação de PDF", () => {
  const blocks = parseClinicalText("Bacteriúria assintomática exige ≥100.000 UFC/mL; tratar principalmente\ngestantes e antes de procedimento urológico.");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].kind, "paragraph");
  assert.equal(blocks[0].lines.length, 1);
  assert.match(text(blocks[0].lines[0]), /principalmente gestantes/);
});

test("reconhece títulos isolados e listas com marcador colado", () => {
  const blocks = parseClinicalText("Fisiologia da prolactina\n\n-Fatores que inibem: Dopamina e GABA\n-Medicamentos que aumentam serotonina");
  assert.deepEqual(blocks.map((block) => block.kind), ["heading", "list"]);
  assert.equal(blocks[0].text, "Fisiologia da prolactina");
  assert.equal(blocks[1].items.length, 2);
  assert.equal(text(blocks[1].items[1].content), "Medicamentos que aumentam serotonina");
});

test("rótulo com dois-pontos vira subtítulo e linhas curtas depois dele viram lista", () => {
  const blocks = parseClinicalText("Falência medular:\n\nAnemia → fadiga.\nNeutropenia → febre.\nPlaquetopenia → petéquias.");
  assert.deepEqual(blocks.map((block) => block.kind), ["subheading", "list"]);
  assert.equal(blocks[1].items.length, 3);
});

test("pegadinha, macete e frase mental viram destaques", () => {
  const blocks = parseClinicalText("Tratamento: excisão.\n\nPegadinha: não usar estrogênio.\n\nFrase mental: Pérola na pele = basocelular.");
  const callouts = blocks.filter((block) => block.kind === "callout");
  assert.equal(callouts.length, 2);
  assert.equal(callouts[0].tone, "attention");
  assert.equal(callouts[1].tone, "tip");
  assert.equal(callouts[1].label, "Frase mental");
});

test("rótulo no início da linha fica em negrito", () => {
  const [block] = parseClinicalText("Tratamento: excisão cirúrgica/Mohs em áreas nobres.");
  assert.equal(block.lines[0][0].bold, true);
  assert.equal(block.lines[0][0].text, "Tratamento:");
});

test("CAIXA ALTA vira caixa normal preservando siglas e valores", () => {
  assert.equal(toReadableCase("LMA — LEUCEMIA MIELOIDE AGUDA"), "LMA — leucemia mieloide aguda");
  assert.equal(toReadableCase("1) LEUCEMIAS AGUDAS"), "1) Leucemias agudas");
  assert.equal(toReadableCase("PONTOS DE ISQUEMIA"), "Pontos de isquemia");
  // Linhas só de siglas/valores não são mexidas.
  assert.equal(toReadableCase("MPO+, CD13+, CD33+."), "MPO+, CD13+, CD33+.");
  assert.equal(toReadableCase("LABA + LAMA + CI/ICS"), "LABA + LAMA + CI/ICS");
  // Texto já em caixa mista fica como está.
  assert.equal(toReadableCase("Doença de Cushing"), "Doença de Cushing");
  assert.equal(formatClinicalTitle("HIPERPROLACTINEMIA"), "Hiperprolactinemia");
});

test("áreas duplicadas são agrupadas e rótulos técnicos reconhecidos", () => {
  assert.equal(canonicalArea("CLINICA"), "Clínica médica");
  assert.equal(canonicalArea("Clínica Médica"), "Clínica médica");
  assert.equal(canonicalArea("PEDIATRIA"), canonicalArea("Pediatria"));
  assert.equal(isTechnicalSourceLabel("Importado"), true);
  assert.equal(isTechnicalSourceLabel("PDF 2"), true);
  assert.equal(isTechnicalSourceLabel("Cirurgia"), false);
});

test("não perde conteúdo: todas as letras do texto original aparecem nos blocos", () => {
  const source = "Etiologias\n\nFisiológicas\n-Gravidez, lactação\n\nPatológicos\n-Doenças sistêmicas: hipotireoidismo\n\nMacete: 3 Ps.\n1. Primeiro\n2. Segundo";
  const flat = parseClinicalText(source)
    .map((block) =>
      block.kind === "heading" || block.kind === "subheading"
        ? block.text
        : block.kind === "paragraph"
          ? block.lines.map(text).join("")
          : block.kind === "list"
            ? block.items.map((item) => `${item.marker ?? ""}${text(item.content)}`).join("")
            : `${block.label}${text(block.content)}`
    )
    .join("");
  const letters = (value) => value.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  assert.equal(letters(flat), letters(source));
});
