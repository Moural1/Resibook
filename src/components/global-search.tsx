"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchResult = {
  id: string;
  type: "paciente" | "prescricao" | "exame" | "flashcard" | "cid";
  title: string;
  subtitle: string;
  href: string;
  badge: string;
};

const badgeClasses: Record<SearchResult["type"], string> = {
  paciente: "bg-emerald-50 text-emerald-700 border-emerald-200",
  prescricao: "bg-blue-50 text-blue-700 border-blue-200",
  exame: "bg-violet-50 text-violet-700 border-violet-200",
  flashcard: "bg-cyan-50 text-cyan-700 border-cyan-200",
  cid: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/global-search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setResults([]);
          return;
        }

        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar pacientes, prescrições, exames, flashcards, CIDs..."
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      {open && hasQuery ? (
        <div className="absolute left-0 right-0 top-[56px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Busca global
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {loading ? (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                Buscando...
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                Nenhum resultado encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-start justify-between gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses[item.type]}`}
                    >
                      {item.badge}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}