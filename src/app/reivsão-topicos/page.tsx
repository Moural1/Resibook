import { createClient } from "@supabase/supabase-js";

type ExamTemplate = {
  id: number;
  categoria: string;
  titulo: string;
  conteudo: string;
  sexo: string | null;
  source_file: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getTemplates(): Promise<ExamTemplate[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("exam_templates")
    .select("*")
    .order("categoria", { ascending: true })
    .order("titulo", { ascending: true });

  return (data as ExamTemplate[]) || [];
}

export default async function RevisaoTopicosPage() {
  const templates = await getTemplates();

  const grouped = templates.reduce<Record<string, ExamTemplate[]>>((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
              Revisão dos tópicos
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Base do PDF
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Tópicos clínicos organizados
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Aqui entram os blocos do seu material de exame físico, rotina, sistemas e condutas.
            </p>
          </div>
        </div>
      </section>

      {Object.keys(grouped).length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum tópico encontrado.
        </section>
      ) : (
        Object.entries(grouped).map(([categoria, items]) => (
          <section
            key={categoria}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-semibold text-slate-900">{categoria}</h3>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      {item.source_file}
                    </span>
                    {item.sexo ? (
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        {item.sexo}
                      </span>
                    ) : null}
                  </div>

                  <h4 className="mt-4 text-lg font-semibold text-slate-900">
                    {item.titulo}
                  </h4>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {item.conteudo}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}