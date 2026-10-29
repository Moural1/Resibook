import assert from "node:assert/strict";
import test from "node:test";

const { lerTriagem, lerPressao, lerIdade, lerNumero, maiorPrioridade } = await import("../src/lib/shift/triagem.ts");
const { QUEIXAS_SHIFT, SINAIS_GERAIS, sinaisDaQueixa, hrefFluxo, hrefCalculadora } = await import("../src/lib/shift/queixas.ts");
const { etapasDoCaso, proximaEtapa, valoresParaCalculadoras, leituraDoCaso, gravidadeLegada } = await import("../src/lib/shift/caso.ts");
const { QUICK_COMPLAINTS } = await import("../src/lib/clinical-quick-complaints.ts");
const { clinicalCalculators } = await import("../src/lib/clinical-calculators.ts");
const { encontrarTema } = await import("../src/lib/fluxos/index.ts");
const { encontrarBloco } = await import("../src/lib/fluxos/enamed/index.ts");

const vazio = { pa: "", fc: "", fr: "", temp: "", spo2: "", glicemia: "" };
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
  updatedAt: new Date().toISOString(),
  ...extra,
});

test("leitura de pressão, idade e números em formatos do plantão", () => {
  assert.deepEqual(lerPressao("140x90"), { sistolica: 140, diastolica: 90 });
  assert.deepEqual(lerPressao("120/80"), { sistolica: 120, diastolica: 80 });
  assert.deepEqual(lerPressao("14x9"), { sistolica: 140, diastolica: 90 });
  assert.deepEqual(lerPressao("90"), { sistolica: 90, diastolica: null });
  assert.equal(lerPressao(""), null);
  assert.equal(lerIdade("62 anos"), 62);
  assert.equal(lerIdade("62"), 62);
  assert.equal(lerIdade("1 ano e 6 meses"), 1.5);
  assert.ok(Math.abs(lerIdade("8 meses") - 8 / 12) < 1e-9);
  assert.equal(lerIdade(""), null);
  assert.equal(lerNumero("38,5"), 38.5);
  assert.equal(lerNumero("110 bpm"), 110);
  assert.equal(lerNumero("abc"), null);
});

test("a leitura nunca define prioridade; dados normais não geram alertas", () => {
  assert.equal("prioridade" in lerTriagem({ idade: "", vitals: vazio }), false);
  const normal = lerTriagem({ idade: "40 anos", vitals: { pa: "120x80", fc: "78", fr: "16", temp: "36,7", spo2: "98", glicemia: "95" }, consciencia: "alerta" });
  assert.equal("prioridade" in normal, false);
  assert.deepEqual(normal.alertas, []);
  assert.equal(normal.news2.pontos, 0);
  assert.equal(normal.news2.completo, true);
});

test("adulto séptico: qSOFA 3, NEWS2 alto, índice de choque ≥ 1 e alerta crítico", () => {
  const leitura = lerTriagem({
    idade: "70 anos",
    vitals: { pa: "90x60", fc: "120", fr: "24", temp: "39,5", spo2: "93", glicemia: "" },
    consciencia: "confusao",
  });
  assert.equal(leitura.qsofa.pontos, 3);
  assert.equal(leitura.news2.pontos, 14);
  assert.equal(leitura.news2.faixa, "alto");
  assert.equal(leitura.indiceChoque, 1.33);
  assert.equal(leitura.alertas[0].nivel, "vermelho");
  assert.ok(leitura.alertas.some((a) => a.id === "qsofa"));
});

test("criança: sem escores de adulto, taquipneia pela OMS e febre no lactente < 3 meses", () => {
  const lactente = lerTriagem({ idade: "8 meses", vitals: { ...vazio, fc: "160", fr: "55" } });
  assert.equal(lactente.faixaEtaria, "pediatrico");
  assert.equal(lactente.news2, null);
  assert.equal(lactente.qsofa, null);
  assert.equal(lactente.indiceChoque, null);
  assert.ok(lactente.alertas.some((a) => a.id === "fr" && a.nivel === "amarelo"));
  assert.ok(!lactente.alertas.some((a) => a.id === "fc"), "FC 160 é normal aos 8 meses");
  const neonato = lerTriagem({ idade: "2 meses", vitals: { ...vazio, temp: "38,2" } });
  assert.ok(neonato.alertas.some((a) => a.id === "temp" && a.nivel === "laranja"));
});

