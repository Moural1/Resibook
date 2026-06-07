"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BookOpen,
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
    | "flashcard";
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

type SessionInfo = {
  userId: string | null;
  email: string;
  isGuest: boolean;
};

const GUEST_EMAIL = "convidado@resibook.com";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

async function getSessionInfo(
  supabase: SupabaseClient | null
): Promise<SessionInfo> {
  if (!supabase) {
    return {
      userId: null,
      email: "",
      isGuest: false,
    };
  }

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
  return "CID";
}

function badgeClass(type: SearchResult["type"]) {
  if (type === "paciente") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "prescricao") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (type === "modelo_prescricao") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  if (type === "exame") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
  }

  if (type === "topico") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (type === "flashcard") {
    return "border-pink-200 bg-pink-50 text-pink-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
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

  return <Tags className={className} />;
}

const fullQuickLinks = [
  {
    href: "/pacientes",
    label: "Pacientes",
    icon: Users,
  },
  {
    href: "/prescricao",
    label: "Prescrição",
    icon: ClipboardList,
  },
  {
    href: "/exames-evolucao",
    label: "Exames",
    icon: FlaskConical,
  },
  {
    href: "/topicos",
    label: "Tópicos",
    icon: Stethoscope,
  },
  {
    href: "/revisao-topicos",
    label: "Revisão",
    icon: BookOpen,
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: Brain,
  },
  {
    href: "/cids",
    label: "CIDs",
    icon: Tags,
  },
];

const guestQuickLinks = [
  {
    href: "/prescricao",
    label: "Prescrição",
    icon: ClipboardList,
  },
  {
    href: "/exames-evolucao",
    label: "Exames",
    icon: FlaskConical,
  },
  {
    href: "/topicos",
    label: "Tópicos",
    icon: Stethoscope,
  },
  {
    href: "/cids",
    label: "CIDs",
    icon: Tags,
  },
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

  const quickLinks = isGuest ? guestQuickLinks : fullQuickLinks;

  useEffect(() => {
    const supabase = getSupabase();

    let mounted = true;

    async function loadSession() {
      const info = await getSessionInfo(supabase);

      if (!mounted) return;

      setIsGuest(info.isGuest);
    }

    loadSession();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

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

      const supabase = getSupabase();

      if (!supabase) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const sessionInfo = await getSessionInfo(supabase);
      const userId = sessionInfo.userId;
      const guest = sessionInfo.isGuest;

      setIsGuest(guest);

      if (!userId) {
        setResults([]);
        setLoading(false);
        return;
      }

      const normalizedQuery = normalize(q);

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

      const [
        patientsRes,
        prescriptionsRes,
        prescriptionTemplatesRes,
        examsRes,
        topicosRes,
        cidsRes,
        flashcardsRes,
      ] = await Promise.all([
        patientsPromise,
        prescriptionsPromise,
        prescriptionTemplatesPromise,
        examsPromise,
        topicosPromise,
        cidsPromise,
        flashcardsPromise,
      ]);

      const patientResults: SearchResult[] = ((patientsRes.data ||
        []) as PatientRow[])
        .filter((item) =>
          normalize(
            `${item.nome || ""} ${item.especialidade || ""} ${
              item.queixa || ""
            } ${item.diagnostico_principal || ""}`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
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

      const prescriptionResults: SearchResult[] = ((prescriptionsRes.data ||
        []) as PrescriptionRow[])
        .filter((item) =>
          normalize(
            `${item.medicamento || ""} ${item.paciente_nome || ""} ${
              item.posologia || ""
            }`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `prescricao-${item.id}`,
          title: item.medicamento || "Prescrição sem medicamento",
          subtitle: item.paciente_nome || item.posologia || "Prescrição clínica",
          href: `/prescricao?q=${encodeURIComponent(item.medicamento || q)}`,
          type: "prescricao",
        }));

      const prescriptionTemplateResults: SearchResult[] =
        ((prescriptionTemplatesRes.data || []) as PrescriptionTemplateRow[])
          .filter((item) =>
            normalize(
              `${item.titulo || ""} ${item.categoria || ""} ${
                item.conteudo || ""
              } ${item.observacoes || ""}`
            ).includes(normalizedQuery)
          )
          .map((item) => ({
            id: `modelo-prescricao-${item.id}`,
            title: item.titulo || "Modelo de prescrição",
            subtitle: item.categoria || "Prescrição pronta",
            href: `/prescricao?q=${encodeURIComponent(item.titulo || q)}`,
            type: "modelo_prescricao",
          }));

      const examResults: SearchResult[] = ((examsRes.data || []) as ExamRow[])
        .filter((item) =>
          normalize(
            `${item.titulo || ""} ${item.categoria || ""} ${
              item.conteudo || ""
            }`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `exame-${item.id}`,
          title: item.titulo || "Bloco sem título",
          subtitle: item.categoria || "Exames e evolução",
          href: `/exames-evolucao?q=${encodeURIComponent(item.titulo || q)}`,
          type: "exame",
        }));

      const topicoResults: SearchResult[] = ((topicosRes.data ||
        []) as TopicoRow[])
        .filter((item) =>
          normalize(
            `${item.area || ""} ${item.titulo || ""} ${item.resumo || ""} ${
              item.diagnostico || ""
            } ${item.exames || ""} ${item.tratamento || ""} ${
              item.pegadinhas || ""
            }`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `topico-${item.id}`,
          title: item.titulo || "Tópico sem título",
          subtitle: item.area || item.resumo || "Tópico médico",
          href: `/topicos?q=${encodeURIComponent(item.titulo || q)}`,
          type: "topico",
        }));

      const cidResults: SearchResult[] = ((cidsRes.data || []) as CidRow[])
        .filter((item) =>
          normalize(
            `${item.codigo || ""} ${item.descricao || ""} ${item.grupo || ""}`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `cid-${item.id}`,
          title: item.codigo || "CID",
          subtitle: item.descricao || item.grupo || "Consulta CID",
          href: `/cids?q=${encodeURIComponent(
            item.codigo || item.descricao || q
          )}`,
          type: "cid",
        }));

      const flashcardResults: SearchResult[] = ((flashcardsRes.data ||
        []) as FlashcardRow[])
        .filter((item) =>
          normalize(
            `${item.frente || ""} ${item.verso || ""} ${item.area || ""} ${
              item.materia || ""
            }`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `flashcard-${item.id}`,
          title: item.frente || "Flashcard",
          subtitle: item.materia || item.area || "Revisão rápida",
          href: `/flashcards?q=${encodeURIComponent(item.frente || q)}`,
          type: "flashcard",
        }));

      const merged = [
        ...patientResults,
        ...topicoResults,
        ...prescriptionTemplateResults,
        ...prescriptionResults,
        ...examResults,
        ...cidResults,
        ...flashcardResults,
      ].slice(0, 12);

      setResults(merged);
      setLoading(false);
    }

    const timer = window.setTimeout(() => {
      runSearch();
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
    } else {
      router.push(`/topicos?q=${encodeURIComponent(q)}`);
    }

    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div
        ref={wrapperRef}
        className="relative flex items-center gap-3 px-4 py-4 md:px-6 lg:px-8"
      >
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
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
                  ? "Buscar prescrições prontas, tópicos, exames e CIDs..."
                  : "Buscar pacientes, tópicos, prescrições, exames, CIDs, flashcards..."
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
            <div className="absolute left-4 right-4 top-[76px] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:left-6 md:right-6 lg:left-8 lg:right-8">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
                    Buscar em tópicos
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
                        className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
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
                            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${badgeClass(
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
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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