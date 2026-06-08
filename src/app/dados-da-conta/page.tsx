"use client";

import { useEffect, useMemo, useState } from "react";
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
  icon: React.ComponentType<{ className?: string }>;
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
    description: "Flashcards de revisão compartilhados entre usuários.",
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

async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return {
      userId: null,
      email: "",
      isGuest: false,
    };
  }

  const userId = data.session?.user?.id || null;
  const email = data.session?.user?.email?.trim().toLowerCase() || "";
  const isGuest = email === GUEST_EMAIL;

  return {
    userId,
    email,
    isGuest,
  };
}

function isConfigAllowedForSession(config: ExportConfig, session: SessionInfo) {
  if (!session.userId) return false;
  if (session.isGuest && config.guestAllowed === false) return false;
  return true;
}

async function fetchTableData(config: ExportConfig, session: SessionInfo) {
  if (!session.userId) {
    return {
      data: [],
      error: "Sessão inválida. Faça login novamente.",
    };
  }

  if (!isConfigAllowedForSession(config, session)) {
    return {
      data: [],
      error: "Este módulo não está disponível para o perfil atual.",
    };
  }

  const supabase = createClient();

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
    return {
      data: [],
      error: error.message,
    };
  }

  return {
    data: data || [],
    error: null,
  };
}

export default function DadosDaContaPage() {
  const [session, setSession] = useState<SessionInfo>({
    userId: null,
    email: "",
    isGuest: false,
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const info = await getSessionInfo();
      if (!mounted) return;
      setSession(info);
      setCheckingSession(false);
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const allowedConfigs = useMemo(() => {
    return exportConfigs.filter((config) =>
      isConfigAllowedForSession(config, session)
    );
  }, [session]);

  const totalExported = useMemo(() => {
    return results.reduce((acc, item) => acc + item.count, 0);
  }, [results]);

  const successCount = useMemo(() => {
    return results.filter((item) => item.ok).length;
  }, [results]);

  const errorCount = useMemo(() => {
    return results.filter((item) => !item.ok).length;
  }, [results]);

  async function handleExportOne(config: ExportConfig) {
    if (checkingSession) return;

    setError("");
    setSuccess("");
    setLoadingTable(config.table);

    const freshSession = await getSessionInfo();
    setSession(freshSession);

    const response = await fetchTableData(config, freshSession);

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

    const freshSession = await getSessionInfo();
    setSession(freshSession);

    if (!freshSession.userId) {
      setError("Sessão inválida. Faça login novamente.");
      setLoadingAll(false);
      return;
    }

    const backup: Record<string, unknown[]> = {};
    const nextResults: ExportResult[] = [];

    for (const config of allowedConfigs) {
      const response = await fetchTableData(config, freshSession);

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
        title="Central de dados"
        description="Exporte os dados do ResiBook em JSON para manter uma cópia local segura. Esta página respeita as regras de segurança do banco: cada usuário exporta apenas os dados que tem permissão para acessar."
        badges={[
          { label: "Dados da conta", tone: "blue" },
          { label: "Backup e exportação", tone: "slate" },
          { label: "RLS ativo", tone: "emerald" },
          ...(session.isGuest ? [{ label: "Modo convidado", tone: "amber" as const }] : []),
        ]}
        error={error}
        success={success}
        notice={
          session.isGuest ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              O usuário convidado exporta apenas bibliotecas compartilhadas permitidas. Dados privados como pacientes, prescrições, evoluções e marcações individuais não são exportados neste perfil.
            </div>
          ) : null
        }
        actions={
          <button
            type="button"
            onClick={handleExportAll}
            disabled={
              checkingSession ||
              !session.userId ||
              loadingAll ||
              loadingTable !== null
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {loadingAll ? "Exportando..." : "Exportar backup completo"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Database className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Registros
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {totalExported}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Total contabilizado na última exportação realizada nesta sessão.
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Sucesso
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {successCount}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Módulos exportados com sucesso.
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pendências
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {errorCount}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Módulos com erro na última tentativa de exportação.
            </p>
          </div>
        </div>
      </ModulePageHeader>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Backup completo
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Baixa um único arquivo contendo as principais tabelas do sistema
              que o usuário logado tem autorização para acessar. Use antes de
              alterações grandes, migrações ou importações.
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {loadingAll ? "Exportando..." : "Baixar backup completo"}
          </button>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <Database className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Arquivo JSON único
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Inclui apenas os módulos permitidos ao perfil atual,
                  respeitando RLS, filtros explícitos em dados privados e o
                  escopo de acesso do usuário logado.
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
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            currentResult.ok
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {currentResult.ok
                            ? `${currentResult.count} registros`
                            : "Erro"}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {config.description}
                    </p>

                    {config.isPrivate ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Dados privados do usuário
                      </p>
                    ) : (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Biblioteca compartilhada
                      </p>
                    )}

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
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            Consulte os documentos que regulam o uso do ResiBook, incluindo
            responsabilidade profissional, privacidade, dados sensíveis,
            segurança, backup e uso adequado do sistema.
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
              Regras de uso, responsabilidade profissional, limites da
              ferramenta, backup, acesso, condutas permitidas e uso adequado do
              ResiBook.
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
              Tratamento de dados pessoais e sensíveis, separação por usuário,
              segurança, logs de acesso, exportações e direitos dos titulares.
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
              identificáveis de pacientes. Guarde em local seguro e evite
              compartilhar por WhatsApp, e-mail comum ou dispositivos de
              terceiros.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}