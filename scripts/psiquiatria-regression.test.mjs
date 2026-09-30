import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { REGRAS_SEM_REFERENCIA_ESPECIFICA, alertas } from "../src/lib/psiquiatria/alertas.ts";
import { REFERENCIAS } from "../src/lib/psiquiatria/catalogos.ts";
import { nivelCssrs } from "../src/lib/psiquiatria/cssrs.ts";
import {
  gravidadeGad7,
  gravidadePhq9,
  gravidadeYmrs,
  rastreioMdqPositivo,
  totalEscala,
} from "../src/lib/psiquiatria/escalas.ts";
import { pacienteExemplo } from "../src/lib/psiquiatria/exemplo.ts";
import {
  adequacaoTentativa,
  doseEmMg,
  falhasTerapeuticas,
  identificarFarmaco,
  tentativasInadequadas,
} from "../src/lib/psiquiatria/farmacologia.ts";
import { formulacaoAutomatica, pioraApos } from "../src/lib/psiquiatria/formulacao.ts";
import { monitorizacao } from "../src/lib/psiquiatria/monitorizacao.ts";
import {
  codigoValido,
  importarPaciente,
  proximoCodigo,
  textosLivres,
  verificarTextoLivre,
} from "../src/lib/psiquiatria/privacidade.ts";
import {
  humorSugerido,
  novoRascunho,
  sugestoesPlano,
  textoEvolucao,
  textoPlanoSeguranca,
} from "../src/lib/psiquiatria/textos.ts";
import { novoPaciente } from "../src/lib/psiquiatria/tipos.ts";

/* ---------- utilitários de cenário ---------- */

let seq = 0;
const uid = () => `t${++seq}`;

/** Paciente mínimo, com um vínculo forte para não disparar o alerta de rede. */
function base(extra = {}) {
  return {
    ...novoPaciente({ id: "p", code: "PAC-900", faixa: "25–34", sexo: "F", hip: "" }),
    eco: [{ id: uid(), nome: "Mãe", v: "forte" }],
    ...extra,
  };
}
const med = (nome, classe, dose, inicio, fim = null, resposta = "aguardando") => ({
  id: uid(), nome, classe, dose, inicio, fim, resposta, motivo: "",
});
const phq = (mes, itens) => ({ id: uid(), tipo: "PHQ-9", mes, itens, total: totalEscala("PHQ-9", itens) });
const phqTotal = (mes, total, item9 = 0) => {
  const itens = [0, 0, 0, 0, 0, 0, 0, 0, item9];
  let resto = total - item9;
  for (let i = 0; i < 8 && resto > 0; i++) {
    itens[i] = Math.min(3, resto);
    resto -= itens[i];
  }
  return phq(mes, itens);
};
const escala = (tipo, mes, itens) => ({ id: uid(), tipo, mes, itens, total: totalEscala(tipo, itens) });
const cssrs = (mes, nivel) => ({ id: uid(), mes, nivel, obs: "", r: { q1: true, q2: false, q3: false, q4: false, q5: false, q6: false, q6r: false } });
const familiar = (rel, conds = [], rela = "neutra", morto = false) => ({ id: uid(), rel, conds, rela, morto });
const exame = (nome, mes, valor) => ({ id: uid(), nome, mes, valor });
const plano = (mes, extra = {}) => ({ mes, motivo: "", alerta: [], internas: [], distracao: [], ajuda: [], profissionais: [], meios: [], ...extra });
const regras = (p) => alertas(p).map((a) => a.regra);
const alertaDa = (p, regra) => alertas(p).find((a) => a.regra === regra);

/* ---------- C-SSRS ---------- */

test("C-SSRS: nível de risco pela triagem", () => {
  const r = (x = {}) => ({ q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q6r: false, ...x });
  assert.equal(nivelCssrs(r()), "nenhum");
  assert.equal(nivelCssrs(r({ q1: true })), "baixo");
  assert.equal(nivelCssrs(r({ q2: true })), "baixo");
  assert.equal(nivelCssrs(r({ q2: true, q3: true })), "moderado");
  assert.equal(nivelCssrs(r({ q6: true })), "moderado", "comportamento há mais de 3 meses");
  assert.equal(nivelCssrs(r({ q2: true, q4: true })), "alto");
  assert.equal(nivelCssrs(r({ q2: true, q5: true })), "alto");
  assert.equal(nivelCssrs(r({ q6: true, q6r: true })), "alto");
});

