"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, LibraryBig } from "lucide-react";
import { AclsEbookSourceView } from "@/components/acls-ebook-source-view";
import type { AclsEbookSourceChapter } from "@/lib/acls-ebook-source";

export type AclsEbookChapter = {
  slug: string;
  label: string;
  group: string;
  pages: [number, number];
};

type Props = {
  chapters: AclsEbookChapter[];
  sourceChapter?: AclsEbookSourceChapter;
  initialLastPage?: boolean;
};

export function ebookChapterHref(chapter?: Pick<AclsEbookChapter, "slug">, lastPage = false) {
  if (!chapter) return "/acls/ebook";
  return `/acls/ebook?capitulo=${encodeURIComponent(chapter.slug)}${lastPage ? "&pagina=ultima" : ""}`;
}

function EbookCover({ chapters }: { chapters: AclsEbookChapter[] }) {
  return (
    <div className="mx-auto max-w-6xl pb-12">
      <header className="mb-5 flex items-center justify-between gap-4 px-1">
        <Link
          href="/acls"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#123A6D]/30 hover:text-[#123A6D] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao ACLS
        </Link>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">Biblioteca Resibook</span>
      </header>

      <section className="relative overflow-hidden rounded-[36px] bg-[#071a33] text-white shadow-[0_30px_80px_-30px_rgba(7,26,51,0.65)]">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_75%_18%,#3b82f6_0,transparent_30%),linear-gradient(115deg,transparent_45%,rgba(255,255,255,.08)_46%,transparent_47%)]" />
        <div className="relative grid min-h-[610px] gap-10 px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[1fr_390px] lg:items-center lg:px-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-blue-200">
              <LibraryBig className="h-5 w-5" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]">Resibook Editions</p>
            </div>
            <p className="mt-16 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200/80">Manual clínico completo</p>
            <h1 className="mt-4 font-serif text-6xl font-bold tracking-[-0.055em] sm:text-8xl">ACLS</h1>
            <div className="mt-7 h-px w-36 bg-gradient-to-r from-blue-300 to-transparent" />
            <p className="mt-7 max-w-xl font-serif text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-10">
              Anotações essenciais para suporte avançado de vida cardiovascular.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={ebookChapterHref(chapters[0])}
                className="inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-6 text-sm font-extrabold !text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <BookOpen className="h-5 w-5" /> Começar a leitura
              </Link>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-blue-100">
                {chapters.length} capítulos · ECGs de apoio
              </span>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-[350px] perspective-distant lg:block" aria-hidden="true">
            <div className="relative aspect-[3/4.15] rotate-y-[-9deg] rounded-r-[22px] border border-white/20 bg-gradient-to-br from-[#174d89] via-[#0d315d] to-[#07182f] p-9 shadow-[28px_32px_55px_-18px_rgba(0,0,0,.65)]">
              <div className="absolute inset-y-0 left-0 w-5 border-r border-white/15 bg-black/20 shadow-[8px_0_16px_rgba(0,0,0,.25)]" />
              <div className="flex h-full flex-col justify-between border border-white/15 p-7">
                <div><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-200">Resibook</p><p className="mt-1 text-[9px] text-white/50">Clinical Editions</p></div>
                <div><p className="font-serif text-6xl font-bold tracking-[-0.06em]">ACLS</p><div className="mt-5 h-px w-20 bg-blue-300" /><p className="mt-5 font-serif text-sm leading-6 text-blue-100">Advanced Cardiovascular Life Support</p></div>
                <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/45">Edição digital</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#123A6D] dark:text-blue-300">Sumário</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Capítulos da edição</h2>
          </div>
          <span className="hidden text-xs font-semibold text-slate-400 sm:block">Selecione um capítulo para iniciar</span>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {chapters.map((chapter, index) => (
            <Link
              key={chapter.slug}
              href={ebookChapterHref(chapter)}
              prefetch={false}
              className="group flex min-h-20 items-center gap-4 border-b border-slate-100 px-2 py-4 transition hover:px-4 dark:border-slate-800"
            >
              <span className="font-serif text-2xl font-bold text-slate-300 transition group-hover:text-[#123A6D] dark:text-slate-700 dark:group-hover:text-blue-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-5 text-slate-800 group-hover:text-[#123A6D] dark:text-slate-100 dark:group-hover:text-blue-200">{chapter.label}</span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Páginas {chapter.pages[0]}–{chapter.pages[1]}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#123A6D]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AclsEbook({ chapters, sourceChapter, initialLastPage = false }: Props) {
  if (!sourceChapter) {
    return <EbookCover chapters={chapters} />;
  }

  const activeIndex = chapters.findIndex((chapter) => chapter.slug === sourceChapter.slug);

  return (
    <AclsEbookSourceView
      key={sourceChapter.slug}
      chapter={sourceChapter}
      chapters={chapters}
      activeIndex={activeIndex}
      initialLastPage={initialLastPage}
    />
  );
}
