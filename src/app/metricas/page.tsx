"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  RefreshCw,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    console.error(`Erro ao contar ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "emerald" | "violet" | "amber";
}) {
  const toneClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  colorClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{value} registros</p>
        </div>
        <span className="text-sm font-semibold text-slate-700">
          {percentage}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RecentItemCard({ item }: { item: RecentItem }) {
  const badgeStyles: Record<RecentItem["type"], string> = {
    Paciente: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Prescrição: "border-blue-200 bg-blue-50 text-blue-700",
    Evolução: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[item.type]}`}
          >
            {item.type}
          </span>

          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            {item.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {item.subtitle}
          </p>
        </div>

        <span className="shrink-0 text-xs text-slate-400">
          {formatDate(item.created_at)}
        </span>
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
        getCount("patients"),
        getCount("prescriptions"),
        getCount("patient_notes"),
        getCount("exam_templates"),
        getCount("topicos_medicos"),
        getCount("flashcards"),
        getCount("flashcards", {
          column: "dificil",
          value: true,
        }),
        getCount("cids"),

        supabase
          .from("patients")
          .select("id, nome, especialidade, queixa, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("prescriptions")
          .select("id, paciente_nome, medicamento, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("patient_notes")
          .select("id, tipo, titulo, conteudo, created_at")
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
          item.especialidade || item.queixa || "Cadastro clínico realizado",
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

      const mappedNotes: RecentItem[] = ((notesRes.data || []) as NoteRow[]).map(
        (item) => ({
          id: `note-${item.id}`,
          type: "Evolução",
          title: item.titulo || item.tipo || "Evolução clínica",
          subtitle:
            item.conteudo?.slice(0, 110) ||
            "Registro clínico no prontuário",
          created_at: item.created_at,
        })
      );

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

  const studyTotal = useMemo(() => {
    return counts.exams + counts.topicos + counts.flashcards + counts.cids;
  }, [counts]);

  const overallTotal = useMemo(() => {
    return clinicalTotal + studyTotal;
  }, [clinicalTotal, studyTotal]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Métricas
              </span>

              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                Visão geral do sistema
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Painel de métricas
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Resumo mais limpo e objetivo da operação clínica e da biblioteca
              de estudo do ResiBook.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Última atualização
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
                className="h-[128px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Pacientes"
                value={counts.patients}
                icon={Users}
                tone="emerald"
              />
              <StatCard
                title="Prescrições"
                value={counts.prescriptions}
                icon={ClipboardList}
                tone="blue"
              />
              <StatCard
                title="Evoluções"
                value={counts.notes}
                icon={FileText}
                tone="violet"
              />
              <StatCard
                title="Flashcards"
                value={counts.flashcards}
                icon={Brain}
                tone="amber"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat title="Exames / modelos" value={counts.exams} />
              <MiniStat title="Tópicos médicos" value={counts.topicos} />
              <MiniStat title="Flashcards difíceis" value={counts.flashcardsDificeis} />
              <MiniStat title="CIDs" value={counts.cids} />
            </div>
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Composição da base
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Distribuição geral entre operação clínica e conteúdo de estudo.
            </p>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Total geral
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {overallTotal}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <ProgressRow
                label="Núcleo clínico"
                value={clinicalTotal}
                total={overallTotal}
                colorClass="bg-emerald-500"
              />

              <ProgressRow
                label="Biblioteca de estudo"
                value={studyTotal}
                total={overallTotal}
                colorClass="bg-blue-500"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Núcleo clínico
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">
                  {clinicalTotal}
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Pacientes, prescrições e evoluções.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Estudo e apoio
                </p>
                <p className="mt-2 text-2xl font-semibold text-blue-900">
                  {studyTotal}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Exames, tópicos, flashcards e CIDs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Atividade recente
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Últimos registros criados no sistema.
            </p>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[96px] animate-pulse rounded-[20px] border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma atividade recente encontrada.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentItems.map((item) => (
                <RecentItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Exames
              </p>
              <p className="text-base font-semibold text-slate-900">
                {counts.exams}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Tópicos
              </p>
              <p className="text-base font-semibold text-slate-900">
                {counts.topicos}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Difíceis
              </p>
              <p className="text-base font-semibold text-slate-900">
                {counts.flashcardsDificeis}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                CIDs
              </p>
              <p className="text-base font-semibold text-slate-900">
                {counts.cids}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}