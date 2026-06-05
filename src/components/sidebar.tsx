"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  badge?: string;
  emoji: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Visão geral", href: "/dashboard", emoji: "🏠" },
      { label: "Pacientes", href: "/pacientes", badge: "LIVE", emoji: "🧑‍⚕️" },
      { label: "Prescrição", href: "/prescricao", badge: "PREMIUM", emoji: "📋" },
      { label: "Exames / Evolução", href: "/exames-evolucao", badge: "BASE", emoji: "🧪" },
    ],
  },
  {
    title: "Biblioteca médica",
    items: [
      { label: "Flashcards", href: "/flashcards", badge: "NEW", emoji: "🧠" },
      { label: "Revisão dos tópicos", href: "/revisao-topicos", badge: "BASE", emoji: "📚" },
      { label: "CIDs", href: "/cids", badge: "CID-10", emoji: "🏷️" },
    ],
  },
  {
    title: "Conta e acesso",
    items: [
      { label: "Dados da conta", href: "/dados-da-conta", badge: "BASE", emoji: "⚙️" },
      { label: "Usuário", href: "/usuario", badge: "NEW", emoji: "👤" },
      { label: "Login", href: "/login", emoji: "🔐" },
    ],
  },
  {
    title: "Clínico",
    items: [
      { label: "Casos com IA", href: "/exames-evolucao", badge: "SOON", emoji: "🤖" },
      { label: "Métricas", href: "/dashboard", emoji: "📊" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="flex min-h-screen w-full flex-col bg-slate-800 text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/dashboard" className="block">
          {!logoError ? (
            <img
              src="/logo-resibook-horizontal.png"
              alt="ResiBook"
              className="h-12 w-auto max-w-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <p className="text-3xl font-semibold tracking-tight text-white">
              ResiBook
            </p>
          )}

          <p className="mt-3 text-sm text-slate-300">
            Sistema clínico premium
          </p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="rounded-[24px] border border-white/10 bg-slate-700/50 p-5">
          <div className="flex items-center gap-3">
            {!iconError ? (
              <img
                src="/logo-resibook.png"
                alt="ResiBook ícone"
                className="h-11 w-11 rounded-2xl object-cover"
                onError={() => setIconError(true)}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-lg font-bold text-cyan-200">
                RB
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Ambiente
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                Operação clínica
              </p>
            </div>
          </div>

          <p className="mt-4 text-base leading-7 text-slate-200">
            Pacientes, prescrição, revisão, exames e fluxo assistido por IA.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                {section.title}
              </p>

              <div className="mt-3 space-y-2">
                {section.items.map((item) => {
                  const active = mounted ? isActive(pathname, item.href) : false;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition ${
                        active
                          ? "bg-cyan-500/20 text-white ring-1 ring-cyan-300/30"
                          : "text-slate-100 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </span>

                      {item.badge ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] ${
                            active
                              ? "bg-cyan-400/20 text-cyan-100"
                              : "border border-white/10 bg-slate-700 text-slate-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-[24px] border border-white/10 bg-slate-700/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Status
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]" />
            <p className="text-base font-medium text-slate-100">
              Database conectado
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}