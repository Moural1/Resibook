"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export const RESIBOOK_GUARD_ITEMS = [
  "Alergias",
  "Gestação / lactação",
  "Função renal",
  "Função hepática",
  "Idade / peso",
  "QT longo",
  "Anticoagulação",
  "Interações medicamentosas",
  "Sinais de gravidade",
  "Protocolo local",
] as const;

type GuardContext =
  | "prescricao"
  | "conduta"
  | "plantao"
  | "alta"
  | "calculadora";

type Props = {
  context: GuardContext;
  defaultExpanded?: boolean;
};

const CONTEXT_LABELS: Record<GuardContext, string> = {
  prescricao: "Antes de prescrever",
  conduta: "Antes de aplicar a conduta",
  plantao: "Antes de avançar no caso",
  alta: "Antes de concluir a alta",
  calculadora: "Antes de usar o resultado",
};

export default function ResibookGuard({
  context,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const completed = checkedItems.length;
  const complete = completed === RESIBOOK_GUARD_ITEMS.length;

  const progressLabel = useMemo(
    () => `${completed}/${RESIBOOK_GUARD_ITEMS.length} conferidos`,
    [completed]
  );

  function toggleItem(item: string) {
    setCheckedItems((current) =>
      current.includes(item)
        ? current.filter((currentItem) => currentItem !== item)
        : [...current, item]
    );
  }

  return (
    <section
      data-resibook-guard={context}
      className="overflow-hidden rounded-[20px] border border-cyan-200/80 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-cyan-50/45 md:px-5"
        aria-expanded={expanded}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            complete
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-cyan-200 bg-cyan-50 text-cyan-800"
          }`}
        >
          {complete ? (
            <Check className="h-5 w-5" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-950">
              Resibook Guard
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {CONTEXT_LABELS[context]}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Segurança antes de alta, prescrição e decisões críticas ·{" "}
            {progressLabel}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="border-t border-slate-200/80 bg-slate-50/55 p-4 md:p-5">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {RESIBOOK_GUARD_ITEMS.map((item) => {
              const checked = checkedItems.includes(item);

              return (
                <label
                  key={item}
                  className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    checked
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      checked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {checked ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span>{item}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-4xl text-xs leading-5 text-slate-600">
              Ferramenta de apoio. Conferir dados clínicos, contraindicações e
              protocolo local antes de aplicar.
            </p>
            {completed > 0 ? (
              <button
                type="button"
                onClick={() => setCheckedItems([])}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar conferência
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
