
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";
import { BookOpen, Edit3, Plus, Sparkles, Stethoscope, X } from "lucide-react";

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

type RelatedFlashcard = {
  id: string;
  area: string | null;
  materia: string | null;
  tipo: string | null;
  frente: string | null;
  verso: string | null;
  source_group: string | null;
  source_file: string | null;
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

const GUEST_EMAIL = "convidado@resibook.com";
const ADMIN_EMAIL = "igormoura@resibook.com";

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

function buildParagraphs(value?: string | null) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
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
    ["FONTE", item.fonte],
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

function RichText({ value }: { value?: string | null }) {
  const blocks = buildParagraphs(value);

  if (blocks.length === 0) {
    return <p className="text-sm leading-7 text-slate-400">Sem conteúdo</p>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const isList =
          lines.length > 1 &&
          lines.every((line) => /^[-•]/.test(line) || /^\d+[\.\)]/.test(line));

        if (isList) {
          const ordered = lines.every((line) => /^\d+[\.\)]/.test(line));

          if (ordered) {
            return (
              <ol key={index} className="ml-5 list-decimal space-y-2 text-sm leading-7 text-slate-700">
                {lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{line.replace(/^\d+[\.\)]\s*/, "")}</li>
                ))}
              </ol>
            );
          }

          return (
            <ul key={index} className="ml-5 list-disc space-y-2 text-sm leading-7 text-slate-700">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(/^[-•]\s*/, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function Section({
  title,
  value,
  tone = "slate",
}: {
  title: string;
  value?: string | null;
  tone?: "slate" | "rose" | "blue" | "emerald" | "amber";
}) {
  if (!value) return null;

  const toneClass = {
    slate: "border-slate-200 bg-slate-50",
    rose: "border-rose-200 bg-rose-50",
    blue: "border-blue-200 bg-blue-50",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
  }[tone];

  return (
    <div className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>
      <div className="mt-3">
        <RichText value={value} />
      </div>
    </div>
  );
}

function RelatedCardsPanel({
  cards,
}: {
  cards: RelatedFlashcard[];
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="rounded-[26px] border border-violet-200 bg-violet-50/70 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          Revisão rápida
        </span>
        <p className="text-sm text-violet-900">
          Flashcards relacionados a este tópico para revisão objetiva.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {cards.map((card) => {
          const open = openIds.includes(card.id);

          return (
            <article
              key={card.id}
              className="rounded-[22px] border border-white/70 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                {card.materia ? (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
                    {card.materia}
                  </span>
                ) : null}

                {card.tipo ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                    {card.tipo}
                  </span>
                ) : null}
              </div>

              <h4 className="mt-3 text-base font-semibold text-slate-900">
                {card.frente}
              </h4>

              {open ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <RichText value={card.verso} />
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => toggle(card.id)}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white"
                >
                  {open ? "Ocultar resposta" : "Revelar resposta"}
                </button>

                {card.verso ? <CopyButton text={`${card.frente}\n\n${card.verso}`} /> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function TopicosPage() {
  const supabase = createClient();

  const [topicos, setTopicos] = useState<TopicoMedico[]>([]);
  const [flashcards, setFlashcards] = useState<RelatedFlashcard[]>([]);
  const [checkingUser, setCheckingUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
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

    const email = data.session?.user?.email?.trim().toLowerCase() || "";

    setIsGuest(email === GUEST_EMAIL);
    setIsAdmin(email === ADMIN_EMAIL);
    setCheckingUser(false);
  }

  async function loadTopicos() {
    setLoading(true);
    setError("");

    const [topicosRes, flashcardsRes] = await Promise.all([
      supabase
        .from("topicos_medicos")
        .select(
          "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
        )
        .order("area", { ascending: true })
        .order("titulo", { ascending: true }),

      supabase
        .from("flashcards")
        .select("id, area, materia, tipo, frente, verso, source_group, source_file")
        .order("materia", { ascending: true, nullsFirst: false })
        .order("card_number", { ascending: true, nullsFirst: false }),
    ]);

    if (topicosRes.error) {
      setError(topicosRes.error.message);
      setTopicos([]);
    } else {
      setTopicos((topicosRes.data as TopicoMedico[]) || []);
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
    const q = normalize(query);

    return topicos.filter((item) => {
      const matchesArea = !selectedArea || item.area === selectedArea;

      const matchesQuery =
        !q ||
        normalize(item.area).includes(q) ||
        normalize(item.titulo).includes(q) ||
        normalize(item.resumo).includes(q) ||
        normalize(item.diagnostico).includes(q) ||
        normalize(item.criterios).includes(q) ||
        normalize(item.exames).includes(q) ||
        normalize(item.tratamento).includes(q) ||
        normalize(item.conduta_urgencia).includes(q) ||
        normalize(item.internacao_referencia).includes(q) ||
        normalize(item.pegadinhas).includes(q) ||
        normalize(item.tags).includes(q) ||
        normalize(item.fonte).includes(q);

      return matchesArea && matchesQuery;
    });
  }, [topicos, query, selectedArea]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, TopicoMedico[]>>((acc, item) => {
      if (!acc[item.area]) acc[item.area] = [];
      acc[item.area].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const hasFilters = Boolean(query || selectedArea);

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
      : await supabase.from("topicos_medicos").insert(payload).select("*").single();

    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      const saved = response.data as TopicoMedico;

      setTopicos((current) => {
        if (editingItem) {
          return current
            .map((item) => (item.id === editingItem.id ? saved : item))
            .sort((a, b) => `${a.area}-${a.titulo}`.localeCompare(`${b.area}-${b.titulo}`, "pt-BR"));
        }

        return [...current, saved].sort((a, b) =>
          `${a.area}-${a.titulo}`.localeCompare(`${b.area}-${b.titulo}`, "pt-BR")
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

    const { error } = await supabase.from("topicos_medicos").delete().eq("id", id);

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

  function getRelatedFlashcards(item: TopicoMedico) {
    const area = normalize(item.area);
    const title = normalize(item.titulo);
    const tags = normalize(item.tags)
      .split(/[,\n;]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const titleTokens = title
      .split(/\s+/)
      .filter((token) => token.length >= 4);

    const scored = flashcards
      .map((card) => {
        const haystack = normalize(
          [
            card.area,
            card.materia,
            card.tipo,
            card.frente,
            card.verso,
            card.source_group,
            card.source_file,
          ].join(" ")
        );

        let score = 0;

        if (area && haystack.includes(area)) score += 8;
        if (title && haystack.includes(title)) score += 10;

        for (const tag of tags) {
          if (tag && haystack.includes(tag)) score += 6;
        }

        for (const token of titleTokens) {
          if (haystack.includes(token)) score += 3;
        }

        if (normalize(card.materia) === area) score += 4;
        if (normalize(card.tipo) === title) score += 4;

        return { card, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 4).map((item) => item.card);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 py-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Biblioteca clínica
                </span>

                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  Tópicos médicos
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    isAdmin
                      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                      : "border-amber-300/30 bg-amber-400/10 text-amber-100"
                  }`}
                >
                  {isAdmin ? "Admin pode gerenciar" : "Somente leitura"}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Tópicos clínicos com revisão integrada
              </h1>

              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
                Biblioteca médica estruturada por área, com diagnóstico, critérios, exames,
                tratamento, urgência, internação/referência e agora também flashcards
                relacionados para revisão rápida dentro de cada tema.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
                <span>Total carregado do banco: {topicos.length}</span>
                <span>•</span>
                <span>Exibindo: {filtered.length}</span>
                <span>•</span>
                <span>Flashcards disponíveis: {flashcards.length}</span>
              </div>
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-900"
              >
                <Plus className="h-4 w-4" />
                Novo tópico
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
              Erro: {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              {success}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 bg-slate-50 p-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {areas.length}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Áreas clínicas
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {flashcards.length}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Flashcards relacionados
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {filtered.length}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tópicos visíveis
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Busca e filtros
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Procure pelo tema, área, resumo, tratamento, urgência ou tags.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tópico..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
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
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
          >
            {hasFilters ? "Limpar filtros" : "Filtros"}
          </button>
        </div>
      </section>

      {checkingUser || loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500 shadow-sm">
          Carregando tópicos...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500 shadow-sm">
          Nenhum tópico encontrado para esse filtro.
        </section>
      ) : (
        Object.entries(grouped).map(([area, items]) => (
          <section key={area} className="space-y-4">
            <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-600">
                  {formatLabel(area)}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {formatLabel(area)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {items.length} tópico{items.length > 1 ? "s" : ""} nesta área
                </p>
              </div>

              <div className="self-start rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </div>
            </div>

            <div className="grid gap-5">
              {items.map((item) => {
                const savingItem = savingIds.includes(item.id);
                const related = getRelatedFlashcards(item);

                return (
                  <article
                    key={item.id}
                    className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            {formatLabel(item.area)}
                          </span>

                          {item.prioridade ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Prioridade {item.prioridade}
                            </span>
                          ) : null}

                          {item.fonte ? (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                              {item.fonte}
                            </span>
                          ) : null}

                          {item.atualizado_em ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Atualizado em {formatDate(item.atualizado_em)}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                          {item.titulo}
                        </h3>

                        {item.tags ? (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Tags: {item.tags}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <CopyButton text={buildFullText(item)} />

                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditDrawer(item)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                            >
                              <Edit3 className="h-4 w-4" />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.titulo)}
                              disabled={savingItem}
                              className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingItem ? "Apagando..." : "Apagar"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      <Section title="Resumo" value={item.resumo} tone="blue" />
                      <Section title="Diagnóstico" value={item.diagnostico} tone="emerald" />
                      <Section title="Critérios / classificação" value={item.criterios} tone="amber" />
                      <Section title="Exames" value={item.exames} tone="slate" />
                      <Section title="Tratamento / conduta" value={item.tratamento} tone="blue" />
                      <Section title="Conduta na urgência" value={item.conduta_urgencia} tone="rose" />
                      <Section title="Internação / referência" value={item.internacao_referencia} tone="emerald" />
                      <Section title="Pegadinhas de prova" value={item.pegadinhas} tone="amber" />
                    </div>

                    <div className="mt-6">
                      <RelatedCardsPanel cards={related} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar edição"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingItem ? "Editar tópico" : "Novo tópico"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar a biblioteca de tópicos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
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
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.titulo}
                  onChange={(e) => updateForm("titulo", e.target.value)}
                  placeholder="Título"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.tags}
                  onChange={(e) => updateForm("tags", e.target.value)}
                  placeholder="Tags"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.prioridade}
                  onChange={(e) => updateForm("prioridade", e.target.value)}
                  placeholder="Prioridade"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.fonte}
                  onChange={(e) => updateForm("fonte", e.target.value)}
                  placeholder="Fonte"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:col-span-2"
                />
              </div>

              <textarea
                value={form.resumo}
                onChange={(e) => updateForm("resumo", e.target.value)}
                placeholder="Resumo"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.diagnostico}
                onChange={(e) => updateForm("diagnostico", e.target.value)}
                placeholder="Diagnóstico"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.criterios}
                onChange={(e) => updateForm("criterios", e.target.value)}
                placeholder="Critérios / classificação"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.exames}
                onChange={(e) => updateForm("exames", e.target.value)}
                placeholder="Exames"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.tratamento}
                onChange={(e) => updateForm("tratamento", e.target.value)}
                placeholder="Tratamento / conduta"
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.conduta_urgencia}
                onChange={(e) => updateForm("conduta_urgencia", e.target.value)}
                placeholder="Conduta na urgência"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.internacao_referencia}
                onChange={(e) => updateForm("internacao_referencia", e.target.value)}
                placeholder="Internação / referência"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.pegadinhas}
                onChange={(e) => updateForm("pegadinhas", e.target.value)}
                placeholder="Pegadinhas de prova"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
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
