// Tentativas terapêuticas antidepressivas: dose, tempo e resposta.

import {
  CLASSES_ANTIDEPRESSIVAS,
  FARMACOS,
  MESES_MINIMOS_TENTATIVA,
  type ClasseMedicacao,
} from "./catalogos.ts";
import type { Medicacao, PacientePsiquiatria } from "./tipos.ts";
import { normalizar } from "./util.ts";

/**
 * Identifica o fármaco pelo nome digitado. Vence a chave mais longa contida
 * no texto, para "escitalopram" não virar "citalopram" e "divalproato" não
 * virar "valproato".
 */
export function identificarFarmaco(nome: string) {
  const n = normalizar(nome);
  if (!n) return null;
  let melhor: string | null = null;
  for (const chave of Object.keys(FARMACOS)) {
    if (n.includes(chave) && (!melhor || chave.length > melhor.length)) melhor = chave;
  }
  if (!melhor) return null;
  const { classe, doseMinima } = FARMACOS[melhor];
  return { chave: melhor, classe, doseMinima };
}

/**
 * Dose diária em mg a partir do texto livre. Entende "10 mg/dia",
 * "2x 50 mg", "50 mg 2x/dia" e "50mg de 12/12h". Sem número, devolve null.
 */
export function doseEmMg(texto: string): number | null {
  const s = String(texto || "").toLowerCase().replace(/,/g, ".");
  const num = "(\\d+(?:\\.\\d+)?)";
  const antes = s.match(new RegExp(`(\\d+)\\s*x\\s*(?:de\\s*)?${num}\\s*mg`));
  if (antes) return Number(antes[1]) * Number(antes[2]);
  const mg = s.match(new RegExp(`${num}\\s*mg`));
  if (mg) {
    const base = Number(mg[1]);
    const depois = s.slice((mg.index ?? 0) + mg[0].length);
    const vezes = depois.match(/(\d+)\s*x/);
    if (vezes) return base * Number(vezes[1]);
    const intervalo = depois.match(/(\d+)\s*\/\s*(\d+)\s*h/);
    if (intervalo && Number(intervalo[2]) > 0) return base * Math.round(24 / Number(intervalo[2]));
    return base;
  }
  const solto = s.match(new RegExp(`^\\s*${num}`));
  return solto ? Number(solto[1]) : null;
}

export function ehAntidepressivo(classe: ClasseMedicacao) {
  return CLASSES_ANTIDEPRESSIVAS.includes(classe);
}

export type AdequacaoTentativa = {
  duracaoMeses: number;
  duracaoAdequada: boolean;
  /** null quando não há dose de referência ou a dose não pôde ser lida. */
  doseAdequada: boolean | null;
  doseMinima: number | null;
  adequada: boolean;
};

/**
 * Tentativa adequada: dose mínima eficaz de referência por pelo menos
 * MESES_MINIMOS_TENTATIVA meses. Só se aplica a antidepressivos.
 */
export function adequacaoTentativa(
  medicacao: Medicacao,
  paciente: Pick<PacientePsiquiatria, "atual">
): AdequacaoTentativa | null {
  if (!ehAntidepressivo(medicacao.classe)) return null;
  const farmaco = identificarFarmaco(medicacao.nome);
  const dose = doseEmMg(medicacao.dose);
  const duracaoMeses = (medicacao.fim ?? paciente.atual) - medicacao.inicio;
  const doseMinima = farmaco && farmaco.doseMinima ? farmaco.doseMinima : null;
  const doseAdequada = doseMinima != null && dose != null ? dose >= doseMinima : null;
  const duracaoAdequada = duracaoMeses >= MESES_MINIMOS_TENTATIVA;
  return {
    duracaoMeses,
    duracaoAdequada,
    doseAdequada,
    doseMinima,
    adequada: duracaoAdequada && doseAdequada === true,
  };
}

/**
 * Falhas terapêuticas: tentativas adequadas sem resposta, ou com resposta
 * parcial já encerradas. Duas ou mais configuram critério de resistência.
 */
export function falhasTerapeuticas(paciente: PacientePsiquiatria) {
  return paciente.meds.filter((m) => {
    const a = adequacaoTentativa(m, paciente);
    return !!a && a.adequada && (m.resposta === "sem" || (m.resposta === "parcial" && m.fim != null));
  });
}

/** Encerradas sem tentativa adequada (e não por intolerância ou boa resposta). */
export function tentativasInadequadas(paciente: PacientePsiquiatria) {
  return paciente.meds.filter((m) => {
    const a = adequacaoTentativa(m, paciente);
    return !!a && m.fim != null && !a.adequada && m.resposta !== "intolerancia" && m.resposta !== "boa";
  });
}

export function medicacoesAtivas(paciente: PacientePsiquiatria) {
  return paciente.meds.filter((m) => m.fim == null);
}

export function emUsoNoMes(paciente: PacientePsiquiatria, mes: number) {
  return paciente.meds.filter((m) => m.inicio <= mes && (m.fim == null || m.fim >= mes));
}
