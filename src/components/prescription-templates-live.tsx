"use client";

import { useMemo, useState } from "react";
import CopyButton from "./copy-button";

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
  created_at: string;
};

type Props = {
  templates: PrescriptionTemplate[];
};

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesSearch(parts: Array<string | null | undefined>, query: string) {
  const q = normalize(query);
  if (!q) return true;

  const haystack = parts.map(normalize).join(" ");
  return haystack.includes(q);
}

function formatLabel(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function groupTemplates(items: PrescriptionTemplate[]) {
  return items.reduce<Record<string, PrescriptionTemplate[]>>((acc, item) => {
    const key = item.categoria || "Sem categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function PrescriptionTemplatesLive({ templates }: Props) {
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) =>
      includesSearch(
        [
          item.categoria,
          item.titulo,
          item.conteudo,
          item.observacoes,
          item.source_file,
        ],
        query
      )
    );
  }, [templates, query]);

  const groupedTemplates = useMemo(
    () => groupTemplates(filteredTemplates),
    [filteredTemplates]
  );

  return (
    <section className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Biblioteca de plantão
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Modelos prontos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Digite e filtre instantaneamente por título, categoria, conteúdo ou observações.
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar modelo de prescrição..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredTemplates.length} de {templates.length} modelos
          </span>

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </section>

      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Nenhum modelo encontrado para essa busca.
        </div>
      ) : (
        Object.entries(groupedTemplates).map(([categoria, items]) => (
          <div key={categoria} className="space-y-4">
            <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                  {formatLabel(categoria)}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {formatLabel(categoria)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {items.length} modelo{items.length > 1 ? "s" : ""} nesta categoria
                </p>
              </div>

              <div className="self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {formatLabel(item.categoria || "Sem categoria")}
                    </span>

                    {item.source_file ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.source_file}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        {formatLabel(item.titulo)}
                      </h3>

                      {item.observacoes ? (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.observacoes}
                        </p>
                      ) : null}
                    </div>

                    <CopyButton text={item.conteudo} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                    <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                      {item.conteudo}
                    </pre>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}