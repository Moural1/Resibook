"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CLINICAL_CASE_SESSION_EVENT,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import { buildCaseRouting } from "@/lib/clinical-case-routing";
import { clinicalCalculators } from "@/lib/clinical-calculators";
import { getSearchScore, rankSearchResults } from "@/lib/search";
import { PRODUCT_CAPABILITIES } from "@/lib/product-config";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Clock3,
  CornerDownLeft,
  FlaskConical,
  ListChecks,
  LogOut,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Tags,
  Users,
  X,
} from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type:
    | "paciente"
    | "prescricao"
    | "modelo_prescricao"
    | "exame"
    | "topico"
    | "cid"
    | "flashcard"
    | "conduta"
    | "calculadora";
};

type SearchAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type PatientRow = { id: string; nome: string | null; especialidade: string | null; queixa: string | null; diagnostico_principal?: string | null };
type PrescriptionRow = { id: number; paciente_nome: string | null; medicamento: string | null; posologia?: string | null };
type PrescriptionTemplateRow = { id: number; categoria: string | null; titulo: string | null; conteudo: string | null; observacoes?: string | null };
type ExamRow = { id: number; titulo: string | null; categoria: string | null; conteudo?: string | null };
type TopicoRow = { id: number; area: string | null; titulo: string | null; resumo: string | null; diagnostico: string | null; exames: string | null; tratamento: string | null; pegadinhas: string | null };
type CidRow = { id: number; codigo: string | null; descricao: string | null; grupo?: string | null };
type FlashcardRow = { id: string; area: string | null; materia: string | null; frente: string | null; verso?: string | null };
type MarkRow = { flashcard_id: string; dificil: boolean | null };
type SessionInfo = { userId: string | null; email: string; isGuest: boolean };

const GUEST_EMAIL = "convidado@resibook.com";
const RECENT_SEARCHES_KEY = "resibook-global-search-recent-v2";

function recentSearchesKey(userId: string | null) {
  return `${RECENT_SEARCHES_KEY}:${userId || "anonymous"}`;
}

function loadRecentSearches(userId: string | null) {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(recentSearchesKey(userId)) || "[]"
    );
    return Array.isArray(stored)
      ? stored
          .filter((item): item is string => typeof item === "string")
          .slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id || null;
  const email = data.session?.user?.email?.trim().toLowerCase() || "";
  return { userId, email, isGuest: email === GUEST_EMAIL };
}

function normalize(value?: string | null) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function badgeLabel(type: SearchResult["type"]) {
  if (type === "paciente") return "Paciente";
  if (type === "prescricao") return "Prescrição";
  if (type === "modelo_prescricao") return "Modelo";
  if (type === "exame") return "Exame";
  if (type === "topico") return "Tópico";
  if (type === "flashcard") return "Flashcard";
  if (type === "conduta") return "Conduta";
  if (type === "calculadora") return "Calculadora";
  return "CID";
}

function badgeClass(type: SearchResult["type"]) {
  if (type === "paciente") return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  if (type === "prescricao") return "border-blue-200/80 bg-blue-50 text-blue-700";
  if (type === "modelo_prescricao") return "border-indigo-200/80 bg-indigo-50 text-indigo-700";
  if (type === "exame") return "border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-700";
  if (type === "topico") return "border-cyan-200/80 bg-cyan-50 text-cyan-700";
  if (type === "flashcard") return "border-pink-200/80 bg-pink-50 text-pink-700";
  if (type === "conduta") return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  if (type === "calculadora") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-amber-200/80 bg-amber-50 text-amber-700";
}

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const className = "h-4 w-4";
  if (type === "paciente") return <Users className={className} />;
  if (type === "prescricao" || type === "modelo_prescricao") return <ClipboardList className={className} />;
  if (type === "exame") return <FlaskConical className={className} />;
  if (type === "topico") return <BookOpen className={className} />;
  if (type === "flashcard") return <Brain className={className} />;
  if (type === "conduta") return <Siren className={className} />;
  if (type === "calculadora") return <Calculator className={className} />;
  return <Tags className={className} />;
}

