"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";
import PrescriptionTemplatesLive from "../../components/prescription-templates-live";
import ClinicalAlerts, {
  buildClinicalAlerts,
  type ClinicalAlertItem,
} from "../../components/clinical-alerts";
import { ClipboardPlus, Edit3, Lock, X } from "lucide-react";

type Prescription = {
  id: number;
  user_id?: string | null;
  patient_id: string | null;
  paciente_nome: string | null;
  medicamento: string | null;
  posologia: string | null;
  duracao: string | null;
  via: string | null;
  orientacoes: string | null;
  created_at: string;
};

type Patient = {
  id: string;
  nome: string;
  idade?: number | null;
  alergias?: string | null;
  comorbidades?: string | null;
  hpp?: string | null;
  medicamentos_em_uso?: string | null;
  gestante?: boolean | null;
  funcao_renal_alterada?: boolean | null;
  hepatopatia?: boolean | null;
  idoso_fragil?: boolean | null;
};

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
  contraindicacoes?: string | null;
  cuidados_especiais?: string | null;
  alerta_gestante?: string | null;
  alerta_idoso?: string | null;
  alerta_drc?: string | null;
  alerta_hepatopatia?: string | null;
  alerta_alergias?: string | null;
  alerta_interacoes?: string | null;
  tags_risco?: string | null;
  risk_tags?: string | null;
  condition_tags?: string | null;
  interaction_tags?: string | null;
  created_at: string;
};

type PrescriptionDraft = {
  medicamento: string;
  via: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
};

type PrescriptionForm = {
  patient_id: string;
  paciente_nome: string;
  medicamento: string;
  via: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
};

type AlertLogRecord = {
  id: number;
  user_id?: string | null;
  patient_id?: string | null;
  prescription_id?: number | null;
  template_id?: number | null;
  patient_name?: string | null;
  medication_text?: string | null;
  alert_count: number;
  high_count: number;
  medium_count: number;
  info_count: number;
  alerts_json?: ClinicalAlertItem[] | null;
  created_at: string;
};

const GUEST_EMAIL = "convidado@resibook.com";

