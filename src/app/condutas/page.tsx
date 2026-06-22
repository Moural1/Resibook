"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";
import { getSearchScore } from "@/lib/search";
import { getClinicalSearchTerms, QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import {
  ArrowLeft,
  ChevronDown,
  Lock,
  Search,
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
    .replace(/^conduta\s+(em|para|no|na)\s+/i, "")
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

function buildPreview(value?: string | null) {
  const firstLine = getContentLines(value).find((line) => !looksLikeHeading(line));

  if (!firstLine) return "Clique para abrir a conduta completa.";

  return firstLine.length > 170 ? `${firstLine.slice(0, 170).trim()}...` : firstLine;
}


function rankConductsByClinicalSearch(items: Flashcard[], query: string) {
  const terms = getClinicalSearchTerms(query);

  if (!query.trim() || terms.length === 0) return items;

  return items
    .map((item, index) => {
      const fields = [
        { value: item.frente, weight: 10 },
        { value: item.materia, weight: 6 },
        { value: item.area, weight: 5 },
        { value: item.tipo, weight: 3 },
        { value: item.verso, weight: 2 },
      ];

      const score = Math.max(
        ...terms.map((term) => getSearchScore(fields, term))
      );

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
  const lines = getContentLines(value);

  if (lines.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-500">
        Sem conduta preenchida.
      </p>
    );
  }

  return lines.map((line, index) => {
    const bullet = line.match(/^[-•]\s+(.+)/);

    if (looksLikeHeading(line)) {
      return (
        <h4
          key={`heading-${index}`}
          className="mt-5 first:mt-0 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500"
        >
          {line.replace(/[:.]+$/g, "")}
        </h4>
      );
    }

    if (bullet) {
      return (
        <div key={`bullet-${index}`} className="flex gap-2 text-[15px] leading-8 text-slate-700">
          <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span>{bullet[1]}</span>
        </div>
      );
    }

    return (
      <p key={`line-${index}`} className="text-[15px] leading-8 text-slate-700">
        {line}
      </p>
    );
  });
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
            {item.area ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                {formatLabel(item.area)}
              </span>
            ) : null}

            {item.materia ? (
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

export default function CondutasPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const urlQuery = searchParams.get("busca") || searchParams.get("q") || "";

    if (urlQuery) {
      setQuery(urlQuery);
      setExpandedId(null);
    }
  }, [searchParams]);

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
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Consulta rápida
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Condutas médicas
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Lista simples, fechada por padrão, feita para abrir só a conduta que você quer revisar sem quebrar o texto em vários blocos coloridos.
            </p>
          </div>

          <Link
            href="/flashcards"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Flashcards
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
          <span>Total: <strong className="text-slate-800">{cards.length}</strong></span>
          <span>Exibindo: <strong className="text-slate-800">{filtered.length}</strong></span>
          {success ? <span className="text-emerald-700">{success}</span> : null}
          {error ? <span className="text-rose-700">Erro: {error}</span> : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por doença, exame, medicação ou manejo..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <select
            value={selectedArea}
            onChange={(event) => setSelectedArea(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
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

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Queixas rápidas
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Atalhos que já preenchem a busca por síndromes comuns do PA.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {QUICK_COMPLAINTS.map((complaint) => (
            <button
              key={complaint.title}
              type="button"
              onClick={() => {
                setQuery(complaint.title);
                setSelectedArea("");
                setExpandedId(null);
              }}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              {complaint.title}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="rounded-[24px] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
          Carregando condutas médicas...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Nenhuma conduta encontrada
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Marque flashcards importantes como difíceis para eles aparecerem aqui.
          </p>
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
