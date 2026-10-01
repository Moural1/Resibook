"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  ClipboardCheck,
  Gem,
  GraduationCap,
  HeartPulse,
  Info,
  LockKeyhole,
  Pill,
  Search,
  Target,
  XCircle,
  Zap,
} from "lucide-react";
import { ACLS_NAVIGATION, getAclsHref } from "@/lib/acls-navigation";
import type { AclsProtocol } from "@/lib/acls-protocols";

type ProtocolSection = {
  id: string;
  title: string;
  lines: string[];
};

type ParsedProtocol = {
  title: string;
  preamble: string[];
  sections: ProtocolSection[];
};

type SectionKind =
  | "flow"
  | "information"
  | "conduct"
  | "medication"
  | "alert"
  | "contraindication"
  | "pearl"
  | "study"
  | "default";

type ContentBlock = {
  title: string | null;
  lines: string[];
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function parseProtocol(source: string): ParsedProtocol {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const usesPrimarySections = lines.filter((line) => line.startsWith("# ")).length > 1;
  const sections: ProtocolSection[] = [];
  const preamble: string[] = [];
  let current: ProtocolSection | null = null;
  let title = "";

  for (const line of lines) {
    if (!title && line.startsWith("# ")) {
      title = line.slice(2);
      continue;
    }

    const startsSection = usesPrimarySections
      ? line.startsWith("# ")
      : line.startsWith("## ");

    if (startsSection) {
      if (current) sections.push(current);
      const sectionTitle = line.slice(usesPrimarySections ? 2 : 3);
      current = { id: slugify(sectionTitle), title: sectionTitle, lines: [] };
      continue;
    }

    if (current) current.lines.push(line);
    else preamble.push(line);
  }

  if (current) sections.push(current);
  return { title, preamble, sections };
}

function cleanMarkdown(value: string) {
  return value.replace(/^\*\*(.*)\*\*$/, "$1");
}

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getSectionKind(title: string): SectionKind {
  const normalized = normalizeLabel(title);

  if (normalized.includes("modo estudo")) return "study";
  if (normalized.includes("perola") || normalized.includes("nunca esquecer")) return "pearl";
  if (normalized.includes("erro") || normalized.includes("nao desfibrilar") || normalized.includes("contraindic")) return "contraindication";
  if (normalized.includes("alerta") || normalized.includes("atencao") || normalized.includes("sedacao")) return "alert";
  if (normalized.includes("medic") || title.includes("💊") || normalized.includes("dose")) return "medication";
  if (normalized.includes("resumo") || normalized.includes("algoritmo") || normalized.includes("fluxograma")) return "flow";
  if (normalized.includes("objetivo") || normalized.includes("conduta") || normalized.includes("passo")) return "conduct";
  if (normalized.includes("quando utilizar") || normalized.includes("indicacao")) return "information";
  return "default";
}

function splitContentBlocks(lines: string[]) {
  const blocks: ContentBlock[] = [];
  let current: ContentBlock = { title: null, lines: [] };

  for (const line of lines) {
    if (line.trim().startsWith("## ") && !line.trim().startsWith("### ")) {
      if (current.title || current.lines.some((item) => item.trim())) blocks.push(current);
      current = { title: line.trim().slice(3), lines: [] };
    } else {
      current.lines.push(line);
    }
  }

  if (current.title || current.lines.some((item) => item.trim())) blocks.push(current);
  return blocks;
}

function isStepTitle(title: string) {
  const normalized = normalizeLabel(title).replace(/^[^a-z0-9]+/, "");
  return /^(passo\s*)?\d/.test(normalized) || normalized.startsWith("passo");
}

function sectionPresentation(kind: SectionKind) {
  return {
    flow: { label: "Fluxo", icon: Zap, shell: "border-l-cyan-700", iconTone: "text-cyan-700" },
    information: { label: "Informação", icon: Info, shell: "border-l-sky-600", iconTone: "text-sky-600" },
    conduct: { label: "Conduta", icon: Target, shell: "border-l-emerald-600", iconTone: "text-emerald-600" },
    medication: { label: "Medicamento", icon: Pill, shell: "border-l-violet-600", iconTone: "text-violet-600" },
    alert: { label: "Atenção", icon: AlertTriangle, shell: "border-l-amber-500", iconTone: "text-amber-600" },
    contraindication: { label: "Evitar", icon: XCircle, shell: "border-l-rose-600", iconTone: "text-rose-600" },
    pearl: { label: "Pérola", icon: Gem, shell: "border-l-slate-900", iconTone: "text-slate-900 dark:text-white" },
    study: { label: "Estudo", icon: GraduationCap, shell: "border-l-slate-400", iconTone: "text-slate-500" },
    default: { label: "Protocolo", icon: ClipboardCheck, shell: "border-l-slate-300", iconTone: "text-slate-500" },
  }[kind];
}

function lineTone(line: string) {
  if (/^\*\*.*\*\*$/.test(line)) return "dose";
  if (/^❌/.test(line)) return "contraindication";
  if (/^(⚠️|🚨)/.test(line)) return line.includes("NÃO") ? "contraindication" : "alert";
  if (/^(➡️|✅|✔)/.test(line)) return "conduct";
  if (/^🧠/.test(line)) return "pearl";
  return "default";
}

function RawProtocolLines({ lines, flow = false }: { lines: string[]; flow?: boolean }) {
  const rendered: React.ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    if (line === "---") {
      rendered.push(<div key={index} className="my-5 border-t border-slate-200 dark:border-slate-700" />);
      continue;
    }

    if (line === "↓") {
      rendered.push(
        <div key={index} className="flex h-6 flex-col items-center justify-center" aria-hidden="true">
          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-600" />
          <ChevronDown className="-mt-1 h-3.5 w-3.5 text-slate-400" />
        </div>
      );
      continue;
    }

    if (flow && /^(OU|\+|SIM|NÃO|NAO)$/.test(line)) {
      rendered.push(
        <div key={index} className="flex justify-center py-0.5">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {line}
          </span>
        </div>
      );
      continue;
    }

    if (/^\|.*\|$/.test(line)) {
      const tableLines: string[] = [];
      let tableIndex = index;
      while (tableIndex < lines.length && /^\|.*\|$/.test(lines[tableIndex].trim())) {
        tableLines.push(lines[tableIndex].trim());
        tableIndex += 1;
      }
      index = tableIndex - 1;
      const rows = tableLines
        .filter((row) => !/^\|[\s|:-]+\|$/.test(row))
        .map((row) => row.slice(1, -1).split("|").map((cell) => cleanMarkdown(cell.trim())));
      const hasHeader = tableLines.length > 1 && /^\|[\s|:-]+\|$/.test(tableLines[1]);

      rendered.push(
        <div key={`table-${index}`} className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          <table className="w-full min-w-[480px] border-collapse text-left text-xs sm:text-sm">
            <tbody>
              {rows.map((cells, rowIndex) => (
                <tr key={rowIndex} className={hasHeader && rowIndex === 0 ? "bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100" : "border-t border-slate-200 text-slate-700 first:border-t-0 dark:border-slate-800 dark:text-slate-200"}>
                  {cells.map((cell, cellIndex) => {
                    const Cell = hasHeader && rowIndex === 0 ? "th" : "td";
                    return <Cell key={cellIndex} className={`px-3.5 py-2.5 first:pl-4 ${hasHeader && rowIndex === 0 ? "font-semibold" : "font-medium"}`}>{cell}</Cell>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      rendered.push(
        <h4 key={index} className="mt-5 text-sm font-semibold text-slate-900 first:mt-0 dark:text-white">
          {line.slice(4)}
        </h4>
      );
      continue;
    }

    const doseLabel = /^(dose|dose inicial|doses adicionais|dose máxima|dose maxima|máximo|maximo|via|repetição|repeticao|frequência|frequencia|bolus|infusão|infusao|diluição|diluicao|administração|administracao)$/i.test(cleanMarkdown(line));
    const doseValue = /\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|g|ml|mL|UI|U|J|mmHg|mEq|%)(?:\s*\/\s*(?:kg|min|h|hora))?/i.test(cleanMarkdown(line));
    const tone = doseLabel || doseValue ? "dose" : lineTone(line);
    const classes = {
      dose: "border-violet-200 bg-violet-50 text-violet-950 font-semibold tabular-nums dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100",
      alert: "border-amber-200 bg-amber-50 text-amber-950 font-semibold dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
      contraindication: "border-rose-200 bg-rose-50 text-rose-950 font-semibold dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
      conduct: "border-emerald-200 bg-emerald-50 text-emerald-950 font-semibold dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
      pearl: "border-slate-300 bg-slate-50 text-slate-900 font-semibold dark:border-slate-600 dark:bg-slate-900 dark:text-white",
      default: "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
    }[tone];
    const isListItem = /^(- |• |✔ |☐ |☑ )/.test(line);
    const isEmphasized = tone !== "default" || isListItem;
    const isFlowStep = flow && !isListItem;

    rendered.push(
      <div
        key={index}
        className={isEmphasized || isFlowStep ? `rounded-lg border px-3.5 py-2 text-sm leading-6 ${isFlowStep ? "text-center" : ""} ${isFlowStep && tone === "default" ? "border-slate-200 bg-white font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" : classes}` : "px-1 text-sm font-medium leading-6 text-slate-700 dark:text-slate-200"}
      >
        {cleanMarkdown(line)}
      </div>
    );
  }

  return (
    <div className={flow ? "mx-auto max-w-md space-y-0" : "space-y-2"}>
      {rendered}
    </div>
  );
}

function ProtocolLines({ lines, flow = false, medication = false }: { lines: string[]; flow?: boolean; medication?: boolean }) {
  const blocks = splitContentBlocks(lines);
  const hasSubsections = blocks.some((block) => block.title);
  const firstStepIndex = blocks.findIndex((block) => block.title && isStepTitle(block.title));

  if (!hasSubsections) return <RawProtocolLines lines={lines} flow={flow} />;

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (!block.title) return <RawProtocolLines key={index} lines={block.lines} flow={flow} />;
        const step = isStepTitle(block.title);

        if (step) {
          return (
            <details key={index} open={index === firstStepIndex} className="group/step overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />{block.title}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open/step:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <RawProtocolLines lines={block.lines} flow={flow} />
              </div>
            </details>
          );
        }

        return (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              {medication ? <Pill className="h-4 w-4 text-violet-600" /> : null}
              {block.title}
            </h3>
            <RawProtocolLines lines={block.lines} flow={flow} />
          </div>
        );
      })}
    </div>
  );
}

function ProtocolMetadata({ lines }: { lines: string[] }) {
  const items = lines.map((line) => line.trim()).filter((line) => line && line !== "---");
  if (!items.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <span key={index} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {cleanMarkdown(item)}
        </span>
      ))}
    </div>
  );
}

