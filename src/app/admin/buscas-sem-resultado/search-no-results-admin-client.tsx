"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock3,
  RefreshCw,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";

type TermRow = {
  term: string;
  count: number;
  contexts: Record<string, number>;
  lastSeenAt: string;
};

type Payload = {
  terms: TermRow[];
  summary: {
    totalEvents: number;
    uniqueTerms: number;
    periodStart: string | null;
    periodEnd: string | null;
  };
};

const CONTEXT_LABELS: Record<string, string> = {
  global: "Busca global",
  condutas: "Condutas",
  calculadoras: "Calculadoras",
};

function formatDate(value: string | null) {
  if (!value) return "Sem registros";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SearchNoResultsAdminClient() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/search-no-results", {
        cache: "no-store",
      });
      const next = (await response.json().catch(() => null)) as
        | Payload
        | { error?: string }
        | null;

      if (!response.ok || !next || !("terms" in next)) {
        throw new Error(
          (next && "error" in next && next.error) ||
            "Não foi possível carregar o painel."
        );
      }

      setPayload(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o painel."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTerms = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("pt-BR");
    if (!query) return payload?.terms || [];
    return (payload?.terms || []).filter((item) =>
      item.term.toLocaleLowerCase("pt-BR").includes(query)
    );
  }, [filter, payload]);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Inteligência editorial"
        title="Buscas sem resultado"
        description="Identifique lacunas reais da biblioteca clínica sem registrar dados sensíveis de pacientes."
        badges={[
          { label: "Somente administrador", tone: "cyan" },
          { label: "Termos sanitizados", tone: "emerald" },
        ]}
        metrics={[
          {
            label: "Eventos",
            value: payload?.summary.totalEvents ?? "—",
          },
          {
            label: "Termos únicos",
            value: payload?.summary.uniqueTerms ?? "—",
          },
          {
            label: "Último evento",
            value: formatDate(payload?.summary.periodEnd || null),
          },
        ]}
        error={error}
        actions={
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </button>
        }
        notice={
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <p className="text-sm leading-6 text-emerald-900">
              E-mails, datas completas, sequências numéricas longas e termos com
              marcadores de identificação do paciente são descartados antes da
              gravação.
            </p>
          </div>
        }
      />

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Prioridade editorial
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Termos mais procurados
            </h2>
          </div>

          <label className="relative block w-full md:max-w-sm">
            <SearchX className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filtrar termo..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            Carregando lacunas da busca...
          </div>
        ) : filteredTerms.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_100px_minmax(0,1fr)_180px] gap-4 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid">
              <span>Termo</span>
              <span>Buscas</span>
              <span>Contexto</span>
              <span>Última ocorrência</span>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredTerms.map((item, index) => (
                <article
                  key={`${item.term}-${index}`}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_100px_minmax(0,1fr)_180px] md:items-center md:gap-4"
                >
                  <p className="break-words text-sm font-semibold text-slate-950">
                    {item.term}
                  </p>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {item.count}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(item.contexts).map(([context, count]) => (
                      <span
                        key={context}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {CONTEXT_LABELS[context] || context} · {count}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDate(item.lastSeenAt)}
                  </span>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
            <SearchX className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Nenhuma busca sem resultado encontrada
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Os termos seguros aparecerão aqui conforme o uso.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
