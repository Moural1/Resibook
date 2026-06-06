"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";

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
  queixa: string | null;
  queixa_principal: string | null;
  hma: string | null;
  hpp: string | null;
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
  queixa_principal: string;
  hma: string;
  hpp: string;
  medicamentos_em_uso: string;
  exame_fisico: string;
  hipotese_diagnostica: string;
  conduta_medica: string;
  observacoes: string;
  retorno_previsto_em: string;
};

const emptyForm: PatientForm = {
  nome: "",
  idade: "",
  sexo: "",
  telefone: "",
  especialidade: "",
  plano_saude: "",
  numero_carteirinha: "",
  queixa_principal: "",
  hma: "",
  hpp: "",
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
    queixa_principal: getQueixa(patient),
    hma: patient.hma || "",
    hpp: patient.hpp || "",
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
    queixa: form.queixa_principal.trim() || null,
    queixa_principal: form.queixa_principal.trim() || null,
    hma: form.hma.trim() || null,
    hpp: form.hpp.trim() || null,
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
  "id, user_id, nome, idade, sexo, telefone, especialidade, plano_saude, numero_carteirinha, queixa, queixa_principal, hma, hpp, diagnostico_principal, hipotese_diagnostica, medicamentos_em_uso, exame_fisico, conduta_medica, observacoes, retorno_previsto_em, created_at";

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
    patient.numero_carteirinha ? `CARTEIRINHA: ${patient.numero_carteirinha}` : "",
    getQueixa(patient) ? `QUEIXA PRINCIPAL:\n${getQueixa(patient)}` : "",
    patient.hma ? `HMA:\n${patient.hma}` : "",
    patient.hpp ? `HPP:\n${patient.hpp}` : "",
    patient.medicamentos_em_uso
      ? `MEDICAMENTOS EM USO:\n${patient.medicamentos_em_uso}`
      : "",
    patient.exame_fisico ? `EXAME FÍSICO:\n${patient.exame_fisico}` : "",
    getHipotese(patient) ? `HIPÓTESE DIAGNÓSTICA:\n${getHipotese(patient)}` : "",
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
      />
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
    />
  );
}

