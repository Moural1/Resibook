"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  ChevronDown,
  Home,
  List,
} from "lucide-react";
import { AclsProtocolView } from "@/components/acls-protocol";
import { AclsEbookSourceView } from "@/components/acls-ebook-source-view";
import type { AclsProtocol } from "@/lib/acls-protocols";
import type { AclsEbookSourceChapter } from "@/lib/acls-ebook-source";

export type AclsEbookChapter = {
  slug: string;
  label: string;
  group: string;
  edition: "protocolos" | "anotacoes";
  pages?: [number, number];
};

type Props = {
  chapters: AclsEbookChapter[];
  protocol?: AclsProtocol;
  sourceChapter?: AclsEbookSourceChapter;
};

function chapterHref(chapter?: Pick<AclsEbookChapter, "slug" | "edition">) {
  if (!chapter) return "/acls/ebook";
  const edition = chapter.edition === "anotacoes" ? "&edicao=anotacoes" : "";
  return `/acls/ebook?capitulo=${encodeURIComponent(chapter.slug)}${edition}`;
}

function chapterKey(chapter: Pick<AclsEbookChapter, "slug" | "edition">) {
  return `${chapter.edition}:${chapter.slug}`;
}

function EbookContents({
  chapters,
  activeKey,
  compact = false,
}: {
  chapters: AclsEbookChapter[];
  activeKey?: string;
  compact?: boolean;
}) {
  const groups = useMemo(
    () => Array.from(new Set(chapters.map((chapter) => chapter.group))),
    [chapters]
  );

  return (
    <nav aria-label="Sumário do eBook ACLS" className={compact ? "space-y-4" : "space-y-5"}>
      <Link
        href={chapterHref()}
        className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
          !activeKey
            ? "border-[#123A6D] bg-[#123A6D] text-white"
            : "border-slate-200 bg-white text-slate-700 hover:border-[#123A6D]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        }`}
      >
        <Home className="h-4 w-4 shrink-0" />
        Capa e sumário
      </Link>

      {groups.map((group) => (
        <section key={group}>
          <h3 className="mb-2 px-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {group}
          </h3>
          <div className="space-y-1">
            {chapters
              .filter((chapter) => chapter.group === group)
              .map((chapter) => {
                const active = chapterKey(chapter) === activeKey;
                const chapterNumber = chapters.findIndex((item) => chapterKey(item) === chapterKey(chapter)) + 1;

                return (
                  <Link
                    key={chapterKey(chapter)}
                    href={chapterHref(chapter)}
                    prefetch={false}
                    className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "border-[#123A6D]/30 bg-[#123A6D]/8 text-[#123A6D] dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-100"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${active ? "bg-[#123A6D] text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {chapterNumber}
                    </span>
                    <span className="min-w-0 leading-4">{chapter.label}</span>
                    {chapter.pages ? <span className="ml-auto shrink-0 text-[9px] opacity-60">p. {chapter.pages[0]}–{chapter.pages[1]}</span> : null}
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </nav>
  );
}

function EbookCover({ chapters }: { chapters: AclsEbookChapter[] }) {
  const groups = Array.from(new Set(chapters.map((chapter) => chapter.group)));
  const protocolCount = chapters.filter((chapter) => chapter.edition === "protocolos").length;
  const sourceCount = chapters.filter((chapter) => chapter.edition === "anotacoes").length;

  return (
    <div className="space-y-5">
      <section className="relative min-h-[520px] overflow-hidden rounded-[32px] bg-[#123A6D] px-6 py-10 text-white shadow-xl shadow-[#123A6D]/15 sm:px-10 sm:py-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="relative flex min-h-[420px] flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-blue-100">Resibook</p>
              <p className="mt-1 text-sm font-medium text-white/70">Sistema clínico</p>
            </div>
            <BookMarked className="h-8 w-8 text-blue-100" />
          </div>

          <div className="max-w-2xl py-12">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-50">
              eBook interativo
            </span>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">ACLS</h1>
            <div className="mt-5 h-1 w-24 rounded-full bg-white" />
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-blue-50 sm:text-xl">
              Protocolos rápidos e o conteúdo integral das Anotações ACLS em uma experiência editorial responsiva.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/20 pt-5 sm:flex sm:items-center sm:gap-6">
            <div><p className="text-2xl font-black">{protocolCount}</p><p className="text-xs font-semibold text-blue-100">protocolos rápidos</p></div>
            <div><p className="text-2xl font-black">{sourceCount}</p><p className="text-xs font-semibold text-blue-100">capítulos integrais</p></div>
            <div className="col-span-2 sm:ml-auto"><p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-blue-100">Template mestre editorial</p></div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123A6D] text-white"><List className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#123A6D] dark:text-blue-300">Navegação editorial</p>
            <h2 className="mt-0.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Sumário</h2>
          </div>
        </div>
        <div className="mt-5 lg:hidden">
          <EbookContents chapters={chapters} compact />
        </div>
        <div className="mt-5 hidden grid-cols-2 gap-x-6 gap-y-5 lg:grid">
          {groups.map((group) => (
            <div key={group} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#123A6D] dark:text-blue-300">{group}</h3>
              <div className="mt-3 space-y-1.5">
                {chapters.filter((chapter) => chapter.group === group).map((chapter) => (
                  <Link key={chapterKey(chapter)} href={chapterHref(chapter)} prefetch={false} className="flex min-h-10 items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:text-[#123A6D] dark:bg-slate-900 dark:text-slate-200 dark:hover:text-blue-200">
                    <span>{chapter.label}{chapter.pages ? <span className="ml-2 text-[9px] font-medium text-slate-400">p. {chapter.pages[0]}–{chapter.pages[1]}</span> : null}</span><ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AclsEbook({ chapters, protocol, sourceChapter }: Props) {
  const [progress, setProgress] = useState(0);
  const activeKey = sourceChapter
    ? chapterKey({ slug: sourceChapter.slug, edition: "anotacoes" })
    : protocol
      ? chapterKey({ slug: protocol.slug, edition: "protocolos" })
      : undefined;
  const activeIndex = activeKey ? chapters.findIndex((chapter) => chapterKey(chapter) === activeKey) : -1;
  const previous = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const next = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 100);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [activeKey]);

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="fixed inset-x-0 top-0 z-[80] h-1 bg-slate-200/70 dark:bg-slate-800" aria-hidden="true">
        <div className="h-full bg-[#123A6D] transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <header className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123A6D] text-white"><BookOpen className="h-5 w-5" /></span>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#123A6D] dark:text-blue-300">Resibook</p>
              <p className="text-sm font-black text-slate-950 dark:text-white">eBook ACLS</p>
            </div>
          </div>
          <Link href="/acls" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#123A6D]/30 hover:text-[#123A6D] dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-200">
            <ArrowLeft className="h-4 w-4" /> Protocolos
          </Link>
        </div>

        <details className="group mt-3 border-t border-slate-200 pt-3 dark:border-slate-800 lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl bg-slate-50 px-3 text-sm font-bold text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            Sumário do eBook
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            <EbookContents chapters={chapters} activeKey={activeKey} compact />
          </div>
        </details>
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:block">
          <div className="mb-4 border-b border-slate-200 px-2 pb-3 dark:border-slate-800">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#123A6D] dark:text-blue-300">Sumário</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{chapters.length} capítulos</p>
          </div>
          <EbookContents chapters={chapters} activeKey={activeKey} />
        </aside>

        <main className="min-w-0">
          {protocol || sourceChapter ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#123A6D] dark:text-blue-300">Capítulo {activeIndex + 1} de {chapters.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{chapters[activeIndex]?.group}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{Math.round(progress)}%</span>
              </div>

              {sourceChapter ? <AclsEbookSourceView chapter={sourceChapter} /> : <AclsProtocolView protocol={protocol!} />}

              <nav aria-label="Navegação entre capítulos" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
                {previous ? (
                  <Link href={chapterHref(previous)} className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#123A6D]/30 dark:border-slate-700">
                    <ArrowLeft className="h-4 w-4 shrink-0 text-[#123A6D] dark:text-blue-300" />
                    <span><span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Anterior</span><span className="mt-0.5 block text-xs font-bold text-slate-800 dark:text-slate-100">{previous.label}</span></span>
                  </Link>
                ) : <Link href={chapterHref()} className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"><Home className="h-4 w-4 text-[#123A6D]" /><span className="text-xs font-bold text-slate-800 dark:text-slate-100">Voltar à capa</span></Link>}
                {next ? (
                  <Link href={chapterHref(next)} className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-[#123A6D] px-4 py-3 text-white transition hover:bg-[#0e2f59]">
                    <span><span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-100">Próximo</span><span className="mt-0.5 block text-xs font-bold">{next.label}</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                ) : <Link href={chapterHref()} className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-[#123A6D] px-4 py-3 text-white"><span className="text-xs font-bold">Concluir e voltar ao sumário</span><Home className="h-4 w-4" /></Link>}
              </nav>
            </div>
          ) : (
            <EbookCover chapters={chapters} />
          )}
        </main>
      </div>
    </div>
  );
}
