"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import { rankSearchResults } from "@/lib/search";
import {
  ArrowRight,
  BookOpen,
  BookCopy,
  Brain,
  CheckCircle2,
  Edit3,
  Layers3,
  Lock,
  Plus,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
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
  icon: ReactNode;
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

function DrawerInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${className}`}
    />
  );
}

function DrawerTextarea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    />
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
  const [mode, setMode] = useState<"todos" | "dificeis" | "revelados">(
    "todos"
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [form, setForm] = useState<FlashcardForm>(emptyForm);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewRevealed, setReviewRevealed] = useState(false);
  const [reviewFinished, setReviewFinished] = useState(false);

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
    const admin = user?.app_metadata?.role === "admin" || email === ADMIN_EMAIL;

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
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("q") || "");
    setArea(params.get("area") || "");
    setMateria(params.get("materia") || "");

    const nextMode = params.get("mode");

    if (nextMode === "dificeis" || nextMode === "revelados") {
      setMode(nextMode);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (area) params.set("area", area);
    if (materia) params.set("materia", materia);
    if (mode !== "todos") params.set("mode", mode);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [area, materia, mode, pathname, query, router]);

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
    const filteredBySelects = cards.filter((item) => {
      const matchesArea = !area || item.area === area;
      const matchesMateria = !materia || item.materia === materia;
      const matchesMode =
        mode === "todos"
          ? true
          : mode === "dificeis"
          ? item.dificil
          : revealedIds.includes(item.id);

      return matchesArea && matchesMateria && matchesMode;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.frente, weight: 10 },
      { value: item.materia, weight: 6 },
      { value: item.area, weight: 5 },
      { value: item.tipo, weight: 3 },
      { value: item.verso, weight: 2 },
    ]);
  }, [area, cards, materia, mode, query, revealedIds]);

  const revealedCount = revealedIds.length;
  const difficultCount = cards.filter((item) => item.dificil).length;
  const visibleAreas = new Set(filtered.map((item) => item.area).filter(Boolean))
    .size;
  const hasFilters = Boolean(query || area || materia || mode !== "todos");
  const reviewCard = reviewQueue.length
    ? cards.find((item) => item.id === reviewQueue[reviewIndex]) || null
    : null;

  function startQuickReview(onlyDifficult = false) {
    const candidates = filtered.filter(
      (item) => !onlyDifficult || item.dificil
    );

    if (candidates.length === 0) {
      setError(
        onlyDifficult
          ? "Nenhum flashcard difícil disponível com os filtros atuais."
          : "Nenhum flashcard disponível com os filtros atuais."
      );
      return;
    }

    const queue = [...candidates]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((item) => item.id);

    setReviewQueue(queue);
    setReviewIndex(0);
    setReviewRevealed(false);
    setReviewFinished(false);
    setError("");
    setSuccess("");
  }

  function advanceReview() {
    if (reviewIndex >= reviewQueue.length - 1) {
      setReviewFinished(true);
      setReviewRevealed(false);
      return;
    }

    setReviewIndex((current) => current + 1);
    setReviewRevealed(false);
  }

  async function keepAsDifficult() {
    if (!reviewCard) return;
    if (!reviewCard.dificil) await toggleDificil(reviewCard);
    advanceReview();
  }

  function closeReview() {
    setReviewQueue([]);
    setReviewIndex(0);
    setReviewRevealed(false);
    setReviewFinished(false);
  }

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

  async function duplicateToPersonal(card: Flashcard) {
    if (!currentUserId || isGuest) {
      setError("Entre com sua conta para duplicar este flashcard.");
      return;
    }

    setSavingIds((current) => [...current, card.id]);
    setError("");
    setSuccess("");

    const { error: duplicateError } = await supabase
      .from("personal_content_items")
      .insert({
        user_id: currentUserId,
        item_type: "flashcard",
        title: card.frente?.trim() || "Flashcard",
        content: card.verso?.trim() || "",
        source_global_id: card.id,
        metadata: {
          area: card.area,
          materia: card.materia,
          tipo: card.tipo,
          frente: card.frente,
          verso: card.verso,
        },
      });

    if (duplicateError) {
      setError(duplicateError.message);
    } else {
      await supabase.from("user_content_recents").upsert(
        {
          user_id: currentUserId,
          item_type: "flashcard",
          item_id: card.id,
          source: "global",
          accessed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_type,item_id,source" }
      );
      setSuccess("Flashcard duplicado para o Meu Resibook.");
    }

    setSavingIds((current) => current.filter((id) => id !== card.id));
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
      <ModulePageHeader
        eyebrow="Biblioteca de estudo"
        title="Flashcards"
        description="Busca rápida, filtros por área e matéria, marcação individual de dificuldade e respostas com leitura organizada."
        badges={[
          { label: "Flashcards", tone: "blue" },
          { label: "Revisão ativa", tone: "slate" },
          {
            label: isAdmin ? "Gerenciamento liberado" : "Revisão individual",
            tone: isAdmin ? "emerald" : "cyan",
          },
        ]}
        metrics={[
          { label: "Total", value: cards.length },
          { label: "Difíceis", value: difficultCount },
          { label: "Revelados", value: revealedCount },
          { label: "Áreas visíveis", value: visibleAreas },
        ]}
        error={error}
        success={success}
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Novo flashcard
            </button>
          ) : null
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Total"
            value={cards.length}
          />

          <StatCard
            icon={<Brain className="h-5 w-5" />}
            label="Difíceis"
            value={difficultCount}
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sessão rápida
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Revisão focada em 10 cartões
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Use os filtros abaixo para definir o conteúdo e revise um cartão
              por vez, sem distrações.
            </p>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startQuickReview(false)}
                disabled={loading || filtered.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Revisar 10
              </button>
              <button
                type="button"
                onClick={() => startQuickReview(true)}
                disabled={loading || difficultCount === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                Só difíceis
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={closeReview}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Encerrar sessão
            </button>
          )}
        </div>

        {reviewQueue.length > 0 ? (
          <div className="mt-6 border-t border-slate-200 pt-6">
            {reviewFinished ? (
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-700" />
                <h3 className="mt-3 text-xl font-semibold text-slate-900">
                  Sessão concluída
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Você revisou {reviewQueue.length} flashcard
                  {reviewQueue.length > 1 ? "s" : ""} nesta rodada.
                </p>
                <button
                  type="button"
                  onClick={() => startQuickReview(false)}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  Nova sessão
                </button>
              </div>
            ) : reviewCard ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Cartão {reviewIndex + 1} de {reviewQueue.length}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {formatLabel(reviewCard.materia, formatLabel(reviewCard.area))}
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-cyan-700 transition-all"
                    style={{
                      width: `${((reviewIndex + 1) / reviewQueue.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Pergunta
                  </p>
                  <div className="mt-3">
                    {renderRichText(reviewCard.frente, "Sem frente")}
                  </div>
                </div>

                {reviewRevealed ? (
                  <div className="mt-4 rounded-[24px] border border-cyan-100 bg-white p-5 md:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-800">
                      Resposta
                    </p>
                    <div className="mt-3">
                      {renderRichText(reviewCard.verso, "Sem verso")}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  {!reviewRevealed ? (
                    <button
                      type="button"
                      onClick={() => setReviewRevealed(true)}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                    >
                      Revelar resposta
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={advanceReview}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Acertei
                      </button>
                      <button
                        type="button"
                        onClick={keepAsDifficult}
                        disabled={savingIds.includes(reviewCard.id)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800 disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Ainda difícil
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={advanceReview}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600"
                  >
                    Pular
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Revisão
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Filtros e modos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Filtre por conteúdo, foque nos difíceis ou revise apenas os
              cartões já abertos.
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
                onClick={() =>
                  setMode(value as "todos" | "dificeis" | "revelados")
                }
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  mode === value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por frente, verso, área, matéria ou tipo..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <select
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          >
            <option value="">Todas as áreas</option>
            {areas.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
              </option>
            ))}
          </select>

          <select
            value={materia}
            onChange={(event) => setMateria(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          >
            <option value="">Todas as matérias</option>
            {materias.map((item) => (
              <option key={item} value={item}>
                {formatLabel(item)}
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
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {hasFilters ? "Limpar filtros" : "Filtros"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-400">
            {filtered.length} de {cards.length} flashcards
          </span>

          <div className="flex flex-wrap gap-2">
            {area ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Área: {formatLabel(area)}
              </span>
            ) : null}

            {materia ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Matéria: {formatLabel(materia)}
              </span>
            ) : null}

            {mode !== "todos" ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Modo: {mode === "dificeis" ? "difíceis" : "revelados"}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-14 text-center text-sm font-medium text-slate-500 shadow-sm">
          Carregando flashcards...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhum flashcard encontrado
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Ajuste a busca ou limpe os filtros para visualizar a biblioteca.
          </p>
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
                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                      Banco Resibook
                    </span>
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

                    {item.dificil ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Difícil
                      </span>
                    ) : null}
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
                        Resposta oculta. Revele para revisar o conteúdo com
                        leitura organizada.
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
                    onClick={() => toggleDificil(item)}
                    disabled={savingItem}
                    className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      item.dificil
                        ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {savingItem
                      ? "Salvando..."
                      : item.dificil
                      ? "Remover difícil"
                      : "Marcar difícil"}
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateToPersonal(item)}
                    disabled={savingItem}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:opacity-60"
                  >
                    <BookCopy className="h-4 w-4" />
                    Duplicar para Meu Resibook
                  </button>

                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditDrawer(item)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={savingItem}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Biblioteca de estudo
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {editingCard ? "Editar flashcard" : "Novo flashcard"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar a biblioteca
                  compartilhada.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 border-b border-slate-200 pb-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    Dados do flashcard
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Organize área, matéria, tipo, frente e verso.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DrawerInput
                    value={form.area}
                    onChange={(value) => updateForm("area", value)}
                    placeholder="Área"
                  />

                  <DrawerInput
                    value={form.materia}
                    onChange={(value) => updateForm("materia", value)}
                    placeholder="Matéria"
                  />

                  <DrawerInput
                    value={form.tipo}
                    onChange={(value) => updateForm("tipo", value)}
                    placeholder="Tipo"
                    className="md:col-span-2"
                  />
                </div>

                <div className="mt-4 space-y-4">
                  <DrawerTextarea
                    value={form.frente}
                    onChange={(value) => updateForm("frente", value)}
                    placeholder="Frente"
                    rows={6}
                  />

                  <DrawerTextarea
                    value={form.verso}
                    onChange={(value) => updateForm("verso", value)}
                    placeholder="Verso"
                    rows={10}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Dica de formatação
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use uma linha em branco entre blocos. Para listas, escreva
                  cada item começando com “-” ou “1.”.
                </p>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.dificil}
                  onChange={(event) =>
                    updateForm("dificil", event.target.checked)
                  }
                />
                Marcar como difícil para meu usuário
              </label>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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

