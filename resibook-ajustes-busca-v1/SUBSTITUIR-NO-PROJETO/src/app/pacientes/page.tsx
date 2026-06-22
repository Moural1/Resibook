"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";
import ModulePageHeader from "../../components/module-page-header";
import { rankSearchResults } from "@/lib/search";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  IdCard,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

type Patient = {
  id: string;
  user_id?: string | null;
  nome: string;
  idade: number | null;
  sexo: string | null;
  telefone: string | null;
  especialidade: string | null;
  plano_saude: string | null;
  numero_carteirinha: string | null;
  data_nascimento: string | null;
  crm_medico: string | null;
  local_atendimento: string | null;
  queixa: string | null;
  queixa_principal: string | null;
  hma: string | null;
  hpp: string | null;
  alergias: string | null;
  comorbidades: string | null;
  gestante: boolean | null;
  funcao_renal_alterada: boolean | null;
  hepatopatia: boolean | null;
  idoso_fragil: boolean | null;
  diabetes: boolean | null;
  epilepsia: boolean | null;
  asma: boolean | null;
  gastrite_ulcera: boolean | null;
  insuficiencia_cardiaca: boolean | null;
  arritmia_qt_longo: boolean | null;
  uso_anticoagulante: boolean | null;
  uso_isrs: boolean | null;
  uso_sedativos: boolean | null;
  diagnostico_principal: string | null;
  hipotese_diagnostica: string | null;
  medicamentos_em_uso: string | null;
  exame_fisico: string | null;
  conduta_medica: string | null;
  observacoes: string | null;
  retorno_previsto_em: string | null;
  created_at: string | null;
};

type PatientForm = {
  nome: string;
  idade: string;
  sexo: string;
  telefone: string;
  especialidade: string;
  plano_saude: string;
  numero_carteirinha: string;
  data_nascimento: string;
  crm_medico: string;
  local_atendimento: string;
  queixa_principal: string;
  hma: string;
  hpp: string;
  alergias: string;
  comorbidades: string;
  gestante: boolean;
  funcao_renal_alterada: boolean;
  hepatopatia: boolean;
  idoso_fragil: boolean;
  diabetes: boolean;
  epilepsia: boolean;
  asma: boolean;
  gastrite_ulcera: boolean;
  insuficiencia_cardiaca: boolean;
  arritmia_qt_longo: boolean;
  uso_anticoagulante: boolean;
  uso_isrs: boolean;
  uso_sedativos: boolean;
  medicamentos_em_uso: string;
  exame_fisico: string;
  hipotese_diagnostica: string;
  conduta_medica: string;
  observacoes: string;
  retorno_previsto_em: string;
};

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string | null;
  sexo: string | null;
  conteudo: string | null;
  arquivo_origem?: string | null;
  source_file?: string | null;
};

const emptyForm: PatientForm = {
  nome: "",
  idade: "",
  sexo: "",
  telefone: "",
  especialidade: "",
  plano_saude: "",
  numero_carteirinha: "",
  data_nascimento: "",
  crm_medico: "",
  local_atendimento: "",
  queixa_principal: "",
  hma: "",
  hpp: "",
  alergias: "",
  comorbidades: "",
  gestante: false,
  funcao_renal_alterada: false,
  hepatopatia: false,
  idoso_fragil: false,
  diabetes: false,
  epilepsia: false,
  asma: false,
  gastrite_ulcera: false,
  insuficiencia_cardiaca: false,
  arritmia_qt_longo: false,
  uso_anticoagulante: false,
  uso_isrs: false,
  uso_sedativos: false,
  medicamentos_em_uso: "",
  exame_fisico: "",
  hipotese_diagnostica: "",
  conduta_medica: "",
  observacoes: "",
  retorno_previsto_em: "",
};

function normalize(value?: string | number | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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

function getQueixa(patient: Patient) {
  return patient.queixa_principal || patient.queixa || "";
}

function getHipotese(patient: Patient) {
  return patient.hipotese_diagnostica || patient.diagnostico_principal || "";
}

function buildAlergiaResumo(value?: string | null) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (clean.length <= 52) return clean;
  return `${clean.slice(0, 52)}...`;
}

