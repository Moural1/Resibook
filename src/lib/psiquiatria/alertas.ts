// Regras clínicas que geram os alertas "Onde investigar hoje".
// Módulo puro: recebe o paciente e devolve alertas, sem depender de interface.
// Cada alerta carrega a regra que o gerou, o "por quê" e a referência.

import {
  ADESAO,
  CLASSES_ALTA_LETALIDADE,
  CLASSES_ESTABILIZADORAS,
  MESES_MINIMOS_TENTATIVA,
  PARENTESCOS,
  type CondicaoFamiliar,
  type ReferenciaId,
} from "./catalogos.ts";
import { NIVEIS_CSSRS } from "./cssrs.ts";
import { gravidadeYmrs, rastreioMdqPositivo } from "./escalas.ts";
import {
  adequacaoTentativa,
  ehAntidepressivo,
  falhasTerapeuticas,
  medicacoesAtivas,
  tentativasInadequadas,
} from "./farmacologia.ts";
import { monitorizacao } from "./monitorizacao.ts";
import type { Alerta, Familiar, NivelAlerta, PacientePsiquiatria } from "./tipos.ts";
import { formatarNumero, porMes, ultimo, ultimoValorExame, unicos } from "./util.ts";

/**
 * Regras cujo racional é consenso clínico geral, sem uma referência única.
 * Qualquer outra regra precisa citar uma referência de REFERENCIAS.
 */
export const REGRAS_SEM_REFERENCIA_ESPECIFICA = [
  "familia-suicidio",
  "familia-psicose",
  "familia-violencia",
  "rede-sem-vinculo-forte",
  "rede-conflituosa",
  "rede-nao-preenchida",
  "efeitos-adversos",
  "clozapina-neutrofilos",
  "exame-pendente",
] as const;

const ORDEM_NIVEL: Record<NivelAlerta, number> = { alto: 0, atencao: 1, info: 2 };

export function rotuloParentesco(familiar: Pick<Familiar, "rel">) {
  return PARENTESCOS[familiar.rel].rotulo.replace(/ \(.*\)/, "").toLowerCase();
}

function listaParentescos(familiares: Familiar[]) {
  return unicos(familiares.map(rotuloParentesco)).join(", ");
}

