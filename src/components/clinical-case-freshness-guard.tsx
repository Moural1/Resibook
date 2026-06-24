"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, RefreshCw, X } from "lucide-react";
import {
  CLINICAL_CASE_SESSION_EVENT,
  clearClinicalCaseSession,
  confirmClinicalCaseReassessment,
  formatClinicalCaseAge,
  getClinicalCaseAgeMs,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";

const REASSESSMENT_AGE_MS = 45 * 60 * 1000;

export default function ClinicalCaseFreshnessGuard() {
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    function refresh() {
      setActiveCase(loadClinicalCaseSession());
      setNow(Date.now());
    }

    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
    };
  }, []);

  if (
    !activeCase?.complaint ||
    getClinicalCaseAgeMs(activeCase, now) < REASSESSMENT_AGE_MS
  ) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-[166px] right-3 z-[59] w-[min(390px,calc(100vw-1.5rem))] rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.12)] sm:right-4 lg:bottom-[96px] print:hidden"
      aria-label="Aviso de reavaliação do caso ativo"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
          <Clock3 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-950">
            Caso ativo precisa de reavaliação
          </p>
          <p className="mt-1 truncate text-xs text-amber-800">
            {activeCase.complaint} · {formatClinicalCaseAge(activeCase, now)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/caso-rapido"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-900 px-3 text-xs font-semibold text-white transition hover:bg-amber-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Abrir caso
            </Link>
            <button
              type="button"
              onClick={confirmClinicalCaseReassessment}
              className="inline-flex h-8 items-center rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Confirmar revisão
            </button>
            <button
              type="button"
              onClick={clearClinicalCaseSession}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              <X className="h-3.5 w-3.5" />
              Encerrar
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