test("C-SSRS: perguntas condicionais sem a pergunta-mãe não contam", () => {
  const r = { q1: false, q2: false, q3: true, q4: true, q5: true, q6: false, q6r: true };
  assert.equal(nivelCssrs(r), "nenhum");
});

/* ---------- escalas ---------- */

test("PHQ-9: pontos de corte de gravidade", () => {
  assert.deepEqual([4, 5, 9, 10, 14, 15, 19, 20].map(gravidadePhq9), [
    "mínima", "leve", "leve", "moderada", "moderada", "moderadamente grave", "moderadamente grave", "grave",
  ]);
});

test("GAD-7: pontos de corte de gravidade", () => {
  assert.deepEqual([4, 5, 9, 10, 14, 15].map(gravidadeGad7), ["mínima", "leve", "leve", "moderada", "moderada", "grave"]);
});

test("YMRS: pontos de corte de gravidade", () => {
  assert.deepEqual([11, 12, 19, 20, 25, 26].map(gravidadeYmrs), [
    "sem mania significativa", "sintomas leves", "sintomas leves", "moderada", "moderada", "grave",
  ]);
});

test("MDQ: positivo exige 7 sintomas, mesmo período e prejuízo moderado ou sério", () => {
  const sete = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
  assert.equal(rastreioMdqPositivo([...sete, 1, 2]), true);
  assert.equal(rastreioMdqPositivo([...sete, 1, 3]), true);
  assert.equal(rastreioMdqPositivo([1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3]), false, "só 6 sintomas");
  assert.equal(rastreioMdqPositivo([...sete, 0, 3]), false, "não no mesmo período");
  assert.equal(rastreioMdqPositivo([...sete, 1, 1]), false, "prejuízo pequeno");
  assert.equal(totalEscala("MDQ", [...sete, 1, 3]), 7, "total conta só os 13 sintomas");
});

/* ---------- farmacologia ---------- */

test("fármaco: vence o nome mais longo contido no texto", () => {
  assert.equal(identificarFarmaco("Escitalopram 10 mg").chave, "escitalopram");
  assert.equal(identificarFarmaco("citalopram").chave, "citalopram");
  assert.equal(identificarFarmaco("Divalproato de sódio").chave, "divalproato");
  assert.equal(identificarFarmaco("Carbonato de Lítio").classe, "litio");
  assert.equal(identificarFarmaco("remédio desconhecido"), null);
});

test("dose: lê mg/dia, multiplicadores e intervalos", () => {
  assert.equal(doseEmMg("10 mg/dia"), 10);
  assert.equal(doseEmMg("2x 50 mg"), 100);
  assert.equal(doseEmMg("2 x de 25mg"), 50);
  assert.equal(doseEmMg("50 mg 2x/dia"), 100);
  assert.equal(doseEmMg("37,5 mg"), 37.5);
  assert.equal(doseEmMg("25 mg de 12/12h"), 50);
  assert.equal(doseEmMg("75"), 75);
  assert.equal(doseEmMg("conforme bula"), null);
});

test("tentativa adequada: dose mínima por pelo menos 2 meses", () => {
  const p = base({ atual: 3 });
  assert.equal(adequacaoTentativa(med("Sertralina", "antidepressivo", "50 mg", 0, 2), p).adequada, true);
  assert.equal(adequacaoTentativa(med("Sertralina", "antidepressivo", "50 mg", 0, 1), p).adequada, false, "tempo curto");
  const baixa = adequacaoTentativa(med("Sertralina", "antidepressivo", "25 mg", 0, 3), p);
  assert.equal(baixa.doseAdequada, false);
  assert.equal(baixa.adequada, false);
  assert.equal(adequacaoTentativa(med("Mirtazapina", "antidepressivo", "a critério", 0, 3), p).doseAdequada, null);
  assert.equal(adequacaoTentativa(med("Quetiapina", "antipsicotico", "100 mg", 0), p), null, "só antidepressivos");
  assert.equal(adequacaoTentativa(med("Escitalopram", "antidepressivo", "10 mg", 1), p).duracaoMeses, 2, "em uso conta até o mês atual");
});

test("falhas e tentativas inadequadas", () => {
  const p = base({
    atual: 8,
    meds: [
      med("Sertralina", "antidepressivo", "100 mg", 0, 3, "sem"),
      med("Escitalopram", "antidepressivo", "20 mg", 3, 6, "parcial"),
      med("Fluoxetina", "antidepressivo", "20 mg", 6, 7, "sem"),
      med("Paroxetina", "antidepressivo", "20 mg", 7, 8, "intolerancia"),
    ],
  });
  assert.deepEqual(falhasTerapeuticas(p).map((m) => m.nome), ["Sertralina", "Escitalopram"]);
  assert.deepEqual(tentativasInadequadas(p).map((m) => m.nome), ["Fluoxetina"], "intolerância não entra");
});

