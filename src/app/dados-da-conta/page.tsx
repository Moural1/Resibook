"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { createClient } from "@/lib/supabase/client";
import ModulePageHeader from "../../components/module-page-header";
import {
  AlertTriangle,
  Brain,
  BookOpen,
  ClipboardList,
  Database,
  Download,
  FileText,
  ShieldCheck,
  Stethoscope,
  Tags,
  Users,
  Mail,
  Save,
} from "lucide-react";

type ExportResult = {
  table: string;
  label: string;
  count: number;
  ok: boolean;
  error?: string;
};

type ExportConfig = {
  table: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  select: string;
  orderBy?: string;
  isPrivate?: boolean;
  guestAllowed?: boolean;
};

type SessionInfo = {
  userId: string | null;
  email: string;
  isGuest: boolean;
};

type ProfileForm = {
  full_name: string;
  specialty: string;
  crm: string;
  crm_state: string;
  signature: string;
  include_signature: boolean;
};

type ProfileRow = {
  full_name: string | null;
  specialty: string | null;
  crm: string | null;
  crm_state: string | null;
  signature: string | null;
  preferences: { include_signature?: boolean } | null;
};

const GUEST_EMAIL = "convidado@resibook.com";

const exportConfigs: ExportConfig[] = [
  {
    table: "patients",
    label: "Pacientes",
    description:
      "Cadastro clínico completo, plano de saúde, HMA, HPP, exame físico, hipótese diagnóstica e conduta.",
    icon: Users,
    select:
      "id, user_id, nome, idade, sexo, telefone, especialidade, plano_saude, numero_carteirinha, data_nascimento, queixa, queixa_principal, hma, hpp, diagnostico_principal, hipotese_diagnostica, medicamentos_em_uso, exame_fisico, conduta_medica, observacoes, retorno_previsto_em, crm_medico, local_atendimento, created_at",
    orderBy: "created_at",
    isPrivate: true,
    guestAllowed: false,
  },
  {
    table: "prescriptions",
    label: "Prescrições",
    description: "Prescrições salvas e vinculadas aos pacientes.",
    icon: ClipboardList,
    select:
      "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at",
    orderBy: "created_at",
    isPrivate: true,
    guestAllowed: false,
  },
  {
    table: "patient_notes",
    label: "Evoluções",
    description:
      "Evoluções, condutas, retornos, exames e observações por paciente.",
    icon: FileText,
    select: "id, user_id, patient_id, tipo, titulo, conteudo, created_at",
    orderBy: "created_at",
    isPrivate: true,
    guestAllowed: false,
  },
  {
    table: "exam_templates",
    label: "Exames / Evolução",
    description: "Blocos clínicos e modelos de exames/evolução.",
    icon: Stethoscope,
    select: "id, categoria, titulo, sexo, arquivo_origem, conteudo, created_at",
    orderBy: "created_at",
    guestAllowed: true,
  },
  {
    table: "topicos_medicos",
    label: "Tópicos médicos",
    description: "Biblioteca médica estruturada por área e conduta.",
    icon: BookOpen,
    select:
      "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em",
    orderBy: "atualizado_em",
    guestAllowed: true,
  },
  {
    table: "flashcards",
    label: "Flashcards",
    description: "Biblioteca de revisão rápida por área e matéria.",
    icon: Brain,
    select: "id, area, materia, tipo, frente, verso, dificil",
    guestAllowed: false,
  },
  {
    table: "flashcard_user_marks",
    label: "Flashcards difíceis",
    description: "Marcações individuais de flashcards difíceis do usuário.",
    icon: Brain,
    select: "id, user_id, flashcard_id, dificil, created_at",
    orderBy: "created_at",
    isPrivate: true,
    guestAllowed: false,
  },
  {
    table: "cids",
    label: "CIDs",
    description: "Base de CIDs para consulta rápida.",
    icon: Tags,
    select: "id, codigo, descricao, grupo, area, prioridade, tags",
    guestAllowed: true,
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}_${hour}-${minute}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

async function getSessionInfo(
  supabase: ReturnType<typeof createClient>
): Promise<SessionInfo> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { userId: null, email: "", isGuest: false };
  }

  const userId = data.session?.user?.id || null;
  const email = data.session?.user?.email?.trim().toLowerCase() || "";
  const isGuest = email === GUEST_EMAIL;

  return { userId, email, isGuest };
}

