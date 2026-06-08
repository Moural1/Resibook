"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  HeartPulse,
  Pill,
  ShieldAlert,
  Users,
} from "lucide-react";

type Patient = {
  id: string;
  nome: string;
  idade?: number | null;
  created_at?: string | null;
  gestante?: boolean | null;
  funcao_renal_alterada?: boolean | null;
  hepatopatia?: boolean | null;
  idoso_fragil?: boolean | null;
  diabetes?: boolean | null;
  epilepsia?: boolean | null;
  asma?: boolean | null;
  gastrite_ulcera?: boolean | null;
  insuficiencia_cardiaca?: boolean | null;
  arritmia_qt_longo?: boolean | null;
  uso_anticoagulante?: boolean | null;
  uso_isrs?: boolean | null;
  uso_sedativos?: boolean | null;
};

type Prescription = {
  id: number;
  patient_id?: string | null;
  paciente_nome?: string | null;
  medicamento?: string | null;
  via?: string | null;
  created_at?: string | null;
};


type HighRiskConfirmationLog = {
  id: number;
  prescription_id?: number | null;
  patient_id?: string | null;
  paciente_nome?: string | null;
  medication_text?: string | null;
  high_risk_count: number;
  high_risk_titles?: string[] | null;
  confirmation_reason?: string | null;
  confirmed_at?: string | null;
  created_at?: string | null;
};

const GUEST_EMAIL = "convidado@resibook.com";

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function extractMedicationLabel(value?: string | null) {
  const clean = (value || "").trim();
  if (!clean) return "Sem medicamento";

  const firstLine = clean.split("\n")[0]?.trim() || clean;
  return firstLine.length > 56 ? `${firstLine.slice(0, 56)}...` : firstLine;
}


function buildTopConfirmedAlerts(logs: HighRiskConfirmationLog[]) {
  const counter = new Map<string, number>();

  logs.forEach((item) => {
    (item.high_risk_titles || []).forEach((title) => {
      const clean = (title || "").trim();
      if (!clean) return;
      counter.set(clean, (counter.get(clean) || 0) + 1);
    });
  });

  return Array.from(counter.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "pt-BR"))
    .slice(0, 8);
}

function buildTopConfirmedMedications(logs: HighRiskConfirmationLog[]) {
  const counter = new Map<string, number>();

  logs.forEach((item) => {
    const label = extractMedicationLabel(item.medication_text);
    counter.set(label, (counter.get(label) || 0) + 1);
  });

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 8);
}

function computePatientRiskScore(patient: Patient) {
  let score = 0;

  if (patient.gestante) score += 2;
  if (patient.funcao_renal_alterada) score += 2;
  if (patient.hepatopatia) score += 2;
  if (patient.idoso_fragil) score += 1;
  if (patient.diabetes) score += 1;
  if (patient.epilepsia) score += 1;
  if (patient.asma) score += 1;
  if (patient.gastrite_ulcera) score += 1;
  if (patient.insuficiencia_cardiaca) score += 1;
  if (patient.arritmia_qt_longo) score += 1;
  if (patient.uso_anticoagulante) score += 2;
  if (patient.uso_isrs) score += 1;
  if (patient.uso_sedativos) score += 1;

  if ((patient.idade ?? 0) >= 60) score += 1;

  return score;
}

function buildTopMedicationRows(prescriptions: Prescription[]) {
  const counter = new Map<string, number>();

  prescriptions.forEach((item) => {
    const label = extractMedicationLabel(item.medicamento);
    counter.set(label, (counter.get(label) || 0) + 1);
  });

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 8);
}

