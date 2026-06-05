"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";

type TopicoMedico = {
  id: number;
  area: string;
  titulo: string;
  resumo: string | null;
  diagnostico: string | null;
  criterios: string | null;
  exames: string | null;
  tratamento: string | null;
  conduta_urgencia: string | null;
  internacao_referencia: string | null;
  pegadinhas: string | null;
  tags: string | null;
  prioridade: number | null;
  fonte: string | null;
  atualizado_em: string | null;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatLabel(value?: string | null) {
  if (!value) return "Sem área";
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function buildReviewText(item: TopicoMedico) {
  const parts = [
    `# ${item.titulo}`,
    item.area ? `Área: ${item.area}` : "",
    item.resumo ? `Resumo: ${item.resumo}` : "",
    item.diagnostico ? `Diagnóstico: ${item.diagnostico}` : "",
    item.exames ? `Exames: ${item.exames}` : "",
    item.tratamento ? `Tratamento: ${item.tratamento}` : "",
    item.conduta_urgencia ? `Urgência: ${item.conduta_urgencia}` : "",
    item.pegadinhas ? `Pegadinhas: ${item.pegadinhas}` : "",
  ].filter(Boolean);

  return parts.join("\n\n");
}

function getMainConduct(item: TopicoMedico) {
  return (
    item.conduta_urgencia ||
    item.tratamento ||
    item.exames ||
    item.diagnostico ||
    item.resumo ||
    "Sem conteúdo"
  );
}

function CompactBlock({
  title,
  children,
}: {
  title: string;
  children?: string | null;
}) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {children}
      </p>
    </div>
  );
}

export default function RevisaoTopicosPage() {
  const [topicos, setTopicos] = useState<TopicoMedico[]>([]);
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTopicos() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("topicos_medicos")
      .select(
        "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
      )
      .order("area", { ascending: true })
      .order("titulo", { ascending: true });

    if (error) {
      setError(error.message);
      setTopicos([]);
    } else {
      setTopicos((data as TopicoMedico[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTopicos();
  }, []);

  const areas = useMemo(() => {
    return Array.from(new Set(topicos.map((item) => item.area))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [topicos]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return topicos.filter((item) => {
      const matchesArea = !selectedArea || item.area === selectedArea;

      const matchesQuery =
        !q ||
        normalize(item.area).includes(q) ||
        normalize(item.titulo).includes(q) ||
        normalize(item.resumo).includes(q) ||
        normalize(item.diagnostico).includes(q) ||
        normalize(item.criterios).includes(q) ||
        normalize(item.exames).includes(q) ||
        normalize(item.tratamento).includes(q) ||
        normalize(item.conduta_urgencia).includes(q) ||
        normalize(item.internacao_referencia).includes(q) ||
        normalize(item.pegadinhas).includes(q) ||
        normalize(item.tags).includes(q) ||
        normalize(item.fonte).includes(q);

      return matchesArea && matchesQuery;
    });
  }, [topicos, query, selectedArea]);

  const hasFilters = Boolean(query || selectedArea);

  function toggleExpanded(id: number) {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
              Revisão estruturada
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Prova e plantão
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Revisão de tópicos
          </h1>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Modo rápido para revisar o que mais cai: diagnóstico, exames,
            tratamento, urgência e pegadinhas.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            <span>Total carregado do banco: {topicos.length}</span>
            <span>•</span>
            <span>Exibindo: {filtered.length}</span>
          </div>

          {error ? (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              Erro: {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_280px_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar revisão, tema, tratamento, prova..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">Todas as áreas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {formatLabel(area)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedArea("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              {hasFilters ? "Limpar filtros" : "Filtros"}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando revisão...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum tópico encontrado.
        </section>
      ) : (
        <section className="grid gap-4">
          {filtered.map((item) => {
            const expanded = expandedIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {item.area}
                  </span>

                  {item.prioridade ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Prioridade {item.prioridade}
                    </span>
                  ) : null}

                  {item.fonte ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {item.fonte}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {item.titulo}
                    </h2>

                    {item.resumo ? (
                      <p className="mt-2 max-w-5xl text-sm leading-7 text-slate-600">
                        {item.resumo}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={buildReviewText(item)} />

                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      {expanded ? "Ver menos" : "Ver completo"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                    Conduta principal
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {getMainConduct(item)}
                  </p>
                </div>

                {item.pegadinhas ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
                      Pegadinhas de prova
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {item.pegadinhas}
                    </p>
                  </div>
                ) : null}

                {expanded ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <CompactBlock title="Diagnóstico">
                      {item.diagnostico}
                    </CompactBlock>

                    <CompactBlock title="Critérios / classificação">
                      {item.criterios}
                    </CompactBlock>

                    <CompactBlock title="Exames">{item.exames}</CompactBlock>

                    <CompactBlock title="Tratamento">
                      {item.tratamento}
                    </CompactBlock>

                    <CompactBlock title="Conduta na urgência">
                      {item.conduta_urgencia}
                    </CompactBlock>

                    <CompactBlock title="Internação / referência">
                      {item.internacao_referencia}
                    </CompactBlock>
                  </div>
                ) : null}

                {item.tags ? (
                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Tags: {item.tags}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}