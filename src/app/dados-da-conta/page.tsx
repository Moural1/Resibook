"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  ClipboardList,
  Database,
  Download,
  Edit3,
  FileText,
  Mail,
  Save,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  X,
  Brain,
  Tags,
  BookOpen,
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
};

type AccountForm = {
  nome: string;
  cargo: string;
  especialidade: string;
  crm: string;
  telefone: string;
  instituicao: string;
};

const emptyAccountForm: AccountForm = {
  nome: "",
  cargo: "",
  especialidade: "",
  crm: "",
  telefone: "",
  instituicao: "",
};

const exportConfigs: ExportConfig[] = [
  {
    table: "patients",
    label: "Pacientes",
    description:
      "Cadastro clínico, queixa, diagnóstico, medicamentos e observações.",
    icon: Users,
    select:
      "id, nome, idade, sexo, telefone, especialidade, queixa, diagnostico_principal, medicamentos_em_uso, observacoes, retorno_previsto_em, created_at",
    orderBy: "created_at",
  },
  {
    table: "prescriptions",
    label: "Prescrições",
    description: "Prescrições salvas e vinculadas aos pacientes.",
    icon: ClipboardList,
    select:
      "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at",
    orderBy: "created_at",
  },
  {
    table: "patient_notes",
    label: "Evoluções",
    description:
      "Evoluções, condutas, retornos, exames e observações por paciente.",
    icon: FileText,
    select: "id, patient_id, tipo, titulo, conteudo, created_at",
    orderBy: "created_at",
  },
  {
    table: "exam_templates",
    label: "Exames / Evolução",
    description: "Blocos clínicos e modelos de exames/evolução.",
    icon: Stethoscope,
    select: "id, categoria, titulo, sexo, arquivo_origem, conteudo, created_at",
    orderBy: "created_at",
  },
  {
    table: "topicos_medicos",
    label: "Tópicos médicos",
    description: "Biblioteca médica estruturada por área e conduta.",
    icon: BookOpen,
    select:
      "id, area, titulo, resumo, diagnostico, exames, tratamento, pegadinhas, atualizado_em",
    orderBy: "atualizado_em",
  },
  {
    table: "flashcards",
    label: "Flashcards",
    description: "Flashcards de revisão e marcação de difíceis.",
    icon: Brain,
    select: "id, area, materia, tipo, frente, verso, dificil",
  },
  {
    table: "cids",
    label: "CIDs",
    description: "Base de CIDs para consulta rápida.",
    icon: Tags,
    select: "id, codigo, descricao, grupo, area, prioridade, tags",
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

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
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

async function fetchTableData(config: ExportConfig) {
  const supabase = createClient();

  let query = supabase.from(config.table).select(config.select);

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

function FieldView({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 min-h-6 text-sm font-medium text-slate-900">
        {value?.trim() ? value : "-"}
      </p>
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
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

export default function DadosDaContaPage() {
  const supabase = createClient();

  const [accountLoading, setAccountLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [accountForm, setAccountForm] =
    useState<AccountForm>(emptyAccountForm);

  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [results, setResults] = useState<ExportResult[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalExported = useMemo(() => {
    return results.reduce((acc, item) => acc + item.count, 0);
  }, [results]);

  async function loadAccount() {
    setAccountLoading(true);
    setError("");

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setError(error?.message || "Não foi possível carregar os dados da conta.");
      setAccountLoading(false);
      return;
    }

    const metadata = data.user.user_metadata || {};

    setEmail(data.user.email || "");
    setUserId(data.user.id || "");
    setCreatedAt(data.user.created_at || null);
    setLastSignInAt(data.user.last_sign_in_at || null);

    setAccountForm({
      nome: String(metadata.nome || metadata.name || ""),
      cargo: String(metadata.cargo || ""),
      especialidade: String(metadata.especialidade || ""),
      crm: String(metadata.crm || ""),
      telefone: String(metadata.telefone || ""),
      instituicao: String(metadata.instituicao || ""),
    });

    setAccountLoading(false);
  }

  useEffect(() => {
    loadAccount();
  }, []);

  function updateAccount<K extends keyof AccountForm>(
    key: K,
    value: AccountForm[K]
  ) {
    setAccountForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSaveAccount() {
    setSavingAccount(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.updateUser({
      data: {
        nome: accountForm.nome.trim(),
        name: accountForm.nome.trim(),
        cargo: accountForm.cargo.trim(),
        especialidade: accountForm.especialidade.trim(),
        crm: accountForm.crm.trim(),
        telefone: accountForm.telefone.trim(),
        instituicao: accountForm.instituicao.trim(),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Dados da conta salvos com sucesso.");
      setEditingAccount(false);
      await loadAccount();
    }

    setSavingAccount(false);
  }

  async function handleExportOne(config: ExportConfig) {
    setError("");
    setSuccess("");
    setLoadingTable(config.table);

    const response = await fetchTableData(config);

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
      table: config.table,
      label: config.label,
      count: response.data.length,
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
    setError("");
    setSuccess("");
    setLoadingAll(true);

    const backup: Record<string, unknown[]> = {};
    const nextResults: ExportResult[] = [];

    for (const config of exportConfigs) {
      const response = await fetchTableData(config);

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
      version: "backup-v1",
      account: {
        email,
        user_id: userId,
        nome: accountForm.nome,
        cargo: accountForm.cargo,
        especialidade: accountForm.especialidade,
        crm: accountForm.crm,
        instituicao: accountForm.instituicao,
      },
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
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Dados da conta
              </span>

              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Perfil e backup
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Conta e segurança
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Gerencie seus dados profissionais básicos e exporte backups locais
              do ResiBook.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!editingAccount ? (
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                <Edit3 className="h-4 w-4" />
                Editar dados
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSaveAccount}
                  disabled={savingAccount}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingAccount ? "Salvando..." : "Salvar alterações"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAccount(false);
                    loadAccount();
                  }}
                  disabled={savingAccount}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        {accountLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[86px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : !editingAccount ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FieldView label="Nome" value={accountForm.nome} />
            <FieldView label="Cargo" value={accountForm.cargo} />
            <FieldView label="Especialidade" value={accountForm.especialidade} />
            <FieldView label="CRM / registro" value={accountForm.crm} />
            <FieldView label="Telefone" value={accountForm.telefone} />
            <FieldView label="Instituição" value={accountForm.instituicao} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InputField
                label="Nome"
                value={accountForm.nome}
                onChange={(value) => updateAccount("nome", value)}
                placeholder="Seu nome"
              />

              <InputField
                label="Cargo"
                value={accountForm.cargo}
                onChange={(value) => updateAccount("cargo", value)}
                placeholder="Ex.: Médico"
              />

              <InputField
                label="Especialidade"
                value={accountForm.especialidade}
                onChange={(value) => updateAccount("especialidade", value)}
                placeholder="Ex.: Psiquiatria"
              />

              <InputField
                label="CRM / registro"
                value={accountForm.crm}
                onChange={(value) => updateAccount("crm", value)}
                placeholder="Ex.: CRM-MG 000000"
              />

              <InputField
                label="Telefone"
                value={accountForm.telefone}
                onChange={(value) => updateAccount("telefone", value)}
                placeholder="Telefone profissional"
              />

              <InputField
                label="Instituição"
                value={accountForm.instituicao}
                onChange={(value) => updateAccount("instituicao", value)}
                placeholder="Hospital, clínica ou serviço"
              />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Acesso
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informações técnicas do usuário autenticado.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    E-mail
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Usuário
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900">
                    {userId || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FieldView label="Criado em" value={formatDate(createdAt)} />
              <FieldView
                label="Último login"
                value={formatDate(lastSignInAt)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-amber-950">
                Segurança dos dados
              </h2>

              <p className="mt-2 text-sm leading-7 text-amber-950">
                Os backups exportados podem conter dados clínicos. Guarde os
                arquivos em local seguro e evite compartilhar por WhatsApp,
                e-mail comum ou dispositivos de terceiros.
              </p>

              <p className="mt-3 text-sm leading-7 text-amber-950">
                Para uso com dados reais, o ideal é evoluir a segurança para RLS
                por usuário, separação por perfil e auditoria.
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                  Backup
                </span>

                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Exportação local
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Backup e exportação
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Exporte seus dados do ResiBook em JSON para guardar uma cópia
                local segura. O backup completo inclui pacientes, prescrições,
                evoluções, exames, tópicos, flashcards e CIDs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Última exportação
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {totalExported}
              </p>

              <p className="text-xs text-slate-500">registros contabilizados</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <Database className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Backup completo
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Baixa um único arquivo com todas as principais tabelas do
                  sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportAll}
              disabled={loadingAll || loadingTable !== null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {loadingAll ? "Exportando..." : "Exportar backup completo"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Exportar por módulo
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Baixe apenas uma área específica do sistema.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {exportConfigs.map((config) => {
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
                  disabled={loadingAll || loadingTable !== null}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {loadingTable === config.table
                    ? "Exportando..."
                    : "Exportar"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}