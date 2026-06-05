"use client";

import { useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Download,
  Database,
  Users,
  ClipboardList,
  FileText,
  Brain,
  Tags,
  BookOpen,
  Stethoscope,
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
    description: "Cadastro clínico, queixa, diagnóstico, medicamentos e observações.",
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
    description: "Evoluções, condutas, retornos, exames e observações por paciente.",
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

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

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

async function fetchTableData(supabase: SupabaseClient, config: ExportConfig) {
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

  async function handleExportOne(config: ExportConfig) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingTable(config.table);

    const response = await fetchTableData(supabase, config);

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
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingAll(true);

    const backup: Record<string, unknown[]> = {};
    const nextResults: ExportResult[] = [];

    for (const config of exportConfigs) {
      const response = await fetchTableData(supabase, config);

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
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Dados da conta
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Backup
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Backup e exportação
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Exporte seus dados do ResiBook em JSON para guardar uma cópia local
            segura. O backup completo inclui pacientes, prescrições, evoluções,
            exames, tópicos, flashcards e CIDs.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <Database className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Backup completo
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Baixa um único arquivo com todas as principais tabelas do
                  sistema. Ideal para guardar uma cópia antes de grandes
                  alterações.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportAll}
              disabled={loadingAll || loadingTable !== null}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {loadingAll ? "Exportando..." : "Exportar backup completo"}
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">
              Última exportação
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              {totalExported}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              registros contabilizados na última execução.
            </p>
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

      <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">
          Observação importante
        </h2>

        <p className="mt-2 text-sm leading-7 text-amber-900">
          O arquivo exportado contém dados clínicos. Guarde em local seguro e
          evite compartilhar por WhatsApp, e-mail comum ou dispositivos de
          terceiros.
        </p>
      </section>
    </div>
  );
}