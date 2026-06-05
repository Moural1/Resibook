"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CopyButton from "./copy-button";
import { showToast } from "../lib/toast";

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  sexo: string | null;
  arquivo_origem: string | null;
  conteudo: string;
  created_at: string;
};

type ExamDraft = {
  categoria: string;
  titulo: string;
  sexo: string;
  arquivo_origem: string;
  conteudo: string;
};

type Props = {
  templates: ExamTemplate[];
  onUseTemplate: (draft: ExamDraft) => void;
  initialQuery?: string;
};

const FAVORITES_KEY = "resibook-exam-template-favorites";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

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
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function groupTemplates(items: ExamTemplate[]) {
  return items.reduce<Record<string, ExamTemplate[]>>((acc, item) => {
    const key = item.categoria || "Sem categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function toDraft(item: ExamTemplate): ExamDraft {
  return {
    categoria: item.categoria || "",
    titulo: item.titulo || "",
    sexo: item.sexo || "",
    arquivo_origem: item.arquivo_origem || "",
    conteudo: item.conteudo || "",
  };
}

export default function ExamTemplatesLive({
  templates,
  onUseTemplate,
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory) params.set("categoria", selectedCategory);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [query, selectedCategory, pathname, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed)) setFavoriteIds(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  const visibleTemplates = useMemo(() => {
    return templates.filter((item) => !deletedIds.includes(item.id));
  }, [templates, deletedIds]);

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

  async function handleDelete(item: ExamTemplate) {
    const confirmed = window.confirm(
      `Tem certeza que deseja apagar "${item.titulo}"?`
    );

    if (!confirmed) return;

    const supabase = getSupabase();

    if (!supabase) {
      showToast({
        title: "Erro ao apagar",
        description: "Supabase não configurado.",
        variant: "error",
      });
      return;
    }

    setDeletingIds((current) => [...current, item.id]);

    const { error } = await supabase
      .from("exam_templates")
      .delete()
      .eq("id", item.id);

    if (error) {
      showToast({
        title: "Erro ao apagar",
        description: error.message,
        variant: "error",
      });

      setDeletingIds((current) => current.filter((id) => id !== item.id));
      return;
    }

    setDeletedIds((current) => [...current, item.id]);
    setFavoriteIds((current) => current.filter((id) => id !== item.id));
    setDeletingIds((current) => current.filter((id) => id !== item.id));

    showToast({
      title: "Bloco apagado",
      description: item.titulo,
      variant: "success",
    });
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(visibleTemplates.map((item) => item.categoria || "Sem categoria"))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [visibleTemplates]);

  const filteredTemplates = useMemo(() => {
    return visibleTemplates.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";

      const matchesQuery = includesSearch(
        [
          item.categoria,
          item.titulo,
          item.sexo,
          item.arquivo_origem,
          item.conteudo,
        ],
        query
      );

      const matchesCategory =
        !selectedCategory || itemCategory === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [visibleTemplates, query, selectedCategory]);

  const favorites = useMemo(() => {
    const map = new Map(visibleTemplates.map((item) => [item.id, item]));

    return favoriteIds
      .map((id) => map.get(id))
      .filter(Boolean) as ExamTemplate[];
  }, [visibleTemplates, favoriteIds]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";

      const matchesQuery = includesSearch(
        [
          item.categoria,
          item.titulo,
          item.sexo,
          item.arquivo_origem,
          item.conteudo,
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

  function handleUse(item: ExamTemplate) {
    onUseTemplate(toDraft(item));

    showToast({
      title: "Modelo aplicado ao formulário",
      description: item.titulo,
      variant: "success",
    });
  }

  function Card(item: ExamTemplate, compact = false) {
    const isFavorite = favoriteIds.includes(item.id);
    const isDeleting = deletingIds.includes(item.id);

    return (
      <article
        key={item.id}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {formatLabel(item.categoria)}
          </span>

          {item.sexo ? (
            <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
              {item.sexo}
            </span>
          ) : null}

          {item.arquivo_origem ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {item.arquivo_origem}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {item.titulo}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(item.id, item.titulo)}
              disabled={isDeleting}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
              disabled={isDeleting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Usar no formulário
            </button>

            <CopyButton text={item.conteudo} />

            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={isDeleting}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Apagando..." : "Apagar"}
            </button>
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
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Biblioteca prática
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Modelos de exames e evolução
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Busca instantânea, favoritos e uso direto no formulário.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exame, evolução ou conduta..."
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
            {filteredTemplates.length} de {visibleTemplates.length} modelos
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
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
              Favoritos
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Mais usados
            </h2>
          </div>

          <div className="grid gap-4">
            {filteredFavorites.map((item) => Card(item, true))}
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
                  {items.length} modelo{items.length > 1 ? "s" : ""} nesta
                  categoria
                </p>
              </div>

              <div className="self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((item) => Card(item))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}