"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../../components/copy-button";

type Patient = {
  id: string;
  user_id?: string | null;
  nome: string;
  idade?: number | null;
  sexo?: string | null;
  telefone?: string | null;
  especialidade?: string | null;
  plano_saude?: string | null;
  carteirinha?: string | null;
  data_nascimento?: string | null;
  queixa?: string | null;
  hma?: string | null;
  hpp?: string | null;
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

type NoteForm = {
  tipo: string;
  titulo: string;
  conteudo: string;
};

const emptyNoteForm: NoteForm = {
  tipo: "evolucao",
  titulo: "",
  conteudo: "",
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

function calculateAgeFromDate(date: Date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
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

function buildPatientSummary(
  patient: Patient,
  prescriptions: Prescription[],
  notes: PatientNote[]
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
    patient.carteirinha ? `CARTEIRINHA: ${patient.carteirinha}` : "",
    returnDate ? `RETORNO PREVISTO: ${formatDateOnly(returnDate)}` : "",
    patient.queixa ? `QUEIXA PRINCIPAL:\n${patient.queixa}` : "",
    patient.hma ? `HMA:\n${patient.hma}` : "",
    patient.hpp ? `HPP:\n${patient.hpp}` : "",
    patient.medicamentos_em_uso
      ? `MEDICAMENTOS EM USO:\n${patient.medicamentos_em_uso}`
      : "",
    patient.exame_fisico ? `EXAME FÍSICO:\n${patient.exame_fisico}` : "",
    patient.hipotese_diagnostica
      ? `HIPÓTESE DIAGNÓSTICA:\n${patient.hipotese_diagnostica}`
      : "",
    patient.conduta_medica
      ? `CONDUTA MÉDICA:\n${patient.conduta_medica}`
      : "",
    patient.observacoes ? `OBSERVAÇÕES:\n${patient.observacoes}` : "",
  ].filter(Boolean);

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

  return [...sections, ...noteText, ...prescriptionText].join("\n\n");
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

function buildProfessionalPrintHtml(
  patient: Patient,
  prescriptions: Prescription[],
  notes: PatientNote[]
) {
  const { birthDate, returnDate } = resolveBirthAndReturnDates(patient);

  const noteHtml = notes.length
    ? notes
        .map(
          (item, index) => `
            <div class="timeline-item">
              <div class="timeline-index">${index + 1}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <strong>${escapeHtml(
                    item.titulo || "Evolução clínica"
                  )}</strong>
                  <span>${escapeHtml(item.tipo || "evolucao")} • ${escapeHtml(
            formatDate(item.created_at)
          )}</span>
                </div>
                <div class="timeline-text">${textToHtml(item.conteudo)}</div>
              </div>
            </div>
          `
        )
        .join("")
    : `<p class="empty">Sem evoluções registradas.</p>`;

  const prescriptionHtml = prescriptions.length
    ? prescriptions
        .map(
          (item, index) => `
            <div class="rx-card">
              <div class="rx-top">
                <strong>Prescrição ${index + 1}</strong>
                <span>${escapeHtml(formatDate(item.created_at))}</span>
              </div>
              <div class="rx-body">${textToHtml(buildPrescriptionText(item))}</div>
            </div>
          `
        )
        .join("")
    : `<p class="empty">Sem prescrições vinculadas.</p>`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Prontuário - ${escapeHtml(patient.nome || "Paciente")}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #f3f6fb;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            padding: 18px;
          }

          .sheet {
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
          }

          .topbar {
            background: linear-gradient(135deg, #0b1f52 0%, #12398b 100%);
            color: #ffffff;
            padding: 22px 28px;
          }

          .brand-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .brand-left h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.12em;
            font-weight: 800;
          }

          .brand-left p {
            margin: 6px 0 0 0;
            font-size: 12px;
            opacity: 0.88;
          }

          .doc-meta {
            text-align: right;
            font-size: 12px;
            line-height: 1.6;
            opacity: 0.95;
          }

          .patient-banner {
            padding: 22px 28px;
            border-bottom: 1px solid #e7edf5;
            background: #f8fbff;
          }

          .patient-banner h2 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            color: #0b1f52;
          }

          .patient-banner p {
            margin: 8px 0 0 0;
            color: #475569;
            font-size: 13px;
          }

          .content {
            padding: 24px 28px 30px;
          }

          .section {
            margin-bottom: 20px;
            border: 1px solid #e6edf5;
            border-radius: 14px;
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .section-title {
            background: #f8fafc;
            border-bottom: 1px solid #e6edf5;
            padding: 11px 16px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.14em;
            color: #0b1f52;
            text-transform: uppercase;
          }

          .section-body {
            padding: 16px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 20px;
          }

          .field {
            min-height: 42px;
          }

          .field-label {
            display: block;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 5px;
          }

          .field-value {
            font-size: 14px;
            line-height: 1.55;
            color: #0f172a;
            font-weight: 600;
          }

          .rich-text {
            font-size: 14px;
            line-height: 1.75;
            color: #1e293b;
            white-space: normal;
          }

          .timeline-item {
            display: flex;
            gap: 14px;
            padding: 14px 0;
            border-bottom: 1px solid #eef2f7;
          }

          .timeline-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .timeline-index {
            width: 28px;
            height: 28px;
            min-width: 28px;
            border-radius: 999px;
            background: #dbeafe;
            color: #1d4ed8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            margin-top: 2px;
          }

          .timeline-content {
            flex: 1;
          }

          .timeline-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 8px;
          }

          .timeline-header strong {
            font-size: 14px;
            color: #0f172a;
          }

          .timeline-header span {
            font-size: 12px;
            color: #64748b;
          }

          .timeline-text {
            font-size: 14px;
            line-height: 1.75;
            color: #1e293b;
          }

          .rx-card {
            border: 1px solid #e6edf5;
            background: #fbfdff;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 12px;
          }

          .rx-card:last-child {
            margin-bottom: 0;
          }

          .rx-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
          }

          .rx-top strong {
            font-size: 14px;
            color: #0b1f52;
          }

          .rx-top span {
            font-size: 12px;
            color: #64748b;
          }

          .rx-body {
            background: #ffffff;
            border: 1px solid #ebf0f6;
            border-radius: 10px;
            padding: 12px;
            font-size: 14px;
            line-height: 1.7;
            color: #1e293b;
          }

          .signature-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px;
            margin-top: 28px;
            padding-top: 18px;
          }

          .signature-box {
            text-align: center;
            font-size: 12px;
            color: #475569;
          }

          .signature-line {
            border-top: 1px solid #334155;
            margin-bottom: 8px;
            height: 1px;
          }

          .footer {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid #e6edf5;
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: 11px;
            color: #64748b;
          }

          .empty {
            color: #94a3b8;
            font-style: italic;
          }

          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }

            .sheet {
              max-width: none;
              box-shadow: none;
              border: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="topbar">
            <div class="brand-line">
              <div class="brand-left">
                <h1>RESIBOOK</h1>
                <p>Prontuário clínico ambulatorial</p>
              </div>

              <div class="doc-meta">
                <div><strong>Documento:</strong> Prontuário médico</div>
                <div><strong>Emitido em:</strong> ${escapeHtml(
                  formatDate(new Date().toISOString())
                )}</div>
              </div>
            </div>
          </div>

          <div class="patient-banner">
            <h2>${escapeHtml(patient.nome || "Paciente")}</h2>
            <p>
              ${escapeHtml(patient.especialidade || "Sem especialidade")}
              ${
                typeof patient.idade === "number"
                  ? ` • ${escapeHtml(String(patient.idade))} anos`
                  : ""
              }
              ${patient.sexo ? ` • ${escapeHtml(patient.sexo)}` : ""}
            </p>
          </div>

          <div class="content">
            <div class="section">
              <div class="section-title">1. Dados cadastrais</div>
              <div class="section-body">
                <div class="grid">
                  <div class="field">
                    <span class="field-label">Nome</span>
                    <div class="field-value">${escapeHtml(patient.nome || "-")}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Idade</span>
                    <div class="field-value">${
                      typeof patient.idade === "number"
                        ? `${escapeHtml(String(patient.idade))} anos`
                        : "-"
                    }</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Sexo</span>
                    <div class="field-value">${escapeHtml(patient.sexo || "-")}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Telefone</span>
                    <div class="field-value">${escapeHtml(
                      patient.telefone || "-"
                    )}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Especialidade</span>
                    <div class="field-value">${escapeHtml(
                      patient.especialidade || "-"
                    )}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Cadastro</span>
                    <div class="field-value">${escapeHtml(
                      formatDate(patient.created_at)
                    )}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Plano de saúde</span>
                    <div class="field-value">${escapeHtml(
                      patient.plano_saude || "-"
                    )}</div>
                  </div>

                  <div class="field">
                    <span class="field-label">Carteirinha</span>
                    <div class="field-value">${escapeHtml(
                      patient.carteirinha || "-"
                    )}</div>
                  </div>

                  ${
                    birthDate
                      ? `
                    <div class="field">
                      <span class="field-label">Data de nascimento</span>
                      <div class="field-value">${escapeHtml(
                        formatDateOnly(birthDate)
                      )}</div>
                    </div>
                  `
                      : ""
                  }

                  ${
                    returnDate
                      ? `
                    <div class="field">
                      <span class="field-label">Retorno previsto</span>
                      <div class="field-value">${escapeHtml(
                        formatDateOnly(returnDate)
                      )}</div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">2. Queixa principal</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(patient.queixa)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">3. HMA — História da moléstia atual</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(patient.hma)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">4. HPP — História patológica pregressa</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(patient.hpp)}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">5. Medicamentos em uso</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(
                  patient.medicamentos_em_uso
                )}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">6. Exame físico / exame do estado mental</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(
                  patient.exame_fisico
                )}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">7. Hipótese diagnóstica</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(
                  patient.hipotese_diagnostica
                )}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">8. Conduta médica</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(
                  patient.conduta_medica
                )}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">9. Observações</div>
              <div class="section-body">
                <div class="rich-text">${textToHtml(
                  patient.observacoes
                )}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">10. Evoluções / anotações</div>
              <div class="section-body">
                ${noteHtml}
              </div>
            </div>

            <div class="section">
              <div class="section-title">11. Prescrições vinculadas</div>
              <div class="section-body">
                ${prescriptionHtml}
              </div>
            </div>

            <div class="signature-grid">
              <div class="signature-box">
                <div class="signature-line"></div>
                Assinatura / carimbo
              </div>

              <div class="signature-box">
                <div class="signature-line"></div>
                Data
              </div>
            </div>

            <div class="footer">
              <div>ResiBook • Prontuário clínico</div>
              <div>${escapeHtml(patient.nome || "Paciente")}</div>
            </div>
          </div>
        </div>
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

  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [savingNoteIds, setSavingNoteIds] = useState<number[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [editNoteForms, setEditNoteForms] = useState<Record<number, NoteForm>>(
    {}
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    const [notesRes, byIdRes, byNameRes] = await Promise.all([
      notesPromise,
      byIdPromise,
      byNamePromise,
    ]);

    if (notesRes.error) {
      console.warn("Erro ao buscar evoluções:", notesRes.error.message);
      setNotes([]);
    } else {
      setNotes((notesRes.data as PatientNote[]) || []);
    }

    if (byIdRes.error) {
      console.warn("Erro ao buscar prescrições por ID:", byIdRes.error.message);
    }

    if (byNameRes.error) {
      console.warn(
        "Erro ao buscar prescrições por nome:",
        byNameRes.error.message
      );
    }

    const mergedMap = new Map<number, Prescription>();

    ((byIdRes.data as Prescription[]) || []).forEach((item) => {
      mergedMap.set(item.id, item);
    });

    ((byNameRes.data as Prescription[]) || []).forEach((item) => {
      mergedMap.set(item.id, item);
    });

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

  function updateNoteForm<K extends keyof NoteForm>(
    key: K,
    value: NoteForm[K]
  ) {
    setNoteForm((current) => ({ ...current, [key]: value }));
  }

  function updateEditNoteForm<K extends keyof NoteForm>(
    id: number,
    key: K,
    value: NoteForm[K]
  ) {
    setEditNoteForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] || emptyNoteForm),
        [key]: value,
      },
    }));
  }

  async function handleCreateNote() {
    if (!patient || !currentUserId) {
      setError("Usuário autenticado ou paciente não identificado.");
      return;
    }

    if (!noteForm.conteudo.trim()) {
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

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes((current) => [data as PatientNote, ...current]);
      setNoteForm(emptyNoteForm);
      setSuccess("Evolução salva com sucesso.");
    }

    setSavingNote(false);
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

  function cancelEditNote(id: number) {
    setEditingNoteId(null);
    setEditNoteForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function handleUpdateNote(id: number) {
    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const form = editNoteForms[id];

    if (!form) {
      setError("Formulário de edição não encontrado.");
      return;
    }

    if (!form.conteudo.trim()) {
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

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes((current) =>
        current.map((item) => (item.id === id ? (data as PatientNote) : item))
      );
      cancelEditNote(id);
      setSuccess("Evolução atualizada com sucesso.");
    }

    setSavingNoteIds((current) => current.filter((item) => item !== id));
  }

  async function handleDeleteNote(id: number) {
    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar esta evolução?"
    );

    if (!confirmed) return;

    setSavingNoteIds((current) => [...current, id]);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patient_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      setError(error.message);
    } else {
      setNotes((current) => current.filter((item) => item.id !== id));
      cancelEditNote(id);
      setSuccess("Evolução apagada com sucesso.");
    }

    setSavingNoteIds((current) => current.filter((item) => item !== id));
  }

  function handlePrintProfessional() {
    if (!patient) return;

    const html = buildProfessionalPrintHtml(patient, prescriptions, notes);
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
                {typeof patient.idade === "number"
                  ? ` • ${patient.idade} anos`
                  : ""}
                {patient.telefone ? ` • ${patient.telefone}` : ""}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-400">
                Cadastro: {formatDate(patient.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <CopyButton
                text={buildPatientSummary(patient, prescriptions, notes)}
              />

              <button
                type="button"
                onClick={handlePrintProfessional}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                Imprimir / Exportar
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

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <InfoBlock title="Queixa principal">{patient.queixa}</InfoBlock>
          <InfoBlock title="HMA">{patient.hma}</InfoBlock>
          <InfoBlock title="HPP">{patient.hpp}</InfoBlock>
          <InfoBlock title="Medicamentos em uso">
            {patient.medicamentos_em_uso}
          </InfoBlock>
          <InfoBlock title="Exame físico / estado mental">
            {patient.exame_fisico}
          </InfoBlock>
          <InfoBlock title="Hipótese diagnóstica">
            {patient.hipotese_diagnostica}
          </InfoBlock>
          <InfoBlock title="Conduta médica">{patient.conduta_medica}</InfoBlock>
          <InfoBlock title="Observações">{patient.observacoes}</InfoBlock>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
            Evolução clínica
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Nova evolução / anotação
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Registre evolução, conduta, retorno, hipótese diagnóstica ou observação clínica.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tipo
            </label>
            <select
              value={noteForm.tipo}
              onChange={(e) => updateNoteForm("tipo", e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="evolucao">Evolução</option>
              <option value="conduta">Conduta</option>
              <option value="retorno">Retorno</option>
              <option value="exame">Exame</option>
              <option value="observacao">Observação</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              value={noteForm.titulo}
              onChange={(e) => updateNoteForm("titulo", e.target.value)}
              placeholder="Ex.: Evolução de hoje, retorno em 30 dias..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Conteúdo
          </label>
          <textarea
            rows={8}
            value={noteForm.conteudo}
            onChange={(e) => updateNoteForm("conteudo", e.target.value)}
            placeholder="Digite a evolução clínica..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={savingNote}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="mt-1 text-sm text-slate-500">
              Evoluções vinculadas diretamente ao prontuário do paciente.
            </p>
          </div>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {notes.length} {notes.length === 1 ? "item" : "itens"}
          </span>
        </div>

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
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
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
                          className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Editando evolução
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Altere os campos abaixo e salve.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <select
                          value={editForm.tipo}
                          onChange={(e) =>
                            updateEditNoteForm(item.id, "tipo", e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        >
                          <option value="evolucao">Evolução</option>
                          <option value="conduta">Conduta</option>
                          <option value="retorno">Retorno</option>
                          <option value="exame">Exame</option>
                          <option value="observacao">Observação</option>
                        </select>

                        <input
                          value={editForm.titulo}
                          onChange={(e) =>
                            updateEditNoteForm(item.id, "titulo", e.target.value)
                          }
                          placeholder="Título"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <textarea
                        rows={8}
                        value={editForm.conteudo}
                        onChange={(e) =>
                          updateEditNoteForm(item.id, "conteudo", e.target.value)
                        }
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateNote(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
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
            <p className="mt-1 text-sm text-slate-500">
              Busca por paciente vinculado ou pelo nome salvo na prescrição.
            </p>
          </div>

          <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {prescriptions.length}{" "}
            {prescriptions.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhuma prescrição vinculada encontrada.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {prescriptions.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
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
      </section>
    </div>
  );
}