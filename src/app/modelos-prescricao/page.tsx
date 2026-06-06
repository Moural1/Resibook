"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "../../components/copy-button";

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
  created_at: string | null;
};

type TemplateForm = {
  categoria: string;
  titulo: string;
  conteudo: string;
  observacoes: string;
  source_file: string;
};

const ADMIN_EMAIL = "igormoura@resibook.com";

const emptyForm: TemplateForm = {
  categoria: "",
  titulo: "",
  conteudo: "",
  observacoes: "",
  source_file: "",
};

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildTemplateText(item: PrescriptionTemplate) {
  return [
    item.titulo,
    item.categoria ? `Categoria: ${item.categoria}` : "",
    "",
    item.conteudo,
    item.observacoes ? `\nObservações:\n${item.observacoes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPayload(form: TemplateForm) {
  return {
    categoria: form.categoria.trim() || null,
    titulo: form.titulo.trim(),
    conteudo: form.conteudo.trim(),
    observacoes: form.observacoes.trim() || null,
    source_file: form.source_file.trim() || null,
  };
}

function templateToForm(item: PrescriptionTemplate): TemplateForm {
  return {
    categoria: item.categoria || "",
    titulo: item.titulo || "",
    conteudo: item.conteudo || "",
    observacoes: item.observacoes || "",
    source_file: item.source_file || "",
  };
}

export default function ModelosPrescricaoPage() {
  const supabase = createClient();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("");

  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTemplates() {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email?.trim().toLowerCase() || "";
    const isAdmin = email === ADMIN_EMAIL;

    setAuthorized(isAdmin);
    setChecking(false);

    const { data, error } = await supabase
      .from("prescription_templates")
      .select("id, categoria, titulo, conteudo, observacoes, source_file, created_at")
      .order("categoria", { ascending: true, nullsFirst: false })
      .order("titulo", { ascending: true });

    if (error) {
      setTemplates([]);
      setError(error.message);
    } else {
      setTemplates((data as PrescriptionTemplate[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  const categorias = useMemo(() => {
    return Array.from(
      new Set(templates.map((item) => item.categoria).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return templates.filter((item) => {
      const matchesQuery =
        !q ||
        normalize(item.titulo).includes(q) ||
        normalize(item.categoria).includes(q) ||
        normalize(item.conteudo).includes(q) ||
        normalize(item.observacoes).includes(q) ||
        normalize(item.source_file).includes(q);

      const matchesCategoria = !categoria || item.categoria === categoria;

      return matchesQuery && matchesCategoria;
    });
  }, [templates, query, categoria]);

  function updateForm<K extends keyof TemplateForm>(
    key: K,
    value: TemplateForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  function startEdit(item: PrescriptionTemplate) {
    setEditingId(item.id);
    setForm(templateToForm(item));
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave() {
    if (!authorized) {
      setError("Apenas o administrador pode cadastrar modelos.");
      return;
    }

    if (!form.titulo.trim()) {
      setError("Título é obrigatório.");
      return;
    }

    if (!form.conteudo.trim()) {
      setError("Conteúdo da prescrição é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = buildPayload(form);

    const response = editingId
      ? await supabase
          .from("prescription_templates")
          .update(payload)
          .eq("id", editingId)
          .select("id, categoria, titulo, conteudo, observacoes, source_file, created_at")
          .single()
      : await supabase
          .from("prescription_templates")
          .insert(payload)
          .select("id, categoria, titulo, conteudo, observacoes, source_file, created_at")
          .single();

    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      const saved = response.data as PrescriptionTemplate;

      if (editingId) {
        setTemplates((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
        setSuccess("Modelo atualizado com sucesso.");
      } else {
        setTemplates((current) => [saved, ...current]);
        setSuccess("Modelo criado com sucesso.");
      }

      setEditingId(null);
      setForm(emptyForm);
    }

    setSaving(false);
  }

  async function handleDelete(item: PrescriptionTemplate) {
    if (!authorized) {
      setError("Apenas o administrador pode apagar modelos.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o modelo "${item.titulo}"?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("prescription_templates")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
    } else {
      setTemplates((current) => current.filter((model) => model.id !== item.id));
      setSuccess("Modelo apagado com sucesso.");

      if (editingId === item.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    }

    setDeletingId(null);
  }

  if (checking || loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
        Carregando modelos de prescrição...
      </div>
    );
  }

  if (!authorized) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Acesso restrito
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Apenas o administrador pode gerenciar modelos prontos de prescrição.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Administração
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Prescrições prontas
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Modelos de prescrição
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Cadastre modelos prontos para aparecerem na biblioteca da página de
            Prescrição. Os usuários conseguem consultar e copiar; apenas o admin
            consegue criar, editar ou apagar.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Editar modelo" : "Novo modelo"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Use um conteúdo bem prático, já no formato que quer copiar no plantão.
              </p>
            </div>

            {editingId ? (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              >
                Novo modelo
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Categoria
              </label>

              <input
                value={form.categoria}
                onChange={(event) => updateForm("categoria", event.target.value)}
                placeholder="Ex.: Analgesia, Antibióticos, Psiquiatria..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </label>

              <input
                value={form.titulo}
                onChange={(event) => updateForm("titulo", event.target.value)}
                placeholder="Ex.: Amoxicilina + clavulanato adulto"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Conteúdo da prescrição
            </label>

            <textarea
              rows={8}
              value={form.conteudo}
              onChange={(event) => updateForm("conteudo", event.target.value)}
              placeholder={`Ex.:\nAmoxicilina + clavulanato 875/125 mg\nTomar 1 comprimido VO de 12/12h por 7 dias.\n\nOrientações:\nTomar após alimentação. Retornar se febre persistente, piora clínica ou sinais de alarme.`}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Observações
              </label>

              <textarea
                rows={4}
                value={form.observacoes}
                onChange={(event) => updateForm("observacoes", event.target.value)}
                placeholder="Ex.: ajustar para função renal, evitar em alergia..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fonte / origem
              </label>

              <textarea
                rows={4}
                value={form.source_file}
                onChange={(event) => updateForm("source_file", event.target.value)}
                placeholder="Ex.: Protocolo interno, aula, revisão pessoal..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar edição"
                  : "Cadastrar modelo"}
            </button>

            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Limpar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Modelos cadastrados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} de {templates.length} modelos encontrados.
              </p>
            </div>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Biblioteca compartilhada
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, categoria, conteúdo ou observação..."
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />

          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategoria("");
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
          >
            Limpar
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum modelo encontrado.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.categoria ? (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {item.categoria}
                        </span>
                      ) : null}

                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {item.titulo}
                    </h3>
                  </div>

                  <CopyButton text={buildTemplateText(item)} />
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {item.conteudo}
                  </pre>
                </div>

                {item.observacoes ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Observações
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-950">
                      {item.observacoes}
                    </p>
                  </div>
                ) : null}

                {item.source_file ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Fonte/origem: {item.source_file}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Apagando..." : "Apagar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}