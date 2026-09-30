// Textos gerados para copiar: evolução, plano de segurança e formulação.
// Também as sugestões do plano e do humor, que dependem só dos dados.

import {
  ADESAO,
  CLASSES_ALTA_LETALIDADE,
  EXAME_ESTADO_MENTAL,
  SECOES_PLANO,
  SERVICOS_CRISE,
  rotuloHumor,
  type Adesao,
  type SecaoPlano,
} from "./catalogos.ts";
import { NIVEIS_CSSRS } from "./cssrs.ts";
import { resumoEscala } from "./escalas.ts";
import { emUsoNoMes, medicacoesAtivas } from "./farmacologia.ts";
import { QUADRANTES, formulacaoAutomatica } from "./formulacao.ts";
import type { Mes, PacientePsiquiatria } from "./tipos.ts";

export type RascunhoConsulta = {
  mes: Mes;
  relato: string;
  combinado: string;
  adesao: Adesao | "";
  efeitos: string[];
  efeitoOutro: string;
  eem: Record<string, string[]>;
  humor: string;
  roteiro: Record<string, boolean>;
  texto: string;
};

export function novoRascunho(paciente: PacientePsiquiatria): RascunhoConsulta {
  return {
    mes: paciente.atual + 1,
    relato: "",
    combinado: "",
    adesao: "",
    efeitos: [],
    efeitoOutro: "",
    eem: {},
    humor: "",
    roteiro: {},
    texto: "",
  };
}

/** Humor sugerido pelas escalas do mês (YMRS tem prioridade sobre PHQ-9). */
export function humorSugerido(paciente: PacientePsiquiatria, mes: Mes): string | null {
  const ph = paciente.escalas.filter((e) => e.tipo === "PHQ-9" && e.mes === mes).pop();
  const ym = paciente.escalas.filter((e) => e.tipo === "YMRS" && e.mes === mes).pop();
  if (!ph && !ym) return null;
  if (ym && ym.total >= 12) return ym.total >= 26 ? "3" : ym.total >= 20 ? "2" : "1";
  if (ph && ph.total >= 10) return ph.total >= 20 ? "-3" : ph.total >= 15 ? "-2" : "-1";
  return "0";
}

export function textoEvolucao(paciente: PacientePsiquiatria, d: RascunhoConsulta) {
  const m = Number(d.mes);
  const L = [`Evolução psiquiátrica, mês ${m} de seguimento`];
  if (paciente.hip) L.push(`Hipótese diagnóstica: ${paciente.hip}.`);
  if (d.relato) L.push("", `Relato: ${d.relato}`);
  const efeitos = [...d.efeitos, ...(d.efeitoOutro ? [d.efeitoOutro] : [])];
  if (d.adesao || efeitos.length) {
    L.push(
      `${d.adesao ? `Adesão ${ADESAO[d.adesao].toLowerCase()}. ` : ""}${efeitos.length ? `Efeitos adversos: ${efeitos.join(", ").toLowerCase()}.` : "Sem efeitos adversos relatados."}`
    );
  }
  const emUso = emUsoNoMes(paciente, m);
  L.push(`Em uso: ${emUso.length ? emUso.map((x) => `${x.nome} ${x.dose}`).join("; ") : "sem medicações"}.`);
  const escalas = [
    ...paciente.escalas.filter((e) => e.mes === m).map(resumoEscala),
    ...paciente.cssrs.filter((c) => c.mes === m).map((c) => `C-SSRS: ${NIVEIS_CSSRS[c.nivel].rotulo.toLowerCase()}`),
  ];
  if (escalas.length) L.push(`Escalas: ${escalas.join("; ")}.`);
  const eem = EXAME_ESTADO_MENTAL.filter(({ chave }) => d.eem[chave]?.length).map(
    ({ chave, rotulo }) => `${rotulo}: ${d.eem[chave].join(", ").toLowerCase()}`
  );
  if (eem.length) L.push("", `Exame do estado mental: ${eem.join(". ")}.`);
  if (d.humor !== "") L.push(`Humor no período: ${rotuloHumor(Number(d.humor)).toLowerCase()}.`);
  const abordados = Object.entries(d.roteiro)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (abordados.length) L.push("", "Pontos abordados:", ...abordados.map((x) => `- ${x}`));
  if (d.combinado) L.push("", `Conduta: ${d.combinado}`);
  return L.join("\n");
}

/** Sugestões para cada seção do plano de segurança, sem repetir o que já está lá. */
export function sugestoesPlano(paciente: PacientePsiquiatria, secao: SecaoPlano): string[] {
  const vinculos = paciente.eco.filter((e) => e.v === "forte" || e.v === "moderado").map((e) => e.nome);
  const ativos = medicacoesAtivas(paciente);
  let s: string[] = [];
  if (secao === "distracao" || secao === "ajuda") s = vinculos;
  if (secao === "profissionais") s = [...SERVICOS_CRISE];
  if (secao === "meios") {
    if (ativos.some((m) => CLASSES_ALTA_LETALIDADE.includes(m.classe))) {
      s.push("Medicações guardadas por pessoa de confiança", "Receita com dispensação fracionada");
    } else if (ativos.length) {
      s.push("Medicações guardadas por pessoa de confiança");
    }
    s.push("Armas de fogo fora de casa", "Pesticidas e produtos tóxicos fora de alcance");
  }
  const atuais = paciente.plano?.[secao] ?? [];
  return s.filter((x) => !atuais.includes(x));
}

/** Cópia para o paciente: nomes e telefones ficam em branco para preencher à mão. */
export function textoPlanoSeguranca(paciente: PacientePsiquiatria) {
  const plano = paciente.plano;
  if (!plano) return "";
  const L = ["Meu plano de segurança", "Data: ____/____/______", ""];
  for (const secao of SECOES_PLANO) {
    L.push(secao.tituloPaciente);
    if (!plano[secao.chave].length) L.push("- ______________________________");
    for (const item of plano[secao.chave]) {
      const pedeTelefone = secao.chave === "ajuda" || (secao.chave === "profissionais" && !/\d/.test(item));
      L.push(`- ${item}${pedeTelefone ? ". Telefone: ____________________" : ""}`);
    }
    L.push("");
  }
  L.push(
    `O motivo mais importante para eu viver: ${plano.motivo || "______________________________"}`,
    "",
    "Em uma emergência: CVV 188 (24 horas, gratuito) ou SAMU 192."
  );
  return L.join("\n");
}

export function textoFormulacao(paciente: PacientePsiquiatria) {
  const auto = formulacaoAutomatica(paciente);
  const F = paciente.form;
  const L = [`Formulação de caso (4 Ps), ${paciente.code}, mês ${paciente.atual}`, ""];
  for (const { chave, titulo } of QUADRANTES) {
    L.push(`${titulo}:`);
    const itens = [...auto[chave].filter((x) => !F.off.includes(x.chave)).map((x) => x.texto), ...F[chave]];
    if (!itens.length) L.push("- não identificados");
    for (const item of itens) L.push(`- ${item}`);
    L.push("");
  }
  if (F.sintese) L.push(`Síntese: ${F.sintese}`);
  return L.join("\n");
}
