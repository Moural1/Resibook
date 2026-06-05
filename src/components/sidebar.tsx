"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  FlaskConical,
  Brain,
  BookOpen,
  Tags,
  Settings,
  UserCircle2,
  BarChart3,
  LogIn,
  ChevronRight,
} from "lucide-react";
import LogoutButton from "./logout-button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const principalItems: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: Home },
  { href: "/pacientes", label: "Pacientes", icon: Users, badge: "LIVE" },
  { href: "/prescricao", label: "Prescrição", icon: ClipboardList, badge: "PREMIUM" },
  { href: "/exames-evolucao", label: "Exames / Evolução", icon: FlaskConical, badge: "BASE" },
];

const bibliotecaItems: NavItem[] = [
  { href: "/flashcards", label: "Flashcards", icon: Brain, badge: "NEW" },
  { href: "/revisao-topicos", label: "Revisão", icon: BookOpen, badge: "BASE" },
  { href: "/cids", label: "CIDs", icon: Tags, badge: "CID-10" },
];

const contaItems: NavItem[] = [
  { href: "/dados-da-conta", label: "Dados da conta", icon: Settings, badge: "BASE" },
  { href: "/usuario", label: "Usuário", icon: UserCircle2, badge: "NEW" },
  { href: "/metricas", label: "Métricas", icon: BarChart3, badge: "INFO" },
  { href: "/login", label: "Login", icon: LogIn },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Badge({ text }: { text: string }) {
  const color =
    text === "LIVE"
      ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
      : text === "PREMIUM"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : text === "NEW"
      ? "border-pink-400/30 bg-pink-500/15 text-pink-200"
      : text === "CID-10"
      ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
      : "border-sky-400/30 bg-sky-500/15 text-sky-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${color}`}
    >
      {text}
    </span>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <section className="mt-6">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.30em] text-slate-400">
        {title}
      </p>

      <div className="mt-3 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-cyan-400/40 bg-cyan-500/12 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                  : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  active
                    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px] font-semibold text-white">
                    {item.label}
                  </span>
                  {item.badge ? <Badge text={item.badge} /> : null}
                </div>
              </div>

              <ChevronRight
                className={`h-4 w-4 shrink-0 transition ${
                  active ? "text-cyan-200" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[320px] shrink-0 border-r border-[#18325f] bg-[#07183d] text-white lg:flex lg:flex-col">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
        <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(17,38,84,0.96),rgba(9,24,61,0.96))] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-white/5 p-2">
              <Image
                src="/logo-resibook.png"
                alt="ResiBook"
                width={40}
                height={40}
                className="h-auto w-auto max-h-10 max-w-10 object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-300">
                ResiBook
              </p>
              <h2 className="mt-1 text-[20px] font-bold leading-tight text-white">
                Sistema clínico
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Navegação rápida entre módulos.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(17,46,100,0.75),rgba(12,31,74,0.8))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-300">
              Ambiente
            </p>
            <h3 className="mt-2 text-[17px] font-bold text-white">
              Operação clínica
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-slate-300">
              Pacientes, prescrição, revisão, exames e fluxo assistido por IA.
            </p>
          </div>
        </div>

        <NavSection title="Principal" items={principalItems} pathname={pathname} />
        <NavSection title="Biblioteca médica" items={bibliotecaItems} pathname={pathname} />
        <NavSection title="Conta e acesso" items={contaItems} pathname={pathname} />

        <div className="mt-6 rounded-3xl border border-white/8 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Fluxo recomendado
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Paciente → Prescrição → Exames → CIDs → Flashcards.
          </p>

          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}