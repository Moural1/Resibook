"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";
import PrescriptionTemplatesLive from "../../components/prescription-templates-live";

type Prescription = {
  id: number;
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
};

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
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

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
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

function buildPayload(form: PrescriptionForm) {
  return {
    patient_id: form.patient_id || null,
    paciente_nome: form.paciente_nome.trim() || null,
    medicamento: form.medicamento.trim() || null,
    via: form.via.trim() || null,
    posologia: form.posologia.trim() || null,
    duracao: form.duracao.trim() || null,
    orientacoes: form.orientacoes.trim() || null,
  };
}

export default function PrescricaoPage() {
  const [initialQuery, setInitialQuery] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || "";
    const patientId = params.get("patient_id") || "";
    const pacienteNome = params.get("paciente_nome") || "";

    setInitialQuery(q);
    setQuery(q);

    if (patientId || pacienteNome) {
      setForm((current) => ({
        ...current,
        patient_id: patientId,
        paciente_nome: pacienteNome,
      }));
    }
  }, []);

  async function loadData() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      setCheckingUser(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email?.trim().toLowerCase() || "";
    const guest = email === GUEST_EMAIL;

    setIsGuest(guest);
    setCheckingUser(false);

    if (guest) {
      const templatesRes = await supabase
        .from("prescription_templates")
        .select(
          "id, categoria, titulo, conteudo, observacoes, source_file, created_at"
        )
        .order("titulo", { ascending: true });

      if (templatesRes.error) {
        setError(templatesRes.error.message);
        setTemplates([]);
      } else {
        setTemplates((templatesRes.data as PrescriptionTemplate[]) || []);
      }

      setPatients([]);
      setPrescriptions([]);
      setLoading(false);
      return;
    }

    const [patientsRes, templatesRes, prescriptionsRes] = await Promise.all([
      supabase.from("patients").select("id, nome").order("nome", {
        ascending: true,
      }),

      supabase
        .from("prescription_templates")
        .select(
          "id, categoria, titulo, conteudo, observacoes, source_file, created_at"
        )
        .order("titulo", { ascending: true }),

      supabase
        .from("prescriptions")
        .select(
          "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (patientsRes.error) {
      console.warn("Erro ao buscar pacientes:", patientsRes.error.message);
    }

    if (templatesRes.error) {
      console.warn("Erro ao buscar modelos:", templatesRes.error.message);
    }

    if (prescriptionsRes.error) {
      setError(prescriptionsRes.error.message);
      setPrescriptions([]);
    } else {
      setPrescriptions((prescriptionsRes.data as Prescription[]) || []);
    }

    setPatients((patientsRes.data as Patient[]) || []);
    setTemplates((templatesRes.data as PrescriptionTemplate[]) || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatientName = useMemo(() => {
    const found = patients.find((patient) => patient.id === form.patient_id);
    return found?.nome || "";
  }, [form.patient_id, patients]);

  const total = prescriptions.length;
  const ultima = prescriptions[0];

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
    return buildPrescriptionTextFromForm(form);
  }, [form]);

  function updateForm<K extends keyof PrescriptionForm>(
    key: K,
    value: PrescriptionForm[K]
  ) {
    setForm((current) => {
      if (key === "patient_id") {
        const found = patients.find((patient) => patient.id === value);

        return {
          ...current,
          patient_id: value,
          paciente_nome: found?.nome || current.paciente_nome,
        };
      }

      return {
        ...current,
        [key]: value,
      };
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function handleUseTemplate(draft: PrescriptionDraft) {
    setForm((current) => ({
      ...current,
      medicamento: draft.medicamento || "",
      via: draft.via || "",
      posologia: draft.posologia || "",
      duracao: draft.duracao || "",
      orientacoes: draft.orientacoes || "",
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleCreate() {
    if (isGuest) {
      setError("Usuário convidado não pode salvar prescrições.");
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (
      !form.medicamento.trim() &&
      !form.posologia.trim() &&
      !form.orientacoes.trim()
    ) {
      setError("Preencha pelo menos medicamento, posologia ou orientações.");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("prescriptions")
      .insert(buildPayload(form))
      .select(
        "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setPrescriptions((current) => [data as Prescription, ...current]);
      resetForm();
    }

    setSaving(false);
  }

  function startEdit(item: Prescription) {
    if (isGuest) return;

    setEditingId(item.id);
    setEditForms((current) => ({
      ...current,
      [item.id]: {
        patient_id: item.patient_id || "",
        paciente_nome: item.paciente_nome || "",
        medicamento: item.medicamento || "",
        via: item.via || "",
        posologia: item.posologia || "",
        duracao: item.duracao || "",
        orientacoes: item.orientacoes || "",
      },
    }));
  }

  function cancelEdit(id: number) {
    setEditingId(null);
    setEditForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updateEditForm<K extends keyof PrescriptionForm>(
    id: number,
    key: K,
    value: PrescriptionForm[K]
  ) {
    setEditForms((current) => {
      const previous = current[id] || emptyForm;

      if (key === "patient_id") {
        const found = patients.find((patient) => patient.id === value);

        return {
          ...current,
          [id]: {
            ...previous,
            patient_id: value,
            paciente_nome: found?.nome || previous.paciente_nome,
          },
        };
      }

      return {
        ...current,
        [id]: {
          ...previous,
          [key]: value,
        },
      };
    });
  }

  async function handleUpdate(id: number) {
    if (isGuest) return;

    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    const editForm = editForms[id];

    if (!editForm) {
      setError("Formulário de edição não encontrado.");
      return;
    }

    setError("");
    setSavingIds((current) => [...current, id]);

    const { data, error } = await supabase
      .from("prescriptions")
      .update(buildPayload(editForm))
      .eq("id", id)
      .select(
        "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setPrescriptions((current) =>
        current.map((item) => (item.id === id ? (data as Prescription) : item))
      );
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  async function handleDelete(id: number) {
    if (isGuest) return;

    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar esta prescrição?"
    );

    if (!confirmed) return;

    setError("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase.from("prescriptions").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setPrescriptions((current) => current.filter((item) => item.id !== id));
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

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
                ? "Modo convidado: use os modelos ou monte uma prescrição para copiar. O salvamento no banco está bloqueado."
                : "Registro médico com formulário rápido, histórico salvo e modelos prontos de plantão."}
            </p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {isGuest ? "Modo convidado" : `${total} ${total === 1 ? "item" : "itens"}`}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {isGuest ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Acesso convidado: você pode montar e copiar prescrições, mas não
            pode salvar, editar, apagar ou acessar dados de pacientes.
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {isGuest ? "Montar prescrição" : "Nova prescrição"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Clique em um modelo da biblioteca ou preencha manualmente.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {!isGuest ? (
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
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome do paciente
                </label>
                <input
                  value={form.paciente_nome || selectedPatientName}
                  onChange={(e) => updateForm("paciente_nome", e.target.value)}
                  placeholder="Ex.: Maria Helena Souza"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Medicamento
                </label>
                <input
                  value={form.medicamento}
                  onChange={(e) => updateForm("medicamento", e.target.value)}
                  placeholder="Ex.: Ceftriaxona 1 g"
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

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Orientações
              </label>
              <textarea
                rows={5}
                value={form.orientacoes}
                onChange={(e) => updateForm("orientacoes", e.target.value)}
                placeholder="Digite aqui as orientações da prescrição..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Limpar formulário
              </button>

              <div className="flex flex-wrap gap-3">
                <CopyButton text={draftText} />

                {!isGuest ? (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : "Salvar prescrição"}
                  </button>
                ) : null}
              </div>
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
                </>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Salvamento bloqueado
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    O convidado pode copiar prescrições, mas não altera o banco
                    de dados.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Biblioteca de plantão
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {templates.length} modelos prontos para copiar e usar no
                  formulário.
                </p>
              </div>
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
                Histórico completo vindo da base de dados.
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
              Nenhuma prescrição encontrada.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((item) => {
                const editing = editingId === item.id;
                const savingItem = savingIds.includes(item.id);
                const editForm = editForms[item.id] || {
                  patient_id: item.patient_id || "",
                  paciente_nome: item.paciente_nome || "",
                  medicamento: item.medicamento || "",
                  via: item.via || "",
                  posologia: item.posologia || "",
                  duracao: item.duracao || "",
                  orientacoes: item.orientacoes || "",
                };

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
                            Clínica médica
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                          {item.medicamento || "Prescrição clínica"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {getPatientLabel(item)} •{" "}
                          {formatDate(item.created_at)}
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
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                          >
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
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
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
                                  updateEditForm(
                                    item.id,
                                    "via",
                                    e.target.value
                                  )
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
    </div>
  );
}