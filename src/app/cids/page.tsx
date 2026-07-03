"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isResibookAdmin } from "@/lib/auth-role";
import CopyButton from "../../components/copy-button";
import ModulePageHeader from "../../components/module-page-header";
import { rankSearchResults } from "@/lib/search";
import {
  CLINICAL_CASE_SESSION_EVENT,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  Link2,
  Lock,
  Plus,
  X,
} from "lucide-react";

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

const GUEST_EMAIL = "convidado@resibook.com";
const RECENT_CIDS_KEY = "resibook-recent-cids-v1";

function recentCidsKey(userId: string) {
  return `${RECENT_CIDS_KEY}:${userId}`;
}

const initialForm: CidForm = {
  codigo: "",
  descricao: "",
  grupo: "",
  area: "",
  prioridade: "",
  tags: "",
};

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

function buildCidText(item: CidItem) {
  return [
    `CID: ${item.codigo}`,
    `Descrição: ${item.descricao}`,
    item.grupo ? `Grupo: ${item.grupo}` : "",
    item.area ? `Área: ${item.area}` : "",
    item.prioridade != null ? `Prioridade: ${item.prioridade}` : "",
    item.tags ? `Tags: ${item.tags}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPayload(form: CidForm) {
  return {
    codigo: form.codigo.trim(),
    descricao: form.descricao.trim(),
    grupo: form.grupo.trim() || null,
    area: form.area.trim() || null,
    prioridade: form.prioridade ? Number(form.prioridade) : null,
    tags: form.tags.trim() || null,
  };
}

export default function CidsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const [allCids, setAllCids] = useState<CidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [query, setQuery] = useState("");
  const [grupo, setGrupo] = useState("");
  const [area, setArea] = useState("");

  const [form, setForm] = useState<CidForm>(initialForm);
  const [editingItem, setEditingItem] = useState<CidItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const urlQuery = searchParams.get("q") || searchParams.get("busca") || "";

    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

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
    setIsAdmin(isResibookAdmin(data.session?.user));
    setCurrentUserId(data.session?.user?.id || "");
    setCheckingUser(false);
  }

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("cids")
      .select("id, codigo, descricao, grupo, area, prioridade, tags")
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
    checkUser();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function syncActiveCase() {
      setActiveCase(loadClinicalCaseSession());
    }

    syncActiveCase();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, syncActiveCase);

    return () => {
      window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, syncActiveCase);
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setRecentIds([]);
      return;
    }

    try {
      const stored = JSON.parse(
        window.localStorage.getItem(recentCidsKey(currentUserId)) || "[]"
      ) as number[];
      setRecentIds(stored.filter((value) => Number.isFinite(value)).slice(0, 6));
    } catch {
      setRecentIds([]);
    }
  }, [currentUserId]);

  const grupos = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.grupo).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [allCids]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(allCids.map((item) => item.area).filter(Boolean))
    ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR")) as string[];
  }, [allCids]);

  const filtered = useMemo(() => {
    const filteredBySelects = allCids.filter((item) => {
      const matchesGrupo = !grupo || item.grupo === grupo;
      const matchesArea = !area || item.area === area;

      return matchesGrupo && matchesArea;
    });

    return rankSearchResults(filteredBySelects, query, (item) => [
      { value: item.codigo, weight: 12 },
      { value: item.descricao, weight: 8 },
      { value: item.tags || "", weight: 5 },
      { value: item.grupo || "", weight: 2 },
      { value: item.area || "", weight: 2 },
    ]);
  }, [allCids, query, grupo, area]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, CidItem[]>>((acc, item) => {
      const key = item.grupo || "Sem grupo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const recentCids = useMemo(
    () =>
      recentIds
        .map((id) => allCids.find((item) => item.id === id))
        .filter((item): item is CidItem => Boolean(item)),
    [allCids, recentIds]
  );

  function rememberCid(id: number) {
    if (!currentUserId) return;
    setRecentIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 6);
      window.localStorage.setItem(
        recentCidsKey(currentUserId),
        JSON.stringify(next)
      );
      return next;
    });
  }

  async function copyCidCode(item: CidItem) {
    await navigator.clipboard.writeText(item.codigo);
    rememberCid(item.id);
    setSuccess(`CID ${item.codigo} copiado.`);
    setError("");
  }

  function attachCidToCase(item: CidItem) {
    if (!activeCase) {
      setError("Inicie um Caso rápido antes de vincular o CID.");
      return;
    }

    const nextCase: ClinicalCaseSession = {
      ...activeCase,
      selectedCid: {
        codigo: item.codigo,
        descricao: item.descricao,
      },
      updatedAt: new Date().toISOString(),
    };

    saveClinicalCaseSession(nextCase);
    setActiveCase(nextCase);
    rememberCid(item.id);
    setSuccess(`CID ${item.codigo} vinculado ao caso ativo.`);
    setError("");
  }

  function resetForm() {
    setForm(initialForm);
    setEditingItem(null);
  }

  function openCreateDrawer() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar CIDs.");
      return;
    }

    resetForm();
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function openEditDrawer(item: CidItem) {
    if (!isAdmin) {
      setError("Apenas o administrador pode editar CIDs.");
      return;
    }

    setEditingItem(item);
    setForm({
      codigo: item.codigo || "",
      descricao: item.descricao || "",
      grupo: item.grupo || "",
      area: item.area || "",
      prioridade: item.prioridade != null ? String(item.prioridade) : "",
      tags: item.tags || "",
    });
    setDrawerOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  async function handleSave() {
    if (!isAdmin) {
      setError("Apenas o administrador pode criar ou editar CIDs.");
      return;
    }

    if (!form.codigo.trim() || !form.descricao.trim()) {
      setError("Código e descrição são obrigatórios.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = buildPayload(form);

    const result = editingItem
      ? await supabase
          .from("cids")
          .update(payload)
          .eq("id", editingItem.id)
          .select("id, codigo, descricao, grupo, area, prioridade, tags")
          .single()
      : await supabase
          .from("cids")
          .insert(payload)
          .select("id, codigo, descricao, grupo, area, prioridade, tags")
          .single();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      const saved = result.data as CidItem;

      setAllCids((current) =>
        (editingItem
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
        ).sort((a, b) => {
          const grupoA = a.grupo || "";
          const grupoB = b.grupo || "";
          const byGroup = grupoA.localeCompare(grupoB, "pt-BR");
          if (byGroup !== 0) return byGroup;
          return a.codigo.localeCompare(b.codigo, "pt-BR");
        })
      );

      setSuccess(
        editingItem ? "CID atualizado com sucesso." : "CID criado com sucesso."
      );
      closeDrawer();
    }

    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!isAdmin) {
      setError("Apenas o administrador pode apagar CIDs.");
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja apagar este CID?");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("cids").delete().eq("id", id);

    if (error) {
      setError(error.message);
      setDeletingId(null);
      return;
    }

    if (editingItem?.id === id) {
      closeDrawer();
    }

    setAllCids((current) => current.filter((item) => item.id !== id));
    setSuccess("CID apagado com sucesso.");
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Referência clínica"
        title="CIDs"
        description="Consulta de CIDs com busca, filtros e cópia rápida. A biblioteca é compartilhada para todos os autenticados; somente o administrador pode criar, editar ou apagar."
        badges={[
          { label: "Referência rápida", tone: "cyan" },
          { label: "Biblioteca compartilhada", tone: "slate" },
          {
            label: isAdmin ? "Admin pode gerenciar" : "Somente leitura",
            tone: isAdmin ? "emerald" : "amber",
          },
        ]}
        metrics={[
          {
            label: "Total carregado do banco",
            value: loading ? "Carregando..." : allCids.length,
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
                  ? "Convidado: leitura e cópia liberadas. Edição bloqueada."
                  : "Usuário comum: consulta liberada. Apenas o administrador pode gerenciar CIDs."}
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
              Novo CID
            </button>
          ) : null
        }
      />

      {activeCase || recentCids.length > 0 ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          {activeCase ? (
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">
                  Caso ativo
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  {activeCase.complaint}
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                {activeCase.selectedCid?.codigo
                  ? `CID atual: ${activeCase.selectedCid.codigo} - ${activeCase.selectedCid.descricao}`
                  : "Nenhum CID vinculado ao atendimento."}
              </p>
            </div>
          ) : null}

          {recentCids.length > 0 ? (
            <div className={activeCase ? "pt-5" : ""}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock3 className="h-4 w-4" />
                CIDs recentes neste navegador
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentCids.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => attachCidToCase(item)}
                    disabled={!activeCase}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-default disabled:opacity-70"
                    title={activeCase ? "Vincular ao caso ativo" : item.descricao}
                  >
                    <span className="text-cyan-800">{item.codigo}</span>
                    <span className="max-w-[240px] truncate font-medium text-slate-500">
                      {item.descricao}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, descrição, grupo, área ou tags..."
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
          {loading || checkingUser
            ? "Carregando resultados..."
            : `${filtered.length} resultado(s).`}
        </p>
      </section>

      {loading || checkingUser ? (
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

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => copyCidCode(item)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                          title="Copiar somente o código"
                          aria-label={`Copiar CID ${item.codigo}`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <CopyButton text={buildCidText(item)} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.area ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {item.area}
                        </span>
                      ) : null}

                      {item.prioridade != null ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          Prioridade {item.prioridade}
                        </span>
                      ) : null}

                      {item.tags
                        ? item.tags.split(",").map((tag) => {
                            const clean = tag.trim();
                            if (!clean) return null;

                            return (
                              <span
                                key={clean}
                                className="rounded-full border border-sky-100 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-700"
                              >
                                {clean}
                              </span>
                            );
                          })
                        : null}
                    </div>

                    {activeCase ? (
                      <button
                        type="button"
                        onClick={() => attachCidToCase(item)}
                        disabled={activeCase.selectedCid?.codigo === item.codigo}
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-50 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
                      >
                        {activeCase.selectedCid?.codigo === item.codigo ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        {activeCase.selectedCid?.codigo === item.codigo
                          ? "Vinculado ao caso"
                          : "Usar no caso ativo"}
                      </button>
                    ) : null}

                    {isAdmin ? (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(item)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "Apagando..." : "Apagar"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Somente leitura
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {drawerOpen && isAdmin ? (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Fechar cadastro"
          />

          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingItem ? "Editar CID" : "Novo CID"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cadastro em painel separado para manter a listagem limpa.
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
                <input
                  value={form.codigo}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, codigo: e.target.value }))
                  }
                  placeholder="Código"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.grupo}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, grupo: e.target.value }))
                  }
                  placeholder="Grupo"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.area}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, area: e.target.value }))
                  }
                  placeholder="Área"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />

                <input
                  value={form.prioridade}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, prioridade: e.target.value }))
                  }
                  placeholder="Prioridade"
                  type="number"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />
              </div>

              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm((s) => ({ ...s, descricao: e.target.value }))
                }
                placeholder="Descrição"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={form.tags}
                onChange={(e) =>
                  setForm((s) => ({ ...s, tags: e.target.value }))
                }
                placeholder="Tags separadas por vírgula"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : editingItem
                      ? "Salvar edição"
                      : "Criar CID"}
                </button>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700"
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

