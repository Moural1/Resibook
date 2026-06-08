"use client";

import { useMemo, useState } from "react";

export type FlashcardItem = {
  id: string;
  source_file: string;
  source_group: string;
  card_number: number | null;
  frente: string;
  verso: string;
  tags: string[] | null;
  created_at: string;
};

export type FlashcardReviewItem = {
  flashcard_id: string;
  status: "novo" | "rever" | "dificil" | "dominado";
  review_count: number;
};

type Props = {
  flashcards: FlashcardItem[];
  reviews: FlashcardReviewItem[];
};

type ReviewStatus = FlashcardReviewItem["status"];
type FilterStatus = "todos" | ReviewStatus;

const statusStyle: Record<ReviewStatus, string> = {
  novo: "border-slate-200 bg-white text-slate-700",
  rever: "border-amber-200 bg-amber-50 text-amber-700",
  dificil: "border-rose-200 bg-rose-50 text-rose-700",
  dominado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function filterStyle(status: FilterStatus, active: boolean) {
  if (active) return "bg-slate-900 text-white";
  if (status === "todos") return "border border-slate-200 bg-white text-slate-700";
  return `border ${statusStyle[status]}`;
}

function buildParagraphs(value?: string | null) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderRichText(value?: string | null) {
  const blocks = buildParagraphs(value);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {block}
        </p>
      ))}
    </div>
  );
}

export default function FlashcardsBoard({ flashcards, reviews }: Props) {
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("todos");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<Record<string, FlashcardReviewItem>>(
    Object.fromEntries(reviews.map((item) => [item.flashcard_id, item]))
  );

  const visibleCards = useMemo(() => {
    if (activeFilter === "todos") return flashcards;
    return flashcards.filter((card) => (localReviews[card.id]?.status ?? "novo") === activeFilter);
  }, [activeFilter, flashcards, localReviews]);

  const counts = useMemo(() => {
    const base: Record<FilterStatus, number> = {
      todos: flashcards.length,
      novo: 0,
      rever: 0,
      dificil: 0,
      dominado: 0,
    };

    flashcards.forEach((card) => {
      const status = localReviews[card.id]?.status ?? "novo";
      base[status] += 1;
    });

    return base;
  }, [flashcards, localReviews]);

  async function updateStatus(cardId: string, status: ReviewStatus) {
    try {
      setSavingId(cardId);

      const response = await fetch("/api/flashcard-reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flashcard_id: cardId, status }),
      });

      if (!response.ok) throw new Error("Não foi possível atualizar o status.");

      const current = localReviews[cardId];
      setLocalReviews((prev) => ({
        ...prev,
        [cardId]: {
          flashcard_id: cardId,
          status,
          review_count: (current?.review_count ?? 0) + 1,
        },
      }));
    } finally {
      setSavingId(null);
    }
  }

  function toggleCard(id: string) {
    setOpenCards((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quadro de revisão
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Revise com mais clareza visual, acompanhe progresso e organize as respostas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["todos", "novo", "rever", "dificil", "dominado"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterStyle(
                  status,
                  activeFilter === status
                )}`}
              >
                {status} · {counts[status]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {visibleCards.map((card) => {
          const review = localReviews[card.id];
          const status = review?.status ?? "novo";
          const open = openCards.includes(card.id);

          return (
            <article
              key={card.id}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle[status]}`}>
                    {status}
                  </span>
                  {card.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-slate-400">
                  {review?.review_count ?? 0} revisões
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Frente
                </p>
                <div className="mt-3">{renderRichText(card.frente)}</div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Resposta
                  </p>

                  <button
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    className="text-sm font-semibold text-slate-700"
                  >
                    {open ? "Ocultar" : "Revelar"}
                  </button>
                </div>

                {open ? (
                  <div className="mt-3">{renderRichText(card.verso)}</div>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Resposta oculta para revisar antes de abrir.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["novo", "rever", "dificil", "dominado"] as const).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => updateStatus(card.id, nextStatus)}
                    disabled={savingId === card.id}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${statusStyle[nextStatus]}`}
                  >
                    {nextStatus}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}
