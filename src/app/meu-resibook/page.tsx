"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  Check,
  Copy,
  Edit3,
  FilePlus2,
  Heart,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  PERSONAL_CONTENT_LABELS,
  PERSONAL_CONTENT_TYPES,
  type PersonalContentItem,
  type PersonalContentType,
} from "@/lib/personal-content";

type Draft = {
  title: string;
  content: string;
  item_type: PersonalContentType;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  content: "",
  item_type: "prescription",
};

export default function MeuResibookPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<PersonalContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PersonalContentType>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalContentItem | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadItems(currentUserId: string) {
    const { data, error: loadError } = await supabase
      .from("personal_content_items")
      .select(
        "id, user_id, item_type, title, content, metadata, source_global_id, is_favorite, is_primary, created_at, updated_at"
      )
      .eq("user_id", currentUserId)
      .order("is_primary", { ascending: false })
      .order("updated_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setItems([]);
    } else {
      setItems((data || []) as PersonalContentItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      setQuery(new URLSearchParams(window.location.search).get("q") || "");
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id || "";
      setUserId(id);

      if (!id) {
        setError("Sessão não encontrada. Entre novamente para acessar seu acervo.");
        setLoading(false);
        return;
      }

      await loadItems(id);
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesType = !typeFilter || item.item_type === typeFilter;
      const matchesQuery =
        !normalized ||
        `${item.title} ${item.content}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter]);

  const favoriteCount = items.filter((item) => item.is_favorite).length;
  const originalCount = items.filter((item) => !item.source_global_id).length;

  function openCreate() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setDrawerOpen(true);
    setError("");
    setMessage("");
  }

  function openEdit(item: PersonalContentItem) {
    setEditing(item);
    setDraft({
      title: item.title,
      content: item.content,
      item_type: item.item_type,
    });
    setDrawerOpen(true);
    setError("");
    setMessage("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  }

  async function saveItem() {
    if (!userId || !draft.title.trim() || !draft.content.trim()) {
      setError("Preencha título e conteúdo.");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      user_id: userId,
      item_type: draft.item_type,
      title: draft.title.trim(),
      content: draft.content.trim(),
    };

    const response = editing
      ? await supabase
          .from("personal_content_items")
          .update(payload)
          .eq("id", editing.id)
          .eq("user_id", userId)
      : await supabase.from("personal_content_items").insert(payload);

    if (response.error) {
      setError(response.error.message);
    } else {
      await loadItems(userId);
      setMessage(editing ? "Conteúdo atualizado." : "Conteúdo criado no seu acervo.");
      closeDrawer();
    }
    setSaving(false);
  }

  async function deleteItem(item: PersonalContentItem) {
    if (!userId || !window.confirm(`Excluir “${item.title}” do seu acervo?`)) return;

    const { error: deleteError } = await supabase
      .from("personal_content_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (deleteError) setError(deleteError.message);
    else {
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setMessage("Conteúdo excluído.");
    }
  }

  async function toggleFavorite(item: PersonalContentItem) {
    if (!userId) return;
    const next = !item.is_favorite;
    const update = await supabase
      .from("personal_content_items")
      .update({ is_favorite: next })
      .eq("id", item.id)
      .eq("user_id", userId);

    if (update.error) {
      setError(update.error.message);
      return;
    }

    const favoriteResponse = next
      ? await supabase.from("user_content_favorites").upsert({
          user_id: userId,
          item_type: item.item_type,
          item_id: item.id,
          source: "personal",
        })
      : await supabase
          .from("user_content_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", item.item_type)
          .eq("item_id", item.id)
          .eq("source", "personal");

    if (favoriteResponse.error) setError(favoriteResponse.error.message);
    else setItems((current) => current.map((candidate) =>
      candidate.id === item.id ? { ...candidate, is_favorite: next } : candidate
    ));
  }

  async function setPrimary(item: PersonalContentItem) {
    if (!userId) return;
    const clear = await supabase
      .from("personal_content_items")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .eq("item_type", item.item_type);

    if (clear.error) {
      setError(clear.error.message);
      return;
    }

    if (!item.is_primary) {
      const select = await supabase
        .from("personal_content_items")
        .update({ is_primary: true })
        .eq("id", item.id)
        .eq("user_id", userId);
      if (select.error) {
        setError(select.error.message);
        return;
      }
    }

    await loadItems(userId);
  }

  async function copyItem(item: PersonalContentItem) {
    if (!userId) return;
    await navigator.clipboard.writeText(item.content);
    await supabase.from("user_content_recents").upsert(
      {
        user_id: userId,
        item_type: item.item_type,
        item_id: item.id,
        source: "personal",
        accessed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_type,item_id,source" }
    );
    setMessage("Conteúdo copiado.");
  }

  async function duplicateItem(item: PersonalContentItem) {
    if (!userId) return;
    const { error: duplicateError } = await supabase
      .from("personal_content_items")
      .insert({
        user_id: userId,
        item_type: item.item_type,
        title: `Cópia de ${item.title}`,
        content: item.content,
        metadata: item.metadata || {},
        source_global_id: item.source_global_id,
      });
    if (duplicateError) setError(duplicateError.message);
    else {
      await loadItems(userId);
      setMessage("Cópia criada no Meu Resibook.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#081a3a] p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Meu Resibook
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Seu acervo clínico privado
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Crie modelos autorais e adapte cópias do Banco Resibook sem alterar o conteúdo global.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <FilePlus2 className="h-4 w-4" />
            Novo conteúdo
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total", items.length],
          ["Favoritos", favoriteCount],
          ["Conteúdos autorais", originalCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no seu acervo..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-cyan-600 focus:bg-white"
            />
          </label>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as "" | PersonalContentType)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-cyan-600"
          >
            <option value="">Todos os tipos</option>
            {PERSONAL_CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>{PERSONAL_CONTENT_LABELS[type]}</option>
            ))}
          </select>
        </div>
      </section>

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

      {loading ? (
        <div className="rounded-[26px] border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">Carregando seu acervo...</div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookCopy className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Seu acervo começa aqui</h2>
          <p className="mt-2 text-sm text-slate-500">Crie um conteúdo ou duplique um item do Banco Resibook.</p>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">Meu Resibook</span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">{PERSONAL_CONTENT_LABELS[item.item_type]}</span>
                {item.source_global_id ? <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Adaptado do Banco Resibook</span> : null}
                {item.is_primary ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Principal</span> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.content}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Action onClick={() => copyItem(item)} icon={Copy} label="Copiar" />
                <Action onClick={() => duplicateItem(item)} icon={BookCopy} label="Duplicar" />
                <Action onClick={() => toggleFavorite(item)} icon={Heart} label={item.is_favorite ? "Favorito" : "Favoritar"} active={item.is_favorite} />
                <Action onClick={() => setPrimary(item)} icon={Star} label={item.is_primary ? "Remover principal" : "Marcar principal"} active={item.is_primary} />
                <Action onClick={() => openEdit(item)} icon={Edit3} label="Editar" />
                <Action onClick={() => deleteItem(item)} icon={Trash2} label="Excluir" danger />
              </div>
            </article>
          ))}
        </section>
      )}

      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Revise conteúdo, dose, contraindicações e protocolos locais antes do uso clínico. O Resibook apoia — não substitui — o julgamento médico.
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50">
          <button type="button" className="absolute inset-0" onClick={closeDrawer} aria-label="Fechar" />
          <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Meu Resibook</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{editing ? "Editar conteúdo" : "Novo conteúdo"}</h2>
              </div>
              <button type="button" onClick={closeDrawer} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-8 space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Tipo
                <select value={draft.item_type} onChange={(event) => setDraft((current) => ({ ...current, item_type: event.target.value as PersonalContentType }))} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 font-normal">
                  {PERSONAL_CONTENT_TYPES.map((type) => <option key={type} value={type}>{PERSONAL_CONTENT_LABELS[type]}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Título
                <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Conteúdo
                <textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} rows={16} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal leading-7" />
              </label>
              <div className="flex gap-3 border-t border-slate-200 pt-5">
                <button type="button" onClick={saveItem} disabled={saving} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" />{saving ? "Salvando..." : "Salvar"}</button>
                <button type="button" onClick={closeDrawer} className="h-12 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Action({ onClick, icon: Icon, label, active = false, danger = false }: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${danger ? "border-rose-200 bg-rose-50 text-rose-700" : active ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}
