import { createClient } from "@supabase/supabase-js";

type SearchParams = Promise<{
  q?: string;
  grupo?: string;
  area?: string;
}>;

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

  const { data, error } = await supabase
    .from("cids")
    .select("*")
    .order("grupo", { ascending: true })
    .order("codigo", { ascending: true });

  if (error) {
    console.error("Erro ao carregar CIDs:", error.message);
    return [];
  }

  return (data as CidItem[]) || [];
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default async function CidsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const allCids = await getCids();

  const q = params.q?.trim() || "";
  const grupo = params.grupo?.trim() || "";
  const area = params.area?.trim() || "";

  const grupos = Array.from(
    new Set(allCids.map((item) => item.grupo).filter(Boolean))
  ) as string[];

  const areas = Array.from(
    new Set(allCids.map((item) => item.area).filter(Boolean))
  ) as string[];

  const filtered = allCids.filter((item) => {
    const matchesQuery =
      !q ||
      normalize(item.codigo).includes(normalize(q)) ||
      normalize(item.descricao).includes(normalize(q)) ||
      normalize(item.tags || "").includes(normalize(q));

    const matchesGrupo = !grupo || item.grupo === grupo;
    const matchesArea = !area || item.area === area;

    return matchesQuery && matchesGrupo && matchesArea;
  });

  const grouped = filtered.reduce<Record<string, CidItem[]>>((acc, item) => {
    const key = item.grupo || "Sem grupo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

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
            Busca por código, descrição ou tag. Base conectada ao banco.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Total carregado do banco: {allCids.length}
          </p>
        </div>

        <form className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por código (ex.: I10) ou nome (ex.: pneumonia, diabetes, HAS)..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <select
              name="grupo"
              defaultValue={grupo}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todos os grupos —</option>
              {grupos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              name="area"
              defaultValue={area}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todas as áreas —</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Buscar
            </button>
          </div>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          {filtered.length} resultado(s).
        </p>
      </section>

      {Object.keys(grouped).length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum CID encontrado.
        </section>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <section
            key={groupName}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {groupName} ({items.length})
              </h3>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-lg font-semibold text-sky-700">
                      {item.codigo}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                      {item.descricao}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.area ? (
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {item.area}
                      </span>
                    ) : null}

                    {item.tags
                      ? item.tags.split(",").map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700"
                          >
                            {tag.trim()}
                          </span>
                        ))
                      : null}
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