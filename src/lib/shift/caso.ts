import type { ClinicalCaseSession } from "../clinical-case-session.ts";
import { sinaisDaQueixa, type ValoresCaso } from "./queixas.ts";
import {
  PRIORIDADES,
  lerTriagem,
  maiorPrioridade,
  type Consciencia,
  type LeituraTriagem,
  type NivelPrioridade,
} from "./triagem.ts";

/* Junta a sessão do caso com o motor de triagem: leitura, prioridade final
   (sugerida ou escolhida), valores para as calculadoras e etapas do plantão. */

const CONSCIENCIAS: Consciencia[] = ["", "alerta", "confusao", "voz", "dor", "nao-responde"];

export function consciencia(valor: string | undefined): Consciencia {
  return CONSCIENCIAS.includes((valor ?? "") as Consciencia) ? ((valor ?? "") as Consciencia) : "";
}

export function sinaisMarcados(caso: Pick<ClinicalCaseSession, "complaint" | "sinaisAlarme">) {
  const ids = new Set(caso.sinaisAlarme ?? []);
  return sinaisDaQueixa(caso.complaint).filter((sinal) => ids.has(sinal.id));
}

export function leituraDoCaso(caso: ClinicalCaseSession): LeituraTriagem {
  return lerTriagem({
    idade: caso.age,
    vitals: caso.vitals,
    consciencia: consciencia(caso.consciencia),
    oxigenio: caso.oxigenio,
    sinaisAlarme: sinaisMarcados(caso),
  });
}

export function prioridadeFinal(sugerida: NivelPrioridade | null, manual?: NivelPrioridade | null) {
  return manual ?? sugerida;
}

/* Rótulo antigo de gravidade, ainda lido por pendências, evolução e SBAR. */
export function gravidadeLegada(nivel: NivelPrioridade | null) {
  return nivel ? PRIORIDADES[nivel].gravidadeLegada : "A definir";
}

const CONSCIENCIA_NEWS: Record<Consciencia, string> = {
  "": "",
  alerta: "alert",
  confusao: "confusion",
  voz: "voice",
  dor: "pain",
  "nao-responde": "unresponsive",
};

/* Valores do caso nos ids de campo das calculadoras. */
export function valoresParaCalculadoras(caso: ClinicalCaseSession, leitura: LeituraTriagem): ValoresCaso {
  const nivel = consciencia(caso.consciencia);
  const numero = (texto: string) => {
    const achado = texto.replace(",", ".").match(/\d+(?:\.\d+)?/);
    return achado ? Number(achado[0]) : undefined;
  };
  const valores: ValoresCaso = {
    rr: numero(caso.vitals.fr),
    spo2: numero(caso.vitals.spo2),
    pulse: numero(caso.vitals.fc),
    heartRate: numero(caso.vitals.fc),
    temperature: numero(caso.vitals.temp),
    sbp: leitura.pa?.sistolica,
    dbp: leitura.pa?.diastolica ?? undefined,
    age: leitura.idadeAnos !== null ? Math.floor(leitura.idadeAnos) : undefined,
  };
  if (valores.spo2 !== undefined || caso.oxigenio) valores.oxygen = Boolean(caso.oxigenio);
  if (nivel) {
    valores.consciousness = CONSCIENCIA_NEWS[nivel];
    valores.altered = nivel !== "alerta";
    valores.confusion = nivel !== "alerta";
  }
  return valores;
}

export type EtapaId = "triagem" | "alarmes" | "conduta" | "reavaliacao" | "destino";

export type EtapaCaso = { id: EtapaId; titulo: string; descricao: string; feito: boolean; href: string; acao: string };

const DESTINO_HREF: Record<string, string> = {
  "Alta com orientações": "/plantao/alta-segura",
  Transferência: "/plantao/encaminhamento",
  Internação: "/plantao/sbar",
  "Manter em observação": "/plantao/pendencias",
};

export function etapasDoCaso(caso: ClinicalCaseSession): EtapaCaso[] {
  const leitura = leituraDoCaso(caso);
  const decisao = caso.reassessment?.decision ?? "";
  const destinoDefinido = Boolean(decisao) && decisao !== "Reavaliar após nova intervenção";
  const q = encodeURIComponent(caso.complaint);
  return [
    {
      id: "triagem",
      titulo: "Triagem",
      descricao: "Queixa e ao menos 3 sinais vitais",
      feito: Boolean(caso.complaint.trim()) && leitura.preenchidos >= 3,
      href: "/caso-rapido",
      acao: "Completar sinais vitais",
    },
    {
      id: "alarmes",
      titulo: "Sinais de alarme",
      descricao: "Marcar os presentes ou confirmar que não há",
      feito: Boolean(caso.alarmesRevisados || caso.sinaisAlarme?.length),
      href: "/caso-rapido#sinais-alarme",
      acao: "Revisar sinais de alarme",
    },
    {
      id: "conduta",
      titulo: "Conduta",
      descricao: "Conduta, cálculos e prescrição pelo kit da queixa",
      feito: Boolean(caso.condutaDefinida),
      href: "/caso-rapido#kit-queixa",
      acao: "Abrir o kit da queixa",
    },
    {
      id: "reavaliacao",
      titulo: "Reavaliação",
      descricao: "Sinais vitais e resposta após as medidas",
      feito: Boolean(caso.reassessment?.recordedAt),
      href: "/caso-rapido#reavaliacao",
      acao: "Registrar reavaliação",
    },
    {
      id: "destino",
      titulo: "Destino e passagem",
      descricao: "Alta, observação, internação ou transferência",
      feito: destinoDefinido,
      href: destinoDefinido ? `${DESTINO_HREF[decisao] ?? "/plantao/sbar"}?q=${q}` : "/caso-rapido#reavaliacao",
      acao: destinoDefinido ? "Abrir documento do destino" : "Definir destino na reavaliação",
    },
  ];
}

export function proximaEtapa(etapas: EtapaCaso[]) {
  return etapas.find((etapa) => !etapa.feito) ?? null;
}

export { maiorPrioridade };
