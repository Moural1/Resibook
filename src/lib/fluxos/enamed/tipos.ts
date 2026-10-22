import type { Algoritmo, Quadro } from "../tipos.ts";

/* Dossiê ENAMED: segunda coleção dos Fluxogramas, organizada por blocos
   (tema-chave, normativo, apostas, travas…) em vez de temas. Textos que
   começam com "⚠" ainda não foram reconferidos e recebem o selo "A confirmar". */

export type TipoBlocoDossie =
  | "tema"
  | "algoritmos"
  | "contrastes"
  | "numeros"
  | "normativo"
  | "apostas"
  | "pontos-cegos"
  | "travas"
  | "banca";

export type ErroComum = { titulo: string; texto: string; trava?: string };

export type PadraoBanca = {
  numero: string;
  titulo: string;
  frequencia: string;
  mecanismos: string[];
  antidoto: string;
  exemplos: { tema: string; armadilha: string }[];
};

export type ElementoDossie =
  | { tipo: "erros"; itens: ErroComum[] }
  | { tipo: "quadro"; quadro: Quadro }
  | { tipo: "algoritmo"; algoritmo: Algoritmo }
  | { tipo: "padrao"; padrao: PadraoBanca };

export type BlocoDossie = {
  id: string;
  tipo: TipoBlocoDossie;
  titulo: string;
  resumo?: string;
  elementos: ElementoDossie[];
};

export type AreaDossie = { id: string; nome: string; blocos: BlocoDossie[] };
