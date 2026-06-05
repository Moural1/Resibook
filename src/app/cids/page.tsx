"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CidsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allCids, setAllCids] = useState<CidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [grupo, setGrupo] = useState(searchParams.get("grupo") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Supabase não configurado.");
        setAllCids([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cids")
        .select("*")
        .order("grupo", { ascending: true })
        .order("codigo", { ascending: true });

      if (error) {
        console.error("Erro ao carregar CIDs:", error.message);
        setError(error.message);
        setAllCids([]);
      } else {
        setError("");
        setAllCids((data as CidItem[]) || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (grupo) params.set("grupo", grupo);
    if (area) params.set("area", area);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [query, grupo, area, pathname, router]);

  const grupos = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.grupo).filter(Boolean))
    ) as string[];
  }, [allCids]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.area).filter(Boolean))
    ) as string[];
  }, [allCids]);

  const filtered = useMemo(() => {
    return allCids.filter((item) => {
      const matchesQuery =
        !query ||
        normalize(item.codigo).includes(normalize(query)) ||
        normalize(item.descricao).includes(normalize(query)) ||
        normalize(item.tags || "").includes(normalize(query));

      const matchesGrupo = !grupo || item.grupo === grupo;
      const matchesArea = !area || item.area === area;

      return matchesQuery && matchesGrupo && matchesArea;
    });
  }, [allCids, query, grupo, area]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CidItem[]>>((acc, item) => {
      const key = item.grupo || "Sem grupo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

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
            Busca instantânea por código, descrição ou tag.
          </p>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {loading ? "Carregando..." : `Total carregado do banco: ${allCids.length}`}
          </p>

          {error ? (
            <p className="mt-2 text-sm font-medium text-rose-600">
              Erro: {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código (ex.: I10) ou nome (ex.: pneumonia, diabetes, HAS)..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
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
              value={area}
              onChange={(e) => setArea(e.target.value)}
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
              type="button"
              onClick={() => {
                setQuery("");
                setGrupo("");
                setArea("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          {loading ? "Carregando resultados..." : `${filtered.length} resultado(s).`}
        </p>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando CIDs...
        </section>
      ) : Object.keys(grouped).length === 0 ? (
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