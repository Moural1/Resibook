"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  ClipboardList,
  Database,
  FileText,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";

type CountMap = {
  patients: number;
  prescriptions: number;
  notes: number;
  exams: number;
  topicos: number;
  flashcards: number;
  flashcardsDificeis: number;
  cids: number;
};

type RecentItem = {
  id: string;
  type: "Paciente" | "Prescrição" | "Evolução";
  title: string;
  subtitle: string;
  created_at: string | null;
};

type PatientRow = {
  id: string;
  nome: string | null;
  especialidade: string | null;
  queixa: string | null;
  created_at: string | null;
};

type PrescriptionRow = {
  id: string;
  paciente_nome: string | null;
  medicamento: string | null;
  created_at: string | null;
};

type NoteRow = {
  id: string;
  tipo: string | null;
  titulo: string | null;
  conteudo: string | null;
  created_at: string | null;
};

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

async function getCount(
  table: string,
  filter?: { column: string; value: string | number | boolean }
) {
  const supabase = createClient();

  let query = supabase.from(table).select("id", {
    count: "exact",
    head: true,
  });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    console.warn(`Erro ao contar ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

function MainMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function CompactMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <Icon className="h-4 w-4 text-slate-400" />
      </div>
    </article>
  );
}

function ProgressLine({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{value} registros</p>
        </div>

        <p className="text-sm font-semibold text-slate-700">{percentage}%</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-800"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RecentCard({ item }: { item: RecentItem }) {
  const styles: Record<RecentItem["type"], string> = {
    Paciente: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Prescrição: "border-blue-200 bg-blue-50 text-blue-700",
    Evolução: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[item.type]}`}
          >
            {item.type}
          </span>

          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            {item.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
            {item.subtitle}
          </p>
        </div>

        <p className="shrink-0 text-xs font-medium text-slate-400">
          {formatDate(item.created_at)}
        </p>
      </div>
    </article>
  );
}

export default function MetricasPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [counts, setCounts] = useState<CountMap>({
    patients: 0,
    prescriptions: 0,
    notes: 0,
    exams: 0,
    topicos: 0,
    flashcards: 0,
    flashcardsDificeis: 0,
    cids: 0,
  });

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  async function loadMetrics(showRefreshState = false) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;

      if (!userId) {
        setError("Usuário autenticado não identificado.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [
        patients,
        prescriptions,
        notes,
        exams,
        topicos,
        flashcards,
        flashcardsDificeis,
        cids,
        patientsRes,
        prescriptionsRes,
        notesRes,
      ] = await Promise.all([
        getCount("patients", { column: "user_id", value: userId }),
        getCount("prescriptions", { column: "user_id", value: userId }),
        getCount("patient_notes", { column: "user_id", value: userId }),
        getCount("exam_templates"),
        getCount("topicos_medicos"),
        getCount("flashcards"),
        getCount("flashcard_user_marks", {
          column: "user_id",
          value: userId,
        }),
        getCount("cids"),

        supabase
          .from("patients")
          .select("id, nome, especialidade, queixa, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("prescriptions")
          .select("id, paciente_nome, medicamento, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("patient_notes")
          .select("id, tipo, titulo, conteudo, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setCounts({
        patients,
        prescriptions,
        notes,
        exams,
        topicos,
        flashcards,
        flashcardsDificeis,
        cids,
      });

      const mappedPatients: RecentItem[] = ((patientsRes.data ||
        []) as PatientRow[]).map((item) => ({
        id: `patient-${item.id}`,
        type: "Paciente",
        title: item.nome || "Paciente sem nome",
        subtitle:
          item.especialidade || item.queixa || "Cadastro clínico registrado",
        created_at: item.created_at,
      }));

      const mappedPrescriptions: RecentItem[] = ((prescriptionsRes.data ||
        []) as PrescriptionRow[]).map((item) => ({
        id: `prescription-${item.id}`,
        type: "Prescrição",
        title: item.medicamento || "Prescrição clínica",
        subtitle: item.paciente_nome || "Paciente não vinculado",
        created_at: item.created_at,
      }));

      const mappedNotes: RecentItem[] = ((notesRes.data ||
        []) as NoteRow[]).map((item) => ({
        id: `note-${item.id}`,
        type: "Evolução",
        title: item.titulo || item.tipo || "Evolução clínica",
        subtitle:
          item.conteudo?.slice(0, 120) || "Registro clínico no prontuário",
        created_at: item.created_at,
      }));

      const merged = [
        ...mappedPatients,
        ...mappedPrescriptions,
        ...mappedNotes,
      ]
        .sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 8);

      setRecentItems(merged);
      setUpdatedAt(new Date().toISOString());
    } catch {
      setError("Não foi possível carregar as métricas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  const clinicalTotal = useMemo(() => {
    return counts.patients + counts.prescriptions + counts.notes;
  }, [counts]);

  const libraryTotal = useMemo(() => {
    return counts.exams + counts.topicos + counts.flashcards + counts.cids;
  }, [counts]);

  const totalSystem = clinicalTotal + libraryTotal;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                Painel clínico
              </span>

              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Dados privados do usuário
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Métricas assistenciais
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Pacientes, prescrições e evoluções são do usuário logado.
              Bibliotecas médicas seguem compartilhadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Atualizado em
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {updatedAt ? formatDate(updatedAt) : "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadMetrics(true)}
              disabled={loading || refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[130px] animate-pulse rounded-[22px] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MainMetricCard
              title="Pacientes ativos"
              value={counts.patients}
              description="Pacientes cadastrados no seu login."
              icon={Users}
            />

            <MainMetricCard
              title="Prescrições"
              value={counts.prescriptions}
              description="Prescrições registradas por você."
              icon={ClipboardList}
            />

            <MainMetricCard
              title="Evoluções"
              value={counts.notes}
              description="Notas e evoluções do seu prontuário."
              icon={FileText}
            />

            <MainMetricCard
              title="Flashcards"
              value={counts.flashcards}
              description="Itens na biblioteca compartilhada."
              icon={Brain}
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Distribuição da base
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Núcleo clínico privado e biblioteca compartilhada.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Registros totais
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {totalSystem}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <Database className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <ProgressLine
                label="Núcleo clínico privado"
                value={clinicalTotal}
                total={totalSystem}
              />

              <ProgressLine
                label="Biblioteca médica compartilhada"
                value={libraryTotal}
                total={totalSystem}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Clínico
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {clinicalTotal}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Estudo
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {libraryTotal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Atividade recente
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Últimos registros clínicos criados no seu login.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[90px] animate-pulse rounded-[18px] border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma atividade recente encontrada para o seu usuário.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentItems.map((item) => (
                <RecentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Indicadores complementares
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Métricas da biblioteca clínica e módulos de apoio.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CompactMetric
            label="Exames / modelos"
            value={counts.exams}
            icon={Stethoscope}
          />

          <CompactMetric
            label="Tópicos médicos"
            value={counts.topicos}
            icon={BookOpen}
          />

          <CompactMetric
            label="Difíceis"
            value={counts.flashcardsDificeis}
            icon={Brain}
          />

          <CompactMetric label="CIDs" value={counts.cids} icon={Tags} />
        </div>
      </section>
    </div>
  );
}
