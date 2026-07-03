"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "./copy-button";
import { showToast } from "../lib/toast";
import { rankSearchResults } from "../lib/search";
import { BookCopy, Edit3, Plus, Trash2, X } from "lucide-react";

type PrescriptionTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  observacoes: string | null;
  source_file: string | null;
  review_status?: "rascunho" | "pendente" | "revisado" | null;
  model_version?: string | null;
  risk_level?: "baixo" | "moderado" | "alto" | null;
  reviewed_by?: string | null;
  last_reviewed_at?: string | null;
  publicos_especiais?: string | null;
  created_at: string;
};

type PrescriptionDraft = {
  medicamento: string;
  via: string;
  posologia: string;
  duracao: string;
  orientacoes: string;
};

type TemplateForm = {
  categoria: string;
  titulo: string;
  conteudo: string;
  observacoes: string;
  source_file: string;
  review_status: "rascunho" | "pendente" | "revisado";
  model_version: string;
  risk_level: "baixo" | "moderado" | "alto";
  reviewed_by: string;
  last_reviewed_at: string;
  publicos_especiais: string;
};

type Props = {
  templates: PrescriptionTemplate[];
  onUseTemplate: (draft: PrescriptionDraft) => void;
  initialQuery?: string;
};

const ADMIN_EMAIL = "igormoura@resibook.com";
const emptyForm: TemplateForm = {
  categoria: "",
  titulo: "",
  conteudo: "",
  observacoes: "",
  source_file: "",
  review_status: "rascunho",
  model_version: "",
  risk_level: "baixo",
  reviewed_by: "",
  last_reviewed_at: "",
  publicos_especiais: "",
};

