"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "./copy-button";
import { showToast } from "../lib/toast";

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
  created_at: string;
};

type PrescriptionDraft = {
  medicamento: string;
  via: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
};

type Props = {
  templates: PrescriptionTemplate[];
  onUseTemplate: (draft: PrescriptionDraft) => void;
  initialQuery?: string;
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
  if (!value) return "Sem categoria";
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

function parseTemplateToDraft(item: PrescriptionTemplate): PrescriptionDraft {
  const text = item.conteudo || "";
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const medicationLine =
    lines.find((line) => /^\d+\)/.test(line)) || item.titulo || "";

  const posologiaLine =
    lines.find(
      (line) =>
        /tomar|aplicar|pingar|inalar|usar|fazer|diluir|colocar/i.test(line)
    ) || "";

  const viaLine =
    lines.find((line) => /^uso /i.test(line)) ||
    lines.find((line) => /via:/i.test(line)) ||
    "";

  const duracaoMatch =
    text.match(/por\s+\d+\s*(dias|dia|semanas|semana|meses|mês)/i) ||
    text.match(/dose única/i);

  const duracao = duracaoMatch ? duracaoMatch[0] : "";

  return {
    medicamento: medicationLine.replace(/^\d+\)\s*/, "").trim(),
    via: viaLine.replace(/^uso\s*/i, "").trim(),
    posologia: posologiaLine.trim(),
    duracao: duracao.trim(),
    orientacoes: item.observacoes || "",
  };
}

const FAVORITES_KEY = "resibook-prescription-template-favorites";

export default function PrescriptionTemplatesLive({
  templates,
  onUseTemplate,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  function toggleFavorite(id: number, title: string) {
    const isAlreadyFavorite = favoriteIds.includes(id);

    setFavoriteIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current]
    );

    showToast({
      title: isAlreadyFavorite ? "Favorito removido" : "Favorito salvo",
      description: title,
      variant: "success",
    });
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(templates.map((item) => item.categoria || "Sem categoria"))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";

      const matchesQuery = includesSearch(
        [
          item.categoria,
          item.titulo,
          item.conteudo,
          item.observacoes,
          item.source_file,
        ],
        query
      );

      const matchesCategory =
        !selectedCategory || itemCategory === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [templates, query, selectedCategory]);

  const favorites = useMemo(() => {
    const map = new Map(templates.map((item) => [item.id, item]));
    return favoriteIds
      .map((id) => map.get(id))
      .filter(Boolean) as PrescriptionTemplate[];
  }, [templates, favoriteIds]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";

      const matchesQuery = includesSearch(
        [
          item.categoria,
          item.titulo,
          item.conteudo,
          item.observacoes,
          item.source_file,
        ],
        query
      );

      const matchesCategory =
        !selectedCategory || itemCategory === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [favorites, query, selectedCategory]);

  const groupedTemplates = useMemo(
    () => groupTemplates(filteredTemplates),
    [filteredTemplates]
  );

  const hasFilters = Boolean(query || selectedCategory);

  function handleUse(item: PrescriptionTemplate) {
    onUseTemplate(parseTemplateToDraft(item));

    showToast({
      title: "Modelo aplicado ao formulário",
      description: item.titulo,
      variant: "success",
    });
  }

  function TemplateCard(item: PrescriptionTemplate, compact = false) {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <article
        key={item.id}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {formatLabel(item.categoria)}
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

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(item.id, item.titulo)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isFavorite
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isFavorite ? "★ Favorito" : "☆ Favoritar"}
            </button>

            <button
              type="button"
              onClick={() => handleUse(item)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Usar no formulário
            </button>

            <CopyButton text={item.conteudo} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
          <pre
            className={`whitespace-pre-wrap font-mono leading-7 text-slate-100 ${
              compact ? "text-[14px]" : "text-[15px]"
            }`}
          >
            {item.conteudo}
          </pre>
        </div>
      </article>
    );
  }

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
              Filtre por categoria, favorite os mais usados e clique em usar para preencher o formulário.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelo de prescrição..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatLabel(category)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("");
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {hasFilters ? "Limpar" : "Filtros"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredTemplates.length} de {templates.length} modelos
          </span>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {favorites.length} favoritos
            </span>

            {selectedCategory ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {formatLabel(selectedCategory)}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {filteredFavorites.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
                Favoritos
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Mais usados no plantão
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredFavorites.length} modelo{filteredFavorites.length > 1 ? "s" : ""} favorito{filteredFavorites.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredFavorites.map((item) => TemplateCard(item, true))}
          </div>
        </section>
      ) : null}

      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Nenhum modelo encontrado para esse filtro.
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
              {items.map((item) => TemplateCard(item))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}