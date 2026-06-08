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
  if (tone === "blue") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (tone === "cyan") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "amber") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (tone === "rose") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

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
    <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03]">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fbff_100%)] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                {eyebrow}
              </p>
            ) : null}

            {badges.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {badges.map((badge) => (
                  <span
                    key={`${badge.label}-${badge.tone || "slate"}`}
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      badgeToneClass(badge.tone)
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {description}
              </p>
            ) : null}

            {metrics.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-700">
                {metrics.map((metric, index) => (
                  <div key={`${metric.label}-${index}`} className="flex items-center gap-2">
                    <span className="text-slate-500">{metric.label}:</span>
                    <span className="font-semibold text-slate-900">{metric.value}</span>
                    {index < metrics.length - 1 ? (
                      <span className="ml-2 text-slate-300">•</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
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

      {children ? <div className="p-4 md:p-6">{children}</div> : null}
    </section>
  );
}