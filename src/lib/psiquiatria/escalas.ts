// Escalas: itens, total e classificação de gravidade.

import type { TipoEscala } from "./tipos.ts";

export type OpcaoItem = readonly [valor: number, rotulo: string];
export type ItemEscala = { texto: string; opcoes: readonly OpcaoItem[] };

export type DefinicaoEscala = {
  instrucao: string;
  itens: readonly ItemEscala[];
  maximo: number;
  total: (itens: readonly number[]) => number;
  gravidade: (total: number, itens: readonly number[]) => string;
};

const ZERO_A_TRES: readonly OpcaoItem[] = [0, 1, 2, 3].map((v) => [v, String(v)] as const);
const SIM_NAO: readonly OpcaoItem[] = [
  [1, "Sim"],
  [0, "Não"],
];
const soma = (itens: readonly number[]) => itens.reduce((a, b) => a + b, 0);
const itensZeroATres = (textos: string[]) => textos.map((texto) => ({ texto, opcoes: ZERO_A_TRES }));

const INSTRUCAO_PHQ_GAD =
  "Nas últimas 2 semanas, com que frequência? 0 nenhuma vez, 1 vários dias, 2 mais da metade dos dias, 3 quase todos os dias.";

export function gravidadePhq9(total: number) {
  if (total < 5) return "mínima";
  if (total < 10) return "leve";
  if (total < 15) return "moderada";
  if (total < 20) return "moderadamente grave";
  return "grave";
}

export function gravidadeGad7(total: number) {
  if (total < 5) return "mínima";
  if (total < 10) return "leve";
  if (total < 15) return "moderada";
  return "grave";
}

export function gravidadeYmrs(total: number) {
  if (total < 12) return "sem mania significativa";
  if (total < 20) return "sintomas leves";
  if (total < 26) return "moderada";
  return "grave";
}

/** Número de sintomas do MDQ (13 primeiras perguntas). */
export function totalMdq(itens: readonly number[]) {
  return soma(itens.slice(0, 13));
}

/**
 * MDQ positivo: 7 ou mais sintomas, vários no mesmo período (item 14) e
 * prejuízo moderado ou sério (item 15 >= 2).
 */
export function rastreioMdqPositivo(itens: readonly number[]) {
  return totalMdq(itens) >= 7 && itens[13] === 1 && (itens[14] ?? 0) >= 2;
}

const YMRS_ITENS: Array<[string, 4 | 8]> = [
  ["Humor elevado", 4],
  ["Atividade motora e energia aumentadas", 4],
  ["Interesse sexual", 4],
  ["Sono", 4],
  ["Irritabilidade", 8],
  ["Fala (velocidade e quantidade)", 8],
  ["Distúrbio da linguagem e do pensamento", 4],
  ["Conteúdo do pensamento", 8],
  ["Comportamento disruptivo e agressivo", 8],
  ["Aparência", 4],
  ["Insight", 4],
];

const MDQ_SINTOMAS = [
  "se sentiu tão bem ou animado(a) que outros acharam que não era o seu normal, ou se meteu em problemas por isso",
  "ficou tão irritado(a) que gritou com pessoas ou começou brigas",
  "se sentiu muito mais autoconfiante que o habitual",
  "dormiu muito menos que o habitual e não sentiu falta do sono",
  "falou muito mais ou mais rápido que o habitual",
  "teve pensamentos acelerados, sem conseguir desacelerar a mente",
  "se distraiu tão facilmente que teve dificuldade de se concentrar",
  "teve muito mais energia que o habitual",
  "esteve muito mais ativo(a) ou fez muito mais coisas que o habitual",
  "esteve muito mais sociável, por exemplo, ligando para amigos de madrugada",
  "teve muito mais interesse em sexo que o habitual",
  "fez coisas incomuns para você, arriscadas ou que outros acharam exageradas",
  "gastou dinheiro a ponto de trazer problemas para você ou sua família",
];

export const ESCALAS: Record<TipoEscala, DefinicaoEscala> = {
  "PHQ-9": {
    instrucao: INSTRUCAO_PHQ_GAD,
    maximo: 27,
    itens: itensZeroATres([
      "Pouco interesse ou prazer em fazer as coisas",
      "Sentir-se para baixo, deprimido(a) ou sem esperança",
      "Dificuldade para dormir, manter o sono, ou dormir demais",
      "Cansaço ou pouca energia",
      "Falta de apetite ou comer demais",
      "Sentir-se mal consigo, como um fracasso ou decepção para a família",
      "Dificuldade de concentração, como para ler ou ver TV",
      "Lentidão perceptível por outros, ou agitação e inquietação",
      "Pensar que seria melhor estar morto(a) ou em se ferir",
    ]),
    total: soma,
    gravidade: gravidadePhq9,
  },
  "GAD-7": {
    instrucao: INSTRUCAO_PHQ_GAD,
    maximo: 21,
    itens: itensZeroATres([
      "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)",
      "Não conseguir parar ou controlar as preocupações",
      "Preocupar-se demais com coisas diferentes",
      "Dificuldade para relaxar",
      "Inquietação a ponto de ser difícil ficar parado(a)",
      "Irritar-se ou aborrecer-se com facilidade",
      "Medo de que algo terrível vá acontecer",
    ]),
    total: soma,
    gravidade: gravidadeGad7,
  },
  YMRS: {
    instrucao:
      "Avaliação do examinador sobre as últimas 48 horas. Os itens 5, 6, 8 e 9 valem de 0 a 8. Os pontos de corte variam entre estudos.",
    maximo: 60,
    itens: YMRS_ITENS.map(([texto, max]) => ({
      texto,
      opcoes: (max === 8 ? [0, 2, 4, 6, 8] : [0, 1, 2, 3, 4]).map((v) => [v, String(v)] as const),
    })),
    total: soma,
    gravidade: gravidadeYmrs,
  },
  MDQ: {
    instrucao:
      'Autorrelato sobre a vida toda: "Já houve um período em que você não estava como de costume e..."',
    maximo: 13,
    itens: [
      ...MDQ_SINTOMAS.map((t) => ({ texto: `...${t}`, opcoes: SIM_NAO })),
      { texto: "Várias dessas coisas aconteceram no mesmo período?", opcoes: SIM_NAO },
      {
        texto: "Quanto isso causou problemas (trabalho, família, dinheiro, justiça, brigas)?",
        opcoes: [
          [0, "Nenhum"],
          [1, "Pequeno"],
          [2, "Moderado"],
          [3, "Sério"],
        ],
      },
    ],
    total: totalMdq,
    gravidade: (_total, itens) => (rastreioMdqPositivo(itens) ? "rastreio positivo" : "rastreio negativo"),
  },
};

export const TIPOS_ESCALA = Object.keys(ESCALAS) as TipoEscala[];

export function totalEscala(tipo: TipoEscala, itens: readonly number[]) {
  return ESCALAS[tipo].total(itens);
}

export function gravidadeEscala(tipo: TipoEscala, total: number, itens: readonly number[]) {
  return ESCALAS[tipo].gravidade(total, itens);
}

/** Resumo curto de uma aplicação, usado em listas e na evolução. */
export function resumoEscala(aplicacao: { tipo: TipoEscala; total: number; itens: readonly number[] }) {
  if (aplicacao.tipo === "MDQ") return `MDQ ${gravidadeEscala("MDQ", aplicacao.total, aplicacao.itens)}`;
  return `${aplicacao.tipo} ${aplicacao.total} (${gravidadeEscala(aplicacao.tipo, aplicacao.total, aplicacao.itens)})`;
}