function formatLabel(value?: string | null) {
  if (!value) return "Sem categoria";
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatReviewStatus(value?: PrescriptionTemplate["review_status"]) {
  if (value === "revisado") return "Revisado";
  if (value === "pendente") return "Pendente";
  return "Rascunho";
}

function reviewStatusClasses(value?: PrescriptionTemplate["review_status"]) {
  if (value === "revisado") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "pendente") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function formatRiskLevel(value?: PrescriptionTemplate["risk_level"]) {
  if (value === "alto") return "Alto risco";
  if (value === "moderado") return "Risco moderado";
  return "Baixo risco";
}

function riskLevelClasses(value?: PrescriptionTemplate["risk_level"]) {
  if (value === "alto") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value === "moderado") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function parseSpecialAudiences(value?: string | null) {
  return (value || "")
    .split(",")
    .map((item) => formatLabel(item))
    .filter(Boolean)
    .slice(0, 4);
}

function groupTemplates(items: PrescriptionTemplate[]) {
  return items.reduce<Record<string, PrescriptionTemplate[]>>((acc, item) => {
    const key = item.categoria || "Sem categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function parseTemplateToDraft(item: PrescriptionTemplate): PrescriptionDraft {
  const text = item.conteudo || "";
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const medicationLine =
    lines.find((line) => /^\d+\)/.test(line)) || item.titulo || "";

  const posologiaLine =
    lines.find((line) =>
      /tomar|aplicar|pingar|inalar|usar|fazer|diluir|colocar/i.test(line)
    ) || "";

  const viaLine =
    lines.find((line) => /^uso /i.test(line)) ||
    lines.find((line) => /via:/i.test(line)) ||
    "";

  const duracaoMatch =
    text.match(/por\s+\d+\s*(dias|dia|semanas|semana|meses|mês)/i) ||
    text.match(/dose única/i);

  const duracao = duracaoMatch ? duracaoMatch[0] : "";

  return {
    medicamento: medicationLine.replace(/^\d+\)\s*/, "").trim(),
    via: viaLine.replace(/^uso\s*/i, "").trim(),
    posologia: posologiaLine.trim(),
    duracao: duracao.trim(),
    orientacoes: item.observacoes || "",
  };
}

function toForm(item: PrescriptionTemplate): TemplateForm {
  return {
    categoria: item.categoria || "",
    titulo: item.titulo || "",
    conteudo: item.conteudo || "",
    observacoes: item.observacoes || "",
    source_file: item.source_file || "",
    review_status: item.review_status || "rascunho",
    model_version: item.model_version || "",
    risk_level: item.risk_level || "baixo",
    reviewed_by: item.reviewed_by || "",
    last_reviewed_at: item.last_reviewed_at
      ? item.last_reviewed_at.slice(0, 10)
      : "",
    publicos_especiais: item.publicos_especiais || "",
  };
}

function buildPayload(form: TemplateForm) {
  return {
    categoria: form.categoria.trim() || null,
    titulo: form.titulo.trim(),
    conteudo: form.conteudo.trim(),
    observacoes: form.observacoes.trim() || null,
    source_file: form.source_file.trim() || null,
    review_status: form.review_status,
    model_version: form.model_version.trim() || null,
    risk_level: form.risk_level,
    reviewed_by: form.reviewed_by.trim() || null,
    last_reviewed_at: form.last_reviewed_at
      ? new Date(`${form.last_reviewed_at}T12:00:00`).toISOString()
      : null,
    publicos_especiais: form.publicos_especiais.trim() || null,
  };
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

export default function PrescriptionTemplatesLive({
  templates,
  onUseTemplate,
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [items, setItems] = useState<PrescriptionTemplate[]>(templates);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [reviewFilter, setReviewFilter] = useState<
    "" | "revisado" | "pendente" | "rascunho"
  >("");
  const [riskFilter, setRiskFilter] = useState<"" | "alto" | "moderado" | "baixo">(
    ""
  );
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PrescriptionTemplate | null>(
    null
  );
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setItems(templates);
  }, [templates]);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.trim().toLowerCase() || "";
      const role = data.session?.user?.app_metadata?.role;
      setIsAdmin(role === "admin" || email === ADMIN_EMAIL);
      setCurrentUserId(data.session?.user?.id || "");
    }

    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q") || initialQuery || "";
    const urlCategory = params.get("categoria") || "";
    const urlReview =
      (params.get("revisao") as "" | "revisado" | "pendente" | "rascunho") ||
      "";
    const urlRisk =
      (params.get("risco") as "" | "alto" | "moderado" | "baixo") || "";

    setQuery(urlQuery);
    setSelectedCategory(urlCategory);
    setReviewFilter(urlReview);
    setRiskFilter(urlRisk);
    setHydratedFromUrl(true);
  }, [initialQuery]);

  useEffect(() => {
    if (!hydratedFromUrl) return;

    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory) params.set("categoria", selectedCategory);
    if (reviewFilter) params.set("revisao", reviewFilter);
    if (riskFilter) params.set("risco", riskFilter);

    const next = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(next, { scroll: false });
  }, [
    query,
    selectedCategory,
    reviewFilter,
    riskFilter,
    pathname,
    router,
    hydratedFromUrl,
  ]);

  useEffect(() => {
    if (!currentUserId) {
      setFavoriteIds([]);
      return;
    }

    async function loadFavorites() {
      const { data, error } = await supabase
        .from("user_content_favorites")
        .select("item_id")
        .eq("user_id", currentUserId)
        .eq("item_type", "prescription")
        .eq("source", "global");

      if (!error) {
        setFavoriteIds(
          (data || [])
            .map((row) => Number(row.item_id))
            .filter((id) => Number.isFinite(id))
        );
      }
    }

    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  function updateForm<K extends keyof TemplateForm>(
    key: K,
    value: TemplateForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function toggleFavorite(id: number, title: string) {
    if (!currentUserId) return;
    const isAlreadyFavorite = favoriteIds.includes(id);
    const response = isAlreadyFavorite
      ? await supabase
          .from("user_content_favorites")
          .delete()
          .eq("user_id", currentUserId)
          .eq("item_type", "prescription")
          .eq("item_id", String(id))
          .eq("source", "global")
      : await supabase.from("user_content_favorites").upsert({
          user_id: currentUserId,
          item_type: "prescription",
          item_id: String(id),
          source: "global",
        });

    if (response.error) {
      showToast({ title: "Erro ao atualizar favorito", description: response.error.message, variant: "error" });
      return;
    }

    setFavoriteIds((current) => isAlreadyFavorite
      ? current.filter((item) => item !== id)
      : [id, ...current.filter((item) => item !== id)]
    );

    showToast({
      title: isAlreadyFavorite ? "Favorito removido" : "Favorito salvo",
      description: title,
      variant: "success",
    });
  }

  function openCreateDrawer() {
    if (!isAdmin) {
      showToast({
        title: "Acesso restrito",
        description: "Apenas o administrador pode criar modelos.",
        variant: "error",
      });
      return;
    }

    setEditingItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEditDrawer(item: PrescriptionTemplate) {
    if (!isAdmin) {
      showToast({
        title: "Acesso restrito",
        description: "Apenas o administrador pode editar modelos.",
        variant: "error",
      });
      return;
    }

    setEditingItem(item);
    setForm(toForm(item));
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!isAdmin) {
      showToast({
        title: "Acesso restrito",
        description: "Apenas o administrador pode salvar modelos.",
        variant: "error",
      });
      return;
    }

    if (!form.titulo.trim() || !form.conteudo.trim()) {
      showToast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos título e conteúdo.",
        variant: "error",
      });
      return;
    }

    setSaving(true);

    const payload = buildPayload(form);

    const response = editingItem
      ? await supabase
          .from("prescription_templates")
          .update(payload)
          .eq("id", editingItem.id)
          .select(
            "id, categoria, titulo, conteudo, observacoes, source_file, review_status, model_version, risk_level, reviewed_by, last_reviewed_at, publicos_especiais, created_at"
          )
          .single()
      : await supabase
          .from("prescription_templates")
          .insert(payload)
          .select(
            "id, categoria, titulo, conteudo, observacoes, source_file, review_status, model_version, risk_level, reviewed_by, last_reviewed_at, publicos_especiais, created_at"
          )
          .single();

    if (response.error) {
      showToast({
        title: "Erro ao salvar modelo",
        description: response.error.message,
        variant: "error",
      });
      setSaving(false);
      return;
    }

    const saved = response.data as PrescriptionTemplate;

    setItems((current) => {
      const next = editingItem
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];

      return next.sort((a, b) => {
        const byCategoria = (a.categoria || "").localeCompare(
          b.categoria || "",
          "pt-BR"
        );

        if (byCategoria !== 0) return byCategoria;

        return (a.titulo || "").localeCompare(b.titulo || "", "pt-BR");
      });
    });

    showToast({
      title: editingItem ? "Modelo atualizado" : "Modelo criado",
      description: saved.titulo,
      variant: "success",
    });

    setSaving(false);
    closeDrawer();
  }

  async function handleDelete(item: PrescriptionTemplate) {
    if (!isAdmin) {
      showToast({
        title: "Acesso restrito",
        description: "Apenas o administrador pode apagar modelos.",
        variant: "error",
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar "${item.titulo}"?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);

    const { error } = await supabase
      .from("prescription_templates")
      .delete()
      .eq("id", item.id);

    if (error) {
      showToast({
        title: "Erro ao apagar modelo",
        description: error.message,
        variant: "error",
      });
      setDeletingId(null);
      return;
    }

    setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    setFavoriteIds((current) => current.filter((id) => id !== item.id));

    showToast({
      title: "Modelo apagado",
      description: item.titulo,
      variant: "success",
    });

    setDeletingId(null);
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.categoria || "Sem categoria"))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [items]);

  const filteredTemplates = useMemo(() => {
    const filteredBySelects = items.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";
      const matchesCategory =
        !selectedCategory || itemCategory === selectedCategory;
      const matchesReview =
        !reviewFilter || (item.review_status || "rascunho") === reviewFilter;
      const matchesRisk =
        !riskFilter || (item.risk_level || "baixo") === riskFilter;

      return matchesCategory && matchesReview && matchesRisk;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.titulo, weight: 10 },
      { value: item.categoria, weight: 5 },
      { value: item.observacoes, weight: 4 },
      { value: item.publicos_especiais, weight: 3 },
      { value: item.conteudo, weight: 2 },
      { value: item.source_file, weight: 1 },
    ]);
  }, [items, query, selectedCategory, reviewFilter, riskFilter]);

  const favorites = useMemo(() => {
    const map = new Map(items.map((item) => [item.id, item]));

    return favoriteIds
      .map((id) => map.get(id))
      .filter(Boolean) as PrescriptionTemplate[];
  }, [items, favoriteIds]);

  const filteredFavorites = useMemo(() => {
    const filteredBySelects = favorites.filter((item) => {
      const itemCategory = item.categoria || "Sem categoria";
      const matchesCategory =
        !selectedCategory || itemCategory === selectedCategory;
      const matchesReview =
        !reviewFilter || (item.review_status || "rascunho") === reviewFilter;
      const matchesRisk =
        !riskFilter || (item.risk_level || "baixo") === riskFilter;

      return matchesCategory && matchesReview && matchesRisk;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.titulo, weight: 10 },
      { value: item.categoria, weight: 5 },
      { value: item.observacoes, weight: 4 },
      { value: item.publicos_especiais, weight: 3 },
      { value: item.conteudo, weight: 2 },
      { value: item.source_file, weight: 1 },
    ]);
  }, [favorites, query, selectedCategory, reviewFilter, riskFilter]);

  const groupedTemplates = useMemo(
    () => groupTemplates(filteredTemplates),
    [filteredTemplates]
  );

  const hasFilters = Boolean(query || selectedCategory || reviewFilter || riskFilter);

  async function registerRecent(item: PrescriptionTemplate) {
    if (!currentUserId) return;
    await supabase.from("user_content_recents").upsert(
      {
        user_id: currentUserId,
        item_type: "prescription",
        item_id: String(item.id),
        source: "global",
        accessed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_type,item_id,source" }
    );
  }

  async function duplicateToPersonal(item: PrescriptionTemplate) {
    if (!currentUserId) return;
    const { error } = await supabase.from("personal_content_items").insert({
      user_id: currentUserId,
      item_type: "prescription",
      title: item.titulo,
      content: item.conteudo,
      source_global_id: String(item.id),
      metadata: {
        categoria: item.categoria,
        observacoes: item.observacoes,
        arquivo_origem: item.source_file,
      },
    });

    if (error) {
      showToast({ title: "Erro ao duplicar", description: error.message, variant: "error" });
      return;
    }
    await registerRecent(item);
    showToast({ title: "Salvo no Meu Resibook", description: item.titulo, variant: "success" });
  }

  function handleUse(item: PrescriptionTemplate) {
    onUseTemplate(parseTemplateToDraft(item));
    void registerRecent(item);

    showToast({
      title: "Modelo aplicado ao formulário",
      description: item.titulo,
      variant: "success",
    });
  }

  function TemplateCard(item: PrescriptionTemplate, compact = false) {
    const isFavorite = favoriteIds.includes(item.id);
    const isDeleting = deletingId === item.id;

    return (
      <article
        key={item.id}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            Banco Resibook
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {formatLabel(item.categoria)}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${reviewStatusClasses(
              item.review_status
            )}`}
          >
            {formatReviewStatus(item.review_status)}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskLevelClasses(
              item.risk_level
            )}`}
          >
            {formatRiskLevel(item.risk_level)}
          </span>

          {item.model_version ? (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {item.model_version}
            </span>
          ) : null}

          {item.source_file ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {item.source_file}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {formatLabel(item.titulo)}
            </h3>

            {item.observacoes ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.observacoes}
              </p>
            ) : null}

            {item.reviewed_by ||
            item.last_reviewed_at ||
            item.publicos_especiais ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.reviewed_by ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                    Revisado por {item.reviewed_by}
                  </span>
                ) : null}

                {item.last_reviewed_at ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                    Revisão{" "}
                    {new Intl.DateTimeFormat("pt-BR").format(
                      new Date(item.last_reviewed_at)
                    )}
                  </span>
                ) : null}

                {parseSpecialAudiences(item.publicos_especiais).map(
                  (audience) => (
                    <span
                      key={`${item.id}-${audience}`}
                      className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700"
                    >
                      {audience}
                    </span>
                  )
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(item.id, item.titulo)}
              disabled={isDeleting}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isFavorite
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isFavorite ? "★ Favorito" : "☆ Favoritar"}
            </button>

            <button
              type="button"
              onClick={() => handleUse(item)}
              disabled={isDeleting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Usar no formulário
            </button>

            <CopyButton text={item.conteudo} />

            <button
              type="button"
              onClick={() => duplicateToPersonal(item)}
              disabled={isDeleting || !currentUserId}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:opacity-50"
            >
              <BookCopy className="h-4 w-4" />
              Duplicar para Meu Resibook
            </button>

            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => openEditDrawer(item)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Apagando..." : "Apagar"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
          <pre
            className={`whitespace-pre-wrap font-mono leading-7 text-slate-100 ${
              compact ? "text-[14px]" : "text-[15px]"
            }`}
          >
            {item.conteudo}
          </pre>
        </div>
      </article>
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Biblioteca de plantão
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Modelos prontos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca instantânea, favoritos e uso direto no formulário.
            </p>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Novo modelo
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_220px_auto]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelo de prescrição..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatLabel(category)}
              </option>
            ))}
          </select>

          <select
            value={reviewFilter}
            onChange={(e) =>
              setReviewFilter(
                e.target.value as "" | "revisado" | "pendente" | "rascunho"
              )
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Todas as revisões</option>
            <option value="revisado">Só revisados</option>
            <option value="pendente">Pendentes</option>
            <option value="rascunho">Rascunhos</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(
                e.target.value as "" | "alto" | "moderado" | "baixo"
              )
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Todos os riscos</option>
            <option value="alto">Alto risco</option>
            <option value="moderado">Moderado</option>
            <option value="baixo">Baixo</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("");
              setReviewFilter("");
              setRiskFilter("");
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {hasFilters ? "Limpar" : "Filtros"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredTemplates.length} de {items.length} modelos
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {favorites.length} favoritos
            </span>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {
                items.filter(
                  (item) => (item.review_status || "rascunho") === "revisado"
                ).length
              }{" "}
              revisados
            </span>

            {selectedCategory ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {formatLabel(selectedCategory)}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {filteredFavorites.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
                Favoritos
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Mais usados no plantão
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredFavorites.length} modelo
                {filteredFavorites.length > 1 ? "s" : ""} favorito
                {filteredFavorites.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredFavorites.map((item) => TemplateCard(item, true))}
          </div>
        </section>
      ) : null}

      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Nenhum modelo encontrado para esse filtro.
        </div>
      ) : (
        Object.entries(groupedTemplates).map(([categoria, categoryItems]) => (
          <div key={categoria} className="space-y-4">
            <div className="flex flex-col gap-2 px-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                  {formatLabel(categoria)}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {formatLabel(categoria)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {categoryItems.length} modelo
                  {categoryItems.length > 1 ? "s" : ""} nesta categoria
                </p>
              </div>

              <div className="self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {categoryItems.length}{" "}
                {categoryItems.length === 1 ? "item" : "itens"}
              </div>
            </div>

            <div className="grid gap-4">
              {categoryItems.map((item) => TemplateCard(item))}
            </div>
          </div>
        ))
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar edição"
          />

          <div className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Modelos de plantão
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {editingItem ? "Editar modelo" : "Novo modelo"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Apenas o administrador pode alterar a biblioteca compartilhada.
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
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Categoria"
                  value={form.categoria}
                  onChange={(value) => updateForm("categoria", value)}
                  placeholder="Ex.: Analgesia"
                />

                <InputField
                  label="Título"
                  value={form.titulo}
                  onChange={(value) => updateForm("titulo", value)}
                  placeholder="Ex.: Dipirona EV"
                />

                <InputField
                  label="Versão"
                  value={form.model_version}
                  onChange={(value) => updateForm("model_version", value)}
                  placeholder="Ex.: v1.0"
                />

                <InputField
                  label="Arquivo de origem"
                  value={form.source_file}
                  onChange={(value) => updateForm("source_file", value)}
                  placeholder="Ex.: plantao.pdf"
                />

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status de revisão
                  </label>

                  <select
                    value={form.review_status}
                    onChange={(event) =>
                      updateForm(
                        "review_status",
                        event.target.value as TemplateForm["review_status"]
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="pendente">Pendente</option>
                    <option value="revisado">Revisado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Risco
                  </label>

                  <select
                    value={form.risk_level}
                    onChange={(event) =>
                      updateForm(
                        "risk_level",
                        event.target.value as TemplateForm["risk_level"]
                      )
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="baixo">Baixo</option>
                    <option value="moderado">Moderado</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>

                <InputField
                  label="Revisado por"
                  value={form.reviewed_by}
                  onChange={(value) => updateForm("reviewed_by", value)}
                  placeholder="Ex.: Dr. Igor"
                />

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Data da revisão
                  </label>

                  <input
                    type="date"
                    value={form.last_reviewed_at}
                    onChange={(event) =>
                      updateForm("last_reviewed_at", event.target.value)
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <InputField
                  label="Públicos especiais"
                  value={form.publicos_especiais}
                  onChange={(value) => updateForm("publicos_especiais", value)}
                  placeholder="Ex.: gestante, idoso, DRC"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Observações
                </label>

                <textarea
                  value={form.observacoes}
                  onChange={(event) =>
                    updateForm("observacoes", event.target.value)
                  }
                  rows={4}
                  placeholder="Observações, alertas, contraindicações ou orientações rápidas..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Conteúdo da prescrição
                </label>

                <textarea
                  value={form.conteudo}
                  onChange={(event) => updateForm("conteudo", event.target.value)}
                  rows={12}
                  placeholder="Digite o modelo de prescrição..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
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
    </section>
  );
}

