"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Menu,
  X,
  Home,
  Users,
  ClipboardList,
  FlaskConical,
  Brain,
  BookOpen,
  Tags,
  Stethoscope,
  Settings,
  User,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import LogoutButton from "./logout-button";
import { Topbar } from "./topbar";
import PrintProntuarioButton from "./print-prontuario-button";

type Props = {
  children: React.ReactNode;
};

type CountMap = {
  pacientes: number | null;
  prescricoes: number | null;
  exames: number | null;
  topicos: number | null;
  flashcards: number | null;
  flashcardsDificeis: number | null;
  cids: number | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

async function getTableCount(
  supabase: SupabaseClient,
  tableName: string,
  filter?: {
    column: string;
    value: string | number | boolean;
  }
): Promise<number | null> {
  try {
    let query = supabase
      .from(tableName)
      .select("id", { count: "exact", head: true });

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { count, error } = await query;

    if (error) {
      console.warn(
        `Não foi possível contar a tabela "${tableName}":`,
        error.message
      );
      return null;
    }

    return count ?? 0;
  } catch (error) {
    console.warn(`Erro inesperado ao contar a tabela "${tableName}":`, error);
    return null;
  }
}

async function getFirstAvailableCount(
  supabase: SupabaseClient,
  tableNames: string[]
): Promise<number | null> {
  for (const tableName of tableNames) {
    const count = await getTableCount(supabase, tableName);

    if (count !== null) {
      return count;
    }
  }

  return null;
}

function Badge({ value }: { value?: number | null }) {
  if (value === null || value === undefined) return null;

  return (
    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-cyan-200">
      {value}
    </span>
  );
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }>;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
        {title}
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center justify-between rounded-2xl border px-3 py-3 transition ${
                active
                  ? "border-cyan-400/60 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.7))]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-cyan-300" : "text-slate-300"
                    }`}
                  />
                </div>

                <span className="truncate text-base font-semibold text-white">
                  {item.label}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge value={item.badge} />
                <span className="text-xl text-slate-500 transition group-hover:text-slate-300">
                  ›
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  counts,
  onNavigate,
  isMobile = false,
}: {
  pathname: string;
  counts: CountMap;
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const primaryItems = [
    {
      href: "/dashboard",
      label: "Visão geral",
      icon: Home,
      badge: null,
    },
    {
      href: "/pacientes",
      label: "Pacientes",
      icon: Users,
      badge: counts.pacientes,
    },
    {
      href: "/prescricao",
      label: "Prescrição",
      icon: ClipboardList,
      badge: counts.prescricoes,
    },
    {
      href: "/exames-evolucao",
      label: "Exames / Evolução",
      icon: FlaskConical,
      badge: counts.exames,
    },
    {
      href: "/topicos",
      label: "Tópicos",
      icon: Stethoscope,
      badge: counts.topicos,
    },
    {
      href: "/flashcards",
      label: "Flashcards",
      icon: Brain,
      badge: counts.flashcards,
    },
    {
      href: "/flashcards-dificeis",
      label: "Difíceis",
      icon: Brain,
      badge: counts.flashcardsDificeis,
    },
    {
      href: "/revisao-topicos",
      label: "Revisão",
      icon: BookOpen,
      badge: counts.topicos,
    },
    {
      href: "/cids",
      label: "CIDs",
      icon: Tags,
      badge: counts.cids,
    },
  ];

  const secondaryItems = [
    {
      href: "/dados-da-conta",
      label: "Dados da conta",
      icon: Settings,
      badge: null,
    },
    {
      href: "/usuario",
      label: "Usuário",
      icon: User,
      badge: null,
    },
    {
      href: "/metricas",
      label: "Métricas",
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <div className="flex h-full flex-col bg-[#07183d] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
            <Image
              src="/logo-resibook.png"
              alt="ResiBook"
              width={40}
              height={40}
              className="h-auto max-h-8 w-auto max-w-8 object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">
              ResiBook
            </p>
            <h1 className="mt-1 truncate text-xl font-bold tracking-tight">
              Sistema clínico
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Navegação rápida entre módulos.
            </p>
          </div>
        </div>

        {!isMobile ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(8,15,44,0.55))] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              Ambiente
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-none text-white">
              Operação clínica
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Pacientes, prescrição, revisão, exames e fluxo assistido por IA.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">Operação clínica</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Fluxo rápido para plantão e estudo.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <NavSection
          title="Principal"
          items={primaryItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <NavSection
          title="Conta e acesso"
          items={secondaryItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">Fluxo recomendado</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Paciente → Prescrição → Exames → Tópicos → Flashcards.
          </p>

          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const [counts, setCounts] = useState<CountMap>({
    pacientes: null,
    prescricoes: null,
    exames: null,
    topicos: null,
    flashcards: null,
    flashcardsDificeis: null,
    cids: null,
  });

  const hideShell = useMemo(() => {
    return (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/register"
    );
  }, [pathname]);

  const isPatientDetailPage = useMemo(() => {
    return pathname.startsWith("/pacientes/") && pathname !== "/pacientes";
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      const supabase = getSupabase();

      if (!supabase) return;

      const [
        patientsCount,
        prescricoesCount,
        examesCount,
        topicosCount,
        flashcardsCount,
        flashcardsDificeisCount,
        cidsCount,
      ] = await Promise.all([
        getTableCount(supabase, "patients"),

        getFirstAvailableCount(supabase, [
          "prescriptions",
          "prescricoes",
          "prescricao",
        ]),

        getFirstAvailableCount(supabase, [
          "exam_templates",
          "exams",
          "exames",
          "evolucoes",
          "evolutions",
        ]),

        getTableCount(supabase, "topicos_medicos"),

        getTableCount(supabase, "flashcards"),

        getTableCount(supabase, "flashcards", {
          column: "dificil",
          value: true,
        }),

        getTableCount(supabase, "cids"),
      ]);

      if (!mounted) return;

      setCounts({
        pacientes: patientsCount,
        prescricoes: prescricoesCount,
        exames: examesCount,
        topicos: topicosCount,
        flashcards: flashcardsCount,
        flashcardsDificeis: flashcardsDificeisCount,
        cids: cidsCount,
      });
    }

    loadCounts();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {desktopSidebarOpen ? (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[320px] border-r border-slate-200 lg:block print:hidden">
          <SidebarContent pathname={pathname} counts={counts} />
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setDesktopSidebarOpen((current) => !current)}
        className={`fixed top-4 z-[65] hidden h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-950/10 transition hover:bg-slate-50 lg:inline-flex print:hidden ${
          desktopSidebarOpen ? "left-[336px]" : "left-4"
        }`}
        aria-label={desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
      >
        {desktopSidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
        {desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
      </button>

      <div className="lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-4 left-4 z-50 inline-flex h-13 min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/20"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden print:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
            aria-label="Fechar menu"
          />

          <div className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[340px] flex-col shadow-2xl">
            <div className="absolute right-3 top-3 z-20">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent
              pathname={pathname}
              counts={counts}
              onNavigate={() => setMobileOpen(false)}
              isMobile
            />
          </div>
        </div>
      ) : null}

      <div
        className={`min-h-screen transition-[padding] duration-200 print:pl-0 ${
          desktopSidebarOpen ? "lg:pl-[320px]" : "lg:pl-0"
        }`}
      >
        <div className="print:hidden">
          <Topbar />
        </div>

        <main className="px-3 pb-24 pt-4 sm:px-4 md:px-6 md:py-6 lg:px-8 print:px-0 print:py-0">
          <div className="mx-auto w-full max-w-7xl print:max-w-none">
            {children}
          </div>
        </main>
      </div>

      {isPatientDetailPage ? <PrintProntuarioButton /> : null}
    </div>
  );
}