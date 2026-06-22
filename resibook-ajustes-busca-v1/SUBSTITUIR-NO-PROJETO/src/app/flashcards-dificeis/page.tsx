"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import CopyButton from "../../components/copy-button";
import { rankSearchResults } from "@/lib/search";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Layers3,
  Lock,
  Search,
  Stethoscope,
  Trash2,
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

type ConductSection = {
  number?: string;
  title: string;
  lines: string[];
};

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

  return clean.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
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
    .trim();

  const title = withoutQuestionIntro || clean;

  return title.charAt(0).toUpperCase() + title.slice(1);
}

function buildConductText(item: Flashcard) {
  return [formatConductTitle(item.frente), item.verso || ""]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function headingFromLine(line: string) {
  const numbered = line.match(/^(\d+)[\.)]\s+(.{3,})$/);

  if (numbered) {
    return {
      number: numbered[1],
      title: numbered[2].replace(/[:.]+$/g, "").trim(),
    };
  }

  const cleaned = line.replace(/[:.]+$/g, "").trim();
  const hasInlineContentAfterColon = /^.{2,42}:\s+\S+/.test(line);
  const isShort = cleaned.length >= 4 && cleaned.length <= 90;
  const isAllCaps =
    isShort &&
    cleaned === cleaned.toUpperCase() &&
    /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(cleaned) &&
    !/[.!?]$/.test(cleaned);

  const looksLikeProtocolHeading =
    isShort &&
    !hasInlineContentAfterColon &&
    /^(diagn[oó]stico|suspeita|quando suspeitar|exames?|exame de escolha|conduta|manejo|tratamento|antibi[oó]tico|crit[eé]rios|internar|alta|sinais de alarme|seguimento|prova|pegadinha|não esquecer|nunca esquecer)\b/i.test(
      cleaned
    );

  if (isAllCaps || looksLikeProtocolHeading) {
    return { title: cleaned };
  }

  return null;
}

function buildConductSections(value?: string | null): ConductSection[] {
  const lines = getContentLines(value);

  if (lines.length === 0) return [];

  const sections: ConductSection[] = [];
  let current: ConductSection | null = null;

  lines.forEach((line) => {
    const heading = headingFromLine(line);

    if (heading) {
      if (current) sections.push(current);
      current = { ...heading, lines: [] };
      return;
    }

    if (!current) {
      current = { title: "Manejo essencial", lines: [] };
    }

    current.lines.push(line);
  });

  if (current) sections.push(current);

  return sections.filter((section) => section.title || section.lines.length > 0);
}

function buildPreview(value?: string | null) {
  const lines = getContentLines(value).filter((line) => !headingFromLine(line));
  const preview = lines[0] || "Clique para abrir a conduta completa.";

  return preview.length > 170 ? `${preview.slice(0, 170).trim()}...` : preview;
}

