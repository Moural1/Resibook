import { createClient } from "@supabase/supabase-js";

type SearchParams = Promise<{
  success?: string;
  error?: string;
  message?: string;
}>;

type Patient = {
  id: string;
  nome: string;
};

type AiCase = {
  id: number;
  patient_id: string | null;
  titulo: string | null;
  queixa: string | null;
  contexto: string | null;
  prompt: string | null;
  resposta: string | null;
  created_at: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
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

async function getCases(): Promise<AiCase[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("ai_cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (data as AiCase[]) || [];
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function ConsultaAudioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const patients = await getPatients();
  const cases = await getCases();
  const errorMessage = params.message ? decodeURIComponent(params.message) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              IA clínica
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Casos salvos no banco
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Consulta por áudio / caso clínico
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Envie um caso clínico para análise estruturada e grave a resposta da IA.
            </p>
          </div>
        </div>

        {params.success === "1" && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Caso enviado e salvo com sucesso.
          </div>
        )}

        {params.error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro ao processar caso{errorMessage ? `: ${errorMessage}` : "."}
          </div>
        )}

        <form
          action="/api/ai/case-review"
          method="POST"
          className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Paciente vinculado
                  </label>
                  <select
                    name="patient_id"
                    defaultValue=""
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
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
                    Título do caso
                  </label>
                  <input
                    name="titulo"
                    type="text"
                    placeholder="Ex.: Dor torácica em paciente jovem"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Queixa principal
                  </label>
                  <textarea
                    name="queixa"
                    rows={5}
                    required
                    placeholder="Descreva a queixa principal e os achados mais importantes..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Contexto adicional
                  </label>
                  <textarea
                    name="contexto"
                    rows={6}
                    placeholder="História breve, exame físico, medicações, contexto clínico..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-950 p-5 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Formato da resposta
              </p>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">
{`1. Resumo do caso
2. Hipóteses principais
3. Pontos de atenção
4. Próximos passos sugeridos
5. Alertas`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Resumo do módulo
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Pacientes disponíveis</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {patients.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Casos salvos</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {cases.length}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Analisar caso com IA
              </button>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Últimos casos
                </h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {cases.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                    Nenhum caso salvo ainda.
                  </div>
                ) : (
                  cases.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.titulo || "Caso clínico"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-700">
                        {item.queixa || "Sem queixa"}
                      </p>

                      {item.resposta ? (
                        <div className="mt-3 rounded-2xl bg-slate-950 p-4">
                          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-200">
                            {item.resposta}
                          </pre>
                        </div>
                      ) : null}

                      <p className="mt-3 text-xs text-slate-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}