/* ---------- monitorização ---------- */

test("monitorização: pendente, próximo e em dia", () => {
  const litio = med("Carbonato de lítio", "litio", "600 mg", 0);
  const semRegistro = monitorizacao(base({ atual: 1, meds: [litio] })).find((x) => x.rotulo === "Litemia");
  assert.equal(semRegistro.status, "pendente");
  const proximo = monitorizacao(base({ atual: 2, meds: [litio], exames: [exame("Litemia", 0, 0.7)] })).find((x) => x.rotulo === "Litemia");
  assert.equal(proximo.previsto, 3);
  assert.equal(proximo.status, "proximo");
  const emDia = monitorizacao(base({ atual: 1, meds: [litio], exames: [exame("Litemia", 0, 0.7)] })).find((x) => x.rotulo === "Litemia");
  assert.equal(emDia.status, "ok");
  const vencido = monitorizacao(base({ atual: 3, meds: [litio], exames: [exame("Litemia", 0, 0.7)] })).find((x) => x.rotulo === "Litemia");
  assert.equal(vencido.status, "pendente");
});

test("monitorização: exame basal até 1 mês antes conta; menor intervalo vence", () => {
  const p = base({
    atual: 0,
    meds: [med("Clozapina", "clozapina", "100 mg", 0), med("Quetiapina", "antipsicotico", "50 mg", 0)],
    exames: [exame("Peso", -1, 70)],
  });
  const itens = monitorizacao(p);
  assert.equal(itens.find((x) => x.rotulo === "Hemograma").intervaloMeses, 1, "clozapina exige hemograma mensal");
  const peso = itens.find((x) => x.rotulo === "Peso");
  assert.equal(peso.ultimo, -1, "exame do mês anterior ao início conta como basal");
  assert.equal(peso.status, "ok");
  assert.equal(itens.filter((x) => x.rotulo === "Peso").length, 1, "sem duplicar exigências");
});

test("monitorização: glicemia de jejum ou HbA1c satisfazem a mesma exigência", () => {
  const p = base({ atual: 1, meds: [med("Olanzapina", "antipsicotico", "10 mg", 0)], exames: [exame("HbA1c", 0, 5.4)] });
  assert.equal(monitorizacao(p).find((x) => x.rotulo === "Glicemia ou HbA1c").status, "ok");
});

/* ---------- alertas: risco ---------- */

test("alerta: PHQ-9 item 9 positivo sem C-SSRS posterior", () => {
  const p = base({ atual: 1, escalas: [phqTotal(1, 12, 1)] });
  const a = alertaDa(p, "phq9-item9-sem-cssrs");
  assert.equal(a.nivel, "alto");
  assert.equal(a.acao, "risco");
  assert.ok(!regras({ ...p, cssrs: [cssrs(1, "baixo")] }).includes("phq9-item9-sem-cssrs"), "C-SSRS no mesmo mês resolve");
});

test("alerta: C-SSRS alto e moderado", () => {
  assert.equal(alertaDa(base({ cssrs: [cssrs(0, "alto")] }), "cssrs-alto").nivel, "alto");
  assert.equal(alertaDa(base({ cssrs: [cssrs(0, "moderado")] }), "cssrs-moderado").nivel, "atencao");
  const resolvido = base({ cssrs: [cssrs(0, "alto"), cssrs(2, "nenhum")] });
  assert.ok(!regras(resolvido).includes("cssrs-alto"), "vale o C-SSRS mais recente");
});

test("alerta: história familiar de suicídio ou tentativa", () => {
  const p = base({ geno: [familiar("avo_pat_m", ["sui"], "neutra", true)] });
  const a = alertaDa(p, "familia-suicidio");
  assert.match(a.texto, /avô paterno/);
  assert.equal(a.acao, "risco", "sem C-SSRS aplicado, sugere abrir o risco");
  assert.equal(alertaDa({ ...p, cssrs: [cssrs(0, "nenhum")] }, "familia-suicidio").acao, undefined);
});

