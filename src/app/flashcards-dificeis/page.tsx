"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Flashcard = {
  id: string;
  area: string | null;
  materia: string | null;
  tipo: string | null;
  frente: string | null;
  verso: string | null;
  dificil: boolean | null;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function FlashcardsDificeisPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function loadCards() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("flashcards")
      .select("id, area, materia, tipo, frente, verso, dificil")
      .eq("dificil", true)
      .order("area", { ascending: true, nullsFirst: false })
      .order("materia", { ascending: true, nullsFirst: false });

    if (error) {
      setError(error.message);
      setCards([]);
    } else {
      setError("");
      setCards((data as Flashcard[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCards();
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

  function toggleReveal(id: string) {
    setRevealedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function removeDificil(id: string) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (savingIds.includes(id)) return;

    setError("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase
      .from("flashcards")
      .update({ dificil: false })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setCards((current) => current.filter((item) => item.id !== id));
      setRevealedIds((current) => current.filter((item) => item !== id));
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              Revisão focada
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Flashcards difíceis
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Flashcards difíceis
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tudo o que foi marcado como difícil aparece aqui. Ao remover, o
            card volta a ficar apenas na lista geral.
          </p>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {loading ? "Carregando..." : `${cards.length} flashcard(s) difíceis`}
          </p>

          {error ? (
            <p className="mt-2 text-sm font-medium text-rose-600">
              Erro: {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar dentro dos difíceis..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando flashcards difíceis...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum flashcard difícil encontrado.
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filtered.map((item) => {
            const revealed = revealedIds.includes(item.id);
            const savingItem = savingIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {item.area ? (
                    <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                      {item.area}
                    </span>
                  ) : null}

                  {item.materia ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {item.materia}
                    </span>
                  ) : null}

                  {item.tipo ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {item.tipo}
                    </span>
                  ) : null}

                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    Difícil
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Frente
                  </p>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                    {item.frente || "Sem frente"}
                  </h2>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Verso
                  </p>

                  {revealed ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {item.verso || "Sem verso"}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      Resposta oculta. Clique abaixo para revelar.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                  >
                    {revealed ? "Ocultar resposta" : "Revelar resposta"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeDificil(item.id)}
                    disabled={savingItem}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
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