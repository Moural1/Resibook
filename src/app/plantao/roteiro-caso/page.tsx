"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CopyButton from "../../../components/copy-button";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import { buildCaseRouting } from "@/lib/clinical-case-routing";
import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";

function buildCopyText(route: ReturnType<typeof buildCaseRouting>, notes: string) {
  return [
    "ROTEIRO DE CASO - RESIBOOK",
    `Queixa: ${route.title}`,
    `Confiança do encaixe: ${route.confidence}`,
    route.complaint ? `Grupo: ${route.complaint.group}` : "Grupo: não classificado",
    "",
    "Resumo operacional:",
    route.summary,
    "",
    "Prioridades:",
    ...route.priorities.map((item) => `- ${item}`),
    "",
    "Red flags para revisar:",
    ...route.riskPrompts.map((item) => `- ${item}`),
    "",
    "Fluxo sugerido:",
    ...route.routes.map((item) => `- ${item.label}: ${item.intent}`),
    notes.trim() ? "" : null,
    notes.trim() ? `Notas do caso: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CaseRoutePage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const incoming = searchParams.get("q") || searchParams.get("busca") || "";
    if (incoming.trim()) setQuery(incoming);
  }, [searchParams]);

  const route = useMemo(() => buildCaseRouting(query), [query]);
  const copyText = useMemo(() => buildCopyText(route, notes), [route, notes]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/plantao"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Central de plantão
              </Link>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Roteador clínico
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Roteiro de caso
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Digite uma queixa livre e transforme o atendimento em próximos passos: caso, conduta, risco, plano, exames, alta, passagem e CID.
              </p>
            </div>

            <CopyButton text={copyText} label="Copiar roteiro" copiedLabel="Roteiro copiado" />
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Queixa ou cenário
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ex.: dor no peito, PA alta, tontura, escorpião..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Encaixe" value={route.confidence} />
                <Metric label="Síndrome" value={route.complaint ? "detectada" : "livre"} />
                <Metric label="Ações" value={route.routes.length} />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sugestões rápidas
              </p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {QUICK_COMPLAINTS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setQuery(item.title)}
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                      route.complaint?.title === item.title
                        ? "border-slate-300 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <label className="block rounded-[24px] border border-slate-200 bg-white p-4">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Notas do caso
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                placeholder="Ex.: idade, sinais vitais, tempo de evolução, red flags negadas/positivas, pendências."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </label>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Resultado
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {route.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {route.summary}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  <Sparkles className="h-4 w-4" />
                  {route.confidence}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <InfoBlock title="Prioridades" items={route.priorities} icon={ClipboardCheck} />
                <InfoBlock title="Red flags" items={route.riskPrompts} icon={ShieldAlert} />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                  <Workflow className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Próximos passos
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                    Abrir módulos já no contexto
                  </h2>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {route.routes.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                        <Stethoscope className="h-4.5 w-4.5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.intent}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Texto copiável
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Roteiro para prontuário/passagem
                  </h2>
                </div>
                <CopyButton text={copyText} label="Copiar" copiedLabel="Copiado" />
              </div>

              <pre className="mt-4 max-h-[340px] overflow-auto whitespace-pre-wrap rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                {copyText}
              </pre>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-slate-950">{value}</p>
    </div>
  );
}

function InfoBlock({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
            <FileText className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