const emptyForm: PrescriptionForm = {
  patient_id: "",
  paciente_nome: "",
  medicamento: "",
  via: "",
  posologia: "",
  duracao: "",
  orientacoes: "",
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

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getPatientLabel(item: Prescription) {
  return item.paciente_nome || "Paciente não vinculado";
}

function buildPrescriptionTextFromItem(item: Prescription) {
  const lines = [
    item.paciente_nome ? `Paciente: ${item.paciente_nome}` : "",
    item.medicamento || "Prescrição sem medicamento definido",
    item.posologia || "",
    item.via ? `Via: ${item.via}` : "",
    item.duracao ? `Duração: ${item.duracao}` : "",
    item.orientacoes ? `Orientações: ${item.orientacoes}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildPrescriptionTextFromForm(form: PrescriptionForm) {
  const lines = [
    form.paciente_nome ? `Paciente: ${form.paciente_nome}` : "",
    form.medicamento || "Prescrição sem medicamento definido",
    form.posologia || "",
    form.via ? `Via: ${form.via}` : "",
    form.duracao ? `Duração: ${form.duracao}` : "",
    form.orientacoes ? `Orientações: ${form.orientacoes}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function sanitizeText(value?: string | null) {
  return value?.trim() || "";
}

function getOwnedPatient(patientId: string, patients: Patient[]) {
  if (!patientId) return null;
  return patients.find((patient) => patient.id === patientId) || null;
}

function sanitizePrescriptionForm(
  form: PrescriptionForm,
  patients: Patient[]
): PrescriptionForm {
  const ownedPatient = getOwnedPatient(form.patient_id, patients);

  if (ownedPatient) {
    return {
      ...form,
      patient_id: ownedPatient.id,
      paciente_nome: ownedPatient.nome,
      medicamento: sanitizeText(form.medicamento),
      via: sanitizeText(form.via),
      posologia: sanitizeText(form.posologia),
      duracao: sanitizeText(form.duracao),
      orientacoes: sanitizeText(form.orientacoes),
    };
  }

  return {
    patient_id: "",
    paciente_nome: sanitizeText(form.paciente_nome),
    medicamento: sanitizeText(form.medicamento),
    via: sanitizeText(form.via),
    posologia: sanitizeText(form.posologia),
    duracao: sanitizeText(form.duracao),
    orientacoes: sanitizeText(form.orientacoes),
  };
}

function buildPayload(form: PrescriptionForm, userId: string, patients: Patient[]) {
  const sanitized = sanitizePrescriptionForm(form, patients);

  return {
    user_id: userId,
    patient_id: sanitized.patient_id || null,
    paciente_nome: sanitized.paciente_nome || null,
    medicamento: sanitized.medicamento || null,
    via: sanitized.via || null,
    posologia: sanitized.posologia || null,
    duracao: sanitized.duracao || null,
    orientacoes: sanitized.orientacoes || null,
  };
}


function matchScoreForTemplate(
  template: PrescriptionTemplate,
  draft: PrescriptionDraft
) {
  const titulo = normalize(template.titulo);
  const conteudo = normalize(template.conteudo);
  const observacoes = normalize(template.observacoes);

  let score = 0;

  if (draft.medicamento && titulo.includes(normalize(draft.medicamento))) score += 4;
  if (draft.medicamento && conteudo.includes(normalize(draft.medicamento))) score += 4;
  if (draft.via && conteudo.includes(normalize(draft.via))) score += 1;
  if (draft.posologia && conteudo.includes(normalize(draft.posologia))) score += 2;
  if (draft.duracao && conteudo.includes(normalize(draft.duracao))) score += 1;
  if (draft.orientacoes && (conteudo.includes(normalize(draft.orientacoes)) || observacoes.includes(normalize(draft.orientacoes)))) score += 1;

  return score;
}

function findMatchingTemplateFromDraft(
  draft: PrescriptionDraft,
  templates: PrescriptionTemplate[]
) {
  let best: PrescriptionTemplate | null = null;
  let bestScore = 0;

  for (const template of templates) {
    const score = matchScoreForTemplate(template, draft);
    if (score > bestScore) {
      best = template;
      bestScore = score;
    }
  }

  return bestScore >= 4 ? best : null;
}

function countAlertsByLevel(alerts: ClinicalAlertItem[]) {
  return alerts.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.level === "high") acc.high += 1;
      else if (item.level === "medium") acc.medium += 1;
      else acc.info += 1;
      return acc;
    },
    { total: 0, high: 0, medium: 0, info: 0 }
  );
}

function buildAlertReasonText(alerts: ClinicalAlertItem[]) {
  return alerts
    .map((item) => `${item.title}: ${item.message}`)
    .join("\n\n");
}

