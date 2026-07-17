"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  GitBranch,
  Heading,
  ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Send,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { AclsEbookSourceView } from "@/components/acls-ebook-source-view";
import type { AclsEbookChapter } from "@/components/acls-ebook";
import {
  plainRichText,
  richTextToPlain,
  type AclsEbookDocument,
  type AclsEbookFlowTone,
  type AclsEbookRichText,
  type AclsEbookSourceBlock,
  type AclsEbookSourceChapter,
  type AclsEbookTextSegment,
} from "@/lib/acls-ebook-schema";

export type AclsEbookAdminState = {
  document: AclsEbookDocument;
  revision: number;
  updatedAt: string | null;
  publishedRevision: number;
  publishedAt: string | null;
  revisions: Array<{ revision: number; created_at: string }>;
};

const TONE_LABELS: Record<AclsEbookFlowTone, string> = {
  info: "Informação",
  conduct: "Conduta",
  warning: "Atenção",
  danger: "Contraindicação",
  pearl: "Pérola",
  medication: "Medicamento",
};
const BLOCKS_PER_PAGE = 15;

function newId(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function mergeTextSegments(segments: AclsEbookTextSegment[]) {
  return segments.reduce<AclsEbookTextSegment[]>((result, segment) => {
    const previous = result.at(-1);
    if (previous && previous.bold === segment.bold && previous.red === segment.red) previous.text += segment.text;
    else if (segment.text) result.push({ ...segment });
    return result;
  }, []);
}

function sliceTextSegments(segments: AclsEbookTextSegment[], start: number, end: number) {
  const result: AclsEbookTextSegment[] = [];
  let cursor = 0;
  for (const segment of segments) {
    const from = Math.max(0, start - cursor);
    const to = Math.min(segment.text.length, end - cursor);
    if (from < to) result.push({ ...segment, text: segment.text.slice(from, to) });
    cursor += segment.text.length;
  }
  return result;
}

function replaceTextPreservingStyles(content: AclsEbookRichText[], nextText: string) {
  const textSegments = content.filter((segment): segment is AclsEbookTextSegment => segment.kind === "text");
  const images = content.filter((segment) => segment.kind === "image");
  const previousText = textSegments.map((segment) => segment.text).join("");
  if (previousText === nextText) return content;
  let prefix = 0;
  while (prefix < previousText.length && prefix < nextText.length && previousText[prefix] === nextText[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < previousText.length - prefix && suffix < nextText.length - prefix && previousText[previousText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]) suffix += 1;
  const styleOffset = Math.min(prefix, Math.max(0, previousText.length - 1));
  let cursor = 0;
  const style = textSegments.find((segment) => {
    const matches = styleOffset >= cursor && styleOffset < cursor + segment.text.length;
    cursor += segment.text.length;
    return matches;
  }) ?? textSegments.at(-1) ?? { kind: "text" as const, text: "", bold: false, red: false };
  const inserted = nextText.slice(prefix, nextText.length - suffix);
  const left = sliceTextSegments(textSegments, 0, prefix);
  const right = sliceTextSegments(textSegments, previousText.length - suffix, previousText.length);
  return [...mergeTextSegments([...left, ...(inserted ? [{ ...style, text: inserted }] : []), ...right]), ...images];
}

function SmartTextField({
  value,
  onChange,
  label,
  rows = 3,
}: {
  value: AclsEbookRichText[];
  onChange: (value: AclsEbookRichText[]) => void;
  label: string;
  rows?: number;
}) {
  const textSegments = value.filter((segment): segment is AclsEbookTextSegment => segment.kind === "text");
  const allBold = textSegments.length > 0 && textSegments.every((segment) => segment.bold);
  const allRed = textSegments.length > 0 && textSegments.every((segment) => segment.red);
  const toggle = (key: "bold" | "red") => {
    const next = key === "bold" ? !allBold : !allRed;
    onChange(value.map((segment) => segment.kind === "text" ? { ...segment, [key]: next } : segment));
  };
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
        {label}
        <span className="flex gap-1">
          <button type="button" aria-pressed={allBold} onClick={() => toggle("bold")} className={`rounded-lg border px-2 py-1 font-black ${allBold ? "border-[#123A6D] bg-[#123A6D] text-white" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>B</button>
          <button type="button" aria-pressed={allRed} onClick={() => toggle("red")} className={`rounded-lg border px-2 py-1 font-black ${allRed ? "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-red-600 dark:border-slate-700 dark:bg-slate-900"}`}>A</button>
        </span>
      </span>
      <textarea value={richTextToPlain(value)} rows={rows} onChange={(event) => onChange(replaceTextPreservingStyles(value, event.target.value))} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#2d5d8f] focus:ring-2 focus:ring-[#2d5d8f]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">As quebras feitas com Enter são preservadas no eBook.</span>
      {value.some((segment) => segment.kind === "image") ? <span className="mt-1 block text-[10px] text-amber-600">A imagem incorporada será preservada.</span> : null}
    </label>
  );
}

function createBlock(kind: AclsEbookSourceBlock["kind"]): AclsEbookSourceBlock {
  const common = { id: newId("block"), layoutHintKey: null };
  if (kind === "heading") return { ...common, kind, level: 2, content: plainRichText("Novo título") };
  if (kind === "paragraph") return { ...common, kind, listStyle: null, content: plainRichText("Novo conteúdo") };
  if (kind === "image") return { ...common, kind, src: "/acls-ebook/source/images/image-05.png" };
  if (kind === "table") return { ...common, kind, hasHeader: true, rows: [[plainRichText("Coluna 1"), plainRichText("Coluna 2")], [plainRichText("Conteúdo"), plainRichText("Conteúdo")]] };
  return {
    ...common,
    kind: "flow",
    title: "Novo fluxograma",
    nodes: [
      { id: newId("step"), title: "Primeira etapa", detail: "", tone: "info" },
      { id: newId("step"), title: "Próxima etapa", detail: "", tone: "conduct" },
    ],
  };
}

function BlockEditor({ block, onChange }: { block: AclsEbookSourceBlock; onChange: (block: AclsEbookSourceBlock) => void }) {
  if (block.kind === "heading") return (
    <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Nível
        <select value={block.level} onChange={(event) => onChange({ ...block, level: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value={1}>Seção</option><option value={2}>Título</option><option value={3}>Subtítulo</option><option value={4}>Título menor</option>
        </select>
      </label>
      <SmartTextField label="Texto do título" value={block.content} rows={2} onChange={(content) => onChange({ ...block, content })} />
    </div>
  );
  if (block.kind === "paragraph") return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Apresentação
        <select value={block.listStyle ?? "plain"} onChange={(event) => onChange({ ...block, listStyle: event.target.value === "plain" ? null : event.target.value as "bullet" | "number" })} className="mt-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="plain">Parágrafo</option><option value="bullet">Tópico</option><option value="number">Numerado</option>
        </select>
      </label>
      <SmartTextField label="Conteúdo" value={block.content} rows={4} onChange={(content) => onChange({ ...block, content })} />
    </div>
  );
  if (block.kind === "image") return (
    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Caminho da imagem no acervo ACLS
      <input value={block.src} onChange={(event) => onChange({ ...block, src: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
    </label>
  );
  if (block.kind === "flow") return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Título do fluxo
        <input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
      </label>
      <div className="space-y-3">
        {block.nodes.map((node, index) => (
          <div key={node.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_160px_auto]">
              <input aria-label={`Etapa ${index + 1}`} value={node.title} onChange={(event) => onChange({ ...block, nodes: block.nodes.map((item) => item.id === node.id ? { ...item, title: event.target.value } : item) })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <input aria-label={`Detalhe da etapa ${index + 1}`} placeholder="Detalhe opcional" value={node.detail} onChange={(event) => onChange({ ...block, nodes: block.nodes.map((item) => item.id === node.id ? { ...item, detail: event.target.value } : item) })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              <select aria-label={`Cor da etapa ${index + 1}`} value={node.tone} onChange={(event) => onChange({ ...block, nodes: block.nodes.map((item) => item.id === node.id ? { ...item, tone: event.target.value as AclsEbookFlowTone } : item) })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                {Object.entries(TONE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type="button" disabled={block.nodes.length <= 2} onClick={() => onChange({ ...block, nodes: block.nodes.filter((item) => item.id !== node.id) })} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange({ ...block, nodes: [...block.nodes, { id: newId("step"), title: "Nova etapa", detail: "", tone: "info" }] })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-dashed border-[#2d5d8f]/40 px-3 text-xs font-bold text-[#123A6D]"><Plus className="h-4 w-4" />Adicionar etapa</button>
    </div>
  );

  const columnCount = block.rows[0]?.length ?? 1;
  const updateTable = (next: Extract<AclsEbookSourceBlock, { kind: "table" }>) => onChange({ ...next, layoutHintKey: null });
  const updateCell = (rowIndex: number, columnIndex: number, content: AclsEbookRichText[]) => updateTable({ ...block, rows: block.rows.map((row, currentRow) => currentRow === rowIndex ? row.map((cell, currentColumn) => currentColumn === columnIndex ? content : cell) : row) });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={block.hasHeader} onChange={(event) => updateTable({ ...block, hasHeader: event.target.checked })} />Primeira linha é cabeçalho</label>
        <button type="button" disabled={columnCount >= 8} onClick={() => updateTable({ ...block, rows: block.rows.map((row) => [...row, plainRichText("Nova coluna")]) })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-slate-700">+ Coluna</button>
        <button type="button" disabled={columnCount <= 1} onClick={() => updateTable({ ...block, rows: block.rows.map((row) => row.slice(0, -1)) })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-slate-700">− Coluna</button>
        <button type="button" disabled={block.rows.length >= 80} onClick={() => updateTable({ ...block, rows: [...block.rows, Array.from({ length: columnCount }, () => plainRichText("Conteúdo"))] })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-slate-700">+ Linha</button>
        <button type="button" disabled={block.rows.length <= 1} onClick={() => updateTable({ ...block, rows: block.rows.slice(0, -1) })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-slate-700">− Linha</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse" style={{ minWidth: `${Math.max(720, columnCount * 280)}px` }}>
          <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, columnIndex) => <td key={columnIndex} className="min-w-56 border border-slate-200 p-2 align-top dark:border-slate-700"><SmartTextField label={`L${rowIndex + 1} · C${columnIndex + 1}`} value={cell} rows={3} onChange={(content) => updateCell(rowIndex, columnIndex, content)} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function AclsEbookAdminClient({ initialState = null }: { initialState?: AclsEbookAdminState | null }) {
  const [state, setState] = useState<AclsEbookAdminState | null>(initialState);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [blockPage, setBlockPage] = useState(0);
  const [loading, setLoading] = useState(!initialState);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/acls-ebook", { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) setMessage({ type: "error", text: payload?.error || "Não foi possível abrir o editor." });
    else { setState(payload); setDirty(false); setSelectedChapter((current) => Math.min(current, payload.document.chapters.length - 1)); }
    setLoading(false);
  }, []);

  useEffect(() => { if (!initialState) void load(); }, [initialState, load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const chapter = state?.document.chapters[selectedChapter];
  const blockPageCount = chapter ? Math.max(1, Math.ceil(chapter.blocks.length / BLOCKS_PER_PAGE)) : 1;
  const safeBlockPage = Math.min(blockPage, blockPageCount - 1);
  const visibleBlocks = chapter?.blocks.slice(safeBlockPage * BLOCKS_PER_PAGE, (safeBlockPage + 1) * BLOCKS_PER_PAGE).map((block, offset) => ({ block, blockIndex: safeBlockPage * BLOCKS_PER_PAGE + offset })) ?? [];
  const readerChapters = useMemo<AclsEbookChapter[]>(() => state?.document.chapters.map((item) => ({ slug: item.slug, label: item.title, group: item.group, pages: item.sourcePages })) ?? [], [state?.document.chapters]);

  const changeDocument = (updater: (document: AclsEbookDocument) => AclsEbookDocument) => {
    setState((current) => current ? { ...current, document: updater(current.document) } : current);
    setDirty(true);
    setMessage(null);
  };
  const changeChapter = (updater: (chapter: AclsEbookSourceChapter) => AclsEbookSourceChapter) => changeDocument((document) => ({ ...document, chapters: document.chapters.map((item, index) => index === selectedChapter ? updater(item) : item) }));
  const changeBlock = (blockIndex: number, next: AclsEbookSourceBlock) => changeChapter((current) => ({ ...current, blocks: current.blocks.map((block, index) => index === blockIndex ? next : block) }));

  const save = async () => {
    if (!state) return null;
    setSaving(true); setMessage(null);
    const response = await fetch("/api/admin/acls-ebook", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ document: state.document, expectedRevision: state.revision }) });
    const payload = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) { setMessage({ type: "error", text: payload?.error || "Não foi possível salvar." }); return null; }
    setState((current) => current ? { ...current, revision: payload.revision, updatedAt: payload.updated_at } : current);
    setDirty(false); setMessage({ type: "success", text: `Rascunho salvo na revisão ${payload.revision}.` });
    return Number(payload.revision);
  };

  const publish = async () => {
    if (!state || !window.confirm("Publicar este rascunho para todos os usuários do Resibook?")) return;
    const revision = dirty ? await save() : state.revision;
    if (!revision) return;
    setSaving(true);
    const response = await fetch("/api/admin/acls-ebook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: revision }) });
    const payload = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) return setMessage({ type: "error", text: payload?.error || "Não foi possível publicar." });
    setState((current) => current ? { ...current, publishedRevision: revision, publishedAt: payload?.publishedAt ?? new Date().toISOString(), revisions: [{ revision, created_at: payload?.publishedAt ?? new Date().toISOString() }, ...current.revisions.filter((item) => item.revision !== revision)] } : current);
    setMessage({ type: "success", text: `Revisão ${revision} publicada com sucesso.` });
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#123A6D]" /></div>;
  if (!state || !chapter) return <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">{message?.text || "Editor indisponível."}<button type="button" onClick={() => void load()} className="mt-4 block rounded-xl bg-red-900 px-4 py-2 text-sm font-bold text-white">Tentar novamente</button></div>;

  return (
    <div className="mx-auto max-w-[1600px] pb-20">
      <header className="sticky top-2 z-30 mb-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#486a91]">Administração editorial</p><h1 className="mt-1 font-serif text-2xl font-bold text-slate-950 dark:text-white">Editor inteligente do eBook ACLS</h1><p className="mt-1 text-xs text-slate-500">Rascunho {state.revision || "inicial"} · Publicado {state.publishedRevision || "conteúdo original"}</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPreview(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-slate-700"><BookOpen className="h-4 w-4" />Prévia</button>
            <button type="button" disabled={!dirty || saving} onClick={() => void save()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#123A6D]/20 bg-blue-50 px-4 text-sm font-bold text-[#123A6D] disabled:opacity-40 dark:bg-blue-950/30 dark:text-blue-200">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar rascunho</button>
            <button type="button" disabled={saving} onClick={() => void publish()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#123A6D] px-5 text-sm font-bold text-white shadow-md disabled:opacity-40"><Send className="h-4 w-4" />Publicar</button>
          </div>
        </div>
        {message ? <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${message.type === "error" ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{message.type === "error" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}{message.text}</div> : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:top-40">
          <div className="mb-3 flex items-center justify-between px-2"><h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Capítulos</h2><button type="button" aria-label="Adicionar capítulo" onClick={() => changeDocument((document) => ({ ...document, chapters: [...document.chapters, { slug: `novo-capitulo-${document.chapters.length + 1}`, title: "Novo capítulo", group: "ACLS", sourceLines: [1, 1], sourcePages: [1, 1], blocks: [createBlock("heading"), createBlock("paragraph")] }] }))} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#123A6D] dark:bg-slate-800"><Plus className="h-4 w-4" /></button></div>
          <nav className="max-h-[62vh] space-y-1 overflow-y-auto">{state.document.chapters.map((item, index) => <button key={item.slug} type="button" onClick={() => { setSelectedChapter(index); setBlockPage(0); }} className={`w-full rounded-xl px-3 py-3 text-left text-sm font-bold leading-5 transition ${index === selectedChapter ? "bg-[#123A6D] text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}`}><span className="mr-2 opacity-55">{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}</nav>
          {state.revisions.length ? <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700"><p className="px-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Versões publicadas</p><div className="mt-2 space-y-1">{state.revisions.slice(0, 5).map((item) => <button key={item.revision} type="button" onClick={async () => { if (!window.confirm(`Restaurar a revisão ${item.revision} como novo rascunho?`)) return; const response = await fetch("/api/admin/acls-ebook", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: item.revision, expectedRevision: state.revision }) }); const payload = await response.json(); if (!response.ok) return setMessage({ type: "error", text: payload.error }); setState((current) => current ? { ...current, document: payload.document, revision: payload.revision } : current); setDirty(false); setMessage({ type: "success", text: `Revisão ${item.revision} restaurada no rascunho.` }); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5" />Revisão {item.revision}</button>)}</div></div> : null}
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Organização</p><p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">Capítulo {selectedChapter + 1} de {state.document.chapters.length}</p></div>
              <div className="flex gap-1">
                <button type="button" aria-label="Mover capítulo para cima" disabled={selectedChapter === 0} onClick={() => changeDocument((document) => { const chapters = [...document.chapters]; [chapters[selectedChapter - 1], chapters[selectedChapter]] = [chapters[selectedChapter], chapters[selectedChapter - 1]]; setSelectedChapter(selectedChapter - 1); return { ...document, chapters }; })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-slate-700"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" aria-label="Mover capítulo para baixo" disabled={selectedChapter === state.document.chapters.length - 1} onClick={() => changeDocument((document) => { const chapters = [...document.chapters]; [chapters[selectedChapter], chapters[selectedChapter + 1]] = [chapters[selectedChapter + 1], chapters[selectedChapter]]; setSelectedChapter(selectedChapter + 1); return { ...document, chapters }; })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-slate-700"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" aria-label="Excluir capítulo" disabled={state.document.chapters.length <= 1} onClick={() => { if (!window.confirm(`Excluir o capítulo “${chapter.title}” do rascunho?`)) return; changeDocument((document) => ({ ...document, chapters: document.chapters.filter((_, index) => index !== selectedChapter) })); setSelectedChapter(Math.max(0, selectedChapter - 1)); }} className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Título do capítulo<input value={chapter.title} onChange={(event) => changeChapter((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Identificador da URL<input value={chapter.slug} onChange={(event) => changeChapter((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            </div>
          </section>

          <section className="flex flex-wrap gap-2 rounded-2xl border border-dashed border-[#2d5d8f]/30 bg-blue-50/50 p-3 dark:bg-blue-950/10">
            {([ ["heading", Heading, "Título"], ["paragraph", FileText, "Texto"], ["table", Table2, "Tabela"], ["flow", GitBranch, "Fluxo"], ["image", ImageIcon, "Imagem"] ] as const).map(([kind, Icon, label]) => <button key={kind} type="button" onClick={() => changeChapter((current) => ({ ...current, blocks: [...current.blocks, createBlock(kind)] }))} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-[#123A6D] shadow-sm dark:bg-slate-900 dark:text-blue-200"><Icon className="h-4 w-4" />Adicionar {label}</button>)}
          </section>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Blocos do capítulo</p><p className="mt-1 text-sm font-bold">{safeBlockPage * BLOCKS_PER_PAGE + 1}–{Math.min((safeBlockPage + 1) * BLOCKS_PER_PAGE, chapter.blocks.length)} de {chapter.blocks.length}</p></div>
            <div className="flex items-center gap-2"><button type="button" aria-label="Blocos anteriores" disabled={safeBlockPage === 0} onClick={() => setBlockPage((page) => Math.max(0, page - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30 dark:border-slate-700"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-16 text-center text-xs font-bold">{safeBlockPage + 1} / {blockPageCount}</span><button type="button" aria-label="Próximos blocos" disabled={safeBlockPage >= blockPageCount - 1} onClick={() => setBlockPage((page) => Math.min(blockPageCount - 1, page + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30 dark:border-slate-700"><ChevronRight className="h-4 w-4" /></button></div>
          </div>

          <div className="space-y-4">{visibleBlocks.map(({ block, blockIndex }) => (
            <section key={block.id || blockIndex} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div><span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#486a91]">Bloco {blockIndex + 1}</span><p className="mt-0.5 text-sm font-bold capitalize text-slate-800 dark:text-white">{block.kind === "heading" ? "Título" : block.kind === "paragraph" ? "Texto" : block.kind === "table" ? "Tabela" : block.kind === "flow" ? "Fluxograma" : "Imagem"}</p></div>
                <div className="flex gap-1">
                  <button type="button" aria-label="Mover para cima" disabled={blockIndex === 0} onClick={() => changeChapter((current) => { const blocks = [...current.blocks]; [blocks[blockIndex - 1], blocks[blockIndex]] = [blocks[blockIndex], blocks[blockIndex - 1]]; return { ...current, blocks }; })} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" aria-label="Mover para baixo" disabled={blockIndex === chapter.blocks.length - 1} onClick={() => changeChapter((current) => { const blocks = [...current.blocks]; [blocks[blockIndex], blocks[blockIndex + 1]] = [blocks[blockIndex + 1], blocks[blockIndex]]; return { ...current, blocks }; })} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" aria-label="Duplicar bloco" onClick={() => changeChapter((current) => ({ ...current, blocks: [...current.blocks.slice(0, blockIndex + 1), { ...structuredClone(block), id: newId("block"), layoutHintKey: null }, ...current.blocks.slice(blockIndex + 1)] }))} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Copy className="h-4 w-4" /></button>
                  <button type="button" aria-label="Excluir bloco" disabled={chapter.blocks.length <= 1} onClick={() => { if (window.confirm("Excluir este bloco do rascunho?")) changeChapter((current) => ({ ...current, blocks: current.blocks.filter((_, index) => index !== blockIndex) })); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              </header>
              <div className="p-4"><BlockEditor block={block} onChange={(next) => changeBlock(blockIndex, next)} /></div>
            </section>
          ))}</div>
        </main>
      </div>

      {preview ? <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-100 dark:bg-slate-950"><button type="button" onClick={() => setPreview(false)} className="fixed right-4 top-4 z-[220] flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-bold text-white shadow-xl"><X className="h-4 w-4" />Fechar prévia</button><div className="p-2 sm:p-5"><AclsEbookSourceView key={`${chapter.slug}-${state.revision}-${dirty}`} chapter={chapter} chapters={readerChapters} activeIndex={selectedChapter} /></div></div> : null}
    </div>
  );
}
