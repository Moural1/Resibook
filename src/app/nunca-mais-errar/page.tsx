"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import { createClient } from "@/lib/supabase/client";

type Origin = "questao" | "plantao" | "prescricao" | "conduta";

type NeverMissItem = {
  id: string;
  user_id: string;
  theme: string;
  mistake: string;
  correct_explanation: string;
  card: string;
  mental_phrase: string;
  origin: Origin | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  theme: string;
  mistake: string;
  correctExplanation: string;
  card: string;
  mentalPhrase: string;
  origin: Origin | "";
};

const EMPTY_FORM: FormState = {
  theme: "",
  mistake: "",
  correctExplanation: "",
  card: "",
  mentalPhrase: "",
  origin: "",
};

const ORIGIN_LABELS: Record<Origin, string> = {
  questao: "Questão",
  plantao: "Plantão",
  prescricao: "Prescrição",
  conduta: "Conduta",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NeverMissPage() {
  const [items, setItems] = useState<NeverMissItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      if (!user?.id) {
        setError("Sessão não autenticada.");
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);
      const { data, error: loadError } = await supabase
        .from("never_miss_items")
        .select(
          "id, user_id, theme, mistake, correct_explanation, card, mental_phrase, origin, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!mounted) return;
      if (loadError) {
        setError(
          "Não foi possível carregar seu caderno. Confirme se a migration desta versão foi aplicada."
        );
      } else {
        setItems((data || []) as NeverMissItem[]);
      }
      setLoading(false);
    }

    void loadItems();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return items.filter((item) => {
      const matchesOrigin = !originFilter || item.origin === originFilter;
      const searchable = [
        item.theme,
        item.mistake,
        item.correct_explanation,
        item.card,
        item.mental_phrase,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");
      return matchesOrigin && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, originFilter, query]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUserId || saving) return;

    const theme = form.theme.trim();
    const mistake = form.mistake.trim();
    const correctExplanation = form.correctExplanation.trim();

    if (theme.length < 2 || mistake.length < 2 || correctExplanation.length < 2) {
      setError("Preencha tema, erro cometido e explicação correta.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    const supabase = createClient();
    const { data, error: saveError } = await supabase
      .from("never_miss_items")
      .insert({
        user_id: currentUserId,
        theme,
        mistake,
        correct_explanation: correctExplanation,
        card: form.card.trim(),
        mental_phrase: form.mentalPhrase.trim(),
        origin: form.origin || null,
      })
      .select(
        "id, user_id, theme, mistake, correct_explanation, card, mental_phrase, origin, created_at, updated_at"
      )
      .single();

    if (saveError || !data) {
      setError("Não foi possível salvar o registro.");
    } else {
      setItems((current) => [data as NeverMissItem, ...current]);
      setForm(EMPTY_FORM);
      setSuccess("Aprendizado salvo no seu caderno privado.");
    }
    setSaving(false);
  }

  async function removeItem(id: string) {
    if (!currentUserId || !window.confirm("Apagar este registro do seu caderno?")) {
      return;
    }

    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("never_miss_items")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId);

    if (deleteError) {
      setError("Não foi possível apagar o registro.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setSuccess("Registro removido.");
  }

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Resibook Learn"
        title="Nunca Mais Errar"
        description="Transforme um erro, dúvida ou ponto fraco em uma memória clínica objetiva e privada."
        badges={[
          { label: "Caderno privado", tone: "cyan" },
          { label: "Isolado por usuário", tone: "emerald" },
        ]}
        metrics={[
          { label: "Registros", value: items.length },
          { label: "Exibindo", value: filteredItems.length },
          {
            label: "Origens",
            value: new Set(items.map((item) => item.origin).filter(Boolean)).size,
          },
        ]}
        error={error}
        success={success}
        notice={
          <div className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <Brain className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />
            <p className="text-sm leading-6 text-cyan-950">
              Seus registros pertencem somente à sua conta. Evite inserir nomes,
              documentos ou qualquer identificador de paciente.
            </p>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm md:p-5 xl:sticky xl:top-24"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-800">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Novo aprendizado
              </p>
              <h2 className="text-lg font-semibold text-slate-950">
                Registrar para não repetir
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Tema" required>
              <input
                value={form.theme}
                onChange={(event) =>
                  setForm((current) => ({ ...current, theme: event.target.value }))
                }
                maxLength={120}
                placeholder="Ex.: anticoagulação na FA"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </Field>

            <Field label="Origem opcional">
              <select
                value={form.origin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    origin: event.target.value as FormState["origin"],
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
              >
                <option value="">Sem origem</option>
                {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Erro cometido" required>
              <textarea
                value={form.mistake}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mistake: event.target.value,
                  }))
                }
                maxLength={2000}
                rows={3}
                placeholder="O que aconteceu ou qual raciocínio falhou?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </Field>

            <Field label="Explicação correta" required>
              <textarea
                value={form.correctExplanation}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    correctExplanation: event.target.value,
                  }))
                }
                maxLength={4000}
                rows={4}
                placeholder="Registre a correção validada e objetiva."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </Field>

            <Field label="Card">
              <textarea
                value={form.card}
                onChange={(event) =>
                  setForm((current) => ({ ...current, card: event.target.value }))
                }
                maxLength={2000}
                rows={2}
                placeholder="Pergunta → resposta para revisão."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </Field>

            <Field label="Frase mental">
              <input
                value={form.mentalPhrase}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mentalPhrase: event.target.value,
                  }))
                }
                maxLength={500}
                placeholder="Uma frase curta para lembrar no plantão."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={saving || !currentUserId}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar no Resibook Learn"}
          </button>
        </form>

        <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar no seu caderno..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </label>
            <select
              value={originFilter}
              onChange={(event) => setOriginFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
            >
              <option value="">Todas as origens</option>
              {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-14 text-center text-sm text-slate-500">
              Carregando seu caderno...
            </div>
          ) : filteredItems.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"
                >
                  <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                            Resibook Learn
                          </span>
                          {item.origin ? (
                            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200">
                              {ORIGIN_LABELS[item.origin]}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-1 break-words text-base font-semibold">
                          {item.theme}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-200"
                        aria-label={`Apagar ${item.theme}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <LearningBlock
                      label="Erro cometido"
                      text={item.mistake}
                      tone="rose"
                    />
                    <LearningBlock
                      label="Explicação correta"
                      text={item.correct_explanation}
                      tone="emerald"
                    />
                    {item.card ? (
                      <LearningBlock label="Card" text={item.card} tone="cyan" />
                    ) : null}
                    {item.mental_phrase ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Frase mental
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">
                          “{item.mental_phrase}”
                        </p>
                      </div>
                    ) : null}
                    <p className="text-[11px] text-slate-400">
                      Atualizado em {formatDate(item.updated_at)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
              <FileQuestion className="mx-auto h-6 w-6 text-slate-400" />
              <h2 className="mt-3 text-base font-semibold text-slate-800">
                {items.length
                  ? "Nenhum registro corresponde ao filtro"
                  : "Seu caderno ainda está vazio"}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                {items.length
                  ? "Ajuste a busca ou selecione outra origem."
                  : "Registre o primeiro aprendizado para começar sua revisão pós-plantão."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required ? <span className="text-rose-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function LearningBlock({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "rose" | "emerald" | "cyan";
}) {
  const toneClass = {
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-950",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
        {tone === "cyan" ? (
          <Sparkles className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        {label}
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
        {text}
      </p>
    </div>
  );
}