test("alerta: sinais de risco sem plano e plano desatualizado", () => {
  assert.ok(regras(base({ cssrs: [cssrs(0, "baixo")] })).includes("risco-sem-plano"));
  assert.ok(!regras(base({ cssrs: [cssrs(0, "nenhum")] })).includes("risco-sem-plano"));
  const desatualizado = base({ atual: 3, cssrs: [cssrs(3, "baixo")], plano: plano(0) });
  assert.ok(regras(desatualizado).includes("plano-desatualizado"));
  assert.ok(!regras({ ...desatualizado, plano: plano(3) }).includes("plano-desatualizado"));
});

test("alerta: medicação de alta letalidade e restrição de meios", () => {
  const litio = med("Carbonato de lítio", "litio", "600 mg", 2);
  assert.ok(regras(base({ meds: [litio] })).includes("letalidade-sem-plano"));
  assert.ok(regras(base({ meds: [litio], plano: plano(3) })).includes("letalidade-sem-restricao"));
  const comRestricao = plano(1, { meios: ["Medicações guardadas por pessoa de confiança"] });
  assert.ok(regras(base({ meds: [litio], plano: comRestricao })).includes("letalidade-apos-plano"), "lítio iniciado depois do plano");
  assert.ok(!regras(base({ meds: [litio], plano: { ...comRestricao, mes: 2 } })).some((r) => r.startsWith("letalidade")));
});

/* ---------- alertas: espectro bipolar ---------- */

test("alerta: parente de 1º grau com TAB", () => {
  const p = base({ geno: [familiar("pai", ["tab"])] });
  assert.equal(alertaDa(p, "tab-familia").nivel, "atencao");
  const comAd = { ...p, meds: [med("Sertralina", "antidepressivo", "50 mg", 0)] };
  assert.equal(alertaDa(comAd, "tab-familia-antidepressivo").nivel, "alto");
  const comEstabilizador = { ...comAd, meds: [...comAd.meds, med("Lamotrigina", "lamotrigina", "100 mg", 0)] };
  assert.ok(regras(comEstabilizador).includes("tab-familia"));
  assert.ok(!regras(base({ geno: [familiar("tio_pat", ["tab"])] })).some((r) => r.startsWith("tab-")), "tio não é 1º grau");
});

