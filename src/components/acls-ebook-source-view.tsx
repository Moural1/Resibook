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
  FileSearch,
  Highlighter,
  Images,
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
} from "@/lib/acls-ebook-source";
import { removeLeadingListMarker, splitRichSteps } from "@/lib/acls-ebook-layout";

const PAGE_WEIGHT = 2400;
const FONT_CLASSES = [
  "text-[14px] sm:text-[15px]",
  "text-[16px] sm:text-[17px]",
  "text-[17px] sm:text-[18px]",
  "text-[19px] sm:text-[20px]",
  "text-[21px] sm:text-[22px]",
] as const;
const ZOOM_LABELS = ["85%", "95%", "100%", "115%", "130%"] as const;

type ReaderBlock = { block: AclsEbookSourceBlock; sourceIndex: number };

function chapterHref(chapter?: Pick<AclsEbookChapter, "slug">, lastPage = false) {
  if (!chapter) return "/acls/ebook";
  return `/acls/ebook?capitulo=${encodeURIComponent(chapter.slug)}${lastPage ? "&pagina=ultima" : ""}`;
}

function segmentLength(segment: AclsEbookRichText) {
  return segment.kind === "text" ? segment.text.length : 700;
}

function blockWeight(block: AclsEbookSourceBlock) {
  if (block.kind === "image") return 900;
  if (block.kind === "heading") return block.level <= 1 ? 220 : 150;
  if (block.kind === "table") {
    const characters = block.rows.flat(2).reduce((total, segment) => total + segmentLength(segment), 0);
    const singleCell = block.rows.length === 1 && block.rows[0]?.length === 1;
    const structuredSteps = singleCell ? splitRichSteps(block.rows[0][0] ?? []).length : 0;
    return Math.max(720, characters * 1.15 + block.rows.length * 95 + Math.min(structuredSteps, 12) * 120);
  }
  return Math.max(95, block.content.reduce((total, segment) => total + segmentLength(segment), 0) * 1.15);
}