function isConfigAllowedForSession(config: ExportConfig, session: SessionInfo) {
  if (!session.userId) return false;
  if (session.isGuest && config.guestAllowed === false) return false;

  return true;
}

async function fetchTableData(
  supabase: ReturnType<typeof createClient>,
  config: ExportConfig,
  session: SessionInfo
) {
  if (!session.userId) {
    return { data: [], error: "Sessão inválida. Faça login novamente." };
  }

  if (!isConfigAllowedForSession(config, session)) {
    return {
      data: [],
      error: "Este módulo não está disponível para o perfil atual.",
    };
  }

  let query = supabase.from(config.table).select(config.select);

  if (config.isPrivate) {
    query = query.eq("user_id", session.userId);
  }

  if (config.orderBy) {
    query = query.order(config.orderBy, {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export default function DadosDaContaPage() {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<SessionInfo>({
    userId: null,
    email: "",
    isGuest: false,
  });

  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    specialty: "",
    crm: "",
    crm_state: "",
    signature: "",
    include_signature: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSessionAndProfile() {
      setCheckingSession(true);
      setLoadingProfile(true);
      setError("");

      const info = await getSessionInfo(supabase);

      if (!mounted) return;

      setSession(info);
      setCheckingSession(false);

      if (!info.userId) {
        setLoadingProfile(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("user_profiles")
        .select("full_name, specialty, crm, crm_state, signature, preferences")
        .eq("user_id", info.userId)
        .maybeSingle<ProfileRow>();

      if (!mounted) return;

      if (profileError) {
        console.warn("Não foi possível carregar perfil:", profileError.message);
        setError(
          "Não foi possível carregar o perfil profissional. Verifique a tabela user_profiles."
        );
      }

      setProfileForm({
        full_name: data?.full_name || "",
        specialty: data?.specialty || "",
        crm: data?.crm || "",
        crm_state: data?.crm_state || "",
        signature: data?.signature || "",
        include_signature: data?.preferences?.include_signature === true,
      });

      setLoadingProfile(false);
    }

    loadSessionAndProfile();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const allowedConfigs = useMemo(() => {
    return exportConfigs.filter((config) =>
      isConfigAllowedForSession(config, session)
    );
  }, [session]);

  const totalExported = useMemo(
    () => results.reduce((acc, item) => acc + item.count, 0),
    [results]
  );

  const successCount = useMemo(
    () => results.filter((item) => item.ok).length,
    [results]
  );

  const errorCount = useMemo(
    () => results.filter((item) => !item.ok).length,
    [results]
  );

  async function saveProfile() {
    if (!session.userId) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    setSavingProfile(true);
    setError("");
    setSuccess("");

    const now = new Date().toISOString();

    const { error: saveError } = await supabase.from("user_profiles").upsert(
      {
        user_id: session.userId,
        email: session.email || null,
        full_name: profileForm.full_name.trim() || null,
        specialty: profileForm.specialty.trim() || null,
        crm: profileForm.crm.trim() || null,
        crm_state: profileForm.crm_state || null,
        signature: profileForm.signature.trim() || null,
        preferences: {
          include_signature: profileForm.include_signature,
        },
        updated_at: now,
      },
      { onConflict: "user_id" }
    );

    if (saveError) {
      setError(
        `Não foi possível salvar o perfil profissional: ${saveError.message}`
      );
      setSavingProfile(false);
      return;
    }

    setSuccess("Perfil profissional salvo com sucesso.");
    setSavingProfile(false);
  }

  async function handleExportOne(config: ExportConfig) {
    if (checkingSession) return;

    setError("");
    setSuccess("");
    setLoadingTable(config.table);

    const freshSession = await getSessionInfo(supabase);
    setSession(freshSession);

    const response = await fetchTableData(supabase, config, freshSession);

    if (response.error) {
      setError(`Erro ao exportar ${config.label}: ${response.error}`);
      setResults((current) => [
        {
          table: config.table,
          label: config.label,
          count: 0,
          ok: false,
          error: response.error || undefined,
        },
        ...current.filter((item) => item.table !== config.table),
      ]);
      setLoadingTable(null);
      return;
    }

    const payload = {
      exported_at: new Date().toISOString(),
      app: "ResiBook",
      version: "backup-v3-scoped",
      table: config.table,
      label: config.label,
      count: response.data.length,
      scope: config.isPrivate ? "private-by-user" : "shared-library",
      user_email: freshSession.email || null,
      data: response.data,
    };

    downloadJson(
      `resibook-${slugify(config.label)}-${getDateStamp()}.json`,
      payload
    );

    setResults((current) => [
      {
        table: config.table,
        label: config.label,
        count: response.data.length,
        ok: true,
      },
      ...current.filter((item) => item.table !== config.table),
    ]);

    setSuccess(`${config.label} exportado com sucesso.`);
    setLoadingTable(null);
  }

  async function handleExportAll() {
    if (checkingSession) return;

    setError("");
    setSuccess("");
    setLoadingAll(true);

    const freshSession = await getSessionInfo(supabase);
    setSession(freshSession);

    if (!freshSession.userId) {
      setError("Sessão inválida. Faça login novamente.");
      setLoadingAll(false);
      return;
    }

    const configsForFreshSession = exportConfigs.filter((config) =>
      isConfigAllowedForSession(config, freshSession)
    );

    const backup: Record<string, unknown[]> = {};
    const nextResults: ExportResult[] = [];

    for (const config of configsForFreshSession) {
      const response = await fetchTableData(supabase, config, freshSession);

      if (response.error) {
        backup[config.table] = [];
        nextResults.push({
          table: config.table,
          label: config.label,
          count: 0,
          ok: false,
          error: response.error || undefined,
        });
      } else {
        backup[config.table] = response.data;
        nextResults.push({
          table: config.table,
          label: config.label,
          count: response.data.length,
          ok: true,
        });
      }
    }

    const payload = {
      exported_at: new Date().toISOString(),
      app: "ResiBook",
      version: "backup-v3-scoped",
      description:
        "Backup respeitando o escopo do usuário logado, políticas RLS e filtros explícitos de user_id em dados privados.",
      profile: freshSession.isGuest ? "guest" : "authenticated",
      user_email: freshSession.email || null,
      tables: nextResults,
      data: backup,
    };

    downloadJson(`resibook-backup-completo-${getDateStamp()}.json`, payload);

    setResults(nextResults);
    setSuccess("Backup completo exportado com sucesso.");
    setLoadingAll(false);
  }

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Área de conta"
        title="Dados da conta"
        description="Perfil profissional, identificação da conta e exportação segura dos dados permitidos ao usuário logado."
        badges={[
          { label: "Dados da conta", tone: "blue" },
          { label: "Backup e exportação", tone: "slate" },
          { label: "RLS ativo", tone: "emerald" },
          ...(session.isGuest
            ? [{ label: "Modo convidado", tone: "amber" as const }]
            : []),
        ]}
        metrics={[
          { label: "Registros", value: totalExported },
          { label: "Sucesso", value: successCount },
          { label: "Pendências", value: errorCount },
        ]}
        error={error}
        success={success}
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Perfil profissional
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edite os dados profissionais usados para identificar sua conta no
              ResiBook.
            </p>
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={
              checkingSession ||
              loadingProfile ||
              savingProfile ||
              !session.userId
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 md:col-span-2 xl:col-span-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Nome completo do médico
            </label>
            <input
              value={profileForm.full_name}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  full_name: event.target.value,
                }))
              }
              placeholder="Digite o nome completo"
              disabled={loadingProfile || !session.userId}
              className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Especialidade
            </label>
            <input
              value={profileForm.specialty}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  specialty: event.target.value,
                }))
              }
              placeholder="Ex.: Clínica médica"
              disabled={loadingProfile || !session.userId}
              className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              CRM
            </label>
            <input
              value={profileForm.crm}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  crm: event.target.value,
                }))
              }
              placeholder="Ex.: CRM-MG 123456"
              disabled={loadingProfile || !session.userId}
              className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              UF do CRM
            </label>
            <select
              value={profileForm.crm_state}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  crm_state: event.target.value,
                }))
              }
              disabled={loadingProfile || !session.userId}
              className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">Não informar</option>
              {[
                "AC",
                "AL",
                "AP",
                "AM",
                "BA",
                "CE",
                "DF",
                "ES",
                "GO",
                "MA",
                "MT",
                "MS",
                "MG",
                "PA",
                "PB",
                "PR",
                "PE",
                "PI",
                "RJ",
                "RN",
                "RS",
                "RO",
                "RR",
                "SC",
                "SP",
                "SE",
                "TO",
              ].map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 md:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Assinatura ou rodapé
            </label>
            <textarea
              value={profileForm.signature}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  signature: event.target.value,
                }))
              }
              rows={3}
              maxLength={500}
              placeholder="Ex.: Dr. Nome Sobrenome | CRM 123456 - MG"
              disabled={loadingProfile || !session.userId}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={profileForm.include_signature}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    include_signature: event.target.checked,
                  }))
                }
                disabled={loadingProfile || !session.userId}
                className="h-4 w-4 rounded border-slate-300 accent-slate-900"
              />
              Usar esta assinatura em textos compatíveis
            </label>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Mail className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  E-mail da conta
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {session.email || "Não identificado"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Perfil de acesso
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {session.isGuest ? "Convidado" : "Autenticado"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Database className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  ID da conta
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {session.userId || "Não identificado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Backup completo
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Baixa um único arquivo contendo as principais tabelas do sistema
              que o usuário logado tem autorização para acessar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportAll}
            disabled={
              checkingSession ||
              !session.userId ||
              loadingAll ||
              loadingTable !== null
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {loadingAll ? "Exportando..." : "Baixar backup completo"}
          </button>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Database className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Arquivo JSON único
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Inclui apenas os módulos permitidos ao perfil atual,
                  respeitando RLS e filtros explícitos em dados privados.
                </p>
              </div>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              resibook-backup-completo
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Exportar por módulo
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Baixe apenas uma área específica do sistema.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allowedConfigs.map((config) => {
            const Icon = config.icon;
            const currentResult = results.find(
              (item) => item.table === config.table
            );

            return (
              <article
                key={config.table}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {config.label}
                      </h3>

                      {currentResult ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {currentResult.ok
                            ? `${currentResult.count} registros`
                            : "Erro"}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {config.description}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {config.isPrivate
                        ? "Dados privados do usuário"
                        : "Biblioteca compartilhada"}
                    </p>

                    {currentResult?.error ? (
                      <p className="mt-2 text-sm font-medium text-rose-600">
                        {currentResult.error}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportOne(config)}
                  disabled={
                    checkingSession ||
                    !session.userId ||
                    loadingAll ||
                    loadingTable !== null
                  }
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {loadingTable === config.table
                    ? "Exportando..."
                    : "Exportar módulo"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            Documentos legais
          </span>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Termos e privacidade
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Consulte os documentos que regulam o uso do ResiBook.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <a
            href="/termos"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-sm font-semibold text-slate-900">
              Termos de Uso
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Regras de uso, responsabilidade profissional e limites da
              ferramenta.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Abrir termos →
            </p>
          </a>

          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-sm font-semibold text-slate-900">
              Política de Privacidade
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tratamento de dados pessoais e sensíveis, segurança e direitos dos
              titulares.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Abrir política →
            </p>
          </a>
        </div>
      </section>

      <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-amber-950">
              Cuidado com os arquivos exportados
            </h2>
            <p className="mt-2 text-sm leading-7 text-amber-950">
              Os arquivos exportados podem conter dados clínicos e informações
              identificáveis de pacientes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

