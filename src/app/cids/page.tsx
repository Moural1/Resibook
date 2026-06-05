"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type CidItem = {
  id: number;
  codigo: string;
  descricao: string;
  grupo: string | null;
  area: string | null;
  prioridade: number | null;
  tags: string | null;
};

type CidForm = {
  codigo: string;
  descricao: string;
  grupo: string;
  area: string;
  prioridade: string;
  tags: string;
};

const initialForm: CidForm = {
  codigo: "",
  descricao: "",
  grupo: "",
  area: "",
  prioridade: "",
  tags: "",
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isHighlighted(item: CidItem, query: string) {
  const q = normalize(query);
  if (!q) return false;

  return (
    normalize(item.codigo).includes(q) ||
    normalize(item.descricao).includes(q) ||
    normalize(item.tags || "").includes(q)
  );
}

export default function CidsPage() {
  const [allCids, setAllCids] = useState<CidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [grupo, setGrupo] = useState("");
  const [area, setArea] = useState("");
  const [form, setForm] = useState<CidForm>(initialForm);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase não configurado.");
      setAllCids([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("cids")
      .select("*")
      .order("grupo", { ascending: true })
      .order("codigo", { ascending: true });

    if (error) {
      setError(error.message);
      setAllCids([]);
    } else {
      setError("");
      setAllCids((data as CidItem[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const grupos = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.grupo).filter(Boolean))
    ) as string[];
  }, [allCids]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.area).filter(Boolean))
    ) as string[];
  }, [allCids]);

  const filtered = useMemo(() => {
    return allCids.filter((item) => {
      const matchesQuery =
        !query ||
        normalize(item.codigo).includes(normalize(query)) ||
        normalize(item.descricao).includes(normalize(query)) ||
        normalize(item.tags || "").includes(normalize(query));

      const matchesGrupo = !grupo || item.grupo === grupo;
      const matchesArea = !area || item.area === area;

      return matchesQuery && matchesGrupo && matchesArea;
    });
  }, [allCids, query, grupo, area]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CidItem[]>>((acc, item) => {
      const key = item.grupo || "Sem grupo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function startEdit(item: CidItem) {
    setEditingId(item.id);
    setForm({
      codigo: item.codigo || "",
      descricao: item.descricao || "",
      grupo: item.grupo || "",
      area: item.area || "",
      prioridade: item.prioridade != null ? String(item.prioridade) : "",
      tags: item.tags || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const supabase = getSupabase();
    if (!supabase) return;

    if (!form.codigo.trim() || !form.descricao.trim()) {
      setError("Código e descrição são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      grupo: form.grupo.trim() || null,
      area: form.area.trim() || null,
      prioridade: form.prioridade ? Number(form.prioridade) : null,
      tags: form.tags.trim() || null,
    };

    const result = editingId
      ? await supabase.from("cids").update(payload).eq("id", editingId)
      : await supabase.from("cids").insert(payload);

    if (result.error) {
      setError(result.error.message);
    } else {
      resetForm();
      await load();
    }

    setSaving(false);
  }

  async function handleDelete(id: number) {
    const supabase = getSupabase();
    if (!supabase) return;

    const confirmed = window.confirm("Tem certeza que deseja apagar este CID?");
    if (!confirmed) return;

    const { error } = await supabase.from("cids").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Referência rápida
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              CRUD completo
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            CIDs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Criar, editar, apagar e buscar por código, descrição ou tags.
          </p>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {loading ? "Carregando..." : `Total carregado do banco: ${allCids.length}`}
          </p>

          {error ? (
            <p className="mt-2 text-sm font-medium text-rose-600">Erro: {error}</p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Editar CID" : "Novo CID"}
            </h2>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              value={form.codigo}
              onChange={(e) => setForm((s) => ({ ...s, codigo: e.target.value }))}
              placeholder="Código"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />

            <input
              value={form.grupo}
              onChange={(e) => setForm((s) => ({ ...s, grupo: e.target.value }))}
              placeholder="Grupo"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />

            <input
              value={form.area}
              onChange={(e) => setForm((s) => ({ ...s, area: e.target.value }))}
              placeholder="Área"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />

            <input
              value={form.prioridade}
              onChange={(e) => setForm((s) => ({ ...s, prioridade: e.target.value }))}
              placeholder="Prioridade"
              type="number"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            />
          </div>

          <textarea
            value={form.descricao}
            onChange={(e) => setForm((s) => ({ ...s, descricao: e.target.value }))}
            placeholder="Descrição"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <textarea
            value={form.tags}
            onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))}
            placeholder="Tags separadas por vírgula"
            rows={2}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              {saving ? "Salvando..." : editingId ? "Salvar edição" : "Criar CID"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700"
            >
              Limpar formulário
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código ou descrição..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              <option value="">— todos os grupos —</option>
              {grupos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            >
              <option value="">— todas as áreas —</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGrupo("");
                setArea("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          {loading ? "Carregando resultados..." : `${filtered.length} resultado(s).`}
        </p>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando CIDs...
        </section>
      ) : Object.keys(grouped).length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum CID encontrado.
        </section>
      ) : (
        Object.entries(grouped).map(([groupName, items]) => (
          <section
            key={groupName}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {groupName} ({items.length})
              </h3>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {items.map((item) => {
                const highlighted = isHighlighted(item, query);

                return (
                  <div
                    key={item.id}
                    className={`rounded-[22px] border p-4 transition ${
                      highlighted
                        ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            highlighted ? "text-sky-800" : "text-sky-700"
                          }`}
                        >
                          {item.codigo}
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                          {item.descricao}
                        </p>
                      </div>

                      {highlighted ? (
                        <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                          Encontrado
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.area ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {item.area}
                        </span>
                      ) : null}

                      {item.tags
                        ? item.tags.split(",").map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-sky-100 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-700"
                            >
                              {tag.trim()}
                            </span>
                          ))
                        : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-5 text-sm font-semibold text-cyan-800"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-700"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}