function ProtocolNavigation() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredItems = ACLS_NAVIGATION.filter((item) =>
    !normalizedQuery || `${item.label} ${item.group}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
  );
  const groups = Array.from(new Set(filteredItems.map((item) => item.group)));

  return (
    <nav aria-label="Protocolos ACLS">
      <label className="relative mb-3 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <span className="sr-only">Buscar protocolo ACLS</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar no ACLS"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-700 dark:focus:ring-cyan-950"
        />
      </label>
      <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-1 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">{group}</p>
          <div className="space-y-0.5">
          {filteredItems.filter((item) => item.group === group).map((item) => {
        const href = getAclsHref(item.slug);
        const active = pathname === href;

        if (!item.available) {
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-sm ${active ? "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" : "border-transparent text-slate-400 dark:text-slate-600"}`}
              aria-disabled="true"
            >
              <span>{item.label}</span>
              <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={href}
            className={`block rounded-lg px-2.5 py-2 text-sm transition ${active ? "bg-cyan-50 font-medium text-cyan-900 dark:bg-cyan-950 dark:text-cyan-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            {item.label}
          </Link>
        );
          })}
          </div>
        </div>
      ))}
      </div>
    </nav>
  );
}

const LEGEND = [
  { label: "Conduta", dot: "bg-emerald-600" },
  { label: "Dose", dot: "bg-violet-600" },
  { label: "Alerta", dot: "bg-amber-500" },
  { label: "Contraindicação", dot: "bg-rose-600" },
  { label: "Pérola", dot: "bg-slate-900 dark:bg-white" },
];

export function AclsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <header className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-cyan-800 dark:text-cyan-300" />
            <div>
              <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">Protocolos</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">ACLS</h1>
            </div>
          </div>
          <Link href="/acls/ebook" className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-800 bg-cyan-800 px-4 text-sm font-medium text-white transition hover:bg-cyan-900">
            <BookMarked className="h-4 w-4" />
            Abrir eBook ACLS
          </Link>
        </div>

        <ul aria-label="Legenda de cores" className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
          {LEGEND.map((item) => (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${item.dot}`} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>

        <details className="group border-t border-slate-100 dark:border-slate-800 lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
            Navegar pelos protocolos
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="max-h-80 overflow-y-auto border-t border-slate-100 p-3 dark:border-slate-800">
            <ProtocolNavigation />
          </div>
        </details>
      </header>

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <ProtocolNavigation />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function AclsProtocolView({ protocol }: { protocol: AclsProtocol }) {
  const parsed = useMemo(() => parseProtocol(protocol.source), [protocol.source]);
  const sections = parsed.sections;
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sections[0] ? [sections[0].id] : [])
  );
  const allExpanded = sections.length > 0 && openSections.size === sections.length;

  function toggleAll() {
    setOpenSections(allExpanded ? new Set() : new Set(sections.map((section) => section.id)));
  }

  function toggleSection(id: string, open: boolean) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <article className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-2xl">{parsed.title || protocol.title}</h2>
            <ProtocolMetadata lines={parsed.preamble} />
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronsUpDown className="h-4 w-4" />
            {allExpanded ? "Recolher tudo" : "Expandir tudo"}
          </button>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
            Navegação rápida
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setOpenSections((current) => new Set(current).add(section.id));
                  window.setTimeout(() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                }}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-cyan-800/40 hover:bg-cyan-50 hover:text-cyan-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {sections.map((section) => {
          const normalizedTitle = section.title.toLowerCase();
          const kind = getSectionKind(section.title);
          const presentation = sectionPresentation(kind);
          const SectionIcon = presentation.icon;
          const flow = kind === "flow" || normalizedTitle.includes("algoritmo") || section.lines.filter((line) => line.trim() === "↓").length >= 3;
          const medication = kind === "medication";
          return (
            <details
              key={section.id}
              id={section.id}
              open={openSections.has(section.id)}
              onToggle={(event) => toggleSection(section.id, event.currentTarget.open)}
              className={`group scroll-mt-24 overflow-hidden rounded-xl border border-l-4 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${presentation.shell}`}
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-slate-900 dark:text-white sm:px-5">
                <span className="flex min-w-0 items-center gap-3">
                  <SectionIcon className={`h-4.5 w-4.5 shrink-0 ${presentation.iconTone}`} />
                  <span className="min-w-0"><span className="block text-xs text-slate-500 dark:text-slate-400">{presentation.label}</span><span className="block text-[15px] font-semibold leading-5">{section.title}</span></span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                <ProtocolLines lines={section.lines} flow={flow} medication={medication} />
              </div>
            </details>
          );
        })}
      </div>
    </article>
  );
}