function buildRiskBreakdown(patients: Patient[]) {
  const items = [
    { key: "gestante", label: "Gestação" },
    { key: "funcao_renal_alterada", label: "Risco renal" },
    { key: "hepatopatia", label: "Hepatopatia" },
    { key: "idoso_fragil", label: "Idoso frágil" },
    { key: "diabetes", label: "Diabetes" },
    { key: "epilepsia", label: "Epilepsia" },
    { key: "asma", label: "Asma" },
    { key: "gastrite_ulcera", label: "Gastrite / úlcera" },
    { key: "insuficiencia_cardiaca", label: "Insuficiência cardíaca" },
    { key: "arritmia_qt_longo", label: "Arritmia / QT longo" },
    { key: "uso_anticoagulante", label: "Uso de anticoagulante" },
    { key: "uso_isrs", label: "Uso de ISRS" },
    { key: "uso_sedativos", label: "Uso de sedativos" },
  ] as const;

  return items
    .map((item) => ({
      label: item.label,
      count: patients.filter((patient) => Boolean((patient as Record<string, unknown>)[item.key])).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

function buildHighRiskPatients(patients: Patient[]) {
  return patients
    .map((patient) => ({
      ...patient,
      score: computePatientRiskScore(patient),
    }))
    .filter((patient) => patient.score >= 3)
    .sort((a, b) => b.score - a.score || (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    .slice(0, 8);
}

function Card({
  icon,
  title,
  value,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
        </div>

        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function MetricasPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [confirmations, setConfirmations] = useState<HighRiskConfirmationLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      const user = sessionData.session?.user || null;
      const email = user?.email?.trim().toLowerCase() || "";
      const userId = user?.id || null;
      const guest = email === GUEST_EMAIL;

      setIsGuest(guest);
      setCurrentUserId(userId);

      if (!userId || guest) {
        setPatients([]);
        setPrescriptions([]);
        setConfirmations([]);
        setLoading(false);
        return;
      }

      const [patientsRes, prescriptionsRes, confirmationsRes] = await Promise.all([
        supabase
          .from("patients")
          .select(
            "id, nome, idade, created_at, gestante, funcao_renal_alterada, hepatopatia, idoso_fragil, diabetes, epilepsia, asma, gastrite_ulcera, insuficiencia_cardiaca, arritmia_qt_longo, uso_anticoagulante, uso_isrs, uso_sedativos"
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("prescriptions")
          .select("id, patient_id, paciente_nome, medicamento, via, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("high_risk_confirmation_logs")
          .select(
            "id, prescription_id, patient_id, paciente_nome, medication_text, high_risk_count, high_risk_titles, confirmation_reason, confirmed_at, created_at"
          )
          .eq("user_id", userId)
          .order("confirmed_at", { ascending: false }),
      ]);

      if (patientsRes.error) {
        setError(patientsRes.error.message);
        setPatients([]);
      } else {
        setPatients((patientsRes.data as Patient[]) || []);
      }

      if (prescriptionsRes.error) {
        setError((current) => current || prescriptionsRes.error.message);
        setPrescriptions([]);
      } else {
        setPrescriptions((prescriptionsRes.data as Prescription[]) || []);
      }

      if (confirmationsRes.error) {
        setError((current) => current || confirmationsRes.error.message);
        setConfirmations([]);
      } else {
        setConfirmations((confirmationsRes.data as HighRiskConfirmationLog[]) || []);
      }

      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const metrics = useMemo(() => {
    const now = new Date();
    const monthStartIso = startOfMonthIso();

    const patientCount = patients.length;
    const prescriptionCount = prescriptions.length;
    const thisMonthPrescriptions = prescriptions.filter(
      (item) => item.created_at && item.created_at >= monthStartIso
    ).length;

    const highRiskPatients = buildHighRiskPatients(patients);
    const riskBreakdown = buildRiskBreakdown(patients);
    const topMedications = buildTopMedicationRows(prescriptions);
    const thisMonthConfirmations = confirmations.filter(
      (item) => (item.confirmed_at || item.created_at) && (item.confirmed_at || item.created_at)! >= monthStartIso
    ).length;
    const totalConfirmedAlerts = confirmations.reduce(
      (sum, item) => sum + (item.high_risk_count || 0),
      0
    );
    const topConfirmedAlerts = buildTopConfirmedAlerts(confirmations);
    const topConfirmedMedications = buildTopConfirmedMedications(confirmations);

    const patientsWithAnyRisk = patients.filter(
      (patient) => computePatientRiskScore(patient) > 0
    ).length;

    const averageRiskScore =
      patientCount > 0
        ? (
            patients.reduce(
              (sum, patient) => sum + computePatientRiskScore(patient),
              0
            ) / patientCount
          ).toFixed(1)
        : "0.0";

    const recentPrescriptions = prescriptions.slice(0, 8);
    const recentConfirmations = confirmations.slice(0, 8);

    return {
      now,
      patientCount,
      prescriptionCount,
      thisMonthPrescriptions,
      highRiskPatients,
      riskBreakdown,
      topMedications,
      patientsWithAnyRisk,
      averageRiskScore,
      recentPrescriptions,
      recentConfirmations,
      thisMonthConfirmations,
      totalConfirmedAlerts,
      topConfirmedAlerts,
      topConfirmedMedications,
    };
  }, [patients, prescriptions, confirmations]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
        Carregando métricas clínicas...
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Erro ao carregar métricas</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
      </section>
    );
  }

  if (isGuest || !currentUserId) {
    return (
      <section className="rounded-[28px] border border-amber-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Acesso restrito</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          O usuário convidado não pode acessar métricas privadas do ResiBook.
        </p>
        <div className="mt-5">
          <Link
            href="/prescricao"
            className="inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Voltar para Prescrição
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Dashboard clínico
          </span>

          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Atualizado em {formatDate(new Date().toISOString())}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Métricas clínicas e de risco
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Visão rápida dos pacientes, prescrições e fatores clínicos estruturados do seu ResiBook.
          Esse painel ajuda a identificar grupos de risco, padrões de prescrição e pontos que merecem mais atenção.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card
          icon={<Users className="h-5 w-5" />}
          title="Pacientes"
          value={metrics.patientCount}
          hint={`${metrics.patientsWithAnyRisk} com algum fator clínico estruturado`}
        />

        <Card
          icon={<Pill className="h-5 w-5" />}
          title="Prescrições"
          value={metrics.prescriptionCount}
          hint={`${metrics.thisMonthPrescriptions} registradas no mês atual`}
        />

        <Card
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Pacientes de maior risco"
          value={metrics.highRiskPatients.length}
          hint="Score clínico >= 3 nesta visão inicial"
        />

        <Card
          icon={<HeartPulse className="h-5 w-5" />}
          title="Score médio de risco"
          value={metrics.averageRiskScore}
          hint="Baseado nos fatores estruturados cadastrados"
        />

        <Card
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Confirmações de alto risco"
          value={metrics.recentConfirmations.length}
          hint={`${metrics.thisMonthConfirmations} registradas no mês atual`}
        />

        <Card
          icon={<BarChart3 className="h-5 w-5" />}
          title="Alertas críticos confirmados"
          value={metrics.totalConfirmedAlerts}
          hint="Soma dos alertas vermelhos confirmados"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fatores clínicos mais frequentes</h2>
              <p className="text-sm text-slate-500">Baseado nos campos estruturados dos pacientes.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.riskBreakdown.length ? (
              metrics.riskBreakdown.map((item) => {
                const width =
                  metrics.patientCount > 0
                    ? Math.max(8, Math.round((item.count / metrics.patientCount) * 100))
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">{item.count}</span>
                    </div>

                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-slate-900"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Ainda não há fatores estruturados suficientes para gerar esse ranking.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Medicamentos mais usados</h2>
              <p className="text-sm text-slate-500">Resumo simples a partir do texto da prescrição.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.topMedications.length ? (
              metrics.topMedications.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                  </div>
                  <span className="inline-flex min-w-[42px] justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Ainda não há prescrições suficientes para esse ranking.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pacientes com maior score clínico</h2>
              <p className="text-sm text-slate-500">Priorização rápida para revisão clínica.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.highRiskPatients.length ? (
              metrics.highRiskPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{patient.nome}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {patient.idade ? `${patient.idade} anos` : "Idade não informada"}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Score {patient.score}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {patient.gestante ? <Tag label="Gestação" /> : null}
                    {patient.funcao_renal_alterada ? <Tag label="Renal" /> : null}
                    {patient.hepatopatia ? <Tag label="Hepatopatia" /> : null}
                    {patient.idoso_fragil ? <Tag label="Idoso frágil" /> : null}
                    {patient.uso_anticoagulante ? <Tag label="Anticoagulante" /> : null}
                    {patient.arritmia_qt_longo ? <Tag label="QT / arritmia" /> : null}
                    {patient.epilepsia ? <Tag label="Epilepsia" /> : null}
                    {patient.gastrite_ulcera ? <Tag label="Gastrite / úlcera" /> : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Ainda não há pacientes com score clínico elevado.
              </div>
            )}
          </div>
        </div>


        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Auditoria de risco alto</h2>
                <p className="text-sm text-slate-500">
                  O que mais está exigindo confirmação antes de salvar.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Alertas mais confirmados
                </h3>

                <div className="mt-4 space-y-3">
                  {metrics.topConfirmedAlerts.length ? (
                    metrics.topConfirmedAlerts.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">{item.title}</span>
                        <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      Ainda não há confirmações de alto risco registradas.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Medicamentos mais confirmados
                </h3>

                <div className="mt-4 space-y-3">
                  {metrics.topConfirmedMedications.length ? (
                    metrics.topConfirmedMedications.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      Assim que você confirmar riscos altos, eles aparecem aqui.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Confirmações recentes</h2>
                <p className="text-sm text-slate-500">
                  Últimas confirmações de prescrição com alerta alto.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {metrics.recentConfirmations.length ? (
                metrics.recentConfirmations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.paciente_nome || "Paciente não vinculado"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {extractMedicationLabel(item.medication_text)}
                        </p>
                      </div>

                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {formatDate(item.confirmed_at || item.created_at)}
                      </span>
                    </div>

                    {item.high_risk_titles?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.high_risk_titles.map((title, index) => (
                          <span
                            key={`${item.id}-${index}`}
                            className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-medium text-rose-700"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Ainda não há confirmações recentes.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Prescrições recentes</h2>
              <p className="text-sm text-slate-500">Últimos registros do seu usuário.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.recentPrescriptions.length ? (
              metrics.recentPrescriptions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {extractMedicationLabel(item.medicamento)}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {item.paciente_nome || "Paciente não vinculado"}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {item.via ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      Via: {item.via}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Ainda não há prescrições registradas.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
      {label}
    </span>
  );
}