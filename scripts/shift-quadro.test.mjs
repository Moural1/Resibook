import assert from "node:assert/strict";
import test from "node:test";

const Q = await import("../src/lib/shift/quadro.ts");

const vazio = { pa: "", fc: "", fr: "", temp: "", spo2: "", glicemia: "" };
const AGORA = Date.parse("2026-10-26T14:00:00Z");
const caso = (extra = {}) => ({
  complaint: "Febre",
  age: "",
  sex: "",
  severity: "A definir",
  vitals: { ...vazio },
  redFlags: "",
  notes: "",
  alerts: [],
  priorities: [],
  updatedAt: new Date(AGORA).toISOString(),
  ...extra,
});

function montar() {
  let quadro = Q.quadroVazio();
  const a = Q.adicionarPaciente(quadro, { leito: "Leito 10", caso: caso({ complaint: "Lombalgia", vitals: { ...vazio, pa: "120x80", fc: "80", fr: "16" } }) }, AGORA);
  quadro = a.quadro;
  const b = Q.adicionarPaciente(quadro, { leito: "Leito 2", caso: caso({ complaint: "Febre", age: "70 anos", vitals: { ...vazio, pa: "90x60", fc: "120", fr: "24", temp: "39,5", spo2: "93" }, consciencia: "confusao" }) }, AGORA);
  quadro = b.quadro;
  const c = Q.adicionarPaciente(quadro, { leito: "Leito 3", caso: caso({ complaint: "Cefaleia", vitals: { ...vazio, pa: "120x80", fc: "80", fr: "16" } }) }, AGORA);
  return { quadro: c.quadro, ids: { lombalgia: a.id, febre: b.id, cefaleia: c.id } };
}

test("adicionar vincula o caso ao quadro pelo leito", () => {
  const { quadro, ids } = montar();
  assert.equal(quadro.pacientes.length, 3);
  const febre = quadro.pacientes.find((p) => p.id === ids.febre);
  assert.equal(febre.caso.quadroId, ids.febre);
  assert.equal(febre.caso.leito, "Leito 2");
  assert.notEqual(ids.febre, ids.lombalgia);
});

test("prioridade vem só da escolha do médico: a definir primeiro, depois a mais grave", () => {
  let { quadro, ids } = montar();
  const febre = quadro.pacientes.find((p) => p.id === ids.febre);
  assert.equal(Q.prioridadePaciente(febre), null, "sinais vitais graves não definem prioridade sozinhos");
  quadro = Q.atualizarCaso(quadro, ids.lombalgia, { ...quadro.pacientes.find((p) => p.id === ids.lombalgia).caso, prioridadeManual: "verde" }, AGORA);
  quadro = Q.atualizarCaso(quadro, ids.cefaleia, { ...quadro.pacientes.find((p) => p.id === ids.cefaleia).caso, prioridadeManual: "amarelo" }, AGORA);
  assert.deepEqual(Q.ordenarPacientes(quadro.pacientes, AGORA).map((p) => p.caso.complaint), ["Febre", "Cefaleia", "Lombalgia"]);
});

test("ordena pelo mais grave e, no mesmo nível, pela reavaliação vencida", () => {
  let { quadro, ids } = montar();
  for (const [id, nivel] of [[ids.febre, "vermelho"], [ids.lombalgia, "verde"], [ids.cefaleia, "verde"]]) {
    quadro = Q.atualizarCaso(quadro, id, { ...quadro.pacientes.find((p) => p.id === id).caso, prioridadeManual: nivel }, AGORA);
  }
  quadro = Q.agendarReavaliacao(quadro, ids.cefaleia, 15, AGORA - 30 * 60_000); // venceu há 15 min
  quadro = Q.agendarReavaliacao(quadro, ids.lombalgia, 60, AGORA);
  const ordem = Q.ordenarPacientes(quadro.pacientes, AGORA).map((p) => p.caso.complaint);
  assert.deepEqual(ordem, ["Febre", "Cefaleia", "Lombalgia"]);
  const resumo = Q.resumoQuadro(quadro, AGORA);
  assert.equal(resumo.total, 3);
  assert.equal(resumo.atrasadas, 1);
  assert.equal(resumo.porPrioridade.vermelho, 1);
  assert.equal(resumo.porPrioridade.verde, 2);
});

test("status e texto do timer de reavaliação", () => {
  assert.deepEqual(Q.statusReavaliacao({ reavaliarEm: null }, AGORA), { estado: "sem" });
  const em = (min) => ({ reavaliarEm: new Date(AGORA + min * 60_000).toISOString() });
  assert.deepEqual(Q.statusReavaliacao(em(30), AGORA), { estado: "em-dia", minutos: 30 });
  assert.deepEqual(Q.statusReavaliacao(em(8), AGORA), { estado: "proxima", minutos: 8 });
  assert.deepEqual(Q.statusReavaliacao(em(-12), AGORA), { estado: "atrasada", minutos: 12 });
  assert.equal(Q.formatarMinutos(45), "45 min");
  assert.equal(Q.formatarMinutos(65), "1 h 05 min");
  assert.equal(Q.formatarMinutos(120), "2 h");
});

