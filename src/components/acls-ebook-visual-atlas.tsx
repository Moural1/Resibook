"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Images, Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  ACLS_EBOOK_VISUALS,
  type AclsEbookVisualCategory,
} from "@/lib/acls-ebook-visuals";

type Filter = "Todos" | "Neste capítulo" | AclsEbookVisualCategory;

type Props = {
  open: boolean;
  onClose: () => void;
  chapterSlug?: string;
};

const CATEGORIES: Filter[] = ["Todos", "Neste capítulo", "Fluxogramas", "Avaliações", "Farmacologia"];

export function AclsEbookVisualAtlas({ open, onClose, chapterSlug }: Props) {
  const [filter, setFilter] = useState<Filter>(chapterSlug ? "Neste capítulo" : "Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const atlasRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => ACLS_EBOOK_VISUALS.filter((visual) => {
    if (filter === "Todos") return true;
    if (filter === "Neste capítulo") return Boolean(chapterSlug && visual.chapterSlugs.includes(chapterSlug));
    return visual.category === filter;
  }), [chapterSlug, filter]);
  const selected = ACLS_EBOOK_VISUALS.find((visual) => visual.id === selectedId);
  const chapterVisualCount = chapterSlug
    ? ACLS_EBOOK_VISUALS.filter((visual) => visual.chapterSlugs.includes(chapterSlug)).length
    : 0;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedId) setSelectedId(null); else onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, open, selectedId]);

  useEffect(() => {
    if (!open) return;
    setFilter(chapterSlug && chapterVisualCount > 0 ? "Neste capítulo" : "Todos");
    setSelectedId(null);
    setZoom(100);
  }, [chapterSlug, chapterVisualCount, open]);

  if (!open) return null;

  return (
    <div ref={atlasRef} className="fixed inset-0 z-[180] flex flex-col bg-[#071a33] text-white" role="dialog" aria-modal="true" aria-label="Atlas Visual ACLS">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {selected ? (
            <button type="button" aria-label="Voltar ao atlas" onClick={() => { setSelectedId(null); setZoom(100); }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"><ArrowLeft className="h-5 w-5" /></button>
          ) : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200"><Images className="h-5 w-5" /></span>}
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-blue-300">Resibook Visual Library</p>
            <h2 className="truncate font-serif text-lg font-bold sm:text-xl">{selected?.title ?? "Atlas Visual ACLS"}</h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {selected ? (
            <>
              <button type="button" aria-label="Diminuir ampliação" onClick={() => setZoom((value) => Math.max(50, value - 25))} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><Minus className="h-4 w-4" /></button>
              <span className="min-w-12 text-center text-[10px] font-extrabold text-blue-100">{zoom}%</span>
              <button type="button" aria-label="Aumentar ampliação" onClick={() => setZoom((value) => Math.min(200, value + 25))} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><Plus className="h-4 w-4" /></button>
              <button type="button" aria-label="Ajustar imagem" onClick={() => setZoom(100)} className="hidden h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10 sm:flex"><RotateCcw className="h-4 w-4" /></button>
            </>
          ) : null}
          <button type="button" aria-label="Fechar atlas visual" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"><X className="h-5 w-5" /></button>
        </div>
      </header>

      {selected ? (
        <div className="flex flex-1 items-start overflow-auto bg-slate-200 p-3 dark:bg-slate-950 sm:p-6">
          <div className="mx-auto shrink-0 overflow-hidden rounded-lg bg-white shadow-2xl" style={{ width: `${zoom}%`, minWidth: zoom > 100 ? `${zoom}%` : undefined }}>
            <Image src={selected.src} alt={selected.title} width={selected.width} height={selected.height} unoptimized priority className="h-auto w-full" />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-7 sm:py-7">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.filter((item) => item !== "Neste capítulo" || chapterVisualCount > 0).map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold transition ${filter === item ? "bg-[#123A6D] text-white shadow-md" : "border border-slate-200 bg-white text-slate-600 hover:border-[#123A6D]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}>
                  {item}{item === "Neste capítulo" ? ` · ${chapterVisualCount}` : ""}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((visual, index) => (
                <button key={visual.id} type="button" onClick={() => { setSelectedId(visual.id); setZoom(100); }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#123A6D]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <span className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100 p-3 dark:bg-slate-800">
                    <Image src={visual.src} alt="" width={visual.width} height={visual.height} unoptimized priority={index < 2} className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]" />
                  </span>
                  <span className="block p-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#486a91] dark:text-blue-300">{visual.category}</span>
                    <span className="mt-1.5 block text-sm font-bold leading-5 text-slate-900 dark:text-white">{visual.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
