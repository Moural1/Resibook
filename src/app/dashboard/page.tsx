"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import { PRODUCT_CAPABILITIES } from "@/lib/product-config";
import {
  CLINICAL_CASE_SESSION_EVENT,
  formatClinicalCaseAge,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  FlaskConical,
  Gauge,
  GraduationCap,
  HeartPulse,
  LibraryBig,
  ListChecks,
  Lock,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

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

type ClinicalLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  requiresPatientRecords?: boolean;
};

const GUEST_EMAIL = "convidado@resibook.com";

const PRIMARY_ACTIONS: ClinicalLink[] = [
  { title: "Caso rápido", description: "Organize queixa, risco e próximos passos.", href: "/caso-rapido", icon: Gauge },
  { title: "Prescrição", description: "Consulte modelos e monte uma prescrição segura.", href: "/prescricao", icon: Pill },
  { title: "Conduta", description: "Acesse o manejo objetivo por problema clínico.", href: "/condutas", icon: Siren },
  { title: "Calculadora", description: "Aplique escores sem sair do raciocínio clínico.", href: "/calculadoras", icon: Calculator },
];

const CLINICAL_TOOLS: ClinicalLink[] = [
  { title: "Pacientes", description: "Prontuário visual e continuidade.", href: "/pacientes", icon: Users, requiresPatientRecords: true },
  { title: "Exames e evolução", description: "Modelos clínicos copiáveis.", href: "/exames-evolucao", icon: FlaskConical },
  { title: "CIDs", description: "Busca rápida por diagnóstico.", href: "/cids", icon: Tags },
  { title: "ECG guiado", description: "Leitura estruturada do traçado.", href: "/ecg-guiado", icon: HeartPulse },
  { title: "ACLS", description: "Protocolos e algoritmos de emergência.", href: "/acls", icon: Activity },
  { title: "Checklist de risco", description: "Red flags e bloqueios de alta.", href: "/plantao/checklist-risco", icon: ShieldCheck },
  { title: "Alta segura", description: "Critérios, alertas e orientação.", href: "/plantao/alta-segura", icon: ClipboardCheck },
  { title: "Encaminhamento", description: "Narrativa clínica para regulação.", href: "/plantao/encaminhamento", icon: FileText },
];

const STUDY_ACTIONS: ClinicalLink[] = [
  { title: "Tópicos médicos", description: "Consulta clínica por assunto.", href: "/topicos", icon: Stethoscope },
  { title: "Flashcards", description: "Revisão rápida e ativa.", href: "/flashcards", icon: Brain },
  { title: "Revisão por tópicos", description: "Organize sua rotina de estudo.", href: "/revisao-topicos", icon: GraduationCap },
  { title: "Nunca Mais Errar", description: "Transforme falhas em memória clínica.", href: "/nunca-mais-errar", icon: BookOpen },
];