const fullQuickLinks = [
  ...(PRODUCT_CAPABILITIES.patientRecords
    ? [{ href: "/pacientes", label: "Pacientes", icon: Users }]
    : []),
  { href: "/prescricao", label: "Prescrição", icon: ClipboardList },
  { href: "/exames-evolucao", label: "Exames", icon: FlaskConical },
  { href: "/topicos", label: "Tópicos", icon: Stethoscope },
  { href: "/revisao-topicos", label: "Revisão", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/condutas", label: "Condutas", icon: Siren },
  { href: "/cids", label: "CIDs", icon: Tags },
  { href: "/calculadoras", label: "Calculadoras", icon: Calculator },
];
const guestQuickLinks = fullQuickLinks.filter((item) => ["/prescricao", "/exames-evolucao", "/topicos", "/cids"].includes(item.href));

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchRequestRef = useRef(0);
  const quickLinks = isGuest ? guestQuickLinks : fullQuickLinks;

  const clinicalActions = useMemo<SearchAction[]>(() => {
    const q = query.trim();
    if (!q) return [];
    const routing = buildCaseRouting(q);
    const encoded = encodeURIComponent(routing.searchTerm);
    return [
      { label: "Buscar conduta", description: "Protocolos e manejo relacionado", href: `/condutas?busca=${encoded}`, icon: Siren },
      { label: "Checklist de risco", description: "Red flags e bloqueios de alta", href: `/plantao/checklist-risco?q=${encoded}`, icon: ShieldCheck },
      { label: "Prescrição guiada", description: "Plano, segurança e reavaliação", href: `/plantao/prescricao-guiada?q=${encoded}`, icon: ClipboardList },
      { label: "Alta segura", description: "Orientações e sinais de retorno", href: `/plantao/alta-segura?q=${encoded}`, icon: LogOut },
    ];
  }, [query]);

  const navigableItems = useMemo(() => [
    ...clinicalActions.map((item) => ({ href: item.href, label: item.label })),
    ...results.map((item) => ({ href: item.href, label: item.title })),
  ], [clinicalActions, results]);

  const groupedResults = useMemo(() => {
    const groups: Array<{ label: string; types: SearchResult["type"][] }> = [
      { label: "Condutas e apoio", types: ["conduta", "topico", "calculadora"] },
      { label: "Prescrições", types: ["modelo_prescricao", "prescricao"] },
      { label: "Exames e códigos", types: ["exame", "cid"] },
      { label: "Pacientes e revisão", types: ["paciente", "flashcard"] },
    ];
    return groups.map((group) => ({ label: group.label, items: results.filter((item) => group.types.includes(item.type)) })).filter((group) => group.items.length > 0);
  }, [results]);

  function rememberSearch(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setRecentSearches((current) => {
      const next = [clean, ...current.filter((item) => normalize(item) !== normalize(clean))].slice(0, 5);
      window.localStorage.setItem(
        recentSearchesKey(currentUserId),
        JSON.stringify(next)
      );
      return next;
    });
  }

  function navigateSearch(href: string) {
    rememberSearch(query);
    router.push(href);
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }

  useEffect(() => {
    function refreshActiveCase() { setActiveCase(loadClinicalCaseSession()); }
    refreshActiveCase();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refreshActiveCase);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refreshActiveCase);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    getSessionInfo().then((info) => {
      if (mounted) {
        setIsGuest(info.isGuest);
        setCurrentUserId(info.userId);
        setRecentSearches(loadRecentSearches(info.userId));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsGuest((session?.user?.email?.trim().toLowerCase() || "") === GUEST_EMAIL);
      setCurrentUserId(session?.user?.id || null);
      setRecentSearches(loadRecentSearches(session?.user?.id || null));
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    async function runSearch() {
      if (!q) { setResults([]); setLoading(false); return; }
      const requestId = ++searchRequestRef.current;
      setLoading(true);
      const supabase = createClient();
      const sessionInfo = await getSessionInfo();
      if (requestId !== searchRequestRef.current) return;
      setIsGuest(sessionInfo.isGuest);
      if (!sessionInfo.userId) { setResults([]); setLoading(false); return; }
      const userId = sessionInfo.userId;
      const guest = sessionInfo.isGuest;
      const [patientsRes, prescriptionsRes, prescriptionTemplatesRes, examsRes, topicosRes, cidsRes, flashcardsRes, condutasMarksRes] = await Promise.all([
        guest || !PRODUCT_CAPABILITIES.patientRecords ? Promise.resolve({ data: [], error: null }) : supabase.from("patients").select("id, nome, especialidade, queixa, diagnostico_principal").eq("user_id", userId).limit(40),
        guest ? Promise.resolve({ data: [], error: null }) : supabase.from("prescriptions").select("id, paciente_nome, medicamento, posologia").eq("user_id", userId).limit(40),
        supabase.from("prescription_templates").select("id, categoria, titulo, conteudo, observacoes").limit(60),
        supabase.from("exam_templates").select("id, titulo, categoria, conteudo").limit(40),
        supabase.from("topicos_medicos").select("id, area, titulo, resumo, diagnostico, exames, tratamento, pegadinhas").limit(60),
        supabase.from("cids").select("id, codigo, descricao, grupo").limit(60),
        guest ? Promise.resolve({ data: [], error: null }) : supabase.from("flashcards").select("id, area, materia, frente, verso").limit(60),
        guest ? Promise.resolve({ data: [], error: null }) : supabase.from("flashcard_user_marks").select("flashcard_id, dificil").eq("user_id", userId).eq("dificil", true).limit(200),
      ]);
      if (requestId !== searchRequestRef.current) return;
      const patientResults: SearchResult[] = rankSearchResults((patientsRes.data || []) as PatientRow[], q, (item) => [{ value: item.nome, weight: 12 }, { value: item.queixa, weight: 7 }, { value: item.diagnostico_principal, weight: 7 }, { value: item.especialidade, weight: 5 }]).map((item) => ({ id: `paciente-${item.id}`, title: item.nome || "Paciente sem nome", subtitle: item.especialidade || item.queixa || item.diagnostico_principal || "Cadastro de paciente", href: `/pacientes?q=${encodeURIComponent(item.nome || q)}`, type: "paciente" }));
      const prescriptionResults: SearchResult[] = rankSearchResults((prescriptionsRes.data || []) as PrescriptionRow[], q, (item) => [{ value: item.medicamento, weight: 10 }, { value: item.paciente_nome, weight: 7 }, { value: item.posologia, weight: 5 }]).map((item) => ({ id: `prescricao-${item.id}`, title: item.medicamento || "Prescrição sem medicamento", subtitle: item.paciente_nome || item.posologia || "Prescrição clínica", href: `/prescricao?q=${encodeURIComponent(item.medicamento || q)}`, type: "prescricao" }));
      const prescriptionTemplateResults: SearchResult[] = rankSearchResults((prescriptionTemplatesRes.data || []) as PrescriptionTemplateRow[], q, (item) => [{ value: item.titulo, weight: 10 }, { value: item.categoria, weight: 5 }, { value: item.observacoes, weight: 4 }, { value: item.conteudo, weight: 2 }]).map((item) => ({ id: `modelo-prescricao-${item.id}`, title: item.titulo || "Modelo de prescrição", subtitle: item.categoria || "Prescrição pronta", href: `/prescricao?q=${encodeURIComponent(item.titulo || q)}`, type: "modelo_prescricao" }));
      const examResults: SearchResult[] = rankSearchResults((examsRes.data || []) as ExamRow[], q, (item) => [{ value: item.titulo, weight: 10 }, { value: item.categoria, weight: 5 }, { value: item.conteudo, weight: 2 }]).map((item) => ({ id: `exame-${item.id}`, title: item.titulo || "Bloco sem título", subtitle: item.categoria || "Exames e evolução", href: `/exames-evolucao?q=${encodeURIComponent(item.titulo || q)}`, type: "exame" }));
      const topicoResults: SearchResult[] = rankSearchResults((topicosRes.data || []) as TopicoRow[], q, (item) => [{ value: item.titulo, weight: 10 }, { value: item.area, weight: 5 }, { value: item.resumo, weight: 4 }, { value: item.diagnostico, weight: 3 }, { value: item.tratamento, weight: 3 }, { value: item.exames, weight: 2 }, { value: item.pegadinhas, weight: 2 }]).map((item) => ({ id: `topico-${item.id}`, title: item.titulo || "Tópico sem título", subtitle: item.area || item.resumo || "Tópico médico", href: `/topicos?q=${encodeURIComponent(item.titulo || q)}`, type: "topico" }));
      const cidResults: SearchResult[] = rankSearchResults((cidsRes.data || []) as CidRow[], q, (item) => [{ value: item.codigo, weight: 12 }, { value: item.descricao, weight: 8 }, { value: item.grupo, weight: 3 }]).map((item) => ({ id: `cid-${item.id}`, title: item.codigo || "CID", subtitle: item.descricao || item.grupo || "Consulta CID", href: `/cids?q=${encodeURIComponent(item.codigo || item.descricao || q)}`, type: "cid" }));
      const difficultIds = new Set(((condutasMarksRes.data || []) as MarkRow[]).filter((item) => item.dificil === true).map((item) => String(item.flashcard_id)));
      const flashcardRows = ((flashcardsRes.data || []) as FlashcardRow[]).map((item) => ({ ...item, id: String(item.id) }));
      const calculatorResults: SearchResult[] = guest
        ? []
        : clinicalCalculators
            .filter((item) =>
              [item.name, item.shortName, item.category, item.description]
                .some((value) => normalize(value).includes(normalize(q)))
            )
            .map((item) => ({
              id: `calculadora-${item.id}`,
              title: item.name,
              subtitle: item.category,
              href: `/calculadoras?calculadora=${encodeURIComponent(item.id)}`,
              type: "calculadora",
            }));
      const condutaResults: SearchResult[] = rankSearchResults(flashcardRows.filter((item) => difficultIds.has(String(item.id))), q, (item) => [{ value: item.frente, weight: 10 }, { value: item.materia, weight: 6 }, { value: item.area, weight: 5 }, { value: item.verso, weight: 2 }]).map((item) => ({ id: `conduta-${item.id}`, title: item.frente || "Conduta médica", subtitle: item.materia || item.area || "Protocolo marcado por você", href: `/condutas?q=${encodeURIComponent(item.frente || q)}`, type: "conduta" }));
      const flashcardResults: SearchResult[] = rankSearchResults(flashcardRows.filter((item) => !difficultIds.has(String(item.id))), q, (item) => [{ value: item.frente, weight: 10 }, { value: item.materia, weight: 6 }, { value: item.area, weight: 5 }, { value: item.verso, weight: 2 }]).map((item) => ({ id: `flashcard-${item.id}`, title: item.frente || "Flashcard", subtitle: item.materia || item.area || "Revisão rápida", href: `/flashcards?q=${encodeURIComponent(item.frente || q)}`, type: "flashcard" }));
      const typeBoost: Record<SearchResult["type"], number> = { paciente: 9, modelo_prescricao: 8, prescricao: 7, calculadora: 6.5, topico: 6, exame: 5, cid: 4, conduta: 4.5, flashcard: 3 };
      const merged = [...patientResults, ...topicoResults, ...calculatorResults, ...prescriptionTemplateResults, ...prescriptionResults, ...examResults, ...cidResults, ...condutaResults, ...flashcardResults].sort((a, b) => getSearchScore([{ value: b.title, weight: 10 }, { value: b.subtitle, weight: 4 }], q) + typeBoost[b.type] - getSearchScore([{ value: a.title, weight: 10 }, { value: a.subtitle, weight: 4 }], q) - typeBoost[a.type]).slice(0, 12);
      setResults(merged);
      setLoading(false);
    }
    const timer = window.setTimeout(() => runSearch().catch(() => { setResults([]); setLoading(false); }), 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  function handleSubmitSearch() {
    const q = query.trim();
    if (!q) { setOpen(false); return; }
    const selected = navigableItems[selectedIndex];
    if (selected) navigateSearch(selected.href);
    else navigateSearch(isGuest ? `/prescricao?q=${encodeURIComponent(q)}` : `/topicos?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      <div ref={wrapperRef} className="relative mx-auto flex max-w-[1680px] items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-100/60">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "ArrowDown" && navigableItems.length) { event.preventDefault(); setSelectedIndex((current) => (current + 1) % navigableItems.length); }
              if (event.key === "ArrowUp" && navigableItems.length) { event.preventDefault(); setSelectedIndex((current) => (current - 1 + navigableItems.length) % navigableItems.length); }
              if (event.key === "Enter") { event.preventDefault(); handleSubmitSearch(); }
            }} placeholder={isGuest ? "Buscar prescrições, tópicos, exames e CIDs..." : PRODUCT_CAPABILITIES.patientRecords ? "Buscar pacientes, condutas, tópicos, prescrições, exames, CIDs e flashcards..." : "Buscar condutas, tópicos, prescrições, exames, CIDs e flashcards..."} className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query ? <button type="button" onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700" aria-label="Limpar busca"><X className="h-4 w-4" /></button> : null}
          </div>

          {open ? (
            <div className="absolute left-4 right-4 top-[68px] z-50 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] md:left-6 md:right-6 lg:left-8 lg:right-8">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"><Sparkles className="h-3.5 w-3.5" />Busca clínica universal</div>{query.trim() ? <span className="hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex"><CornerDownLeft className="h-3.5 w-3.5" />Enter para abrir</span> : null}</div></div>
              {!query.trim() ? (
                <div className="p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Buscas recentes</p>{recentSearches.length ? <div className="mt-3 flex flex-wrap gap-2">{recentSearches.map((item) => <button key={item} type="button" onClick={() => { setQuery(item); setSelectedIndex(0); setOpen(true); }} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{item}</button>)}</div> : <p className="mt-2 text-sm text-slate-500">Digite uma queixa, diagnóstico, medicamento, exame ou CID.</p>}</div>
              ) : loading ? <div className="px-4 py-6 text-sm text-slate-500">Buscando...</div> : (
                <div className="max-h-[min(620px,70vh)] overflow-y-auto p-3">
                  <section className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">Ações para “{query.trim()}”</p><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{clinicalActions.map((action, index) => <button key={action.label} type="button" onClick={() => navigateSearch(action.href)} className={`flex min-w-0 items-center gap-2 rounded-xl border bg-white p-2.5 text-left transition ${selectedIndex === index ? "border-cyan-400 ring-2 ring-cyan-100" : "border-cyan-100 hover:border-cyan-300"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700"><action.icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{action.label}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{action.description}</span></span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" /></button>)}</div></section>
                  {groupedResults.length ? <div className="mt-3 space-y-4">{groupedResults.map((group) => <section key={group.label}><p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p><div className="mt-2 grid gap-2 lg:grid-cols-2">{group.items.map((item) => { const flatIndex = clinicalActions.length + results.findIndex((result) => result.id === item.id); return <button key={item.id} type="button" onClick={() => navigateSearch(item.href)} className={`block w-full rounded-2xl border bg-slate-50/70 px-3 py-2.5 text-left transition ${selectedIndex === flatIndex ? "border-cyan-400 bg-white ring-2 ring-cyan-100" : "border-slate-200/90 hover:border-slate-300 hover:bg-white"}`}><div className="flex items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${badgeClass(item.type)}`}><ResultIcon type={item.type} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.subtitle}</p></div><span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{badgeLabel(item.type)}</span></div></button>; })}</div></section>)}</div> : <div className="mt-3 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">Nenhum item cadastrado corresponde exatamente. As ações clínicas acima continuam disponíveis.</div>}
                  {activeCase?.complaint ? <button type="button" onClick={() => navigateSearch("/plantao/pendencias")} className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-left text-white transition hover:bg-slate-800"><span className="flex min-w-0 items-center gap-3"><ListChecks className="h-4 w-4 shrink-0 text-cyan-300" /><span className="min-w-0"><span className="block text-xs font-semibold">Aplicar ao caso ativo</span><span className="mt-0.5 block truncate text-[11px] text-slate-300">{activeCase.complaint}</span></span></span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" /></button> : null}
                </div>
              )}
            </div>
          ) : null}
        </div>
        {activeCase?.complaint ? <Link href="/plantao/sbar" className="hidden h-10 max-w-[230px] items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-semibold text-cyan-900 transition hover:border-cyan-300 hover:bg-cyan-100/70 lg:inline-flex" title="Abrir caso em andamento na passagem SBAR"><Stethoscope className="h-4 w-4 shrink-0 text-cyan-700" /><span className="truncate">{activeCase.complaint}</span></Link> : null}
        <div className="hidden items-center gap-2 xl:flex">{quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"><Icon className="h-3.5 w-3.5" />{item.label}</Link>; })}</div>
      </div>
    </header>
  );
}

