"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isResibookAdmin } from "@/lib/auth-role";
import CopyButton from "../../components/copy-button";
import ModulePageHeader from "../../components/module-page-header";
import { rankSearchResults } from "@/lib/search";
import ClinicalText from "@/components/clinical-text";
import RelatedFlashcards, { type RelatedFlashcard } from "@/components/related-flashcards";
import { relatedCardsForTopic, templatesForTopic, type LinkTemplate } from "@/lib/clinical-links";
import { formatClinicalTitle } from "@/lib/clinical-text";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  Edit3,
  FlaskConical,
  Gauge,
  Lightbulb,
  ListChecks,
  Pill,
  Plus,
  Search,
  Siren,
  Stethoscope,
  Workflow,
  X,
} from "lucide-react";

type TopicoMedico = {
  id: number;
  area: string;
  titulo: string;
  resumo: string | null;
  diagnostico: string | null;
  criterios: string | null;
  exames: string | null;
  tratamento: string | null;
  conduta_urgencia: string | null;
  internacao_referencia: string | null;
  pegadinhas: string | null;
  tags: string | null;
  prioridade: number | null;
  fonte: string | null;
  atualizado_em: string | null;
};

type TopicoForm = {
  area: string;
  titulo: string;
  resumo: string;
  diagnostico: string;
  criterios: string;
  exames: string;
  tratamento: string;
  conduta_urgencia: string;
  internacao_referencia: string;
  pegadinhas: string;
  tags: string;
  prioridade: string;
  fonte: string;
};


const emptyForm: TopicoForm = {
  area: "",
  titulo: "",
  resumo: "",
  diagnostico: "",
  criterios: "",
  exames: "",
  tratamento: "",
  conduta_urgencia: "",
  internacao_referencia: "",
  pegadinhas: "",
  tags: "",
  prioridade: "1",
  fonte: "ResiBook",
};

type ReaderKey = "diagnostico" | "criterios" | "exames" | "tratamento" | "conduta_urgencia" | "internacao_referencia" | "pegadinhas";

const READER_SECTIONS: { key: ReaderKey; title: string; icon: typeof Search; tone?: "rose" | "amber" }[] = [
  { key: "diagnostico", title: "Diagnóstico", icon: Stethoscope },
  { key: "criterios", title: "Critérios e classificação", icon: ListChecks },
  { key: "exames", title: "Exames", icon: FlaskConical },
  { key: "tratamento", title: "Tratamento e conduta", icon: Pill },
  { key: "conduta_urgencia", title: "Na urgência", icon: Siren, tone: "rose" },
  { key: "internacao_referencia", title: "Internação e referência", icon: Building2 },
  { key: "pegadinhas", title: "Pegadinhas de prova", icon: Lightbulb, tone: "amber" },
];

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatLabel(value?: string | null) {
  if (!value) return "Sem área";
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}


