"use client";

import { useMemo, useState } from "react";
import SearchInput from "./search-input";
import { rankSearchResults } from "../lib/search";

type CidItem = {
  id: number;
  codigo: string;
  descricao: string;
  grupo: string | null;
  area: string | null;
  prioridade: number | null;
  tags: string | null;
};

type Props = {
  cids: CidItem[];
};

export default function CidsBrowser({ cids }: Props) {
  const [query, setQuery] = useState("");
  const [grupo, setGrupo] = useState("");
  const [area, setArea] = useState("");

  const grupos = useMemo(() => {
    return Array.from(new Set(cids.map((item) => item.grupo).filter(Boolean))) as string[];
  }, [cids]);

  const areas = useMemo(() => {
    return Array.from(new Set(cids.map((item) => item.area).filter(Boolean))) as string[];
  }, [cids]);

  const filtered = useMemo(() => {
    const filteredBySelects = cids.filter((item) => {
      const matchesGrupo = !grupo || item.grupo === grupo;
      const matchesArea = !area || item.area === area;

      return matchesGrupo && matchesArea;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.codigo, weight: 12 },
      { value: item.descricao, weight: 8 },
      { value: item.tags, weight: 5 },
      { value: item.grupo, weight: 2 },
      { value: item.area, weight: 2 },
    ]);
  }, [cids, query, grupo, area]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CidItem[]>>((acc, item) => {
      const key = item.grupo || "Sem grupo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const hasFilters = Boolean(query || grupo || area);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por código (ex.: I10) ou nome (ex.: pneumonia, diabetes, HAS)..."
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

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setGrupo("");
                  setArea("");
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700"
              >
                Limpar filtros
              </button>
            ) : (
              <div className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white">
                Busca instantânea ativa
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">{filtered.length} resultado(s).</p>
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-sky-700">{item.codigo}</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                        {item.descricao}
                      </p>
                    </div>
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