"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import CopyButton from "../../components/copy-button";
import { rankSearchResults } from "@/lib/search";
import {
  Edit3,
  FileText,
  FlaskConical,
  Layers3,
  Lock,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

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

function formatDisplay(value?: string | null, fallback = "Não informado") {
  const clean = value?.trim();
  if (!clean) return fallback;

  return clean.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatTemplateText(item: ExamTemplate) {
  return (item.conteudo || "").trim();
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
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
    const filteredBySelects = items.filter((item) => {
      const matchesCategoria = !categoria || item.categoria === categoria;
      const matchesSexo = !sexo || item.sexo === sexo;

      return matchesCategoria && matchesSexo;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.titulo, weight: 10 },
      { value: item.categoria, weight: 5 },
      { value: item.sexo, weight: 3 },
      { value: item.conteudo, weight: 2 },
      { value: item.arquivo_origem || item.source_file, weight: 1 },
    ]);
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
        title="Exames / Evolução"
        description="Modelos clínicos para solicitação de exames, registro de evolução e apoio rápido à rotina assistencial."
        badges={[
          { label: "Exames e evolução", tone: "blue" },
          { label: "Biblioteca clínica", tone: "slate" },
          {
            label: isAdmin ? "Gerenciamento liberado" : "Leitura e cópia",
            tone: isAdmin ? "emerald" : "cyan",
          },
        ]}
        metrics={[
          {
            label: "Modelos",
            value: loading ? "..." : items.length,
          },
          {
            label: "Exibindo",
            value: filtered.length,
          },
          {
            label: "Categorias",
            value: categorias.length,
          },
        ]}
        error={error}
        success={success}
        notice={
          !isAdmin ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-500" />
                {isGuest
                  ? "Convidado: leitura e cópia liberadas nos módulos permitidos."
                  : "Somente o administrador pode criar, editar ou apagar modelos."}
              </div>
            </div>
          ) : null
        }
        actions={
          isAdmin ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Novo modelo
            </button>
          ) : null
        }
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Busca clínica
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título, categoria, conteúdo ou origem..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:w-[720px]">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Categoria
                </label>

                <select
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Todas</option>
                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {formatDisplay(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Sexo
                </label>

                <select
                  value={sexo}
                  onChange={(event) => setSexo(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Todos</option>
                  {sexos.map((item) => (
                    <option key={item} value={item}>
                      {formatDisplay(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-transparent">
                  Ações
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategoria("");
                    setSexo("");
                  }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {hasFilters ? "Limpar filtros" : "Filtros"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModulePageHeader>

      {loading || checkingUser ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm font-medium text-slate-600 shadow-sm">
          Carregando exames e evoluções...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhum modelo encontrado
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Ajuste a busca ou limpe os filtros para visualizar a biblioteca.
          </p>
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Biblioteca
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Modelos disponíveis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} modelo{filtered.length > 1 ? "s" : ""} em
                exibição.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasFilters ? (
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  Filtro ativo
                </span>
              ) : null}

              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Cópia rápida
              </span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white md:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        <Layers3 className="h-3.5 w-3.5 text-slate-500" />
                        {formatDisplay(item.categoria, "Sem categoria")}
                      </span>

                      {item.sexo ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {formatDisplay(item.sexo)}
                        </span>
                      ) : null}

                      {item.arquivo_origem || item.source_file ? (
                        <span className="inline-flex max-w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                          <span className="truncate">
                            {formatDisplay(
                              item.arquivo_origem || item.source_file,
                              "Origem não informada"
                            )}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-950">
                      {formatDisplay(item.titulo, "Sem título")}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    <CopyButton text={formatTemplateText(item)} />
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <FileText className="h-3.5 w-3.5" />
                    Conteúdo do modelo
                  </div>

                  <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap pr-2 text-sm leading-7 text-slate-700">
                    {item.conteudo || "Sem conteúdo"}
                  </pre>
                </div>

                {isAdmin ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditDrawer(item)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === item.id ? "Apagando..." : "Apagar"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                    Somente leitura: use o botão de copiar para reutilizar este
                    modelo.
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {drawerOpen && isAdmin ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Biblioteca compartilhada
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {editingItem ? "Editar modelo" : "Novo modelo"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar os modelos de exames e
                  evolução.
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
                <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                    <FlaskConical className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Dados do modelo
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Preencha categoria, título, origem e conteúdo.
                    </p>
                  </div>
                </div>

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

                <div className="mt-4">
                  <TextAreaField
                    label="Conteúdo"
                    value={form.conteudo}
                    onChange={(value) => updateForm("conteudo", value)}
                    placeholder="Digite o conteúdo do modelo..."
                    rows={10}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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