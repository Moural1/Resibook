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
    <section className="module-page-header overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.045)]">
      <div className="relative border-b border-slate-200/80 bg-white p-5 md:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-cyan-600" />

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
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

            <h1 className="mt-2 text-[27px] font-semibold text-slate-950 md:text-[34px]">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">
                {description}
              </p>
            ) : null}

            {metrics.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {metrics.map((metric, index) => (
                  <div
                    key={`${metric.label}-${index}`}
                    className="border-l-2 border-slate-200 pl-3"
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {metric.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-slate-900">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
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
        <div className="module-page-header-content bg-slate-50/45 p-4 md:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
