"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import {
  ArrowLeft,
  Brain,
  Layers3,
  Lock,
  Search,
  Sparkles,
  Target,
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

function buildParagraphs(value?: string | null) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderRichText(value?: string | null, emptyText = "Sem conteúdo") {
  const blocks = buildParagraphs(value);

  if (blocks.length === 0) {
    return <p className="text-sm leading-7 text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const isBulletList =
          lines.length > 1 &&
          lines.every((line) => /^[-•]/.test(line) || /^\d+[\.\)]/.test(line));

        if (isBulletList) {
          const ordered = lines.every((line) => /^\d+[\.\)]/.test(line));

          if (ordered) {
            return (
              <ol
                key={index}
                className="ml-5 list-decimal space-y-2 text-sm leading-7 text-slate-700"
              >
                {lines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    {line.replace(/^\d+[\.\)]\s*/, "")}
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <ul
              key={index}
              className="ml-5 list-disc space-y-2 text-sm leading-7 text-slate-700"
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{line.replace(/^[-•]\s*/, "")}</li>
              ))}
            </ul>
          );
        }

        if (lines.length === 1) {
          const line = lines[0];
          const labelMatch = line.match(/^([^:]{2,40}):\s*(.+)$/);

          if (labelMatch) {
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {labelMatch[1]}
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {labelMatch[2]}
                </p>
              </div>
            );
          }
        }

        return (
          <p
            key={index}
            className="whitespace-pre-wrap text-sm leading-7 text-slate-700"
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </div>

        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
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
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);

    return cards.filter((item) => {
      if (!normalizedQuery) return true;

      return (
        normalize(item.frente).includes(normalizedQuery) ||
        normalize(item.verso).includes(normalizedQuery) ||
        normalize(item.area).includes(normalizedQuery) ||
        normalize(item.materia).includes(normalizedQuery) ||
        normalize(item.tipo).includes(normalizedQuery)
      );
    });
  }, [cards, query]);

  const revealedCount = revealedIds.length;
  const visibleAreas = new Set(filtered.map((item) => item.area).filter(Boolean))
    .size;

  function toggleReveal(id: string) {
    setRevealedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

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
      const removed = cards.find((item) => item.id === id);

      setCards((current) => current.filter((item) => item.id !== id));
      setRevealedIds((current) => current.filter((item) => item !== id));
      setSuccess(
        removed?.frente
          ? "Flashcard removido dos difíceis."
          : "Item removido dos difíceis."
      );
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
            O modo convidado não pode acessar flashcards difíceis nem marcações
            individuais de revisão.
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
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Revisão individual"
        title="Flashcards difíceis"
        description="Revisão focada nos cartões que você marcou como mais difíceis, com busca rápida e resposta organizada."
        badges={[
          { label: "Difíceis", tone: "amber" },
          { label: "Revisão individual", tone: "slate" },
        ]}
        metrics={[
          { label: "Total", value: cards.length },
          { label: "Exibindo", value: filtered.length },
          { label: "Revelados", value: revealedCount },
          { label: "Áreas visíveis", value: visibleAreas },
        ]}
        error={error}
        success={success}
        actions={
          <Link
            href="/flashcards"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos os flashcards
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={<Brain className="h-5 w-5" />}
            label="Difíceis"
            value={cards.length}
          />

          <StatCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Revelados"
            value={revealedCount}
          />

          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Áreas visíveis"
            value={visibleAreas}
          />
        </div>
      </ModulePageHeader>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Foco de revisão
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Busca nos difíceis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Procure por frente, verso, área, matéria ou tipo.
            </p>
          </div>

          <span className="inline-flex self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 lg:self-auto">
            {filtered.length} de {cards.length} flashcards
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar nos difíceis..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setQuery("")}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {query ? "Limpar busca" : "Buscar"}
          </button>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-14 text-center text-sm font-medium text-slate-500 shadow-sm">
          Carregando flashcards difíceis...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhum flashcard difícil encontrado
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Você pode marcar cards como difíceis na biblioteca geral de
            flashcards.
          </p>

          <Link
            href="/flashcards"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Ir para flashcards
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {filtered.map((item) => {
            const revealed = revealedIds.includes(item.id);
            const savingItem = savingIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {item.area ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        <Layers3 className="h-3.5 w-3.5 text-slate-500" />
                        {formatLabel(item.area)}
                      </span>
                    ) : null}

                    {item.materia ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {formatLabel(item.materia)}
                      </span>
                    ) : null}

                    {item.tipo ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {formatLabel(item.tipo)}
                      </span>
                    ) : null}

                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Difícil
                    </span>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      revealed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {revealed ? "Aberto" : "Fechado"}
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Frente
                  </p>

                  <div className="mt-3">
                    {renderRichText(item.frente, "Sem frente")}
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Verso
                    </p>

                    {revealed ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        Resposta
                      </span>
                    ) : null}
                  </div>

                  {revealed ? (
                    <div className="mt-4">
                      {renderRichText(item.verso, "Sem verso")}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                      <p className="text-sm leading-7 text-slate-400">
                        Resposta oculta. Revele para revisar e decidir se ainda
                        precisa manter este card como difícil.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {revealed ? "Ocultar resposta" : "Revelar resposta"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeDificil(item.id)}
                    disabled={savingItem}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingItem ? "Removendo..." : "Remover dos difíceis"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}