"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  Menu,
  X,
  Home,
  Users,
  ClipboardList,
  FlaskConical,
  Brain,
  Tags,
  Stethoscope,
  Settings,
  User,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  ShieldCheck,
} from "lucide-react";
import LogoutButton from "./logout-button";
import { Topbar } from "./topbar";

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

const GUEST_EMAIL = "convidado@resibook.com";
const ADMIN_EMAIL = "igormoura@resibook.com";

const GUEST_ALLOWED_PATHS = [
  "/prescricao",
  "/topicos",
  "/cids",
  "/exames-evolucao",
  "/termos",
  "/privacidade",
];

function isGuestAllowedPath(pathname: string) {
  return GUEST_ALLOWED_PATHS.some((path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  });
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

async function getFlashcardDificeisCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from("flashcard_user_marks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("dificil", true);

    if (error) {
      console.warn(
        "Não foi possível contar flashcards difíceis:",
        error.message
      );
      return null;
    }

    return count ?? 0;
  } catch (error) {
    console.warn("Erro inesperado ao contar flashcards difíceis:", error);
    return null;
  }
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
  isGuest = false,
  isAdmin = false,
}: {
  pathname: string;
  counts: CountMap;
  onNavigate?: () => void;
  isMobile?: boolean;
  isGuest?: boolean;
  isAdmin?: boolean;
}) {
  const fullPrimaryItems = [
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
      href: "/cids",
      label: "CIDs",
      icon: Tags,
      badge: counts.cids,
    },
  ];

  const guestPrimaryItems = [
    {
      href: "/prescricao",
      label: "Prescrição",
      icon: ClipboardList,
      badge: null,
    },
    {
      href: "/exames-evolucao",
      label: "Exames / Evolução",
      icon: FlaskConical,
      badge: null,
    },
    {
      href: "/topicos",
      label: "Tópicos",
      icon: Stethoscope,
      badge: null,
    },
    {
      href: "/cids",
      label: "CIDs",
      icon: Tags,
      badge: null,
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
    ...(isAdmin
      ? [
          {
            href: "/modelos-prescricao",
            label: "Modelos prescrição",
            icon: ClipboardList,
            badge: null,
          },
          {
            href: "/acessos",
            label: "Acessos",
            icon: ShieldCheck,
            badge: null,
          },
        ]
      : []),
  ];

  const primaryItems = isGuest ? guestPrimaryItems : fullPrimaryItems;

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
              {isGuest
                ? "Acesso convidado limitado."
                : "Navegação rápida entre módulos."}
            </p>
          </div>
        </div>

        {!isMobile ? (
          <div className="mt-4 rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(8,15,44,0.45))] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
              {isGuest ? "Modo convidado" : "Ambiente"}
            </p>
            <h2 className="mt-1.5 text-xl font-bold leading-tight text-white">
              {isGuest ? "Acesso limitado" : "Operação clínica"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isGuest
                ? "Prescrição, exames, tópicos e CIDs liberados."
                : "Pacientes, prescrição, revisão e exames."}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">
              {isGuest ? "Modo convidado" : "Operação clínica"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {isGuest
                ? "Acesso restrito a módulos liberados."
                : "Fluxo rápido para plantão e estudo."}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <NavSection
          title={isGuest ? "Acesso liberado" : "Principal"}
          items={primaryItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        {!isGuest ? (
          <NavSection
            title="Conta e acesso"
            items={secondaryItems}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ) : (
          <div className="rounded-[22px] border border-amber-300/20 bg-amber-400/10 p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 text-amber-200" />
              <div>
                <p className="text-sm font-semibold text-amber-100">
                  Perfil convidado
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-100/80">
                  As demais áreas do sistema estão bloqueadas para este usuário.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/termos"
                    onClick={onNavigate}
                    className="rounded-full border border-amber-200/20 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-white/15"
                  >
                    Termos
                  </Link>

                  <Link
                    href="/privacidade"
                    onClick={onNavigate}
                    className="rounded-full border border-amber-200/20 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-white/15"
                  >
                    Privacidade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">
            {isGuest ? "Sessão convidado" : "Fluxo recomendado"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {isGuest
              ? "Use apenas os módulos liberados pelo administrador."
              : "Paciente → Prescrição → Exames → Tópicos → Flashcards."}
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
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

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

  useEffect(() => {
    let mounted = true;

    async function checkGuestUser() {
      if (hideShell) {
        setCheckingUser(false);
        return;
      }

      const supabase = createClient();

      const { data: sessionData } = await supabase.auth.getSession();

      const email =
        sessionData.session?.user?.email?.trim().toLowerCase() || "";
      const userId = sessionData.session?.user?.id || null;
      const guest = email === GUEST_EMAIL;

      if (!mounted) return;

      setSessionEmail(email);
      setIsGuest(guest);
      setCurrentUserId(userId);
      setCheckingUser(false);

      if (guest && !isGuestAllowedPath(pathname)) {
        router.replace("/prescricao");
      }
    }

    checkGuestUser();

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.trim().toLowerCase() || "";
      const userId = session?.user?.id || null;
      const guest = email === GUEST_EMAIL;

      setSessionEmail(email);
      setIsGuest(guest);
      setCurrentUserId(userId);
      setCheckingUser(false);

      if (guest && !isGuestAllowedPath(window.location.pathname)) {
        router.replace("/prescricao");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, hideShell]);

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
      const supabase = createClient();

      if (!currentUserId) {
        setCounts({
          pacientes: null,
          prescricoes: null,
          exames: null,
          topicos: null,
          flashcards: null,
          flashcardsDificeis: null,
          cids: null,
        });
        return;
      }

      const [
        patientsCount,
        prescricoesCount,
        examesCount,
        topicosCount,
        flashcardsCount,
        flashcardsDificeisCount,
        cidsCount,
      ] = await Promise.all([
        getTableCount(supabase, "patients", {
          column: "user_id",
          value: currentUserId,
        }),

        getTableCount(supabase, "prescriptions", {
          column: "user_id",
          value: currentUserId,
        }),

        getFirstAvailableCount(supabase, [
          "exam_templates",
          "exams",
          "exames",
          "evolucoes",
          "evolutions",
        ]),

        getTableCount(supabase, "topicos_medicos"),

        getTableCount(supabase, "flashcards"),

        getFlashcardDificeisCount(supabase, currentUserId),

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

    if (!isGuest) {
      loadCounts();
    } else {
      setCounts({
        pacientes: null,
        prescricoes: null,
        exames: null,
        topicos: null,
        flashcards: null,
        flashcardsDificeis: null,
        cids: null,
      });
    }

    return () => {
      mounted = false;
    };
  }, [pathname, isGuest, currentUserId]);

  if (hideShell) {
    return <>{children}</>;
  }

  if (checkingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Carregando acesso...
        </div>
      </div>
    );
  }

  if (isGuest && !isGuestAllowedPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-[28px] border border-amber-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Acesso restrito
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Este usuário convidado tem acesso apenas a Prescrição, Exames /
            Evolução, Tópicos, CIDs, Termos de Uso e Política de Privacidade.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/prescricao")}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            Ir para prescrição
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      {desktopSidebarOpen ? (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[320px] border-r border-slate-200 lg:block print:hidden">
          <SidebarContent
            pathname={pathname}
            counts={counts}
            isGuest={isGuest}
            isAdmin={sessionEmail === ADMIN_EMAIL}
          />
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => setDesktopSidebarOpen((current) => !current)}
        className={`fixed top-1/2 z-[65] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl shadow-slate-950/10 transition hover:bg-slate-50 lg:inline-flex print:hidden ${
          desktopSidebarOpen ? "left-[296px]" : "left-4"
        }`}
        aria-label={desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
        title={desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
      >
        {desktopSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
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
              isGuest={isGuest}
              isAdmin={sessionEmail === ADMIN_EMAIL}
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
    </div>
  );
}