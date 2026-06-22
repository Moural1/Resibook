"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSearchScore, rankSearchResults } from "@/lib/search";
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  Search,
  Sparkles,
  Stethoscope,
  Tags,
  Users,
  X,
  Brain,
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
    | "conduta";
};

type PatientRow = {
  id: string;
  nome: string | null;
  especialidade: string | null;
  queixa: string | null;
  diagnostico_principal?: string | null;
};

type PrescriptionRow = {
  id: number;
  paciente_nome: string | null;
  medicamento: string | null;
  posologia?: string | null;
};

type PrescriptionTemplateRow = {
  id: number;
  categoria: string | null;
  titulo: string | null;
  conteudo: string | null;
  observacoes?: string | null;
};

type ExamRow = {
  id: number;
  titulo: string | null;
  categoria: string | null;
  conteudo?: string | null;
};

type TopicoRow = {
  id: number;
  area: string | null;
  titulo: string | null;
  resumo: string | null;
  diagnostico: string | null;
  exames: string | null;
  tratamento: string | null;
  pegadinhas: string | null;
};

type CidRow = {
  id: number;
  codigo: string | null;
  descricao: string | null;
  grupo?: string | null;
};

type FlashcardRow = {
  id: string;
  area: string | null;
  materia: string | null;
  frente: string | null;
  verso?: string | null;
};

type MarkRow = {
  flashcard_id: string;
  dificil: boolean | null;
};

type SessionInfo = {
  userId: string | null;
  email: string;
  isGuest: boolean;
};

const GUEST_EMAIL = "convidado@resibook.com";

async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  const userId = data.session?.user?.id || null;
  const email = data.session?.user?.email?.trim().toLowerCase() || "";
  const isGuest = email === GUEST_EMAIL;

  return {
    userId,
    email,
    isGuest,
  };
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function badgeLabel(type: SearchResult["type"]) {
  if (type === "paciente") return "Paciente";
  if (type === "prescricao") return "Prescrição";
  if (type === "modelo_prescricao") return "Modelo";
  if (type === "exame") return "Exame";
  if (type === "topico") return "Tópico";
  if (type === "flashcard") return "Flashcard";
  if (type === "conduta") return "Conduta";
  return "CID";
}

function badgeClass(type: SearchResult["type"]) {
  if (type === "paciente") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }

  if (type === "prescricao") {
    return "border-blue-200/80 bg-blue-50 text-blue-700";
  }

  if (type === "modelo_prescricao") {
    return "border-indigo-200/80 bg-indigo-50 text-indigo-700";
  }

  if (type === "exame") {
    return "border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-700";
  }

  if (type === "topico") {
    return "border-cyan-200/80 bg-cyan-50 text-cyan-700";
  }

  if (type === "flashcard") {
    return "border-pink-200/80 bg-pink-50 text-pink-700";
  }

  if (type === "conduta") {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200/80 bg-amber-50 text-amber-700";
}

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const className = "h-4 w-4";

  if (type === "paciente") return <Users className={className} />;
  if (type === "prescricao") return <ClipboardList className={className} />;
  if (type === "modelo_prescricao") {
    return <ClipboardList className={className} />;
  }
  if (type === "exame") return <FlaskConical className={className} />;
  if (type === "topico") return <BookOpen className={className} />;
  if (type === "flashcard") return <Brain className={className} />;
  if (type === "conduta") return <ClipboardCheck className={className} />;

  return <Tags className={className} />;
}