function paginateBlocks(blocks: AclsEbookSourceBlock[]) {
  const pages: ReaderBlock[][] = [];
  let page: ReaderBlock[] = [];
  let weight = 0;

  for (const [sourceIndex, block] of blocks.entries()) {
    const nextWeight = blockWeight(block);
    const startsSection = block.kind === "heading";
    const shouldTurn = page.length > 0 && (weight + nextWeight > PAGE_WEIGHT || (startsSection && weight > PAGE_WEIGHT * 0.78));

    if (shouldTurn) {
      pages.push(page);
      page = [];
      weight = 0;
    }

    page.push({ block, sourceIndex });
    weight += nextWeight;
  }

  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

function RichContent({ content }: { content: AclsEbookRichText[] }) {
  return content.map((segment, index) => {
    if (segment.kind === "image") {
      return (
        <span key={`${segment.src}-${index}`} className="my-5 block">
          <Image
            src={segment.src}
            alt="Ilustração clínica do material ACLS"
            width={1200}
            height={760}
            sizes="(max-width: 768px) 100vw, 760px"
            className="mx-auto h-auto max-h-[680px] w-full max-w-5xl object-contain"
          />
        </span>
      );
    }

    const className = segment.red
      ? "font-bold text-[#c62828] dark:text-red-400"
      : segment.bold
        ? "font-bold text-slate-950 dark:text-white"
        : undefined;

    return <span key={`${segment.text}-${index}`} className={className}>{segment.text}</span>;
  });
}

function SourceTable({ block }: { block: Extract<AclsEbookSourceBlock, { kind: "table" }> }) {
  const columnCount = Math.max(...block.rows.map((row) => row.length));
  const singleCell = block.rows.length === 1 && columnCount === 1;

  if (singleCell) {
    const steps = splitRichSteps(block.rows[0][0] ?? []);
    return (
      <section className="my-8 rounded-3xl border border-slate-200 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-[#123A6D]" />
            <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#486a91] dark:text-blue-300">Leitura estruturada</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-extrabold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">{steps.length} {steps.length === 1 ? "item" : "itens"}</span>
        </div>
        <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[17px] before:top-6 before:w-px before:bg-[#123A6D]/20 dark:before:bg-blue-300/20">
          {steps.map((step, index) => (
            <div key={index} className="relative grid grid-cols-[36px_1fr] items-start gap-3">
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-100 bg-[#123A6D] text-[10px] font-black text-white dark:border-slate-900">{index + 1}</span>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 leading-7 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:px-5">
                <p><RichContent content={removeLeadingListMarker(step) as AclsEbookRichText[]} /></p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="my-7 overflow-hidden rounded-xl border border-slate-300/80 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] border-collapse text-left text-[0.94em]">
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
                        ? "bg-[#0d315d] px-4 py-3 font-bold text-white"
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

function SourceBlockContent({ block }: { block: AclsEbookSourceBlock }) {
  if (block.kind === "heading") {
    if (block.level <= 1) {
      return (
        <header className="mb-8 mt-10 border-b border-[#123A6D]/20 pb-5 first:mt-0 dark:border-blue-300/20">
          <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#486a91] dark:text-blue-300">Seção</p>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-[#092a50] dark:text-blue-100">
            <RichContent content={block.content} />
          </h2>
        </header>
      );
    }
    return (
      <h3 className="mb-3 mt-8 font-serif text-xl font-bold leading-snug text-[#123A6D] first:mt-0 dark:text-blue-200">
        <RichContent content={block.content} />
      </h3>
    );
  }

  if (block.kind === "table") return <SourceTable block={block} />;

  if (block.kind === "image") {
    return (
      <figure className="my-7 border-y border-slate-200 py-6 dark:border-slate-700">
        <Image
          src={block.src}
          alt="Ilustração clínica do material ACLS"
          width={1400}
          height={900}
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
  highlighted,
  highlightMode,
  onToggle,
}: {
  entry: ReaderBlock;
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
      <SourceBlockContent block={entry.block} />
    </div>
  );
}

type Props = {
  chapter: AclsEbookSourceChapter;
  chapters: AclsEbookChapter[];
  activeIndex: number;
  initialLastPage?: boolean;
  onOpenAtlas: () => void;
};

export function AclsEbookSourceView({ chapter, chapters, activeIndex, initialLastPage = false, onOpenAtlas }: Props) {
  const router = useRouter();
  const pages = useMemo(() => paginateBlocks(chapter.blocks), [chapter.blocks]);
  const [pageIndex, setPageIndex] = useState(initialLastPage ? pages.length - 1 : 0);
  const [fontScale, setFontScale] = useState(2);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [originalOpen, setOriginalOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const readerTop = useRef<HTMLDivElement>(null);
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
  const safePageIndex = Math.min(Math.max(pageIndex, 0), pages.length - 1);
  const chapterProgress = ((safePageIndex + 1) / pages.length) * 100;
  const bookProgress = ((activeIndex + (safePageIndex + 1) / pages.length) / chapters.length) * 100;
  const sourcePage = Math.min(
    chapter.sourcePages[1],
    chapter.sourcePages[0] + Math.floor((safePageIndex / pages.length) * (chapter.sourcePages[1] - chapter.sourcePages[0] + 1)),
  );

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
      if (contentsOpen || originalOpen) return;
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [contentsOpen, goNext, goPrevious, originalOpen]);

  useEffect(() => {
    if (!contentsOpen && !originalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [contentsOpen, originalOpen]);

  return (
    <div ref={readerTop} className={`-mx-2 min-h-screen scroll-mt-4 sm:mx-0 ${isFullscreen ? "fixed inset-0 z-[120] m-0 overflow-y-auto bg-slate-100 p-2 dark:bg-slate-950 sm:p-5" : ""}`}>
      <div className="fixed inset-x-0 top-0 z-[80] h-1 bg-slate-200 dark:bg-slate-800" aria-hidden="true">
        <div className="h-full bg-[#2d5d8f] transition-[width] duration-300" style={{ width: `${bookProgress}%` }} />
      </div>

      <header className="sticky top-2 z-40 mx-auto mb-5 flex max-w-6xl items-center justify-between gap-2 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90">
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
        className="mx-auto max-w-6xl"
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

          <article className="relative min-h-[72vh] overflow-hidden rounded-[8px_28px_28px_8px] border border-[#d8d3c8] bg-[#fffdf8] shadow-[0_28px_70px_-36px_rgba(15,23,42,.55),inset_12px_0_25px_-24px_rgba(15,23,42,.35)] dark:border-slate-700 dark:bg-[#111827]">
            <div className="absolute inset-y-0 left-0 w-2 border-r border-black/5 bg-gradient-to-r from-black/10 to-transparent dark:border-white/5" aria-hidden="true" />
            <div className="flex min-h-[72vh] flex-col px-6 py-7 sm:px-12 sm:py-10 lg:px-16">
              <div className="mb-9 flex items-center justify-between gap-4 border-b border-slate-300/70 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:border-slate-700">
                <span className="truncate">Resibook Clinical Editions</span>
                <span className="shrink-0">{String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
              </div>

              <div className={`mx-auto w-full max-w-5xl flex-1 font-sans transition-[font-size] ${FONT_CLASSES[fontScale]}`}>
                {pages[safePageIndex].map((entry) => (
                  <SourceBlock
                    key={entry.sourceIndex}
                    entry={entry}
                    highlighted={highlights.has(entry.sourceIndex)}
                    highlightMode={highlightMode}
                    onToggle={() => toggleHighlight(entry.sourceIndex)}
                  />
                ))}
              </div>

              <footer className="mt-12 flex items-center justify-between gap-4 border-t border-slate-300/70 pt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:border-slate-700">
                <span>Capítulo {activeIndex + 1}</span>
                <span>Página original aproximada {sourcePage}</span>
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
              <button type="button" aria-label="Abrir página original" title="Página original" onClick={() => setOriginalOpen(true)} className="hidden h-11 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:flex"><FileSearch className="h-4 w-4" /></button>
              <button type="button" aria-label="Abrir atlas visual" title="Atlas visual" onClick={onOpenAtlas} className="flex h-11 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Images className="h-4 w-4" /></button>
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

      {originalOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071a33]/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Página original ${sourcePage}`} onClick={() => setOriginalOpen(false)}>
          <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#486a91]">Conferência editorial</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Página oficial {sourcePage}</p></div>
              <button type="button" aria-label="Fechar original" onClick={() => setOriginalOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"><X className="h-5 w-5" /></button>
            </header>
            <div className="overflow-y-auto bg-slate-100 p-3 dark:bg-slate-900">
              <Image src={`/acls-ebook/source/pages/page-${String(sourcePage).padStart(3, "0")}.webp`} alt={`Página ${sourcePage} do PDF oficial Anotações ACLS`} width={911} height={1286} sizes="(max-width: 768px) 100vw, 760px" unoptimized className="mx-auto h-auto w-full max-w-2xl shadow-xl" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
