"use client";

import { useMemo, useState } from "react";
import SearchInput from "./search-input";
import { includesSearch } from "../lib/search";

type FlashcardItem = {
  id: string;
  source_file: string;
  source_group: string;
  card_number: number | null;
  frente: string;
  verso: string;
  tags: string[] | null;
  created_at: string;
};

type Props = {
  flashcards: FlashcardItem[];
};

export default function FlashcardsBrowser({ flashcards }: Props) {
  const [query, setQuery] = useState("");

  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((card) =>
      includesSearch(
        [
          card.source_group,
          card.source_file,
          card.frente,
          card.verso,
          ...(card.tags ?? []),
        ],
        query
      )
    );
  }, [flashcards, query]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Flashcards cadastrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca instantânea por grupo, conteúdo, arquivo ou tags.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar flashcard..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredFlashcards.length} de {flashcards.length} flashcards
          </span>

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      {filteredFlashcards.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          Nenhum flashcard encontrado para essa busca.
        </div>
      ) : (
        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredFlashcards.map((card) => (
            <div
              key={card.id}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    {card.source_group || "Sem grupo"}
                  </span>

                  {card.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <form action={`/api/flashcards/${card.id}`} method="POST">
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                  >
                    Apagar
                  </button>
                </form>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Frente
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-900">
                  {card.frente}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Verso
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                  {card.verso}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{card.source_file || "Sem arquivo"}</span>
                <span>
                  {card.card_number ? `Card #${card.card_number}` : "Sem número"}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  );
}