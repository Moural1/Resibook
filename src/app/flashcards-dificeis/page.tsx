"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

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

  async function loadCards() {
    setLoading(true);
    setError("");

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

  function toggleReveal(id: string) {
    setRevealedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
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
      setRevealedIds((current) => current.filter((item) => item !== id));
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
            O modo convidado não pode acessar flashcards difíceis.
          </p>

          <Link
            href="/flashcards"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Voltar para flashcards
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Flashcards difíceis
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Aqui ficam só os cards marcados como mais difíceis para você, com leitura mais limpa e revisão mais objetiva.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nos difíceis..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none md:max-w-xl"
          />

          <span className="text-sm font-medium text-slate-400">
            {filtered.length} de {cards.length} cards
          </span>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
          Carregando flashcards difíceis...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
          Nenhum flashcard difícil encontrado.
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {filtered.map((item) => {
            const revealed = revealedIds.includes(item.id);
            const savingItem = savingIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
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
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    Difícil
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Frente
                  </p>
                  <div className="mt-3">{renderRichText(item.frente)}</div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Verso
                  </p>

                  {revealed ? (
                    <div className="mt-4">{renderRichText(item.verso)}</div>
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
