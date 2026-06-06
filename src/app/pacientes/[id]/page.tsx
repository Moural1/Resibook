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
  created_at: string | null;
};

type PatientNote = {
  id: number;
  user_id?: string | null;
  patient_id: string;
  tipo: string | null;
  titulo: string | null;
  conteudo: string;
  created_at: string | null;
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

const patientSelect =
  "id, user_id, nome, idade, sexo, telefone, especialidade, plano_saude, numero_carteirinha, queixa, queixa_principal, hma, hpp, diagnostico_principal, hipotese_diagnostica, medicamentos_em_uso, exame_fisico, conduta_medica, observacoes, retorno_previsto_em, created_at";

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
  const main = [
    "RESIBOOK — PRONTUÁRIO CLÍNICO",
    "",
    "1. DADOS CADASTRAIS",
    `Nome: ${patient.nome || "-"}`,
    patient.idade ? `Idade: ${patient.idade} anos` : "",
    patient.sexo ? `Sexo: ${patient.sexo}` : "",
    patient.telefone ? `Telefone: ${patient.telefone}` : "",
    patient.especialidade ? `Especialidade: ${patient.especialidade}` : "",
    patient.plano_saude ? `Plano de saúde: ${patient.plano_saude}` : "",
    patient.numero_carteirinha
      ? `Carteirinha: ${patient.numero_carteirinha}`
      : "",
    patient.created_at ? `Cadastro: ${formatDate(patient.created_at)}` : "",
    patient.retorno_previsto_em
      ? `Retorno previsto: ${formatDateOnly(patient.retorno_previsto_em)}`
      : "",
    "",
    getQueixa(patient) ? `2. QUEIXA PRINCIPAL\n${getQueixa(patient)}` : "",
    patient.hma ? `3. HMA\n${patient.hma}` : "",
    patient.hpp ? `4. HPP\n${patient.hpp}` : "",
    patient.medicamentos_em_uso
      ? `5. MEDICAMENTOS EM USO\n${patient.medicamentos_em_uso}`
      : "",
    patient.exame_fisico ? `6. EXAME FÍSICO\n${patient.exame_fisico}` : "",
    getHipotese(patient) ? `7. HIPÓTESE DIAGNÓSTICA\n${getHipotese(patient)}` : "",
    patient.conduta_medica ? `8. CONDUTA MÉDICA\n${patient.conduta_medica}` : "",
    patient.observacoes ? `9. OBSERVAÇÕES\n${patient.observacoes}` : "",
  ].filter(Boolean);

  const noteText = notes.length
    ? [
        "10. EVOLUÇÕES / ANOTAÇÕES",
        ...notes.map((item, index) => `${index + 1}. ${buildNoteText(item)}`),
      ]
    : [];

  const prescriptionText = prescriptions.length
    ? [
        "11. PRESCRIÇÕES VINCULADAS",
        ...prescriptions.map(
          (item, index) => `${index + 1}. ${buildPrescriptionText(item)}`
        ),
      ]
    : [];

  return [...main, ...noteText, ...prescriptionText].join("\n\n");
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

function PrintSection({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <section className="break-inside-avoid border-t border-slate-300 py-3">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-900">
        {title}
      </h2>
      <div className="mt-2 whitespace-pre-wrap text-[12px] leading-6 text-slate-900">
        {children}
      </div>
    </section>
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
      .select(patientSelect)
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
      .select("id, user_id, patient_id, tipo, titulo, conteudo, created_at")
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const byIdPromise = supabase
      .from("prescriptions")
      .select(
        "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .eq("patient_id", currentPatient.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const byNamePromise = currentPatient.nome
      ? supabase
          .from("prescriptions")
          .select(
            "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
          )
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
      .select("id, user_id, patient_id, tipo, titulo, conteudo, created_at")
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
      .select("id, user_id, patient_id, tipo, titulo, conteudo, created_at")
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

    const confirmed = window.confirm("Tem certeza que deseja apagar esta evolução?");

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

  return (
    <>
      <div className="space-y-6 print:hidden">
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

                  {patient.plano_saude ? (
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {patient.plano_saude}
                    </span>
                  ) : null}

                  {patient.retorno_previsto_em ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Retorno: {formatDateOnly(patient.retorno_previsto_em)}
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
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                >
                  Imprimir prontuário
                </button>

                <CopyButton
                  text={buildPatientSummary(patient, prescriptions, notes)}
                />

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
            <InfoBlock title="Plano de saúde">{patient.plano_saude}</InfoBlock>
            <InfoBlock title="Carteirinha">{patient.numero_carteirinha}</InfoBlock>
            <InfoBlock title="Queixa principal">{getQueixa(patient)}</InfoBlock>
            <InfoBlock title="HMA">{patient.hma}</InfoBlock>
            <InfoBlock title="HPP">{patient.hpp}</InfoBlock>
            <InfoBlock title="Medicamentos em uso">{patient.medicamentos_em_uso}</InfoBlock>
            <InfoBlock title="Exame físico / estado mental">{patient.exame_fisico}</InfoBlock>
            <InfoBlock title="Hipótese diagnóstica">{getHipotese(patient)}</InfoBlock>
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

      <div className="hidden bg-white text-slate-950 print:block">
        <div className="mx-auto max-w-[760px] px-2 py-1">
          <header className="border-b-2 border-slate-900 pb-3">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em]">
                  ResiBook
                </p>
                <h1 className="mt-1 text-xl font-bold uppercase">
                  Prontuário clínico
                </h1>
                <p className="mt-1 text-[11px] text-slate-700">
                  Documento gerado em {formatDate(new Date().toISOString())}
                </p>
              </div>

              <div className="text-right text-[11px] leading-5 text-slate-700">
                <p>Registro clínico privado</p>
                <p>Emitido pelo sistema ResiBook</p>
              </div>
            </div>
          </header>

          <section className="py-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.18em]">
              1. Dados cadastrais
            </h2>

            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-[12px] leading-5">
              <p><strong>Nome:</strong> {patient.nome || "-"}</p>
              <p><strong>Idade:</strong> {patient.idade ? `${patient.idade} anos` : "-"}</p>
              <p><strong>Sexo:</strong> {patient.sexo || "-"}</p>
              <p><strong>Telefone:</strong> {patient.telefone || "-"}</p>
              <p><strong>Especialidade:</strong> {patient.especialidade || "-"}</p>
              <p><strong>Cadastro:</strong> {formatDate(patient.created_at)}</p>
              <p><strong>Plano de saúde:</strong> {patient.plano_saude || "-"}</p>
              <p><strong>Carteirinha:</strong> {patient.numero_carteirinha || "-"}</p>
              <p><strong>Retorno previsto:</strong> {formatDateOnly(patient.retorno_previsto_em)}</p>
            </div>
          </section>

          <PrintSection title="2. Queixa principal">
            {getQueixa(patient)}
          </PrintSection>

          <PrintSection title="3. HMA — História da Moléstia Atual">
            {patient.hma}
          </PrintSection>

          <PrintSection title="4. HPP — História Patológica Pregressa">
            {patient.hpp}
          </PrintSection>

          <PrintSection title="5. Medicamentos em uso">
            {patient.medicamentos_em_uso}
          </PrintSection>

          <PrintSection title="6. Exame físico / exame do estado mental">
            {patient.exame_fisico}
          </PrintSection>

          <PrintSection title="7. Hipótese diagnóstica">
            {getHipotese(patient)}
          </PrintSection>

          <PrintSection title="8. Conduta médica">
            {patient.conduta_medica}
          </PrintSection>

          <PrintSection title="9. Observações">
            {patient.observacoes}
          </PrintSection>

          <section className="break-inside-avoid border-t border-slate-300 py-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-900">
              10. Evoluções / anotações
            </h2>

            {notes.length === 0 ? (
              <p className="mt-2 text-[12px] text-slate-700">Sem evoluções registradas.</p>
            ) : (
              <div className="mt-2 space-y-3">
                {notes.map((item, index) => (
                  <div key={item.id} className="break-inside-avoid text-[12px] leading-6">
                    <p className="font-bold">
                      {index + 1}. {item.titulo || item.tipo || "Evolução clínica"} — {formatDate(item.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">{item.conteudo}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="break-inside-avoid border-t border-slate-300 py-3">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-900">
              11. Prescrições vinculadas
            </h2>

            {prescriptions.length === 0 ? (
              <p className="mt-2 text-[12px] text-slate-700">Sem prescrições vinculadas.</p>
            ) : (
              <div className="mt-2 space-y-3">
                {prescriptions.map((item, index) => (
                  <div key={item.id} className="break-inside-avoid text-[12px] leading-6">
                    <p className="font-bold">
                      {index + 1}. {item.medicamento || "Prescrição clínica"} — {formatDate(item.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">{buildPrescriptionText(item)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="mt-10 grid grid-cols-2 gap-10 text-[12px]">
            <div>
              <div className="mt-10 border-t border-slate-900 pt-2 text-center">
                Assinatura / carimbo
              </div>
            </div>

            <div>
              <div className="mt-10 border-t border-slate-900 pt-2 text-center">
                Data
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
