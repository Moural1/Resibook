import { createClient } from "@supabase/supabase-js";
import FlashcardsBrowser from "../../components/flashcards-browser";

type SearchParams = Promise<{
  success?: string;
  deleted?: string;
  error?: string;
  message?: string;
}>;

type FlashcardItem = {
  id: string;
  source_file: string;
  source_group: string;
  card_number: number | null;
  frente: string;
  verso: string;
  tags: string[] | null;
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

async function getFlashcards(): Promise<FlashcardItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("flashcards")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data as FlashcardItem[]) || [];
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const flashcards = await getFlashcards();
  const message = params.message ? decodeURIComponent(params.message) : "";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Flashcards
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Biblioteca clínica
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Flashcards clínicos
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastro rápido e revisão com busca instantânea.
          </p>
        </div>

        {params.success === "1" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Flashcard criado com sucesso.
          </div>
        ) : null}

        {params.deleted === "1" ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Flashcard apagado.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro: {message || "não foi possível concluir."}
          </div>
        ) : null}

        <form
          action="/api/flashcards"
          method="POST"
          className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="source_group"
              placeholder="Grupo (ex.: Cardiologia)"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
            <input
              name="source_file"
              placeholder="Arquivo origem"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
          </div>

          <textarea
            name="frente"
            required
            rows={4}
            placeholder="Frente do card"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <textarea
            name="verso"
            required
            rows={5}
            placeholder="Verso do card"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <input
            name="tags"
            placeholder="Tags separadas por vírgula"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
          >
            Adicionar flashcard
          </button>
        </form>
      </section>

      <FlashcardsBrowser flashcards={flashcards} />
    </div>
  );
}