test("registrar reavaliação no caso cumpre o horário agendado", () => {
  let { quadro, ids } = montar();
  quadro = Q.agendarReavaliacao(quadro, ids.febre, 30, AGORA);
  const atual = quadro.pacientes.find((p) => p.id === ids.febre);
  quadro = Q.atualizarCaso(quadro, ids.febre, { ...atual.caso, notes: "colhidas culturas" }, AGORA + 1000);
  assert.ok(quadro.pacientes.find((p) => p.id === ids.febre).reavaliarEm, "editar o caso não limpa o horário");
  const reav = { vitals: vazio, symptomStatus: "Melhora parcial", treatmentResponse: "", decision: "Internação", notes: "", recordedAt: new Date(AGORA + 5000).toISOString() };
  quadro = Q.atualizarCaso(quadro, ids.febre, { ...atual.caso, reassessment: reav }, AGORA + 5000);
  const febre = quadro.pacientes.find((p) => p.id === ids.febre);
  assert.equal(febre.reavaliarEm, null);
  assert.equal(febre.caso.quadroId, ids.febre);
});

test("pendências: adicionar, marcar, remover e ignorar texto vazio", () => {
  let { quadro, ids } = montar();
  quadro = Q.adicionarPendencia(quadro, ids.febre, "  lactato 2ª amostra ", AGORA);
  quadro = Q.adicionarPendencia(quadro, ids.febre, "   ", AGORA);
  let febre = quadro.pacientes.find((p) => p.id === ids.febre);
  assert.equal(febre.pendencias.length, 1);
  assert.equal(febre.pendencias[0].texto, "lactato 2ª amostra");
  quadro = Q.alternarPendencia(quadro, ids.febre, febre.pendencias[0].id, AGORA);
  febre = quadro.pacientes.find((p) => p.id === ids.febre);
  assert.equal(febre.pendencias[0].feita, true);
  assert.equal(Q.resumoQuadro(quadro, AGORA).pendencias, 0);
  quadro = Q.removerPendencia(quadro, ids.febre, febre.pendencias[0].id, AGORA);
  assert.equal(quadro.pacientes.find((p) => p.id === ids.febre).pendencias.length, 0);
});

test("expira pacientes sem atualização há mais de 12 h", () => {
  let { quadro, ids } = montar();
  quadro = Q.agendarReavaliacao(quadro, ids.febre, 30, AGORA + 11 * 3600_000);
  const depois = Q.limparExpirados(quadro, AGORA + 13 * 3600_000);
  assert.deepEqual(depois.pacientes.map((p) => p.id), [ids.febre]);
  assert.equal(Q.limparExpirados(quadro, AGORA), quadro, "sem expirados devolve o mesmo objeto");
});

test("passagem SBAR de todos, do mais grave ao mais leve, com pendências e timer", () => {
  let { quadro, ids } = montar();
  for (const [id, nivel] of [[ids.febre, "vermelho"], [ids.lombalgia, "verde"], [ids.cefaleia, "verde"]]) {
    quadro = Q.atualizarCaso(quadro, id, { ...quadro.pacientes.find((p) => p.id === id).caso, prioridadeManual: nivel }, AGORA);
  }
  quadro = Q.adicionarPendencia(quadro, ids.febre, "hemoculturas", AGORA);
  quadro = Q.agendarReavaliacao(quadro, ids.febre, 30, AGORA);
  const texto = Q.textoPassagem(quadro, AGORA);
  assert.match(texto, /^PASSAGEM DE PLANTÃO - RESIBOOK \(3 pacientes\)/);
  const febre = texto.indexOf("1) Leito 2 · Febre · VERMELHO (Emergência)");
  assert.ok(febre > 0, texto);
  assert.ok(texto.indexOf("Leito 10") > febre && texto.indexOf("Leito 3") > febre);
  assert.ok(texto.indexOf("2) Leito 3") < texto.indexOf("3) Leito 10"), "empate desfeito pelo leito");
  assert.match(texto, /A: SV PA 90x60, FC 120, FR 24, TEMP 39,5, SPO2 93 \| NEWS2 14, qSOFA 3, IC 1,33/);
  assert.match(texto, /R: reavaliar às \d\d:\d\d \(em 30 min\) \| próximo passo: revisar sinais de alarme \| pendências: hemoculturas/);
  assert.match(Q.textoPassagem(Q.quadroVazio(), AGORA), /Nenhum paciente no quadro\./);
  assert.match(Q.textoPassagem(montar().quadro, AGORA), /1\) Leito 2 · Febre · prioridade a definir/);
});
