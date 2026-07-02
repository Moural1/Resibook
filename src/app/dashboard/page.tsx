"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import {
  CLINICAL_CASE_SESSION_EVENT,
  formatClinicalCaseAge,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleAlert,
  Gauge,
  ClipboardList,
  FileText,
  FlaskConical,
  Lock,
  Search,
  Siren,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";

type Patient = {
  id: string;
  nome: string;
  especialidade: string | null;
  queixa: string | null;
  created_at: string;
};

type PatientFollowup = {
  id: string;
  nome: string;
  retorno_previsto_em: string | null;
};

type PendingExam = {
  id: number;
  patient_id: string;
  nome_exame: string;
  status: string;
  requested_at: string | null;
};

type Prescription = {
  id: number;
  paciente_nome: string | null;
  medicamento: string | null;
  created_at: string;
};

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  created_at: string;
};

type TopicoMedico = {
  id: number;
  area: string;
  titulo: string;
  atualizado_em: string | null;
};

type DashboardCounts = {
  patients: number;
  prescriptions: number;
  examTemplates: number;
  topicosMedicos: number;
  flashcards: number;
  flashcardsDificeis: number;
  cids: number;
};

const GUEST_EMAIL = "convidado@resibook.com";

async function getTableCount(
  tableName: string,
  filter?: {
    column: string;
    value: string | number | boolean;
  }
): Promise<number> {
  try {
    const supabase = createClient();

    let query = supabase
      .from(tableName)
      .select("id", { count: "exact", head: true });

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { count, error } = await query;

    if (error) {
      console.warn(`Erro ao contar ${tableName}:`, error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.warn(`Erro inesperado ao contar ${tableName}:`, error);
    return 0;
  }
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

function formatDateOnly(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(parsed);
}

function getFollowupDays(value?: string | null, now = new Date()) {
  if (!value) return null;
  const target = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12
  );
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export default function DashboardPage() {
  const supabase = createClient();

  const [counts, setCounts] = useState<DashboardCounts>({
    patients: 0,
    prescriptions: 0,
    examTemplates: 0,
    topicosMedicos: 0,
    flashcards: 0,
    flashcardsDificeis: 0,
    cids: 0,
  });

  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(
    []
  );
  const [recentExamTemplates, setRecentExamTemplates] = useState<ExamTemplate[]>(
    []
  );
  const [recentTopicos, setRecentTopicos] = useState<TopicoMedico[]>([]);
  const [patientFollowups, setPatientFollowups] = useState<PatientFollowup[]>([]);
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);

  const [favoritePrescriptionCount, setFavoritePrescriptionCount] = useState(0);
  const [favoriteExamCount, setFavoriteExamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    function refreshActiveCase() {
      setActiveCase(loadClinicalCaseSession());
    }

    refreshActiveCase();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refreshActiveCase);
    return () =>
      window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refreshActiveCase);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        setSessionReady(true);
        return;
      }

      const userId = sessionData.session?.user?.id || null;
      const email = sessionData.session?.user?.email?.trim().toLowerCase() || "";
      const guest = email === GUEST_EMAIL;

      setIsGuest(guest);
      setSessionReady(true);

      if (!userId) {
        setError("Usuário autenticado não identificado.");
        setLoading(false);
        return;
      }

      if (guest) {
        setCounts({
          patients: 0,
          prescriptions: 0,
          examTemplates: 0,
          topicosMedicos: 0,
          flashcards: 0,
          flashcardsDificeis: 0,
          cids: 0,
        });
        setRecentPatients([]);
        setRecentPrescriptions([]);
        setRecentExamTemplates([]);
        setRecentTopicos([]);
        setPatientFollowups([]);
        setPendingExams([]);
        setFavoritePrescriptionCount(0);
        setFavoriteExamCount(0);
        setLoading(false);
        return;
      }

      const [
        patientsCount,
        prescriptionsCount,
        examTemplatesCount,
        topicosMedicosCount,
        flashcardsCount,
        cidsCount,
        difficultMarksCount,
        patientsRes,
        prescriptionsRes,
        examTemplatesRes,
        topicosRes,
        patientFollowupsRes,
        pendingExamsRes,
      ] = await Promise.all([
        getTableCount("patients", { column: "user_id", value: userId }),
        getTableCount("prescriptions", { column: "user_id", value: userId }),
        getTableCount("exam_templates"),
        getTableCount("topicos_medicos"),
        getTableCount("flashcards"),
        getTableCount("cids"),

        supabase
          .from("flashcard_user_marks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("dificil", true)
          .then(({ count, error }) => {
            if (error) {
              console.warn(
                "Erro ao contar flashcards difíceis:",
                error.message
              );
              return 0;
            }

            return count ?? 0;
          }),

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
          .from("exam_templates")
          .select("id, categoria, titulo, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("topicos_medicos")
          .select("id, area, titulo, atualizado_em")
          .order("atualizado_em", { ascending: false, nullsFirst: false })
          .limit(5),

        supabase
          .from("patients")
          .select("id, nome, retorno_previsto_em")
          .eq("user_id", userId)
          .not("retorno_previsto_em", "is", null)
          .order("retorno_previsto_em", { ascending: true })
          .limit(12),

        supabase
          .from("patient_exam_requests")
          .select("id, patient_id, nome_exame, status, requested_at")
          .eq("user_id", userId)
          .in("status", ["solicitado", "recebido"])
          .order("requested_at", { ascending: true, nullsFirst: false })
          .limit(12),
      ]);

      if (!mounted) return;

      setCounts({
        patients: patientsCount,
        prescriptions: prescriptionsCount,
        examTemplates: examTemplatesCount,
        topicosMedicos: topicosMedicosCount,
        flashcards: flashcardsCount,
        flashcardsDificeis: difficultMarksCount,
        cids: cidsCount,
      });

      if (patientsRes.error) {
        console.warn(
          "Erro ao carregar pacientes recentes:",
          patientsRes.error.message
        );
      }

      if (prescriptionsRes.error) {
        console.warn(
          "Erro ao carregar prescrições recentes:",
          prescriptionsRes.error.message
        );
      }

      if (examTemplatesRes.error) {
        console.warn(
          "Erro ao carregar exames/evoluções recentes:",
          examTemplatesRes.error.message
        );
      }

      if (topicosRes.error) {
        console.warn(
          "Erro ao carregar tópicos recentes:",
          topicosRes.error.message
        );
      }

      if (patientFollowupsRes.error) {
        console.warn(
          "Erro ao carregar retornos dos pacientes:",
          patientFollowupsRes.error.message
        );
      }

      if (pendingExamsRes.error) {
        console.warn(
          "Erro ao carregar exames pendentes:",
          pendingExamsRes.error.message
        );
      }

      setRecentPatients((patientsRes.data as Patient[]) || []);
      setRecentPrescriptions((prescriptionsRes.data as Prescription[]) || []);
      setRecentExamTemplates((examTemplatesRes.data as ExamTemplate[]) || []);
      setRecentTopicos((topicosRes.data as TopicoMedico[]) || []);
      setPatientFollowups(
        patientFollowupsRes.error
          ? []
          : ((patientFollowupsRes.data as PatientFollowup[]) || [])
      );
      setPendingExams(
        pendingExamsRes.error
          ? []
          : ((pendingExamsRes.data as PendingExam[]) || [])
      );

      try {
        const prescriptionFavorites = JSON.parse(
          localStorage.getItem("resibook-prescription-template-favorites") || "[]"
        );
        const examFavorites = JSON.parse(
          localStorage.getItem("resibook-exam-template-favorites") || "[]"
        );

        setFavoritePrescriptionCount(
          Array.isArray(prescriptionFavorites) ? prescriptionFavorites.length : 0
        );
        setFavoriteExamCount(Array.isArray(examFavorites) ? examFavorites.length : 0);
      } catch {
        setFavoritePrescriptionCount(0);
        setFavoriteExamCount(0);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const followupQueue = useMemo(
    () =>
      patientFollowups
        .map((patient) => ({
          patient,
          days: getFollowupDays(patient.retorno_previsto_em),
        }))
        .filter((item) => item.days !== null && item.days <= 7)
        .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999)),
    [patientFollowups]
  );
  const overdueFollowups = followupQueue.filter(
    (item) => (item.days ?? 0) < 0
  ).length;
  const upcomingFollowups = followupQueue.length - overdueFollowups;

  if (!loading && sessionReady && isGuest) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-sm">
          <div className="border-b border-amber-100 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] p-6">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                <Lock className="h-5 w-5" />
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Acesso restrito
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                O perfil convidado não pode visualizar dashboard privado, métricas
                assistenciais, pacientes recentes nem prescrições recentes.
              </p>

              <Link
                href="/prescricao"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ir para prescrição
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03]">
        <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fbff_100%)] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
              ResiBook
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Painel principal
            </span>

            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privado por usuário
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Dashboard clínico
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Painel para entrar rápido no fluxo de plantão: buscar conduta,
                abrir prescrição, consultar CID ou revisar conteúdo sem perder
                tempo navegando por várias telas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <HeaderPill label="Pacientes" value={counts.patients} />
              <HeaderPill label="Prescrições" value={counts.prescriptions} />
              <HeaderPill label="Condutas" value={counts.flashcardsDificeis} />
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {loading ? (
            <p className="mt-5 text-sm font-medium text-slate-500">
              Carregando dados do dashboard...
            </p>
          ) : null}
        </div>

        <div className="space-y-5 p-4 md:p-6">
          <section className="overflow-hidden rounded-[26px] border border-cyan-200 bg-white">
            <div className="border-b border-cyan-100 bg-cyan-50/60 px-4 py-4 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">
                    Continuidade clínica
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    O que precisa de atenção agora
                  </h2>
                </div>
                <Link
                  href="/pacientes"
                  className="inline-flex h-9 items-center rounded-xl border border-cyan-200 bg-white px-3 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-50"
                >
                  Abrir carteira de pacientes
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-4 md:p-5 lg:border-r lg:border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">Caso ativo</p>
                  {activeCase ? (
                    <span className="text-xs font-medium text-slate-500">
                      {formatClinicalCaseAge(activeCase)}
                    </span>
                  ) : null}
                </div>

                {activeCase ? (
                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900">
                        {activeCase.severity || "Prioridade a definir"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          activeCase.reassessment?.recordedAt
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {activeCase.reassessment?.recordedAt ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <CircleAlert className="h-3.5 w-3.5" />
                        )}
                        {activeCase.reassessment?.recordedAt
                          ? "Reavaliado"
                          : "Reavaliação pendente"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">
                      {activeCase.complaint}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {[activeCase.age, activeCase.sex].filter(Boolean).join(" • ") ||
                        "Identificação ainda não preenchida"}
                    </p>
                    {activeCase.selectedCid?.codigo ? (
                      <p className="mt-2 text-xs font-semibold text-cyan-900">
                        CID {activeCase.selectedCid.codigo} · {activeCase.selectedCid.descricao}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/caso-rapido?q=${encodeURIComponent(activeCase.complaint)}`}
                        className="inline-flex h-9 items-center rounded-xl bg-cyan-800 px-3 text-xs font-semibold text-white transition hover:bg-cyan-900"
                      >
                        Continuar atendimento
                      </Link>
                      <Link
                        href={`/exames-evolucao?q=${encodeURIComponent(activeCase.complaint)}`}
                        className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Evolução / exames
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                    <p className="text-sm text-slate-600">
                      Nenhum atendimento ativo neste navegador.
                    </p>
                    <Link
                      href="/caso-rapido"
                      className="mt-3 inline-flex h-9 items-center rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white"
                    >
                      Iniciar Caso Rápido
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-5">
                <div className="grid grid-cols-3 gap-2">
                  <OperationalMetric
                    label="Atrasados"
                    value={overdueFollowups}
                    tone={overdueFollowups ? "risk" : "default"}
                  />
                  <OperationalMetric label="Próximos" value={upcomingFollowups} />
                  <OperationalMetric label="Exames" value={pendingExams.length} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Retornos
                      </p>
                      <Link
                        href="/pacientes?seguimento=overdue"
                        className="text-xs font-semibold text-cyan-800"
                      >
                        Ver fila
                      </Link>
                    </div>
                    <div className="mt-2 space-y-2">
                      {followupQueue.slice(0, 3).map(({ patient, days }) => (
                        <Link
                          key={patient.id}
                          href={`/pacientes/${patient.id}?secao=consulta`}
                          title={`Retorno: ${formatDateOnly(
                            patient.retorno_previsto_em
                          )}`}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100"
                        >
                          <span className="min-w-0 truncate text-xs font-semibold text-slate-800">
                            {patient.nome}
                          </span>
                          <span
                            className={`shrink-0 text-[11px] font-semibold ${
                              (days ?? 0) < 0 ? "text-rose-700" : "text-slate-500"
                            }`}
                          >
                            {(days ?? 0) < 0
                              ? `${Math.abs(days || 0)}d atraso`
                              : days === 0
                              ? "hoje"
                              : `${days}d`}
                          </span>
                        </Link>
                      ))}
                      {followupQueue.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
                          Nenhum retorno próximo.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Exames pendentes
                      </p>
                      <Link
                        href="/pacientes"
                        className="text-xs font-semibold text-cyan-800"
                      >
                        Pacientes
                      </Link>
                    </div>
                    <div className="mt-2 space-y-2">
                      {pendingExams.slice(0, 3).map((exam) => (
                        <Link
                          key={exam.id}
                          href={`/pacientes/${exam.patient_id}?secao=exames`}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100"
                        >
                          <span className="min-w-0 truncate text-xs font-semibold text-slate-800">
                            {exam.nome_exame}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium text-slate-500">
                            {exam.status === "recebido" ? "revisar" : "aguardando"}
                          </span>
                        </Link>
                      ))}
                      {pendingExams.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
                          Nenhum exame pendente.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Fluxo de plantão
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  O que você quer fazer agora?
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-500">
                Atalhos diretos para as ações que mais economizam tempo no PA e no estudo.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <ActionCard
                href="/caso-rapido"
                title="Caso rápido"
                description="Montar plano inicial de plantão."
                icon={Gauge}
              />
              <ActionCard
                href="/condutas"
                title="Buscar conduta"
                description="Abrir protocolos marcados por você."
                icon={Siren}
              />
              <ActionCard
                href="/prescricao"
                title="Gerar prescrição"
                description="Acessar modelos e copiar rápido."
                icon={ClipboardList}
              />
              <ActionCard
                href="/exames-evolucao"
                title="Copiar evolução"
                description="Usar blocos de exame e evolução."
                icon={FileText}
              />
              <ActionCard
                href="/cids"
                title="Consultar CID"
                description="Buscar código e descrição."
                icon={Tags}
              />
              <ActionCard
                href="/flashcards"
                title="Revisar"
                description="Voltar para os flashcards."
                icon={Brain}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-4 md:p-5">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Queixas rápidas
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Entradas por síndrome, não só por doença
                </h2>
              </div>

              <Link
                href="/condutas"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Search className="h-4 w-4" />
                Ver condutas
              </Link>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {QUICK_COMPLAINTS.map((complaint) => (
                <QuickComplaintCard key={complaint.title} {...complaint} />
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Pacientes"
              value={counts.patients}
              description="Cadastros do seu login"
              href="/pacientes"
              icon={Users}
            />

            <MetricCard
              title="Prescrições"
              value={counts.prescriptions}
              description="Itens salvos por você"
              href="/prescricao"
              icon={ClipboardList}
            />

            <MetricCard
              title="Exames / Evolução"
              value={counts.examTemplates}
              description="Biblioteca compartilhada"
              href="/exames-evolucao"
              icon={FlaskConical}
            />

            <MetricCard
              title="Tópicos"
              value={counts.topicosMedicos}
              description="Biblioteca médica"
              href="/topicos"
              icon={Stethoscope}
            />

            <MetricCard
              title="Flashcards"
              value={counts.flashcards}
              description="Biblioteca compartilhada"
              href="/flashcards"
              icon={Brain}
            />

            <MetricCard
              title="Condutas"
              value={counts.flashcardsDificeis}
              description="Marcadas por você"
              href="/condutas"
              icon={Siren}
            />

            <MetricCard
              title="CIDs"
              value={counts.cids}
              description="Base de consulta"
              href="/cids"
              icon={Tags}
            />

            <MetricCard
              title="Revisão"
              value={counts.topicosMedicos}
              description="Modo estudo"
              href="/topicos"
              icon={BookOpen}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
          <SectionHeader
            title="Atalhos rápidos"
            description="Fluxos mais usados no dia a dia."
          />

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ShortcutCard
              href="/pacientes"
              title="Abrir pacientes"
              description="Cadastro, busca e edição rápida."
              icon={Users}
            />

            <ShortcutCard
              href="/prescricao"
              title="Abrir prescrição"
              description="Biblioteca, formulário e histórico."
              icon={ClipboardList}
            />

            <ShortcutCard
              href="/exames-evolucao"
              title="Abrir exames"
              description="Blocos clínicos e evolução."
              icon={FlaskConical}
            />

            <ShortcutCard
              href="/topicos"
              title="Abrir tópicos"
              description="Consultar biblioteca médica."
              icon={Stethoscope}
            />

            <ShortcutCard
              href="/flashcards"
              title="Abrir flashcards"
              description="Revisão médica rápida."
              icon={Brain}
            />

            <ShortcutCard
              href="/condutas"
              title="Abrir condutas"
              description="Protocolos marcados por você."
              icon={Siren}
            />

            <ShortcutCard
              href="/cids"
              title="Consultar CIDs"
              description="Buscar códigos e descrições."
              icon={Tags}
            />

            <ShortcutCard
              href="/metricas"
              title="Métricas"
              description="Ver seus indicadores clínicos."
              icon={BarChart3}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
          <SectionHeader
            title="Favoritos salvos"
            description="Modelos favoritos para acesso rápido neste navegador."
          />

          <div className="mt-5 space-y-4">
            <FavoriteStatCard
              title="Favoritos de prescrição"
              value={favoritePrescriptionCount}
              description="Modelos marcados na biblioteca de plantão."
              href="/prescricao"
            />

            <FavoriteStatCard
              title="Favoritos de exames"
              value={favoriteExamCount}
              description="Blocos mais usados em exames e evolução."
              href="/exames-evolucao"
            />

            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fluxo recomendado
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Paciente → Prescrição → Exames/Evolução → Tópicos → Flashcards.
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentPanel
          title="Pacientes recentes"
          actionHref="/pacientes"
          actionLabel="Ver todos"
        >
          {recentPatients.length === 0 ? (
            <EmptyState text="Nenhum paciente recente no seu login." />
          ) : (
            <div className="space-y-3">
              {recentPatients.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.nome}
                  subtitle={
                    item.especialidade
                      ? `${item.especialidade}${
                          item.queixa ? ` • ${item.queixa}` : ""
                        }`
                      : item.queixa || "Sem observação"
                  }
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Prescrições recentes"
          actionHref="/prescricao"
          actionLabel="Abrir módulo"
        >
          {recentPrescriptions.length === 0 ? (
            <EmptyState text="Nenhuma prescrição recente no seu login." />
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.medicamento || "Sem medicamento"}
                  subtitle={item.paciente_nome || "Paciente não vinculado"}
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Exames / evolução recentes"
          actionHref="/exames-evolucao"
          actionLabel="Abrir módulo"
        >
          {recentExamTemplates.length === 0 ? (
            <EmptyState text="Nenhum bloco recente." />
          ) : (
            <div className="space-y-3">
              {recentExamTemplates.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.titulo}
                  subtitle={item.categoria || "Sem categoria"}
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Tópicos atualizados"
          actionHref="/topicos"
          actionLabel="Abrir tópicos"
        >
          {recentTopicos.length === 0 ? (
            <EmptyState text="Nenhum tópico recente." />
          ) : (
            <div className="space-y-3">
              {recentTopicos.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.titulo}
                  subtitle={item.area}
                  meta={formatDate(item.atualizado_em)}
                />
              ))}
            </div>
          )}
        </RecentPanel>
      </section>
    </div>
  );
}

function OperationalMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "risk";
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        tone === "risk"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === "risk" ? "text-rose-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function HeaderPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 pb-4">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}


function ActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-white">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </Link>
  );
}

function QuickComplaintCard({
  title,
  description,
  href,
  group,
}: {
  title: string;
  description: string;
  href: string;
  group: string;
}) {
  const query = encodeURIComponent(title);
  const actions = [
    { label: "Caso", href: `/caso-rapido?q=${query}` },
    { label: "Conduta", href },
    { label: "Rx", href: `/prescricao?q=${query}` },
    { label: "Exames", href: `/exames-evolucao?q=${query}` },
    { label: "CID", href: `/cids?q=${query}` },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={href}
          className="min-w-0 text-sm font-semibold text-slate-950 transition hover:text-cyan-700"
        >
          {title}
        </Link>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {group}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-950 hover:text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </article>
  );
}

function MetricCard({
  title,
  value,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function ShortcutCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

function FavoriteStatCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-base font-semibold text-slate-800">
          {value}
        </div>
      </div>
    </Link>
  );
}

function RecentPanel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
          {title}
        </h2>

        <Link
          href={actionHref}
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function RecentRow({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {meta}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}


