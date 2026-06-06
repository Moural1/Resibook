"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
};

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
  },
  {
    table: "prescriptions",
    label: "Prescrições",
    description: "Prescrições salvas e vinculadas aos pacientes.",
    icon: ClipboardList,
    select:
      "id, user_id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at",
    orderBy: "created_at",
  },
  {
    table: "patient_notes",
    label: "Evoluções",
    description:
      "Evoluções, condutas, retornos, exames e observações por paciente.",
    icon: FileText,
    select: "id, user_id, patient_id, tipo, titulo, conteudo, created_at",
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
      "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, prioridade, fonte, atualizado_em",
    orderBy: "atualizado_em",
  },
  {
    table: "flashcards",
    label: "Flashcards",
    description: "Flashcards de revisão compartilhados entre usuários.",
    icon: Brain,
    select: "id, area, materia, tipo, frente, verso, dificil",
  },
  {
    table: "flashcard_user_marks",
    label: "Flashcards difíceis",
    description: "Marcações individuais de flashcards difíceis do usuário.",
    icon: Brain,
    select: "id, user_id, flashcard_id, dificil, created_at",
    orderBy: "created_at",
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

export default function DadosDaContaPage() {
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      version: "backup-v2-rls",
      description:
        "Backup respeitando as permissões do usuário logado e as políticas de RLS do Supabase.",
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

              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                Backup e exportação
              </span>

              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                RLS ativo
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Central de dados
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Exporte os dados do ResiBook em JSON para manter uma cópia local
              segura. Esta página respeita as regras de segurança do banco: cada
              usuário exporta apenas os dados que tem permissão para acessar.
            </p>
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
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

          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Sucesso
                </p>

                <p className="mt-1 text-2xl font-semibold text-emerald-950">
                  {successCount}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-emerald-900">
              Módulos exportados com sucesso.
            </p>
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Pendências
                </p>

                <p className="mt-1 text-2xl font-semibold text-amber-950">
                  {errorCount}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-amber-900">
              Módulos com erro na última tentativa de exportação.
            </p>
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
              que o usuário logado tem autorização para acessar. Use antes de
              alterações grandes, migrações ou importações.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportAll}
            disabled={loadingAll || loadingTable !== null}
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
                  Inclui pacientes, prescrições, evoluções, exames/modelos,
                  tópicos, flashcards, marcações de difíceis e CIDs, respeitando
                  as permissões do usuário atual.
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
                    : "Exportar módulo"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
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
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="text-sm font-semibold text-slate-900">
              Termos de Uso
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Regras de uso, responsabilidade profissional, limites da
              ferramenta, backup, acesso, condutas permitidas e uso adequado do
              ResiBook.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-700">
              Abrir termos →
            </p>
          </a>

          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            <p className="text-sm font-semibold text-slate-900">
              Política de Privacidade
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tratamento de dados pessoais e sensíveis, separação por usuário,
              segurança, logs de acesso, exportações e direitos dos titulares.
            </p>

            <p className="mt-4 text-sm font-semibold text-emerald-700">
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