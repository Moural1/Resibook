import type { RascunhoConsulta } from "@/lib/psiquiatria/textos.ts";
import type { PacientePsiquiatria } from "@/lib/psiquiatria/tipos.ts";

export const ABAS = {
  resumo: "Resumo",
  consulta: "Consulta de hoje",
  risco: "Risco",
  tempo: "Linha do tempo",
  formulacao: "Formulação",
  medicacoes: "Medicações",
  escalas: "Escalas",
  genograma: "Genograma",
  ecomapa: "Ecomapa",
  historico: "Histórico e exames",
} as const;
export type Aba = keyof typeof ABAS;

export type PropsAba = {
  paciente: PacientePsiquiatria;
  /** Aplica uma alteração numa cópia do paciente e agenda o salvamento. */
  atualizar: (receita: (p: PacientePsiquiatria) => void, aviso?: string) => void;
  irPara: (aba: Aba) => void;
  rascunho: RascunhoConsulta | null;
  setRascunho: (r: RascunhoConsulta | null) => void;
  avisar: (mensagem: string) => void;
  /** Tipo de escala pré-selecionado ao abrir a aba Escalas. */
  escalaInicial?: string;
  abrirEscala?: (tipo: string) => void;
};

export function novoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

/** Mês padrão dos formulários: o da consulta em andamento, senão o atual. */
export function mesPadrao(p: PacientePsiquiatria, rascunho: RascunhoConsulta | null) {
  return rascunho ? Number(rascunho.mes) : p.atual;
}
