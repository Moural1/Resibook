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
  assert.deepEqual(parsePrescriptionSheet("Paciente: Maria\nAmoxicilina 500mg"), [
    { kind: "text", lines: ["Paciente: Maria"] },
    { kind: "item", number: "", title: "Amoxicilina 500mg", lines: [] },
  ]);
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

test("receituário: formato de guia com '1.', rótulos e dicas", () => {
  const blocks = parsePrescriptionSheet(
    "Terapia oral:\n1.Metronidazol 400 mg - 5 comprimidos\nTomar 5 comprimidos VO, dose única.\nBizus:\nEm caso de comprimido de 250 mg, a dose é de 8 comprimidos.\n2.Tinidazol 500 mg – 1 comprimido\nTomar 4 comprimidos VO, em dose única.\nBizu: os parceiros devem ser tratados.\nUso oral:\nHeparina 5.000 UI\n1.000 UI/h"
  );
  assert.deepEqual(blocks, [
    { kind: "label", text: "Terapia oral" },
    { kind: "item", number: "1", title: "Metronidazol 400 mg - 5 comprimidos", lines: ["Tomar 5 comprimidos VO, dose única."] },
    { kind: "note", lines: ["Em caso de comprimido de 250 mg, a dose é de 8 comprimidos."] },
    { kind: "item", number: "2", title: "Tinidazol 500 mg – 1 comprimido", lines: ["Tomar 4 comprimidos VO, em dose única."] },
    { kind: "note", lines: ["os parceiros devem ser tratados."] },
    { kind: "route", text: "Uso oral" },
    { kind: "item", number: "", title: "Heparina 5.000 UI", lines: ["1.000 UI/h"] },
  ]);
});

test("receituário: dica termina no medicamento, título sem dois-pontos e exemplo fecham o item", () => {
  const tsv = parsePrescriptionSheet(
    "Bizus:\nManobras vasovagais podem reverter o quadro.\nAdenosina (6 mg/2 mL) – 1 ampola (dose de 6 mg)\nDose inicial: 1 ampola em bolus."
  );
  assert.deepEqual(tsv, [
    { kind: "note", lines: ["Manobras vasovagais podem reverter o quadro."] },
    { kind: "item", number: "", title: "Adenosina (6 mg/2 mL) – 1 ampola (dose de 6 mg)", lines: ["Dose inicial: 1 ampola em bolus."] },
  ]);
  const paliativo = parsePrescriptionSheet(
    "4. Tramadol 50 mg\nTomar 1 comprimido VO se dor.\nExemplo: paciente com dor intensa refratária.\n1. Dieta livre.\nManejo da dispneia\nSe nunca usou opioide, iniciar morfina."
  );
  assert.deepEqual(paliativo.map((b) => b.kind), ["item", "text", "item", "label", "text"]);
  assert.equal(paliativo[3].text, "Manejo da dispneia");
  const flumazenil = parsePrescriptionSheet("Flumazenil\nApresentação\nAmpola de 0,5 mg/5 mL\nDoses\nDose teste (adulto): 0,3 mg EV.");
  assert.deepEqual(flumazenil.map((b) => b.kind), ["label", "label", "text", "label", "text"]);
  // Modelos do banco em caixa alta não mudam de estrutura.
  assert.deepEqual(parsePrescriptionSheet("DIPIRONA 500 MG\nREPOUSO"), [{ kind: "text", lines: ["DIPIRONA 500 MG", "REPOUSO"] }]);
});
