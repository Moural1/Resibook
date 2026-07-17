"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  List,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import type { AclsEbookChapter } from "@/components/acls-ebook";
import type {
  AclsEbookRichText,
  AclsEbookSourceBlock,
  AclsEbookSourceChapter,
  AclsEbookFlowTone,
} from "@/lib/acls-ebook-schema";
import layoutHintsSource from "@/content/acls-ebook-layout-hints.json";
import {
  hasVisibleRichContent,
  removeLeadingListMarker,
  splitRichClauses,
  splitRichExplicitItems,
  splitRichSteps,
  structureRichContent,
  type EbookLayoutHint,
  type EbookStructuredItem,
} from "@/lib/acls-ebook-layout";
import {
  isMediaFocusedEbookPage,
  paginateEbookBlocks,
  type EbookReaderBlock,
} from "@/lib/acls-ebook-pagination";

const LAYOUT_HINTS = layoutHintsSource as Record<string, EbookLayoutHint[]>;

const FONT_CLASSES = [
  "text-[15px] sm:text-[16px]",
  "text-[17px] sm:text-[18px]",
  "text-[18px] sm:text-[19px]",
  "text-[20px] sm:text-[21px]",
  "text-[22px] sm:text-[23px]",
] as const;
const ZOOM_LABELS = ["90%", "100%", "110%", "120%", "135%"] as const;

function chapterHref(chapter?: Pick<AclsEbookChapter, "slug">, lastPage = false) {
  if (!chapter) return "/acls/ebook";
  return `/acls/ebook?capitulo=${encodeURIComponent(chapter.slug)}${lastPage ? "&pagina=ultima" : ""}`;
}

function RichContent({ content, inheritColor = false }: { content: AclsEbookRichText[]; inheritColor?: boolean }) {
  return (
    <span className="whitespace-pre-line break-keep [overflow-wrap:normal] [word-break:normal] hyphens-none">
      {content.map((segment, index) => {
        if (segment.kind === "image") {
          return (
            <span key={`${segment.src}-${index}`} className="my-5 block">
              <Image
                src={segment.src}
                alt="Ilustração clínica do material ACLS"
                width={1200}
                height={760}
                loading="eager"
                sizes="(max-width: 768px) 100vw, 760px"
                className="mx-auto h-auto max-h-[680px] w-full max-w-5xl object-contain"
              />
            </span>
          );
        }

        const className = inheritColor
          ? segment.bold || segment.red ? "font-bold" : undefined
          : segment.red
            ? "font-bold text-[#c62828] dark:text-red-400"
          : segment.bold
            ? "font-bold text-slate-950 dark:text-white"
            : undefined;

        return <span key={`${segment.text}-${index}`} className={className}>{segment.text}</span>;
      })}
    </span>
  );
}

function StructuredChildren({ items }: { items: AclsEbookRichText[][] }) {
  const visibleChildren = items.flatMap((child) => {
    const parts = splitRichSteps(child).map(removeLeadingListMarker);
    return parts.length ? parts : [removeLeadingListMarker(child)];
  });
  if (!visibleChildren.length) return null;
  return (
    <ul className="mt-3 grid gap-2 border-l-2 border-[#123A6D]/15 pl-4 sm:grid-cols-2">
      {visibleChildren.map((child, index) => (
        <li key={index} className="flex items-start gap-2 text-[0.94em] leading-6">
          <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d5d8f]" aria-hidden="true" />
          <span><RichContent content={child} /></span>
        </li>
      ))}
    </ul>
  );
}