function getRiskFlags(patient: Patient) {
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

function hasRiskFlags(patient: Patient) {
  return Boolean(patient.alergias || getRiskFlags(patient).length > 0);
}

function patientToForm(patient: Patient): PatientForm {
  return {
    nome: patient.nome || "",
    idade:
      typeof patient.idade === "number" && Number.isFinite(patient.idade)
        ? String(patient.idade)
        : "",
    sexo: patient.sexo || "",
    telefone: patient.telefone || "",
    especialidade: patient.especialidade || "",
    plano_saude: patient.plano_saude || "",
    numero_carteirinha: patient.numero_carteirinha || "",
    data_nascimento: patient.data_nascimento
      ? new Date(patient.data_nascimento).toISOString().slice(0, 10)
      : "",
    crm_medico: patient.crm_medico || "",
    local_atendimento: patient.local_atendimento || "",
    queixa_principal: getQueixa(patient),
    hma: patient.hma || "",
    hpp: patient.hpp || "",
    alergias: patient.alergias || "",
    comorbidades: patient.comorbidades || "",
    gestante: Boolean(patient.gestante),
    funcao_renal_alterada: Boolean(patient.funcao_renal_alterada),
    hepatopatia: Boolean(patient.hepatopatia),
    idoso_fragil: Boolean(patient.idoso_fragil),
    diabetes: Boolean(patient.diabetes),
    epilepsia: Boolean(patient.epilepsia),
    asma: Boolean(patient.asma),
    gastrite_ulcera: Boolean(patient.gastrite_ulcera),
    insuficiencia_cardiaca: Boolean(patient.insuficiencia_cardiaca),
    arritmia_qt_longo: Boolean(patient.arritmia_qt_longo),
    uso_anticoagulante: Boolean(patient.uso_anticoagulante),
    uso_isrs: Boolean(patient.uso_isrs),
    uso_sedativos: Boolean(patient.uso_sedativos),
    medicamentos_em_uso: patient.medicamentos_em_uso || "",
    exame_fisico: patient.exame_fisico || "",
    hipotese_diagnostica: getHipotese(patient),
    conduta_medica: patient.conduta_medica || "",
    observacoes: patient.observacoes || "",
    retorno_previsto_em: patient.retorno_previsto_em
      ? new Date(patient.retorno_previsto_em).toISOString().slice(0, 10)
      : "",
  };
}

function buildPayload(form: PatientForm, userId: string) {
  return {
    user_id: userId,
    nome: form.nome.trim(),
    idade: form.idade.trim() ? Number(form.idade) : null,
    sexo: form.sexo.trim() || null,
    telefone: form.telefone.trim() || null,
    especialidade: form.especialidade.trim() || null,
    plano_saude: form.plano_saude.trim() || null,
    numero_carteirinha: form.numero_carteirinha.trim() || null,
    data_nascimento: form.data_nascimento || null,
    crm_medico: form.crm_medico.trim() || null,
    local_atendimento: form.local_atendimento.trim() || null,
    queixa: form.queixa_principal.trim() || null,
    queixa_principal: form.queixa_principal.trim() || null,
    hma: form.hma.trim() || null,
    hpp: form.hpp.trim() || null,
    alergias: form.alergias.trim() || null,
    comorbidades: form.comorbidades.trim() || null,
    gestante: Boolean(form.gestante),
    funcao_renal_alterada: Boolean(form.funcao_renal_alterada),
    hepatopatia: Boolean(form.hepatopatia),
    idoso_fragil: Boolean(form.idoso_fragil),
    diabetes: Boolean(form.diabetes),
    epilepsia: Boolean(form.epilepsia),
    asma: Boolean(form.asma),
    gastrite_ulcera: Boolean(form.gastrite_ulcera),
    insuficiencia_cardiaca: Boolean(form.insuficiencia_cardiaca),
    arritmia_qt_longo: Boolean(form.arritmia_qt_longo),
    uso_anticoagulante: Boolean(form.uso_anticoagulante),
    uso_isrs: Boolean(form.uso_isrs),
    uso_sedativos: Boolean(form.uso_sedativos),
    medicamentos_em_uso: form.medicamentos_em_uso.trim() || null,
    exame_fisico: form.exame_fisico.trim() || null,
    diagnostico_principal: form.hipotese_diagnostica.trim() || null,
    hipotese_diagnostica: form.hipotese_diagnostica.trim() || null,
    conduta_medica: form.conduta_medica.trim() || null,
    observacoes: form.observacoes.trim() || null,
    retorno_previsto_em: form.retorno_previsto_em || null,
  };
}

const patientSelect =
  "id, user_id, nome, idade, sexo, telefone, especialidade, plano_saude, numero_carteirinha, data_nascimento, crm_medico, local_atendimento, queixa, queixa_principal, hma, hpp, alergias, comorbidades, gestante, funcao_renal_alterada, hepatopatia, idoso_fragil, diabetes, epilepsia, asma, gastrite_ulcera, insuficiencia_cardiaca, arritmia_qt_longo, uso_anticoagulante, uso_isrs, uso_sedativos, diagnostico_principal, hipotese_diagnostica, medicamentos_em_uso, exame_fisico, conduta_medica, observacoes, retorno_previsto_em, created_at";

function buildPatientSummary(patient: Patient) {
  const lines = [
    "RESIBOOK — RESUMO DO PACIENTE",
    "",
    `PACIENTE: ${patient.nome || "-"}`,
    patient.idade ? `IDADE: ${patient.idade} anos` : "",
    patient.sexo ? `SEXO: ${patient.sexo}` : "",
    patient.telefone ? `TELEFONE: ${patient.telefone}` : "",
    patient.especialidade ? `ESPECIALIDADE: ${patient.especialidade}` : "",
    patient.plano_saude ? `PLANO DE SAÚDE: ${patient.plano_saude}` : "",
    patient.numero_carteirinha
      ? `CARTEIRINHA: ${patient.numero_carteirinha}`
      : "",
    patient.data_nascimento
      ? `DATA DE NASCIMENTO: ${formatDateOnly(patient.data_nascimento)}`
      : "",
    patient.local_atendimento
      ? `LOCAL DE ATENDIMENTO: ${patient.local_atendimento}`
      : "",
    patient.crm_medico ? `MÉDICO / CRM: ${patient.crm_medico}` : "",
    patient.alergias ? `ALERGIAS:\n${patient.alergias}` : "",
    patient.comorbidades ? `COMORBIDADES:\n${patient.comorbidades}` : "",
    patient.gestante ? "GESTANTE: sim" : "",
    patient.funcao_renal_alterada ? "FUNÇÃO RENAL ALTERADA: sim" : "",
    patient.hepatopatia ? "HEPATOPATIA: sim" : "",
    patient.idoso_fragil ? "IDOSO FRÁGIL: sim" : "",
    patient.diabetes ? "DIABETES: sim" : "",
    patient.epilepsia ? "EPILEPSIA: sim" : "",
    patient.asma ? "ASMA: sim" : "",
    patient.gastrite_ulcera ? "GASTRITE/ÚLCERA: sim" : "",
    patient.insuficiencia_cardiaca ? "INSUFICIÊNCIA CARDÍACA: sim" : "",
    patient.arritmia_qt_longo ? "ARRITMIA / QT LONGO: sim" : "",
    patient.uso_anticoagulante ? "USO DE ANTICOAGULANTE: sim" : "",
    patient.uso_isrs ? "USO DE ISRS: sim" : "",
    patient.uso_sedativos ? "USO DE SEDATIVOS: sim" : "",
    getQueixa(patient) ? `QUEIXA PRINCIPAL:\n${getQueixa(patient)}` : "",
    patient.hma ? `HMA:\n${patient.hma}` : "",
    patient.hpp ? `HPP:\n${patient.hpp}` : "",
    patient.medicamentos_em_uso
      ? `MEDICAMENTOS EM USO:\n${patient.medicamentos_em_uso}`
      : "",
    patient.exame_fisico ? `EXAME FÍSICO:\n${patient.exame_fisico}` : "",
    getHipotese(patient)
      ? `HIPÓTESE DIAGNÓSTICA:\n${getHipotese(patient)}`
      : "",
    patient.conduta_medica ? `CONDUTA MÉDICA:\n${patient.conduta_medica}` : "",
    patient.observacoes ? `OBSERVAÇÕES:\n${patient.observacoes}` : "",
    patient.retorno_previsto_em
      ? `RETORNO PREVISTO: ${formatDateOnly(patient.retorno_previsto_em)}`
      : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function InfoBlock({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children?: string | null;
  tone?: "default" | "risk" | "clinical" | "plan";
}) {
  if (!children) return null;

  const toneClass = {
    default: "border-slate-200 bg-white",
    risk: "border-rose-200 bg-rose-50/70",
    clinical: "border-slate-200 bg-slate-50/80",
    plan: "border-emerald-200 bg-emerald-50/50",
  }[tone];

  const titleClass = {
    default: "text-slate-500",
    risk: "text-rose-700",
    clinical: "text-slate-600",
    plan: "text-emerald-700",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${titleClass}`}
      >
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {children}
      </p>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      {label ? (
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </label>
      ) : null}

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </div>

        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

export default function PacientesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [examTemplates, setExamTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [query, setQuery] = useState("");
  const [sexo, setSexo] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setSexo(params.get("sexo") || "");
    setEspecialidade(params.get("especialidade") || "");
  }, []);

  async function loadPatients() {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;

    setCurrentUserId(userId);

    if (!userId) {
      setError("Usuário autenticado não identificado.");
      setPatients([]);
      setLoading(false);
      return;
    }

    const [patientsRes, examsRes] = await Promise.all([
      supabase
        .from("patients")
        .select(patientSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("exam_templates")
        .select(
          "id, categoria, titulo, sexo, conteudo, arquivo_origem, source_file"
        )
        .order("titulo", { ascending: true }),
    ]);

    if (patientsRes.error) {
      setError(patientsRes.error.message);
      setPatients([]);
    } else {
      setPatients((patientsRes.data as Patient[]) || []);
    }

    if (!examsRes.error) {
      setExamTemplates((examsRes.data as ExamTemplate[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (sexo) params.set("sexo", sexo);
    if (especialidade) params.set("especialidade", especialidade);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [query, sexo, especialidade, pathname, router]);

  const sexos = useMemo(() => {
    return Array.from(
      new Set(patients.map((item) => item.sexo).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [patients]);

  const especialidades = useMemo(() => {
    return Array.from(
      new Set(patients.map((item) => item.especialidade).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [patients]);

  const filtered = useMemo(() => {
    const filteredBySelects = patients.filter((item) => {
      const matchesSexo = !sexo || item.sexo === sexo;
      const matchesEspecialidade =
        !especialidade || item.especialidade === especialidade;

      return matchesSexo && matchesEspecialidade;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.nome, weight: 12 },
      { value: getQueixa(item), weight: 7 },
      { value: getHipotese(item), weight: 7 },
      { value: item.especialidade, weight: 5 },
      { value: item.telefone, weight: 4 },
      { value: item.idade == null ? "" : String(item.idade), weight: 3 },
      { value: item.sexo, weight: 3 },
      { value: item.data_nascimento, weight: 3 },
      { value: item.plano_saude, weight: 2 },
      { value: item.numero_carteirinha, weight: 2 },
      { value: item.crm_medico, weight: 2 },
      { value: item.local_atendimento, weight: 2 },
      { value: item.hma, weight: 2 },
      { value: item.hpp, weight: 2 },
      { value: item.alergias, weight: 2 },
      { value: item.medicamentos_em_uso, weight: 2 },
      { value: item.exame_fisico, weight: 1 },
      { value: item.conduta_medica, weight: 1 },
      { value: item.observacoes, weight: 1 },
    ]);
  }, [patients, query, sexo, especialidade]);

  const hasFilters = Boolean(query || sexo || especialidade);

  const recentCount = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return patients.filter((patient) => {
      if (!patient.created_at) return false;
      return now - new Date(patient.created_at).getTime() <= sevenDays;
    }).length;
  }, [patients]);

  const riskCount = useMemo(() => {
    return patients.filter((patient) => hasRiskFlags(patient)).length;
  }, [patients]);

  const retornoCount = useMemo(() => {
    return patients.filter((patient) => Boolean(patient.retorno_previsto_em))
      .length;
  }, [patients]);

  const exameFisicoTemplates = useMemo(() => {
    return examTemplates.filter((item) => {
      const title = normalize(item.titulo);
      const categoriaNorm = normalize(item.categoria);
      const conteudo = normalize(item.conteudo);

      return (
        title.includes("exame fisico") ||
        categoriaNorm.includes("exame fisico") ||
        conteudo.includes("exame fisico")
      );
    });
  }, [examTemplates]);

  function getExamTemplateFor(target: "masculino" | "feminino" | "todos") {
    const candidates = exameFisicoTemplates;

    const exactBySexo = candidates.find((item) => {
      const sexoNorm = normalize(item.sexo);
      const tituloNorm = normalize(item.titulo);
      const categoriaNorm = normalize(item.categoria);

      if (target === "masculino") {
        return (
          sexoNorm.includes("masc") ||
          sexoNorm.includes("hom") ||
          tituloNorm.includes("homem") ||
          tituloNorm.includes("mascul") ||
          categoriaNorm.includes("homem") ||
          categoriaNorm.includes("mascul")
        );
      }

      if (target === "feminino") {
        return (
          sexoNorm.includes("fem") ||
          sexoNorm.includes("mulh") ||
          tituloNorm.includes("mulher") ||
          tituloNorm.includes("femin") ||
          categoriaNorm.includes("mulher") ||
          categoriaNorm.includes("femin")
        );
      }

      return (
        sexoNorm.includes("todos") ||
        sexoNorm.includes("ambos") ||
        sexoNorm === ""
      );
    });

    if (exactBySexo?.conteudo) return exactBySexo.conteudo;

    const generic = candidates.find((item) => item.conteudo);
    return generic?.conteudo || "";
  }

  function importExamTemplate(target: "masculino" | "feminino" | "todos") {
    const content = getExamTemplateFor(target);

    if (!content) {
      setError("Nenhum modelo de exame físico encontrado em exames-evolucao.");
      return;
    }

    setForm((current) => ({
      ...current,
      exame_fisico: content,
    }));

    setSuccess("Modelo de exame físico importado com sucesso.");
    setError("");
  }

  function appendExamTemplate(target: "masculino" | "feminino" | "todos") {
    const content = getExamTemplateFor(target);

    if (!content) {
      setError("Nenhum modelo de exame físico encontrado em exames-evolucao.");
      return;
    }

    setForm((current) => ({
      ...current,
      exame_fisico: current.exame_fisico.trim()
        ? `${current.exame_fisico.trim()}\n\n${content}`
        : content,
    }));

    setSuccess("Modelo acrescentado ao exame físico.");
    setError("");
  }

  function updateForm<K extends keyof PatientForm>(
    key: K,
    value: PatientForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateDrawer() {
    setEditingPatient(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditDrawer(patient: Patient) {
    setEditingPatient(patient);
    setForm(patientToForm(patient));
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingPatient(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    if (!form.nome.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = buildPayload(form, currentUserId);

    const response = editingPatient
      ? await supabase
          .from("patients")
          .update(payload)
          .eq("id", editingPatient.id)
          .eq("user_id", currentUserId)
          .select(patientSelect)
          .single()
      : await supabase
          .from("patients")
          .insert(payload)
          .select(patientSelect)
          .single();

    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      const saved = response.data as Patient;

      if (editingPatient) {
        setPatients((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
        setSuccess("Paciente atualizado com sucesso.");
      } else {
        setPatients((current) => [saved, ...current]);
        setSuccess("Paciente criado com sucesso.");
      }

      closeDrawer();
    }

    setSaving(false);
  }

  async function handleDelete(id: string, nome: string) {
    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar ${nome || "este paciente"}?`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (error) {
      setError(error.message);
    } else {
      setPatients((current) => current.filter((item) => item.id !== id));
      setSuccess("Paciente apagado com sucesso.");
    }

    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Prontuário clínico"
        title="Pacientes"
        description="Cadastro clínico longitudinal com identificação, queixa, antecedentes, alertas de risco, exame físico, hipótese diagnóstica e conduta."
        badges={[
          { label: "Prontuário médico", tone: "emerald" },
          { label: "Dados privados do usuário", tone: "slate" },
          { label: `${recentCount} novos em 7 dias`, tone: "blue" },
        ]}
        metrics={[
          {
            label: "Pacientes",
            value: loading ? "Carregando..." : patients.length,
          },
          {
            label: "Exibindo",
            value: filtered.length,
          },
          {
            label: "Com alertas",
            value: riskCount,
          },
        ]}
        error={error}
        success={success}
        actions={
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Novo paciente
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<UserRound className="h-5 w-5" />}
            label="Pacientes"
            value={loading ? "..." : patients.length}
          />

          <StatCard
            icon={<ShieldAlert className="h-5 w-5" />}
            label="Com alertas"
            value={riskCount}
          />

          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Retornos"
            value={retornoCount}
          />

          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Exibindo"
            value={filtered.length}
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Busca no prontuário
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar nome, alergias, queixa, HMA, HPP, diagnóstico, medicamento, plano..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:w-[720px]">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Sexo
                </label>

                <select
                  value={sexo}
                  onChange={(event) => setSexo(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Todos</option>
                  {sexos.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Especialidade
                </label>

                <select
                  value={especialidade}
                  onChange={(event) => setEspecialidade(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Todas</option>
                  {especialidades.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-transparent">
                  Ações
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSexo("");
                    setEspecialidade("");
                  }}
                  disabled={!hasFilters}
                  className={`inline-flex h-12 w-full items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${
                    hasFilters
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "cursor-not-allowed border border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {hasFilters ? "Limpar filtros" : "Sem filtros ativos"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModulePageHeader>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-600 shadow-sm">
          Carregando pacientes...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhum paciente encontrado
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Ajuste a busca ou limpe os filtros para visualizar os prontuários.
          </p>
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Lista de prontuários
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Pacientes em acompanhamento
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} paciente{filtered.length > 1 ? "s" : ""} em
                exibição.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasFilters ? (
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  Filtro ativo
                </span>
              ) : null}

              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Prontuário clínico
              </span>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {filtered.map((item) => {
              const risks = getRiskFlags(item);
              const hasAllergy = Boolean(item.alergias);
              const hasAnyRisk = hasAllergy || risks.length > 0;

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[28px] border bg-white shadow-sm transition hover:border-slate-300 ${
                    hasAnyRisk ? "border-rose-200" : "border-slate-200"
                  }`}
                >
                  <div
                    className={`border-b px-5 py-4 ${
                      hasAnyRisk
                        ? "border-rose-200 bg-rose-50/55"
                        : "border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            <IdCard className="h-3.5 w-3.5 text-slate-500" />
                            Prontuário
                          </span>

                          {item.especialidade ? (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {item.especialidade}
                            </span>
                          ) : null}

                          {item.plano_saude ? (
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {item.plano_saude}
                            </span>
                          ) : null}

                          {hasAllergy ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Alergia: {buildAlergiaResumo(item.alergias)}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                          {item.nome}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                          <span>{item.sexo || "Sexo não informado"}</span>

                          {typeof item.idade === "number" ? (
                            <span>{item.idade} anos</span>
                          ) : null}

                          {item.data_nascimento ? (
                            <span>
                              Nasc.: {formatDateOnly(item.data_nascimento)}
                            </span>
                          ) : null}

                          {item.telefone ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {item.telefone}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Cadastro
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    {hasAnyRisk ? (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-white px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                            <ShieldAlert className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-rose-900">
                              Alertas clínicos ativos
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {hasAllergy ? (
                                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                                  Alergia registrada
                                </span>
                              ) : null}

                              {risks.map((risk) => (
                                <span
                                  key={`${item.id}-${risk}`}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                                >
                                  {risk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="grid gap-3">
                      <InfoBlock title="Alergias" tone="risk">
                        {item.alergias}
                      </InfoBlock>

                      <InfoBlock title="Queixa principal" tone="clinical">
                        {getQueixa(item)}
                      </InfoBlock>

                      <InfoBlock title="HMA" tone="clinical">
                        {item.hma}
                      </InfoBlock>

                      <InfoBlock title="HPP" tone="clinical">
                        {item.hpp}
                      </InfoBlock>

                      <InfoBlock title="Comorbidades" tone="risk">
                        {item.comorbidades}
                      </InfoBlock>

                      <InfoBlock title="Medicamentos em uso">
                        {item.medicamentos_em_uso}
                      </InfoBlock>

                      <InfoBlock title="Exame físico">
                        {item.exame_fisico}
                      </InfoBlock>

                      <InfoBlock title="Hipótese diagnóstica">
                        {getHipotese(item)}
                      </InfoBlock>

                      <InfoBlock title="Conduta médica" tone="plan">
                        {item.conduta_medica}
                      </InfoBlock>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <CopyButton text={buildPatientSummary(item)} />

                      <Link
                        href={`/pacientes/${item.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Abrir prontuário
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditDrawer(item)}
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.nome)}
                        disabled={deletingId === item.id}
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Apagando..." : "Apagar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-4xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Prontuário clínico
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {editingPatient ? "Editar paciente" : "Novo paciente"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preencha o prontuário-base. Os alertas de risco são usados na
                  prescrição e na visualização clínica.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Identificação do paciente
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Dados cadastrais, contato, convênio e local de atendimento.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Nome completo"
                    value={form.nome}
                    onChange={(value) => updateForm("nome", value)}
                    placeholder="Nome completo"
                  />

                  <InputField
                    label="Idade"
                    type="number"
                    value={form.idade}
                    onChange={(value) => updateForm("idade", value)}
                    placeholder="Idade"
                  />

                  <InputField
                    label="Sexo"
                    value={form.sexo}
                    onChange={(value) => updateForm("sexo", value)}
                    placeholder="Sexo"
                  />

                  <InputField
                    label="Telefone"
                    value={form.telefone}
                    onChange={(value) => updateForm("telefone", value)}
                    placeholder="Telefone"
                  />

                  <InputField
                    label="Especialidade / serviço"
                    value={form.especialidade}
                    onChange={(value) => updateForm("especialidade", value)}
                    placeholder="Especialidade / serviço"
                  />

                  <InputField
                    label="Data de nascimento"
                    type="date"
                    value={form.data_nascimento}
                    onChange={(value) => updateForm("data_nascimento", value)}
                    placeholder="Data de nascimento"
                  />

                  <InputField
                    label="Retorno previsto"
                    type="date"
                    value={form.retorno_previsto_em}
                    onChange={(value) =>
                      updateForm("retorno_previsto_em", value)
                    }
                    placeholder="Retorno previsto"
                  />

                  <InputField
                    label="Plano de saúde / convênio"
                    value={form.plano_saude}
                    onChange={(value) => updateForm("plano_saude", value)}
                    placeholder="Plano de saúde / convênio"
                  />

                  <InputField
                    label="Número da carteirinha"
                    value={form.numero_carteirinha}
                    onChange={(value) =>
                      updateForm("numero_carteirinha", value)
                    }
                    placeholder="Número da carteirinha"
                  />

                  <InputField
                    label="Local de atendimento / consultório"
                    value={form.local_atendimento}
                    onChange={(value) =>
                      updateForm("local_atendimento", value)
                    }
                    placeholder="Local de atendimento / consultório"
                  />

                  <InputField
                    label="Médico / CRM para impressão"
                    value={form.crm_medico}
                    onChange={(value) => updateForm("crm_medico", value)}
                    placeholder="Médico / CRM para impressão"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <Stethoscope className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      História clínica
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Queixa, HMA, antecedentes e medicamentos em uso.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <TextAreaField
                    label="Queixa principal"
                    value={form.queixa_principal}
                    onChange={(value) => updateForm("queixa_principal", value)}
                    placeholder="Ex.: dor torácica há 2 dias; tristeza persistente; retorno de acompanhamento..."
                  />

                  <TextAreaField
                    label="HMA — História da Moléstia Atual"
                    value={form.hma}
                    onChange={(value) => updateForm("hma", value)}
                    placeholder="História cronológica, início, evolução, fatores de melhora/piora, sintomas associados..."
                    rows={6}
                  />

                  <TextAreaField
                    label="HPP — História Patológica Pregressa"
                    value={form.hpp}
                    onChange={(value) => updateForm("hpp", value)}
                    placeholder="Comorbidades, cirurgias, internações, antecedentes relevantes..."
                    rows={5}
                  />

                  <TextAreaField
                    label="Medicamentos em uso"
                    value={form.medicamentos_em_uso}
                    onChange={(value) =>
                      updateForm("medicamentos_em_uso", value)
                    }
                    placeholder="Nome, dose, via, frequência e adesão quando relevante..."
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-rose-200 bg-rose-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-white p-2 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-900">
                      Alergias — alerta crítico
                    </p>
                    <p className="mt-1 text-sm leading-6 text-rose-800">
                      Esse campo aparece com destaque no card do paciente e
                      também entra no resumo copiado.
                    </p>

                    <div className="mt-4">
                      <TextAreaField
                        label="Alergias"
                        value={form.alergias}
                        onChange={(value) => updateForm("alergias", value)}
                        placeholder="Ex.: Dipirona, Penicilina, contraste iodado, látex..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-200 bg-amber-50/75 p-5">
                <div className="mb-5 flex items-start gap-3 border-b border-amber-200 pb-4">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-800">
                    <HeartPulse className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-amber-950">
                      Perfil de risco clínico estruturado
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      Esses campos alimentam os alertas automáticos na página de
                      prescrição. Não remova nem deixe de revisar.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
                  <TextAreaField
                    label="Comorbidades relevantes"
                    value={form.comorbidades}
                    onChange={(value) => updateForm("comorbidades", value)}
                    placeholder="Ex.: DRC, cirrose, ICC, epilepsia, anticoagulação..."
                    rows={4}
                  />

                  <div className="grid gap-3 rounded-2xl border border-amber-200 bg-white p-4 md:grid-cols-2">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.gestante}
                        onChange={(event) =>
                          updateForm("gestante", event.target.checked)
                        }
                      />
                      Gestante
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.funcao_renal_alterada}
                        onChange={(event) =>
                          updateForm(
                            "funcao_renal_alterada",
                            event.target.checked
                          )
                        }
                      />
                      Função renal alterada
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.hepatopatia}
                        onChange={(event) =>
                          updateForm("hepatopatia", event.target.checked)
                        }
                      />
                      Hepatopatia
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.idoso_fragil}
                        onChange={(event) =>
                          updateForm("idoso_fragil", event.target.checked)
                        }
                      />
                      Idoso frágil
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.diabetes}
                        onChange={(event) =>
                          updateForm("diabetes", event.target.checked)
                        }
                      />
                      Diabetes
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.epilepsia}
                        onChange={(event) =>
                          updateForm("epilepsia", event.target.checked)
                        }
                      />
                      Epilepsia / convulsão
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.asma}
                        onChange={(event) =>
                          updateForm("asma", event.target.checked)
                        }
                      />
                      Asma / broncoespasmo
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.gastrite_ulcera}
                        onChange={(event) =>
                          updateForm("gastrite_ulcera", event.target.checked)
                        }
                      />
                      Gastrite / úlcera / sangramento GI
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.insuficiencia_cardiaca}
                        onChange={(event) =>
                          updateForm(
                            "insuficiencia_cardiaca",
                            event.target.checked
                          )
                        }
                      />
                      Insuficiência cardíaca
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.arritmia_qt_longo}
                        onChange={(event) =>
                          updateForm("arritmia_qt_longo", event.target.checked)
                        }
                      />
                      Arritmia / QT longo
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.uso_anticoagulante}
                        onChange={(event) =>
                          updateForm(
                            "uso_anticoagulante",
                            event.target.checked
                          )
                        }
                      />
                      Uso de anticoagulante
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.uso_isrs}
                        onChange={(event) =>
                          updateForm("uso_isrs", event.target.checked)
                        }
                      />
                      Uso de ISRS
                    </label>

                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={form.uso_sedativos}
                        onChange={(event) =>
                          updateForm("uso_sedativos", event.target.checked)
                        }
                      />
                      Uso de sedativos / opioides / benzos
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      Exame físico / exame do estado mental
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Digite manualmente ou importe dos modelos de Exames /
                      Evolução.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => importExamTemplate("masculino")}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Substituir homem
                    </button>

                    <button
                      type="button"
                      onClick={() => importExamTemplate("feminino")}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Substituir mulher
                    </button>

                    <button
                      type="button"
                      onClick={() => importExamTemplate("todos")}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Substituir genérico
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => appendExamTemplate("masculino")}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Acrescentar homem
                  </button>

                  <button
                    type="button"
                    onClick={() => appendExamTemplate("feminino")}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Acrescentar mulher
                  </button>

                  <button
                    type="button"
                    onClick={() => appendExamTemplate("todos")}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Acrescentar genérico
                  </button>
                </div>

                <div className="mt-4">
                  <TextAreaField
                    label="Conteúdo do exame físico"
                    value={form.exame_fisico}
                    onChange={(value) => updateForm("exame_fisico", value)}
                    placeholder="Estado geral, sinais vitais, exame segmentar ou exame psíquico..."
                    rows={8}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <ClipboardList className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Avaliação e plano
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Hipótese diagnóstica, conduta e observações finais.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <TextAreaField
                    label="Hipótese diagnóstica"
                    value={form.hipotese_diagnostica}
                    onChange={(value) =>
                      updateForm("hipotese_diagnostica", value)
                    }
                    placeholder="Hipótese principal e diferenciais..."
                  />

                  <TextAreaField
                    label="Conduta médica"
                    value={form.conduta_medica}
                    onChange={(value) => updateForm("conduta_medica", value)}
                    placeholder="Exames solicitados, prescrição, orientações, retorno, encaminhamentos..."
                    rows={6}
                  />

                  <TextAreaField
                    label="Observações"
                    value={form.observacoes}
                    onChange={(value) => updateForm("observacoes", value)}
                    placeholder="Informações adicionais, contexto familiar/social, pendências..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingPatient
                    ? "Salvar edição"
                    : "Criar paciente"}
                </button>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
