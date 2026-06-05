"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";
import ExamTemplatesLive from "../../components/exam-templates-live";

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  sexo: string | null;
  arquivo_origem: string | null;
  conteudo: string;
  created_at: string;
};

type ExamDraft = {
  categoria: string;
  titulo: string;
  sexo: string;
  arquivo_origem: string;
  conteudo: string;
};

type ExamForm = {
  categoria: string;
  titulo: string;
  sexo: string;
  arquivo_origem: string;
  conteudo: string;
};

const emptyForm: ExamForm = {
  categoria: "",
  titulo: "",
  sexo: "",
  arquivo_origem: "",
  conteudo: "",
};

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildPayload(form: ExamForm) {
  return {
    categoria: form.categoria.trim() || null,
    titulo: form.titulo.trim() || "Bloco sem título",
    sexo: form.sexo.trim() || null,
    arquivo_origem: form.arquivo_origem.trim() || null,
    conteudo: form.conteudo.trim(),
  };
}

export default function ExamesEvolucaoPage() {
  const [initialQuery, setInitialQuery] = useState("");

  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [editForms, setEditForms] = useState<Record<number, ExamForm>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";

    setInitialQuery(q);
    setQuery(q);
  }, []);

  async function loadTemplates() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("exam_templates")
      .select("id, categoria, titulo, sexo, arquivo_origem, conteudo, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setTemplates([]);
    } else {
      setTemplates((data as ExamTemplate[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  const total = templates.length;

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) return templates;

    return templates.filter((item) => {
      return (
        normalize(item.categoria).includes(normalizedQuery) ||
        normalize(item.titulo).includes(normalizedQuery) ||
        normalize(item.sexo).includes(normalizedQuery) ||
        normalize(item.arquivo_origem).includes(normalizedQuery) ||
        normalize(item.conteudo).includes(normalizedQuery)
      );
    });
  }, [templates, query]);

  function updateForm<K extends keyof ExamForm>(key: K, value: ExamForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  function handleUseTemplate(draft: ExamDraft) {
    setForm({
      categoria: draft.categoria || "",
      titulo: draft.titulo || "",
      sexo: draft.sexo || "",
      arquivo_origem: draft.arquivo_origem || "",
      conteudo: draft.conteudo || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleCreate() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (!form.conteudo.trim()) {
      setError("O conteúdo do bloco é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("exam_templates")
      .insert(buildPayload(form))
      .select("id, categoria, titulo, sexo, arquivo_origem, conteudo, created_at")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTemplates((current) => [data as ExamTemplate, ...current]);
      resetForm();
    }

    setSaving(false);
  }

  function startEdit(item: ExamTemplate) {
    setEditingId(item.id);
    setEditForms((current) => ({
      ...current,
      [item.id]: {
        categoria: item.categoria || "",
        titulo: item.titulo || "",
        sexo: item.sexo || "",
        arquivo_origem: item.arquivo_origem || "",
        conteudo: item.conteudo || "",
      },
    }));
  }

  function cancelEdit(id: number) {
    setEditingId(null);
    setEditForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updateEditForm<K extends keyof ExamForm>(
    id: number,
    key: K,
    value: ExamForm[K]
  ) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] || emptyForm),
        [key]: value,
      },
    }));
  }

  async function handleUpdate(id: number) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    const editForm = editForms[id];

    if (!editForm) {
      setError("Formulário de edição não encontrado.");
      return;
    }

    if (!editForm.conteudo.trim()) {
      setError("O conteúdo do bloco é obrigatório.");
      return;
    }

    setError("");
    setSavingIds((current) => [...current, id]);

    const { data, error } = await supabase
      .from("exam_templates")
      .update(buildPayload(editForm))
      .eq("id", id)
      .select("id, categoria, titulo, sexo, arquivo_origem, conteudo, created_at")
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTemplates((current) =>
        current.map((item) => (item.id === id ? (data as ExamTemplate) : item))
      );
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  async function handleDelete(id: number) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja apagar este bloco?");

    if (!confirmed) return;

    setError("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase
      .from("exam_templates")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setTemplates((current) => current.filter((item) => item.id !== id));
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Exames para solicitar
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Exames e evolução clínica
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Biblioteca prática com blocos estruturados para uso clínico real.
            </p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {total} {total === 1 ? "item" : "itens"}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Novo bloco
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Clique em um modelo da biblioteca ou preencha manualmente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <input
                value={form.categoria}
                onChange={(e) => updateForm("categoria", e.target.value)}
                placeholder="Ex.: Exames, Evolução, Conduta"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </label>
              <input
                value={form.titulo}
                onChange={(e) => updateForm("titulo", e.target.value)}
                placeholder="Ex.: Dor abdominal — exames iniciais"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sexo
              </label>
              <input
                value={form.sexo}
                onChange={(e) => updateForm("sexo", e.target.value)}
                placeholder="Opcional"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Arquivo origem / contexto
              </label>
              <input
                value={form.arquivo_origem}
                onChange={(e) => updateForm("arquivo_origem", e.target.value)}
                placeholder="Ex.: plantão, clínica médica, revisão"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Conteúdo do bloco
            </label>
            <textarea
              rows={10}
              value={form.conteudo}
              onChange={(e) => updateForm("conteudo", e.target.value)}
              placeholder="Digite o conteúdo clínico..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Limpar formulário
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Adicionar bloco"}
            </button>
          </div>
        </div>
      </section>

      <ExamTemplatesLive
        templates={templates}
        onUseTemplate={handleUseTemplate}
        initialQuery={initialQuery}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Blocos salvos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Histórico completo vindo da base de dados.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <span className="text-sm font-medium text-slate-400">
              {filteredTemplates.length} de {templates.length} registros
            </span>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar exame, evolução, categoria..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none md:w-80"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Carregando blocos...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum bloco encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map((item) => {
              const editing = editingId === item.id;
              const savingItem = savingIds.includes(item.id);
              const editForm = editForms[item.id] || {
                categoria: item.categoria || "",
                titulo: item.titulo || "",
                sexo: item.sexo || "",
                arquivo_origem: item.arquivo_origem || "",
                conteudo: item.conteudo || "",
              };

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {item.categoria || "Sem categoria"}
                        </span>

                        {item.sexo ? (
                          <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                            {item.sexo}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                        {item.titulo || "Bloco sem título"}
                      </h3>

                      {item.arquivo_origem ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.arquivo_origem}
                        </p>
                      ) : null}
                    </div>

                    <CopyButton text={item.conteudo} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                    <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                      {item.conteudo}
                    </pre>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    {!editing ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={savingItem}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-900">
                            Editando bloco
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Altere os campos abaixo e salve.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Categoria
                            </label>
                            <input
                              value={editForm.categoria}
                              onChange={(e) =>
                                updateEditForm(
                                  item.id,
                                  "categoria",
                                  e.target.value
                                )
                              }
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Título
                            </label>
                            <input
                              value={editForm.titulo}
                              onChange={(e) =>
                                updateEditForm(
                                  item.id,
                                  "titulo",
                                  e.target.value
                                )
                              }
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Sexo
                            </label>
                            <input
                              value={editForm.sexo}
                              onChange={(e) =>
                                updateEditForm(item.id, "sexo", e.target.value)
                              }
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Arquivo origem
                            </label>
                            <input
                              value={editForm.arquivo_origem}
                              onChange={(e) =>
                                updateEditForm(
                                  item.id,
                                  "arquivo_origem",
                                  e.target.value
                                )
                              }
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Conteúdo
                          </label>
                          <textarea
                            rows={10}
                            value={editForm.conteudo}
                            onChange={(e) =>
                              updateEditForm(
                                item.id,
                                "conteudo",
                                e.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleUpdate(item.id)}
                            disabled={savingItem}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingItem ? "Salvando..." : "Salvar edição"}
                          </button>

                          <button
                            type="button"
                            onClick={() => cancelEdit(item.id)}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}