"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../../components/copy-button";
import {
  AlertTriangle,
  Plus,
  ClipboardList,
  CalendarClock,
  FlaskConical,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";

type Patient = {
  id: string;
  user_id?: string | null;
  nome: string;
  idade?: number | null;
  sexo?: string | null;
  telefone?: string | null;
  especialidade?: string | null;
  plano_saude?: string | null;
  numero_carteirinha?: string | null;
  carteirinha?: string | null;
  data_nascimento?: string | null;
  crm_medico?: string | null;
  local_atendimento?: string | null;
  queixa?: string | null;
  queixa_principal?: string | null;
  hma?: string | null;
  hpp?: string | null;
  alergias?: string | null;
  comorbidades?: string | null;
  gestante?: boolean | null;
  funcao_renal_alterada?: boolean | null;
  hepatopatia?: boolean | null;
  idoso_fragil?: boolean | null;
  diabetes?: boolean | null;
  epilepsia?: boolean | null;
  asma?: boolean | null;
  gastrite_ulcera?: boolean | null;
  insuficiencia_cardiaca?: boolean | null;
  arritmia_qt_longo?: boolean | null;
  uso_anticoagulante?: boolean | null;
  uso_isrs?: boolean | null;
  uso_sedativos?: boolean | null;
  medicamentos_em_uso?: string | null;
  exame_fisico?: string | null;
  hipotese_diagnostica?: string | null;
  conduta_medica?: string | null;
  observacoes?: string | null;
  retorno_previsto_em?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

type Prescription = {
  id: number;
  user_id?: string | null;
  patient_id?: string | null;
  paciente_nome?: string | null;
  medicamento?: string | null;
  posologia?: string | null;
  duracao?: string | null;
  via?: string | null;
  orientacoes?: string | null;
  created_at?: string | null;
};

type PatientNote = {
  id: number;
  user_id?: string | null;
  patient_id: string;
  tipo?: string | null;
  titulo?: string | null;
  conteudo: string;
  created_at?: string | null;
};

type ProblemItem = {
  id: number;
  patient_id: string;
  user_id: string;
  titulo: string;
  tipo: string;
  status: string;
  prioridade: number | null;
  observacoes: string | null;
  started_at: string | null;
  resolved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FollowupItem = {
  id: number;
  patient_id: string;
  user_id: string;
  motivo: string | null;
  status: string;
  retorno_previsto_em: string;
  realizado_em: string | null;
  observacoes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ExamRequestItem = {
  id: number;
  patient_id: string;
  user_id: string;
  exam_template_id: number | null;
  nome_exame: string;
  indicacao: string | null;
  status: string;
  requested_at: string | null;
  received_at: string | null;
  reviewed_at: string | null;
  resultado_resumido: string | null;
  impacto_clinico: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ConsultationItem = {
  id: number;
  patient_id: string;
  user_id: string;
  queixa_principal: string | null;
  hma: string | null;
  exame_fisico: string | null;
  hipotese_diagnostica: string | null;
  conduta_medica: string | null;
  observacoes: string | null;
  retorno_previsto_em: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type TimelineItem = {
  id: string;
  sourceType:
    | "problem"
    | "followup"
    | "exam"
    | "note"
    | "prescription"
    | "consultation";
  title: string;
  subtitle: string;
  body: string;
  status?: string;
  date: string | null | undefined;
  timestamp: number;
};

type NoteForm = {
  tipo: string;
  titulo: string;
  conteudo: string;
};

type ProblemForm = {
  titulo: string;
  tipo: string;
  status: string;
  prioridade: string;
  observacoes: string;
};

type FollowupForm = {
  motivo: string;
  status: string;
  retorno_previsto_em: string;
  realizado_em: string;
  observacoes: string;
};

type ExamRequestForm = {
  nome_exame: string;
  indicacao: string;
  status: string;
  requested_at: string;
  received_at: string;
  reviewed_at: string;
  resultado_resumido: string;
  impacto_clinico: string;
};

type ConsultationForm = {
  queixa_principal: string;
  hma: string;
  exame_fisico: string;
  hipotese_diagnostica: string;
  conduta_medica: string;
  observacoes: string;
  retorno_previsto_em: string;
};

const emptyNoteForm: NoteForm = {
  tipo: "evolucao",
  titulo: "",
  conteudo: "",
};

const emptyProblemForm: ProblemForm = {
  titulo: "",
  tipo: "hipotese",
  status: "ativo",
  prioridade: "",
  observacoes: "",
};

const emptyFollowupForm: FollowupForm = {
  motivo: "",
  status: "pendente",
  retorno_previsto_em: "",
  realizado_em: "",
  observacoes: "",
};

const emptyExamRequestForm: ExamRequestForm = {
  nome_exame: "",
  indicacao: "",
  status: "solicitado",
  requested_at: "",
  received_at: "",
  reviewed_at: "",
  resultado_resumido: "",
  impacto_clinico: "",
};

const emptyConsultationForm: ConsultationForm = {
  queixa_principal: "",
  hma: "",
  exame_fisico: "",
  hipotese_diagnostica: "",
  conduta_medica: "",
  observacoes: "",
  retorno_previsto_em: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateOnly(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function calculateAgeFromDate(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
}

function resolveBirthAndReturnDates(patient: Patient) {
  const explicitBirth = patient.data_nascimento || null;
  const fallback = patient.retorno_previsto_em || null;

  if (explicitBirth) {
    return {
      birthDate: explicitBirth,
      returnDate: fallback && fallback !== explicitBirth ? fallback : null,
    };
  }

  if (!fallback) {
    return {
      birthDate: null,
      returnDate: null,
    };
  }

  const parsed = parseDate(fallback);
  if (!parsed) {
    return {
      birthDate: null,
      returnDate: fallback,
    };
  }

  const today = new Date();

  if (parsed > today) {
    return {
      birthDate: null,
      returnDate: fallback,
    };
  }

  if (typeof patient.idade === "number") {
    const calculatedAge = calculateAgeFromDate(parsed);

    if (Math.abs(calculatedAge - patient.idade) <= 2) {
      return {
        birthDate: fallback,
        returnDate: null,
      };
    }
  }

  return {
    birthDate: null,
    returnDate: fallback,
  };
}

function getCarteirinha(patient: Patient) {
  return patient.numero_carteirinha || patient.carteirinha || "";
}

function buildAlergiaResumo(value?: string | null) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (clean.length <= 36) return clean;
  return `${clean.slice(0, 36)}...`;
}

function buildPrescriptionText(item: Prescription) {
  const lines = [
    item.medicamento || "Prescrição sem medicamento definido",
    item.posologia || "",
    item.via ? `Via: ${item.via}` : "",
    item.duracao ? `Duração: ${item.duracao}` : "",
    item.orientacoes ? `Orientações: ${item.orientacoes}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildNoteText(item: PatientNote) {
  const tipo = item.tipo || "evolucao";
  const titulo = item.titulo || "Evolução clínica";

  return [
    `${tipo.toUpperCase()} - ${titulo}`,
    `Data: ${formatDate(item.created_at)}`,
    "",
    item.conteudo,
  ].join("\n");
}

function buildConsultationText(item: ConsultationItem) {
  return [
    item.queixa_principal ? `Queixa principal:\n${item.queixa_principal}` : "",
    item.hma ? `HMA:\n${item.hma}` : "",
    item.exame_fisico ? `Exame físico:\n${item.exame_fisico}` : "",
    item.hipotese_diagnostica
      ? `Hipótese diagnóstica:\n${item.hipotese_diagnostica}`
      : "",
    item.conduta_medica ? `Conduta médica:\n${item.conduta_medica}` : "",
    item.observacoes ? `Observações:\n${item.observacoes}` : "",
    item.retorno_previsto_em
      ? `Retorno previsto: ${formatDateOnly(item.retorno_previsto_em)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildTimelineItems(
  problems: ProblemItem[],
  followups: FollowupItem[],
  examRequests: ExamRequestItem[],
  notes: PatientNote[],
  prescriptions: Prescription[],
  consultations: ConsultationItem[]
): TimelineItem[] {
  const problemItems: TimelineItem[] = problems.map((item) => ({
    id: `problem-${item.id}`,
    sourceType: "problem",
    title: item.titulo,
    subtitle: `${item.tipo} • ${item.status}`,
    body: item.observacoes || "Sem observações.",
    status: item.status,
    date: item.updated_at || item.created_at,
    timestamp: getTimestamp(item.updated_at || item.created_at),
  }));

  const followupItems: TimelineItem[] = followups.map((item) => ({
    id: `followup-${item.id}`,
    sourceType: "followup",
    title: item.motivo || "Retorno clínico",
    subtitle: `Previsto: ${formatDateOnly(item.retorno_previsto_em)}`,
    body: [
      `Status: ${item.status}`,
      item.realizado_em ? `Realizado em: ${formatDateOnly(item.realizado_em)}` : "",
      item.observacoes || "",
    ]
      .filter(Boolean)
      .join("\n"),
    status: item.status,
    date: item.realizado_em || item.retorno_previsto_em || item.updated_at || item.created_at,
    timestamp: getTimestamp(
      item.realizado_em || item.retorno_previsto_em || item.updated_at || item.created_at
    ),
  }));

  const examItems: TimelineItem[] = examRequests.map((item) => ({
    id: `exam-${item.id}`,
    sourceType: "exam",
    title: item.nome_exame,
    subtitle: item.indicacao || "Exame do paciente",
    body: [
      `Status: ${item.status}`,
      item.resultado_resumido ? `Resultado: ${item.resultado_resumido}` : "",
      item.impacto_clinico ? `Impacto clínico: ${item.impacto_clinico}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    status: item.status,
    date:
      item.reviewed_at ||
      item.received_at ||
      item.requested_at ||
      item.updated_at ||
      item.created_at,
    timestamp: getTimestamp(
      item.reviewed_at ||
        item.received_at ||
        item.requested_at ||
        item.updated_at ||
        item.created_at
    ),
  }));

 const noteItems: TimelineItem[] = notes.map((item) => ({
  id: `note-${item.id}`,
  sourceType: "note",
  title: item.titulo || "Evolução clínica",
  subtitle: item.tipo || "evolucao",
  body: item.conteudo,
  status: item.tipo || "evolucao",
  date: item.created_at ?? null,
  timestamp: getTimestamp(item.created_at),
}));

const prescriptionItems: TimelineItem[] = prescriptions.map((item) => ({
  id: `rx-${item.id}`,
  sourceType: "prescription",
  title: item.medicamento || "Prescrição clínica",
  subtitle: item.via ? `Via: ${item.via}` : "Prescrição vinculada",
  body: buildPrescriptionText(item),
  date: item.created_at ?? null,
  timestamp: getTimestamp(item.created_at),
}));
  
const consultationItems: TimelineItem[] = consultations.map((item) => ({
  id: `consultation-${item.id}`,
  sourceType: "consultation",
  title: item.queixa_principal || "Consulta clínica",
  subtitle: item.hipotese_diagnostica || "Atendimento registrado",
  body: buildConsultationText(item),
  status: "consulta",
  date: item.created_at ?? null,
  timestamp: getTimestamp(item.created_at),
}));

  return [
    ...problemItems,
    ...followupItems,
    ...examItems,
    ...noteItems,
    ...prescriptionItems,
    ...consultationItems,
  ].sort((a, b) => b.timestamp - a.timestamp);
}

function buildPatientSummary(
  patient: Patient,
  prescriptions: Prescription[],
  notes: PatientNote[],
  problems: ProblemItem[],
  followups: FollowupItem[],
  examRequests: ExamRequestItem[],
  consultations: ConsultationItem[]
) {
  const { birthDate, returnDate } = resolveBirthAndReturnDates(patient);

  const sections = [
    `PACIENTE: ${patient.nome || "-"}`,
    typeof patient.idade === "number" ? `IDADE: ${patient.idade} anos` : "",
    patient.sexo ? `SEXO: ${patient.sexo}` : "",
    patient.telefone ? `TELEFONE: ${patient.telefone}` : "",
    birthDate ? `DATA DE NASCIMENTO: ${formatDateOnly(birthDate)}` : "",
    patient.especialidade ? `ESPECIALIDADE: ${patient.especialidade}` : "",
    patient.plano_saude ? `PLANO DE SAÚDE: ${patient.plano_saude}` : "",
    patient.local_atendimento ? `LOCAL DE ATENDIMENTO: ${patient.local_atendimento}` : "",
    patient.crm_medico ? `MÉDICO / CRM: ${patient.crm_medico}` : "",
    getCarteirinha(patient) ? `CARTEIRINHA: ${getCarteirinha(patient)}` : "",
    returnDate ? `RETORNO PREVISTO: ${formatDateOnly(returnDate)}` : "",
    patient.alergias ? `ALERGIAS:\n${patient.alergias}` : "",
    patient.queixa ? `QUEIXA BASE:\n${patient.queixa}` : "",
    patient.hma ? `HMA BASE:\n${patient.hma}` : "",
    patient.hpp ? `HPP:\n${patient.hpp}` : "",
    patient.medicamentos_em_uso ? `MEDICAMENTOS EM USO:\n${patient.medicamentos_em_uso}` : "",
    patient.exame_fisico ? `EXAME FÍSICO BASE:\n${patient.exame_fisico}` : "",
    patient.hipotese_diagnostica
      ? `HIPÓTESE DIAGNÓSTICA BASE:\n${patient.hipotese_diagnostica}`
      : "",
    patient.conduta_medica ? `CONDUTA MÉDICA BASE:\n${patient.conduta_medica}` : "",
    patient.observacoes ? `OBSERVAÇÕES GERAIS:\n${patient.observacoes}` : "",
  ].filter(Boolean);

  const consultationText = consultations.length
    ? [
        "CONSULTAS:",
        ...consultations.map(
          (item, index) =>
            `${index + 1}. ${formatDate(item.created_at)}\n${buildConsultationText(item)}`
        ),
      ]
    : [];

  const problemText = problems.length
    ? [
        "PROBLEMAS DO PACIENTE:",
        ...problems.map(
          (item, index) =>
            `${index + 1}. ${item.titulo} | Tipo: ${item.tipo} | Status: ${item.status}${
              item.prioridade != null ? ` | Prioridade: ${item.prioridade}` : ""
            }${item.observacoes ? `\n${item.observacoes}` : ""}`
        ),
      ]
    : [];

  const followupText = followups.length
    ? [
        "RETORNOS:",
        ...followups.map(
          (item, index) =>
            `${index + 1}. ${item.motivo || "Retorno clínico"} | Status: ${item.status} | Previsto: ${formatDateOnly(
              item.retorno_previsto_em
            )}${item.realizado_em ? ` | Realizado: ${formatDateOnly(item.realizado_em)}` : ""}${
              item.observacoes ? `\n${item.observacoes}` : ""
            }`
        ),
      ]
    : [];

  const examText = examRequests.length
    ? [
        "EXAMES DO PACIENTE:",
        ...examRequests.map(
          (item, index) =>
            `${index + 1}. ${item.nome_exame} | Status: ${item.status}${
              item.indicacao ? ` | Indicação: ${item.indicacao}` : ""
            }${item.resultado_resumido ? `\nResultado: ${item.resultado_resumido}` : ""}${
              item.impacto_clinico ? `\nImpacto clínico: ${item.impacto_clinico}` : ""
            }`
        ),
      ]
    : [];

  const noteText = notes.length
    ? [
        "EVOLUÇÕES / ANOTAÇÕES:",
        ...notes.map((item, index) => `${index + 1}. ${buildNoteText(item)}`),
      ]
    : [];

  const prescriptionText = prescriptions.length
    ? [
        "PRESCRIÇÕES VINCULADAS:",
        ...prescriptions.map(
          (item, index) => `${index + 1}. ${buildPrescriptionText(item)}`
        ),
      ]
    : [];

  return [
    ...sections,
    ...consultationText,
    ...problemText,
    ...followupText,
    ...examText,
    ...noteText,
    ...prescriptionText,
  ].join("\n\n");
}

function escapeHtml(value?: string | null) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToHtml(value?: string | null) {
  if (!value) return "<span class='empty'>Não informado</span>";
  return escapeHtml(value).replace(/\n/g, "<br />");
}


function getPatientRiskFlags(patient: Patient) {
  return [
    patient.gestante ? "Gestante" : "",
    patient.funcao_renal_alterada ? "Função renal alterada" : "",
    patient.hepatopatia ? "Hepatopatia" : "",
    patient.idoso_fragil ? "Idoso frágil" : "",
    patient.diabetes ? "Diabetes" : "",
    patient.epilepsia ? "Epilepsia / convulsão" : "",
    patient.asma ? "Asma / broncoespasmo" : "",
    patient.gastrite_ulcera ? "Gastrite / úlcera / sangramento GI" : "",
    patient.insuficiencia_cardiaca ? "Insuficiência cardíaca" : "",
    patient.arritmia_qt_longo ? "Arritmia / QT longo" : "",
    patient.uso_anticoagulante ? "Uso de anticoagulante" : "",
    patient.uso_isrs ? "Uso de ISRS" : "",
    patient.uso_sedativos ? "Uso de sedativos / opioides / benzos" : "",
  ].filter(Boolean);
}

function renderPrintAlertBlock(patient: Patient) {
  const risks = getPatientRiskFlags(patient);

  if (!patient.alergias && risks.length === 0 && !patient.comorbidades) {
    return `<section class="alert-block safe"><strong>Sem alertas críticos estruturados registrados.</strong></section>`;
  }

  const allergyHtml = patient.alergias
    ? `<div class="alert-item danger"><span>Alergias</span><strong>${escapeHtml(patient.alergias)}</strong></div>`
    : "";

  const comorbidityHtml = patient.comorbidades
    ? `<div class="alert-item warn"><span>Comorbidades</span><strong>${escapeHtml(patient.comorbidades)}</strong></div>`
    : "";

  const riskHtml = risks.length
    ? `<div class="risk-tags">${risks
        .map((risk) => `<span>${escapeHtml(risk)}</span>`)
        .join("")}</div>`
    : "";

  return `
    <section class="alert-block">
      <div class="alert-title">Alertas clínicos ativos</div>
      ${allergyHtml}
      ${comorbidityHtml}
      ${riskHtml}
    </section>
  `;
}


function buildPatientQuickFacts(patient: Patient) {
  const facts = [
    patient.sexo ? `Sexo: ${patient.sexo}` : "",
    typeof patient.idade === "number" ? `Idade: ${patient.idade} anos` : "",
    patient.telefone ? `Telefone: ${patient.telefone}` : "",
    patient.especialidade ? `Especialidade: ${patient.especialidade}` : "",
    patient.plano_saude ? `Plano: ${patient.plano_saude}` : "",
    patient.local_atendimento ? `Local: ${patient.local_atendimento}` : "",
  ].filter(Boolean);

  return facts.join(" • ");
}

function buildProfessionalPrintHtml(
  patient: Patient,
  prescriptions: Prescription[],
  notes: PatientNote[],
  problems: ProblemItem[],
  followups: FollowupItem[],
  examRequests: ExamRequestItem[],
  consultations: ConsultationItem[]
) {
  const { birthDate, returnDate } = resolveBirthAndReturnDates(patient);
  const carteirinha = getCarteirinha(patient);
  const emittedAt = formatDate(new Date().toISOString());
  const quickFacts = buildPatientQuickFacts(patient) || "Dados clínicos estruturados no ResiBook";

  const consultationHtml = consultations.length
    ? consultations
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>Consulta ${index + 1}</strong>
                  <span>${escapeHtml(item.queixa_principal || "Consulta clínica")}</span>
                </div>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="record-body">${textToHtml(buildConsultationText(item))}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem consultas registradas.</p>`;

  const noteHtml = notes.length
    ? notes
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>${escapeHtml(item.titulo || `Evolução ${index + 1}`)}</strong>
                  <span>${escapeHtml(item.tipo || "evolução")}</span>
                </div>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="record-body">${textToHtml(item.conteudo)}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem evoluções registradas.</p>`;

  const prescriptionHtml = prescriptions.length
    ? prescriptions
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>Prescrição ${index + 1}</strong>
                  <span>${escapeHtml(item.medicamento || "Prescrição clínica")}</span>
                </div>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="record-body">${textToHtml(buildPrescriptionText(item))}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem prescrições vinculadas.</p>`;

  const problemsHtml = problems.length
    ? problems
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>Problema ${index + 1}</strong>
                  <span>${escapeHtml(item.titulo)}</span>
                </div>
                <time>${escapeHtml(item.status)}</time>
              </div>
              <div class="record-body">
                ${textToHtml(
                  `Tipo: ${item.tipo}${
                    item.prioridade != null ? `\nPrioridade: ${item.prioridade}` : ""
                  }${item.observacoes ? `\n\n${item.observacoes}` : ""}`
                )}
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem problemas registrados.</p>`;

  const followupsHtml = followups.length
    ? followups
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>Retorno ${index + 1}</strong>
                  <span>${escapeHtml(item.motivo || "Retorno clínico")}</span>
                </div>
                <time>${escapeHtml(item.status)}</time>
              </div>
              <div class="record-body">
                ${textToHtml(
                  `Previsto: ${formatDateOnly(item.retorno_previsto_em)}${
                    item.realizado_em ? `\nRealizado: ${formatDateOnly(item.realizado_em)}` : ""
                  }${item.observacoes ? `\n\n${item.observacoes}` : ""}`
                )}
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem retornos registrados.</p>`;

  const examsHtml = examRequests.length
    ? examRequests
        .map(
          (item, index) => `
            <article class="record-card">
              <div class="record-head">
                <div>
                  <strong>Exame ${index + 1}</strong>
                  <span>${escapeHtml(item.nome_exame)}</span>
                </div>
                <time>${escapeHtml(item.status)}</time>
              </div>
              <div class="record-body">
                ${textToHtml(
                  `${item.indicacao ? `Indicação: ${item.indicacao}\n\n` : ""}${
                    item.resultado_resumido ? `Resultado: ${item.resultado_resumido}\n\n` : ""
                  }${item.impacto_clinico ? `Impacto clínico: ${item.impacto_clinico}` : ""}`
                )}
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem exames registrados.</p>`;

  const alertHtml = renderPrintAlertBlock(patient);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Prontuário - ${escapeHtml(patient.nome || "Paciente")}</title>
        <style>
          @page { size: A4; margin: 11mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; color: #0f172a; font-family: Arial, Helvetica, sans-serif; background: #f1f5f9; }
          body { padding: 18px; }
          .sheet { max-width: 880px; margin: 0 auto; background: #fff; border: 1px solid #dbe3ee; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 55px rgba(15,23,42,0.14); }
          .header { background: linear-gradient(135deg, #07183d 0%, #0f2f64 60%, #0f766e 100%); color: #fff; padding: 26px 30px; }
          .brand-row { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
          .brand h1 { margin: 0; font-size: 21px; letter-spacing: .18em; font-weight: 900; }
          .brand p { margin: 6px 0 0; font-size: 12px; color: rgba(255,255,255,.82); }
          .doc-meta { text-align: right; font-size: 12px; line-height: 1.7; color: rgba(255,255,255,.88); }
          .patient-hero { margin-top: 22px; display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px; }
          .kicker { display: inline-flex; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.12); border-radius: 999px; padding: 6px 11px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; font-weight: 800; }
          .patient h2 { margin: 12px 0 0; font-size: 31px; line-height: 1.08; letter-spacing: -.035em; }
          .patient p { margin: 9px 0 0; font-size: 13px; color: rgba(255,255,255,.86); }
          .hero-card { border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.12); border-radius: 17px; padding: 14px; }
          .hero-line { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.13); font-size: 12px; }
          .hero-line:last-child { border-bottom: 0; }
          .hero-line span { color: rgba(255,255,255,.72); }
          .hero-line strong { text-align: right; color: #fff; }
          .content { padding: 24px 30px 30px; }
          .alert-block { border: 1px solid #fecdd3; background: #fff1f2; border-radius: 18px; padding: 15px; margin-bottom: 16px; break-inside: avoid; }
          .alert-block.safe { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
          .alert-title { font-size: 12px; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; color: #9f1239; margin-bottom: 10px; }
          .alert-item { border-radius: 14px; padding: 10px 12px; margin-top: 8px; background: #fff; border: 1px solid #fecdd3; }
          .alert-item.warn { border-color: #fde68a; }
          .alert-item span { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #be123c; margin-bottom: 5px; }
          .alert-item.warn span { color: #92400e; }
          .alert-item strong { display: block; white-space: pre-wrap; line-height: 1.55; font-size: 13px; }
          .risk-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
          .risk-tags span { border: 1px solid #fde68a; background: #fff; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 700; color: #92400e; }
          .quick-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
          .quick { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 14px; padding: 11px; }
          .quick span { display: block; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 6px; }
          .quick strong { display: block; font-size: 13px; line-height: 1.4; }
          .section { border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; }
          .section-head { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 15px; }
          .section-head h3 { margin: 0; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #0f172a; }
          .section-body { padding: 15px; }
          .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .field { border: 1px solid #e2e8f0; background: #fff; border-radius: 14px; padding: 12px; min-height: 78px; }
          .field span { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 7px; }
          .field strong { display: block; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
          .record-card { border: 1px solid #e2e8f0; background: #fff; border-radius: 16px; padding: 14px; margin-bottom: 10px; break-inside: avoid; }
          .record-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 9px; }
          .record-head strong { display: block; font-size: 14px; color: #0f172a; }
          .record-head span, .record-head time { display: block; margin-top: 3px; font-size: 11px; color: #64748b; }
          .record-body { white-space: pre-wrap; font-size: 13px; line-height: 1.65; color: #0f172a; }
          .empty { margin: 0; color: #94a3b8; font-style: italic; font-size: 13px; }
          .signature { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .sig-box { border-top: 1px solid #94a3b8; padding-top: 8px; color: #475569; font-size: 12px; text-align: center; }
          .footer { border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10px; line-height: 1.6; padding: 12px 30px 16px; }
          @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border: none; border-radius: 0; max-width: none; }
            .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .alert-block, .section { break-inside: avoid; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header class="header">
            <div class="brand-row">
              <div class="brand">
                <h1>RESIBOOK</h1>
                <p>Prontuário médico • documento para impressão/PDF</p>
              </div>
              <div class="doc-meta">
                <div>Emitido em: <strong>${escapeHtml(emittedAt)}</strong></div>
                <div>Registro: <strong>${escapeHtml(patient.id || "-")}</strong></div>
              </div>
            </div>

            <div class="patient-hero">
              <div class="patient">
                <span class="kicker">Prontuário clínico</span>
                <h2>${escapeHtml(patient.nome || "Paciente")}</h2>
                <p>${escapeHtml(quickFacts)}</p>
              </div>
              <div class="hero-card">
                <div class="hero-line"><span>Sexo / idade</span><strong>${escapeHtml(`${patient.sexo || "-"}${patient.idade ? ` • ${patient.idade} anos` : ""}`)}</strong></div>
                <div class="hero-line"><span>Telefone</span><strong>${escapeHtml(patient.telefone || "-")}</strong></div>
                <div class="hero-line"><span>Atendimento</span><strong>${escapeHtml(patient.local_atendimento || "-")}</strong></div>
                <div class="hero-line"><span>Médico / CRM</span><strong>${escapeHtml(patient.crm_medico || "-")}</strong></div>
              </div>
            </div>
          </header>

          <section class="content">
            ${alertHtml}

            <div class="quick-grid">
              <div class="quick"><span>Prescrições</span><strong>${prescriptions.length}</strong></div>
              <div class="quick"><span>Evoluções</span><strong>${notes.length}</strong></div>
              <div class="quick"><span>Consultas</span><strong>${consultations.length}</strong></div>
              <div class="quick"><span>Retornos</span><strong>${followups.length}</strong></div>
            </div>

            <section class="section">
              <div class="section-head"><h3>Identificação</h3></div>
              <div class="section-body grid-2">
                <div class="field"><span>Data de nascimento</span><strong>${escapeHtml(birthDate)}</strong></div>
                <div class="field"><span>Retorno previsto</span><strong>${escapeHtml(returnDate)}</strong></div>
                <div class="field"><span>Plano de saúde</span><strong>${escapeHtml(patient.plano_saude || "Não informado")}</strong></div>
                <div class="field"><span>Carteirinha</span><strong>${escapeHtml(carteirinha || "Não informado")}</strong></div>
              </div>
            </section>

            <section class="section">
              <div class="section-head"><h3>História clínica</h3></div>
              <div class="section-body grid-2">
                <div class="field"><span>Queixa principal</span><strong>${escapeHtml(patient.queixa_principal || patient.queixa || "Não informado")}</strong></div>
                <div class="field"><span>Hipótese diagnóstica</span><strong>${escapeHtml(patient.hipotese_diagnostica || "Não informado")}</strong></div>
                <div class="field"><span>HMA</span><strong>${escapeHtml(patient.hma || "Não informado")}</strong></div>
                <div class="field"><span>HPP</span><strong>${escapeHtml(patient.hpp || "Não informado")}</strong></div>
                <div class="field"><span>Medicamentos em uso</span><strong>${escapeHtml(patient.medicamentos_em_uso || "Não informado")}</strong></div>
                <div class="field"><span>Observações</span><strong>${escapeHtml(patient.observacoes || "Não informado")}</strong></div>
              </div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Exame físico e conduta</h3></div>
              <div class="section-body grid-2">
                <div class="field"><span>Exame físico</span><strong>${escapeHtml(patient.exame_fisico || "Não informado")}</strong></div>
                <div class="field"><span>Conduta médica</span><strong>${escapeHtml(patient.conduta_medica || "Não informado")}</strong></div>
              </div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Problemas ativos</h3></div>
              <div class="section-body">${problemsHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Retornos</h3></div>
              <div class="section-body">${followupsHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Exames solicitados</h3></div>
              <div class="section-body">${examsHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Consultas</h3></div>
              <div class="section-body">${consultationHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Prescrições</h3></div>
              <div class="section-body">${prescriptionHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Evoluções</h3></div>
              <div class="section-body">${noteHtml}</div>
            </section>

            <div class="signature">
              <div class="sig-box">${escapeHtml(patient.crm_medico || "Médico responsável / CRM")}</div>
              <div class="sig-box">Assinatura / carimbo</div>
            </div>
          </section>

          <footer class="footer">
            Documento gerado pelo ResiBook em ${escapeHtml(emittedAt)}. Para salvar em PDF, use a opção de impressão do navegador e escolha “Salvar como PDF”.
          </footer>
        </main>
      </body>
    </html>
  `;
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children?: string | null;
}) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {children}
      </p>
    </div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const styles = {
    problem: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      card: "border-emerald-100 bg-emerald-50/40",
      icon: ClipboardList,
      label: "Problema",
    },
    followup: {
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      card: "border-amber-100 bg-amber-50/40",
      icon: CalendarClock,
      label: "Retorno",
    },
    exam: {
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      card: "border-blue-100 bg-blue-50/40",
      icon: FlaskConical,
      label: "Exame",
    },
    note: {
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
      card: "border-cyan-100 bg-cyan-50/40",
      icon: FileText,
      label: "Evolução",
    },
    prescription: {
      badge: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      card: "border-fuchsia-100 bg-fuchsia-50/40",
      icon: Pill,
      label: "Prescrição",
    },
    consultation: {
      badge: "border-violet-200 bg-violet-50 text-violet-700",
      card: "border-violet-100 bg-violet-50/40",
      icon: Stethoscope,
      label: "Consulta",
    },
  }[item.sourceType];

  const Icon = styles.icon;

  return (
    <article className="relative pl-10">
      <div className="absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>

      <div className={`rounded-2xl border p-4 ${styles.card}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                {styles.label}
              </span>

              {item.status ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {item.status}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {formatDate(item.date)}
          </span>
        </div>

        {item.body ? (
          <div className="mt-4 rounded-2xl border border-white/70 bg-white px-4 py-3">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {item.body}
            </pre>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SectionToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
    >
      {open ? "Esconder" : "Mostrar"}
    </button>
  );
}


export default function PatientDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const patientId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [examRequests, setExamRequests] = useState<ExamRequestItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [savingProblem, setSavingProblem] = useState(false);
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [savingExamRequest, setSavingExamRequest] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);

  const [savingNoteIds, setSavingNoteIds] = useState<number[]>([]);
  const [savingProblemIds, setSavingProblemIds] = useState<number[]>([]);
  const [savingFollowupIds, setSavingFollowupIds] = useState<number[]>([]);
  const [savingExamRequestIds, setSavingExamRequestIds] = useState<number[]>([]);
  const [savingConsultationIds, setSavingConsultationIds] = useState<number[]>([]);

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingProblemId, setEditingProblemId] = useState<number | null>(null);
  const [editingFollowupId, setEditingFollowupId] = useState<number | null>(null);
  const [editingExamRequestId, setEditingExamRequestId] = useState<number | null>(null);
  const [editingConsultationId, setEditingConsultationId] = useState<number | null>(null);

  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [problemForm, setProblemForm] = useState<ProblemForm>(emptyProblemForm);
  const [followupForm, setFollowupForm] = useState<FollowupForm>(emptyFollowupForm);
  const [examRequestForm, setExamRequestForm] = useState<ExamRequestForm>(emptyExamRequestForm);
  const [consultationForm, setConsultationForm] = useState<ConsultationForm>(emptyConsultationForm);

  const [editNoteForms, setEditNoteForms] = useState<Record<number, NoteForm>>({});
  const [editProblemForms, setEditProblemForms] = useState<Record<number, ProblemForm>>({});
  const [editFollowupForms, setEditFollowupForms] = useState<Record<number, FollowupForm>>({});
  const [editExamRequestForms, setEditExamRequestForms] = useState<Record<number, ExamRequestForm>>({});
  const [editConsultationForms, setEditConsultationForms] = useState<
    Record<number, ConsultationForm>
  >({});

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConsultations, setShowConsultations] = useState(true);
  const [showProblems, setShowProblems] = useState(false);
  const [showFollowups, setShowFollowups] = useState(false);
  const [showExams, setShowExams] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);


  const activeProblemsCount = useMemo(
    () => problems.filter((item) => item.status === "ativo" || item.status === "cronico").length,
    [problems]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const overdueFollowupsCount = useMemo(
    () =>
      followups.filter(
        (item) =>
          (item.status === "pendente" || item.status === "atrasado") &&
          item.retorno_previsto_em < todayStr
      ).length,
    [followups, todayStr]
  );

  const pendingExamCount = useMemo(
    () => examRequests.filter((item) => item.status === "solicitado" || item.status === "recebido").length,
    [examRequests]
  );

  const timelineItems = useMemo(
    () =>
      buildTimelineItems(
        problems,
        followups,
        examRequests,
        notes,
        prescriptions,
        consultations
      ),
    [problems, followups, examRequests, notes, prescriptions, consultations]
  );

  async function loadPatient() {
    if (!patientId) {
      setError("ID do paciente não encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;
    setCurrentUserId(userId);

    if (!userId) {
      setError("Usuário autenticado não identificado.");
      setPatient(null);
      setPrescriptions([]);
      setNotes([]);
      setProblems([]);
      setFollowups([]);
      setExamRequests([]);
      setConsultations([]);
      setLoading(false);
      return;
    }

    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("user_id", userId)
      .single();

    if (patientError || !patientData) {
      setError(patientError?.message || "Paciente não encontrado.");
      setPatient(null);
      setPrescriptions([]);
      setNotes([]);
      setProblems([]);
      setFollowups([]);
      setExamRequests([]);
      setConsultations([]);
      setLoading(false);
      return;
    }

    const currentPatient = patientData as Patient;
    setPatient(currentPatient);

    const notesPromise = supabase
      .from("patient_notes")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const byIdPromise = supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const byNamePromise = currentPatient.nome
      ? supabase
          .from("prescriptions")
          .select("*")
          .eq("paciente_nome", currentPatient.nome)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const problemsPromise = supabase
      .from("patient_problem_list")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const followupsPromise = supabase
      .from("patient_followups")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("retorno_previsto_em", { ascending: true });

    const examsPromise = supabase
      .from("patient_exam_requests")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const consultationsPromise = supabase
      .from("patient_consultations")
      .select("*")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const [
      notesRes,
      byIdRes,
      byNameRes,
      problemsRes,
      followupsRes,
      examsRes,
      consultationsRes,
    ] = await Promise.all([
      notesPromise,
      byIdPromise,
      byNamePromise,
      problemsPromise,
      followupsPromise,
      examsPromise,
      consultationsPromise,
    ]);

    setNotes(notesRes.error ? [] : ((notesRes.data as PatientNote[]) || []));
    setProblems(problemsRes.error ? [] : ((problemsRes.data as ProblemItem[]) || []));
    setFollowups(followupsRes.error ? [] : ((followupsRes.data as FollowupItem[]) || []));
    setExamRequests(examsRes.error ? [] : ((examsRes.data as ExamRequestItem[]) || []));
    setConsultations(
      consultationsRes.error ? [] : ((consultationsRes.data as ConsultationItem[]) || [])
    );

    const mergedMap = new Map<number, Prescription>();
    ((byIdRes.data as Prescription[]) || []).forEach((item) => mergedMap.set(item.id, item));
    ((byNameRes.data as Prescription[]) || []).forEach((item) => mergedMap.set(item.id, item));

    const merged = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    setPrescriptions(merged);
    setLoading(false);
  }

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  function updateNoteForm<K extends keyof NoteForm>(key: K, value: NoteForm[K]) {
    setNoteForm((current) => ({ ...current, [key]: value }));
  }

  function updateProblemForm<K extends keyof ProblemForm>(key: K, value: ProblemForm[K]) {
    setProblemForm((current) => ({ ...current, [key]: value }));
  }

  function updateFollowupForm<K extends keyof FollowupForm>(key: K, value: FollowupForm[K]) {
    setFollowupForm((current) => ({ ...current, [key]: value }));
  }

  function updateExamRequestForm<K extends keyof ExamRequestForm>(
    key: K,
    value: ExamRequestForm[K]
  ) {
    setExamRequestForm((current) => ({ ...current, [key]: value }));
  }

  function updateConsultationForm<K extends keyof ConsultationForm>(
    key: K,
    value: ConsultationForm[K]
  ) {
    setConsultationForm((current) => ({ ...current, [key]: value }));
  }

  function updateEditNoteForm<K extends keyof NoteForm>(id: number, key: K, value: NoteForm[K]) {
    setEditNoteForms((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyNoteForm), [key]: value },
    }));
  }

  function updateEditProblemForm<K extends keyof ProblemForm>(
    id: number,
    key: K,
    value: ProblemForm[K]
  ) {
    setEditProblemForms((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyProblemForm), [key]: value },
    }));
  }

  function updateEditFollowupForm<K extends keyof FollowupForm>(
    id: number,
    key: K,
    value: FollowupForm[K]
  ) {
    setEditFollowupForms((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyFollowupForm), [key]: value },
    }));
  }

  function updateEditExamRequestForm<K extends keyof ExamRequestForm>(
    id: number,
    key: K,
    value: ExamRequestForm[K]
  ) {
    setEditExamRequestForms((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyExamRequestForm), [key]: value },
    }));
  }

  function updateEditConsultationForm<K extends keyof ConsultationForm>(
    id: number,
    key: K,
    value: ConsultationForm[K]
  ) {
    setEditConsultationForms((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyConsultationForm), [key]: value },
    }));
  }

  async function handleCreateNote() {
    if (!patient || !currentUserId || !noteForm.conteudo.trim()) {
      setError("O conteúdo da evolução é obrigatório.");
      return;
    }

    setSavingNote(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_notes")
      .insert({
        user_id: currentUserId,
        patient_id: patient.id,
        tipo: noteForm.tipo.trim() || "evolucao",
        titulo: noteForm.titulo.trim() || null,
        conteudo: noteForm.conteudo.trim(),
      })
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setNotes((current) => [data as PatientNote, ...current]);
      setNoteForm(emptyNoteForm);
      setSuccess("Evolução salva com sucesso.");
    }

    setSavingNote(false);
  }

  async function handleCreateProblem() {
    if (!patient || !currentUserId || !problemForm.titulo.trim()) {
      setError("O título do problema é obrigatório.");
      return;
    }

    setSavingProblem(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_problem_list")
      .insert({
        patient_id: patient.id,
        user_id: currentUserId,
        titulo: problemForm.titulo.trim(),
        tipo: problemForm.tipo,
        status: problemForm.status,
        prioridade: problemForm.prioridade ? Number(problemForm.prioridade) : null,
        observacoes: problemForm.observacoes.trim() || null,
      })
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setProblems((current) => [data as ProblemItem, ...current]);
      setProblemForm(emptyProblemForm);
      setSuccess("Problema salvo com sucesso.");
    }

    setSavingProblem(false);
  }

  async function handleCreateFollowup() {
    if (!patient || !currentUserId || !followupForm.retorno_previsto_em) {
      setError("A data prevista do retorno é obrigatória.");
      return;
    }

    setSavingFollowup(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_followups")
      .insert({
        patient_id: patient.id,
        user_id: currentUserId,
        motivo: followupForm.motivo.trim() || null,
        status: followupForm.status,
        retorno_previsto_em: followupForm.retorno_previsto_em,
        realizado_em: followupForm.realizado_em || null,
        observacoes: followupForm.observacoes.trim() || null,
      })
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setFollowups((current) =>
        [...current, data as FollowupItem].sort((a, b) =>
          a.retorno_previsto_em.localeCompare(b.retorno_previsto_em)
        )
      );
      setFollowupForm(emptyFollowupForm);
      setSuccess("Retorno salvo com sucesso.");
    }

    setSavingFollowup(false);
  }

  async function handleCreateExamRequest() {
    if (!patient || !currentUserId || !examRequestForm.nome_exame.trim()) {
      setError("O nome do exame é obrigatório.");
      return;
    }

    setSavingExamRequest(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_exam_requests")
      .insert({
        patient_id: patient.id,
        user_id: currentUserId,
        nome_exame: examRequestForm.nome_exame.trim(),
        indicacao: examRequestForm.indicacao.trim() || null,
        status: examRequestForm.status,
        requested_at: examRequestForm.requested_at || undefined,
        received_at: examRequestForm.received_at || null,
        reviewed_at: examRequestForm.reviewed_at || null,
        resultado_resumido: examRequestForm.resultado_resumido.trim() || null,
        impacto_clinico: examRequestForm.impacto_clinico.trim() || null,
      })
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setExamRequests((current) => [data as ExamRequestItem, ...current]);
      setExamRequestForm(emptyExamRequestForm);
      setSuccess("Exame salvo com sucesso.");
    }

    setSavingExamRequest(false);
  }

  async function handleCreateConsultation() {
    if (!patient || !currentUserId) {
      setError("Usuário autenticado ou paciente não identificado.");
      return;
    }

    if (!consultationForm.queixa_principal.trim()) {
      setError("A queixa principal da consulta é obrigatória.");
      return;
    }

    setSavingConsultation(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_consultations")
      .insert({
        patient_id: patient.id,
        user_id: currentUserId,
        queixa_principal: consultationForm.queixa_principal.trim(),
        hma: consultationForm.hma.trim() || null,
        exame_fisico: consultationForm.exame_fisico.trim() || null,
        hipotese_diagnostica: consultationForm.hipotese_diagnostica.trim() || null,
        conduta_medica: consultationForm.conduta_medica.trim() || null,
        observacoes: consultationForm.observacoes.trim() || null,
        retorno_previsto_em: consultationForm.retorno_previsto_em || null,
      })
      .select("*")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setConsultations((current) => [data as ConsultationItem, ...current]);
      setConsultationForm(emptyConsultationForm);
      setSuccess("Consulta salva com sucesso.");
    }

    setSavingConsultation(false);
  }

  function startEditNote(note: PatientNote) {
    setEditingNoteId(note.id);
    setEditNoteForms((current) => ({
      ...current,
      [note.id]: {
        tipo: note.tipo || "evolucao",
        titulo: note.titulo || "",
        conteudo: note.conteudo || "",
      },
    }));
  }

  function startEditProblem(item: ProblemItem) {
    setEditingProblemId(item.id);
    setEditProblemForms((current) => ({
      ...current,
      [item.id]: {
        titulo: item.titulo || "",
        tipo: item.tipo || "hipotese",
        status: item.status || "ativo",
        prioridade: item.prioridade != null ? String(item.prioridade) : "",
        observacoes: item.observacoes || "",
      },
    }));
  }

  function startEditFollowup(item: FollowupItem) {
    setEditingFollowupId(item.id);
    setEditFollowupForms((current) => ({
      ...current,
      [item.id]: {
        motivo: item.motivo || "",
        status: item.status || "pendente",
        retorno_previsto_em: item.retorno_previsto_em || "",
        realizado_em: item.realizado_em || "",
        observacoes: item.observacoes || "",
      },
    }));
  }

  function startEditExamRequest(item: ExamRequestItem) {
    setEditingExamRequestId(item.id);
    setEditExamRequestForms((current) => ({
      ...current,
      [item.id]: {
        nome_exame: item.nome_exame || "",
        indicacao: item.indicacao || "",
        status: item.status || "solicitado",
        requested_at: item.requested_at ? item.requested_at.slice(0, 10) : "",
        received_at: item.received_at ? item.received_at.slice(0, 10) : "",
        reviewed_at: item.reviewed_at ? item.reviewed_at.slice(0, 10) : "",
        resultado_resumido: item.resultado_resumido || "",
        impacto_clinico: item.impacto_clinico || "",
      },
    }));
  }

  function startEditConsultation(item: ConsultationItem) {
    setEditingConsultationId(item.id);
    setEditConsultationForms((current) => ({
      ...current,
      [item.id]: {
        queixa_principal: item.queixa_principal || "",
        hma: item.hma || "",
        exame_fisico: item.exame_fisico || "",
        hipotese_diagnostica: item.hipotese_diagnostica || "",
        conduta_medica: item.conduta_medica || "",
        observacoes: item.observacoes || "",
        retorno_previsto_em: item.retorno_previsto_em || "",
      },
    }));
  }

  function cancelEditNote(id: number) {
    setEditingNoteId(null);
    setEditNoteForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function cancelEditProblem(id: number) {
    setEditingProblemId(null);
    setEditProblemForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function cancelEditFollowup(id: number) {
    setEditingFollowupId(null);
    setEditFollowupForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function cancelEditExamRequest(id: number) {
    setEditingExamRequestId(null);
    setEditExamRequestForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function cancelEditConsultation(id: number) {
    setEditingConsultationId(null);
    setEditConsultationForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function handleUpdateNote(id: number) {
    if (!currentUserId) return;
    const form = editNoteForms[id];
    if (!form || !form.conteudo.trim()) {
      setError("O conteúdo da evolução é obrigatório.");
      return;
    }

    setSavingNoteIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_notes")
      .update({
        tipo: form.tipo.trim() || "evolucao",
        titulo: form.titulo.trim() || null,
        conteudo: form.conteudo.trim(),
      })
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setNotes((current) =>
        current.map((item) => (item.id === id ? (data as PatientNote) : item))
      );
      cancelEditNote(id);
      setSuccess("Evolução atualizada com sucesso.");
    }

    setSavingNoteIds((current) => current.filter((item) => item !== id));
  }

  async function handleUpdateProblem(id: number) {
    if (!currentUserId) return;
    const form = editProblemForms[id];
    if (!form || !form.titulo.trim()) {
      setError("O título do problema é obrigatório.");
      return;
    }

    setSavingProblemIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_problem_list")
      .update({
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        status: form.status,
        prioridade: form.prioridade ? Number(form.prioridade) : null,
        observacoes: form.observacoes.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setProblems((current) =>
        current.map((item) => (item.id === id ? (data as ProblemItem) : item))
      );
      cancelEditProblem(id);
      
setSuccess("Problema atualizado com sucesso.");
    }

    setSavingProblemIds((current) => current.filter((item) => item !== id));
  }

  async function handleUpdateFollowup(id: number) {
    if (!currentUserId) return;
    const form = editFollowupForms[id];
    if (!form || !form.retorno_previsto_em) {
      setError("A data prevista do retorno é obrigatória.");
      return;
    }

    setSavingFollowupIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_followups")
      .update({
        motivo: form.motivo.trim() || null,
        status: form.status,
        retorno_previsto_em: form.retorno_previsto_em,
        realizado_em: form.realizado_em || null,
        observacoes: form.observacoes.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setFollowups((current) =>
        current
          .map((item) => (item.id === id ? (data as FollowupItem) : item))
          .sort((a, b) => a.retorno_previsto_em.localeCompare(b.retorno_previsto_em))
      );
      cancelEditFollowup(id);
      setSuccess("Retorno atualizado com sucesso.");
    }

    setSavingFollowupIds((current) => current.filter((item) => item !== id));
  }

  async function handleUpdateExamRequest(id: number) {
    if (!currentUserId) return;
    const form = editExamRequestForms[id];
    if (!form || !form.nome_exame.trim()) {
      setError("O nome do exame é obrigatório.");
      return;
    }

    setSavingExamRequestIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_exam_requests")
      .update({
        nome_exame: form.nome_exame.trim(),
        indicacao: form.indicacao.trim() || null,
        status: form.status,
        requested_at: form.requested_at || undefined,
        received_at: form.received_at || null,
        reviewed_at: form.reviewed_at || null,
        resultado_resumido: form.resultado_resumido.trim() || null,
        impacto_clinico: form.impacto_clinico.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setExamRequests((current) =>
        current.map((item) => (item.id === id ? (data as ExamRequestItem) : item))
      );
      cancelEditExamRequest(id);
      setSuccess("Exame atualizado com sucesso.");
    }

    setSavingExamRequestIds((current) => current.filter((item) => item !== id));
  }

  async function handleUpdateConsultation(id: number) {
    if (!currentUserId) return;
    const form = editConsultationForms[id];

    if (!form || !form.queixa_principal.trim()) {
      setError("A queixa principal da consulta é obrigatória.");
      return;
    }

    setSavingConsultationIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("patient_consultations")
      .update({
        queixa_principal: form.queixa_principal.trim(),
        hma: form.hma.trim() || null,
        exame_fisico: form.exame_fisico.trim() || null,
        hipotese_diagnostica: form.hipotese_diagnostica.trim() || null,
        conduta_medica: form.conduta_medica.trim() || null,
        observacoes: form.observacoes.trim() || null,
        retorno_previsto_em: form.retorno_previsto_em || null,
      })
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select("*")
      .single();

    if (error) setError(error.message);
    else if (data) {
      setConsultations((current) =>
        current.map((item) => (item.id === id ? (data as ConsultationItem) : item))
      );
      cancelEditConsultation(id);
      setSuccess("Consulta atualizada com sucesso.");
    }

    setSavingConsultationIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteNote(id: number) {
    if (!currentUserId || !window.confirm("Tem certeza que deseja apagar esta evolução?")) return;
    setSavingNoteIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) setError(error.message);
    else {
      setNotes((current) => current.filter((item) => item.id !== id));
      cancelEditNote(id);
      setSuccess("Evolução apagada com sucesso.");
    }

    setSavingNoteIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteProblem(id: number) {
    if (!currentUserId || !window.confirm("Tem certeza que deseja apagar este problema?")) return;
    setSavingProblemIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_problem_list")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) setError(error.message);
    else {
      setProblems((current) => current.filter((item) => item.id !== id));
      cancelEditProblem(id);
      setSuccess("Problema apagado com sucesso.");
    }

    setSavingProblemIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteFollowup(id: number) {
    if (!currentUserId || !window.confirm("Tem certeza que deseja apagar este retorno?")) return;
    setSavingFollowupIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_followups")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) setError(error.message);
    else {
      setFollowups((current) => current.filter((item) => item.id !== id));
      cancelEditFollowup(id);
      setSuccess("Retorno apagado com sucesso.");
    }

    setSavingFollowupIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteExamRequest(id: number) {
    if (!currentUserId || !window.confirm("Tem certeza que deseja apagar este exame?")) return;
    setSavingExamRequestIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_exam_requests")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) setError(error.message);
    else {
      setExamRequests((current) => current.filter((item) => item.id !== id));
      cancelEditExamRequest(id);
      setSuccess("Exame apagado com sucesso.");
    }

    setSavingExamRequestIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteConsultation(id: number) {
    if (!currentUserId || !window.confirm("Tem certeza que deseja apagar esta consulta?")) return;
    setSavingConsultationIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_consultations")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) setError(error.message);
    else {
      setConsultations((current) => current.filter((item) => item.id !== id));
      cancelEditConsultation(id);
      setSuccess("Consulta apagada com sucesso.");
    }

    setSavingConsultationIds((current) => current.filter((item) => item !== id));
  }

  
function buildPatientQuickFacts(patient: Patient) {
  const facts = [
    patient.sexo ? `Sexo: ${patient.sexo}` : "",
    typeof patient.idade === "number" ? `Idade: ${patient.idade} anos` : "",
    patient.telefone ? `Telefone: ${patient.telefone}` : "",
    patient.especialidade ? `Especialidade: ${patient.especialidade}` : "",
    patient.plano_saude ? `Plano: ${patient.plano_saude}` : "",
    patient.local_atendimento ? `Local: ${patient.local_atendimento}` : "",
  ].filter(Boolean);

  return facts.join(" • ");
}

function buildSummaryPrintHtml(
  patient: Patient,
  prescriptions: Prescription[],
  notes: PatientNote[],
  consultations: ConsultationItem[]
) {
  const emittedAt = formatDate(new Date().toISOString());
  const topPrescriptions = prescriptions.slice(0, 6);
  const topNotes = notes.slice(0, 6);
  const topConsultations = consultations.slice(0, 4);
  const alertHtml = renderPrintAlertBlock(patient);

  const prescriptionHtml = topPrescriptions.length
    ? topPrescriptions
        .map(
          (item, index) => `
            <article class="card">
              <div class="card-head">
                <strong>Prescrição ${index + 1}</strong>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="card-body">${textToHtml(buildPrescriptionText(item))}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem prescrições vinculadas.</p>`;

  const notesHtml = topNotes.length
    ? topNotes
        .map(
          (item, index) => `
            <article class="card">
              <div class="card-head">
                <strong>${escapeHtml(item.titulo || `Evolução ${index + 1}`)}</strong>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="card-body">${textToHtml(item.conteudo)}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem evoluções registradas.</p>`;

  const consultationHtml = topConsultations.length
    ? topConsultations
        .map(
          (item, index) => `
            <article class="card">
              <div class="card-head">
                <strong>Consulta ${index + 1}</strong>
                <time>${escapeHtml(formatDate(item.created_at))}</time>
              </div>
              <div class="card-body">${textToHtml(buildConsultationText(item))}</div>
            </article>
          `
        )
        .join("")
    : `<p class="empty">Sem consultas registradas.</p>`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Resumo clínico - ${escapeHtml(patient.nome || "Paciente")}</title>
        <style>
          @page { size: A4; margin: 11mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #f1f5f9; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
          body { padding: 18px; }
          .sheet { max-width: 860px; margin: 0 auto; background: white; border: 1px solid #dbe3ee; border-radius: 20px; overflow: hidden; box-shadow: 0 18px 55px rgba(15,23,42,.14); }
          .header { background: linear-gradient(135deg, #07183d 0%, #0f2f64 62%, #0f766e 100%); color: #fff; padding: 25px 30px; }
          .brand-row { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
          .brand h1 { margin: 0; font-size: 21px; letter-spacing: .18em; font-weight: 900; }
          .brand p { margin: 6px 0 0; font-size: 12px; color: rgba(255,255,255,.82); }
          .meta { text-align: right; font-size: 12px; line-height: 1.7; color: rgba(255,255,255,.88); }
          .patient { margin-top: 22px; }
          .chip { display: inline-flex; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.12); border-radius: 999px; padding: 6px 11px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; font-weight: 800; }
          .patient h2 { margin: 12px 0 0; font-size: 31px; line-height: 1.08; letter-spacing: -.035em; }
          .patient p { margin: 9px 0 0; font-size: 13px; color: rgba(255,255,255,.86); }
          .content { padding: 24px 30px 30px; }
          .alert-block { border: 1px solid #fecdd3; background: #fff1f2; border-radius: 18px; padding: 15px; margin-bottom: 16px; break-inside: avoid; }
          .alert-block.safe { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
          .alert-title { font-size: 12px; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; color: #9f1239; margin-bottom: 10px; }
          .alert-item { border-radius: 14px; padding: 10px 12px; margin-top: 8px; background: #fff; border: 1px solid #fecdd3; }
          .alert-item.warn { border-color: #fde68a; }
          .alert-item span { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #be123c; margin-bottom: 5px; }
          .alert-item.warn span { color: #92400e; }
          .alert-item strong { display: block; white-space: pre-wrap; line-height: 1.55; font-size: 13px; }
          .risk-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
          .risk-tags span { border: 1px solid #fde68a; background: #fff; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 700; color: #92400e; }
          .section { border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; margin-bottom: 14px; break-inside: avoid; }
          .section-head { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 15px; }
          .section-head h3 { margin: 0; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #0f172a; }
          .section-body { padding: 15px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .fact { border: 1px solid #e2e8f0; background: #fff; border-radius: 14px; padding: 12px; min-height: 78px; }
          .fact span { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 7px; }
          .fact strong { display: block; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
          .card { border: 1px solid #e2e8f0; background: #fff; border-radius: 16px; padding: 14px; margin-bottom: 10px; break-inside: avoid; }
          .card-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 9px; }
          .card-head strong { font-size: 14px; color: #0f172a; }
          .card-head time { font-size: 11px; color: #64748b; }
          .card-body { white-space: pre-wrap; font-size: 13px; line-height: 1.65; color: #0f172a; }
          .empty { margin: 0; color: #94a3b8; font-style: italic; font-size: 13px; }
          .signature { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .sig-box { border-top: 1px solid #94a3b8; padding-top: 8px; color: #475569; font-size: 12px; text-align: center; }
          .footer { border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10px; line-height: 1.6; padding: 12px 30px 16px; }
          @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border: none; border-radius: 0; max-width: none; }
            .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .alert-block, .section, .card { break-inside: avoid; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header class="header">
            <div class="brand-row">
              <div class="brand">
                <h1>RESIBOOK</h1>
                <p>Resumo clínico do paciente • impressão/PDF</p>
              </div>
              <div class="meta">
                <div>Emitido em: <strong>${escapeHtml(emittedAt)}</strong></div>
                <div>Paciente: <strong>${escapeHtml(patient.nome || "-")}</strong></div>
              </div>
            </div>
            <div class="patient">
              <span class="chip">Resumo executivo</span>
              <h2>${escapeHtml(patient.nome || "Paciente")}</h2>
              <p>${escapeHtml(buildPatientQuickFacts(patient) || "Resumo clínico estruturado para compartilhamento ou impressão.")}</p>
            </div>
          </header>

          <section class="content">
            ${alertHtml}

            <section class="section">
              <div class="section-head"><h3>Dados principais</h3></div>
              <div class="section-body grid">
                <div class="fact"><span>Queixa principal</span><strong>${escapeHtml(patient.queixa_principal || patient.queixa || "Não informado")}</strong></div>
                <div class="fact"><span>Hipótese diagnóstica</span><strong>${escapeHtml(patient.hipotese_diagnostica || "Não informado")}</strong></div>
                <div class="fact"><span>Alergias</span><strong>${escapeHtml(patient.alergias || "Não informado")}</strong></div>
                <div class="fact"><span>Medicamentos em uso</span><strong>${escapeHtml(patient.medicamentos_em_uso || "Não informado")}</strong></div>
              </div>
            </section>

            <section class="section">
              <div class="section-head"><h3>História e conduta</h3></div>
              <div class="section-body grid">
                <div class="fact"><span>HMA</span><strong>${escapeHtml(patient.hma || "Não informado")}</strong></div>
                <div class="fact"><span>HPP</span><strong>${escapeHtml(patient.hpp || "Não informado")}</strong></div>
                <div class="fact"><span>Exame físico</span><strong>${escapeHtml(patient.exame_fisico || "Não informado")}</strong></div>
                <div class="fact"><span>Conduta médica</span><strong>${escapeHtml(patient.conduta_medica || "Não informado")}</strong></div>
              </div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Consultas recentes</h3></div>
              <div class="section-body">${consultationHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Prescrições recentes</h3></div>
              <div class="section-body">${prescriptionHtml}</div>
            </section>

            <section class="section">
              <div class="section-head"><h3>Evoluções recentes</h3></div>
              <div class="section-body">${notesHtml}</div>
            </section>

            <div class="signature">
              <div class="sig-box">${escapeHtml(patient.crm_medico || "Médico responsável / CRM")}</div>
              <div class="sig-box">Assinatura / carimbo</div>
            </div>
          </section>

          <footer class="footer">
            Documento gerado pelo ResiBook em ${escapeHtml(emittedAt)}. Para salvar em PDF, use a opção de impressão do navegador e escolha “Salvar como PDF”.
          </footer>
        </main>
      </body>
    </html>
  `;
}

function openPrintHtml(html: string) {
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      alert("Não foi possível abrir a janela de impressão.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };
  }

  function handlePrintProfessional() {
    if (!patient) return;

    const html = buildProfessionalPrintHtml(
      patient,
      prescriptions,
      notes,
      problems,
      followups,
      examRequests,
      consultations
    );

    openPrintHtml(html);
  }

  function handlePrintSummary() {
    if (!patient) return;

    const html = buildSummaryPrintHtml(
      patient,
      prescriptions,
      notes,
      consultations
    );

    openPrintHtml(html);
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
        Carregando prontuário do paciente...
      </section>
    );
  }

  if (error && !patient) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">
          Erro: {error || "Paciente não encontrado."}
        </p>

        <button
          type="button"
          onClick={() => router.push("/pacientes")}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
        >
          Voltar para pacientes
        </button>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">
          Paciente não encontrado.
        </p>
      </section>
    );
  }

  const { birthDate, returnDate } = resolveBirthAndReturnDates(patient);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Prontuário
                </span>

                {patient.especialidade ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {patient.especialidade}
                  </span>
                ) : null}

                {patient.alergias ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {buildAlergiaResumo(patient.alergias)}
                  </span>
                ) : null}

                {birthDate ? (
                  <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Nascimento: {formatDateOnly(birthDate)}
                  </span>
                ) : null}

                {returnDate ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Retorno: {formatDateOnly(returnDate)}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {patient.nome}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {patient.sexo || "Sexo não informado"}
                {typeof patient.idade === "number" ? ` • ${patient.idade} anos` : ""}
                {patient.telefone ? ` • ${patient.telefone}` : ""}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-400">
                Cadastro: {formatDate(patient.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <CopyButton
                text={buildPatientSummary(
                  patient,
                  prescriptions,
                  notes,
                  problems,
                  followups,
                  examRequests,
                  consultations
                )}
              />

              <button
                type="button"
                onClick={handlePrintSummary}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Resumo PDF
              </button>

              <button
                type="button"
                onClick={handlePrintProfessional}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                Prontuário PDF
              </button>

              <Link
                href={`/prescricao?patient_id=${encodeURIComponent(
                  patient.id
                )}&paciente_nome=${encodeURIComponent(patient.nome)}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white"
              >
                Nova prescrição
              </Link>

              <Link
                href={`/prescricao?q=${encodeURIComponent(patient.nome)}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-700"
              >
                Ver prescrições
              </Link>

              <Link
                href="/pacientes"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Voltar
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center gap-2 text-violet-700">
              <Stethoscope className="h-4 w-4" />
              <p className="text-sm font-semibold">Consultas</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-violet-900">
              {consultations.length}
            </p>
            <p className="mt-1 text-sm text-violet-800">
              Atendimentos registrados para esse paciente.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <ClipboardList className="h-4 w-4" />
              <p className="text-sm font-semibold">Problemas ativos</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-emerald-900">
              {activeProblemsCount}
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              Diagnósticos, hipóteses e comorbidades em acompanhamento.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <CalendarClock className="h-4 w-4" />
              <p className="text-sm font-semibold">Retornos atrasados</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-amber-900">
              {overdueFollowupsCount}
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Pendências de seguimento que merecem revisão.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <FlaskConical className="h-4 w-4" />
              <p className="text-sm font-semibold">Exames pendentes</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-blue-900">
              {pendingExamCount}
            </p>
            <p className="mt-1 text-sm text-blue-800">
              Solicitações aguardando resultado ou revisão.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <InfoBlock title="Alergias">{patient.alergias}</InfoBlock>
          <InfoBlock title="Queixa base">{patient.queixa}</InfoBlock>
          <InfoBlock title="HMA base">{patient.hma}</InfoBlock>
          <InfoBlock title="HPP">{patient.hpp}</InfoBlock>
          <InfoBlock title="Medicamentos em uso">{patient.medicamentos_em_uso}</InfoBlock>
          <InfoBlock title="Exame físico base">{patient.exame_fisico}</InfoBlock>
          <InfoBlock title="Hipótese diagnóstica base">{patient.hipotese_diagnostica}</InfoBlock>
          <InfoBlock title="Conduta médica base">{patient.conduta_medica}</InfoBlock>
          <InfoBlock title="Observações gerais">{patient.observacoes}</InfoBlock>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-700">
              Visão longitudinal
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Linha do tempo clínica
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consultas, problemas, retornos, exames, evoluções e prescrições em ordem cronológica.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            {timelineItems.length} {timelineItems.length === 1 ? "evento" : "eventos"}
          </span>
        </div>

        {timelineItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Ainda não há eventos na linha do tempo.
          </div>
        ) : (
          <div className="relative mt-6 space-y-4 before:absolute before:bottom-0 before:left-[15px] before:top-0 before:w-px before:bg-slate-200">
            {timelineItems.map((item) => (
              <TimelineCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-violet-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
              Atendimento
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Nova consulta
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Registre um novo atendimento sem sobrescrever o cadastro-base do paciente.
            </p>
          </div>

          <SectionToggle
            open={showConsultations}
            onToggle={() => setShowConsultations((v) => !v)}
          />
        </div>

        {showConsultations ? (
          <>
        <div className="mt-5 grid gap-4">
          <textarea
            rows={3}
            value={consultationForm.queixa_principal}
            onChange={(e) => updateConsultationForm("queixa_principal", e.target.value)}
            placeholder="Queixa principal da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <textarea
            rows={5}
            value={consultationForm.hma}
            onChange={(e) => updateConsultationForm("hma", e.target.value)}
            placeholder="HMA da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <textarea
            rows={5}
            value={consultationForm.exame_fisico}
            onChange={(e) => updateConsultationForm("exame_fisico", e.target.value)}
            placeholder="Exame físico da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <textarea
            rows={4}
            value={consultationForm.hipotese_diagnostica}
            onChange={(e) =>
              updateConsultationForm("hipotese_diagnostica", e.target.value)
            }
            placeholder="Hipótese diagnóstica da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <textarea
            rows={5}
            value={consultationForm.conduta_medica}
            onChange={(e) => updateConsultationForm("conduta_medica", e.target.value)}
            placeholder="Conduta médica da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <textarea
            rows={4}
            value={consultationForm.observacoes}
            onChange={(e) => updateConsultationForm("observacoes", e.target.value)}
            placeholder="Observações da consulta"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
          />

          <input
            type="date"
            value={consultationForm.retorno_previsto_em}
            onChange={(e) => updateConsultationForm("retorno_previsto_em", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateConsultation}
            disabled={savingConsultation}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {savingConsultation ? "Salvando..." : "Salvar consulta"}
          </button>

          <button
            type="button"
            onClick={() => setConsultationForm(emptyConsultationForm)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
          >
            Limpar
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {consultations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma consulta registrada.
            </div>
          ) : (
            consultations.map((item) => {
              const editing = editingConsultationId === item.id;
              const savingItem = savingConsultationIds.includes(item.id);
              const editForm = editConsultationForms[item.id] || {
                queixa_principal: item.queixa_principal || "",
                hma: item.hma || "",
                exame_fisico: item.exame_fisico || "",
                hipotese_diagnostica: item.hipotese_diagnostica || "",
                conduta_medica: item.conduta_medica || "",
                observacoes: item.observacoes || "",
                retorno_previsto_em: item.retorno_previsto_em || "",
              };

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4"
                >
                  {!editing ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                              Consulta
                            </span>

                            {item.retorno_previsto_em ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Retorno: {formatDateOnly(item.retorno_previsto_em)}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            {item.queixa_principal || "Consulta clínica"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>

                        <CopyButton text={buildConsultationText(item)} />
                      </div>

                      <div className="mt-4 grid gap-3">
                        <InfoBlock title="HMA">{item.hma}</InfoBlock>
                        <InfoBlock title="Exame físico">{item.exame_fisico}</InfoBlock>
                        <InfoBlock title="Hipótese diagnóstica">
                          {item.hipotese_diagnostica}
                        </InfoBlock>
                        <InfoBlock title="Conduta médica">{item.conduta_medica}</InfoBlock>
                        <InfoBlock title="Observações">{item.observacoes}</InfoBlock>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditConsultation(item)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteConsultation(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4">
                        <textarea
                          rows={3}
                          value={editForm.queixa_principal}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "queixa_principal",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <textarea
                          rows={5}
                          value={editForm.hma}
                          onChange={(e) =>
                            updateEditConsultationForm(item.id, "hma", e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <textarea
                          rows={5}
                          value={editForm.exame_fisico}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "exame_fisico",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <textarea
                          rows={4}
                          value={editForm.hipotese_diagnostica}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "hipotese_diagnostica",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <textarea
                          rows={5}
                          value={editForm.conduta_medica}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "conduta_medica",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <textarea
                          rows={4}
                          value={editForm.observacoes}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "observacoes",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                        />

                        <input
                          type="date"
                          value={editForm.retorno_previsto_em}
                          onChange={(e) =>
                            updateEditConsultationForm(
                              item.id,
                              "retorno_previsto_em",
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateConsultation(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingItem ? "Salvando..." : "Salvar edição"}
                        </button>

                        <button
                          type="button"
                          onClick={() => cancelEditConsultation(item.id)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              Lista longitudinal
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Problemas do paciente
            </h2>
          </div>

          <SectionToggle
            open={showProblems}
            onToggle={() => setShowProblems((v) => !v)}
          />
        </div>

        {showProblems ? (
          <>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            value={problemForm.titulo}
            onChange={(e) => updateProblemForm("titulo", e.target.value)}
            placeholder="Título do problema"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
          <select
            value={problemForm.tipo}
            onChange={(e) => updateProblemForm("tipo", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="diagnostico">Diagnóstico</option>
            <option value="hipotese">Hipótese</option>
            <option value="comorbidade">Comorbidade</option>
            <option value="alergia">Alergia</option>
            <option value="sindrome">Síndrome</option>
            <option value="outro">Outro</option>
          </select>
          <select
            value={problemForm.status}
            onChange={(e) => updateProblemForm("status", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="ativo">Ativo</option>
            <option value="cronico">Crônico</option>
            <option value="resolvido">Resolvido</option>
            <option value="descartado">Descartado</option>
          </select>
          <input
            type="number"
            value={problemForm.prioridade}
            onChange={(e) => updateProblemForm("prioridade", e.target.value)}
            placeholder="Prioridade"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>

        <textarea
          rows={4}
          value={problemForm.observacoes}
          onChange={(e) => updateProblemForm("observacoes", e.target.value)}
          placeholder="Observações"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateProblem}
            disabled={savingProblem}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {savingProblem ? "Salvando..." : "Salvar problema"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {problems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhum problema registrado.
            </div>
          ) : (
            problems.map((item) => {
              const editing = editingProblemId === item.id;
              const savingItem = savingProblemIds.includes(item.id);
              const editForm = editProblemForms[item.id] || {
                titulo: item.titulo || "",
                tipo: item.tipo || "hipotese",
                status: item.status || "ativo",
                prioridade: item.prioridade != null ? String(item.prioridade) : "",
                observacoes: item.observacoes || "",
              };

              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {!editing ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {item.tipo}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {item.status}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.titulo}</h3>
                        </div>
                      </div>

                      {item.observacoes ? (
                        <div className="mt-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {item.observacoes}
                          </pre>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditProblem(item)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProblem(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={editForm.titulo}
                          onChange={(e) => updateEditProblemForm(item.id, "titulo", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <select
                          value={editForm.tipo}
                          onChange={(e) => updateEditProblemForm(item.id, "tipo", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        >
                          <option value="diagnostico">Diagnóstico</option>
                          <option value="hipotese">Hipótese</option>
                          <option value="comorbidade">Comorbidade</option>
                          <option value="alergia">Alergia</option>
                          <option value="sindrome">Síndrome</option>
                          <option value="outro">Outro</option>
                        </select>
                        <select
                          value={editForm.status}
                          onChange={(e) => updateEditProblemForm(item.id, "status", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="cronico">Crônico</option>
                          <option value="resolvido">Resolvido</option>
                          <option value="descartado">Descartado</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.prioridade}
                          onChange={(e) => updateEditProblemForm(item.id, "prioridade", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>

                      <textarea
                        rows={4}
                        value={editForm.observacoes}
                        onChange={(e) => updateEditProblemForm(item.id, "observacoes", e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateProblem(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingItem ? "Salvando..." : "Salvar edição"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEditProblem(item.id)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
              Seguimento
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Retornos</h2>
          </div>

          <SectionToggle
            open={showFollowups}
            onToggle={() => setShowFollowups((v) => !v)}
          />
        </div>

        {showFollowups ? (
          <>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            value={followupForm.motivo}
            onChange={(e) => updateFollowupForm("motivo", e.target.value)}
            placeholder="Motivo"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
          <select
            value={followupForm.status}
            onChange={(e) => updateFollowupForm("status", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="pendente">Pendente</option>
            <option value="realizado">Realizado</option>
            <option value="atrasado">Atrasado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input
            type="date"
            value={followupForm.retorno_previsto_em}
            onChange={(e) => updateFollowupForm("retorno_previsto_em", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
          <input
            type="date"
            value={followupForm.realizado_em}
            onChange={(e) => updateFollowupForm("realizado_em", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>

        <textarea
          rows={4}
          value={followupForm.observacoes}
          onChange={(e) => updateFollowupForm("observacoes", e.target.value)}
          placeholder="Observações"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateFollowup}
            disabled={savingFollowup}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {savingFollowup ? "Salvando..." : "Salvar retorno"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {followups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhum retorno registrado.
            </div>
          ) : (
            followups.map((item) => {
              const editing = editingFollowupId === item.id;
              const savingItem = savingFollowupIds.includes(item.id);
              const editForm = editFollowupForms[item.id] || {
                motivo: item.motivo || "",
                status: item.status || "pendente",
                retorno_previsto_em: item.retorno_previsto_em || "",
                realizado_em: item.realizado_em || "",
                observacoes: item.observacoes || "",
              };

              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {!editing ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              {item.status}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              Previsto: {formatDateOnly(item.retorno_previsto_em)}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            {item.motivo || "Retorno clínico"}
                          </h3>
                        </div>
                      </div>

                      {item.observacoes ? (
                        <div className="mt-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {item.observacoes}
                          </pre>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditFollowup(item)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFollowup(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={editForm.motivo}
                          onChange={(e) => updateEditFollowupForm(item.id, "motivo", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <select
                          value={editForm.status}
                          onChange={(e) => updateEditFollowupForm(item.id, "status", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="realizado">Realizado</option>
                          <option value="atrasado">Atrasado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <input
                          type="date"
                          value={editForm.retorno_previsto_em}
                          onChange={(e) =>
                            updateEditFollowupForm(item.id, "retorno_previsto_em", e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <input
                          type="date"
                          value={editForm.realizado_em}
                          onChange={(e) => updateEditFollowupForm(item.id, "realizado_em", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>

                      <textarea
                        rows={4}
                        value={editForm.observacoes}
                        onChange={(e) => updateEditFollowupForm(item.id, "observacoes", e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateFollowup(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingItem ? "Salvando..." : "Salvar edição"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEditFollowup(item.id)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Apoio diagnóstico
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Exames do paciente
            </h2>
          </div>

          <SectionToggle
            open={showExams}
            onToggle={() => setShowExams((v) => !v)}
          />
        </div>

        {showExams ? (
          <>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            value={examRequestForm.nome_exame}
            onChange={(e) => updateExamRequestForm("nome_exame", e.target.value)}
            placeholder="Nome do exame"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
          <select
            value={examRequestForm.status}
            onChange={(e) => updateExamRequestForm("status", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="solicitado">Solicitado</option>
            <option value="recebido">Recebido</option>
            <option value="revisado">Revisado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input
            type="date"
            value={examRequestForm.requested_at}
            onChange={(e) => updateExamRequestForm("requested_at", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
          <input
            type="date"
            value={examRequestForm.received_at}
            onChange={(e) => updateExamRequestForm("received_at", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>

        <textarea
          rows={3}
          value={examRequestForm.indicacao}
          onChange={(e) => updateExamRequestForm("indicacao", e.target.value)}
          placeholder="Indicação"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <input
          type="date"
          value={examRequestForm.reviewed_at}
          onChange={(e) => updateExamRequestForm("reviewed_at", e.target.value)}
          className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
        />

        <textarea
          rows={4}
          value={examRequestForm.resultado_resumido}
          onChange={(e) => updateExamRequestForm("resultado_resumido", e.target.value)}
          placeholder="Resultado resumido"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <textarea
          rows={4}
          value={examRequestForm.impacto_clinico}
          onChange={(e) => updateExamRequestForm("impacto_clinico", e.target.value)}
          placeholder="Impacto clínico"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateExamRequest}
            disabled={savingExamRequest}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {savingExamRequest ? "Salvando..." : "Salvar exame"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {examRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhum exame registrado.
            </div>
          ) : (
            examRequests.map((item) => {
              const editing = editingExamRequestId === item.id;
              const savingItem = savingExamRequestIds.includes(item.id);
              const editForm = editExamRequestForms[item.id] || {
                nome_exame: item.nome_exame || "",
                indicacao: item.indicacao || "",
                status: item.status || "solicitado",
                requested_at: item.requested_at ? item.requested_at.slice(0, 10) : "",
                received_at: item.received_at ? item.received_at.slice(0, 10) : "",
                reviewed_at: item.reviewed_at ? item.reviewed_at.slice(0, 10) : "",
                resultado_resumido: item.resultado_resumido || "",
                impacto_clinico: item.impacto_clinico || "",
              };

              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {!editing ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {item.status}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            {item.nome_exame}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <InfoBlock title="Indicação">{item.indicacao}</InfoBlock>
                        <InfoBlock title="Resultado resumido">{item.resultado_resumido}</InfoBlock>
                        <InfoBlock title="Impacto clínico">{item.impacto_clinico}</InfoBlock>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditExamRequest(item)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExamRequest(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={editForm.nome_exame}
                          onChange={(e) => updateEditExamRequestForm(item.id, "nome_exame", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <select
                          value={editForm.status}
                          onChange={(e) => updateEditExamRequestForm(item.id, "status", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        >
                          <option value="solicitado">Solicitado</option>
                          <option value="recebido">Recebido</option>
                          <option value="revisado">Revisado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <input
                          type="date"
                          value={editForm.requested_at}
                          onChange={(e) => updateEditExamRequestForm(item.id, "requested_at", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <input
                          type="date"
                          value={editForm.received_at}
                          onChange={(e) => updateEditExamRequestForm(item.id, "received_at", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                        <input
                          type="date"
                          value={editForm.reviewed_at}
                          onChange={(e) => updateEditExamRequestForm(item.id, "reviewed_at", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:col-span-2"
                        />
                      </div>

                      <textarea
                        rows={3}
                        value={editForm.indicacao}
                        onChange={(e) => updateEditExamRequestForm(item.id, "indicacao", e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <textarea
                        rows={4}
                        value={editForm.resultado_resumido}
                        onChange={(e) =>
                          updateEditExamRequestForm(item.id, "resultado_resumido", e.target.value)
                        }
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <textarea
                        rows={4}
                        value={editForm.impacto_clinico}
                        onChange={(e) =>
                          updateEditExamRequestForm(item.id, "impacto_clinico", e.target.value)
                        }
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateExamRequest(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingItem ? "Salvando..." : "Salvar edição"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEditExamRequest(item.id)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              Evolução clínica
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Nova evolução / anotação
            </h2>
          </div>

          <SectionToggle
            open={showNewNote}
            onToggle={() => setShowNewNote((v) => !v)}
          />
        </div>

        {showNewNote ? (
          <>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <select
            value={noteForm.tipo}
            onChange={(e) => updateNoteForm("tipo", e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="evolucao">Evolução</option>
            <option value="conduta">Conduta</option>
            <option value="retorno">Retorno</option>
            <option value="exame">Exame</option>
            <option value="observacao">Observação</option>
          </select>

          <input
            value={noteForm.titulo}
            onChange={(e) => updateNoteForm("titulo", e.target.value)}
            placeholder="Título"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>

        <textarea
          rows={8}
          value={noteForm.conteudo}
          onChange={(e) => updateNoteForm("conteudo", e.target.value)}
          placeholder="Digite a evolução clínica..."
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={savingNote}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {savingNote ? "Salvando..." : "Salvar evolução"}
          </button>

          <button
            type="button"
            onClick={() => setNoteForm(emptyNoteForm)}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
          >
            Limpar
          </button>
        </div>
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              Histórico clínico
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Evoluções / anotações
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {notes.length} {notes.length === 1 ? "item" : "itens"}
            </span>

            <SectionToggle
              open={showNotesHistory}
              onToggle={() => setShowNotesHistory((v) => !v)}
            />
          </div>
        </div>

        {showNotesHistory ? (
          <>
        {notes.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhuma evolução registrada.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {notes.map((item) => {
              const editing = editingNoteId === item.id;
              const savingItem = savingNoteIds.includes(item.id);
              const editForm = editNoteForms[item.id] || {
                tipo: item.tipo || "evolucao",
                titulo: item.titulo || "",
                conteudo: item.conteudo || "",
              };

              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {!editing ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                              {item.tipo || "evolucao"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-slate-900">
                            {item.titulo || "Evolução clínica"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>

                        <CopyButton text={buildNoteText(item)} />
                      </div>

                      <div className="mt-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
                        <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {item.conteudo}
                        </pre>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditNote(item)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          value={editForm.tipo}
                          onChange={(e) => updateEditNoteForm(item.id, "tipo", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        >
                          <option value="evolucao">Evolução</option>
                          <option value="conduta">Conduta</option>
                          <option value="retorno">Retorno</option>
                          <option value="exame">Exame</option>
                          <option value="observacao">Observação</option>
                        </select>

                        <input
                          value={editForm.titulo}
                          onChange={(e) => updateEditNoteForm(item.id, "titulo", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>

                      <textarea
                        rows={8}
                        value={editForm.conteudo}
                        onChange={(e) => updateEditNoteForm(item.id, "conteudo", e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateNote(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {savingItem ? "Salvando..." : "Salvar edição"}
                        </button>

                        <button
                          type="button"
                          onClick={() => cancelEditNote(item.id)}
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
          </>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Histórico
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Prescrições vinculadas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {prescriptions.length} {prescriptions.length === 1 ? "item" : "itens"}
            </span>

            <SectionToggle
              open={showPrescriptions}
              onToggle={() => setShowPrescriptions((v) => !v)}
            />
          </div>
        </div>

        {showPrescriptions ? (
          <>
        {prescriptions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhuma prescrição vinculada encontrada.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {prescriptions.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Prescrição
                      </span>

                      {item.via ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          Via: {item.via}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {item.medicamento || "Prescrição clínica"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <CopyButton text={buildPrescriptionText(item)} />
                </div>

                <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                  <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                    {buildPrescriptionText(item)}
                  </pre>
                </div>
              </article>
            ))}
          </div>
        )}
          </>
        ) : null}
      </section>
    </div>
  );
}