const fullQuickLinks = [
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/prescricao", label: "Prescrição", icon: ClipboardList },
  { href: "/exames-evolucao", label: "Exames", icon: FlaskConical },
  { href: "/topicos", label: "Tópicos", icon: Stethoscope },
  { href: "/revisao-topicos", label: "Revisão", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/condutas", label: "Condutas", icon: ClipboardCheck },
  { href: "/cids", label: "CIDs", icon: Tags },
];

const guestQuickLinks = [
  { href: "/prescricao", label: "Prescrição", icon: ClipboardList },
  { href: "/exames-evolucao", label: "Exames", icon: FlaskConical },
  { href: "/topicos", label: "Tópicos", icon: Stethoscope },
  { href: "/cids", label: "CIDs", icon: Tags },
];

export function Topbar() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const firstResult = useMemo(() => results[0], [results]);
  const searchRequestRef = useRef(0);

  const quickLinks = isGuest ? guestQuickLinks : fullQuickLinks;

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadSession() {
      const info = await getSessionInfo();
      if (!mounted) return;
      setIsGuest(info.isGuest);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.trim().toLowerCase() || "";
      setIsGuest(email === GUEST_EMAIL);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();

    async function runSearch() {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }

      const requestId = ++searchRequestRef.current;
      setLoading(true);

      const supabase = createClient();
      const sessionInfo = await getSessionInfo();
      const userId = sessionInfo.userId;
      const guest = sessionInfo.isGuest;

      if (requestId !== searchRequestRef.current) return;

      setIsGuest(guest);

      if (!userId) {
        setResults([]);
        setLoading(false);
        return;
      }

      const patientsPromise = guest
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from("patients")
            .select("id, nome, especialidade, queixa, diagnostico_principal")
            .eq("user_id", userId)
            .limit(40);

      const prescriptionsPromise = guest
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from("prescriptions")
            .select("id, paciente_nome, medicamento, posologia")
            .eq("user_id", userId)
            .limit(40);

      const prescriptionTemplatesPromise = supabase
        .from("prescription_templates")
        .select("id, categoria, titulo, conteudo, observacoes")
        .limit(60);

      const examsPromise = supabase
        .from("exam_templates")
        .select("id, titulo, categoria, conteudo")
        .limit(40);

      const topicosPromise = supabase
        .from("topicos_medicos")
        .select(
          "id, area, titulo, resumo, diagnostico, exames, tratamento, pegadinhas"
        )
        .limit(60);

      const cidsPromise = supabase
        .from("cids")
        .select("id, codigo, descricao, grupo")
        .limit(60);

      const flashcardsPromise = guest
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from("flashcards")
            .select("id, area, materia, frente, verso")
            .limit(60);

      const condutasMarksPromise = guest
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from("flashcard_user_marks")
            .select("flashcard_id, dificil")
            .eq("user_id", userId)
            .eq("dificil", true)
            .limit(200);

      const [
        patientsRes,
        prescriptionsRes,
        prescriptionTemplatesRes,
        examsRes,
        topicosRes,
        cidsRes,
        flashcardsRes,
        condutasMarksRes,
      ] = await Promise.all([
        patientsPromise,
        prescriptionsPromise,
        prescriptionTemplatesPromise,
        examsPromise,
        topicosPromise,
        cidsPromise,
        flashcardsPromise,
        condutasMarksPromise,
      ]);

      if (requestId !== searchRequestRef.current) return;

      const patientResults: SearchResult[] = rankSearchResults(
        ((patientsRes.data || []) as PatientRow[]),
        q,
        (item) => [
          { value: item.nome, weight: 12 },
          { value: item.queixa, weight: 7 },
          { value: item.diagnostico_principal, weight: 7 },
          { value: item.especialidade, weight: 5 },
        ]
      ).map((item) => ({
        id: `paciente-${item.id}`,
        title: item.nome || "Paciente sem nome",
        subtitle:
          item.especialidade ||
          item.queixa ||
          item.diagnostico_principal ||
          "Cadastro de paciente",
        href: `/pacientes?q=${encodeURIComponent(item.nome || q)}`,
        type: "paciente",
      }));

      const prescriptionResults: SearchResult[] = rankSearchResults(
        ((prescriptionsRes.data || []) as PrescriptionRow[]),
        q,
        (item) => [
          { value: item.medicamento, weight: 10 },
          { value: item.paciente_nome, weight: 7 },
          { value: item.posologia, weight: 5 },
        ]
      ).map((item) => ({
        id: `prescricao-${item.id}`,
        title: item.medicamento || "Prescrição sem medicamento",
        subtitle: item.paciente_nome || item.posologia || "Prescrição clínica",
        href: `/prescricao?q=${encodeURIComponent(item.medicamento || q)}`,
        type: "prescricao",
      }));

      const prescriptionTemplateResults: SearchResult[] = rankSearchResults(
        ((prescriptionTemplatesRes.data || []) as PrescriptionTemplateRow[]),
        q,
        (item) => [
          { value: item.titulo, weight: 10 },
          { value: item.categoria, weight: 5 },
          { value: item.observacoes, weight: 4 },
          { value: item.conteudo, weight: 2 },
        ]
      ).map((item) => ({
        id: `modelo-prescricao-${item.id}`,
        title: item.titulo || "Modelo de prescrição",
        subtitle: item.categoria || "Prescrição pronta",
        href: `/prescricao?q=${encodeURIComponent(item.titulo || q)}`,
        type: "modelo_prescricao",
      }));

      const examResults: SearchResult[] = rankSearchResults(
        ((examsRes.data || []) as ExamRow[]),
        q,
        (item) => [
          { value: item.titulo, weight: 10 },
          { value: item.categoria, weight: 5 },
          { value: item.conteudo, weight: 2 },
        ]
      ).map((item) => ({
        id: `exame-${item.id}`,
        title: item.titulo || "Bloco sem título",
        subtitle: item.categoria || "Exames e evolução",
        href: `/exames-evolucao?q=${encodeURIComponent(item.titulo || q)}`,
        type: "exame",
      }));

      const topicoResults: SearchResult[] = rankSearchResults(
        ((topicosRes.data || []) as TopicoRow[]),
        q,
        (item) => [
          { value: item.titulo, weight: 10 },
          { value: item.area, weight: 5 },
          { value: item.resumo, weight: 4 },
          { value: item.diagnostico, weight: 3 },
          { value: item.tratamento, weight: 3 },
          { value: item.exames, weight: 2 },
          { value: item.pegadinhas, weight: 2 },
        ]
      ).map((item) => ({
        id: `topico-${item.id}`,
        title: item.titulo || "Tópico sem título",
        subtitle: item.area || item.resumo || "Tópico médico",
        href: `/topicos?q=${encodeURIComponent(item.titulo || q)}`,
        type: "topico",
      }));

      const cidResults: SearchResult[] = rankSearchResults(
        ((cidsRes.data || []) as CidRow[]),
        q,
        (item) => [
          { value: item.codigo, weight: 12 },
          { value: item.descricao, weight: 8 },
          { value: item.grupo, weight: 3 },
        ]
      ).map((item) => ({
        id: `cid-${item.id}`,
        title: item.codigo || "CID",
        subtitle: item.descricao || item.grupo || "Consulta CID",
        href: `/cids?q=${encodeURIComponent(
          item.codigo || item.descricao || q
        )}`,
        type: "cid",
      }));

      const difficultIds = new Set(
        ((condutasMarksRes.data || []) as MarkRow[])
          .filter((item) => item.dificil === true)
          .map((item) => String(item.flashcard_id))
      );

      const flashcardRows = ((flashcardsRes.data || []) as FlashcardRow[]).map(
        (item) => ({ ...item, id: String(item.id) })
      );

      const condutaResults: SearchResult[] = rankSearchResults(
        flashcardRows.filter((item) => difficultIds.has(String(item.id))),
        q,
        (item) => [
          { value: item.frente, weight: 10 },
          { value: item.materia, weight: 6 },
          { value: item.area, weight: 5 },
          { value: item.verso, weight: 2 },
        ]
      ).map((item) => ({
        id: `conduta-${item.id}`,
        title: item.frente || "Conduta médica",
        subtitle: item.materia || item.area || "Protocolo marcado por você",
        href: `/condutas?q=${encodeURIComponent(item.frente || q)}`,
        type: "conduta",
      }));

      const flashcardResults: SearchResult[] = rankSearchResults(
        flashcardRows.filter((item) => !difficultIds.has(String(item.id))),
        q,
        (item) => [
          { value: item.frente, weight: 10 },
          { value: item.materia, weight: 6 },
          { value: item.area, weight: 5 },
          { value: item.verso, weight: 2 },
        ]
      ).map((item) => ({
        id: `flashcard-${item.id}`,
        title: item.frente || "Flashcard",
        subtitle: item.materia || item.area || "Revisão rápida",
        href: `/flashcards?q=${encodeURIComponent(item.frente || q)}`,
        type: "flashcard",
      }));

      const typeBoost: Record<SearchResult["type"], number> = {
        paciente: 9,
        modelo_prescricao: 8,
        prescricao: 7,
        topico: 6,
        exame: 5,
        cid: 4,
        conduta: 4.5,
        flashcard: 3,
      };

      const merged = [
        ...patientResults,
        ...topicoResults,
        ...prescriptionTemplateResults,
        ...prescriptionResults,
        ...examResults,
        ...cidResults,
        ...condutaResults,
        ...flashcardResults,
      ]
        .sort((a, b) => {
          const scoreA =
            getSearchScore(
              [
                { value: a.title, weight: 10 },
                { value: a.subtitle, weight: 4 },
              ],
              q
            ) + typeBoost[a.type];
          const scoreB =
            getSearchScore(
              [
                { value: b.title, weight: 10 },
                { value: b.subtitle, weight: 4 },
              ],
              q
            ) + typeBoost[b.type];

          return scoreB - scoreA;
        })
        .slice(0, 12);

      setResults(merged);
      setLoading(false);
    }

    const timer = window.setTimeout(() => {
      runSearch().catch(() => {
        if (searchRequestRef.current > 0) {
          setResults([]);
          setLoading(false);
        }
      });
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleSubmitSearch() {
    const q = query.trim();

    if (!q) {
      setOpen(false);
      return;
    }

    if (firstResult) {
      router.push(firstResult.href);
    } else if (isGuest) {
      router.push(`/prescricao?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/topicos?q=${encodeURIComponent(q)}`);
    }

    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div
        ref={wrapperRef}
        className="relative flex items-center gap-3 px-4 py-3 md:px-6 lg:px-8"
      >
        <div className="min-w-0 flex-1">
          <div className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 shadow-sm shadow-slate-950/[0.02]">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                }

                if (event.key === "Enter") {
                  handleSubmitSearch();
                }
              }}
              placeholder={
                isGuest
                  ? "Buscar prescrições, tópicos, exames e CIDs..."
                  : "Buscar pacientes, condutas, tópicos, prescrições, exames, CIDs e flashcards..."
              }
              className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {open && query.trim() ? (
            <div className="absolute left-4 right-4 top-[68px] z-50 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] md:left-6 md:right-6 lg:left-8 lg:right-8">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Busca global
                </div>
              </div>

              {loading ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  Buscando...
                </div>
              ) : results.length === 0 ? (
                <div className="space-y-4 px-4 py-6">
                  <p className="text-sm text-slate-500">
                    Nenhum resultado direto encontrado.
                  </p>

                  <button
                    type="button"
                    onClick={handleSubmitSearch}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white"
                  >
                    {isGuest ? "Buscar em prescrição" : "Buscar em tópicos"}
                  </button>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto p-3">
                  <div className="space-y-2">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                        }}
                        className="block rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${badgeClass(
                                item.type
                              )}`}
                            >
                              <ResultIcon type={item.type} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {item.title}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badgeClass(
                              item.type
                            )}`}
                          >
                            {badgeLabel(item.type)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}