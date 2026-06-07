"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Plus, X } from "lucide-react";

type Flashcard = {
  id: string;
  area: string | null;
  materia: string | null;
  tipo: string | null;
  frente: string | null;
  verso: string | null;
  dificil: boolean;
};

type FlashcardForm = {
  area: string;
  materia: string;
  tipo: string;
  frente: string;
  verso: string;
  dificil: boolean;
};

type MarkRow = {
  flashcard_id: string;
  dificil: boolean | null;
};

const GUEST_EMAIL = "convidado@resibook.com";
const ADMIN_EMAIL = "igormoura@resibook.com";

const emptyForm: FlashcardForm = {
  area: "",
  materia: "",
  tipo: "",
  frente: "",
  verso: "",
  dificil: false,
};

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function FlashcardsPage() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [materia, setMateria] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [form, setForm] = useState<FlashcardForm>(emptyForm);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setArea(params.get("area") || "");
    setMateria(params.get("materia") || "");
  }, []);

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
    const admin = email === ADMIN_EMAIL;

    setCurrentUserId(userId);
    setIsGuest(guest);
    setIsAdmin(admin);
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

    const mapped = ((cardsRes.data || []) as Omit<Flashcard, "dificil">[]).map(
      (item) => ({
        ...item,
        id: String(item.id),
        dificil: difficultIds.has(String(item.id)),
      })
    );

    setCards(mapped);
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (area) params.set("area", area);
    if (materia) params.set("materia", materia);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [query, area, materia, pathname, router]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(cards.map((item) => item.area).filter(Boolean))
    ) as string[];
  }, [cards]);

  const materias = useMemo(() => {
    return Array.from(
      new Set(cards.map((item) => item.materia).filter(Boolean))
    ) as string[];
  }, [cards]);

  const difficultCount = useMemo(() => {
    return cards.filter((item) => item.dificil).length;
  }, [cards]);

  const filtered = useMemo(() => {
    return cards.filter((item) => {
      const normalizedQuery = normalize(query);

      const matchesQuery =
        !normalizedQuery ||
        normalize(item.frente).includes(normalizedQuery) ||
        normalize(item.verso).includes(normalizedQuery) ||
        normalize(item.area).includes(normalizedQuery) ||
        normalize(item.materia).includes(normalizedQuery) ||
        normalize(item.tipo).includes(normalizedQuery);

      const matchesArea = !area || item.area === area;
      const matchesMateria = !materia || item.materia === materia;

      return matchesQuery && matchesArea && matchesMateria;
    });
  }, [cards, query, area, materia]);

  function updateForm<K extends keyof FlashcardForm>(
    key: K,
    value: FlashcardForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateDrawer() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar flashcards compartilhados.");
      return;
    }

    setEditingCard(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditDrawer(card: Flashcard) {
    if (!isAdmin) {
      setError("Apenas o administrador pode editar flashcards compartilhados.");
      return;
    }

    setEditingCard(card);
    setForm({
      area: card.area || "",
      materia: card.materia || "",
      tipo: card.tipo || "",
      frente: card.frente || "",
      verso: card.verso || "",
      dificil: Boolean(card.dificil),
    });
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingCard(null);
    setForm(emptyForm);
  }

  function toggleReveal(id: string) {
    setRevealedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function toggleDificil(card: Flashcard) {
    if (!currentUserId || isGuest) {
      setError("Usuário não autorizado para marcar flashcards.");
      return;
    }

    if (savingIds.includes(card.id)) return;

    const nextValue = !Boolean(card.dificil);

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, card.id]);

    const response = nextValue
      ? await supabase.from("flashcard_user_marks").upsert({
          user_id: currentUserId,
          flashcard_id: card.id,
          dificil: true,
        })
      : await supabase
          .from("flashcard_user_marks")
          .delete()
          .eq("user_id", currentUserId)
          .eq("flashcard_id", card.id)
          .eq("dificil", true);

    if (response.error) {
      setError(response.error.message);
    } else {
      setCards((current) =>
        current.map((item) =>
          item.id === card.id ? { ...item, dificil: nextValue } : item
        )
      );
      setSuccess(
        nextValue
          ? "Flashcard marcado como difícil."
          : "Flashcard removido dos difíceis."
      );
    }

    setSavingIds((current) => current.filter((item) => item !== card.id));
  }

  async function handleSave() {
    if (!currentUserId || isGuest || !isAdmin) {
      setError("Apenas o administrador pode salvar flashcards compartilhados.");
      return;
    }

    if (!form.frente.trim() || !form.verso.trim()) {
      setError("Frente e verso são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      area: form.area.trim() || null,
      materia: form.materia.trim() || null,
      tipo: form.tipo.trim() || null,
      frente: form.frente.trim(),
      verso: form.verso.trim(),
    };

    const response = editingCard
      ? await supabase
          .from("flashcards")
          .update(payload)
          .eq("id", editingCard.id)
          .select("id")
          .single()
      : await supabase.from("flashcards").insert(payload).select("id").single();

    if (response.error) {
      setError(response.error.message);
      setSaving(false);
      return;
    }

    const savedId = String(response.data?.id || editingCard?.id || "");

    if (savedId) {
      if (form.dificil) {
        await supabase.from("flashcard_user_marks").upsert({
          user_id: currentUserId,
          flashcard_id: savedId,
          dificil: true,
        });
      } else {
        await supabase
          .from("flashcard_user_marks")
          .delete()
          .eq("user_id", currentUserId)
          .eq("flashcard_id", savedId)
          .eq("dificil", true);
      }
    }

    await loadCards();
    setSuccess(
      editingCard
        ? "Flashcard atualizado com sucesso."
        : "Flashcard criado com sucesso."
    );
    closeDrawer();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!currentUserId || isGuest || !isAdmin) {
      setError("Apenas o administrador pode apagar flashcards compartilhados.");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar este flashcard da biblioteca compartilhada?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setCards((current) => current.filter((item) => item.id !== id));
      setRevealedIds((current) => current.filter((item) => item !== id));
      setSuccess("Flashcard apagado com sucesso.");
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
            O modo convidado não pode acessar a biblioteca de flashcards nem
            marcações individuais de dificuldade.
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
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
                  Biblioteca médica
                </span>

                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  Compartilhada
                </span>

                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {difficultCount} difíceis no seu usuário
                </span>

                {isAdmin ? (
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Admin pode gerenciar
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Usuário pode consultar e marcar
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Flashcards
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Biblioteca compartilhada. A marcação de difícil é individual por
                login. O CRUD da biblioteca é apenas do administrador.
              </p>

              <p className="mt-3 text-sm font-medium text-slate-700">
                {loading
                  ? "Carregando..."
                  : `Total carregado do banco: ${cards.length}`}
              </p>

              {error ? (
                <p className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  Erro: {error}
                </p>
              ) : null}

              {success ? (
                <p className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </p>
              ) : null}
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Novo flashcard
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar frente, verso, matéria, tipo..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todas as áreas —</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todas as matérias —</option>
              {materias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setArea("");
                setMateria("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            {loading
              ? "Carregando resultados..."
              : `${filtered.length} resultado(s).`}
          </span>

          <Link
            href="/flashcards-dificeis"
            className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700"
          >
            Ver difíceis
          </Link>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando flashcards...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum flashcard encontrado.
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filtered.map((item) => {
            const revealed = revealedIds.includes(item.id);
            const savingItem = savingIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
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

                  {item.dificil ? (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      Difícil para você
                    </span>
                  ) : null}
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
                    onClick={() => toggleDificil(item)}
                    disabled={savingItem}
                    className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      item.dificil
                        ? "border border-rose-200 bg-rose-50 text-rose-700"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {savingItem
                      ? "Salvando..."
                      : item.dificil
                        ? "Remover difícil"
                        : "Marcar difícil"}
                  </button>

                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditDrawer(item)}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={savingItem}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingItem ? "Apagando..." : "Apagar"}
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingCard ? "Editar flashcard" : "Novo flashcard"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar a biblioteca compartilhada.
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

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.area}
                  onChange={(e) => updateForm("area", e.target.value)}
                  placeholder="Área"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.materia}
                  onChange={(e) => updateForm("materia", e.target.value)}
                  placeholder="Matéria"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.tipo}
                  onChange={(e) => updateForm("tipo", e.target.value)}
                  placeholder="Tipo"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:col-span-2"
                />
              </div>

              <textarea
                value={form.frente}
                onChange={(e) => updateForm("frente", e.target.value)}
                placeholder="Frente"
                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.verso}
                onChange={(e) => updateForm("verso", e.target.value)}
                placeholder="Verso"
                className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.dificil}
                  onChange={(e) => updateForm("dificil", e.target.checked)}
                />
                Marcar como difícil para meu usuário
              </label>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingCard
                      ? "Salvar edição"
                      : "Criar flashcard"}
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