function buildFullText(item: TopicoMedico) {
  const sections = [
    ["TEMA", item.titulo],
    ["ÁREA", item.area],
    ["RESUMO", item.resumo],
    ["DIAGNÓSTICO", item.diagnostico],
    ["CRITÉRIOS / CLASSIFICAÇÃO", item.criterios],
    ["EXAMES", item.exames],
    ["TRATAMENTO / CONDUTA", item.tratamento],
    ["CONDUTA NA URGÊNCIA", item.conduta_urgencia],
    ["INTERNAÇÃO / REFERÊNCIA", item.internacao_referencia],
    ["PEGADINHAS DE PROVA", item.pegadinhas],
    ["TAGS", item.tags],
  ];

  return sections
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}\n${value}`)
    .join("\n\n");
}

function toForm(item: TopicoMedico): TopicoForm {
  return {
    area: item.area || "",
    titulo: item.titulo || "",
    resumo: item.resumo || "",
    diagnostico: item.diagnostico || "",
    criterios: item.criterios || "",
    exames: item.exames || "",
    tratamento: item.tratamento || "",
    conduta_urgencia: item.conduta_urgencia || "",
    internacao_referencia: item.internacao_referencia || "",
    pegadinhas: item.pegadinhas || "",
    tags: item.tags || "",
    prioridade: item.prioridade ? String(item.prioridade) : "1",
    fonte: item.fonte || "ResiBook",
  };
}

function buildPayload(form: TopicoForm) {
  return {
    area: form.area.trim(),
    titulo: form.titulo.trim(),
    resumo: form.resumo.trim() || null,
    diagnostico: form.diagnostico.trim() || null,
    criterios: form.criterios.trim() || null,
    exames: form.exames.trim() || null,
    tratamento: form.tratamento.trim() || null,
    conduta_urgencia: form.conduta_urgencia.trim() || null,
    internacao_referencia: form.internacao_referencia.trim() || null,
    pegadinhas: form.pegadinhas.trim() || null,
    tags: form.tags.trim() || null,
    prioridade: form.prioridade ? Number(form.prioridade) : 1,
    fonte: form.fonte.trim() || "ResiBook",
    atualizado_em: new Date().toISOString(),
  };
}




export default function TopicosPage() {
  const supabase = createClient();

  const [topicos, setTopicos] = useState<TopicoMedico[]>([]);
  const [flashcards, setFlashcards] = useState<RelatedFlashcard[]>([]);
  const [templates, setTemplates] = useState<LinkTemplate[]>([]);
  const [checkingUser, setCheckingUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<TopicoMedico | null>(null);
  const [form, setForm] = useState<TopicoForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function checkUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setError(error.message);
      setCheckingUser(false);
      return;
    }

    setIsAdmin(isResibookAdmin(data.session?.user));
    setCheckingUser(false);
  }

  async function loadTopicos() {
    setLoading(true);
    setError("");

    const [topicosRes, flashcardsRes, templatesRes] = await Promise.all([
      supabase
        .from("topicos_medicos")
        .select(
          "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
        )
        .order("area", { ascending: true })
        .order("titulo", { ascending: true }),

      supabase
        .from("flashcards")
        .select(
          "id, area, materia, tipo, frente, verso"
        )
        .order("materia", { ascending: true, nullsFirst: false })
        .order("card_number", { ascending: true, nullsFirst: false }),

      supabase.from("prescription_templates").select("id, titulo, categoria"),
    ]);

    setTemplates((templatesRes.data as LinkTemplate[]) || []);

    if (topicosRes.error) {
      setError(topicosRes.error.message);
      setTopicos([]);
    } else {
      const rows = (topicosRes.data as TopicoMedico[]) || [];
      setTopicos(rows);
      // Links da busca global (?q=Título) e de compartilhamento (?t=id).
      const params = new URLSearchParams(window.location.search);
      const byId = rows.find((item) => String(item.id) === params.get("t"));
      const q = params.get("q")?.trim() || "";
      const byTitle = q ? rows.find((item) => normalize(item.titulo) === normalize(q)) : undefined;
      if (byId || byTitle) setSelectedId((byId || byTitle)!.id);
      else if (q) setQuery(q);
    }

    if (flashcardsRes.error) {
      setError((current) => current || flashcardsRes.error?.message || "");
      setFlashcards([]);
    } else {
      setFlashcards((flashcardsRes.data as RelatedFlashcard[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    checkUser();
    loadTopicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = useMemo(() => {
    return Array.from(new Set(topicos.map((item) => item.area))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [topicos]);

  const filtered = useMemo(() => {
    const filteredByArea = topicos.filter((item) => {
      return !selectedArea || item.area === selectedArea;
    });

    return rankSearchResults(filteredByArea, query, (item) => [
      { value: item.titulo, weight: 10 },
      { value: item.tags, weight: 7 },
      { value: item.area, weight: 5 },
      { value: item.resumo, weight: 4 },
      { value: item.diagnostico, weight: 3 },
      { value: item.tratamento, weight: 3 },
      { value: item.conduta_urgencia, weight: 3 },
      { value: item.criterios, weight: 2 },
      { value: item.exames, weight: 2 },
      { value: item.internacao_referencia, weight: 2 },
      { value: item.pegadinhas, weight: 2 },
      { value: item.fonte, weight: 1 },
    ]);
  }, [topicos, query, selectedArea]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, TopicoMedico[]>>((acc, item) => {
      if (!acc[item.area]) acc[item.area] = [];
      acc[item.area].push(item);
      return acc;
    }, {});
  }, [filtered]);


  function updateForm<K extends keyof TopicoForm>(key: K, value: TopicoForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateDrawer() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar tópicos.");
      return;
    }

    setEditingItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditDrawer(item: TopicoMedico) {
    if (!isAdmin) {
      setError("Apenas o administrador pode editar tópicos.");
      return;
    }

    setEditingItem(item);
    setForm(toForm(item));
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }


  async function handleSave() {
    if (!isAdmin) {
      setError("Apenas o administrador pode salvar tópicos.");
      return;
    }

    if (!form.area.trim() || !form.titulo.trim()) {
      setError("Área e título são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = buildPayload(form);

    const response = editingItem
      ? await supabase
          .from("topicos_medicos")
          .update(payload)
          .eq("id", editingItem.id)
          .select("*")
          .single()
      : await supabase
          .from("topicos_medicos")
          .insert(payload)
          .select("*")
          .single();

    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      const saved = response.data as TopicoMedico;

      setTopicos((current) => {
        if (editingItem) {
          return current
            .map((item) => (item.id === editingItem.id ? saved : item))
            .sort((a, b) =>
              `${a.area}-${a.titulo}`.localeCompare(
                `${b.area}-${b.titulo}`,
                "pt-BR"
              )
            );
        }

        return [...current, saved].sort((a, b) =>
          `${a.area}-${a.titulo}`.localeCompare(
            `${b.area}-${b.titulo}`,
            "pt-BR"
          )
        );
      });

      setSuccess(
        editingItem
          ? "Tópico atualizado com sucesso."
          : "Tópico criado com sucesso."
      );
      closeDrawer();
    }

    setSaving(false);
  }

  async function handleDelete(id: number, title: string) {
    if (!isAdmin) {
      setError("Apenas o administrador pode apagar tópicos.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o tópico "${title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase
      .from("topicos_medicos")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setTopicos((current) => current.filter((item) => item.id !== id));
      setSuccess("Tópico apagado com sucesso.");

      if (editingItem?.id === id) {
        closeDrawer();
      }
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }


  const selected = topicos.find((item) => item.id === selectedId) ?? null;
  const related = useMemo(() => (selected ? relatedCardsForTopic(selected, flashcards, 4) : []), [selected, flashcards]);
  const relatedTemplates = useMemo(() => (selected ? templatesForTopic(selected, templates) : []), [selected, templates]);
  const readerSections = selected
    ? READER_SECTIONS.filter((section) => Boolean(selected[section.key]))
    : [];

  function selectTopic(id: number | null) {
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("t", String(id));
    else url.searchParams.delete("t");
    url.searchParams.delete("q");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    if (id && window.matchMedia("(max-width: 1023px)").matches) window.scrollTo({ top: 0 });
  }

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Biblioteca clínica"
        title="Tópicos clínicos"
        description="Resumo, diagnóstico, exames, conduta, urgência e pegadinhas de cada tema, com flashcards relacionados."
        badges={[
          { label: "Consulta rápida", tone: "blue" },
          ...(isAdmin ? [{ label: "Gerenciamento liberado", tone: "emerald" as const }] : []),
        ]}
        metrics={[
          { label: "Áreas", value: areas.length },
          { label: "Tópicos", value: topicos.length },
          { label: "Flashcards", value: flashcards.length },
        ]}
        error={error}
        success={success}
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              <Plus className="h-4 w-4" />
              Novo tópico
            </button>
          ) : null
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-start">
        <aside className={`min-w-0 space-y-3 lg:sticky lg:top-24 ${selected ? "hidden lg:block" : ""}`}>
          <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <div className="space-y-3 border-b border-slate-200 p-3">
              <label className="relative block">
                <span className="sr-only">Buscar tópico</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar tema, sintoma ou tag"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {[["", "Todas", topicos.length] as const, ...areas.map((area) => [area, formatLabel(area), topicos.filter((item) => item.area === area).length] as const)].map(
                  ([value, label, count]) => {
                    const active = selectedArea === value;
                    return (
                      <button
                        key={value || "todas"}
                        type="button"
                        onClick={() => setSelectedArea(value)}
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

            {checkingUser || loading ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">Carregando tópicos...</p>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-slate-800">Nenhum tópico encontrado</p>
                <p className="mt-1 text-xs text-slate-500">Tente outro termo ou mude a área.</p>
              </div>
            ) : (
              <nav aria-label="Lista de tópicos" className="lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto">
                {Object.entries(grouped).map(([area, items]) => (
                  <div key={area}>
                    <p className="sticky top-0 z-[1] border-b border-slate-100 bg-slate-50/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
                      {formatLabel(area)} · {items.length}
                    </p>
                    <ul>
                      {items.map((item) => {
                        const active = item.id === selectedId;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => selectTopic(item.id)}
                              aria-current={active ? "true" : undefined}
                              className={`flex w-full items-start gap-2 border-l-2 px-4 py-2.5 text-left transition ${
                                active ? "border-cyan-700 bg-cyan-50/70" : "border-transparent hover:bg-slate-50"
                              }`}
                            >
                              <span className="min-w-0 flex-1">
                                <span className={`block text-sm ${active ? "font-semibold text-slate-950" : "font-medium text-slate-800"}`}>
                                  {item.titulo}
                                </span>
                                {item.resumo ? (
                                  <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.resumo}</span>
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

          <Link
            href="/fluxos"
            className="group flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3.5 py-3 transition hover:border-cyan-700/40"
          >
            <Workflow className="h-4 w-4 shrink-0 text-cyan-800" />
            <span className="min-w-0 flex-1 text-xs text-cyan-950">
              <span className="font-semibold">Fluxogramas de revisão:</span> algoritmos, o que mais cai e pegadinhas.
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-cyan-800 transition group-hover:translate-x-0.5" />
          </Link>
        </aside>

        <div className={`min-w-0 ${selected ? "" : "hidden lg:block"}`}>
          {selected ? (
            <article className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-200 p-5 md:p-7">
                <button
                  type="button"
                  onClick={() => selectTopic(null)}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-800 lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar à lista
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">{formatLabel(selected.area)}</p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{selected.titulo}</h2>
                {selected.resumo ? (
                  <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">{selected.resumo}</p>
                ) : null}
                {selected.tags ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selected.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, index) => (
                        <button
                          key={`${index}-${tag}`}
                          type="button"
                          onClick={() => setQuery(tag)}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/caso-rapido?busca=${encodeURIComponent(selected.titulo)}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900"
                  >
                    <Gauge className="h-4 w-4" />
                    Abrir no Caso rápido
                  </Link>
                  <Link
                    href={`/condutas?t=${selected.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Siren className="h-4 w-4" />
                    Ver conduta
                  </Link>
                  <CopyButton text={buildFullText(selected)} label="Copiar tópico" />
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditDrawer(selected)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(selected.id, selected.titulo)}
                        disabled={savingIds.includes(selected.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                      >
                        {savingIds.includes(selected.id) ? "Apagando..." : "Apagar"}
                      </button>
                    </>
                  ) : null}
                </div>

                {readerSections.length > 1 ? (
                  <nav aria-label="Seções do tópico" className="mt-5 flex flex-wrap gap-1.5">
                    {readerSections.map((section) => (
                      <a
                        key={section.key}
                        href={`#topico-${section.key}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                ) : null}
              </header>

              <div className="divide-y divide-slate-100">
                {readerSections.map((section) => (
                  <section
                    key={section.key}
                    id={`topico-${section.key}`}
                    className={`scroll-mt-24 px-5 py-5 md:px-7 ${section.tone === "rose" ? "bg-rose-50/50" : section.tone === "amber" ? "bg-amber-50/50" : ""}`}
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
                      <ClinicalText value={selected[section.key]} />
                    </div>
                  </section>
                ))}
              </div>

              {relatedTemplates.length ? (
                <div className="border-t border-slate-200 px-5 py-5 md:px-7">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Pill className="h-4 w-4" />
                    Prescrição pronta
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {relatedTemplates.map((template) => (
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

              {related.length ? (
                <div className="border-t border-slate-200 px-5 py-5 md:px-7">
                  <RelatedFlashcards cards={related} moreHref={`/flashcards?tema=${selected.id}`} />
                </div>
              ) : null}

              <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500 md:px-7">
                {selected.fonte ? <span>Fonte: {selected.fonte}</span> : null}
                {selected.atualizado_em ? <span>Atualizado em {formatDate(selected.atualizado_em)}</span> : null}
                <span>Conteúdo de apoio: confira doses e condutas antes de usar.</span>
              </footer>
            </article>
          ) : (
            <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
                <BookOpen className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Escolha um tópico</h2>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                Busque pelo tema, sintoma ou tag na lista ao lado. O tópico abre aqui, com as seções e os flashcards relacionados.
              </p>
            </section>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar edição"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Biblioteca de tópicos
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {editingItem ? "Editar tópico" : "Novo tópico"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar a biblioteca de tópicos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.area}
                  onChange={(e) => updateForm("area", e.target.value)}
                  placeholder="Área"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                <input
                  value={form.titulo}
                  onChange={(e) => updateForm("titulo", e.target.value)}
                  placeholder="Título"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                <input
                  value={form.tags}
                  onChange={(e) => updateForm("tags", e.target.value)}
                  placeholder="Tags"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                <input
                  value={form.prioridade}
                  onChange={(e) => updateForm("prioridade", e.target.value)}
                  placeholder="Prioridade"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                <input
                  value={form.fonte}
                  onChange={(e) => updateForm("fonte", e.target.value)}
                  placeholder="Fonte"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:col-span-2"
                />
              </div>

              <textarea
                value={form.resumo}
                onChange={(e) => updateForm("resumo", e.target.value)}
                placeholder="Resumo"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.diagnostico}
                onChange={(e) => updateForm("diagnostico", e.target.value)}
                placeholder="Diagnóstico"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.criterios}
                onChange={(e) => updateForm("criterios", e.target.value)}
                placeholder="Critérios / classificação"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.exames}
                onChange={(e) => updateForm("exames", e.target.value)}
                placeholder="Exames"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.tratamento}
                onChange={(e) => updateForm("tratamento", e.target.value)}
                placeholder="Tratamento / conduta"
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.conduta_urgencia}
                onChange={(e) => updateForm("conduta_urgencia", e.target.value)}
                placeholder="Conduta na urgência"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.internacao_referencia}
                onChange={(e) =>
                  updateForm("internacao_referencia", e.target.value)
                }
                placeholder="Internação / referência"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <textarea
                value={form.pegadinhas}
                onChange={(e) => updateForm("pegadinhas", e.target.value)}
                placeholder="Pegadinhas de prova"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingItem
                    ? "Salvar edição"
                    : "Criar tópico"}
                </button>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

