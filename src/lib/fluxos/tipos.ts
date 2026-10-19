/* Fluxogramas de revisão por área (cirurgia, clínica, GO, pediatria e
   preventiva). Conteúdo estático, versionado no código: cada tema traz os
   algoritmos, quadros comparativos, o que mais cai e as pegadinhas. */

export type NoFluxo =
  | { tipo: "cenario" | "avaliar" | "conduta" | "atencao"; texto: string }
  | { tipo: "decisao"; texto: string; ramos: RamoFluxo[] };

export type RamoFluxo = { rotulo: string; passos: NoFluxo[] };

export type Algoritmo = { titulo: string; passos: NoFluxo[] };

/* Primeira coluna de cada linha é o rótulo da linha. */
export type Quadro = { titulo: string; colunas: string[]; linhas: string[][] };

export type LinhaDoTempo = { titulo: string; marcos: { quando: string; texto: string }[] };

/* Gráfico de intervalos de confiança (forest plot simples). */
export type GraficoIntervalos = {
  titulo: string;
  grupos: {
    titulo: string;
    nulo: number;
    escala: number[];
    logaritmica?: boolean;
    itens: { rotulo: string; ponto: number; inferior: number; superior: number }[];
  }[];
  leitura: string[];
};

export type RegraRelampago = { tema: string; titulo?: string; texto: string };

export type Tema = {
  id: string;
  titulo: string;
  /* Questões nas últimas 4 provas. */
  questoes?: number;
  /* Ponto que mais confunde, destacado no topo do tema. */
  revisar?: string[];
  algoritmos?: Algoritmo[];
  quadros?: Quadro[];
  linhasDoTempo?: LinhaDoTempo[];
  graficos?: GraficoIntervalos[];
  oQueCai?: string[];
  pegadinhas?: string[];
};

export type AreaFluxos = {
  id: string;
  nome: string;
  temas: Tema[];
  raioX?: { regras: RegraRelampago[]; quadros?: Quadro[]; algoritmos?: Algoritmo[] };
  regrasRelampago?: RegraRelampago[];
};

/* Atalhos para escrever os algoritmos de forma compacta. */
export const cenario = (texto: string): NoFluxo => ({ tipo: "cenario", texto });
export const avaliar = (texto: string): NoFluxo => ({ tipo: "avaliar", texto });
export const conduta = (texto: string): NoFluxo => ({ tipo: "conduta", texto });
export const atencao = (texto: string): NoFluxo => ({ tipo: "atencao", texto });
export const decisao = (texto: string, ...ramos: RamoFluxo[]): NoFluxo => ({ tipo: "decisao", texto, ramos });
export const ramo = (rotulo: string, ...passos: NoFluxo[]): RamoFluxo => ({ rotulo, passos });
