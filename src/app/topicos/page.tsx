"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";

type TopicoMedico = {
  id: number;
  area: string;
  titulo: string;
  resumo: string | null;
  diagnostico: string | null;
  criterios: string | null;
  exames: string | null;
  tratamento: string | null;
  conduta_urgencia: string | null;
  internacao_referencia: string | null;
  pegadinhas: string | null;
  tags: string | null;
  prioridade: number | null;
  fonte: string | null;
  atualizado_em: string | null;
};

type TopicoForm = {
  area: string;
  titulo: string;
  resumo: string;
  diagnostico: string;
  criterios: string;
  exames: string;
  tratamento: string;
  conduta_urgencia: string;
  internacao_referencia: string;
  pegadinhas: string;
  tags: string;
  prioridade: string;
  fonte: string;
};

const emptyForm: TopicoForm = {
  area: "",
  titulo: "",
  resumo: "",
  diagnostico: "",
  criterios: "",
  exames: "",
  tratamento: "",
  conduta_urgencia: "",
  internacao_referencia: "",
  pegadinhas: "",
  tags: "",
  prioridade: "1",
  fonte: "ResiBook",
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

function formatLabel(value?: string | null) {
  if (!value) return "Sem área";
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function buildFullText(item: TopicoMedico) {
  const sections = [
    ["TEMA", item.titulo],
    ["ÁREA", item.area],
    ["RESUMO", item.resumo],
    ["DIAGNÓSTICO", item.diagnostico],
    ["CRITÉRIOS / CLASSIFICAÇÃO", item.criterios],
    ["EXAMES", item.exames],
    ["TRATAMENTO / CONDUTA", item.tratamento],
    ["CONDUTA NA URGÊNCIA", item.conduta_urgencia],
    ["INTERNAÇÃO / REFERÊNCIA", item.internacao_referencia],
    ["PEGADINHAS DE PROVA", item.pegadinhas],
    ["TAGS", item.tags],
    ["FONTE", item.fonte],
  ];

  return sections
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}\n${value}`)
    .join("\n\n");
}

function toForm(item: TopicoMedico): TopicoForm {
  return {
    area: item.area || "",
    titulo: item.titulo || "",
    resumo: item.resumo || "",
    diagnostico: item.diagnostico || "",
    criterios: item.criterios || "",
    exames: item.exames || "",
    tratamento: item.tratamento || "",
    conduta_urgencia: item.conduta_urgencia || "",
    internacao_referencia: item.internacao_referencia || "",
    pegadinhas: item.pegadinhas || "",
    tags: item.tags || "",
    prioridade: item.prioridade ? String(item.prioridade) : "1",
    fonte: item.fonte || "ResiBook",
  };
}

function buildPayload(form: TopicoForm) {
  return {
    area: form.area.trim(),
    titulo: form.titulo.trim(),
    resumo: form.resumo.trim() || null,
    diagnostico: form.diagnostico.trim() || null,
    criterios: form.criterios.trim() || null,
    exames: form.exames.trim() || null,
    tratamento: form.tratamento.trim() || null,
    conduta_urgencia: form.conduta_urgencia.trim() || null,
    internacao_referencia: form.internacao_referencia.trim() || null,
    pegadinhas: form.pegadinhas.trim() || null,
    tags: form.tags.trim() || null,
    prioridade: form.prioridade ? Number(form.prioridade) : 1,
    fonte: form.fonte.trim() || "ResiBook",
    atualizado_em: new Date().toISOString(),
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children?: string | null;
}) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {children}
      </p>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
      />
    </div>
  );
}

export default function TopicosPage() {
  const [topicos, setTopicos] = useState<TopicoMedico[]>([]);
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [form, setForm] = useState<TopicoForm>(emptyForm);
  const [editForms, setEditForms] = useState<Record<number, TopicoForm>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTopicos() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("topicos_medicos")
      .select(
        "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
      )
      .order("area", { ascending: true })
      .order("titulo", { ascending: true });

    if (error) {
      setError(error.message);
      setTopicos([]);
    } else {
      setTopicos((data as TopicoMedico[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTopicos();
  }, []);

  const areas = useMemo(() => {
    return Array.from(new Set(topicos.map((item) => item.area))).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [topicos]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return topicos.filter((item) => {
      const matchesArea = !selectedArea || item.area === selectedArea;

      const matchesQuery =
        !q ||
        normalize(item.area).includes(q) ||
        normalize(item.titulo).includes(q) ||
        normalize(item.resumo).includes(q) ||
        normalize(item.diagnostico).includes(q) ||
        normalize(item.criterios).includes(q) ||
        normalize(item.exames).includes(q) ||
        normalize(item.tratamento).includes(q) ||
        normalize(item.conduta_urgencia).includes(q) ||
        normalize(item.internacao_referencia).includes(q) ||
        normalize(item.pegadinhas).includes(q) ||
        normalize(item.tags).includes(q) ||
        normalize(item.fonte).includes(q);

      return matchesArea && matchesQuery;
    });
  }, [topicos, query, selectedArea]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, TopicoMedico[]>>((acc, item) => {
      if (!acc[item.area]) acc[item.area] = [];
      acc[item.area].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const hasFilters = Boolean(query || selectedArea);

  function updateForm<K extends keyof TopicoForm>(
    key: K,
    value: TopicoForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateEditForm<K extends keyof TopicoForm>(
    id: number,
    key: K,
    value: TopicoForm[K]
  ) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] || emptyForm),
        [key]: value,
      },
    }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleCreate() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (!form.area.trim() || !form.titulo.trim()) {
      setError("Área e título são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data, error } = await supabase
      .from("topicos_medicos")
      .insert(buildPayload(form))
      .select(
        "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTopicos((current) =>
        [...current, data as TopicoMedico].sort((a, b) => {
          const areaCompare = a.area.localeCompare(b.area, "pt-BR");
          if (areaCompare !== 0) return areaCompare;
          return a.titulo.localeCompare(b.titulo, "pt-BR");
        })
      );
      setSuccess("Tópico criado com sucesso.");
      resetForm();
    }

    setSaving(false);
  }

  function startEdit(item: TopicoMedico) {
    setEditingId(item.id);
    setEditForms((current) => ({
      ...current,
      [item.id]: toForm(item),
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

    if (!editForm.area.trim() || !editForm.titulo.trim()) {
      setError("Área e título são obrigatórios.");
      return;
    }

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { data, error } = await supabase
      .from("topicos_medicos")
      .update(buildPayload(editForm))
      .eq("id", id)
      .select(
        "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em"
      )
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTopicos((current) =>
        current
          .map((item) => (item.id === id ? (data as TopicoMedico) : item))
          .sort((a, b) => {
            const areaCompare = a.area.localeCompare(b.area, "pt-BR");
            if (areaCompare !== 0) return areaCompare;
            return a.titulo.localeCompare(b.titulo, "pt-BR");
          })
      );
      setSuccess("Tópico atualizado com sucesso.");
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  async function handleDelete(id: number, title: string) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o tópico "${title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setSavingIds((current) => [...current, id]);

    const { error } = await supabase.from("topicos_medicos").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setTopicos((current) => current.filter((item) => item.id !== id));
      setSuccess("Tópico apagado com sucesso.");
      cancelEdit(id);
    }

    setSavingIds((current) => current.filter((item) => item !== id));
  }

  function renderEditForm(item: TopicoMedico) {
    const editForm = editForms[item.id] || toForm(item);
    const savingItem = savingIds.includes(item.id);

    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold text-slate-900">
            Editando tópico
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Corrija o conteúdo e salve. Isso altera diretamente a tabela
            topicos_medicos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Área
            </label>
            <input
              value={editForm.area}
              onChange={(event) =>
                updateEditForm(item.id, "area", event.target.value)
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
              onChange={(event) =>
                updateEditForm(item.id, "titulo", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Prioridade
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={editForm.prioridade}
              onChange={(event) =>
                updateEditForm(item.id, "prioridade", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fonte
            </label>
            <input
              value={editForm.fonte}
              onChange={(event) =>
                updateEditForm(item.id, "fonte", event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Resumo"
            value={editForm.resumo}
            onChange={(value) => updateEditForm(item.id, "resumo", value)}
          />

          <TextAreaField
            label="Diagnóstico"
            value={editForm.diagnostico}
            onChange={(value) => updateEditForm(item.id, "diagnostico", value)}
          />

          <TextAreaField
            label="Critérios / classificação"
            value={editForm.criterios}
            onChange={(value) => updateEditForm(item.id, "criterios", value)}
          />

          <TextAreaField
            label="Exames"
            value={editForm.exames}
            onChange={(value) => updateEditForm(item.id, "exames", value)}
          />

          <TextAreaField
            label="Tratamento / conduta"
            value={editForm.tratamento}
            onChange={(value) => updateEditForm(item.id, "tratamento", value)}
          />

          <TextAreaField
            label="Conduta na urgência"
            value={editForm.conduta_urgencia}
            onChange={(value) =>
              updateEditForm(item.id, "conduta_urgencia", value)
            }
          />

          <TextAreaField
            label="Internação / referência"
            value={editForm.internacao_referencia}
            onChange={(value) =>
              updateEditForm(item.id, "internacao_referencia", value)
            }
          />

          <TextAreaField
            label="Pegadinhas de prova"
            value={editForm.pegadinhas}
            onChange={(value) => updateEditForm(item.id, "pegadinhas", value)}
          />

          <TextAreaField
            label="Tags"
            value={editForm.tags}
            onChange={(value) => updateEditForm(item.id, "tags", value)}
            rows={2}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
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
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Biblioteca clínica
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Tópicos médicos
            </span>

            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              CRUD completo
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Tópicos clínicos
          </h1>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Biblioteca médica estruturada por área, com diagnóstico, critérios,
            exames, tratamento, urgência, internação/referência e pegadinhas de
            prova.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            <span>Total carregado do banco: {topicos.length}</span>
            <span>•</span>
            <span>Exibindo: {filtered.length}</span>
          </div>

          {error ? (
            <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          ) : null}
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_280px_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por tema, diagnóstico, exame, tratamento..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />

            <select
              value={selectedArea}
              onChange={(event) => setSelectedArea(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">Todas as áreas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {formatLabel(area)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedArea("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              {hasFilters ? "Limpar filtros" : "Filtros"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Novo tópico médico
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Crie tópicos novos ou complemente a biblioteca já importada.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Área
            </label>
            <input
              value={form.area}
              onChange={(event) => updateForm("area", event.target.value)}
              placeholder="Ex.: Clínica Médica"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Título
            </label>
            <input
              value={form.titulo}
              onChange={(event) => updateForm("titulo", event.target.value)}
              placeholder="Ex.: Tromboembolismo Pulmonar"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Prioridade
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={form.prioridade}
              onChange={(event) => updateForm("prioridade", event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fonte
            </label>
            <input
              value={form.fonte}
              onChange={(event) => updateForm("fonte", event.target.value)}
              placeholder="Ex.: ResiBook"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Resumo"
            value={form.resumo}
            onChange={(value) => updateForm("resumo", value)}
            placeholder="Resumo específico e objetivo do tema."
          />

          <TextAreaField
            label="Diagnóstico"
            value={form.diagnostico}
            onChange={(value) => updateForm("diagnostico", value)}
            placeholder="Como suspeitar, confirmar e diferenciar."
          />

          <TextAreaField
            label="Critérios / classificação"
            value={form.criterios}
            onChange={(value) => updateForm("criterios", value)}
            placeholder="Critérios diagnósticos, gravidade, classificação ou escore."
          />

          <TextAreaField
            label="Exames"
            value={form.exames}
            onChange={(value) => updateForm("exames", value)}
            placeholder="Exames iniciais, confirmatórios e seguimento."
          />

          <TextAreaField
            label="Tratamento / conduta"
            value={form.tratamento}
            onChange={(value) => updateForm("tratamento", value)}
            placeholder="Conduta prática, primeira linha, doses se necessário."
          />

          <TextAreaField
            label="Conduta na urgência"
            value={form.conduta_urgencia}
            onChange={(value) => updateForm("conduta_urgencia", value)}
            placeholder="O que fazer no PS, estabilização e red flags."
          />

          <TextAreaField
            label="Internação / referência"
            value={form.internacao_referencia}
            onChange={(value) => updateForm("internacao_referencia", value)}
            placeholder="Critérios de internação, UTI, encaminhamento ou referência."
          />

          <TextAreaField
            label="Pegadinhas de prova"
            value={form.pegadinhas}
            onChange={(value) => updateForm("pegadinhas", value)}
            placeholder="Armadilhas frequentes de prova."
          />

          <TextAreaField
            label="Tags"
            value={form.tags}
            onChange={(value) => updateForm("tags", value)}
            placeholder="Ex.: urgência, antibiótico, prova, plantão"
            rows={2}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Criar tópico"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
          >
            Limpar formulário
          </button>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando tópicos médicos...
        </section>
      ) : Object.keys(grouped).length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum tópico encontrado.
        </section>
      ) : (
        Object.entries(grouped).map(([area, items]) => (
          <section
            key={area}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
                    Área
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {formatLabel(area)}
                  </h2>
                </div>

                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {items.map((item) => {
                const savingItem = savingIds.includes(item.id);
                const editing = editingId === item.id;

                return (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {item.area}
                      </span>

                      {item.prioridade ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Prioridade {item.prioridade}
                        </span>
                      ) : null}

                      {item.fonte ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {item.fonte}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                          {item.titulo}
                        </h3>

                        {item.tags ? (
                          <p className="mt-2 text-sm text-slate-500">
                            Tags: {item.tags}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <CopyButton text={buildFullText(item)} />

                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.titulo)}
                          disabled={savingItem}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingItem ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    </div>

                    {item.resumo ? (
                      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                          Resumo
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {item.resumo}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                      <Section title="Diagnóstico">{item.diagnostico}</Section>
                      <Section title="Critérios / classificação">
                        {item.criterios}
                      </Section>
                      <Section title="Exames">{item.exames}</Section>
                      <Section title="Tratamento / conduta">
                        {item.tratamento}
                      </Section>
                      <Section title="Conduta na urgência">
                        {item.conduta_urgencia}
                      </Section>
                      <Section title="Internação / referência">
                        {item.internacao_referencia}
                      </Section>
                    </div>

                    {item.pegadinhas ? (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
                          Pegadinhas de prova
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {item.pegadinhas}
                        </p>
                      </div>
                    ) : null}

                    {editing ? renderEditForm(item) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}