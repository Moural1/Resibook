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

const statusStyle: Record<
  FlashcardReviewItem["status"],
  string
> = {
  novo: "border-slate-200 bg-white text-slate-700",
  rever: "border-amber-200 bg-amber-50 text-amber-700",
  dificil: "border-rose-200 bg-rose-50 text-rose-700",
  dominado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function FlashcardsBoard({ flashcards, reviews }: Props) {
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "todos" | "novo" | "rever" | "dificil" | "dominado"
  >("todos");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<
    Record<string, FlashcardReviewItem>
  >(Object.fromEntries(reviews.map((item) => [item.flashcard_id, item])));

  const visibleCards = useMemo(() => {
    if (activeFilter === "todos") return flashcards;

    return flashcards.filter((card) => {
      const status = localReviews[card.id]?.status ?? "novo";
      return status === activeFilter;
    });
  }, [activeFilter, flashcards, localReviews]);

  const counts = useMemo(() => {
    const base = {
      todos: flashcards.length,
      novo: 0,
      rever: 0,
      dificil: 0,
      dominado: 0,
    };

    flashcards.forEach((card) => {
      const status = localReviews[card.id]?.status ?? "novo";
      base[status]++;
    });

    return base;
  }, [flashcards, localReviews]);

  const toggleCard = (id: string) => {
    setOpenCards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const saveStatus = async (
    flashcardId: string,
    status: FlashcardReviewItem["status"]
  ) => {
    try {
      setSavingId(flashcardId);

      const response = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcard_id: flashcardId,
          status,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        alert(json?.error || "Erro ao salvar classificação.");
        return;
      }

      setLocalReviews((prev) => ({
        ...prev,
        [flashcardId]: {
          flashcard_id: flashcardId,
          status,
          review_count: (prev[flashcardId]?.review_count ?? 0) + 1,
        },
      }));
    } catch {
      alert("Erro ao salvar classificação.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Flashcards clínicos
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Interativo
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Revisão por cards
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Abra o card, revele a resposta, marque para rever depois e organize sua revisão.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["todos", counts.todos],
            ["novo", counts.novo],
            ["rever", counts.rever],
            ["dificil", counts.dificil],
            ["dominado", counts.dominado],
          ].map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setActiveFilter(
                  key as "todos" | "novo" | "rever" | "dificil" | "dominado"
                )
              }
              className={`rounded-2xl border p-4 text-left transition ${
                activeFilter === key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                {key}
              </p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {visibleCards.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
            Nenhum flashcard nesse filtro.
          </div>
        ) : (
          visibleCards.map((card) => {
            const open = openCards.includes(card.id);
            const review = localReviews[card.id];
            const status = review?.status ?? "novo";

            return (
              <div
                key={card.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    {card.source_group}
                  </span>

                  {card.card_number ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                      #{card.card_number}
                    </span>
                  ) : null}

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle[status]}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-5 rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    Frente
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-900">
                    {card.frente}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                  >
                    {open ? "Ocultar resposta" : "Abrir resposta"}
                  </button>

                  <button
                    type="button"
                    onClick={() => saveStatus(card.id, "rever")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700"
                  >
                    Rever depois
                  </button>

                  <button
                    type="button"
                    onClick={() => saveStatus(card.id, "dificil")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700"
                  >
                    Difícil
                  </button>

                  <button
                    type="button"
                    onClick={() => saveStatus(card.id, "dominado")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700"
                  >
                    Dominado
                  </button>
                </div>

                {open ? (
                  <div className="mt-5 rounded-[22px] bg-slate-950 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Verso
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                      {card.verso}
                    </p>
                  </div>
                ) : null}

                {card.tags && card.tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-slate-500">
                  Revisões: {review?.review_count ?? 0}
                  {savingId === card.id ? " • salvando..." : ""}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}