export function AclsOverview() {
  const availableItems = ACLS_NAVIGATION.filter((item) => item.available && item.slug);
  const groups = Array.from(new Set(availableItems.map((item) => item.group)));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:p-6">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-2xl">Protocolos ACLS</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acesso rápido aos protocolos disponíveis.</p>
      <Link href="/acls/ebook" className="group mt-5 flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3.5 transition hover:border-cyan-800/40 hover:bg-cyan-50/40 dark:border-slate-700 dark:hover:bg-cyan-950/30">
        <span className="flex items-center gap-3">
          <BookMarked className="h-5 w-5 shrink-0 text-cyan-800 dark:text-cyan-300" />
          <span>
            <span className="block text-[15px] font-semibold text-slate-900 dark:text-white">eBook interativo ACLS</span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Novo modo de leitura: capa, sumário, capítulos e progresso.</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-800" />
      </Link>
      <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
        {groups.map((group) => {
          const items = availableItems.filter((item) => item.group === group);
          return (
            <div key={group} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{group}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{items.length}</span>
              </div>
              <div className="mt-2 divide-y divide-slate-100 border-y border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {items.map((item) => (
                  <Link key={item.slug} href={getAclsHref(item.slug)} className="group flex items-center justify-between gap-3 px-1 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
                    {item.label}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-cyan-800" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