export function alertas(paciente: PacientePsiquiatria): Alerta[] {
  const lista: Alerta[] = [];
  const add = (
    regra: string,
    nivel: NivelAlerta,
    texto: string,
    explicacao: string,
    referencia: ReferenciaId | null,
    acao?: Alerta["acao"]
  ) => lista.push({ regra, nivel, texto, porque: { explicacao, referencia }, ...(acao ? { acao } : {}) });

  const escalas = (tipo: string) => porMes(paciente.escalas.filter((e) => e.tipo === tipo));
  const phq = escalas("PHQ-9");
  const ultimoPhq = ultimo(phq);
  const cssrs = porMes(paciente.cssrs);
  const ultimoCssrs = ultimo(cssrs);
  const familiaresCom = (c: CondicaoFamiliar) => paciente.geno.filter((g) => g.conds.includes(c));
  const suicidioFamilia = unicos([...familiaresCom("sui"), ...familiaresCom("ts")]);
  const ativos = medicacoesAtivas(paciente);
  const usaAntidepressivo = ativos.some((m) => ehAntidepressivo(m.classe));
  const usaEstabilizador = ativos.some((m) => CLASSES_ESTABILIZADORAS.includes(m.classe));
  const antidepressivoSemEstabilizador = usaAntidepressivo && !usaEstabilizador;
  const usaLitio = ativos.some((m) => m.classe === "litio");
  const ultimaConsultaComAdesao = ultimo(
    porMes(paciente.consultas).filter((c) => c.adesao || (c.efeitos && c.efeitos.length))
  );

  /* ---------- risco de suicídio ---------- */

  if (ultimoPhq && ultimoPhq.itens[8] > 0 && !(ultimoCssrs && ultimoCssrs.mes >= ultimoPhq.mes)) {
    add(
      "phq9-item9-sem-cssrs",
      "alto",
      `PHQ-9 do mês ${ultimoPhq.mes} com item 9 positivo e nenhum C-SSRS depois disso: aplicar agora.`,
      "O item 9 do PHQ-9 rastreia pensamentos de morte ou autolesão, mas não mede o risco. Resposta positiva pede avaliação estruturada.",
      "phq",
      "risco"
    );
  }
  if (ultimoCssrs?.nivel === "alto") {
    add(
      "cssrs-alto",
      "alto",
      `C-SSRS do mês ${ultimoCssrs.mes}: risco alto. ${NIVEIS_CSSRS.alto.conduta}`,
      "Na triagem do C-SSRS, intenção, plano ou comportamento suicida nos últimos 3 meses indicam risco alto.",
      "cssrs",
      "risco"
    );
  } else if (ultimoCssrs?.nivel === "moderado") {
    add(
      "cssrs-moderado",
      "atencao",
      `C-SSRS do mês ${ultimoCssrs.mes}: risco moderado. ${NIVEIS_CSSRS.moderado.conduta}`,
      "Na triagem do C-SSRS, pensar no método ou comportamento suicida há mais de 3 meses indicam risco moderado.",
      "cssrs",
      "risco"
    );
  }
  if (suicidioFamilia.length) {
    add(
      "familia-suicidio",
      "atencao",
      `História familiar de suicídio ou tentativa (${listaParentescos(suicidioFamilia)}): perguntar ativamente sobre ideação em toda consulta.${cssrs.length ? "" : " Nenhum C-SSRS aplicado ainda."}`,
      "História familiar de suicídio é fator de risco independente para suicídio.",
      null,
      cssrs.length ? undefined : "risco"
    );
  }
  const ultimoCssrsPositivo = [...cssrs].reverse().find((c) => c.nivel !== "nenhum");
  const haSinaisDeRisco =
    !!ultimoCssrsPositivo || phq.some((e) => e.itens[8] > 0) || suicidioFamilia.length > 0;
  if (haSinaisDeRisco && !paciente.plano) {
    add(
      "risco-sem-plano",
      "atencao",
      "Há sinais de risco e nenhum plano de segurança registrado.",
      "O plano de segurança reduz comportamento suicida e é recomendado para todo paciente com sinais de risco.",
      "plano",
      "risco"
    );
  }
  if (paciente.plano && ultimoCssrsPositivo && ultimoCssrsPositivo.mes > paciente.plano.mes) {
    add(
      "plano-desatualizado",
      "atencao",
      `Plano de segurança revisado no mês ${paciente.plano.mes}, antes do C-SSRS positivo do mês ${ultimoCssrsPositivo.mes}: revisar com o paciente.`,
      "O plano deve ser revisado sempre que o risco muda.",
      "plano",
      "risco"
    );
  }
  const letais = ativos.filter((m) => CLASSES_ALTA_LETALIDADE.includes(m.classe));
  const porqueLetal =
    "Lítio e tricíclicos têm janela terapêutica estreita e alta letalidade em superdosagem. Restringir o acesso a meios é uma das medidas de maior impacto na prevenção.";
  for (const m of letais) {
    if (!paciente.plano) {
      add(
        "letalidade-sem-plano",
        "info",
        `${m.nome} tem alta letalidade em superdosagem: considerar orientar a guarda das medicações por pessoa de confiança.`,
        porqueLetal,
        "plano"
      );
    } else if (!paciente.plano.meios.some((x) => /medica|rem[eé]dio|receita|fracion/i.test(x))) {
      add(
        "letalidade-sem-restricao",
        "atencao",
        `${m.nome} tem alta letalidade em superdosagem e o plano de segurança não inclui restrição de acesso às medicações.`,
        porqueLetal,
        "plano",
        "risco"
      );
    } else if (m.inicio > paciente.plano.mes) {
      add(
        "letalidade-apos-plano",
        "info",
        `${m.nome} foi iniciado depois da última revisão do plano de segurança: confirmar a restrição de acesso.`,
        porqueLetal,
        "plano",
        "risco"
      );
    }
  }

  /* ---------- espectro bipolar ---------- */

  const porqueBipolar =
    "Parente de 1º grau com TAB, rastreio positivo ou sintomas maníacos aumentam a chance de a depressão fazer parte do espectro bipolar. Antidepressivo sem estabilizador pode induzir virada.";
  const tabPrimeiroGrau = familiaresCom("tab").filter((g) => PARENTESCOS[g.rel].primeiroGrau);
  if (tabPrimeiroGrau.length) {
    if (antidepressivoSemEstabilizador) {
      add(
        "tab-familia-antidepressivo",
        "alto",
        `Parente de 1º grau com TAB (${listaParentescos(tabPrimeiroGrau)}) e antidepressivo sem estabilizador: investigar hipomania prévia e risco de virada.`,
        porqueBipolar,
        "canmatB"
      );
    } else {
      add(
        "tab-familia",
        "atencao",
        `Parente de 1º grau com TAB (${listaParentescos(tabPrimeiroGrau)}): rastrear sintomas de hipomania ou mania a cada consulta.`,
        porqueBipolar,
        "canmatB"
      );
    }
  }
  const ymrs = ultimo(escalas("YMRS"));
  const porqueYmrs = "YMRS a partir de 12 costuma indicar sintomas maníacos relevantes; os pontos de corte variam.";
  if (ymrs && ymrs.total >= 12) {
    if (antidepressivoSemEstabilizador) {
      add(
        "ymrs-antidepressivo",
        "alto",
        `YMRS ${ymrs.total} no mês ${ymrs.mes} com antidepressivo sem estabilizador: avaliar virada maníaca.`,
        porqueYmrs,
        "ymrs"
      );
    } else {
      add(
        "ymrs-elevado",
        "atencao",
        `YMRS ${ymrs.total} no mês ${ymrs.mes} (${gravidadeYmrs(ymrs.total)}): acompanhar sintomas maníacos.`,
        porqueYmrs,
        "ymrs"
      );
    }
  }
  const mdq = ultimo(escalas("MDQ"));
  if (mdq && rastreioMdqPositivo(mdq.itens)) {
    add(
      "mdq-positivo",
      antidepressivoSemEstabilizador ? "alto" : "atencao",
      `MDQ positivo no mês ${mdq.mes}: rastreio positivo para espectro bipolar. Confirmar com entrevista clínica.${antidepressivoSemEstabilizador ? " Há antidepressivo em uso sem estabilizador." : ""}`,
      "MDQ positivo: 7 ou mais sintomas, no mesmo período, com prejuízo moderado ou sério. É rastreio, não diagnóstico.",
      "mdq"
    );
  }

  /* ---------- família e rede de apoio ---------- */

  const psicose = familiaresCom("psi");
  if (psicose.length) {
    add(
      "familia-psicose",
      "info",
      `História familiar de psicose (${listaParentescos(psicose)}): atenção a pródromos e ao uso de cannabis e estimulantes.`,
      "História familiar aumenta o risco; cannabis e estimulantes se associam a início mais precoce de psicose.",
      null
    );
  }
  const substancias = familiaresCom("spa");
  const porqueSubstancias =
    "Uso de substâncias tem forte agregação familiar e piora o prognóstico de transtornos do humor e de ansiedade.";
  if (substancias.length >= 2) {
    add(
      "familia-substancias",
      "atencao",
      `Uso de substâncias em ${substancias.length} familiares: rastrear uso próprio (AUDIT, ASSIST).`,
      porqueSubstancias,
      "audit"
    );
  } else if (substancias.length === 1) {
    add(
      "familia-substancias",
      "info",
      `Uso de substâncias na família (${listaParentescos(substancias)}): vale rastrear uso próprio.`,
      porqueSubstancias,
      "audit"
    );
  }
  const violencia = familiaresCom("vio");
  if (violencia.length) {
    add(
      "familia-violencia",
      "info",
      `Violência ou abuso na família (${listaParentescos(violencia)}): investigar exposição a trauma.`,
      "Exposição a violência na família se associa a trauma e a pior evolução de vários transtornos.",
      null
    );
  }
  const porqueRede = "Isolamento social e baixo suporte são fatores de risco para suicídio e para má adesão.";
  if (paciente.eco.length) {
    const fortes = paciente.eco.filter((e) => e.v === "forte").length;
    const conflituosos = paciente.eco.filter((e) => e.v === "conflituoso").length;
    if (!fortes) {
      add(
        "rede-sem-vinculo-forte",
        "atencao",
        "Nenhum vínculo forte no ecomapa: rede de apoio frágil é fator de risco e dificulta a adesão.",
        porqueRede,
        null
      );
    } else if (conflituosos * 2 >= paciente.eco.length) {
      add("rede-conflituosa", "atencao", "Metade ou mais dos vínculos do ecomapa são conflituosos.", porqueRede, null);
    }
  } else {
    add("rede-nao-preenchida", "info", "Ecomapa ainda não preenchido.", porqueRede, null);
  }

  /* ---------- farmacologia ---------- */

  const porqueTentativa = `Uma tentativa só conta como falha quando o antidepressivo foi usado em dose mínima eficaz por pelo menos ${MESES_MINIMOS_TENTATIVA} meses (cerca de 6 a 8 semanas).`;
  const falhas = falhasTerapeuticas(paciente);
  if (falhas.length >= 2) {
    add(
      "depressao-resistente",
      "atencao",
      `Critério de depressão resistente: ${falhas.length} antidepressivos em dose e tempo adequados sem resposta (${falhas.map((m) => m.nome).join(", ")}).`,
      "Depressão resistente costuma ser definida como falta de resposta a 2 ou mais antidepressivos em dose e tempo adequados. Isso abre outras estratégias, como potencialização, troca de classe e neuromodulação.",
      "canmatD"
    );
  }
  for (const m of tentativasInadequadas(paciente)) {
    add(
      "tentativa-inadequada",
      "info",
      `${m.nome} foi interrompido sem tentativa adequada: não conta como falha terapêutica.`,
      porqueTentativa,
      "canmatD"
    );
  }
  for (const m of ativos) {
    const a = adequacaoTentativa(m, paciente);
    if (a && a.doseAdequada === false && a.duracaoMeses >= 1) {
      add(
        "dose-abaixo-minima",
        "info",
        `${m.nome} ${m.dose} está abaixo da dose mínima eficaz de referência (${a.doseMinima} mg/dia).`,
        porqueTentativa,
        "canmatD"
      );
    }
  }
  if (ultimaConsultaComAdesao?.adesao && ultimaConsultaComAdesao.adesao !== "boa") {
    add(
      "adesao-nao-boa",
      "atencao",
      `Adesão ${ADESAO[ultimaConsultaComAdesao.adesao].toLowerCase()} no mês ${ultimaConsultaComAdesao.mes}: confirmar uso antes de concluir que a medicação falhou.`,
      "Baixa adesão é a causa mais comum de falsa falha terapêutica.",
      "canmatD"
    );
  }
  if (ultimaConsultaComAdesao?.efeitos?.length) {
    add(
      "efeitos-adversos",
      "info",
      `Efeitos adversos relatados no mês ${ultimaConsultaComAdesao.mes}: ${ultimaConsultaComAdesao.efeitos.join(", ").toLowerCase()}.`,
      "Efeitos adversos são a principal causa de abandono do tratamento.",
      null
    );
  }
  const porqueResposta =
    "Resposta: queda de 50% ou mais no PHQ-9. Remissão: PHQ-9 abaixo de 5. O objetivo do tratamento é a remissão.";
  for (const m of ativos) {
    if (!ehAntidepressivo(m.classe) || paciente.atual - m.inicio < MESES_MINIMOS_TENTATIVA) continue;
    const basal = [...phq].reverse().find((e) => e.mes <= m.inicio) ?? phq[0];
    if (!basal || !ultimoPhq || basal === ultimoPhq || !basal.total) continue;
    const reducao = (basal.total - ultimoPhq.total) / basal.total;
    const pct = Math.round(reducao * 100);
    const meses = paciente.atual - m.inicio;
    if (ultimoPhq.total < 5) {
      add("phq9-remissao", "info", `${m.nome}: critério de remissão (PHQ-9 ${ultimoPhq.total}).`, porqueResposta, "canmatD");
    } else if (reducao >= 0.5) {
      add(
        "phq9-resposta",
        "info",
        `${m.nome}: resposta (queda de ${pct}% no PHQ-9), ainda sem remissão. Considerar otimizar até PHQ-9 abaixo de 5.`,
        porqueResposta,
        "canmatD"
      );
    } else if (reducao >= 0.25) {
      add(
        "phq9-resposta-parcial",
        "atencao",
        `${m.nome}: resposta parcial após ${meses} meses (queda de ${pct}%). Considerar ajuste de dose ou de estratégia.`,
        porqueResposta,
        "canmatD"
      );
    } else {
      add(
        "phq9-sem-resposta",
        "atencao",
        `${m.nome}: sem resposta após ${meses} meses (variação de ${pct}%). Revisar dose, adesão e diagnóstico.`,
        porqueResposta,
        "canmatD"
      );
    }
  }

  /* ---------- exames ---------- */

  const inicioLitio = Math.min(...ativos.filter((m) => m.classe === "litio").map((m) => m.inicio));
  const litemia = usaLitio ? ultimoValorExame(paciente, "Litemia", inicioLitio) : undefined;
  const porqueLitemia =
    "Faixa usual de manutenção: 0,6 a 1,0 mEq/L. Acima de 1,5 o risco de toxicidade aumenta muito.";
  if (litemia && litemia.valor != null) {
    const v = litemia.valor;
    if (v > 1.5) {
      add("litemia-toxica", "alto", `Litemia ${formatarNumero(v)} mEq/L no mês ${litemia.mes}: faixa de toxicidade. Avaliar sinais de intoxicação.`, porqueLitemia, "nice");
    } else if (v > 1.2) {
      add("litemia-alta", "atencao", `Litemia ${formatarNumero(v)} mEq/L no mês ${litemia.mes}: acima da faixa de manutenção.`, porqueLitemia, "nice");
    } else if (v < 0.6) {
      add("litemia-baixa", "info", `Litemia ${formatarNumero(v)} mEq/L no mês ${litemia.mes}: abaixo da faixa usual de manutenção.`, porqueLitemia, "nice");
    }
  }
  const tsh = usaLitio ? ultimoValorExame(paciente, "TSH") : undefined;
  if (tsh && tsh.valor != null && tsh.valor > 4.5) {
    add(
      "tsh-litio",
      "atencao",
      `TSH ${formatarNumero(tsh.valor)} mUI/L no mês ${tsh.mes} em uso de lítio: investigar hipotireoidismo.`,
      "O lítio pode causar hipotireoidismo. O limite de referência depende do laboratório.",
      "nice"
    );
  }
  const pesos = porMes(paciente.exames.filter((e) => e.nome === "Peso" && e.valor != null));
  if (pesos.length >= 2) {
    const inicial = pesos[0].valor as number;
    const final = pesos[pesos.length - 1].valor as number;
    const ganho = inicial > 0 ? (final - inicial) / inicial : 0;
    if (ganho >= 0.07) {
      add(
        "ganho-peso",
        "atencao",
        `Ganho de ${Math.round(ganho * 100)}% do peso desde o mês ${pesos[0].mes}: rever medicações e risco metabólico.`,
        "Ganho de 7% ou mais do peso inicial é considerado clinicamente significativo.",
        "meta"
      );
    }
  }
  const glicemia = ultimoValorExame(paciente, "Glicemia de jejum");
  if (glicemia && glicemia.valor != null && glicemia.valor >= 100) {
    add(
      "glicemia-alterada",
      glicemia.valor >= 126 ? "atencao" : "info",
      `Glicemia de jejum ${formatarNumero(glicemia.valor)} mg/dL no mês ${glicemia.mes}.`,
      "Glicemia de jejum a partir de 100 indica pré-diabetes; a partir de 126, possível diabetes. Antipsicóticos pioram o risco.",
      "meta"
    );
  }
  const hba1c = ultimoValorExame(paciente, "HbA1c");
  if (hba1c && hba1c.valor != null && hba1c.valor >= 5.7) {
    add(
      "hba1c-alterada",
      hba1c.valor >= 6.5 ? "atencao" : "info",
      `HbA1c ${formatarNumero(hba1c.valor)}% no mês ${hba1c.mes}.`,
      "HbA1c de 5,7% a 6,4% indica pré-diabetes; a partir de 6,5%, possível diabetes. Antipsicóticos pioram o risco.",
      "ada"
    );
  }
  const usaClozapina = ativos.some((m) => m.classe === "clozapina");
  const hemograma = usaClozapina ? ultimoValorExame(paciente, "Hemograma") : undefined;
  if (hemograma && hemograma.valor != null && hemograma.valor < 1500) {
    add(
      "clozapina-neutrofilos",
      hemograma.valor < 1000 ? "alto" : "atencao",
      `Neutrófilos ${hemograma.valor}/mm³ no mês ${hemograma.mes} em uso de clozapina: seguir o protocolo de monitorização.`,
      "A clozapina pode causar neutropenia e agranulocitose; a conduta segue protocolo específico.",
      null
    );
  }
  for (const item of monitorizacao(paciente).filter((x) => x.status === "pendente")) {
    const referencia: ReferenciaId | null = ["Litemia", "Creatinina", "TSH", "Função hepática"].includes(item.rotulo)
      ? "nice"
      : item.rotulo === "Hemograma"
        ? null
        : "meta";
    add(
      "exame-pendente",
      "atencao",
      `Exame pendente: ${item.rotulo} (${item.medicacao})${item.ultimo == null ? ", sem registro desde o início" : `, previsto para o mês ${item.previsto}`}.`,
      "Intervalos simplificados, baseados em recomendações usuais. Ajuste ao protocolo do seu serviço.",
      referencia
    );
  }

  return lista.sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel]);
}

export function temAlertaAlto(paciente: PacientePsiquiatria) {
  return alertas(paciente).some((a) => a.nivel === "alto");
}

export const ROTULO_NIVEL_ALERTA: Record<NivelAlerta, string> = {
  alto: "Prioridade alta",
  atencao: "Atenção",
  info: "Para considerar",
};