function richTextValue(content: AclsEbookRichText[]) {
  return content
    .filter((segment): segment is Extract<AclsEbookRichText, { kind: "text" }> => segment.kind === "text")
    .map((segment) => segment.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function structuredCellData(content: AclsEbookRichText[], hints: EbookLayoutHint[]) {
  const structured = structureRichContent(content, hints);
  if (structured.items.length) return structured;

  const fallbackItems = splitRichSteps(content)
    .map(removeLeadingListMarker)
    .filter((item) => hasVisibleRichContent(item) && !/^(?:\d+[.)]?|-)$/.test(richTextValue(item)))
    .map((item) => ({ content: item, children: [] as AclsEbookRichText[][] }));

  return {
    intro: [] as AclsEbookRichText[],
    items: fallbackItems.length > 1 ? fallbackItems : [] as EbookStructuredItem[],
  };
}

function StructuredCell({ content, hints }: { content: AclsEbookRichText[]; hints: EbookLayoutHint[] }) {
  const structure = structuredCellData(content, hints);
  if (!structure.items.length) return <RichContent content={content} />;
  return (
    <div className="space-y-3">
      {hasVisibleRichContent(structure.intro) ? <p><RichContent content={structure.intro as AclsEbookRichText[]} /></p> : null}
      <div className={structure.items.length >= 3 ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {structure.items.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d5d8f]" aria-hidden="true" />
              <p className="min-w-0"><RichContent content={item.content as AclsEbookRichText[]} /></p>
            </div>
            <StructuredChildren items={item.children as AclsEbookRichText[][]} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TableCellContent({ content }: { content: AclsEbookRichText[] }) {
  const explicit = splitRichExplicitItems(content);
  const intro = explicit.intro;
  const items: EbookStructuredItem[] = explicit.items.map((item) => ({ content: item, children: [] }));

  if (!items.length) return <p className="leading-7"><RichContent content={content} /></p>;

  return (
    <div className="space-y-3 text-slate-800 dark:text-slate-100">
      {hasVisibleRichContent(intro) ? <p className="font-semibold leading-7"><RichContent content={intro as AclsEbookRichText[]} /></p> : null}
      <ul className="space-y-2.5 border-l-2 border-[#123A6D]/15 pl-4">
        {items.map((item, index) => (
          <li key={index} className="leading-7">
            <div className="flex items-start gap-2.5">
              <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d5d8f]" aria-hidden="true" />
              <span className="min-w-0"><RichContent content={item.content as AclsEbookRichText[]} /></span>
            </div>
            {item.children.length ? (
              <ul className="ml-4 mt-2 space-y-1.5 border-l border-slate-200 pl-4 dark:border-slate-700">
                {item.children.map((child, childIndex) => <li key={childIndex} className="leading-6"><RichContent content={removeLeadingListMarker(child) as AclsEbookRichText[]} /></li>)}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceTable({ block, chapterSlug, sourceIndex }: { block: Extract<AclsEbookSourceBlock, { kind: "table" }>; chapterSlug: string; sourceIndex: number }) {
  const columnCount = Math.max(...block.rows.map((row) => row.length));
  const singleCell = block.rows.length === 1 && columnCount === 1;
  const hintsFor = (rowIndex: number, cellIndex: number) => LAYOUT_HINTS[`${chapterSlug}:${sourceIndex}:${rowIndex}:${cellIndex}`] ?? [];

  if (singleCell) {
    const content = block.rows[0][0] ?? [];
    const structured = structureRichContent(content, hintsFor(0, 0));
    const fallbackSteps = splitRichSteps(content);
    const items: EbookStructuredItem[] = structured.items.length
      ? structured.items.flatMap((item) => {
          if (item.children.length) return [item];
          const parts = splitRichSteps(item.content);
          return parts.length > 1 ? parts.map((part) => ({ content: part, children: [] })) : [item];
        })
      : fallbackSteps.map((step) => ({ content: removeLeadingListMarker(step), children: [] }));
    return (
      <section className="my-8 rounded-3xl border border-slate-200 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-[#123A6D]" />
            <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#486a91] dark:text-blue-300">Quadro clínico</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-extrabold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">{items.length} {items.length === 1 ? "item" : "itens"}</span>
        </div>
        {hasVisibleRichContent(structured.intro) ? (
          <div className="mb-4 rounded-2xl bg-[#123A6D] px-5 py-4 leading-7 text-white shadow-sm">
            <RichContent content={structured.intro as AclsEbookRichText[]} />
          </div>
        ) : null}
        <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[17px] before:top-6 before:w-px before:bg-[#123A6D]/20 dark:before:bg-blue-300/20">
          {items.map((item, index) => (
            <div key={index} className="relative grid grid-cols-[36px_1fr] items-start gap-3">
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-100 bg-[#123A6D] text-[10px] font-black text-white dark:border-slate-900">{index + 1}</span>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 leading-7 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:px-5">
                {(() => {
                  const clauses = item.children.length ? [] : splitRichClauses(item.content);
                  const fallbackChildren = clauses.length >= 3 ? clauses.slice(1) : [];
                  const mainContent = fallbackChildren.length ? clauses[0] : item.content;
                  const children = item.children.length ? item.children : fallbackChildren;
                  return (
                    <>
                      <p><RichContent content={mainContent as AclsEbookRichText[]} /></p>
                      <StructuredChildren items={children as AclsEbookRichText[][]} />
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (columnCount === 1) {
    const firstCell = block.rows[0]?.[0] ?? [];
    const firstCellText = richTextValue(firstCell);
    const hasTitleRow = block.rows.length >= 2 && firstCellText.length > 0 && firstCellText.length <= 160 && splitRichSteps(firstCell).length === 1;
    const bodyRows = hasTitleRow ? block.rows.slice(1) : block.rows;
    return (
      <section className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:p-6">
        <div className="mb-5 flex items-start gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <span className="h-10 w-1 shrink-0 rounded-full bg-[#123A6D]" />
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#486a91] dark:text-blue-300">Tabela clínica</p>
            {hasTitleRow ? <h4 className="mt-2 font-serif text-[1.15em] font-bold leading-snug text-[#123A6D] dark:text-blue-100"><RichContent content={firstCell} /></h4> : null}
          </div>
        </div>
        <div className="space-y-3">
          {bodyRows.map((row, visibleRowIndex) => {
            const rowIndex = hasTitleRow ? visibleRowIndex + 1 : visibleRowIndex;
            return (
              <div key={rowIndex} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 leading-7 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <StructuredCell content={row[0] ?? []} hints={hintsFor(rowIndex, 0)} />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (block.rows.length === 1) {
    const panelColumns = columnCount === 2 ? "md:grid-cols-2" : columnCount === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
    return (
      <section className="my-8 rounded-3xl border border-slate-200 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:p-6">
        <div className={`grid gap-4 ${panelColumns}`}>
          {Array.from({ length: columnCount }).map((_, cellIndex) => (
            <article key={cellIndex} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <TableCellContent content={block.rows[0]?.[cellIndex] ?? []} />
            </article>
          ))}
        </div>
      </section>
    );
  }

  const firstRowTexts = block.rows[0]?.map((cell) => richTextValue(cell)) ?? [];
  const hasColumnHeader = Boolean(block.hasHeader && firstRowTexts.length === columnCount && firstRowTexts.every((text) => text.length > 0 && text.length <= 80));
  const mobileRows = hasColumnHeader ? block.rows.slice(1) : block.rows;
  const mobileHeaders = hasColumnHeader ? block.rows[0] : [];

  return (
    <>
      <div className="my-8 space-y-4 md:hidden">
        {mobileRows.map((row, visibleRowIndex) => (
          <article key={visibleRowIndex} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <h4 className="bg-[#0d315d] px-4 py-3 text-base font-bold leading-6 text-white">
              <RichContent content={row[0] ?? []} inheritColor />
            </h4>
            <div className="space-y-4 px-4 py-4 text-slate-800 dark:text-slate-100">
              {Array.from({ length: columnCount - 1 }).map((_, offset) => {
                const cellIndex = offset + 1;
                return (
                  <div key={cellIndex}>
                    {hasVisibleRichContent(mobileHeaders[cellIndex] ?? []) ? (
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#486a91] dark:text-blue-300">
                        <RichContent content={mobileHeaders[cellIndex] ?? []} inheritColor />
                      </p>
                    ) : null}
                    <TableCellContent content={row[cellIndex] ?? []} />
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
      <div className="my-8 hidden overflow-hidden rounded-2xl border border-slate-300/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 md:block">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-left text-[0.94em]"
          style={{ minWidth: `${Math.max(720, columnCount * 220)}px` }}
        >
          {columnCount === 2 ? <colgroup><col className="w-[26%]" /><col className="w-[74%]" /></colgroup> : null}
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
                {Array.from({ length: columnCount }).map((_, cellIndex) => {
                  const isHeader = hasColumnHeader && rowIndex === 0;
                  const Cell = isHeader ? "th" : "td";
                  return (
                    <Cell
                      key={cellIndex}
                      className={isHeader
                        ? "bg-[#0d315d] px-5 py-4 font-bold text-white"
                        : cellIndex === 0
                          ? "border-r border-slate-200 bg-slate-100 px-5 py-4 align-top font-bold leading-7 text-[#0d315d] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100"
                          : "border-r border-slate-200 bg-white px-5 py-4 align-top leading-7 text-slate-800 last:border-r-0 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"}
                    >
                      {isHeader
                        ? <RichContent content={row[cellIndex] ?? []} inheritColor />
                        : <TableCellContent content={row[cellIndex] ?? []} />}
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

function SourceBlockContent({ block, chapterSlug, sourceIndex }: { block: AclsEbookSourceBlock; chapterSlug: string; sourceIndex: number }) {
  if (block.kind === "heading") {
    if (block.level <= 1) {
      return (
        <header className="mb-8 mt-10 border-b border-[#123A6D]/20 pb-5 first:mt-0 dark:border-blue-300/20">
          <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#486a91] dark:text-blue-300">Seção</p>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-[#092a50] dark:text-blue-100">
            <RichContent content={block.content} inheritColor />
          </h2>
        </header>
      );
    }
    return (
      <h3 className="mb-3 mt-8 font-serif text-xl font-bold leading-snug text-[#123A6D] first:mt-0 dark:text-blue-200">
        <RichContent content={block.content} inheritColor />
      </h3>
    );
  }

  const layoutHintKey = block.layoutHintKey === null ? -1 : block.layoutHintKey ?? sourceIndex;

  if (block.kind === "table") return <SourceTable block={block} chapterSlug={chapterSlug} sourceIndex={layoutHintKey} />;

  if (block.kind === "flow") {
    const toneClasses: Record<AclsEbookFlowTone, string> = {
      info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100",
      conduct: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
      warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
      danger: "border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100",
      pearl: "border-slate-700 bg-slate-950 text-white dark:border-slate-600",
      medication: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100",
    };
    return (
      <section className="my-8">
        {block.title ? <h3 className="mb-5 font-serif text-xl font-bold text-[#123A6D] dark:text-blue-200">{block.title}</h3> : null}
        <div className="mx-auto max-w-3xl space-y-0">
          {block.nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <article className={`w-full rounded-2xl border px-5 py-4 text-center shadow-sm ${toneClasses[node.tone]}`}>
                <p className="font-bold leading-6">{node.title}</p>
                {node.detail ? <p className="mt-1 text-sm leading-6 opacity-85">{node.detail}</p> : null}
              </article>
              {index < block.nodes.length - 1 ? <span className="flex h-10 items-center text-2xl font-bold text-[#2d5d8f]" aria-hidden="true">↓</span> : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.kind === "image") {
    return (
      <figure className="my-7 border-y border-slate-200 py-6 dark:border-slate-700">
        <Image
          src={block.src}
          alt="Ilustração clínica do material ACLS"
          width={1400}
          height={900}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 760px"
          className="mx-auto h-auto max-h-[760px] w-full max-w-5xl object-contain"
        />
      </figure>
    );
  }

  if (block.listStyle) {
    return (
      <div className="my-2.5 grid grid-cols-[22px_1fr] gap-2 leading-7 text-slate-700 dark:text-slate-200">
        <span className="mt-[0.7em] h-1.5 w-1.5 rounded-full bg-[#2d5d8f]" aria-hidden="true" />
        <p><RichContent content={block.content} /></p>
      </div>
    );
  }

  return (
    <p className="my-3 leading-7 text-slate-700 dark:text-slate-200">
      <RichContent content={block.content} />
    </p>
  );
}

function SourceBlock({
  entry,
  chapterSlug,
  highlighted,
  highlightMode,
  onToggle,
}: {
  entry: EbookReaderBlock;
  chapterSlug: string;
  highlighted: boolean;
  highlightMode: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      data-highlighted={highlighted ? "true" : undefined}
      onClick={highlightMode ? onToggle : undefined}
      className={`relative -mx-2 rounded-lg px-2 transition-colors ${
        highlighted
          ? "bg-amber-200/65 shadow-[inset_3px_0_0_#d97706] dark:bg-amber-400/20"
          : highlightMode
            ? "cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-400/10"
            : ""
      }`}
    >
      <SourceBlockContent block={entry.block} chapterSlug={chapterSlug} sourceIndex={entry.sourceIndex} />
    </div>
  );
}

type Props = {
  chapter: AclsEbookSourceChapter;
  chapters: AclsEbookChapter[];
  activeIndex: number;
  initialLastPage?: boolean;
};

export function AclsEbookSourceView({ chapter, chapters, activeIndex, initialLastPage = false }: Props) {
  const router = useRouter();
  const pages = useMemo(() => paginateEbookBlocks(chapter.blocks), [chapter.blocks]);
  const [pageIndex, setPageIndex] = useState(initialLastPage ? pages.length - 1 : 0);
  const [fontScale, setFontScale] = useState(2);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const readerTop = useRef<HTMLDivElement>(null);
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
  const safePageIndex = Math.min(Math.max(pageIndex, 0), pages.length - 1);
  const currentPage = pages[safePageIndex];
  const mediaFocusedPage = isMediaFocusedEbookPage(currentPage);
  const chapterProgress = ((safePageIndex + 1) / pages.length) * 100;
  const bookProgress = ((activeIndex + (safePageIndex + 1) / pages.length) / chapters.length) * 100;

  const toggleHighlight = useCallback((sourceIndex: number) => {
    setHighlights((current) => {
      const next = new Set(current);
      if (next.has(sourceIndex)) next.delete(sourceIndex); else next.add(sourceIndex);
      window.localStorage.setItem(`resibook:acls-highlights:${chapter.slug}`, JSON.stringify([...next]));
      return next;
    });
  }, [chapter.slug]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* fallback visual já foi encerrado */ }
      }
      return;
    }

    setIsFullscreen(true);
    try { await readerTop.current?.requestFullscreen(); } catch { /* mantém o modo visual em tela cheia */ }
  }, [isFullscreen]);

  const goToPage = useCallback((nextPage: number) => {
    setPageIndex(Math.min(pages.length - 1, Math.max(0, nextPage)));
    requestAnimationFrame(() => readerTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [pages.length]);

  const goPrevious = useCallback(() => {
    if (safePageIndex > 0) return goToPage(safePageIndex - 1);
    if (previousChapter) router.push(chapterHref(previousChapter, true));
    else router.push(chapterHref());
  }, [goToPage, previousChapter, router, safePageIndex]);

  const goNext = useCallback(() => {
    if (safePageIndex < pages.length - 1) return goToPage(safePageIndex + 1);
    if (nextChapter) router.push(chapterHref(nextChapter));
    else router.push(chapterHref());
  }, [goToPage, nextChapter, pages.length, router, safePageIndex]);

  useEffect(() => {
    setPageIndex(initialLastPage ? pages.length - 1 : 0);
    const stored = window.localStorage.getItem(`resibook:acls-highlights:${chapter.slug}`);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      setHighlights(new Set(Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === "number") : []));
    } catch {
      setHighlights(new Set());
    }
  }, [chapter.slug, initialLastPage, pages.length]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === readerTop.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (contentsOpen) return;
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [contentsOpen, goNext, goPrevious]);

  useEffect(() => {
    if (!contentsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [contentsOpen]);

  return (
    <div ref={readerTop} className={`min-h-screen scroll-mt-4 ${isFullscreen ? "fixed inset-0 z-[120] m-0 overflow-y-auto bg-slate-100 p-2 dark:bg-slate-950 sm:p-5" : ""}`}>
      <div className="fixed inset-x-0 top-0 z-[80] h-1 bg-slate-200 dark:bg-slate-800" aria-hidden="true">
        <div className="h-full bg-[#2d5d8f] transition-[width] duration-300" style={{ width: `${bookProgress}%` }} />
      </div>

      <header className="sticky top-2 z-40 mx-auto mb-5 flex max-w-[1380px] items-center justify-between gap-2 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90">
        <Link href={chapterHref()} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#123A6D] dark:text-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Biblioteca</span>
        </Link>
        <div className="min-w-0 text-center">
          <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#486a91] dark:text-blue-300">ACLS · Capítulo {activeIndex + 1}</p>
          <p className="max-w-[160px] truncate font-serif text-sm font-bold text-slate-900 dark:text-white sm:max-w-md">{chapter.title}</p>
        </div>
        <button type="button" onClick={() => setContentsOpen(true)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#123A6D] dark:text-slate-200 dark:hover:bg-slate-800">
          <List className="h-4 w-4" /><span className="hidden sm:inline">Sumário</span>
        </button>
      </header>

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="mx-auto max-w-[1380px]"
        onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
          touchStart.current = null;
          if (Math.abs(distance) < 65) return;
          if (distance > 0) goPrevious(); else goNext();
        }}
      >
        <div className="grid items-center gap-3 lg:grid-cols-[52px_minmax(0,1fr)_52px]">
          <button type="button" aria-label="Página anterior" onClick={goPrevious} className="hidden h-13 w-13 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:-translate-x-0.5 hover:border-[#123A6D]/30 hover:text-[#123A6D] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>

          <article className={`relative overflow-hidden rounded-[8px_28px_28px_8px] border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_28px_70px_-36px_rgba(15,23,42,.55),inset_12px_0_25px_-24px_rgba(15,23,42,.35)] dark:border-slate-700 dark:bg-[#111827] ${mediaFocusedPage ? "min-h-0" : "min-h-[76vh]"}`}>
            <div className="absolute inset-y-0 left-0 w-2 border-r border-black/5 bg-gradient-to-r from-black/10 to-transparent dark:border-white/5" aria-hidden="true" />
            <div className={`flex flex-col px-5 py-6 sm:px-9 sm:py-8 lg:px-12 ${mediaFocusedPage ? "min-h-0" : "min-h-[76vh]"}`}>
              <div className="mb-7 flex items-center justify-between gap-4 border-b border-slate-300/70 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:border-slate-700">
                <span className="truncate">Resibook Clinical Editions</span>
                <span className="shrink-0">{String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
              </div>

              <div className={`mx-auto w-full max-w-none flex-1 font-sans transition-[font-size] ${FONT_CLASSES[fontScale]}`}>
                {currentPage.map((entry) => (
                  <SourceBlock
                    key={entry.sourceIndex}
                    entry={entry}
                    chapterSlug={chapter.slug}
                    highlighted={highlights.has(entry.sourceIndex)}
                    highlightMode={highlightMode}
                    onToggle={() => toggleHighlight(entry.sourceIndex)}
                  />
                ))}
              </div>

              <footer className={`${mediaFocusedPage ? "mt-7" : "mt-10"} flex items-center justify-between gap-4 border-t border-slate-300/70 pt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:border-slate-700`}>
                <span>Capítulo {activeIndex + 1}</span>
                <span>Página {safePageIndex + 1} de {pages.length}</span>
              </footer>
            </div>
          </article>

          <button type="button" aria-label="Próxima página" onClick={goNext} className="hidden h-13 w-13 items-center justify-center rounded-full bg-[#123A6D] text-white shadow-lg transition hover:translate-x-0.5 hover:bg-[#0d315d] lg:flex">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="sticky bottom-3 z-40 mx-auto mt-5 max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#2d5d8f] transition-[width]" style={{ width: `${chapterProgress}%` }} /></div>
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={goPrevious} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Anterior</span>
            </button>
            <div className="flex items-center gap-0.5">
              <button type="button" aria-label="Diminuir zoom" title="Diminuir zoom" onClick={() => setFontScale((value) => Math.max(0, value - 1))} className="flex h-11 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 text-center text-[10px] font-extrabold text-slate-600 dark:text-slate-300">{ZOOM_LABELS[fontScale]}</span>
              <button type="button" aria-label="Aumentar zoom" title="Aumentar zoom" onClick={() => setFontScale((value) => Math.min(FONT_CLASSES.length - 1, value + 1))} className="flex h-11 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></button>
              <button type="button" aria-pressed={highlightMode} aria-label="Ativar marca-texto" title="Marca-texto" onClick={() => setHighlightMode((value) => !value)} className={`flex h-11 w-10 items-center justify-center rounded-xl transition ${highlightMode ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-400/15 dark:text-amber-300" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}><Highlighter className="h-4 w-4" /></button>
              <button type="button" aria-label={isFullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"} title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"} onClick={toggleFullscreen} className="flex h-11 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
            </div>
            <button type="button" onClick={goNext} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#123A6D] px-4 text-xs font-bold text-white shadow-md hover:bg-[#0d315d]">
              <span className="hidden sm:inline">Próxima</span><ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {highlightMode ? <p className="mx-auto mt-3 max-w-4xl rounded-xl bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">Marca-texto ativo: toque em qualquer trecho para grifar ou remover o grifo.</p> : null}
        <p className="mt-4 text-center text-[10px] font-semibold text-slate-400">Use as setas do teclado ou deslize a página no celular</p>
      </main>

      {contentsOpen ? (
        <div className="fixed inset-0 z-[100] bg-[#071a33]/55 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Sumário do eBook" onClick={() => setContentsOpen(false)}>
          <aside className="ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#486a91]">ACLS</p><h2 className="mt-1 font-serif text-2xl font-bold text-slate-950 dark:text-white">Sumário</h2></div>
              <button type="button" aria-label="Fechar sumário" onClick={() => setContentsOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"><X className="h-5 w-5" /></button>
            </header>
            <nav className="flex-1 overflow-y-auto p-4">
              {chapters.map((item, index) => (
                <Link key={item.slug} href={chapterHref(item)} onClick={() => setContentsOpen(false)} className={`flex min-h-16 items-center gap-4 border-b px-2 py-3 transition dark:border-slate-800 ${index === activeIndex ? "border-[#123A6D]/20 text-[#123A6D] dark:text-blue-300" : "border-slate-100 text-slate-700 hover:text-[#123A6D] dark:text-slate-200"}`}>
                  <span className="font-serif text-xl font-bold opacity-40">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 text-sm font-bold leading-5">{item.label}</span>
                  {index === activeIndex ? <BookOpen className="h-4 w-4 shrink-0" /> : null}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

    </div>
  );
}