export default function PrescricaoPage() {
  const supabase = createClient();

  const [initialQuery, setInitialQuery] = useState("");
  const [urlPatientId, setUrlPatientId] = useState("");
  const [urlPacienteNome, setUrlPacienteNome] = useState("");

  const [isGuest, setIsGuest] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [selectedTemplateMeta, setSelectedTemplateMeta] =
    useState<PrescriptionTemplate | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [recentAlertLogs, setRecentAlertLogs] = useState<AlertLogRecord[]>([]);

  const [form, setForm] = useState<PrescriptionForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForms, setEditForms] = useState<Record<number, PrescriptionForm>>(
    {}
  );

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || "";
    const patientId = params.get("patient_id") || "";
    const pacienteNome = params.get("paciente_nome") || "";

    setInitialQuery(q);
    setQuery(q);
    setUrlPatientId(patientId);
    setUrlPacienteNome(pacienteNome);
  }, []);

  useEffect(() => {
    if (checkingUser) return;

    if (isGuest || !currentUserId) {
      setSelectedTemplateMeta(null);
      setForm((current) => ({
        ...current,
        patient_id: "",
        paciente_nome: "",
      }));
      return;
    }

    if (!urlPatientId && !urlPacienteNome) return;

    const ownedPatient = getOwnedPatient(urlPatientId, patients);

    if (urlPatientId && !ownedPatient) {
      setForm((current) => ({
        ...current,
        patient_id: "",
        paciente_nome: "",
      }));
      return;
    }

    if (ownedPatient) {
      setForm((current) => ({
        ...current,
        patient_id: ownedPatient.id,
        paciente_nome: ownedPatient.nome,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      patient_id: "",
      paciente_nome: sanitizeText(urlPacienteNome),
    }));
  }, [
    checkingUser,
    currentUserId,
    isGuest,
    patients,
    urlPacienteNome,
    urlPatientId,
  ]);

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      setCheckingUser(false);
      setLoading(false);
      setError(sessionError.message);
      setCurrentUserId(null);
      setIsGuest(false);
      setPatients([]);
      setPrescriptions([]);
      setTemplates([]);
      return;
    }

    const user = sessionData.session?.user;
    const email = user?.email?.trim().toLowerCase() || "";
    const userId = user?.id || null;
    const guest = email === GUEST_EMAIL;

    setCurrentUserId(userId);
    setIsGuest(guest);
    setCheckingUser(false);

    const templatesRes = await supabase
      .from("prescription_templates")
      .select(
        "id, categoria, titulo, conteudo, observacoes, source_file, contraindicacoes, cuidados_especiais, alerta_gestante, alerta_idoso, alerta_drc, alerta_hepatopatia, alerta_alergias, alerta_interacoes, tags_risco, risk_tags, condition_tags, interaction_tags, created_at"
      )
      .order("titulo", { ascending: true });

    if (templatesRes.error) {
      setTemplates([]);
      setError(templatesRes.error.message);
    } else {
      setTemplates((templatesRes.data as PrescriptionTemplate[]) || []);
    }

    if (guest || !userId) {
      setPatients([]);
      setPrescriptions([]);
      setRecentAlertLogs([]);
      setLoading(false);
      return;
    }

    const [patientsRes, prescriptionsRes, logsRes] = await Promise.all([
      supabase
        .from("patients")
        .select("id, nome, idade, alergias, comorbidades, hpp, medicamentos_em_uso, gestante, funcao_renal_alterada, hepatopatia, idoso_fragil")
        .eq("user_id", userId)
        .order("nome", { ascending: true }),

      supabase
        .from("prescriptions")
        .select(
          "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("clinical_alert_logs")
        .select(
          "id, user_id, patient_id, prescription_id, template_id, patient_name, medication_text, alert_count, high_count, medium_count, info_count, alerts_json, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    let nextError = templatesRes.error?.message || "";

    if (patientsRes.error) {
      setPatients([]);
      nextError =
        nextError || patientsRes.error.message || "Erro ao carregar pacientes.";
    } else {
      setPatients((patientsRes.data as Patient[]) || []);
    }

    if (prescriptionsRes.error) {
      setPrescriptions([]);
      nextError =
        nextError ||
        prescriptionsRes.error.message ||
        "Erro ao carregar prescrições.";
    } else {
      setPrescriptions((prescriptionsRes.data as Prescription[]) || []);
    }

    if (logsRes.error) {
      setRecentAlertLogs([]);
      nextError =
        nextError ||
        logsRes.error.message ||
        "Erro ao carregar histórico de alertas.";
    } else {
      setRecentAlertLogs((logsRes.data as unknown as AlertLogRecord[]) || []);
    }

    setError(nextError);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = prescriptions.length;
  const ultima = prescriptions[0] || null;

  const filteredPrescriptions = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) return prescriptions;

    return prescriptions.filter((item) => {
      return (
        normalize(item.paciente_nome).includes(normalizedQuery) ||
        normalize(item.medicamento).includes(normalizedQuery) ||
        normalize(item.posologia).includes(normalizedQuery) ||
        normalize(item.via).includes(normalizedQuery) ||
        normalize(item.duracao).includes(normalizedQuery) ||
        normalize(item.orientacoes).includes(normalizedQuery)
      );
    });
  }, [prescriptions, query]);

  const draftText = useMemo(() => {
    const safeForm = sanitizePrescriptionForm(form, isGuest ? [] : patients);
    return buildPrescriptionTextFromForm(safeForm);
  }, [form, isGuest, patients]);

  const selectedPatient = useMemo(() => {
    if (isGuest) return null;
    return getOwnedPatient(form.patient_id, patients) || null;
  }, [form.patient_id, isGuest, patients]);

  function updateForm<K extends keyof PrescriptionForm>(
    key: K,
    value: PrescriptionForm[K]
  ) {
    setForm((current) => {
      if (key === "patient_id") {
        const found = getOwnedPatient(String(value), patients);

        return {
          ...current,
          patient_id: found?.id || "",
          paciente_nome: found?.nome || "",
        };
      }

      if (key === "paciente_nome" && current.patient_id) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function updateEditForm<K extends keyof PrescriptionForm>(
    id: number,
    key: K,
    value: PrescriptionForm[K]
  ) {
    setEditForms((current) => {
      const base = current[id] || emptyForm;

      if (key === "patient_id") {
        const found = getOwnedPatient(String(value), patients);

        return {
          ...current,
          [id]: {
            ...base,
            patient_id: found?.id || "",
            paciente_nome: found?.nome || "",
          },
        };
      }

      if (key === "paciente_nome" && base.patient_id) {
        return current;
      }

      return {
        ...current,
        [id]: {
          ...base,
          [key]: value,
        },
      };
    });
  }

  function resetForm() {
    setSelectedTemplateMeta(null);
    setForm((current) => ({
      ...emptyForm,
      patient_id: isGuest ? "" : current.patient_id,
      paciente_nome: isGuest ? "" : current.paciente_nome,
    }));
  }

  function openCreateDrawer() {
    if (isGuest) {
      setError("Usuário convidado não pode salvar prescrições.");
      return;
    }

    setDrawerOpen(true);
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleUseTemplate(draft: PrescriptionDraft) {
    const matchedTemplate = findMatchingTemplateFromDraft(draft, templates);
    setSelectedTemplateMeta(matchedTemplate);

    setForm((current) => ({
      ...current,
      medicamento: draft.medicamento || "",
      via: draft.via || "",
      posologia: draft.posologia || "",
      duracao: draft.duracao || "",
      orientacoes: draft.orientacoes || "",
    }));

    if (!isGuest) {
      setDrawerOpen(true);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEdit(item: Prescription) {
    setSelectedTemplateMeta(null);
    setEditingId(item.id);
    setEditForms((current) => ({
      ...current,
      [item.id]: sanitizePrescriptionForm(
        {
          patient_id: item.patient_id || "",
          paciente_nome: item.paciente_nome || "",
          medicamento: item.medicamento || "",
          via: item.via || "",
          posologia: item.posologia || "",
          duracao: item.duracao || "",
          orientacoes: item.orientacoes || "",
        },
        patients
      ),
    }));
  }

  function cancelEdit(id: number) {
    setEditingId((current) => (current === id ? null : current));
    setEditForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function saveAlertLog(params: {
    userId: string;
    prescriptionId?: number | null;
    patient?: Patient | null;
    template?: PrescriptionTemplate | null;
    medicationText: string;
    alerts: ClinicalAlertItem[];
  }) {
    if (!params.userId || params.alerts.length === 0) return;

    const counts = countAlertsByLevel(params.alerts);

    const payload = {
      user_id: params.userId,
      patient_id: params.patient?.id || null,
      prescription_id: params.prescriptionId || null,
      template_id: params.template?.id || null,
      patient_name: params.patient?.nome || null,
      medication_text: params.medicationText || null,
      alert_count: counts.total,
      high_count: counts.high,
      medium_count: counts.medium,
      info_count: counts.info,
      alerts_json: params.alerts,
    };

    const { data, error } = await supabase
      .from("clinical_alert_logs")
      .insert(payload)
      .select(
        "id, patient_id, prescription_id, template_id, patient_name, medication_text, alert_count, high_count, medium_count, info_count, alerts_json, created_at"
      )
      .single();

    if (!error && data) {
      setRecentAlertLogs((current) => [data as unknown as AlertLogRecord, ...current].slice(0, 8));
    }
  }

  async function handleCreate() {
    if (isGuest) {
      setError("Usuário convidado não pode salvar prescrições.");
      return;
    }

    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const safeForm = sanitizePrescriptionForm(form, patients);

    if (
      !safeForm.medicamento &&
      !safeForm.posologia &&
      !safeForm.orientacoes
    ) {
      setError("Preencha pelo menos medicamento, posologia ou orientações.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("prescriptions")
      .insert(buildPayload(safeForm, currentUserId, patients))
      .select(
        "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      const currentPatient = getOwnedPatient(safeForm.patient_id, patients);
      const currentAlerts = buildClinicalAlerts(
        currentPatient,
        buildPrescriptionTextFromForm(safeForm),
        selectedTemplateMeta
      );

      setPrescriptions((current) => [data as Prescription, ...current]);

      await saveAlertLog({
        userId: currentUserId,
        prescriptionId: (data as Prescription).id,
        patient: currentPatient,
        template: selectedTemplateMeta,
        medicationText: buildPrescriptionTextFromForm(safeForm),
        alerts: currentAlerts,
      });

      setForm((current) => ({
        ...emptyForm,
        patient_id: current.patient_id,
        paciente_nome: current.paciente_nome,
      }));
      setSuccess(
        currentAlerts.length > 0
          ? "Prescrição salva com sucesso e alertas registrados no histórico."
          : "Prescrição salva com sucesso."
      );
      setDrawerOpen(false);
    }

    setSaving(false);
  }

  async function handleUpdate(id: number) {
    if (isGuest) return;

    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const editForm = editForms[id];

    if (!editForm) {
      setError("Formulário de edição não encontrado.");
      return;
    }

    const safeEditForm = sanitizePrescriptionForm(editForm, patients);

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { data, error } = await supabase
      .from("prescriptions")
      .update(buildPayload(safeEditForm, currentUserId, patients))
      .eq("id", id)
      .eq("user_id", currentUserId)
      .select(
        "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      const currentPatient = getOwnedPatient(safeEditForm.patient_id, patients);
      const currentAlerts = buildClinicalAlerts(
        currentPatient,
        buildPrescriptionTextFromForm(safeEditForm),
        null
      );

      setPrescriptions((current) =>
        current.map((item) => (item.id === id ? (data as Prescription) : item))
      );

      await saveAlertLog({
        userId: currentUserId,
        prescriptionId: id,
        patient: currentPatient,
        template: null,
        medicationText: buildPrescriptionTextFromForm(safeEditForm),
        alerts: currentAlerts,
      });

      setSuccess(
        currentAlerts.length > 0
          ? "Prescrição atualizada com sucesso e alertas registrados no histórico."
          : "Prescrição atualizada com sucesso."
      );
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  async function handleDelete(id: number) {
    if (isGuest) return;

    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar esta prescrição?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      setError(error.message);
    } else {
      setPrescriptions((current) => current.filter((item) => item.id !== id));
      setSuccess("Prescrição apagada com sucesso.");
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  const patientLinkedLabel = !isGuest && form.patient_id
    ? getOwnedPatient(form.patient_id, patients)?.nome || form.paciente_nome
    : "";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Prescrição
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Prescrição clínica
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              {isGuest
                ? "Modo convidado: use os modelos compartilhados ou monte uma prescrição para copiar. O salvamento no banco está bloqueado."
                : "Registro médico com histórico privado do usuário logado e modelos prontos compartilhados."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {isGuest ? "Modo convidado" : `${total} ${total === 1 ? "item" : "itens"}`}
            </div>

            {!isGuest ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                <ClipboardPlus className="h-4 w-4" />
                Nova prescrição
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        {isGuest ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Acesso convidado: você pode consultar e copiar modelos de
            <span className="mx-1">prescription_templates</span>
            e montar um rascunho local, mas não pode salvar, editar, apagar ou
            acessar dados privados de pacientes e prescrições.
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Modelos e uso rápido
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use um modelo pronto e, se quiser, abra o cadastro para salvar
                  no seu histórico.
                </p>
              </div>

              {!isGuest ? (
                <a
                  href="#lista-prescricoes"
                  className="text-sm font-semibold text-blue-700"
                >
                  Ver histórico salvo
                </a>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Biblioteca compartilhada
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {templates.length} modelos prontos vindos de
                <span className="mx-1 font-semibold">prescription_templates</span>
                para consultar, copiar e aplicar no formulário.
              </p>

              {!isGuest ? (
                <button
                  type="button"
                  onClick={openCreateDrawer}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-5 text-sm font-semibold text-blue-700"
                >
                  Abrir cadastro de prescrição
                </button>
              ) : null}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Resumo rápido
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {isGuest ? "Modo atual" : "Prescrições salvas"}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {isGuest ? "Guest" : total}
                </p>
              </div>

              {!isGuest ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Último registro
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {ultima?.medicamento || "Nenhum registro"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {ultima ? formatDate(ultima.created_at) : "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Paciente do último item
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {ultima ? getPatientLabel(ultima) : "-"}
                    </p>
                  </div>

                  {patientLinkedLabel ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Paciente selecionado
                      </p>
                      <p className="mt-2 text-sm font-medium text-emerald-900">
                        {patientLinkedLabel}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Salvamento bloqueado
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    O convidado pode copiar prescrições e consultar a biblioteca
                    compartilhada, mas não altera o banco de dados.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <PrescriptionTemplatesLive
        templates={templates}
        onUseTemplate={handleUseTemplate}
        initialQuery={initialQuery}
      />

      {!isGuest ? (
        <section
          id="lista-prescricoes"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Prescrições salvas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Histórico privado do usuário logado.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-sm font-medium text-slate-400">
                {filteredPrescriptions.length} de {total} registros
              </span>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar prescrição..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none md:w-72"
              />
            </div>
          </div>

          {loading || checkingUser ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Carregando prescrições...
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma prescrição encontrada para este usuário.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((item) => {
                const editing = editingId === item.id;
                const savingItem = savingIds.includes(item.id);
                const editForm =
                  editForms[item.id] ||
                  sanitizePrescriptionForm(
                    {
                      patient_id: item.patient_id || "",
                      paciente_nome: item.paciente_nome || "",
                      medicamento: item.medicamento || "",
                      via: item.via || "",
                      posologia: item.posologia || "",
                      duracao: item.duracao || "",
                      orientacoes: item.orientacoes || "",
                    },
                    patients
                  );

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Prescrição
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            Privada
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                          {item.medicamento || "Prescrição clínica"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {getPatientLabel(item)} • {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <CopyButton text={buildPrescriptionTextFromItem(item)} />
                      </div>
                    </div>

                    {item.orientacoes ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                          Observações
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {item.orientacoes}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                      <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                        {buildPrescriptionTextFromItem(item)}
                      </pre>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      {!editing ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                          >
                            <Edit3 className="h-4 w-4" />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={savingItem}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingItem ? "Apagando..." : "Apagar"}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-900">
                              Editando prescrição
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Altere os campos abaixo e salve.
                            </p>
                          </div>

                          <ClinicalAlerts
                            patient={getOwnedPatient(editForm.patient_id, patients)}
                            medicationText={buildPrescriptionTextFromForm(editForm)}
                            className="mb-4"
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Paciente vinculado
                              </label>
                              <select
                                value={editForm.patient_id}
                                onChange={(e) =>
                                  updateEditForm(
                                    item.id,
                                    "patient_id",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                              >
                                <option value="">
                                  Selecionar paciente (opcional)
                                </option>
                                {patients.map((patient) => (
                                  <option key={patient.id} value={patient.id}>
                                    {patient.nome}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Nome do paciente
                              </label>
                              <input
                                value={editForm.paciente_nome}
                                onChange={(e) =>
                                  updateEditForm(
                                    item.id,
                                    "paciente_nome",
                                    e.target.value
                                  )
                                }
                                readOnly={Boolean(editForm.patient_id)}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none read-only:bg-slate-100"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Medicamento
                              </label>
                              <input
                                value={editForm.medicamento}
                                onChange={(e) =>
                                  updateEditForm(
                                    item.id,
                                    "medicamento",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Via
                              </label>
                              <input
                                value={editForm.via}
                                onChange={(e) =>
                                  updateEditForm(item.id, "via", e.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Posologia
                              </label>
                              <input
                                value={editForm.posologia}
                                onChange={(e) =>
                                  updateEditForm(
                                    item.id,
                                    "posologia",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Duração
                              </label>
                              <input
                                value={editForm.duracao}
                                onChange={(e) =>
                                  updateEditForm(
                                    item.id,
                                    "duracao",
                                    e.target.value
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Orientações
                            </label>
                            <textarea
                              rows={5}
                              value={editForm.orientacoes}
                              onChange={(e) =>
                                updateEditForm(
                                  item.id,
                                  "orientacoes",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                            />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdate(item.id)}
                              disabled={savingItem}
                              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingItem ? "Salvando..." : "Salvar edição"}
                            </button>

                            <button
                              type="button"
                              onClick={() => cancelEdit(item.id)}
                              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {drawerOpen && !isGuest ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Nova prescrição
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cadastro em painel separado para deixar a listagem e os
                  modelos mais limpos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              {patientLinkedLabel ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Usar modelo no paciente
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-900">
                    {patientLinkedLabel}
                  </p>
                </div>
              ) : null}

              <ClinicalAlerts
                patient={selectedPatient}
                medicationText={draftText}
                templateMeta={selectedTemplateMeta}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Paciente vinculado
                  </label>

                  <select
                    value={form.patient_id}
                    onChange={(e) => updateForm("patient_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                  >
                    <option value="">Selecionar paciente (opcional)</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nome do paciente
                  </label>
                  <input
                    value={form.paciente_nome}
                    onChange={(e) => updateForm("paciente_nome", e.target.value)}
                    readOnly={Boolean(form.patient_id)}
                    placeholder="Opcional para prescrição sem vínculo"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none read-only:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Medicamento
                  </label>
                  <input
                    value={form.medicamento}
                    onChange={(e) => updateForm("medicamento", e.target.value)}
                    placeholder="Ex.: Dipirona 500 mg"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Via
                  </label>
                  <input
                    value={form.via}
                    onChange={(e) => updateForm("via", e.target.value)}
                    placeholder="Ex.: IV"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Posologia
                  </label>
                  <input
                    value={form.posologia}
                    onChange={(e) => updateForm("posologia", e.target.value)}
                    placeholder="Ex.: 12/12h"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Duração
                  </label>
                  <input
                    value={form.duracao}
                    onChange={(e) => updateForm("duracao", e.target.value)}
                    placeholder="Ex.: 7 dias"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Orientações
                </label>
                <textarea
                  rows={6}
                  value={form.orientacoes}
                  onChange={(e) => updateForm("orientacoes", e.target.value)}
                  placeholder="Digite aqui as orientações da prescrição..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Prévia
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-7 text-slate-800">
                  {draftText}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                >
                  Limpar formulário
                </button>

                <div className="flex flex-wrap gap-3">
                  <CopyButton text={draftText} />

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : "Salvar prescrição"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

      {!isGuest ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Auditoria clínica
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Histórico recente de alertas exibidos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Registra os alertas mostrados quando você salva ou atualiza uma prescrição.
              </p>
            </div>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {recentAlertLogs.length} registro(s) recente(s)
            </span>
          </div>

          {recentAlertLogs.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Nenhum alerta foi registrado ainda. Salve uma prescrição com alertas para começar o histórico.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentAlertLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {log.patient_name || "Paciente não identificado"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {formatDate(log.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {log.alert_count} alerta(s)
                      </span>
                      {log.high_count > 0 ? (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          {log.high_count} alto risco
                        </span>
                      ) : null}
                      {log.medium_count > 0 ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {log.medium_count} cautela
                        </span>
                      ) : null}
                      {log.info_count > 0 ? (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {log.info_count} lembrete
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Prescrição analisada
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {log.medication_text || "Sem texto salvo."}
                    </p>
                  </div>

                  {Array.isArray(log.alerts_json) && log.alerts_json.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {log.alerts_json.map((alert, index) => (
                        <div
                          key={`${log.id}-${alert.id}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {alert.title}
                            </p>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                              {alert.level === "high"
                                ? "alto risco"
                                : alert.level === "medium"
                                ? "cautela"
                                : "lembrete"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

}