import { createClient } from "@supabase/supabase-js";
import CidsBrowser from "../../components/cids-browser";

type CidItem = {
  id: number;
  codigo: string;
  descricao: string;
  grupo: string | null;
  area: string | null;
  prioridade: number | null;
  tags: string | null;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getCids() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("cids")
    .select("*")
    .order("grupo", { ascending: true })
    .order("codigo", { ascending: true });

  return (data as CidItem[]) || [];
}

export default async function CidsPage() {
  const cids = await getCids();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Referência rápida
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              CID-10
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            CIDs
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Busca instantânea por código, descrição, grupo, área ou tags.
          </p>
        </div>
      </section>

      <CidsBrowser cids={cids} />
    </div>
  );
}