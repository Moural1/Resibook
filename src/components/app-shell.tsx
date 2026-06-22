"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal/constants";
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
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  ShieldCheck,
  LifeBuoy,
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
  "/aceite-legal",
  "/suporte",
];

const AUTH_PUBLIC_PATHS = ["/login", "/signup", "/register"];
const LEGAL_PUBLIC_PATHS = ["/aceite-legal", "/termos", "/privacidade"];
const SHELL_HIDDEN_PATHS = [...AUTH_PUBLIC_PATHS, ...LEGAL_PUBLIC_PATHS];

function isPathInside(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isGuestAllowedPath(pathname: string) {
  return isPathInside(pathname, GUEST_ALLOWED_PATHS);
}

function isLegalPublicPath(pathname: string) {
  return isPathInside(pathname, LEGAL_PUBLIC_PATHS);
}

function isShellHiddenPath(pathname: string) {
  return isPathInside(pathname, SHELL_HIDDEN_PATHS);
}

async function hasAcceptedCurrentLegal(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_legal_acceptances")
    .select("terms_version, privacy_version")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Não foi possível validar aceite legal:", error.message);
    return false;
  }

  return (
    data?.terms_version === TERMS_VERSION &&
    data?.privacy_version === PRIVACY_VERSION
  );
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
    <span className="inline-flex min-w-[24px] items-center justify-center rounded-full border border-white/8 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-400">
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
    <section>
      <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {title}
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center justify-between rounded-xl border px-2.5 py-2 transition ${
                active
                  ? "border-cyan-300/16 bg-white/[0.065] shadow-[inset_0_0_0_1px_rgba(125,211,252,0.06)]"
                  : "border-transparent bg-transparent hover:border-white/7 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border ${
                    active
                      ? "border-cyan-300/12 bg-cyan-400/[0.07]"
                      : "border-white/7 bg-white/[0.025]"
                  }`}
                >
                  <Icon
                    className={`h-[15px] w-[15px] ${
                      active ? "text-cyan-200" : "text-slate-300"
                    }`}
                  />
                </div>

                <span
                  className={`truncate text-[13px] font-medium ${
                    active ? "text-white" : "text-slate-200"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <div className="ml-2 flex shrink-0 items-center">
                <Badge value={item.badge} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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
    { href: "/dashboard", label: "Visão geral", icon: Home, badge: null },
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
      label: "Condutas",
      icon: Stethoscope,
      badge: counts.flashcardsDificeis,
    },
    { href: "/cids", label: "CIDs", icon: Tags, badge: counts.cids },
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
    { href: "/topicos", label: "Tópicos", icon: Stethoscope, badge: null },
    { href: "/cids", label: "CIDs", icon: Tags, badge: null },
    { href: "/suporte", label: "Suporte", icon: LifeBuoy, badge: null },
  ];

  const secondaryItems = [
    {
      href: "/dados-da-conta",
      label: "Dados da conta",
      icon: Settings,
      badge: null,
    },
    { href: "/metricas", label: "Métricas", icon: BarChart3, badge: null },
    { href: "/suporte", label: "Suporte", icon: LifeBuoy, badge: null },
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
  const visibleSecondaryItems = isGuest ? [] : secondaryItems;

  return (
    <div className="flex h-full flex-col bg-[#081a3a] text-white">
      <div className="border-b border-white/7 px-3.5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.035] p-2">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/85">
              ResiBook
            </p>
            <h1 className="mt-0.5 truncate text-[17px] font-semibold tracking-tight text-white">
              Sistema clínico
            </h1>
          </div>
        </div>

        <div
          className={`mt-3.5 rounded-2xl border px-3 py-2.5 ${
            isGuest
              ? "border-amber-300/15 bg-amber-400/[0.06]"
              : "border-white/8 bg-white/[0.035]"
          }`}
        >
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
              isGuest ? "text-amber-200" : "text-slate-400"
            }`}
          >
            {isGuest ? "Modo" : "Ambiente"}
          </p>

          <p className="mt-1 text-[13px] font-semibold text-white">
            {isGuest ? "Acesso convidado" : "Operação clínica"}
          </p>
        </div>

        {isMobile ? (
          <p className="mt-3 text-xs leading-5 text-slate-400">
            {isGuest
              ? "Acesso restrito aos módulos liberados."
              : "Navegação compacta para rotina clínica."}
          </p>
        ) : null}
      </div>

      <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        <NavSection
          title={isGuest ? "Acesso liberado" : "Principal"}
          items={primaryItems}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        {visibleSecondaryItems.length > 0 ? (
          <NavSection
            title="Conta e acesso"
            items={visibleSecondaryItems}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ) : null}

        {isGuest ? (
          <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.06] p-4">
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
                    className="rounded-full border border-amber-200/15 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 hover:bg-white/15"
                  >
                    Termos
                  </Link>
                  <Link
                    href="/privacidade"
                    onClick={onNavigate}
                    className="rounded-full border border-amber-200/15 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 hover:bg-white/15"
                  >
                    Privacidade
                  </Link>
                  <Link
                    href="/suporte"
                    onClick={onNavigate}
                    className="rounded-full border border-amber-200/15 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 hover:bg-white/15"
                  >
                    Suporte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/7 p-2.5">
        <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isGuest ? "Sessão" : "Conta"}
              </p>
              <p className="mt-1 text-[13px] text-slate-300">
                {isGuest
                  ? "Usuário convidado ativo."
                  : "Saída segura do ambiente clínico."}
              </p>
            </div>
          </div>

          <div className="mt-3">
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
  const checkedInitialAccessRef = useRef(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
  const [redirectingToLogin, setRedirectingToLogin] = useState(false);

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
    return isShellHiddenPath(pathname);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    if (hideShell) {
      setCheckingUser(false);
      setRedirectingToLogin(false);

      return () => {
        mounted = false;
      };
    }

    const supabase = createClient();

    function resetSessionState() {
      setSessionEmail("");
      setIsGuest(false);
      setCurrentUserId(null);
    }

   function redirectTo(target: string) {
  if (typeof window === "undefined") return;

  if (target === "/login") {
    setRedirectingToLogin(true);

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }

    return;
  }

  if (window.location.pathname !== target) {
    router.replace(target);
  }
}

    async function applyAccessRules(session: Session | null) {
      if (!mounted) return;

      try {
        const email = session?.user?.email?.trim().toLowerCase() || "";
        const userId = session?.user?.id || null;
        const guest = email === GUEST_EMAIL;

        if (!session?.user || !userId) {
          resetSessionState();

          if (!isLegalPublicPath(pathname)) {
            redirectTo("/login");
          }

          return;
        }

        setRedirectingToLogin(false);
        setSessionEmail(email);
        setIsGuest(guest);
        setCurrentUserId(userId);

        if (guest) {
          if (!isGuestAllowedPath(pathname)) {
            redirectTo("/prescricao");
          }

          return;
        }

        if (!isLegalPublicPath(pathname)) {
          const accepted = await hasAcceptedCurrentLegal(supabase, userId);

          if (!mounted) return;

          if (!accepted) {
            redirectTo("/aceite-legal");
            return;
          }
        }
      } catch (error) {
        console.warn("Erro ao validar acesso:", error);
        resetSessionState();
        redirectTo("/login");
      } finally {
        if (mounted) {
          setCheckingUser(false);
        }
      }
    }

    async function checkInitialSession() {
      const isFirstAccessCheck = !checkedInitialAccessRef.current;

      if (mounted && isFirstAccessCheck) {
        setCheckingUser(true);
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("Erro ao obter sessão:", error.message);
          resetSessionState();
          redirectTo("/login");
          return;
        }

        await applyAccessRules(data.session);
      } catch (error) {
        console.warn("Erro inesperado ao obter sessão:", error);
        resetSessionState();
        redirectTo("/login");
      } finally {
        checkedInitialAccessRef.current = true;

        if (mounted) {
          setCheckingUser(false);
        }
      }
    }

    checkInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAccessRules(session);
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
        if (!mounted) return;

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

  if (checkingUser || redirectingToLogin || !currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          {redirectingToLogin ? "Encerrando sessão..." : "Carregando acesso."}
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
            Evolução, Tópicos, CIDs, Termos de Uso, Política de Privacidade e
            Suporte.
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
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[286px] border-r border-slate-200/80 lg:block print:hidden">
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
        className={`fixed top-1/2 z-[65] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-950/10 transition hover:bg-slate-50 lg:inline-flex print:hidden ${
          desktopSidebarOpen ? "left-[264px]" : "left-4"
        }`}
        aria-label={desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
        title={desktopSidebarOpen ? "Ocultar menu" : "Mostrar menu"}
      >
        {desktopSidebarOpen ? (
          <PanelLeftClose className="h-4.5 w-4.5" />
        ) : (
          <PanelLeftOpen className="h-4.5 w-4.5" />
        )}
      </button>

      <div className="lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-4 left-4 z-50 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 text-sm font-semibold text-white shadow-xl shadow-slate-950/20"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
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
          desktopSidebarOpen ? "lg:pl-[286px]" : "lg:pl-0"
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