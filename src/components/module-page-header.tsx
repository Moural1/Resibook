"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronRight, LayoutDashboard } from "lucide-react";

type HeaderBadge = {
  label: string;
  tone?: "slate" | "blue" | "cyan" | "emerald" | "amber" | "rose";
};

type HeaderMetric = {
  label: string;
  value: ReactNode;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  badges?: HeaderBadge[];
  metrics?: HeaderMetric[];
  actions?: ReactNode;
  error?: string;
  success?: string;
  notice?: ReactNode;
  children?: ReactNode;
};

function badgeToneClass(tone: HeaderBadge["tone"] = "slate") {
  if (tone === "blue") return "border-blue-200/80 bg-blue-50 text-blue-700";
  if (tone === "cyan") return "border-cyan-200/80 bg-cyan-50 text-cyan-700";
  if (tone === "emerald") return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  if (tone === "amber") return "border-amber-200/80 bg-amber-50 text-amber-700";
  if (tone === "rose") return "border-rose-200/80 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getModuleArea(pathname: string) {
  if (
    pathname.startsWith("/plantao") ||
    pathname.startsWith("/caso-rapido") ||
    pathname.startsWith("/prescricao") ||
    pathname.startsWith("/condutas") ||
    pathname.startsWith("/calculadoras") ||
    pathname.startsWith("/pacientes") ||
    pathname.startsWith("/exames-evolucao") ||
    pathname.startsWith("/cids") ||
    pathname.startsWith("/ecg-guiado")
  ) {
    return "Atendimento";
  }

  if (pathname.startsWith("/acls") || pathname.startsWith("/topicos")) {
    return "Protocolos e consulta";
  }

  if (
    pathname.startsWith("/flashcards") ||
    pathname.startsWith("/revisao-topicos") ||
    pathname.startsWith("/nunca-mais-errar") ||
    pathname.startsWith("/meu-resibook")
  ) {
    return "Estudo e acervo";
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/acessos")) {
    return "Administração";
  }

  return "Conta e acesso";
}

export default function ModulePageHeader({
  eyebrow,
  title,
  description,
  badges = [],
  metrics = [],
  actions,
  error,
  success,
  notice,
  children,
}: Props) {
  const pathname = usePathname();
  const moduleArea = getModuleArea(pathname);

  return (
    <section className="module-page-header overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="module-page-header-hero relative border-t-[3px] border-t-cyan-700 bg-[linear-gradient(115deg,#ecfeff_0%,#f5fbfd_38%,#ffffff_70%,#f0f7ff_100%)] p-5 md:p-6">
        <nav
          aria-label="Localização no aplicativo"
          className="mb-3 flex min-w-0 items-center gap-1.5 text-xs text-slate-500"
        >
          <Link
            href="/dashboard"
            className="inline-flex min-w-0 items-center gap-1.5 transition hover:text-cyan-800"
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Central clínica</span>
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
          <span className="truncate text-slate-700">{moduleArea}</span>
        </nav>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            {eyebrow || badges.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {eyebrow ? <p className="text-sm font-medium text-cyan-800">{eyebrow}</p> : null}
                {badges.map((badge) => (
                  <span
                    key={`${badge.label}-${badge.tone || "slate"}`}
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeToneClass(
                      badge.tone
                    )}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-[28px]">
              {title}
            </h1>

            {description ? (
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
            ) : null}

            {metrics.length > 0 ? (
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {metrics.map((metric, index) => (
                  <div key={`${metric.label}-${index}`} className="min-w-0">
                    <dt className="text-xs text-slate-500">{metric.label}</dt>
                    <dd className="text-[15px] font-semibold text-slate-900">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {actions ? (
            <div className="module-page-header-actions flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        ) : null}

        {notice ? <div className="mt-4">{notice}</div> : null}
      </div>

      {children ? (
        <div className="module-page-header-content border-t border-slate-200 bg-slate-50/60 p-4 md:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
