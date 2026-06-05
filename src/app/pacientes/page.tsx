import { createClient } from "@supabase/supabase-js";
import PatientsBrowser from "../../components/patients-browser";

type SearchParams = Promise<{
  success?: string;
  updated?: string;
  deleted?: string;
  error?: string;
  message?: string;
}>;

type Patient = {
  id: string;
  nome: string;
  idade: number | null;
  sexo: string | null;
  especialidade: string | null;
  queixa: string | null;
  observacoes: string | null;
  diagnostico_principal: string | null;
  medicamentos_em_uso: string | null;
  retorno_previsto_em: string | null;
  created_at: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Patient[]) || [];
}

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const patients = await getPatients();
  const message = params.message ? decodeURIComponent(params.message) : "";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Pacientes
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cadastro e edição no mesmo lugar.
          </p>
        </div>

        {params.success === "1" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Paciente criado.
          </div>
        ) : null}

        {params.updated === "1" ? (
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            Paciente atualizado.
          </div>
        ) : null}

        {params.deleted === "1" ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Paciente apagado.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro: {message || "não foi possível concluir."}
          </div>
        ) : null}

        <form
          action="/api/patients"
          method="POST"
          className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="nome"
              required
              placeholder="Nome do paciente"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
            <input
              name="idade"
              type="number"
              placeholder="Idade"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
            <input
              name="sexo"
              placeholder="Sexo"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
            <input
              name="especialidade"
              placeholder="Especialidade"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
          </div>

          <textarea
            name="queixa"
            rows={4}
            placeholder="Queixa / doença"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <textarea
            name="observacoes"
            rows={4}
            placeholder="Observações"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
          >
            Salvar paciente
          </button>
        </form>
      </section>

      <PatientsBrowser patients={patients} />
    </div>
  );
}