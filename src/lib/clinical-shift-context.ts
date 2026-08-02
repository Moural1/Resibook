import { findQuickComplaint } from "./clinical-quick-complaints.ts";
import type { ClinicalCaseSession } from "./clinical-case-session.ts";

export type ClinicalShiftContext = {
  complaint: string;
  session: ClinicalCaseSession | null;
  source: "query" | "session" | "empty";
};

export type ShiftPlanGuide = {
  title: string;
  focus: string;
  symptomBlocks: string[];
  exams: string[];
  safety: string[];
  reassessment: string[];
};

function normalizeComplaint(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalizeClinicalComplaint(value: string) {
  const clean = value.trim();
  return findQuickComplaint(clean)?.title || clean;
}

export function clinicalComplaintsMatch(first: string, second: string) {
  return (
    normalizeComplaint(canonicalizeClinicalComplaint(first)) ===
    normalizeComplaint(canonicalizeClinicalComplaint(second))
  );
}

export function resolveClinicalShiftContext(
  query: string,
  saved: ClinicalCaseSession | null
): ClinicalShiftContext {
  const requestedComplaint = canonicalizeClinicalComplaint(query);

  if (requestedComplaint) {
    const matchingSession =
      saved && clinicalComplaintsMatch(requestedComplaint, saved.complaint)
        ? saved
        : null;

    return {
      complaint: requestedComplaint,
      session: matchingSession,
      source: "query",
    };
  }

  if (saved?.complaint.trim()) {
    return {
      complaint: canonicalizeClinicalComplaint(saved.complaint),
      session: saved,
      source: "session",
    };
  }

  return { complaint: "", session: null, source: "empty" };
}

export function buildContextualShiftHref(path: string, complaint: string) {
  const clean = canonicalizeClinicalComplaint(complaint);
  return clean ? `${path}?q=${encodeURIComponent(clean)}` : path;
}

export function buildGenericShiftPlanGuide(
  complaint: string,
  priorities: string[] = []
): ShiftPlanGuide {
  const title = canonicalizeClinicalComplaint(complaint) || "Caso clínico";
  const casePriorities = priorities.map((item) => item.trim()).filter(Boolean);

  return {
    title,
    focus: `Organizar avaliação, medidas iniciais e reavaliação para ${title}, usando os dados registrados no caso ativo.`,
    symptomBlocks: [
      "Definir medidas sintomáticas conforme intensidade, comorbidades e contraindicações",
      "Revisar alergias, medicamentos em uso, gestação e funções renal e hepática",
      "Não iniciar tratamento específico sem hipótese clínica e dados mínimos de segurança",
    ],
    exams: [
      "Selecionar exames apenas quando puderem confirmar hipótese ou mudar a conduta",
      "Priorizar avaliações tempo-dependentes e achados relacionados aos sinais de alarme",
      "Registrar o que está pendente e quem ficará responsável pela conferência",
    ],
    safety: [
      "Reavaliar estabilidade clínica e sinais vitais antes de definir destino",
      "Conferir contraindicações, interações, anticoagulação e protocolo local",
      "Escalonar avaliação se houver piora, instabilidade ou novo sinal de gravidade",
    ],
    reassessment: casePriorities.length
      ? casePriorities
      : [
          "Definir prazo e parâmetros objetivos para reavaliação",
          "Documentar resposta às medidas iniciais e mudança dos sintomas",
          "Estabelecer critérios de alta, observação, internação ou transferência",
        ],
  };
}
