"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  Check,
  Copy,
  Edit3,
  FilePlus2,
  Folder,
  FolderInput,
  FolderPlus,
  Heart,
  Inbox,
  Layers,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "@/components/module-page-header";
import {
  PERSONAL_CONTENT_LABELS,
  PERSONAL_CONTENT_TYPES,
  personalFolder,
  withPersonalFolder,
  type PersonalContentItem,
  type PersonalContentType,
} from "@/lib/personal-content";

type Draft = {
  title: string;
  content: string;
  item_type: PersonalContentType;
  folder: string;
};

const EMPTY_DRAFT: Draft = {
  title: "",
  content: "",
  item_type: "prescription",
  folder: "",
};

// Filtros especiais da barra de pastas.
const ALL = "";
const NO_FOLDER = "__sem_pasta";
const FAVORITES = "__favoritos";
const NEW_FOLDER = "__nova_pasta";

// Pastas criadas e ainda vazias ficam só neste navegador até receberem um item.
function emptyFoldersKey(userId: string) {
  return `resibook-meu-pastas-${userId}`;
}

function readEmptyFolders(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(emptyFoldersKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeEmptyFolders(userId: string, folders: string[]) {
  try {
    window.localStorage.setItem(emptyFoldersKey(userId), JSON.stringify(folders));
  } catch {
    // Sem armazenamento local: a pasta continua existindo enquanto tiver itens.
  }
}

function cleanFolderName(value: string | null) {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, 60);
}

export default function MeuResibookPage() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState<PersonalContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PersonalContentType>("");
  const [folderFilter, setFolderFilter] = useState(ALL);
  const [emptyFolders, setEmptyFolders] = useState<string[]>([]);
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

      setEmptyFolders(readEmptyFolders(id));
      await loadItems(id);
    }

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const folder = personalFolder(item);
      if (folder) counts.set(folder, (counts.get(folder) || 0) + 1);
    }
    return counts;
  }, [items]);

  const folders = useMemo(
    () =>
      Array.from(new Set([...folderCounts.keys(), ...emptyFolders])).sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" })
      ),
    [folderCounts, emptyFolders]
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const folder = personalFolder(item);
      const matchesFolder =
        folderFilter === ALL ||
        (folderFilter === NO_FOLDER && !folder) ||
        (folderFilter === FAVORITES && item.is_favorite) ||
        folder === folderFilter;
      if (!matchesFolder) return false;
      const matchesType = !typeFilter || item.item_type === typeFilter;
      const matchesQuery =
        !normalized ||
        `${item.title} ${item.content}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter, folderFilter]);

  const favoriteCount = items.filter((item) => item.is_favorite).length;
  const originalCount = items.filter((item) => !item.source_global_id).length;

  const isRealFolder = folderFilter !== ALL && folderFilter !== NO_FOLDER && folderFilter !== FAVORITES;

  function rememberEmptyFolders(next: string[]) {
    setEmptyFolders(next);
    if (userId) writeEmptyFolders(userId, next);
  }

  function createFolder() {
    const name = cleanFolderName(window.prompt("Nome da nova pasta"));
    if (!name) return null;
    if (!folders.includes(name)) rememberEmptyFolders([...emptyFolders, name]);
    setFolderFilter(name);
    return name;
  }

  async function updateFolders(targets: PersonalContentItem[], folder: string) {
    const results = await Promise.all(
      targets.map((item) =>
        supabase
          .from("personal_content_items")
          .update({ metadata: withPersonalFolder(item.metadata, folder) })
          .eq("id", item.id)
          .eq("user_id", userId)
      )
    );
    const failed = results.find((response) => response.error);
    if (failed?.error) {
      setError(failed.error.message);
      await loadItems(userId);
      return false;
    }
    const ids = new Set(targets.map((item) => item.id));
    setItems((current) =>
      current.map((item) => (ids.has(item.id) ? { ...item, metadata: withPersonalFolder(item.metadata, folder) } : item))
    );
    return true;
  }

  async function moveItem(item: PersonalContentItem, target: string) {
    if (!userId) return;
    const folder = target === NEW_FOLDER ? cleanFolderName(window.prompt("Nome da nova pasta")) : target;
    if (target === NEW_FOLDER && !folder) return;
    setError("");
    if (await updateFolders([item], folder)) {
      if (folder) rememberEmptyFolders(emptyFolders.filter((name) => name !== folder));
      setMessage(folder ? `Movido para “${folder}”.` : "Item sem pasta.");
    }
  }

  async function renameFolder(oldName: string) {
    const name = cleanFolderName(window.prompt("Novo nome da pasta", oldName));
    if (!name || name === oldName) return;
    const targets = items.filter((item) => personalFolder(item) === oldName);
    if (targets.length && !(await updateFolders(targets, name))) return;
    rememberEmptyFolders(emptyFolders.map((folder) => (folder === oldName ? name : folder)).filter((folder, index, all) => all.indexOf(folder) === index));
    setFolderFilter(name);
    setMessage(`Pasta renomeada para “${name}”.`);
  }

  async function removeFolder(name: string) {
    const targets = items.filter((item) => personalFolder(item) === name);
    const confirmed = window.confirm(
      targets.length
        ? `Remover a pasta “${name}”? ${targets.length === 1 ? "O item volta" : `Os ${targets.length} itens voltam`} para “Sem pasta”. Nenhum conteúdo é apagado.`
        : `Remover a pasta vazia “${name}”?`
    );
    if (!confirmed) return;
    if (targets.length && !(await updateFolders(targets, ""))) return;
    rememberEmptyFolders(emptyFolders.filter((folder) => folder !== name));
    setFolderFilter(ALL);
    setMessage(`Pasta “${name}” removida.`);
  }

  function openCreate() {
    setEditing(null);
    setDraft({ ...EMPTY_DRAFT, folder: isRealFolder ? folderFilter : "" });
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
      folder: personalFolder(item),
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
      metadata: withPersonalFolder(editing?.metadata, draft.folder),
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
      const folder = cleanFolderName(draft.folder);
      if (folder) rememberEmptyFolders(emptyFolders.filter((name) => name !== folder));
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
      <ModulePageHeader
        eyebrow="Meu Resibook"
        title="Seu acervo clínico privado"
        description="Crie modelos autorais e adapte cópias do Banco Resibook sem alterar o conteúdo global."
        badges={[
          { label: "Privado por usuário", tone: "emerald" },
          { label: "Acervo editável", tone: "cyan" },
        ]}
        metrics={[
          { label: "Total", value: items.length },
          { label: "Favoritos", value: favoriteCount },
          { label: "Autorais", value: originalCount },
        ]}
        error={error}
        success={message}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition"
          >
            <FilePlus2 className="h-4 w-4" />
            Novo conteúdo
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <nav aria-label="Pastas" className="rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pastas</p>
              <button
                type="button"
                onClick={createFolder}
                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-50"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Nova
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              <FolderButton icon={Layers} label="Todos" count={items.length} active={folderFilter === ALL} onClick={() => setFolderFilter(ALL)} />
              <FolderButton icon={Heart} label="Favoritos" count={favoriteCount} active={folderFilter === FAVORITES} onClick={() => setFolderFilter(FAVORITES)} />
              <FolderButton
                icon={Inbox}
                label="Sem pasta"
                count={items.filter((item) => !personalFolder(item)).length}
                active={folderFilter === NO_FOLDER}
                onClick={() => setFolderFilter(NO_FOLDER)}
              />
              {folders.length ? <div className="my-1 hidden border-t border-slate-100 lg:block" /> : null}
              {folders.map((folder) => (
                <FolderButton
                  key={folder}
                  icon={Folder}
                  label={folder}
                  count={folderCounts.get(folder) || 0}
                  active={folderFilter === folder}
                  onClick={() => setFolderFilter(folder)}
                />
              ))}
            </div>
            {!folders.length ? (
              <p className="hidden px-2 pb-2 pt-1 text-xs leading-5 text-slate-500 lg:block">
                Crie pastas por especialidade, rodízio ou plantão e mova os itens com “Mover para pasta”.
              </p>
            ) : null}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          {isRealFolder ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-950">
                <Folder className="h-4 w-4 shrink-0 text-cyan-800" />
                <span className="truncate">{folderFilter}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => renameFolder(folderFilter)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Renomear
                </button>
                <button
                  type="button"
                  onClick={() => removeFolder(folderFilter)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover pasta
                </button>
              </div>
            </div>
          ) : null}

          <section className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid gap-2 md:grid-cols-[1fr_220px]">
              <label className="relative">
                <span className="sr-only">Buscar no seu acervo</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar no seu acervo"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "" | PersonalContentType)}
                aria-label="Filtrar por tipo"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-600"
              >
                <option value="">Todos os tipos</option>
                {PERSONAL_CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>{PERSONAL_CONTENT_LABELS[type]}</option>
                ))}
              </select>
            </div>
          </section>

          {loading ? (
            <div className="rounded-[20px] border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">Carregando seu acervo...</div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <BookCopy className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                {items.length === 0 ? "Seu acervo começa aqui" : isRealFolder ? "Pasta vazia" : "Nada encontrado"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {items.length === 0
                  ? "Crie um conteúdo ou salve um item de Prescrição ou Flashcards no Meu Resibook."
                  : isRealFolder
                    ? "Use “Mover para pasta” em um item ou crie um conteúdo novo aqui."
                    : "Tente outra busca ou outro filtro."}
              </p>
            </div>
          ) : (
            <section className="grid gap-4 xl:grid-cols-2">
              {filteredItems.map((item) => {
                const folder = personalFolder(item);
                return (
                  <article key={item.id} className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">{PERSONAL_CONTENT_LABELS[item.item_type]}</span>
                      {folder && folderFilter !== folder ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
                          <Folder className="h-3 w-3" />
                          {folder}
                        </span>
                      ) : null}
                      {item.source_global_id ? <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">Adaptado do Banco Resibook</span> : null}
                      {item.is_primary ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Principal</span> : null}
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h2>
                    <p className="mt-2 line-clamp-6 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.content}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <Action onClick={() => copyItem(item)} icon={Copy} label="Copiar" />
                      <Action onClick={() => openEdit(item)} icon={Edit3} label="Editar" />
                      <label className="relative inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <FolderInput className="h-3.5 w-3.5" />
                        Mover para pasta
                        <select
                          value={folder}
                          onChange={(event) => moveItem(item, event.target.value)}
                          aria-label={`Mover “${item.title}” para pasta`}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          <option value="">Sem pasta</option>
                          {folders.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option value={NEW_FOLDER}>+ Nova pasta…</option>
                        </select>
                      </label>
                      <Action onClick={() => toggleFavorite(item)} icon={Heart} label={item.is_favorite ? "Favorito" : "Favoritar"} active={item.is_favorite} />
                      <Action onClick={() => setPrimary(item)} icon={Star} label={item.is_primary ? "Remover principal" : "Marcar principal"} active={item.is_primary} />
                      <Action onClick={() => duplicateItem(item)} icon={BookCopy} label="Duplicar" />
                      <Action onClick={() => deleteItem(item)} icon={Trash2} label="Excluir" danger />
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </div>

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
                Pasta
                <input
                  value={draft.folder}
                  onChange={(event) => setDraft((current) => ({ ...current, folder: event.target.value }))}
                  list="meu-resibook-pastas"
                  placeholder="Sem pasta (digite para criar uma)"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 font-normal"
                />
                <datalist id="meu-resibook-pastas">
                  {folders.map((name) => <option key={name} value={name} />)}
                </datalist>
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


function FolderButton({ icon: Icon, label, count, active, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition lg:w-full ${
        active ? "bg-cyan-50 font-semibold text-cyan-900" : "font-medium text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-800" : "text-slate-400"}`} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className={`text-xs tabular-nums ${active ? "text-cyan-800" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}
