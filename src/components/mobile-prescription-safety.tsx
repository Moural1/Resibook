"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ShieldCheck } from "lucide-react";

type SafetySummary = { high: number; medium: number; info: number; target: HTMLElement };

function parseCount(text: string, suffix: string) {
  const match = text.match(new RegExp(`(\\d+)\\s+${suffix}`, "i"));
  return match ? Number(match[1]) : 0;
}

function findVisibleAlerts(): SafetySummary | null {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
  const target = sections
    .filter((section) => Array.from(section.querySelectorAll("span")).some(
      (item) => item.textContent?.trim().toLowerCase() === "alertas clínicos"
    ))
    .find((item) => item.getClientRects().length > 0);
  if (!target) return null;

  const text = target.textContent || "";
  return {
    high: parseCount(text, "alto risco"),
    medium: parseCount(text, "cautela"),
    info: parseCount(text, "lembrete"),
    target,
  };
}

export default function MobilePrescriptionSafety() {
  const pathname = usePathname();
  const [summary, setSummary] = useState<SafetySummary | null>(null);
  const isPrescription = pathname === "/prescricao";

  useEffect(() => {
    if (!isPrescription) {
      setSummary(null);
      return;
    }

    let frame = 0;
    function refresh() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const next = findVisibleAlerts();
        setSummary((current) =>
          current?.target === next?.target &&
          current?.high === next?.high &&
          current?.medium === next?.medium &&
          current?.info === next?.info
            ? current
            : next
        );
      });
    }

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isPrescription]);

  if (!isPrescription || !summary) return null;
  const total = summary.high + summary.medium + summary.info;
  if (!total) return null;
  const critical = summary.high > 0;

  return (
    <button
      type="button"
      onClick={() => summary.target.scrollIntoView({ behavior: "smooth", block: "center" })}
      className={`fixed inset-x-3 top-[76px] z-40 flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left shadow-lg backdrop-blur lg:hidden print:hidden ${
        critical ? "border-rose-300 bg-rose-50/95 text-rose-950" : "border-amber-300 bg-amber-50/95 text-amber-950"
      }`}
      aria-live="polite"
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ${critical ? "text-rose-700" : "text-amber-700"}`}>
        {critical ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">
          {critical ? `${summary.high} alerta${summary.high === 1 ? "" : "s"} de alto risco` : "Revisão de segurança disponível"}
        </span>
        <span className="mt-0.5 block truncate text-[11px] opacity-80">
          {[
            summary.medium ? `${summary.medium} cautela` : "",
            summary.info ? `${summary.info} lembrete${summary.info === 1 ? "" : "s"}` : "",
          ].filter(Boolean).join(" · ") || "Toque para revisar os detalhes"}
        </span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0" />
    </button>
  );
}

