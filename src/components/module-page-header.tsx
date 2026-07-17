"use client";

import type { ReactNode } from "react";

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
  return (
    <section className="module-page-header overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <div className="module-page-header-hero relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(135deg,#071a38_0%,#0b2850_58%,#0a4059_100%)] p-5 text-white md:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-cyan-200/10 bg-cyan-300/[0.04]" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-px w-56 bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                  {eyebrow}
                </p>
              ) : null}

              {badges.map((badge) => (
                <span
                  key={`${badge.label}-${badge.tone || "slate"}`}
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badgeToneClass(
                    badge.tone
                  )}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em] text-white md:text-[36px]">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-[15px]">
                {description}
              </p>
            ) : null}

            {metrics.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {metrics.map((metric, index) => (
                  <div
                    key={`${metric.label}-${index}`}
                    className="min-w-0 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm sm:min-w-[118px]"
                  >
                    <span className="block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {metric.label}
                    </span>
                    <span className="mt-1 block truncate text-sm font-semibold text-white">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="module-page-header-actions flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        {notice ? <div className="mt-5">{notice}</div> : null}
      </div>

      {children ? (
        <div className="module-page-header-content bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4 md:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
