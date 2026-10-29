import assert from "node:assert/strict";
import test from "node:test";

const { parsePrescriptionSheet } = await import("../src/lib/prescription-sheet.ts");

test("receituário: via, itens numerados com posologia, alternativa e rótulo", () => {
  const blocks = parsePrescriptionSheet(
    "USO ORAL\n\n1) DIPIRONA 500 MG — 20 COMPRIMIDOS\nTOMAR 01 A 02 COMPRIMIDOS DE 06/06 HORAS SE DOR.\n\nOU\n\n1)PARACETAMOL 500 MG\nTOMAR 01 COMPRIMIDO.\n\nSE SEM CONTRAINDICAÇÃO:\n\nNÃO É PARA APENAS DAR RECEITA.\nREAVALIAR."
  );
  assert.deepEqual(blocks, [
    { kind: "route", text: "USO ORAL" },
    { kind: "item", number: "1", title: "DIPIRONA 500 MG — 20 COMPRIMIDOS", lines: ["TOMAR 01 A 02 COMPRIMIDOS DE 06/06 HORAS SE DOR."] },
    { kind: "or" },
    { kind: "item", number: "1", title: "PARACETAMOL 500 MG", lines: ["TOMAR 01 COMPRIMIDO."] },
    { kind: "label", text: "SE SEM CONTRAINDICAÇÃO" },
    { kind: "text", lines: ["NÃO É PARA APENAS DAR RECEITA.", "REAVALIAR."] },
  ]);
});

test("receituário: texto vazio não gera blocos e o conteúdo não é reescrito", () => {
  assert.deepEqual(parsePrescriptionSheet(""), []);
  assert.deepEqual(parsePrescriptionSheet(null), []);
  const [block] = parsePrescriptionSheet("Paciente: Maria\nAmoxicilina 500mg");
  assert.deepEqual(block, { kind: "text", lines: ["Paciente: Maria", "Amoxicilina 500mg"] });
});

const { readablePrescriptionLine, splitItemTitle } = await import("../src/lib/prescription-sheet.ts");

test("receituário: caixa normal na exibição, mantendo siglas e unidades", () => {
  assert.equal(readablePrescriptionLine("DIPIRONA 500 MG — 20 COMPRIMIDOS"), "Dipirona 500 mg — 20 comprimidos");
  assert.equal(readablePrescriptionLine("TOMAR 01 A 02 COMPRIMIDOS DE 06/06 HORAS SE DOR."), "Tomar 01 a 02 comprimidos de 06/06 horas se dor.");
  assert.equal(readablePrescriptionLine("SF 0,9% 30 ML/KG EM 30 MINUTOS. DEPOIS REAVALIAR"), "SF 0,9% 30 mL/kg em 30 minutos. Depois reavaliar");
  assert.equal(readablePrescriptionLine("METRONIDAZOL 250mg — 42 COMP"), "Metronidazol 250mg — 42 comp");
  assert.equal(readablePrescriptionLine("Amoxicilina 500 mg"), "Amoxicilina 500 mg");
});

test("receituário: nome e quantidade do item", () => {
  assert.deepEqual(splitItemTitle("Dipirona 500 mg — 20 comprimidos"), { name: "Dipirona 500 mg", quantity: "20 comprimidos" });
  assert.deepEqual(splitItemTitle("Sais de reidratação oral — SRO — 04 a 06 envelopes"), { name: "Sais de reidratação oral — SRO", quantity: "04 a 06 envelopes" });
  assert.deepEqual(splitItemTitle("Soro fisiológico 0,9% ou ringer lactato"), { name: "Soro fisiológico 0,9% ou ringer lactato", quantity: "" });
});
