// Formulação de caso (4 Ps) montada a partir dos dados já registrados.

import {
  ADESAO,
  CONDICOES_FAMILIARES,
  PARENTESCOS,
  RELACOES_FAMILIARES,
  rotuloHumor,
  type CondicaoFamiliar,
} from "./catalogos.ts";
import { rotuloParentesco } from "./alertas.ts";
import { tentativasInadequadas } from "./farmacologia.ts";
import type { Mes, PacientePsiquiatria, QuadranteFormulacao } from "./tipos.ts";
import { humorNoMes, normalizar, porMes, ultimo, unicos } from "./util.ts";

export const QUADRANTES: Array<{ chave: QuadranteFormulacao; titulo: string; descricao: string }> = [
  { chave: "pre", titulo: "Predisponentes", descricao: "O que tornou o paciente vulnerável." },
  { chave: "prec", titulo: "Precipitantes", descricao: "O que desencadeou o quadro ou as pioras." },
  { chave: "perp", titulo: "Perpetuadores", descricao: "O que mantém o problema." },
  { chave: "prot", titulo: "Protetores", descricao: "Forças e recursos a favor do paciente." },
];

export type ItemFormulacao = { chave: string; texto: string; origem: string };

/**
 * Piora nos 2 meses seguintes a um mês: novo período de humor mais intenso
 * ou de polaridade diferente, ou alta de 5 pontos ou mais no PHQ-9.
 */
export function pioraApos(paciente: PacientePsiquiatria, mes: Mes): string | null {
  const antes = humorNoMes(paciente, mes);
  const novos = paciente.humor.filter((x) => x.ini > mes && x.ini <= mes + 2 && x.v !== 0).map((x) => x.v);
  if (
    novos.length &&
    (antes == null || Math.abs(novos[0]) > Math.abs(antes) || Math.sign(novos[0]) !== Math.sign(antes))
  ) {
    return rotuloHumor(novos[0]).toLowerCase();
  }
  const phq = porMes(paciente.escalas.filter((e) => e.tipo === "PHQ-9"));
  const anterior = [...phq].reverse().find((e) => e.mes <= mes);
  const seguinte = phq.find((e) => e.mes > mes && e.mes <= mes + 2);
  if (anterior && seguinte && seguinte.total - anterior.total >= 5) return "piora do PHQ-9";
  return null;
}

export function formulacaoAutomatica(paciente: PacientePsiquiatria): Record<QuadranteFormulacao, ItemFormulacao[]> {
  const r: Record<QuadranteFormulacao, ItemFormulacao[]> = { pre: [], prec: [], perp: [], prot: [] };
  const add = (q: QuadranteFormulacao, chave: string, texto: string, origem: string) =>
    r[q].push({ chave, texto, origem });

  for (const c of Object.keys(CONDICOES_FAMILIARES) as CondicaoFamiliar[]) {
    const familiares = paciente.geno.filter((g) => g.conds.includes(c));
    if (familiares.length) {
      add(
        "pre",
        `fam_${c}`,
        `História familiar de ${CONDICOES_FAMILIARES[c].rotulo.toLowerCase()} (${unicos(familiares.map(rotuloParentesco)).join(", ")})`,
        "genograma"
      );
    }
  }
  for (const x of paciente.humor.filter((x) => x.fim < 0 && x.v !== 0)) {
    add("pre", `hum_${x.id}`, `Episódio prévio de ${rotuloHumor(x.v).toLowerCase()} (mês ${x.ini} a ${x.fim})`, "life chart");
  }
  for (const e of paciente.eventos.filter((e) => e.mes < 0)) {
    add("pre", `ev_${e.id}`, `${e.desc} (mês ${e.mes})`, "registro de eventos");
  }
  for (const e of paciente.eventos.filter((e) => e.mes >= 0)) {
    const piora = pioraApos(paciente, e.mes);
    if (e.mes <= 1 || piora) {
      add("prec", `ev_${e.id}`, `${e.desc} (mês ${e.mes})${piora ? `, seguido de ${piora}` : ""}`, "registro de eventos");
    }
  }

  for (const e of paciente.eco.filter((e) => e.v === "conflituoso")) {
    add("perp", `eco_${e.id}`, `Vínculo conflituoso: ${e.nome}`, "ecomapa");
  }
  for (const g of paciente.geno.filter((g) => g.rela === "conflituosa" || g.rela === "rompida")) {
    add("perp", `gen_${g.id}`, `Relação ${RELACOES_FAMILIARES[g.rela].toLowerCase()} com ${rotuloParentesco(g)}`, "genograma");
  }
  if (paciente.eco.length && !paciente.eco.some((e) => e.v === "forte")) {
    add("perp", "eco_semforte", "Rede de apoio sem vínculos fortes", "ecomapa");
  }
  const ultimaAdesao = ultimo(porMes(paciente.consultas).filter((c) => c.adesao));
  if (ultimaAdesao?.adesao && ultimaAdesao.adesao !== "boa") {
    add("perp", "adesao", `Adesão ${ADESAO[ultimaAdesao.adesao].toLowerCase()} (mês ${ultimaAdesao.mes})`, "histórico de consultas");
  }
  const inadequadas = tentativasInadequadas(paciente);
  if (inadequadas.length) {
    add(
      "perp",
      "inad",
      `Tentativas terapêuticas interrompidas antes do tempo: ${inadequadas.map((m) => m.nome).join(", ")}`,
      "histórico farmacológico"
    );
  }

  const nomesEco = paciente.eco.map((e) => normalizar(e.nome));
  for (const e of paciente.eco.filter((e) => e.v === "forte")) {
    add("prot", `eco_${e.id}`, `Vínculo forte: ${e.nome}`, "ecomapa");
  }
  for (const g of paciente.geno.filter((g) => g.rela === "proxima")) {
    if (!nomesEco.includes(normalizar(PARENTESCOS[g.rel].curto))) {
      add("prot", `gen_${g.id}`, `Relação próxima com ${rotuloParentesco(g)}`, "genograma");
    }
  }
  if (paciente.plano?.motivo) add("prot", "motivo", `Motivo para viver: ${paciente.plano.motivo}`, "plano de segurança");
  if (paciente.plano) add("prot", "plano", "Plano de segurança construído com o paciente", "plano de segurança");
  if (ultimaAdesao?.adesao === "boa") add("prot", "adesao", "Boa adesão ao tratamento", "histórico de consultas");

  return r;
}
