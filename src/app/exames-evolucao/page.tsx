"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import CopyButton from "../../components/copy-button";
import { Edit3, Lock, Plus, Search, Trash2, X } from "lucide-react";

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string | null;
  sexo: string | null;
  arquivo_origem: string | null;
  source_file?: string | null;
  conteudo: string | null;
  created_at?: string | null;
};

type FormState = {
  categoria: string;
  titulo: string;
  sexo: string;
  arquivo_origem: string;
  conteudo: string;
};

const GUEST_EMAIL = "convidado@resibook.com";
const ADMIN_EMAIL = "igormoura@resibook.com";

const emptyForm: FormState = {
  categoria: "",
  titulo: "",
  sexo: "",
  arquivo_origem: "",
  conteudo: "",
};

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatTemplateText(item: ExamTemplate) {
  return [
    item.titulo || "Exame / evolução",
    item.categoria ? `Categoria: ${item.categoria}` : "",
    item.sexo ? `Sexo: ${item.sexo}` : "",
    item.arquivo_origem || item.source_file
      ? `Origem: ${item.arquivo_origem || item.source_file}`
      : "",
    "",
    item.conteudo || "",
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
}

function buildPayload(form: FormState) {
  return {
    categoria: form.categoria.trim() || null,
    titulo: form.titulo.trim() || null,
    sexo: form.sexo.trim() || null,
    arquivo_origem: form.arquivo_origem.trim() || null,
    conteudo: form.conteudo.trim() || null,
  };
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
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
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-50"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-50"
      />
    </div>
  );
}

