"use client";

import { useMemo, useState } from "react";
import CopyButton from "./copy-button";
import SearchInput from "./search-input";
import { formatLabel, includesSearch } from "../lib/search";

type ExamTemplate = {
  id: number;
  categoria: string;
  titulo: string;
  conteudo: string;
  sexo: string | null;
  source_file: string;
};

type Props = {
  templates: ExamTemplate[];
};

function buildTags(item: ExamTemplate) {
  const tags = [item.categoria, item.sexo].filter(Boolean) as string[];
  return tags.length ? tags : ["Clínica médica"];
}

function groupTemplates(items: ExamTemplate[]) {
  return items.reduce<Record<string, ExamTemplate[]>>((acc, item) => {
    const key = item.categoria || "Sem categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function ExamTemplatesBrowser({ templates }: Props) {
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) =>
      includesSearch(
        [item.categoria, item.titulo, item.conteudo, item.sexo, item.source_file],
        query
      )
    );
  }, [templates, query]);

  const grouped = useMemo(() => groupTemplates(filteredTemplates), [filteredTemplates]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Biblioteca clínica
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca instantânea por exames, evolução e condutas.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por categoria, título ou conteúdo..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredTemplates.length} de {templates.length} blocos
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

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Nenhum bloco encontrado para essa busca.
        </div>
      ) : (
        Object.entries(grouped).map(([categoria, items]) => (
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
                  {items.length} bloco{items.length > 1 ? "s" : ""} nesta categoria
                </p>
              </div>

              <div className="self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </div>
            </div>

            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {buildTags(item).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {formatLabel(tag)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      {formatLabel(item.titulo)}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.source_file || "Modelo clínico estruturado"}
                    </p>
                  </div>

                  <CopyButton text={item.conteudo} />
                </div>

                <div className="mt-4 rounded-2xl bg-[#071b4d] px-5 py-5">
                  <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                    {item.conteudo}
                  </pre>
                </div>

                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                    Editar este bloco
                  </summary>

                  <form
                    action={`/api/exam-templates/${item.id}`}
                    method="POST"
                    className="mt-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="categoria"
                        defaultValue={item.categoria}
                        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      />
                      <input
                        name="titulo"
                        defaultValue={item.titulo}
                        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      />
                      <input
                        name="sexo"
                        defaultValue={item.sexo ?? ""}
                        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      />
                      <input
                        name="source_file"
                        defaultValue={item.source_file}
                        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      />
                    </div>

                    <textarea
                      name="conteudo"
                      rows={8}
                      defaultValue={item.conteudo}
                      className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none"
                    />

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                      >
                        Salvar edição
                      </button>
                      <button
                        type="submit"
                        name="intent"
                        value="delete"
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700"
                      >
                        Apagar
                      </button>
                    </div>
                  </form>
                </details>
              </article>
            ))}
          </div>
        ))
      )}
    </div>
  );
}