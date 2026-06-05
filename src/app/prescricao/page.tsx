import { createClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";
import ConfirmDeleteButton from "../../components/confirm-delete-button";
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

type SearchParams = Promise<{
  success?: string;
  updated?: string;
  deleted?: string;
  error?: string;
  message?: string;
}>;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

async function getPrescriptions(): Promise<Prescription[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("prescriptions")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Prescription[]) || [];
}

async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("patients")
    .select("id, nome")
    .order("nome", { ascending: true });

  return (data as Patient[]) || [];
}

async function getPrescriptionTemplates(): Promise<PrescriptionTemplate[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("prescription_templates")
    .select("*")
    .order("titulo", { ascending: true });

  return (data as PrescriptionTemplate[]) || [];
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

function getPatientLabel(item: Prescription) {
  return item.paciente_nome || "Paciente não vinculado";
}

function buildPrescriptionText(item: Prescription) {
  const lines = [
    item.medicamento || "Prescrição sem medicamento definido",
    item.posologia || "",
    item.via ? `Via: ${item.via}` : "",
    item.duracao ? `Duração: ${item.duracao}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

export default async function PrescricaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const prescriptions = await getPrescriptions();
  const patients = await getPatients();
  const templates = await getPrescriptionTemplates();

  const total = prescriptions.length;
  const ultima = prescriptions[0];
  const message = params.message ? decodeURIComponent(params.message) : "";

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
              Registro médico com formulário rápido, histórico salvo e modelos prontos de plantão.
            </p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {total} {total === 1 ? "item" : "itens"}
          </div>
        </div>

        {params.success === "1" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Prescrição salva.
          </div>
        ) : null}

        {params.updated === "1" ? (
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            Prescrição atualizada.
          </div>
        ) : null}

        {params.deleted === "1" ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Prescrição apagada.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro: {message || "não foi possível concluir."}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <form
            action="/api/prescriptions"
            method="POST"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Nova prescrição
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Formulário principal do atendimento.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Paciente vinculado
                </label>
                <select
                  name="patient_id"
                  defaultValue=""
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
                  name="paciente_nome"
                  placeholder="Ex.: Maria Helena Souza"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Medicamento
                </label>
                <input
                  name="medicamento"
                  placeholder="Ex.: Ceftriaxona 1 g"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Via
                </label>
                <input
                  name="via"
                  placeholder="Ex.: IV"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Posologia
                </label>
                <input
                  name="posologia"
                  placeholder="Ex.: 12/12h"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Duração
                </label>
                <input
                  name="duracao"
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
                name="orientacoes"
                rows={5}
                placeholder="Digite aqui as orientações da prescrição..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end border-t border-slate-200 pt-4">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
              >
                Salvar prescrição
              </button>
            </div>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Resumo rápido
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Prescrições salvas
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {total}
                </p>
              </div>

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

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Biblioteca de plantão
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {templates.length} modelos prontos para copiar e colar.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <PrescriptionTemplatesLive templates={templates} />

      <section
        id="lista-prescricoes"
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Prescrições salvas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Histórico completo vindo da base de dados.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-400">
            {total} registros
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhuma prescrição encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((item) => (
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
                      {item.medicamento || "Modelo clínico"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {getPatientLabel(item)} • {formatDate(item.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <CopyButton text={buildPrescriptionText(item)} />
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
                    {buildPrescriptionText(item)}
                  </pre>
                </div>

                <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                    Editar ou apagar esta prescrição
                  </summary>

                  <form
                    action={`/api/prescriptions/${item.id}`}
                    method="POST"
                    className="mt-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Paciente vinculado
                        </label>
                        <select
                          name="patient_id"
                          defaultValue={item.patient_id ?? ""}
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
                          name="paciente_nome"
                          defaultValue={item.paciente_nome ?? ""}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Medicamento
                        </label>
                        <input
                          name="medicamento"
                          defaultValue={item.medicamento ?? ""}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Via
                        </label>
                        <input
                          name="via"
                          defaultValue={item.via ?? ""}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Posologia
                        </label>
                        <input
                          name="posologia"
                          defaultValue={item.posologia ?? ""}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Duração
                        </label>
                        <input
                          name="duracao"
                          defaultValue={item.duracao ?? ""}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Orientações
                      </label>
                      <textarea
                        name="orientacoes"
                        rows={5}
                        defaultValue={item.orientacoes ?? ""}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                      />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
                      >
                        Salvar edição
                      </button>

                      <ConfirmDeleteButton confirmText="Tem certeza que deseja apagar esta prescrição?" />
                    </div>
                  </form>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}