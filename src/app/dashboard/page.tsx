"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  Search,
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
      <section className="overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700"><Lock className="h-5 w-5" /></div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Central clínica privada</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">O perfil convidado pode consultar o banco clínico, mas não visualiza casos ativos, pacientes ou pendências pessoais.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/prescricao" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">Abrir prescrições</Link>
              <Link href="/condutas" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Consultar condutas</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#071a35_0%,#0a2850_58%,#075f70_140%)] px-5 py-6 text-white md:px-8 md:py-8">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-cyan-300/10 bg-cyan-300/5" />
          <div className="pointer-events-none absolute right-16 top-12 h-28 w-28 rounded-full border border-white/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100"><HeartPulse className="h-3.5 w-3.5" /> Central clínica</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Apoio ao plantão</span>
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">O que precisa ser resolvido agora?</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Comece pelo caso, avance para a decisão clínica e mantenha o atendimento conectado — sem perder tempo procurando ferramentas.</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                href={activeCase ? "/caso-rapido" : "/plantao/roteiro-caso"}
                style={{ color: "#071a35" }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold transition hover:bg-cyan-50"
              >
                {activeCase ? "Continuar atendimento" : "Iniciar atendimento"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/plantao" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">Central de plantão</Link>
            </div>
          </div>
        </div>
        <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
          <ClinicalStatus icon={activeCase ? Activity : CheckCircle2} label="Atendimento" value={activeCase ? "Caso em andamento" : "Pronto para iniciar"} tone={activeCase ? "active" : "neutral"} />
          <ClinicalStatus icon={Clock3} label="Acompanhamento" value={loading ? "Atualizando..." : `${todayCount} ${todayCount === 1 ? "item" : "itens"} para revisar`} tone={todayCount > 0 ? "attention" : "neutral"} />
          <ClinicalStatus icon={Brain} label="Revisão" value={loading ? "Atualizando..." : `${difficultFlashcards} ponto${difficultFlashcards === 1 ? "" : "s"} ${difficultFlashcards === 1 ? "difícil" : "difíceis"}`} tone="neutral" />
        </div>
      </section>

      {error ? <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>Alguns dados pessoais não puderam ser atualizados: {error}</span></div> : null}
      {activeCase ? <ActiveCasePanel activeCase={activeCase} vitals={caseVitals} /> : <EmptyCasePanel />}

      <section aria-labelledby="clinical-actions-title" className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.02] md:p-6">
        <SectionHeading eyebrow="Atendimento" title="Comece pela ação clínica" description="As quatro portas mais usadas na rotina. O restante continua logo abaixo, sem ocupar a tela inteira." icon={Stethoscope} id="clinical-actions-title" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRIMARY_ACTIONS.map((action, index) => <PrimaryActionCard key={action.href} {...action} href={withCaseQuery(action.href, activeCase)} emphasis={index === 0} />)}
        </div>
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-slate-50/70">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-slate-800 marker:hidden">
            <span className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-cyan-700" />Mais ferramentas do atendimento</span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-500">{visibleClinicalTools.length} recursos<ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></span>
          </summary>
          <div className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleClinicalTools.map((tool) => <CompactToolLink key={tool.href} {...tool} href={withCaseQuery(tool.href, activeCase)} />)}
          </div>
        </details>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section aria-labelledby="quick-access-title" className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.02] md:p-6">
          <SectionHeading eyebrow="Acesso rápido" title="Problemas frequentes no plantão" description="Entre direto no fluxo da queixa. A busca clínica no topo continua disponível para qualquer outro termo." icon={Search} id="quick-access-title" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickComplaints.map((complaint) => (
              <Link key={complaint.title} href={complaint.href} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition group-hover:border-cyan-200 group-hover:text-cyan-700"><Activity className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-950">{complaint.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{complaint.description}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-700" />
              </Link>
            ))}
          </div>
        </section>
        <TodayPanel followups={followupQueue} exams={pendingExams} loading={loading} />
      </div>

      <section aria-labelledby="secondary-areas-title" className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.02] md:p-6">
        <SectionHeading eyebrow="Depois do atendimento" title="Estudo e acervo pessoal" description="As áreas de retenção ficam acessíveis sem competir com as decisões do plantão." icon={LibraryBig} id="secondary-areas-title" />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <AreaCard eyebrow="Resibook Learn" title="Estudar e revisar" description="Tópicos, revisão ativa e registro dos pontos que você não quer errar novamente." actions={STUDY_ACTIONS} accent="cyan" />
          <AreaCard eyebrow="Meu Resibook" title="Seu workspace clínico" description="Conteúdo privado, pacientes e materiais que acompanham a sua rotina." actions={[
            { title: "Meu Resibook", description: "Acervo pessoal", href: "/meu-resibook", icon: LibraryBig },
            ...(PRODUCT_CAPABILITIES.patientRecords ? [{ title: "Pacientes", description: "Continuidade clínica", href: "/pacientes", icon: Users }] : []),
            { title: "Modelos de prescrição", description: "Banco organizado", href: "/modelos-prescricao", icon: ClipboardList },
            { title: "Exames e evolução", description: "Textos prontos", href: "/exames-evolucao", icon: FlaskConical },
          ]} accent="navy" />
        </div>
      </section>
    </div>
  );
}