function getFollowupDays(value?: string | null, now = new Date()) {
  if (!value) return null;
  const target = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDateOnly(value?: string | null) {
  if (!value) return "Sem data";
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(parsed);
}

function withCaseQuery(href: string, activeCase: ClinicalCaseSession | null) {
  if (!activeCase?.complaint) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}q=${encodeURIComponent(activeCase.complaint)}`;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [patientFollowups, setPatientFollowups] = useState<PatientFollowup[]>([]);
  const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
  const [difficultFlashcards, setDifficultFlashcards] = useState(0);
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
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refreshActiveCase);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardContext() {
      setLoading(true);
      setError("");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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
        setLoading(false);
        return;
      }

      const [followupsRes, examsRes, difficultRes] = await Promise.all([
        PRODUCT_CAPABILITIES.patientRecords
          ? supabase.from("patients").select("id, nome, retorno_previsto_em").eq("user_id", userId).not("retorno_previsto_em", "is", null).order("retorno_previsto_em", { ascending: true }).limit(8)
          : Promise.resolve({ data: [], error: null }),
        PRODUCT_CAPABILITIES.patientRecords
          ? supabase.from("patient_exam_requests").select("id, patient_id, nome_exame, status, requested_at").eq("user_id", userId).in("status", ["solicitado", "recebido"]).order("requested_at", { ascending: true, nullsFirst: false }).limit(8)
          : Promise.resolve({ data: [], error: null }),
        supabase.from("flashcard_user_marks").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("dificil", true),
      ]);

      if (!mounted) return;
      if (followupsRes.error) console.warn("Erro ao carregar retornos:", followupsRes.error.message);
      if (examsRes.error) console.warn("Erro ao carregar exames pendentes:", examsRes.error.message);
      if (difficultRes.error) console.warn("Erro ao contar flashcards difíceis:", difficultRes.error.message);

      setPatientFollowups(followupsRes.error ? [] : ((followupsRes.data as PatientFollowup[]) || []));
      setPendingExams(examsRes.error ? [] : ((examsRes.data as PendingExam[]) || []));
      setDifficultFlashcards(difficultRes.count ?? 0);
      setLoading(false);
    }

    loadDashboardContext().catch((loadError) => {
      if (!mounted) return;
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a central clínica.");
      setLoading(false);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const followupQueue = useMemo(
    () => patientFollowups
      .map((patient) => ({ patient, days: getFollowupDays(patient.retorno_previsto_em) }))
      .filter((item) => item.days !== null && item.days <= 7)
      .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999)),
    [patientFollowups]
  );

  const visibleClinicalTools = CLINICAL_TOOLS.filter((item) => !item.requiresPatientRecords || PRODUCT_CAPABILITIES.patientRecords);
  const caseVitals = activeCase ? Object.entries(activeCase.vitals).filter(([, value]) => value.trim()) : [];
  const quickComplaints = QUICK_COMPLAINTS.slice(0, 4);
  const todayCount = followupQueue.length + pendingExams.length;

  if (!loading && sessionReady && isGuest) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700"><Lock className="h-5 w-5" /></div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Central clínica privada</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">O perfil convidado pode consultar o banco clínico, mas não visualiza casos ativos, pacientes ou pendências pessoais.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/prescricao" className={BUTTON_PRIMARY}>Abrir prescrições</Link>
            <Link href="/condutas" className={BUTTON_SECONDARY}>Consultar condutas</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-cyan-800">Central clínica</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">O que precisa ser resolvido agora?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Comece pelo caso, avance para a decisão clínica e mantenha o atendimento conectado.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={activeCase ? "/caso-rapido" : "/plantao/roteiro-caso"} className={BUTTON_PRIMARY}>
            {activeCase ? "Continuar atendimento" : "Iniciar atendimento"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/plantao" className={BUTTON_SECONDARY}>Central de plantão</Link>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <ClinicalStatus icon={activeCase ? Activity : CheckCircle2} label="Atendimento" value={activeCase ? "Caso em andamento" : "Pronto para iniciar"} tone={activeCase ? "active" : "neutral"} />
        <ClinicalStatus icon={Clock3} label="Para revisar" value={loading ? "Atualizando..." : `${todayCount} ${todayCount === 1 ? "item" : "itens"}`} tone={todayCount > 0 ? "attention" : "neutral"} />
        <ClinicalStatus icon={Brain} label="Flashcards difíceis" value={loading ? "Atualizando..." : `${difficultFlashcards} ${difficultFlashcards === 1 ? "ponto" : "pontos"}`} tone="neutral" />
      </div>

      {error ? <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>Alguns dados pessoais não puderam ser atualizados: {error}</span></div> : null}
      {activeCase ? <ActiveCasePanel activeCase={activeCase} vitals={caseVitals} /> : <EmptyCasePanel />}

      <Panel id="clinical-actions-title" title="Comece pela ação clínica" description="As quatro portas mais usadas na rotina.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRIMARY_ACTIONS.map((action) => <PrimaryActionCard key={action.href} {...action} href={withCaseQuery(action.href, activeCase)} />)}
        </div>
        <details className="group mt-3 rounded-lg border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-slate-800 marker:hidden">
            <span className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-cyan-800" />Mais ferramentas do atendimento</span>
            <span className="flex items-center gap-2 text-xs text-slate-500">{visibleClinicalTools.length} recursos<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></span>
          </summary>
          <div className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleClinicalTools.map((tool) => <CompactToolLink key={tool.href} {...tool} href={withCaseQuery(tool.href, activeCase)} />)}
          </div>
        </details>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Panel id="quick-access-title" title="Problemas frequentes no plantão" description="Entre direto no fluxo da queixa. A busca no topo cobre qualquer outro termo.">
          <div className="divide-y divide-slate-100">
            {quickComplaints.map((complaint) => (
              <Link key={complaint.title} href={complaint.href} className="group -mx-2 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50">
                <Activity className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-cyan-800" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{complaint.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{complaint.description}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-800" />
              </Link>
            ))}
          </div>
        </Panel>
        <TodayPanel followups={followupQueue} exams={pendingExams} loading={loading} />
      </div>

      <Panel id="secondary-areas-title" title="Estudo e acervo pessoal" description="Para depois do atendimento, sem competir com as decisões do plantão.">
        <div className="grid gap-5 lg:grid-cols-2">
          <AreaList title="Estudar e revisar" actions={STUDY_ACTIONS} />
          <AreaList title="Seu workspace clínico" actions={[
            { title: "Meu Resibook", description: "Acervo pessoal", href: "/meu-resibook", icon: LibraryBig },
            ...(PRODUCT_CAPABILITIES.patientRecords ? [{ title: "Pacientes", description: "Continuidade clínica", href: "/pacientes", icon: Users }] : []),
            { title: "Modelos de prescrição", description: "Banco organizado", href: "/modelos-prescricao", icon: ClipboardList },
            { title: "Exames e evolução", description: "Textos prontos", href: "/exames-evolucao", icon: FlaskConical },
          ]} />
        </div>
      </Panel>
    </div>
  );
}

const BUTTON_PRIMARY = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-800 bg-cyan-800 px-4 text-sm font-medium text-white transition hover:bg-cyan-900";
const BUTTON_SECONDARY = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900";

function Panel({ id, title, description, aside, children }: { id: string; title: string; description?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id={id} className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ClinicalStatus({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "active" | "attention" | "neutral" }) {
  const iconTone = tone === "active" ? "text-cyan-800" : tone === "attention" ? "text-amber-600" : "text-slate-400";
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-3.5">
      <Icon className={`hidden h-5 w-5 shrink-0 sm:block ${iconTone}`} />
      <span className="min-w-0">
        <span className="block text-[11px] leading-4 text-slate-500 sm:text-xs">{label}</span>
        <span className="mt-0.5 block text-sm font-semibold leading-5 text-slate-900 sm:truncate sm:text-[15px]">{value}</span>
      </span>
    </div>
  );
}

function ActiveCasePanel({ activeCase, vitals }: { activeCase: ClinicalCaseSession; vitals: Array<[string, string]> }) {
  const encodedComplaint = encodeURIComponent(activeCase.complaint);
  const patientDescription = [activeCase.age, activeCase.sex].filter(Boolean).join(" · ");
  return (
    <section aria-labelledby="active-case-title" className="overflow-hidden rounded-xl border border-slate-200 border-l-4 border-l-cyan-800 bg-white">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-900"><span className="h-1.5 w-1.5 rounded-full bg-cyan-700" />Atendimento em andamento</span>
            <span className="text-xs text-slate-500">{formatClinicalCaseAge(activeCase)}</span>
          </div>
          <h2 id="active-case-title" className="mt-3 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">{activeCase.complaint}</h2>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {patientDescription ? <span>{patientDescription}</span> : null}
            {activeCase.severity ? <span>Prioridade: {activeCase.severity}</span> : null}
            {activeCase.selectedCid?.codigo ? <span>CID {activeCase.selectedCid.codigo}</span> : null}
            {activeCase.reassessment ? <span className="text-cyan-800">Reavaliação registrada</span> : null}
          </div>
          {vitals.length ? <div className="mt-4 flex flex-wrap gap-2">{vitals.map(([label, value]) => <span key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"><strong className="mr-1.5 font-semibold text-slate-500">{label}</strong>{value}</span>)}</div> : null}
          {activeCase.redFlags || activeCase.alerts.length ? <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><div><p className="text-xs font-semibold text-amber-900">Atenção clínica</p><p className="mt-0.5 text-sm leading-6 text-amber-900">{activeCase.redFlags || activeCase.alerts.slice(0, 2).join(" · ")}</p></div></div> : null}
        </div>
        <div className="border-t border-slate-200 p-4 lg:border-l lg:border-t-0">
          <p className="text-xs font-medium text-slate-500">Próximo passo</p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            <CaseAction href="/caso-rapido" label="Continuar caso" icon={Gauge} primary />
            <CaseAction href={`/condutas?busca=${encodedComplaint}`} label="Abrir conduta" icon={Siren} />
            <CaseAction href={`/prescricao?q=${encodedComplaint}`} label="Montar prescrição" icon={Pill} />
            <CaseAction href={`/plantao/pendencias?q=${encodedComplaint}`} label="Revisar pendências" icon={ListChecks} />
            <CaseAction href={`/plantao/sbar?q=${encodedComplaint}`} label="Preparar passagem SBAR" icon={ClipboardList} />
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyCasePanel() {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-900">Nenhum atendimento ativo</p>
          <p className="mt-0.5 text-sm text-slate-500">Inicie um caso para manter queixa, risco, conduta, prescrição e pendências conectados durante o plantão.</p>
        </div>
      </div>
      <Link href="/plantao/roteiro-caso" className={`${BUTTON_SECONDARY} shrink-0`}>Iniciar caso <ArrowRight className="h-4 w-4" /></Link>
    </section>
  );
}

function CaseAction({ href, label, icon: Icon, primary = false }: { href: string; label: string; icon: LucideIcon; primary?: boolean }) {
  return <Link href={href} className={`group flex h-10 items-center justify-between gap-3 rounded-lg border px-3 text-sm font-medium transition ${primary ? "border-cyan-800 bg-cyan-800 text-white hover:bg-cyan-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}><span className="flex items-center gap-2.5"><Icon className={`h-4 w-4 ${primary ? "text-cyan-100" : "text-slate-400"}`} />{label}</span><ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${primary ? "text-cyan-100" : "text-slate-300 group-hover:text-cyan-800"}`} /></Link>;
}

function PrimaryActionCard({ href, title, description, icon: Icon }: ClinicalLink) {
  return <Link href={href} className="group flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 transition hover:border-cyan-800/40 hover:bg-cyan-50/40"><div className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-cyan-800" /><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-800" /></div><p className="mt-3 text-[15px] font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></Link>;
}

function CompactToolLink({ href, title, description, icon: Icon }: ClinicalLink) {
  return <Link href={href} className="group flex min-w-0 items-center gap-3 rounded-lg p-2.5 transition hover:bg-slate-50"><Icon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-cyan-800" /><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{description}</span></span></Link>;
}

function TodayPanel({ followups, exams, loading }: { followups: Array<{ patient: PatientFollowup; days: number | null }>; exams: PendingExam[]; loading: boolean }) {
  const items = [
    ...followups.slice(0, 2).map(({ patient, days }) => ({ key: `followup-${patient.id}`, title: patient.nome, description: days !== null && days < 0 ? `Retorno atrasado há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}` : days === 0 ? "Retorno previsto para hoje" : `Retorno em ${days} dia${days === 1 ? "" : "s"}`, href: `/pacientes?q=${encodeURIComponent(patient.nome)}`, risk: days !== null && days < 0 })),
    ...exams.slice(0, 2).map((exam) => ({ key: `exam-${exam.id}`, title: exam.nome_exame, description: `${exam.status} · ${formatDateOnly(exam.requested_at)}`, href: `/pacientes/${exam.patient_id}`, risk: false })),
  ].slice(0, 4);

  return (
    <Panel id="today-title" title="Para revisar hoje" description="Retornos próximos e exames pendentes.">
      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Atualizando pendências...</p>
      ) : items.length ? (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <Link key={item.key} href={item.href} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50">
              <span className={`h-2 w-2 shrink-0 rounded-full ${item.risk ? "bg-rose-600" : "bg-cyan-700"}`} />
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{item.title}</span><span className={`mt-0.5 block truncate text-xs ${item.risk ? "text-rose-700" : "text-slate-500"}`}>{item.description}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-600" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-800" />Nenhuma pendência imediata.</div>
      )}
    </Panel>
  );
}

function AreaList({ title, actions }: { title: string; actions: ClinicalLink[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-medium text-slate-500">{title}</h3>
      <div className="mt-2 divide-y divide-slate-100 border-y border-slate-100">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="group flex items-center justify-between gap-3 px-1 py-2.5 text-sm transition hover:bg-slate-50">
            <span className="flex min-w-0 items-center gap-2.5"><action.icon className="h-4 w-4 shrink-0 text-cyan-800" /><span className="font-medium text-slate-900">{action.title}</span><span className="hidden truncate text-xs text-slate-500 sm:inline">{action.description}</span></span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-cyan-800" />
          </Link>
        ))}
      </div>
    </div>
  );
}
