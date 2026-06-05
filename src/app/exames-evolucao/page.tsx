import { createClient } from "@supabase/supabase-js";
import ExamTemplatesBrowser from "../../components/exam-templates-browser";

type SearchParams = Promise<{
  success?: string;
  updated?: string;
  deleted?: string;
  error?: string;
  message?: string;
}>;

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
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

export default async function ExamesEvolucaoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const templates = await getTemplates();
  const message = params.message ? decodeURIComponent(params.message) : "";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Exames para solicitar
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Exames e evolução clínica
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Biblioteca prática com blocos estruturados para uso clínico real.
            </p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {templates.length} {templates.length === 1 ? "item" : "itens"}
          </div>
        </div>

        {params.success === "1" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Bloco criado.
          </div>
        ) : null}

        {params.updated === "1" ? (
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            Bloco atualizado.
          </div>
        ) : null}

        {params.deleted === "1" ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bloco apagado.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro: {message || "não foi possível concluir."}
          </div>
        ) : null}

        <form
          action="/api/exam-templates"
          method="POST"
          className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Novo bloco</h2>
            <p className="mt-1 text-sm text-slate-500">
              Adicione modelos de exames, condutas e evolução.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <input
                name="categoria"
                placeholder="Ex.: Conduta"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </label>
              <input
                name="titulo"
                placeholder="Ex.: Manejo sintomático"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sexo
              </label>
              <input
                name="sexo"
                placeholder="Opcional"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Arquivo origem / contexto
              </label>
              <input
                name="source_file"
                placeholder="Ex.: EXAMES_EVOLUÇÃO.pdf"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Conteúdo do bloco
            </label>
            <textarea
              name="conteudo"
              rows={8}
              placeholder="Digite o conteúdo clínico..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 outline-none"
            />
          </div>

          <div className="mt-5 flex items-center justify-end border-t border-slate-200 pt-4">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2563eb] px-6 text-sm font-semibold text-white"
            >
              Adicionar bloco
            </button>
          </div>
        </form>
      </section>

      <ExamTemplatesBrowser templates={templates} />
    </div>
  );
}