export default function PacientesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [query, setQuery] = useState("");
  const [sexo, setSexo] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
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

    const { data, error } = await supabase
      .from("patients")
      .select(patientSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setPatients([]);
    } else {
      setPatients((data as Patient[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPatients();
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
    const q = normalize(query);

    return patients.filter((item) => {
      const matchesQuery =
        !q ||
        normalize(item.nome).includes(q) ||
        normalize(item.idade).includes(q) ||
        normalize(item.sexo).includes(q) ||
        normalize(item.telefone).includes(q) ||
        normalize(item.especialidade).includes(q) ||
        normalize(item.plano_saude).includes(q) ||
        normalize(item.numero_carteirinha).includes(q) ||
        normalize(getQueixa(item)).includes(q) ||
        normalize(item.hma).includes(q) ||
        normalize(item.hpp).includes(q) ||
        normalize(getHipotese(item)).includes(q) ||
        normalize(item.medicamentos_em_uso).includes(q) ||
        normalize(item.exame_fisico).includes(q) ||
        normalize(item.conduta_medica).includes(q) ||
        normalize(item.observacoes).includes(q);

      const matchesSexo = !sexo || item.sexo === sexo;
      const matchesEspecialidade =
        !especialidade || item.especialidade === especialidade;

      return matchesQuery && matchesSexo && matchesEspecialidade;
    });
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

  function updateForm<K extends keyof PatientForm>(
    key: K,
    value: PatientForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateModal() {
    setEditingPatient(null);
    setForm(emptyForm);
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditModal(patient: Patient) {
    setEditingPatient(patient);
    setForm(patientToForm(patient));
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  function closeModal() {
    setModalOpen(false);
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

      closeModal();
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
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Pacientes
                </span>

                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  Prontuário profissional
                </span>

                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {recentCount} novos em 7 dias
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Pacientes
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Cadastro clínico completo com dados cadastrais, plano de saúde,
                queixa, HMA, HPP, exame físico, hipótese diagnóstica e conduta.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                <span>
                  {loading
                    ? "Carregando..."
                    : `Total do seu usuário: ${patients.length}`}
                </span>
                <span>•</span>
                <span>Exibindo: {filtered.length}</span>
              </div>

              {error ? (
                <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  Erro: {error}
                </p>
              ) : null}

              {success ? (
                <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {success}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
            >
              Novo paciente
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nome, queixa, HMA, HPP, diagnóstico, medicamento, plano de saúde..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={sexo}
              onChange={(event) => setSexo(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todos os sexos —</option>
              {sexos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={especialidade}
              onChange={(event) => setEspecialidade(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todas as especialidades —</option>
              {especialidades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSexo("");
                setEspecialidade("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              {hasFilters ? "Limpar filtros" : "Filtros"}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando pacientes...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum paciente encontrado.
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Paciente
                      </span>

                      {item.especialidade ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {item.especialidade}
                        </span>
                      ) : null}

                      {item.plano_saude ? (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {item.plano_saude}
                        </span>
                      ) : null}

                      {item.retorno_previsto_em ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Retorno: {formatDateOnly(item.retorno_previsto_em)}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-slate-900">
                      {item.nome}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.sexo || "Sexo não informado"}
                      {typeof item.idade === "number"
                        ? ` • ${item.idade} anos`
                        : ""}
                      {item.telefone ? ` • ${item.telefone}` : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  <InfoBlock title="Queixa principal">{getQueixa(item)}</InfoBlock>
                  <InfoBlock title="HMA">{item.hma}</InfoBlock>
                  <InfoBlock title="HPP">{item.hpp}</InfoBlock>
                  <InfoBlock title="Hipótese diagnóstica">{getHipotese(item)}</InfoBlock>
                  <InfoBlock title="Conduta médica">{item.conduta_medica}</InfoBlock>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <CopyButton text={buildPatientSummary(item)} />

                  <Link
                    href={`/pacientes/${item.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700"
                  >
                    Abrir prontuário
                  </Link>

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.nome)}
                    disabled={deletingId === item.id}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Apagando..." : "Apagar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingPatient ? "Editar paciente" : "Novo paciente"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha o prontuário-base. Esses campos aparecem na impressão profissional.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">
                Dados cadastrais
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  value={form.nome}
                  onChange={(value) => updateForm("nome", value)}
                  placeholder="Nome completo"
                />

                <InputField
                  type="number"
                  value={form.idade}
                  onChange={(value) => updateForm("idade", value)}
                  placeholder="Idade"
                />

                <InputField
                  value={form.sexo}
                  onChange={(value) => updateForm("sexo", value)}
                  placeholder="Sexo"
                />

                <InputField
                  value={form.telefone}
                  onChange={(value) => updateForm("telefone", value)}
                  placeholder="Telefone"
                />

                <InputField
                  value={form.especialidade}
                  onChange={(value) => updateForm("especialidade", value)}
                  placeholder="Especialidade / serviço"
                />

                <InputField
                  type="date"
                  value={form.retorno_previsto_em}
                  onChange={(value) => updateForm("retorno_previsto_em", value)}
                  placeholder="Retorno previsto"
                />

                <InputField
                  value={form.plano_saude}
                  onChange={(value) => updateForm("plano_saude", value)}
                  placeholder="Plano de saúde / convênio"
                />

                <InputField
                  value={form.numero_carteirinha}
                  onChange={(value) => updateForm("numero_carteirinha", value)}
                  placeholder="Número da carteirinha"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4">
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
                placeholder="Comorbidades, cirurgias, internações, alergias, antecedentes relevantes..."
                rows={5}
              />

              <TextAreaField
                label="Medicamentos em uso"
                value={form.medicamentos_em_uso}
                onChange={(value) => updateForm("medicamentos_em_uso", value)}
                placeholder="Nome, dose, via, frequência e adesão quando relevante..."
              />

              <TextAreaField
                label="Exame físico / exame do estado mental"
                value={form.exame_fisico}
                onChange={(value) => updateForm("exame_fisico", value)}
                placeholder="Estado geral, sinais vitais, exame segmentar ou exame psíquico..."
                rows={6}
              />

              <TextAreaField
                label="Hipótese diagnóstica"
                value={form.hipotese_diagnostica}
                onChange={(value) => updateForm("hipotese_diagnostica", value)}
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Salvando..."
                  : editingPatient
                  ? "Salvar edição"
                  : "Criar paciente"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