function renderClinicalLine(line: string, key: string) {
  const clean = cleanLine(line);
  const labelMatch = clean.match(/^([^:]{2,54}):\s*(.+)$/);

  if (labelMatch) {
    const label = labelMatch[1].trim();
    const content = labelMatch[2].trim();
    const items = content
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length >= 2) {
      return (
        <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {items.map((item, index) => (
              <li key={`${key}-item-${index}`} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-700">{content}</p>
      </div>
    );
  }

  const semicolonItems = clean
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  if (semicolonItems.length >= 3) {
    return (
      <ul key={key} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
        {semicolonItems.map((item, index) => (
          <li key={`${key}-semi-${index}`} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (/^[-•]/.test(clean)) {
    return (
      <div key={key} className="flex gap-2 text-sm leading-7 text-slate-700">
        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
        <span>{clean.replace(/^[-•]\s*/, "")}</span>
      </div>
    );
  }

  return (
    <p key={key} className="text-sm leading-7 text-slate-700">
      {clean}
    </p>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </div>

        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
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
  const sections = buildConductSections(item.verso);

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-white shadow-sm transition ${
        expanded
          ? "border-cyan-200 shadow-slate-950/[0.04]"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-4 p-4 text-left transition hover:bg-slate-50/80 md:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              {item.area ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  <Layers3 className="h-3.5 w-3.5 text-slate-500" />
                  {formatLabel(item.area)}
                </span>
              ) : null}

              {item.materia ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                  {formatLabel(item.materia)}
                </span>
              ) : null}

              {item.tipo ? (
                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">
                  {formatLabel(item.tipo)}
                </span>
              ) : null}
            </div>

            <h3 className="text-base font-semibold tracking-tight text-slate-950 md:text-lg">
              {title}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {preview}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            <span>{expanded ? "Fechar" : "Abrir conduta"}</span>
            <ChevronDown
              className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 bg-slate-50/70 p-4 md:p-5">
          <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Conduta aberta
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Conteúdo organizado em blocos para consulta rápida.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <CopyButton text={buildConductText(item)} />

              <button
                type="button"
                onClick={onRemove}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {saving ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {sections.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                Sem conduta preenchida.
              </p>
            ) : (
              sections.map((section, sectionIndex) => (
                <section
                  key={`${item.id}-section-${sectionIndex}`}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 md:p-5"
                >
                  <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                      {section.number || sectionIndex + 1}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {section.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Bloco da conduta
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {section.lines.length === 0 ? (
                      <p className="text-sm leading-7 text-slate-500">
                        Sem detalhes adicionais neste bloco.
                      </p>
                    ) : (
                      section.lines.map((line, lineIndex) =>
                        renderClinicalLine(
                          line,
                          `${item.id}-section-${sectionIndex}-line-${lineIndex}`
                        )
                      )
                    )}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function FlashcardsDificeisPage() {
  const supabase = createClient();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCards() {
    setLoading(true);
    setError("");
    setSuccess("");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      setError(sessionError.message);
      setCards([]);
      setLoading(false);
      setSessionReady(true);
      return;
    }

    const user = sessionData.session?.user || null;
    const email = user?.email?.trim().toLowerCase() || "";
    const userId = user?.id || null;
    const guest = email === GUEST_EMAIL;

    setCurrentUserId(userId);
    setIsGuest(guest);
    setSessionReady(true);

    if (!userId || guest) {
      setCards([]);
      setLoading(false);
      return;
    }

    const [cardsRes, marksRes] = await Promise.all([
      supabase
        .from("flashcards")
        .select("id, area, materia, tipo, frente, verso")
        .order("area", { ascending: true, nullsFirst: false })
        .order("materia", { ascending: true, nullsFirst: false }),

      supabase
        .from("flashcard_user_marks")
        .select("flashcard_id, dificil")
        .eq("user_id", userId)
        .eq("dificil", true),
    ]);

    if (cardsRes.error) {
      setError(cardsRes.error.message);
      setCards([]);
      setLoading(false);
      return;
    }

    if (marksRes.error) {
      setError(marksRes.error.message);
    }

    const difficultIds = new Set(
      ((marksRes.data || []) as MarkRow[])
        .filter((item) => item.dificil === true)
        .map((item) => String(item.flashcard_id))
    );

    const mapped = ((cardsRes.data || []) as Omit<Flashcard, "dificil">[])
      .map((item) => ({
        ...item,
        id: String(item.id),
        dificil: difficultIds.has(String(item.id)),
      }))
      .filter((item) => item.dificil);

    setCards(mapped);
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = useMemo(() => {
    return Array.from(
      new Set(cards.map((item) => item.area).filter(Boolean) as string[])
    ).sort((a, b) => formatLabel(a).localeCompare(formatLabel(b)));
  }, [cards]);

  const filtered = useMemo(() => {
    const normalizedArea = normalize(selectedArea);
    const filteredByArea = cards.filter((item) => {
      return !normalizedArea || normalize(item.area) === normalizedArea;
    });

    return rankSearchResults(filteredByArea, query, (item) => [
      { value: item.frente, weight: 10 },
      { value: item.materia, weight: 6 },
      { value: item.area, weight: 5 },
      { value: item.tipo, weight: 3 },
      { value: item.verso, weight: 2 },
    ]);
  }, [cards, query, selectedArea]);

  const visibleAreas = new Set(filtered.map((item) => item.area).filter(Boolean))
    .size;

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
      setSuccess("Conduta removida da lista.");
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  if (!loading && sessionReady && isGuest) {
    return (
      <section className="rounded-[28px] border border-amber-200 bg-white p-6 shadow-sm">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Acesso restrito
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            O modo convidado não pode acessar condutas individuais nem marcações
            salvas na sua revisão.
          </p>

          <Link
            href="/topicos"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Ir para tópicos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Consulta rápida"
        title="Condutas médicas"
        description="Lista fechada por padrão, feita para você bater o olho na doença e abrir só a conduta que quiser revisar. A base continua vindo dos itens marcados como difíceis nos flashcards."
        badges={[
          { label: "Modo protocolo", tone: "cyan" },
          { label: "Marcados por você", tone: "slate" },
        ]}
        metrics={[
          { label: "Total", value: cards.length },
          { label: "Exibindo", value: filtered.length },
          { label: "Áreas", value: visibleAreas },
        ]}
        error={error}
        success={success}
        actions={
          <Link
            href="/flashcards"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Flashcards
          </Link>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard
            icon={<Stethoscope className="h-5 w-5" />}
            label="Condutas salvas"
            value={cards.length}
          />

          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Em exibição"
            value={filtered.length}
          />

          <StatCard
            icon={<Layers3 className="h-5 w-5" />}
            label="Áreas visíveis"
            value={visibleAreas}
          />
        </div>
      </ModulePageHeader>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Buscar conduta
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              Doença, exame, medicação ou manejo
            </h2>
          </div>

          <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 lg:self-auto">
            {filtered.length} de {cards.length} condutas
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_260px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: trauma vascular, AVC, sepse, antibiótico..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <select
            value={selectedArea}
            onChange={(event) => setSelectedArea(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
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
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpar
          </button>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-14 text-center text-sm font-medium text-slate-500 shadow-sm">
          Carregando condutas médicas...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhuma conduta encontrada
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Marque flashcards importantes como difíceis para eles aparecerem
            aqui em formato de conduta.
          </p>

          <Link
            href="/flashcards"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Ir para flashcards
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((item) => {
            const savingItem = savingIds.includes(item.id);
            const expanded = expandedId === item.id;

            return (
              <ConductItem
                key={item.id}
                item={item}
                expanded={expanded}
                saving={savingItem}
                onToggle={() =>
                  setExpandedId((current) => (current === item.id ? null : item.id))
                }
                onRemove={() => removeDificil(item.id)}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
