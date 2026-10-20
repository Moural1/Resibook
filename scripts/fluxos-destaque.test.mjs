import assert from "node:assert/strict";
import test from "node:test";

const { destacar, separarTitulo, separarVeredito } = await import("../src/lib/fluxos/destaque.ts");

const juntar = (trechos) => trechos.map((t) => t.texto).join("");
const de = (trechos, tipo) => trechos.filter((t) => t.tipo === tipo).map((t) => t.texto);

test("realce não perde nem muda nenhuma letra", () => {
  for (const texto of [
    "Hemotórax maciço: ≥ 1.500 mL de saída imediata ou 200 mL/h por 2–4 h → toracotomia",
    "Ler RR 0,40 como 'reduz 40%' ou IC todo abaixo de 1 como 'não significativo'",
    "Femoral em IIIB (é IIIC)",
    "Diretriz de 2018 soma iSGLT2/ARNI só se sintomático",
  ]) {
    assert.equal(juntar(destacar(texto)), texto);
  }
});

test("números de prova, armadilhas e correções são reconhecidos", () => {
  const t = destacar("Hemotórax maciço: ≥ 1.500 mL de saída imediata ou 200 mL/h por 2–4 h");
  assert.deepEqual(de(t, "numero"), ["≥ 1.500 mL", "200 mL/h", "2–4 h"]);
  assert.deepEqual(de(destacar("Ler RR 0,40 como 'reduz 40%'"), "armadilha"), ["'reduz 40%'"]);
  assert.deepEqual(de(destacar("Femoral em IIIB (é IIIC)"), "correcao"), ["(é IIIC)"]);
  assert.deepEqual(de(destacar("Diretriz de 2018 manda"), "numero"), []);
});

test("título curto antes dos dois-pontos e veredito das pegadinhas", () => {
  assert.deepEqual(separarTitulo("Hemotórax maciço: ≥ 1.500 mL"), { titulo: "Hemotórax maciço", corpo: "≥ 1.500 mL" });
  assert.equal(separarTitulo("Sem dois pontos aqui").titulo, null);
  assert.deepEqual(separarVeredito("Metilprednisolona no trauma raquimedular: não se usa"), {
    enunciado: "Metilprednisolona no trauma raquimedular",
    veredito: "não se usa",
  });
  assert.equal(separarVeredito("Mandar o instável para a tomografia").veredito, null);
});

test("unidades extras e correção com 'não'", () => {
  assert.deepEqual(de(destacar("sintomas há mais de 72 horas; febre > 38 °C"), "numero"), ["72 horas", "> 38 °C"]);
  assert.deepEqual(de(destacar("Ângulo alfa agudo = hipocoagulável (não hipercoagulável)"), "correcao"), ["(não hipercoagulável)"]);
});