function ClinicalStatus({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "active" | "attention" | "neutral" }) {
  const iconTone = tone === "active" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : tone === "attention" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-600";
  return <div className="flex min-w-0 items-center gap-3 bg-white px-4 py-3.5 md:px-5"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconTone}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span><span className="mt-0.5 block truncate text-sm font-semibold text-slate-800">{value}</span></span></div>;
}

function ActiveCasePanel({ activeCase, vitals }: { activeCase: ClinicalCaseSession; vitals: Array<[string, string]> }) {
  const encodedComplaint = encodeURIComponent(activeCase.complaint);
  const patientDescription = [activeCase.age, activeCase.sex].filter(Boolean).join(" · ");
  return (
    <section aria-labelledby="active-case-title" className="overflow-hidden rounded-[28px] border border-cyan-900/20 bg-[#081a3a] text-white shadow-[0_18px_50px_rgba(8,26,58,0.14)]">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Atendimento em andamento</span><span className="text-xs text-slate-400">{formatClinicalCaseAge(activeCase)}</span></div>
          <h2 id="active-case-title" className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{activeCase.complaint}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
            {patientDescription ? <span>{patientDescription}</span> : null}
            {activeCase.severity ? <span>Prioridade: {activeCase.severity}</span> : null}
            {activeCase.selectedCid?.codigo ? <span>CID {activeCase.selectedCid.codigo}</span> : null}
            {activeCase.reassessment ? <span className="text-cyan-200">Reavaliação registrada</span> : null}
          </div>
          {vitals.length ? <div className="mt-5 flex flex-wrap gap-2">{vitals.map(([label, value]) => <span key={label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"><strong className="mr-1.5 text-[10px] uppercase tracking-[0.12em] text-cyan-200">{label}</strong>{value}</span>)}</div> : null}
          {activeCase.redFlags || activeCase.alerts.length ? <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3.5"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Atenção clínica</p><p className="mt-1 text-sm leading-6 text-slate-200">{activeCase.redFlags || activeCase.alerts.slice(0, 2).join(" · ")}</p></div></div> : null}
        </div>
        <div className="border-t border-white/10 bg-white/[0.04] p-4 md:p-5 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próximo passo</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
  return <section className="rounded-[26px] border border-cyan-200/80 bg-[linear-gradient(135deg,#f4fdff_0%,#ffffff_72%)] p-4 shadow-sm md:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-cyan-700"><Stethoscope className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-slate-950">Nenhum atendimento ativo</p><p className="mt-1 text-sm leading-6 text-slate-600">Inicie um caso para manter queixa, risco, conduta, prescrição e pendências conectados durante o plantão.</p></div></div><Link href="/plantao/roteiro-caso" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800">Iniciar caso <ArrowRight className="h-4 w-4" /></Link></div></section>;
}

function CaseAction({ href, label, icon: Icon, primary = false }: { href: string; label: string; icon: LucideIcon; primary?: boolean }) {
  return <Link href={href} className={`group flex h-11 items-center justify-between gap-3 rounded-xl border px-3.5 text-sm font-semibold transition ${primary ? "border-cyan-300/20 bg-cyan-300/15 text-white hover:bg-cyan-300/20" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}><span className="flex items-center gap-2.5"><Icon className={`h-4 w-4 ${primary ? "text-cyan-200" : "text-slate-400"}`} />{label}</span><ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" /></Link>;
}

function SectionHeading({ eyebrow, title, description, icon: Icon, id }: { eyebrow: string; title: string; description: string; icon: LucideIcon; id: string }) {
  return <div className="flex items-start gap-3 border-b border-slate-200 pb-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700"><Icon className="h-4.5 w-4.5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p><h2 id={id} className="mt-1 text-lg font-semibold tracking-tight text-slate-950 md:text-xl">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function PrimaryActionCard({ href, title, description, icon: Icon, emphasis }: ClinicalLink & { emphasis: boolean }) {
  return <Link href={href} className={`group relative overflow-hidden rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${emphasis ? "border-slate-950 bg-slate-950 text-white shadow-sm" : "border-slate-200 bg-slate-50/70 text-slate-950 hover:border-cyan-200 hover:bg-white"}`}><div className="flex items-start justify-between gap-4"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${emphasis ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200" : "border-slate-200 bg-white text-cyan-700"}`}><Icon className="h-5 w-5" /></span><ArrowRight className={`h-4 w-4 transition group-hover:translate-x-0.5 ${emphasis ? "text-slate-500 group-hover:text-cyan-200" : "text-slate-300 group-hover:text-cyan-700"}`} /></div><p className="mt-4 text-base font-semibold">{title}</p><p className={`mt-1.5 text-xs leading-5 ${emphasis ? "text-slate-300" : "text-slate-500"}`}>{description}</p></Link>;
}

function CompactToolLink({ href, title, description, icon: Icon }: ClinicalLink) {
  return <Link href={href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-200 hover:shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:bg-cyan-50 group-hover:text-cyan-700"><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-900">{title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{description}</span></span></Link>;
}

function TodayPanel({ followups, exams, loading }: { followups: Array<{ patient: PatientFollowup; days: number | null }>; exams: PendingExam[]; loading: boolean }) {
  const items = [
    ...followups.slice(0, 2).map(({ patient, days }) => ({ key: `followup-${patient.id}`, title: patient.nome, description: days !== null && days < 0 ? `Retorno atrasado há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}` : days === 0 ? "Retorno previsto para hoje" : `Retorno em ${days} dia${days === 1 ? "" : "s"}`, href: `/pacientes?q=${encodeURIComponent(patient.nome)}`, risk: days !== null && days < 0 })),
    ...exams.slice(0, 2).map((exam) => ({ key: `exam-${exam.id}`, title: exam.nome_exame, description: `${exam.status} · ${formatDateOnly(exam.requested_at)}`, href: `/pacientes/${exam.patient_id}`, risk: false })),
  ].slice(0, 4);

  return <section aria-labelledby="today-title" className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.02] md:p-6"><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Continuidade</p><h2 id="today-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Para revisar hoje</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"><Clock3 className="h-4.5 w-4.5" /></span></div><div className="mt-4 space-y-2">{loading ? <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Atualizando pendências...</p> : items.length ? items.map((item) => <Link key={item.key} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-slate-300 hover:bg-white"><span className={`h-2 w-2 shrink-0 rounded-full ${item.risk ? "bg-rose-500" : "bg-cyan-500"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span><span className={`mt-0.5 block truncate text-xs ${item.risk ? "text-rose-700" : "text-slate-500"}`}>{item.description}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-600" /></Link>) : <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-5 text-center"><CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm font-semibold text-emerald-900">Nenhuma pendência imediata</p><p className="mt-1 text-xs text-emerald-700">Retornos próximos e exames pendentes aparecerão aqui.</p></div>}</div></section>;
}

function AreaCard({ eyebrow, title, description, actions, accent }: { eyebrow: string; title: string; description: string; actions: ClinicalLink[]; accent: "cyan" | "navy" }) {
  return <article className={`overflow-hidden rounded-[24px] border p-4 md:p-5 ${accent === "cyan" ? "border-cyan-200 bg-cyan-50/45" : "border-slate-200 bg-slate-50/80"}`}><p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${accent === "cyan" ? "text-cyan-700" : "text-slate-500"}`}>{eyebrow}</p><h3 className="mt-1.5 text-lg font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{actions.map((action) => <Link key={action.href} href={action.href} className="group flex items-center justify-between gap-3 rounded-xl border border-white bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-950/[0.02] transition hover:border-cyan-200"><span className="flex min-w-0 items-center gap-2.5"><action.icon className="h-4 w-4 shrink-0 text-cyan-700" /><span className="leading-snug">{action.title}</span></span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-cyan-700" /></Link>)}</div></article>;
}
