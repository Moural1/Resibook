"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";
import ModulePageHeader from "@/components/module-page-header";
import ClinicalText from "@/components/clinical-text";
import RelatedFlashcards from "@/components/related-flashcards";
import { canonicalArea, formatClinicalTitle, isTechnicalSourceLabel } from "@/lib/clinical-text";
import { relatedCardsForTopic, templatesForTopic, type LinkTemplate } from "@/lib/clinical-links";
import NoResultSearchLogger from "@/components/no-result-search-logger";
import ResibookGuard from "@/components/resibook-guard";
import { getSearchScore, rankSearchResults } from "@/lib/search";
import { findQuickComplaint, QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  FlaskConical,
  Gauge,
  Lock,
  Pill,
  Search,
  Siren,
  Tags,
  Trash2,
  X,
} from "lucide-react";

type Flashcard = {
  id: string;
  area: string | null;
  materia: string | null;
  tipo: string | null;
  frente: string | null;
  verso: string | null;
  dificil: boolean;
};

type MarkRow = {
  flashcard_id: string;
  dificil: boolean | null;
};

// Conduta por problema clínico: vem dos temas (topicos_medicos), na ordem em
// que se decide no atendimento.
type Tema = {
  id: number;
  area: string;
  titulo: string;
  resumo: string | null;
  exames: string | null;
  tratamento: string | null;
  conduta_urgencia: string | null;
  internacao_referencia: string | null;
  tags: string | null;
};

type Tab = "temas" | "marcados";

const CONDUCT_SECTIONS = [
  { key: "conduta_urgencia", title: "Na urgência", icon: Siren, tone: "rose" },
  { key: "tratamento", title: "Tratamento", icon: Pill, tone: "plain" },
  { key: "internacao_referencia", title: "Internação e encaminhamento", icon: Building2, tone: "amber" },
  { key: "exames", title: "Exames", icon: FlaskConical, tone: "plain" },
] as const;

const GUEST_EMAIL = "convidado@resibook.com";

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatLabel(value?: string | null, fallback = "Não informado") {
  const clean = value?.trim();

  if (!clean) return fallback;

  return formatClinicalTitle(clean.replace(/[_]+/g, " "));
}

function cleanLine(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/;(?=\S)/g, "; ")
    .replace(/,(?=\S)/g, ", ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function getContentLines(value?: string | null) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function formatConductTitle(value?: string | null) {
  const clean = cleanLine(value || "").replace(/[?]+$/g, "").trim();

  if (!clean) return "Conduta médica";

  const withoutQuestionIntro = clean
    .replace(/^como\s+(conduzir|manejar|tratar|abordar)\s+/i, "")
    .replace(/^qual\s+(é|e)\s+a\s+conduta\s+(em|para|no|na)\s+/i, "")
    .replace(/^conduta\s+(em|para|no|na)\s+/i, "")
    .trim();

  const title = formatClinicalTitle(withoutQuestionIntro || clean);

  return title.charAt(0).toUpperCase() + title.slice(1);
}

