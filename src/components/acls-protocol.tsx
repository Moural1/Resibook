"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  HeartPulse,
  LockKeyhole,
  Search,
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

function lineTone(line: string) {
  if (/^\*\*.*\*\*$/.test(line)) return "dose";
  if (/^❌/.test(line)) return "contraindication";
  if (/^(⚠️|🚨)/.test(line)) return line.includes("NÃO") ? "contraindication" : "alert";
  if (/^(➡️|✅|✔)/.test(line)) return "conduct";
  if (/^🧠/.test(line)) return "pearl";
  return "default";
}

function ProtocolLines({ lines, flow = false }: { lines: string[]; flow?: boolean }) {
  return (
    <div className={flow ? "mx-auto max-w-xl space-y-2.5" : "space-y-2.5"}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return null;

        if (line === "---") {
          return <div key={index} className="my-4 border-t border-slate-200" />;
        }

        if (line === "↓") {
          return (
            <div key={index} className="flex h-9 flex-col items-center justify-center" aria-hidden="true">
              <span className="h-5 w-px bg-cyan-300" />
              <span className="-mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-700 text-[10px] font-bold text-white">↓</span>
            </div>
          );
        }

        if (flow && (line === "OU" || line === "+")) {
          return (
            <div key={index} className="flex justify-center py-0.5">
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-800">
                {line}
              </span>
            </div>
          );
        }

        if (/^\|.*\|$/.test(line)) {
          if (/^\|[\s|:-]+\|$/.test(line)) return null;
          const cells = line
            .slice(1, -1)
            .split("|")
            .map((cell) => cleanMarkdown(cell.trim()));
          const nextLine = lines[index + 1]?.trim() || "";
          const header = /^\|[\s|:-]+\|$/.test(nextLine);

          return (
            <div
              key={index}
              className={`grid overflow-hidden rounded-xl border text-xs sm:text-sm ${header ? "border-blue-200 bg-blue-50 font-bold text-blue-950" : "border-slate-200 bg-white text-slate-700"}`}
              style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
            >
              {cells.map((cell, cellIndex) => (
                <div key={cellIndex} className="border-r border-inherit px-3 py-2.5 last:border-r-0">
                  {cell}
                </div>
              ))}
            </div>
          );
        }

        if (line.startsWith("## ") || line.startsWith("### ")) {
          const level = line.startsWith("### ") ? 4 : 3;
          return (
            <h3 key={index} className="mt-5 border-l-4 border-cyan-700 pl-3 text-sm font-bold text-slate-950 first:mt-0">
              {line.slice(level)}
            </h3>
          );
        }

        const tone = lineTone(line);
        const classes = {
          dose: "border-blue-200 bg-blue-50 text-blue-950 font-bold tabular-nums",
          alert: "border-amber-200 bg-amber-50 text-amber-950 font-semibold",
          contraindication: "border-rose-200 bg-rose-50 text-rose-950 font-semibold",
          conduct: "border-emerald-200 bg-emerald-50 text-emerald-950 font-semibold",
          pearl: "border-slate-800 bg-slate-950 text-white font-semibold",
          default: "border-slate-200 bg-white text-slate-700",
        }[tone];
        const isListItem = /^(- |• |✔ |☐ |☑ )/.test(line);
        const isEmphasized = tone !== "default" || isListItem;
        const isFlowStep = flow && !isListItem;

        return (
          <div
            key={index}
            className={isEmphasized || isFlowStep ? `rounded-xl border px-3.5 py-2.5 text-sm leading-6 ${isFlowStep && tone === "default" ? "border-cyan-200 bg-white text-center font-semibold text-slate-800 shadow-sm" : classes}` : "px-1 text-sm font-medium leading-6 text-slate-700"}
          >
            {cleanMarkdown(line)}
          </div>
        );
      })}
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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <span className="sr-only">Buscar protocolo ACLS</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar no ACLS"
          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />
      </label>
      <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group}</p>
          <div className="space-y-1">
          {filteredItems.filter((item) => item.group === group).map((item) => {
        const href = getAclsHref(item.slug);
        const active = pathname === href;

        if (!item.available) {
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs ${active ? "border-slate-300 bg-slate-100 text-slate-800" : "border-transparent text-slate-400"}`}
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
            className={`block rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${active ? "border-cyan-200 bg-cyan-50 text-cyan-950" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"}`}
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

export function AclsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[#081a3a] px-5 py-5 text-white md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <HeartPulse className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">Protocolos</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">ACLS</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs">
          <span className="bg-emerald-50 px-2 py-2.5 text-center text-emerald-800">Conduta</span>
          <span className="bg-blue-50 px-2 py-2.5 text-center text-blue-800">Dose</span>
          <span className="bg-amber-50 px-2 py-2.5 text-center text-amber-800">Alerta</span>
          <span className="bg-rose-50 px-2 py-2.5 text-center text-rose-800">Contraindicação</span>
          <span className="bg-slate-950 px-2 py-2.5 text-center text-white">Pérola</span>
        </div>

        <details className="group lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800">
            Navegar pelos protocolos
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="max-h-80 overflow-y-auto border-t border-slate-200 p-3">
            <ProtocolNavigation />
          </div>
        </details>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">ACLS</p>
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-700">ACLS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{parsed.title || protocol.title}</h2>
            {parsed.preamble.some((line) => line.trim() && line.trim() !== "---") ? (
              <div className="mt-3 max-w-sm">
                <ProtocolLines lines={parsed.preamble} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ChevronsUpDown className="h-4 w-4" />
            {allExpanded ? "Recolher tudo" : "Expandir tudo"}
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-900">
            <BookOpen className="h-4 w-4" />
            Navegação rápida
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setOpenSections((current) => new Set(current).add(section.id));
                  window.setTimeout(() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                }}
                className="rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-950 transition hover:border-cyan-300"
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
          const flow = normalizedTitle.includes("resumo rápido") || normalizedTitle.includes("algoritmo") || normalizedTitle.includes("fluxograma") || section.lines.filter((line) => line.trim() === "↓").length >= 3;
          const pearl = normalizedTitle.includes("pérolas") || normalizedTitle.includes("nunca esquecer");
          const alert = normalizedTitle.includes("alertas");
          const contraindication = normalizedTitle.includes("erros frequentes");
          const sectionClasses = pearl
            ? "border-slate-900 bg-slate-950"
            : contraindication
              ? "border-rose-200 bg-rose-50"
              : alert
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white";
          return (
            <details
              key={section.id}
              id={section.id}
              open={openSections.has(section.id)}
              onToggle={(event) => toggleSection(section.id, event.currentTarget.open)}
              className={`group scroll-mt-24 overflow-hidden rounded-2xl border shadow-sm ${sectionClasses}`}
            >
              <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold ${pearl ? "text-white" : "text-slate-950"}`}>
                {section.title}
                <ChevronDown className={`h-4 w-4 shrink-0 transition group-open:rotate-180 ${pearl ? "text-slate-300" : "text-slate-400"}`} />
              </summary>
              <div className={`border-t px-5 py-5 ${pearl ? "border-white/10 bg-white text-slate-950" : "border-slate-200 bg-slate-50/50"}`}>
                <ProtocolLines lines={section.lines} flow={flow} />
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-700">ACLS</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Protocolos ACLS</h2>
      <p className="mt-2 text-sm font-medium text-slate-600">Acesso rápido aos protocolos disponíveis.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {groups.map((group) => {
          const items = availableItems.filter((item) => item.group === group);
          return (
            <div key={group} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <h3 className="text-sm font-bold text-slate-950">{group}</h3>
                <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800">{items.length}</span>
              </div>
              <div className="grid gap-2 p-3">
                {items.map((item) => (
                  <Link key={item.slug} href={getAclsHref(item.slug)} className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-cyan-950">
                    {item.label}
                    <span className="text-cyan-700" aria-hidden="true">→</span>
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