export default function ExamesEvolucaoPage() {
  const supabase = createClient();

  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const [items, setItems] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sexo, setSexo] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamTemplate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function checkUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setIsGuest(false);
      setIsAdmin(false);
      setCheckingUser(false);
      setError(error.message);
      return;
    }

    const email = data.session?.user?.email?.trim().toLowerCase() || "";

    setIsGuest(email === GUEST_EMAIL);
    setIsAdmin(email === ADMIN_EMAIL);
    setCheckingUser(false);
  }

  async function loadItems() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("exam_templates")
      .select(
        "id, categoria, titulo, sexo, arquivo_origem, source_file, conteudo, created_at"
      )
      .order("categoria", { ascending: true })
      .order("titulo", { ascending: true });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data as ExamTemplate[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    checkUser();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categorias = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.categoria).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [items]);

  const sexos = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.sexo).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [items]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return items.filter((item) => {
      const matchesQuery =
        !q ||
        normalize(item.titulo).includes(q) ||
        normalize(item.categoria).includes(q) ||
        normalize(item.sexo).includes(q) ||
        normalize(item.arquivo_origem || item.source_file).includes(q) ||
        normalize(item.conteudo).includes(q);

      const matchesCategoria = !categoria || item.categoria === categoria;
      const matchesSexo = !sexo || item.sexo === sexo;

      return matchesQuery && matchesCategoria && matchesSexo;
    });
  }, [items, query, categoria, sexo]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateDrawer() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar modelos em exam_templates.");
      return;
    }

    setEditingItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditDrawer(item: ExamTemplate) {
    if (!isAdmin) {
      setError("Apenas o administrador pode editar modelos em exam_templates.");
      return;
    }

    setEditingItem(item);
    setForm({
      categoria: item.categoria || "",
      titulo: item.titulo || "",
      sexo: item.sexo || "",
      arquivo_origem: item.arquivo_origem || item.source_file || "",
      conteudo: item.conteudo || "",
    });
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar ou editar exames.");
      return;
    }

    if (!form.titulo.trim() && !form.conteudo.trim()) {
      setError("Preencha pelo menos título ou conteúdo.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = buildPayload(form);

    const response = editingItem
      ? await supabase
          .from("exam_templates")
          .update(payload)
          .eq("id", editingItem.id)
          .select(
            "id, categoria, titulo, sexo, arquivo_origem, source_file, conteudo, created_at"
          )
          .single()
      : await supabase
          .from("exam_templates")
          .insert(payload)
          .select(
            "id, categoria, titulo, sexo, arquivo_origem, source_file, conteudo, created_at"
          )
          .single();

    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      const saved = response.data as ExamTemplate;

      if (editingItem) {
        setItems((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
        setSuccess("Modelo atualizado com sucesso.");
      } else {
        setItems((current) => {
          const next = [saved, ...current];
          return next.sort((a, b) => {
            const categoriaA = a.categoria || "";
            const categoriaB = b.categoria || "";
            const byCategoria = categoriaA.localeCompare(categoriaB, "pt-BR");
            if (byCategoria !== 0) return byCategoria;
            return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
          });
        });
        setSuccess("Modelo criado com sucesso.");
      }

      closeDrawer();
    }

    setSaving(false);
  }

  async function handleDelete(item: ExamTemplate) {
    if (!isAdmin) {
      setError("Apenas o administrador pode apagar modelos em exam_templates.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar "${item.titulo || "este modelo"}"?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("exam_templates")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
    } else {
      setItems((current) =>
        current.filter((currentItem) => currentItem.id !== item.id)
      );
      setSuccess("Modelo apagado com sucesso.");
    }

    setDeletingId(null);
  }

  const hasFilters = Boolean(query || categoria || sexo);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Módulo assistencial"
        title="Exames e evolução"
        description="Biblioteca de blocos clínicos para consulta, cópia rápida e uso como apoio em evolução ou solicitação de exames."
        badges={[
          { label: "Exames / Evolução", tone: "blue" },
          { label: "Biblioteca compartilhada", tone: "slate" },
          {
            label: isAdmin ? "Admin pode gerenciar" : "Consulta e cópia liberadas",
            tone: isAdmin ? "emerald" : "cyan",
          },
        ]}
        metrics={[
          {
            label: "Total carregado",
            value: loading ? "Carregando..." : items.length,
          },
          {
            label: "Exibindo",
            value: filtered.length,
          },
        ]}
        error={error}
        success={success}
        notice={
          !isAdmin ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {isGuest
                  ? "Convidado: leitura e cópia liberadas."
                  : "Somente o administrador gerencia a biblioteca."}
              </div>
            </div>
          ) : null
        }
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Novo modelo
            </button>
          ) : null
        }
      >
        <div className="space-y-4 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 md:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, categoria, conteúdo, origem..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todas as categorias —</option>
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sexo}
              onChange={(event) => setSexo(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todos os sexos —</option>
              {sexos.map((item) => (
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
                setSexo("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              {hasFilters ? "Limpar filtros" : "Filtros"}
            </button>
          </div>
        </div>
      </ModulePageHeader>

      {loading || checkingUser ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando exames e evoluções...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum modelo encontrado.
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-slate-200 bg-slate-50/75 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {item.categoria || "Sem categoria"}
                      </span>

                      {item.sexo ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {item.sexo}
                        </span>
                      ) : null}

                      {item.arquivo_origem || item.source_file ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {item.arquivo_origem || item.source_file}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {item.titulo || "Sem título"}
                    </h3>
                  </div>

                  <CopyButton text={formatTemplateText(item)} />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {item.conteudo || "Sem conteúdo"}
                  </pre>
                </div>

                {isAdmin ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditDrawer(item)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === item.id ? "Apagando..." : "Apagar"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                    Somente leitura: use o botão de copiar para reutilizar este modelo.
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {drawerOpen && isAdmin ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingItem ? "Editar modelo" : "Novo modelo"}
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
                <InputField
                  label="Categoria"
                  value={form.categoria}
                  onChange={(value) => updateForm("categoria", value)}
                  placeholder="Ex.: Exames laboratoriais"
                />

                <InputField
                  label="Título"
                  value={form.titulo}
                  onChange={(value) => updateForm("titulo", value)}
                  placeholder="Ex.: Check-up inicial"
                />

                <InputField
                  label="Sexo"
                  value={form.sexo}
                  onChange={(value) => updateForm("sexo", value)}
                  placeholder="Ex.: Todos, Feminino, Masculino"
                />

                <InputField
                  label="Arquivo de origem"
                  value={form.arquivo_origem}
                  onChange={(value) => updateForm("arquivo_origem", value)}
                  placeholder="Ex.: protocolo.pdf"
                />
              </div>

              <TextAreaField
                label="Conteúdo"
                value={form.conteudo}
                onChange={(value) => updateForm("conteudo", value)}
                placeholder="Digite o conteúdo do modelo..."
                rows={10}
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingItem
                    ? "Salvar edição"
                    : "Criar modelo"}
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
