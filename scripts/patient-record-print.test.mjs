import assert from "node:assert/strict";
import test from "node:test";

const { buildPatientRecordHtml } = await import("../src/lib/patient-record-print.ts");

const base = {
  mode: "complete",
  emittedAt: "29/10/2026 10:00",
  patient: { nome: 'Ana <script>alert(1)</script> "X"', riscos: [], queixa: "Dor torácica" },
  consultations: [],
  problems: [],
  notes: [],
  exams: [],
  followups: [],
  prescriptions: [],
};

test("prontuário em PDF: escapa texto do paciente e omite seções vazias", () => {
  const html = buildPatientRecordHtml(base);
  assert.ok(!html.includes("<script>alert"));
  assert.ok(html.includes("Dor torácica"));
  assert.ok(!html.includes("Lista de problemas"));
  assert.ok(!html.includes(">Exames<"));
  assert.match(html, /counter\(page\)/);
});

test("resumo em PDF: limita consultas e não traz exames", () => {
  const consultations = Array.from({ length: 5 }, (_, index) => ({ date: `0${index + 1}/10/2026`, queixa: `Consulta ${index + 1}` }));
  const html = buildPatientRecordHtml({
    ...base,
    mode: "summary",
    consultations,
    exams: [{ nome: "ECG", status: "recebido" }],
  });
  assert.ok(html.includes("Consulta 3"));
  assert.ok(!html.includes("Consulta 4"));
  assert.ok(!html.includes("ECG"));
});