function buildConductText(item: Flashcard) {
  return [formatConductTitle(item.frente), item.verso || ""]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function buildPreview(value?: string | null) {
  const firstLine = getContentLines(value).find((line) => !looksLikeHeading(line));

  if (!firstLine) return "Clique para abrir a conduta completa.";

  return firstLine.length > 170 ? `${firstLine.slice(0, 170).trim()}...` : firstLine;
}

function rankConductsByClinicalSearch(items: Flashcard[], query: string) {
  if (!query.trim()) return items;

  return items
    .map((item, index) => {
      const fields = [
        { value: item.frente, weight: 10 },
        { value: item.materia, weight: 6 },
        { value: item.area, weight: 5 },
        { value: item.tipo, weight: 3 },
        { value: item.verso, weight: 2 },
      ];

      const score = getSearchScore(fields, query);

      return { item, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

function looksLikeHeading(line: string) {
  const clean = cleanLine(line).replace(/[:.]+$/g, "");
  const isShort = clean.length >= 3 && clean.length <= 74;
  const hasSentenceEnd = /[.!?]$/.test(line.trim());
  const isAllCaps =
    clean === clean.toUpperCase() &&
    /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(clean) &&
    !hasSentenceEnd;

  const clinicalHeading = /^(quando suspeitar|diagn[oó]stico|exames?|conduta|manejo|tratamento|prescri[cç][aã]o|sinais? de alarme|encaminhar|retorno|via de nutri[cç][aã]o|oral|enteral|parenteral|pegadinha|prova|aten[cç][aã]o)/i.test(clean);

  return isShort && (isAllCaps || clinicalHeading || /:$/.test(line.trim()));
}

function renderConductBody(value?: string | null) {
  return <ClinicalText value={value} emptyText="Sem conduta preenchida." size="lg" />;
}

function ConductItem({
  item,
  expanded,
  saving,
  onToggle,
  onRemove,
}: {
  item: Flashcard;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const title = formatConductTitle(item.frente);
  const preview = buildPreview(item.verso);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-slate-50 md:p-5"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
            {item.area && !isTechnicalSourceLabel(item.area) ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                {canonicalArea(item.area)}
              </span>
            ) : null}

            {item.materia && !isTechnicalSourceLabel(item.materia) ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                {formatLabel(item.materia)}
              </span>
            ) : null}
          </div>

          <h3 className="text-[15px] font-semibold leading-6 tracking-tight text-slate-950 md:text-base">
            {title}
          </h3>

          {!expanded ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
              {preview}
            </p>
          ) : null}
        </div>

        <div className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          <span>{expanded ? "Fechar" : "Abrir"}</span>
          <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-4 md:px-6 md:pb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <CopyButton
              text={buildConductText(item)}
              label="Copiar conduta"
              copiedLabel="Copiada"
            />

            <button
              type="button"
              onClick={onRemove}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {saving ? "Removendo..." : "Remover"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4 md:px-5">
            <div className="space-y-3">{renderConductBody(item.verso)}</div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function buildConductSheet(tema: Tema) {
  return [
    tema.titulo,
    ...CONDUCT_SECTIONS.filter((section) => tema[section.key]).map((section) => `${section.title.toUpperCase()}\n${tema[section.key]}`),
  ].join("\n\n");
}

export default function CondutasPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>("temas");
  const [temas, setTemas] = useState<Tema[]>([]);
  const [allCards, setAllCards] = useState<Omit<Flashcard, "dificil">[]>([]);
  const [templates, setTemplates] = useState<LinkTemplate[]>([]);
  const [selectedTemaId, setSelectedTemaId] = useState<number | null>(null);
  const [temaQuery, setTemaQuery] = useState("");
  const [temaArea, setTemaArea] = useState("");

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ?busca= / ?q= (dashboard, Caso rápido, busca global), ?t= (Tópicos) e
  // ?aba=marcados (lista antiga de cards marcados).
  useEffect(() => {
    const urlQuery = searchParams.get("busca") || searchParams.get("q") || "";
    const urlTema = Number(searchParams.get("t"));
    if (searchParams.get("aba") === "marcados") setTab("marcados");
    if (urlQuery) {
      setTemaQuery(urlQuery);
      setQuery(urlQuery);
      setExpandedId(null);
    }
    if (Number.isInteger(urlTema) && urlTema > 0) setSelectedTemaId(urlTema);
  }, [searchParams]);

  async function loadData() {
    setLoading(true);
    setError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    const user = sessionData.session?.user || null;
    const email = user?.email?.trim().toLowerCase() || "";
    const userId = user?.id || null;
    const guest = email === GUEST_EMAIL;

    setCurrentUserId(userId);
    setIsGuest(guest);

    const [temasRes, cardsRes, templatesRes, marksRes] = await Promise.all([
      supabase
        .from("topicos_medicos")
        .select("id, area, titulo, resumo, exames, tratamento, conduta_urgencia, internacao_referencia, tags")
        .order("area", { ascending: true })
        .order("titulo", { ascending: true }),
      supabase
        .from("flashcards")
        .select("id, area, materia, tipo, frente, verso")
        .order("area", { ascending: true, nullsFirst: false })
        .order("materia", { ascending: true, nullsFirst: false }),
      supabase.from("prescription_templates").select("id, titulo, categoria"),
      userId && !guest
        ? supabase.from("flashcard_user_marks").select("flashcard_id, dificil").eq("user_id", userId).eq("dificil", true)
        : Promise.resolve({ data: [] as MarkRow[], error: null }),
    ]);

    const firstError = temasRes.error || cardsRes.error || marksRes.error;
    if (firstError) setError(firstError.message);

    setTemas((temasRes.data as Tema[]) || []);
    setTemplates((templatesRes.data as LinkTemplate[]) || []);

    const rows = ((cardsRes.data || []) as Omit<Flashcard, "dificil">[]).map((item) => ({ ...item, id: String(item.id) }));
    setAllCards(rows);

    const difficultIds = new Set(
      ((marksRes.data || []) as MarkRow[]).filter((item) => item.dificil === true).map((item) => String(item.flashcard_id))
    );
    setCards(rows.filter((item) => difficultIds.has(item.id)).map((item) => ({ ...item, dificil: true })));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const temaAreas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tema of temas) counts.set(tema.area, (counts.get(tema.area) || 0) + 1);
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [temas]);

  const filteredTemas = useMemo(() => {
    const byArea = temas.filter((tema) => !temaArea || tema.area === temaArea);
    return rankSearchResults(byArea, temaQuery, (tema) => [
      { value: tema.titulo, weight: 10 },
      { value: tema.tags, weight: 7 },
      { value: tema.conduta_urgencia, weight: 4 },
      { value: tema.tratamento, weight: 4 },
      { value: tema.resumo, weight: 3 },
      { value: tema.internacao_referencia, weight: 2 },
      { value: tema.exames, weight: 1 },
    ]);
  }, [temas, temaArea, temaQuery]);

  const groupedTemas = useMemo(() => {
    const groups = new Map<string, Tema[]>();
    for (const tema of filteredTemas) groups.set(tema.area, [...(groups.get(tema.area) || []), tema]);
    return Array.from(groups.entries());
  }, [filteredTemas]);

  const selectedTema = temas.find((tema) => tema.id === selectedTemaId) ?? null;
  const temaCards = useMemo(() => (selectedTema ? relatedCardsForTopic(selectedTema, allCards, 4) : []), [selectedTema, allCards]);
  const temaTemplates = useMemo(() => (selectedTema ? templatesForTopic(selectedTema, templates) : []), [selectedTema, templates]);
  const activeComplaint = useMemo(() => findQuickComplaint(temaQuery), [temaQuery]);

  function selectTema(id: number | null) {
    setSelectedTemaId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("t", String(id));
    else url.searchParams.delete("t");
    url.searchParams.delete("busca");
    url.searchParams.delete("q");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    if (id && window.matchMedia("(max-width: 1023px)").matches) window.scrollTo({ top: 0 });
  }

  function changeTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "marcados") url.searchParams.set("aba", "marcados");
    else url.searchParams.delete("aba");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  const areas = useMemo(() => {
    return Array.from(new Set(cards.map((item) => canonicalArea(item.area)).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [cards]);

  const filtered = useMemo(() => {
    const normalizedArea = normalize(selectedArea);
    const filteredByArea = cards.filter((item) => {
      return !normalizedArea || normalize(item.area) === normalizedArea || normalize(canonicalArea(item.area)) === normalizedArea;
    });

    return rankConductsByClinicalSearch(filteredByArea, query);
  }, [cards, query, selectedArea]);

  async function removeDificil(id: string) {
    if (!currentUserId) {
      setError("Usuário autenticado não identificado.");
      return;
    }

    if (isGuest) {
      setError("Usuário convidado não pode acessar marcações individuais.");
      return;
    }

    if (savingIds.includes(id)) return;

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase
      .from("flashcard_user_marks")
      .delete()
      .eq("user_id", currentUserId)
      .eq("flashcard_id", id)
      .eq("dificil", true);

    if (error) {
      setError(error.message);
    } else {
      setCards((current) => current.filter((item) => item.id !== id));
      setExpandedId((current) => (current === id ? null : current));
      setSuccess("Card removido da lista de marcados.");
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  const continueLinks = selectedTema
    ? [
        { href: `/caso-rapido?busca=${encodeURIComponent(selectedTema.titulo)}`, label: "Caso rápido", icon: Gauge },
        { href: `/exames-evolucao?q=${encodeURIComponent(selectedTema.titulo)}`, label: "Exames e evolução", icon: FileText },
        { href: `/cids?q=${encodeURIComponent(selectedTema.titulo)}`, label: "CID", icon: Tags },
        { href: `/topicos?t=${selectedTema.id}`, label: "Tópico completo", icon: BookOpen },
      ]
    : [];

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Consulta rápida"
        title="Condutas"
        description="Manejo por problema clínico: o que fazer na urgência, o tratamento e quando internar ou encaminhar, com a prescrição pronta e os flashcards do tema."
        badges={[{ label: "Uso no plantão", tone: "cyan" }]}
        metrics={[
          { label: "Temas", value: temas.length },
          { label: "Áreas", value: temaAreas.length },
          { label: "Cards marcados", value: isGuest ? "-" : cards.length },
        ]}
        error={error}
        success={success}
      />

      <NoResultSearchLogger
        term={tab === "temas" ? temaQuery : query}
        resultCount={tab === "temas" ? filteredTemas.length : filtered.length}
        loading={loading}
        context="condutas"
      />
      <ResibookGuard context="conduta" />

      <div role="tablist" aria-label="Condutas" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          ["temas", "Por problema clínico", temas.length],
          ["marcados", "Meus cards marcados", isGuest ? null : cards.length],
        ] as const).map(([value, label, count]) => {
          const active = tab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeTab(value)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition ${
                active ? "bg-cyan-800 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
              {count !== null ? <span className={active ? "opacity-70" : "text-slate-400"}>{count}</span> : null}
            </button>
          );
        })}
      </div>

      {tab === "temas" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-start">
          <aside className={`min-w-0 lg:sticky lg:top-24 ${selectedTema ? "hidden lg:block" : ""}`}>
            <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
              <div className="space-y-3 border-b border-slate-200 p-3">
                <label className="relative block">
                  <span className="sr-only">Buscar conduta</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={temaQuery}
                    onChange={(event) => setTemaQuery(event.target.value)}
                    placeholder="Doença, queixa ou medicamento"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                  />
                  {temaQuery ? (
                    <button
                      type="button"
                      onClick={() => setTemaQuery("")}
                      aria-label="Limpar busca"
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Queixas do PA</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    {QUICK_COMPLAINTS.map((complaint) => {
                      const active = activeComplaint?.title === complaint.title;
                      return (
                        <button
                          key={complaint.title}
                          type="button"
                          onClick={() => setTemaQuery(active ? "" : complaint.title)}
                          aria-pressed={active}
                          className={`inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition ${
                            active ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {complaint.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {[["", "Todas", temas.length] as const, ...temaAreas.map(([area, count]) => [area, area, count] as const)].map(
                    ([value, label, count]) => {
                      const active = temaArea === value;
                      return (
                        <button
                          key={value || "todas"}
                          type="button"
                          onClick={() => setTemaArea(value)}
                          aria-pressed={active}
                          className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
                            active ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {label}
                          <span className={active ? "opacity-70" : "text-slate-400"}>{count}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {loading ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500">Carregando condutas...</p>
              ) : filteredTemas.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-800">Nenhuma conduta encontrada</p>
                  <p className="mt-1 text-xs text-slate-500">Tente outro termo ou mude a área.</p>
                </div>
              ) : (
                <nav aria-label="Lista de condutas" className="lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto">
                  {groupedTemas.map(([area, items]) => (
                    <div key={area}>
                      <p className="sticky top-0 z-[1] border-b border-slate-100 bg-slate-50/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
                        {area} · {items.length}
                      </p>
                      <ul>
                        {items.map((tema) => {
                          const active = tema.id === selectedTemaId;
                          return (
                            <li key={tema.id}>
                              <button
                                type="button"
                                onClick={() => selectTema(tema.id)}
                                aria-current={active ? "true" : undefined}
                                className={`flex w-full items-start gap-2 border-l-2 px-4 py-2.5 text-left transition ${
                                  active ? "border-cyan-700 bg-cyan-50/70" : "border-transparent hover:bg-slate-50"
                                }`}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className={`block text-sm ${active ? "font-semibold text-slate-950" : "font-medium text-slate-800"}`}>
                                    {tema.titulo}
                                  </span>
                                  {tema.conduta_urgencia ? (
                                    <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">{tema.conduta_urgencia}</span>
                                  ) : null}
                                </span>
                                <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-cyan-700" : "text-slate-300"}`} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              )}
            </section>
          </aside>

          <div className={`min-w-0 ${selectedTema ? "" : "hidden lg:block"}`}>
            {selectedTema ? (
              <article className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
                <header className="border-b border-slate-200 p-5 md:p-7">
                  <button
                    type="button"
                    onClick={() => selectTema(null)}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-800 lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à lista
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">{selectedTema.area}</p>
                  <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{selectedTema.titulo}</h2>
                  {selectedTema.resumo ? (
                    <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">{selectedTema.resumo}</p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {temaTemplates[0] ? (
                      <Link
                        href={`/prescricao?modelo=${temaTemplates[0].id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900"
                      >
                        <Pill className="h-4 w-4" />
                        Prescrição pronta
                      </Link>
                    ) : null}
                    <CopyButton text={buildConductSheet(selectedTema)} label="Copiar conduta" copiedLabel="Copiada" />
                  </div>
                </header>

                <div className="divide-y divide-slate-100">
                  {CONDUCT_SECTIONS.filter((section) => selectedTema[section.key]).map((section) => (
                    <section
                      key={section.key}
                      className={`px-5 py-5 md:px-7 ${section.tone === "rose" ? "bg-rose-50/50" : section.tone === "amber" ? "bg-amber-50/50" : ""}`}
                    >
                      <h3
                        className={`flex items-center gap-2 text-sm font-semibold ${
                          section.tone === "rose" ? "text-rose-800" : section.tone === "amber" ? "text-amber-800" : "text-slate-900"
                        }`}
                      >
                        <section.icon className="h-4 w-4" />
                        {section.title}
                      </h3>
                      <div className="mt-2.5">
                        <ClinicalText value={selectedTema[section.key]} />
                      </div>
                    </section>
                  ))}
                </div>

                {temaTemplates.length ? (
                  <div className="border-t border-slate-200 px-5 py-5 md:px-7">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Pill className="h-4 w-4" />
                      Modelos de prescrição do tema
                    </h3>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {temaTemplates.map((template) => (
                        <Link
                          key={template.id}
                          href={`/prescricao?modelo=${template.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm font-semibold text-cyan-900 transition hover:border-cyan-700/40"
                        >
                          {formatClinicalTitle(template.titulo)}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {temaCards.length ? (
                  <div className="border-t border-slate-200 px-5 py-5 md:px-7">
                    <RelatedFlashcards cards={temaCards} moreHref={`/flashcards?tema=${selectedTema.id}`} />
                  </div>
                ) : null}

                <div className="border-t border-slate-200 px-5 py-4 md:px-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Continuar com este tema</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {continueLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <link.icon className="h-4 w-4 text-slate-500" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500 md:px-7">
                  Conteúdo de apoio: confira doses, alergias e protocolos do serviço antes de aplicar.
                </footer>
              </article>
            ) : (
              <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
                  <Siren className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Escolha um problema clínico</h2>
                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Busque pela doença ou pela queixa na lista ao lado. A conduta abre aqui, com urgência, tratamento, internação, prescrição pronta e flashcards do tema.
                </p>
              </section>
            )}
          </div>
        </div>
      ) : isGuest ? (
        <section className="rounded-[20px] border border-amber-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Disponível com conta própria</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">
            O modo convidado não guarda marcações de flashcards. As condutas por problema clínico continuam abertas na outra aba.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              Cards que você marcou como difíceis nos Flashcards, para ter à mão no plantão.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_240px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar nos cards marcados"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>
              <select
                value={selectedArea}
                onChange={(event) => setSelectedArea(event.target.value)}
                aria-label="Filtrar por área"
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-600 focus:bg-white"
              >
                <option value="">Todas as áreas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {formatLabel(area)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedArea("");
                  setExpandedId(null);
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpar
              </button>
            </div>
          </section>

          {loading ? (
            <section className="rounded-[20px] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
              Carregando cards marcados...
            </section>
          ) : filtered.length === 0 ? (
            <section className="rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {cards.length === 0 ? "Nenhum card marcado ainda" : "Nenhum card encontrado"}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {cards.length === 0
                  ? "Nos Flashcards, marque como difícil o que quer ter à mão no plantão. Os cards marcados aparecem aqui."
                  : "Nenhum card marcado corresponde a essa busca. Tente outro termo ou limpe os filtros."}
              </p>
              {cards.length === 0 ? (
                <Link
                  href="/flashcards"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-cyan-800 px-5 text-sm font-semibold text-white transition hover:bg-cyan-900"
                >
                  Abrir Flashcards
                </Link>
              ) : null}
            </section>
          ) : (
            <section className="space-y-3">
              {filtered.map((item) => (
                <ConductItem
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  saving={savingIds.includes(item.id)}
                  onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                  onRemove={() => removeDificil(item.id)}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