test("hipoglicemia, hipoxemia e sinal de alarme geram alertas com gravidade", () => {
  assert.equal(lerTriagem({ idade: "30", vitals: { ...vazio, glicemia: "50" } }).alertas[0].nivel, "vermelho");
  assert.equal(lerTriagem({ idade: "30", vitals: { ...vazio, spo2: "88" } }).alertas[0].nivel, "laranja");
  const comAlarme = lerTriagem({ idade: "30", vitals: vazio, sinaisAlarme: [{ id: "x", texto: "Petéquias", nivel: "vermelho" }] });
  assert.equal(comAlarme.alertas[0].origem, "sinal-alarme");
  assert.equal(maiorPrioridade(["verde", "amarelo", null]), "amarelo");
});

test("toda queixa rápida tem sinais de alarme e kit; ids únicos", () => {
  for (const queixa of QUICK_COMPLAINTS) assert.ok(QUEIXAS_SHIFT[queixa.title], `sem kit para ${queixa.title}`);
  const ids = [...Object.values(QUEIXAS_SHIFT).flatMap((q) => q.sinais), ...SINAIS_GERAIS].map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(sinaisDaQueixa("queixa livre qualquer"), SINAIS_GERAIS);
  for (const [titulo, queixa] of Object.entries(QUEIXAS_SHIFT)) {
    assert.ok(queixa.sinais.length >= 3, `${titulo}: poucos sinais`);
    assert.ok(queixa.busca.conduta && queixa.busca.prescricao && queixa.busca.cid);
  }
});

test("o kit só aponta para fluxogramas e calculadoras que existem", () => {
  for (const [titulo, queixa] of Object.entries(QUEIXAS_SHIFT)) {
    for (const fluxo of queixa.fluxos) {
      const existe = fluxo.colecao === "temas" ? encontrarTema(fluxo.area, fluxo.tema) : encontrarBloco(fluxo.area, fluxo.bloco);
      assert.ok(existe, `${titulo}: fluxo inexistente ${hrefFluxo(fluxo)}`);
    }
    for (const calc of queixa.calculadoras) {
      const definida = clinicalCalculators.find((c) => c.id === calc.id);
      assert.ok(definida, `${titulo}: calculadora ${calc.id}`);
      for (const campo of calc.campos) assert.ok(definida.fields.some((f) => f.id === campo), `${calc.id}: campo ${campo}`);
    }
  }
});

test("calculadora recebe os valores do caso pela URL", () => {
  const c = caso({ age: "70 anos", vitals: { ...vazio, pa: "90x60", fc: "120", fr: "24", temp: "39,5", spo2: "93" }, consciencia: "confusao" });
  const valores = valoresParaCalculadoras(c, leituraDoCaso(c));
  assert.equal(valores.sbp, 90);
  assert.equal(valores.consciousness, "confusion");
  assert.equal(valores.altered, true);
  assert.equal(valores.oxygen, false);
  const href = hrefCalculadora(QUEIXAS_SHIFT.Febre.calculadoras[0], valores);
  assert.equal(href, "/calculadoras?calculadora=qsofa&rr=24&sbp=90&altered=true");
});

test("etapas do caso avançam e apontam o próximo passo", () => {
  let c = caso();
  assert.equal(proximaEtapa(etapasDoCaso(c)).id, "triagem");
  c = caso({ vitals: { ...vazio, pa: "120x80", fc: "80", fr: "16" } });
  assert.equal(proximaEtapa(etapasDoCaso(c)).id, "alarmes");
  c = { ...c, alarmesRevisados: true, condutaDefinida: true };
  assert.equal(proximaEtapa(etapasDoCaso(c)).id, "reavaliacao");
  c = { ...c, reassessment: { vitals: vazio, symptomStatus: "", treatmentResponse: "", decision: "Alta com orientações", notes: "", recordedAt: new Date().toISOString() } };
  const etapas = etapasDoCaso(c);
  assert.equal(proximaEtapa(etapas), null);
  assert.equal(etapas.at(-1).href, "/plantao/alta-segura?q=Febre");
  assert.equal(gravidadeLegada("laranja"), "Urgência");
  assert.equal(gravidadeLegada(null), "A definir");
});

test("calculadora só aceita da URL valores válidos para os seus campos", async () => {
  const { calculatorValuesFromParams } = await import("../src/lib/clinical-calculators.ts");
  const news2 = clinicalCalculators.find((c) => c.id === "news2");
  const params = new URLSearchParams("rr=24&spo2=abc&oxygen=true&consciousness=confusion&sbp=90&pulse=&extra=1");
  assert.deepEqual(calculatorValuesFromParams(news2, params), { rr: "24", oxygen: true, consciousness: "confusion", sbp: "90" });
  assert.deepEqual(calculatorValuesFromParams(news2, new URLSearchParams("consciousness=xyz")), {});
});
