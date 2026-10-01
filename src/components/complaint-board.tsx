"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { QUICK_COMPLAINTS, type QuickComplaint } from "@/lib/clinical-quick-complaints";

const GROUPS = ["Todas", "Urgência", "PA", "Clínica"] as const;
type GroupFilter = (typeof GROUPS)[number];

const GROUP_TONE: Record<QuickComplaint["group"], string> = {
  Urgência: "border-rose-200 bg-rose-50 text-rose-800",
  PA: "border-amber-200 bg-amber-50 text-amber-800",
  Clínica: "border-slate-200 bg-slate-50 text-slate-600",
  Estudo: "border-slate-200 bg-slate-50 text-slate-600",
};

function queryHref(path: string, query: string) {
  return `${path}?q=${encodeURIComponent(query)}`;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/* Queixas rápidas do plantão: cada síndrome abre o roteiro completo e expõe
   os três atalhos mais usados; os demais ficam em "Mais ações". */
export default function ComplaintBoard() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("Todas");

  const items = useMemo(() => {
    const q = normalize(query.trim());
    return QUICK_COMPLAINTS.filter((item) => {
      if (group !== "Todas" && item.group !== group) return false;
      if (!q) return true;
      return normalize([item.title, item.description, ...item.terms].join(" ")).includes(q);
    });
  }, [query, group]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Buscar queixa</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar queixa ou sigla (ex.: IAM, AVC)"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
        <div role="group" aria-label="Filtrar por contexto" className="flex flex-wrap gap-1.5">
          {GROUPS.map((option) => {
            const active = option === group;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(option)}
                className={`h-8 rounded-full border px-3 text-xs font-medium transition ${
                  active
                    ? "border-cyan-800 bg-cyan-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {items.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ComplaintCard key={item.title} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          Nenhuma queixa encontrada. Tente outro termo ou{" "}
          <Link href={queryHref("/condutas", query)} className="font-medium text-cyan-800 underline-offset-2 hover:underline">
            busque nas condutas
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function ComplaintCard({ item }: { item: QuickComplaint }) {
  const { title, description, href, group } = item;
  const quick = [
    { label: "Conduta", href },
    { label: "Prescrição", href: queryHref("/prescricao", title) },
    { label: "CID", href: queryHref("/cids", title) },
  ];
  const more = [
    { label: "Caso rápido", href: queryHref("/caso-rapido", title) },
    { label: "Plano terapêutico", href: queryHref("/plantao/prescricao-guiada", title) },
    { label: "Exames e evolução", href: queryHref("/exames-evolucao", title) },
    { label: "Encaminhamento", href: queryHref("/plantao/encaminhamento", title) },
    { label: "Alta segura", href: queryHref("/plantao/alta-segura", title) },
  ];

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${GROUP_TONE[group]}`}>{group}</span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>

      <div className="mt-auto pt-4">
        <Link
          href={queryHref("/plantao/roteiro-caso", title)}
          className="group flex h-10 items-center justify-between rounded-lg border border-cyan-100 bg-cyan-50 px-3.5 text-sm font-semibold text-cyan-900 transition hover:border-cyan-800 hover:bg-cyan-800 hover:text-white"
        >
          Abrir roteiro do caso
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {quick.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-[13px] font-medium text-slate-700 transition hover:border-cyan-800/40 hover:bg-cyan-50 hover:text-cyan-900"
            >
              {action.label}
            </Link>
          ))}
        </div>

        <details className="group/more mt-2">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-800">
            Mais ações
            <ChevronDown className="h-3.5 w-3.5 transition group-open/more:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {more.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </article>
  );
}
