// C-SSRS, versão de rastreio (Posner et al., 2011).

import type { NivelRiscoCssrs, RespostasCssrs } from "./tipos.ts";

export const PERGUNTAS_CSSRS: Record<keyof RespostasCssrs, string> = {
  q1: "Desejou estar morto(a) ou poder dormir e não acordar mais?",
  q2: "Teve de fato algum pensamento de se matar?",
  q3: "Pensou em como poderia fazer isso?",
  q4: "Teve esses pensamentos com alguma intenção de agir de acordo com eles?",
  q5: "Começou a elaborar, ou já elaborou, os detalhes de como se matar? Pretende executar esse plano?",
  q6: "Alguma vez na vida fez, começou a fazer ou se preparou para fazer algo para acabar com a própria vida?",
  q6r: "Isso aconteceu nos últimos 3 meses?",
};

export const NIVEIS_CSSRS: Record<NivelRiscoCssrs, { rotulo: string; conduta: string }> = {
  nenhum: { rotulo: "Sem ideação no último mês", conduta: "Manter o rastreio nas próximas consultas." },
  baixo: {
    rotulo: "Risco baixo",
    conduta:
      "Revisar o plano de segurança, orientar sobre sinais de alerta e canais de ajuda e reavaliar na próxima consulta.",
  },
  moderado: {
    rotulo: "Risco moderado",
    conduta:
      "Elaborar ou revisar o plano de segurança nesta consulta, restringir acesso a meios, envolver a rede de apoio e antecipar o retorno.",
  },
  alto: {
    rotulo: "Risco alto",
    conduta:
      "Não deixar o paciente sozinho. Avaliação psiquiátrica de emergência e considerar internação. Restringir meios de imediato e acionar a rede de apoio.",
  },
};

/**
 * Normaliza as respostas: q3 a q5 só valem se q2 for sim; q6r só vale se q6
 * for sim (são perguntas condicionais na triagem).
 */
export function normalizarRespostasCssrs(r: RespostasCssrs): RespostasCssrs {
  return {
    q1: r.q1,
    q2: r.q2,
    q3: r.q2 && r.q3,
    q4: r.q2 && r.q4,
    q5: r.q2 && r.q5,
    q6: r.q6,
    q6r: r.q6 && r.q6r,
  };
}

/**
 * Nível de risco pela triagem:
 * - alto: intenção (q4), plano (q5) ou comportamento suicida nos últimos 3 meses (q6 + q6r);
 * - moderado: pensou no método (q3) ou comportamento há mais de 3 meses (q6);
 * - baixo: desejo de estar morto (q1) ou pensamento de se matar (q2);
 * - nenhum: todas as respostas negativas.
 */
export function nivelCssrs(respostas: RespostasCssrs): NivelRiscoCssrs {
  const r = normalizarRespostasCssrs(respostas);
  if (r.q4 || r.q5 || (r.q6 && r.q6r)) return "alto";
  if (r.q3 || r.q6) return "moderado";
  if (r.q1 || r.q2) return "baixo";
  return "nenhum";
}
