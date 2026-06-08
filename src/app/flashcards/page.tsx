"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Brain, Lock, Plus, Sparkles, Target, X } from "lucide-react";

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

function buildParagraphs(value?: string | null) {
  return (value || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderRichText(
  value?: string | null,
  emptyText = "Sem conteúdo"
) {
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
                <li key={lineIndex}>
                  {line.replace(/^[-•]\s*/, "")}
                </li>
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
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
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
          <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
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
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "slate" | "blue" | "rose" | "emerald";
}) {
  const styles = {
    slate: "border-slate-200 bg-white text-slate-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone];

  return (
    <div className={`rounded-[24px] border p-4 shadow-sm ${styles}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-black/5">
          {icon}
        </div>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
    </div>
  );
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
  const [mode, setMode] = useState<"todos" | "dificeis" | "revelados">("todos");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [form, setForm] = useState<FlashcardForm>(emptyForm);

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
    if (mode !== "todos") params.set("mode", mode);

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [area, materia, mode, pathname, query, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setArea(params.get("area") || "");
    setMateria(params.get("materia") || "");
    const nextMode = params.get("mode");
    if (nextMode === "dificeis" || nextMode === "revelados") {
      setMode(nextMode);
    }
  }, []);

  const areas = useMemo(
    () =>
      Array.from(
        new Set(cards.map((item) => item.area).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [cards]
  );

  const materias = useMemo(
    () =>
      Array.from(
        new Set(cards.map((item) => item.materia).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [cards]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);

    return cards.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        normalize(item.frente).includes(normalizedQuery) ||
        normalize(item.verso).includes(normalizedQuery) ||
        normalize(item.area).includes(normalizedQuery) ||
        normalize(item.materia).includes(normalizedQuery) ||
        normalize(item.tipo).includes(normalizedQuery);

      const matchesArea = !area || item.area === area;
      const matchesMateria = !materia || item.materia === materia;
      const matchesMode =
        mode === "todos"
          ? true
          : mode === "dificeis"
            ? item.dificil
            : revealedIds.includes(item.id);

      return matchesQuery && matchesArea && matchesMateria && matchesMode;
    });
  }, [area, cards, materia, mode, query, revealedIds]);

  const revealedCount = revealedIds.length;
  const difficultCount = cards.filter((item) => item.dificil).length;
  const visibleAreas = new Set(filtered.map((item) => item.area).filter(Boolean)).size;

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
      dificil: card.dificil,
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
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">
                Biblioteca de estudo
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Flashcards mais organizados, mais bonitos e melhores para revisar
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Busca rápida, filtros por área e matéria, respostas com melhor leitura
                e uma experiência de estudo com mais hierarquia visual.
              </p>
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-900"
              >
                <Plus className="h-4 w-4" />
                Novo flashcard
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

        <div className="grid gap-4 bg-slate-50 p-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-slate-700" />}
            label="Total"
            value={cards.length}
          />
          <StatCard
            icon={<Brain className="h-5 w-5 text-rose-700" />}
            label="Difíceis"
            value={difficultCount}
            tone="rose"
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-blue-700" />}
            label="Revelados"
            value={revealedCount}
            tone="blue"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-emerald-700" />}
            label="Áreas visíveis"
            value={visibleAreas}
            tone="emerald"
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Filtros e modos de revisão
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Filtre por conteúdo, foque no que está difícil ou acompanhe o que você já abriu.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["todos", "Todos"],
              ["dificeis", "Só difíceis"],
              ["revelados", "Já revelados"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as "todos" | "dificeis" | "revelados")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por frente, verso, área, matéria ou tipo..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
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
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
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
              setMode("todos");
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
          >
            Limpar filtros
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-400">
            {filtered.length} de {cards.length} flashcards
          </span>

          <div className="flex flex-wrap gap-2">
            {area ? (
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                Área: {area}
              </span>
            ) : null}
            {materia ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Matéria: {materia}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500 shadow-sm">
          Carregando flashcards...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-14 text-center text-sm text-slate-500 shadow-sm">
          Nenhum flashcard encontrado.
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {filtered.map((item) => {
            const revealed = revealedIds.includes(item.id);
            const savingItem = savingIds.includes(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
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

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {revealed ? "Resposta aberta" : "Resposta fechada"}
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Frente
                  </p>
                  <div className="mt-3">
                    {renderRichText(item.frente, "Sem frente")}
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Verso
                    </p>

                    {revealed ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        Leitura organizada
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
                        Resposta oculta. Clique abaixo para revelar com espaçamento,
                        blocos e leitura melhor organizada.
                      </p>
                    </div>
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
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50">
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
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.verso}
                onChange={(e) => updateForm("verso", e.target.value)}
                placeholder="Verso"
                className="min-h-[220px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Dica de formatação
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-800">
                  Use uma linha em branco entre blocos. Se quiser listas, escreva cada item
                  em uma linha começando com “-” ou “1.” que a leitura ficará melhor na tela.
                </p>
              </div>

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
