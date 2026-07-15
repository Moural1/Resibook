"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpenCheck, ChevronDown, FileCheck2, ScanText } from "lucide-react";
import type {
  AclsEbookRichText,
  AclsEbookSourceBlock,
  AclsEbookSourceChapter,
} from "@/lib/acls-ebook-source";

function RichContent({ content }: { content: AclsEbookRichText[] }) {
  return content.map((segment, index) => {
    if (segment.kind === "image") {
      return (
        <span key={`${segment.src}-${index}`} className="my-3 block">
          <Image
            src={segment.src}
            alt="Ilustração clínica do material ACLS"
            width={1200}
            height={760}
            sizes="(max-width: 768px) 100vw, 720px"
            className="mx-auto h-auto max-h-[560px] w-auto max-w-full rounded-xl object-contain"
          />
        </span>
      );
    }

    const className = segment.red
      ? "font-bold text-red-600 dark:text-red-400"
      : segment.bold
        ? "font-bold text-slate-950 dark:text-white"
        : undefined;

    return <span key={`${segment.text}-${index}`} className={className}>{segment.text}</span>;
  });
}

function SourceTable({ block }: { block: Extract<AclsEbookSourceBlock, { kind: "table" }> }) {
  const columnCount = Math.max(...block.rows.map((row) => row.length));

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
                {Array.from({ length: columnCount }).map((_, cellIndex) => {
                  const isHeader = block.hasHeader && rowIndex === 0;
                  const Cell = isHeader ? "th" : "td";
                  return (
                    <Cell
                      key={cellIndex}
                      className={isHeader
                        ? "bg-[#123A6D] px-4 py-3 font-extrabold text-white"
                        : "border-r border-slate-200 px-4 py-3 align-top leading-6 text-slate-700 last:border-r-0 dark:border-slate-700 dark:text-slate-200"}
                    >
                      <RichContent content={row[cellIndex] ?? []} />
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceBlock({ block }: { block: AclsEbookSourceBlock }) {
  if (block.kind === "heading") {
    if (block.level <= 1) {
      return (
        <div className="mt-9 border-b-2 border-[#123A6D] pb-3 first:mt-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#123A6D] dark:text-blue-300">Divisão editorial</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#123A6D] dark:text-blue-100"><RichContent content={block.content} /></h2>
        </div>
      );
    }
    return (
      <h2 className="mt-8 rounded-xl border-l-4 border-[#123A6D] bg-slate-100 px-4 py-3 text-base font-black uppercase tracking-wide text-slate-950 dark:bg-slate-800 dark:text-white">
        <RichContent content={block.content} />
      </h2>
    );
  }

  if (block.kind === "table") return <SourceTable block={block} />;

  if (block.kind === "image") {
    return (
      <figure className="my-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <Image
          src={block.src}
          alt="Ilustração clínica do material ACLS"
          width={1400}
          height={900}
          sizes="(max-width: 768px) 100vw, 760px"
          className="mx-auto h-auto max-h-[620px] w-auto max-w-full object-contain"
        />
      </figure>
    );
  }

  const numbered = block.listStyle === "number";
  return (
    <div className={`my-2.5 flex gap-3 rounded-xl px-3 py-2.5 text-[15px] leading-7 text-slate-700 dark:text-slate-200 ${block.listStyle ? "bg-slate-50 dark:bg-slate-900/70" : ""}`}>
      {block.listStyle ? (
        <span className={`mt-2 h-2 w-2 shrink-0 ${numbered ? "rounded-sm bg-[#123A6D]" : "rounded-full bg-[#123A6D]"}`} aria-hidden="true" />
      ) : null}
      <p className="min-w-0"><RichContent content={block.content} /></p>
    </div>
  );
}

function pageRange(start: number, end: number) {
  return start === end ? `Página ${start}` : `Páginas ${start}–${end}`;
}

export function AclsEbookSourceView({ chapter }: { chapter: AclsEbookSourceChapter }) {
  const [showFacsimiles, setShowFacsimiles] = useState(false);
  const [startPage, endPage] = chapter.sourcePages;
  const facsimilePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="bg-[#123A6D] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-100">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Anotações ACLS</span>
          <span>{pageRange(startPage, endPage)} do PDF oficial</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-4xl">{chapter.title}</h1>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold"><BookOpenCheck className="h-4 w-4" /> Leitura responsiva</span>
          <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold"><FileCheck2 className="h-4 w-4" /> Conteúdo integral</span>
          <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold"><ScanText className="h-4 w-4" /> PDF prevalece</span>
        </div>
      </header>

      <section aria-label="Leitura adaptada" className="px-3 py-5 sm:px-7 sm:py-8">
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
          O conteúdo abaixo foi reorganizado apenas visualmente. Textos originalmente em vermelho continuam em vermelho; imagens, tabelas, doses e repetições foram mantidas.
        </div>
        {chapter.blocks.map((block, index) => <SourceBlock key={index} block={block} />)}
      </section>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
        <button
          type="button"
          aria-expanded={showFacsimiles}
          onClick={() => setShowFacsimiles((current) => !current)}
          className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-8"
        >
          <span>
            <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-[#123A6D] dark:text-blue-300">Conferência integral</span>
            <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-white">Abrir páginas originais do PDF</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#123A6D] px-3 py-1.5 text-[10px] font-extrabold text-white">
            {facsimilePages.length} páginas
            <ChevronDown className={`h-3.5 w-3.5 transition ${showFacsimiles ? "rotate-180" : ""}`} />
          </span>
        </button>
        {showFacsimiles ? (
          <div className="space-y-5 border-t border-slate-200 p-3 dark:border-slate-800 sm:p-6">
            {facsimilePages.map((page) => (
              <figure key={page} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <figcaption className="border-b border-slate-200 px-4 py-2 text-xs font-extrabold text-[#123A6D] dark:border-slate-700 dark:text-blue-300">Página oficial {page}</figcaption>
                <Image
                  src={`/acls-ebook/source/pages/page-${String(page).padStart(3, "0")}.webp`}
                  alt={`Página ${page} do PDF oficial Anotações ACLS`}
                  width={911}
                  height={1286}
                  sizes="(max-width: 768px) 100vw, 820px"
                  loading="lazy"
                  unoptimized
                  className="h-auto w-full"
                />
              </figure>
            ))}
          </div>
        ) : null}
      </section>
    </article>
  );
}