test("alerta: YMRS a partir de 12", () => {
  const y12 = escala("YMRS", 1, [4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0]);
  const y11 = escala("YMRS", 1, [4, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(y12.total, 12);
  assert.ok(regras(base({ escalas: [y12] })).includes("ymrs-elevado"));
  assert.ok(!regras(base({ escalas: [y11] })).some((r) => r.startsWith("ymrs")));
  assert.equal(alertaDa(base({ escalas: [y12], meds: [med("Sertralina", "antidepressivo", "50 mg", 0)] }), "ymrs-antidepressivo").nivel, "alto");
});

test("alerta: MDQ positivo", () => {
  const mdq = escala("MDQ", 1, [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2]);
  assert.equal(alertaDa(base({ escalas: [mdq] }), "mdq-positivo").nivel, "atencao");
  assert.equal(alertaDa(base({ escalas: [mdq], meds: [med("Sertralina", "antidepressivo", "50 mg", 0)] }), "mdq-positivo").nivel, "alto");
});

/* ---------- alertas: família e rede ---------- */

test("alerta: psicose, substâncias e violência na família", () => {
  assert.ok(regras(base({ geno: [familiar("tio_mat", ["psi"])] })).includes("familia-psicose"));
  assert.equal(alertaDa(base({ geno: [familiar("irmao", ["spa"])] }), "familia-substancias").nivel, "info");
  assert.equal(alertaDa(base({ geno: [familiar("irmao", ["spa"]), familiar("pai", ["spa"])] }), "familia-substancias").nivel, "atencao");
  assert.ok(regras(base({ geno: [familiar("pai", ["vio"])] })).includes("familia-violencia"));
});

test("alerta: rede de apoio pelo ecomapa", () => {
  assert.ok(regras(base({ eco: [] })).includes("rede-nao-preenchida"));
  assert.ok(regras(base({ eco: [{ id: "e", nome: "Trabalho", v: "fraco" }] })).includes("rede-sem-vinculo-forte"));
  const conflito = base({ eco: [{ id: "a", nome: "Mãe", v: "forte" }, { id: "b", nome: "Ex", v: "conflituoso" }] });
  assert.ok(regras(conflito).includes("rede-conflituosa"), "metade conflituosa");
  assert.ok(!regras(base()).some((r) => r.startsWith("rede-")));
});

/* ---------- alertas: farmacologia ---------- */

test("alerta: critério de depressão resistente", () => {
  const p = base({
    atual: 6,
    meds: [med("Sertralina", "antidepressivo", "100 mg", 0, 3, "sem"), med("Escitalopram", "antidepressivo", "20 mg", 3, 6, "sem")],
  });
  assert.match(alertaDa(p, "depressao-resistente").texto, /2 antidepressivos/);
  assert.ok(!regras({ ...p, meds: p.meds.slice(0, 1) }).includes("depressao-resistente"));
});

test("alerta: tentativa inadequada e dose abaixo da mínima", () => {
  assert.ok(regras(base({ atual: 2, meds: [med("Sertralina", "antidepressivo", "50 mg", 0, 1, "sem")] })).includes("tentativa-inadequada"));
  const baixa = base({ atual: 1, meds: [med("Sertralina", "antidepressivo", "25 mg", 0)] });
  assert.match(alertaDa(baixa, "dose-abaixo-minima").texto, /50 mg\/dia/);
  assert.ok(!regras({ ...baixa, atual: 0 }).includes("dose-abaixo-minima"), "só depois de 1 mês");
});

test("alerta: adesão não boa e efeitos adversos da última consulta", () => {
  const consulta = (mes, adesao, efeitos = []) => ({ id: uid(), mes, resumo: "", combinado: "", adesao, efeitos });
  assert.match(alertaDa(base({ consultas: [consulta(1, "ruim")] }), "adesao-nao-boa").texto, /Adesão ruim no mês 1/);
  assert.ok(!regras(base({ consultas: [consulta(1, "ruim"), consulta(2, "boa")] })).includes("adesao-nao-boa"));
  assert.match(alertaDa(base({ consultas: [consulta(1, "boa", ["Tremor"])] }), "efeitos-adversos").texto, /tremor/);
});

test("alerta: resposta ao antidepressivo pelo PHQ-9", () => {
  const cenario = (final) =>
    base({ atual: 3, meds: [med("Sertralina", "antidepressivo", "50 mg", 0)], escalas: [phqTotal(0, 20), phqTotal(3, final)] });
  assert.ok(regras(cenario(4)).includes("phq9-remissao"));
  assert.ok(regras(cenario(10)).includes("phq9-resposta"), "queda de 50%");
  assert.ok(regras(cenario(15)).includes("phq9-resposta-parcial"), "queda de 25%");
  assert.ok(regras(cenario(16)).includes("phq9-sem-resposta"), "queda de 20%");
  const cedo = base({ atual: 1, meds: [med("Sertralina", "antidepressivo", "50 mg", 0)], escalas: [phqTotal(0, 20), phqTotal(1, 18)] });
  assert.ok(!regras(cedo).some((r) => r.startsWith("phq9-")), "antes de 2 meses não avalia");
});

/* ---------- alertas: exames ---------- */

test("alerta: faixas de litemia, só depois do início do lítio", () => {
  const litio = med("Carbonato de lítio", "litio", "900 mg", 2);
  const com = (valor, mes = 3) => base({ atual: 3, meds: [litio], exames: [exame("Litemia", mes, valor)] });
  assert.equal(alertaDa(com(1.6), "litemia-toxica").nivel, "alto");
  assert.equal(alertaDa(com(1.3), "litemia-alta").nivel, "atencao");
  assert.equal(alertaDa(com(0.5), "litemia-baixa").nivel, "info");
  assert.ok(!regras(com(0.8)).some((r) => r.startsWith("litemia")));
  assert.ok(!regras(com(1.6, 0)).some((r) => r.startsWith("litemia")), "litemia de antes do lítio não conta");
  assert.ok(!regras(base({ exames: [exame("Litemia", 0, 1.6)] })).some((r) => r.startsWith("litemia")), "sem lítio em uso");
});

test("alerta: TSH elevado em uso de lítio", () => {
  const litio = med("Carbonato de lítio", "litio", "900 mg", 0);
  assert.ok(regras(base({ meds: [litio], exames: [exame("TSH", 0, 6.2)] })).includes("tsh-litio"));
  assert.ok(!regras(base({ meds: [litio], exames: [exame("TSH", 0, 4.5)] })).includes("tsh-litio"));
});

test("alerta: ganho de peso de 7% ou mais", () => {
  assert.match(alertaDa(base({ exames: [exame("Peso", 0, 70), exame("Peso", 3, 75)] }), "ganho-peso").texto, /7%/);
  assert.ok(!regras(base({ exames: [exame("Peso", 0, 70), exame("Peso", 3, 74.8)] })).includes("ganho-peso"));
});

test("alerta: glicemia de jejum e HbA1c separadas", () => {
  assert.equal(alertaDa(base({ exames: [exame("Glicemia de jejum", 0, 100)] }), "glicemia-alterada").nivel, "info");
  assert.equal(alertaDa(base({ exames: [exame("Glicemia de jejum", 0, 126)] }), "glicemia-alterada").nivel, "atencao");
  assert.ok(!regras(base({ exames: [exame("Glicemia de jejum", 0, 99)] })).includes("glicemia-alterada"));
  assert.equal(alertaDa(base({ exames: [exame("HbA1c", 0, 5.7)] }), "hba1c-alterada").nivel, "info");
  assert.equal(alertaDa(base({ exames: [exame("HbA1c", 0, 6.5)] }), "hba1c-alterada").nivel, "atencao");
  assert.ok(!regras(base({ exames: [exame("HbA1c", 0, 5.6)] })).includes("hba1c-alterada"));
});

test("alerta: neutrófilos em uso de clozapina", () => {
  const cloza = med("Clozapina", "clozapina", "200 mg", 0);
  assert.equal(alertaDa(base({ meds: [cloza], exames: [exame("Hemograma", 0, 900)] }), "clozapina-neutrofilos").nivel, "alto");
  assert.equal(alertaDa(base({ meds: [cloza], exames: [exame("Hemograma", 0, 1400)] }), "clozapina-neutrofilos").nivel, "atencao");
  assert.ok(!regras(base({ meds: [cloza], exames: [exame("Hemograma", 0, 1500)] })).includes("clozapina-neutrofilos"));
});

test("alerta: exame de monitorização pendente", () => {
  const p = base({ atual: 1, meds: [med("Divalproato", "valproato", "500 mg", 0)] });
  const pendentes = alertas(p).filter((a) => a.regra === "exame-pendente").map((a) => a.texto);
  assert.equal(pendentes.length, 2);
  assert.ok(pendentes.every((t) => /sem registro desde o início/.test(t)));
});

/* ---------- invariantes de todos os alertas ---------- */

test("todo alerta mantém o por quê e a referência", () => {
  const cenarios = [
    pacienteExemplo(),
    base({ eco: [], geno: [familiar("pai", ["tab", "spa", "psi", "vio", "sui"]), familiar("mae", ["spa"])], cssrs: [cssrs(0, "alto")], escalas: [phqTotal(0, 20, 2)] }),
    base({ atual: 6, meds: [med("Clozapina", "clozapina", "100 mg", 0), med("Carbonato de lítio", "litio", "900 mg", 0)], exames: [exame("Hemograma", 5, 900), exame("Litemia", 5, 1.7), exame("TSH", 5, 9), exame("HbA1c", 5, 7), exame("Glicemia de jejum", 5, 130), exame("Peso", 0, 60), exame("Peso", 5, 70)] }),
  ];
  const semRef = new Set(REGRAS_SEM_REFERENCIA_ESPECIFICA);
  let total = 0;
  for (const p of cenarios) {
    for (const a of alertas(p)) {
      total++;
      assert.ok(a.porque.explicacao.trim().length > 20, `${a.regra} precisa explicar o porquê`);
      if (a.porque.referencia == null) assert.ok(semRef.has(a.regra), `${a.regra} precisa citar referência`);
      else assert.ok(a.porque.referencia in REFERENCIAS, `${a.regra} cita referência inexistente`);
    }
  }
  assert.ok(total >= 20, "cenários cobrem muitos alertas");
});

test("alertas vêm ordenados por prioridade", () => {
  const ordem = { alto: 0, atencao: 1, info: 2 };
  const niveis = alertas(base({ eco: [], cssrs: [cssrs(0, "alto")], geno: [familiar("irmao", ["spa"])] })).map((a) => ordem[a.nivel]);
  assert.deepEqual(niveis, [...niveis].sort((a, b) => a - b));
});

/* ---------- formulação ---------- */

test("formulação: evento só é precipitante no início ou se seguido de piora", () => {
  const p = base({
    atual: 6,
    eventos: [
      { id: "e1", mes: 1, desc: "Mudança de casa" },
      { id: "e2", mes: 3, desc: "Perda do emprego" },
      { id: "e3", mes: 5, desc: "Viagem" },
      { id: "e4", mes: -10, desc: "Luto" },
    ],
    humor: [{ id: "h1", ini: 3, fim: 3, v: -1 }, { id: "h2", ini: 4, fim: 4, v: -2 }],
  });
  assert.equal(pioraApos(p, 3), "depressão moderada");
  assert.equal(pioraApos(p, 5), null);
  const f = formulacaoAutomatica(p);
  assert.deepEqual(f.prec.map((x) => x.chave), ["ev_e1", "ev_e2"]);
  assert.deepEqual(f.pre.map((x) => x.chave), ["ev_e4"], "evento anterior ao seguimento é predisponente");
});

test("formulação: toda sugestão informa a origem", () => {
  const f = formulacaoAutomatica(pacienteExemplo());
  const itens = [...f.pre, ...f.prec, ...f.perp, ...f.prot];
  assert.ok(itens.length > 10);
  assert.ok(itens.every((x) => x.origem && x.chave));
});

/* ---------- textos e sugestões ---------- */

test("plano de segurança: cópia do paciente deixa nome e telefone em branco", () => {
  const texto = textoPlanoSeguranca(pacienteExemplo());
  assert.match(texto, /- Mãe\. Telefone: _+/);
  assert.match(texto, /CVV 188 \(24 horas, gratuito\)\n/, "serviço com número não pede telefone");
  assert.match(texto, /CVV 188 \(24 horas, gratuito\) ou SAMU 192/);
});

test("plano de segurança: sugere restrição de meios conforme a medicação", () => {
  const comLitio = base({ meds: [med("Carbonato de lítio", "litio", "600 mg", 0)], plano: plano(0) });
  assert.ok(sugestoesPlano(comLitio, "meios").includes("Receita com dispensação fracionada"));
  assert.ok(!sugestoesPlano(base({ plano: plano(0) }), "meios").includes("Receita com dispensação fracionada"));
  assert.deepEqual(sugestoesPlano(base({ plano: plano(0, { ajuda: ["Mãe"] }) }), "ajuda"), [], "não repete o que já está no plano");
});

test("humor sugerido pelas escalas do mês", () => {
  const p = base({ escalas: [phqTotal(2, 16), escala("YMRS", 3, [4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0])] });
  assert.equal(humorSugerido(p, 2), "-2");
  assert.equal(humorSugerido(p, 3), "2");
  assert.equal(humorSugerido(p, 4), null);
});

test("evolução: usa mês de seguimento e lista o que foi abordado", () => {
  const p = pacienteExemplo();
  const d = { ...novoRascunho(p), mes: 6, adesao: "parcial", efeitos: ["Tremor"], roteiro: { "Revisar litemia": true, "Não abordado": false } };
  const texto = textoEvolucao(p, d);
  assert.match(texto, /^Evolução psiquiátrica, mês 6 de seguimento/);
  assert.match(texto, /Em uso: Escitalopram 10 mg\/dia; Carbonato de lítio 600 mg\/dia\./);
  assert.match(texto, /PHQ-9 9 \(leve\)/);
  assert.match(texto, /- Revisar litemia/);
  assert.doesNotMatch(texto, /Não abordado/);
});

/* ---------- privacidade ---------- */

test("privacidade: código pseudonimizado", () => {
  assert.ok(codigoValido("PAC-001"));
  assert.ok(!codigoValido("Maria Silva"));
  assert.ok(!codigoValido("PAC-1"));
  assert.equal(proximoCodigo([]), "PAC-001");
  assert.equal(proximoCodigo(["PAC-001", "PAC-007"]), "PAC-008");
});

test("privacidade: detecta identificadores, datas reais e nomes em texto livre", () => {
  assert.deepEqual(verificarTextoLivre("CPF 123.456.789-09"), ["cpf"]);
  assert.ok(verificarTextoLivre("ligar em (11) 98888-7777").includes("phone"));
  assert.ok(verificarTextoLivre("internado em 12/03/2025").includes("data_real"));
  assert.ok(verificarTextoLivre("desde 2019 sem trabalhar").includes("data_real"));
  assert.ok(verificarTextoLivre("Conversa com a filha Maria Souza hoje").includes("possivel_nome"));
  for (const ok of ["Mãe", "CAPS de referência", "Casa da irmã", "Ambulatório / CAPS", "Humor deprimido há 4 meses", "Iniciar sertralina 50 mg"]) {
    assert.deepEqual(verificarTextoLivre(ok), [], `"${ok}" não é identificador`);
  }
});

test("privacidade: o paciente de exemplo não tem identificadores", () => {
  for (const { campo, texto } of textosLivres(pacienteExemplo())) {
    assert.deepEqual(verificarTextoLivre(texto), [], `${campo}: ${texto}`);
  }
});

test("importação: rejeita código fora do padrão e descarta campos desconhecidos", () => {
  assert.equal(importarPaciente({ code: "Maria" }), null);
  const bruto = { ...pacienteExemplo(), nome: "Fulana", cpf: "123", exames: [{ id: "x", nome: "Peso / IMC", mes: 0, valor: "70" }, { nome: "Glicemia / HbA1c", mes: 1, valor: 110 }, { nome: "Inventado", mes: 1, valor: 1 }] };
  const p = importarPaciente(bruto);
  assert.equal(p.code, "PAC-001");
  assert.equal("nome" in p, false);
  assert.equal("cpf" in p, false);
  assert.deepEqual(p.exames.map((e) => [e.nome, e.valor]), [["Peso", 70], ["Glicemia de jejum", 110]]);
});

test("importação: recalcula totais de escala e nível do C-SSRS", () => {
  const bruto = { ...pacienteExemplo(), escalas: [{ tipo: "PHQ-9", mes: 0, itens: [3, 3, 3, 3, 3, 3, 3, 3, 3], total: 1 }], cssrs: [{ mes: 0, r: { q6: true, q6r: true }, nivel: "nenhum" }] };
  const p = importarPaciente(bruto);
  assert.equal(p.escalas[0].total, 27);
  assert.equal(p.cssrs[0].nivel, "alto");
});

/* ---------- paridade com o protótipo ---------- */

test("paridade: mesmos alertas e formulação do protótipo para o paciente de exemplo", () => {
  const html = fs.readFileSync(new URL("../docs/prototipos/prototipo-psiquiatria.html", import.meta.url), "utf8");
  const trecho = (de, ate) => html.slice(html.indexOf(de), html.indexOf(ate));
  const js = [
    trecho("const KEY=", "/* ---------- desenhos"),
    trecho("function humorAt", "function lifeChart"),
    trecho("const QUAD=", "function formTxt"),
    ";this.__alerts=alerts;this.__demo=demo;this.__autoForm=autoForm;",
  ].join("\n");
  const ctx = { localStorage: { getItem: () => null, setItem() {} } };
  // Os valores vêm de outro contexto do vm: normaliza para comparar só o conteúdo.
  const copia = (v) => JSON.parse(JSON.stringify(v));
  vm.createContext(ctx);
  vm.runInContext(js, ctx);
  const demo = ctx.__demo("p1");
  assert.deepEqual(
    alertas(pacienteExemplo()).map((a) => `${a.nivel} ${a.texto}`),
    copia(ctx.__alerts(demo).map((a) => `${a.n} ${a.t}`))
  );
  const antigo = ctx.__autoForm(demo);
  const novo = formulacaoAutomatica(pacienteExemplo());
  for (const q of ["pre", "prec", "perp", "prot"]) {
    assert.deepEqual(novo[q].map((x) => x.texto), copia(antigo[q].map((x) => x.t)), `quadrante ${q}`);
  }
});

/* ---------- banco: proteções da migration ---------- */

test("migration: tabela pseudonimizada com RLS por usuário e sem acesso anônimo", () => {
  const sql = fs.readFileSync(new URL("../supabase/migrations/20261001090000_psiquiatria_longitudinal.sql", import.meta.url), "utf8");
  assert.match(sql, /alter table public\.psiq_patients enable row level security/);
  assert.match(sql, /check \(code ~ '\^PAC-\[0-9\]\{3,6\}\$'\)/);
  for (const acao of ["select", "insert", "update", "delete"]) {
    assert.match(sql, new RegExp(`create policy psiq_patients_own_${acao}[\\s\\S]*?user_id = \\(select auth\\.uid\\(\\)\\)`), `policy de ${acao} restrita ao dono`);
  }
  assert.match(sql, /revoke all on table public\.psiq_patients from anon/);
  for (const campo of ["nome", "cpf", "cns", "telefone", "email", "endereco", "data_nascimento"]) {
    assert.match(sql, new RegExp(`'${campo}'`), `rejeita o campo ${campo} no documento`);
  }
  assert.doesNotMatch(sql, /\b(drop|alter) table (?!if exists public\.psiq_patients|public\.psiq_patients)/i, "não mexe em outras tabelas");
});

test("rota /psiquiatria exige o plano Completo", () => {
  const proxy = fs.readFileSync(new URL("../src/proxy.ts", import.meta.url), "utf8");
  assert.match(proxy, /COMPLETE_ONLY_PATHS = \[[^\]]*"\/psiquiatria"/);
});
