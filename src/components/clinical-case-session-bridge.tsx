"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardCheck, Stethoscope, X } from "lucide-react";
import { buildCaseRouting } from "@/lib/clinical-case-routing";
import {
  CLINICAL_CASE_SESSION_EVENT,
  clearClinicalCaseSession,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const FIELD_SELECTORS = {
  complaint: 'input[placeholder^="Ex.: cefaleia"]',
  age: 'input[placeholder="Ex.: 62 anos"]',
  pa: 'input[placeholder="Ex.: 140x90"]',
  fc: 'input[placeholder="bpm"]',
  fr: 'input[placeholder="irpm"]',
  temp: 'input[placeholder="Â°C"]',
  spo2: 'input[placeholder="%"]',
  glicemia: 'input[placeholder="mg/dL"]',
  redFlags: 'textarea[placeholder^="Ex.: dor sÃºbita"]',
  notes: 'textarea[placeholder^="HistÃ³ria curta"]',
};

function findField(selector: string) {
  return document.querySelector<FieldElement>(selector);
}

function findSelect(label: string) {
  const labels = Array.from(document.querySelectorAll("label"));
  return (
    labels
      .find((item) => item.textContent?.includes(label))
      ?.querySelector<HTMLSelectElement>("select") || null
  );
}

function setNativeValue(element: FieldElement | null, value: string) {
  if (!element || !value || element.value) return;

  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function readValue(selector: string) {
  return findField(selector)?.value.trim() || "";
}

function collectCase(): ClinicalCaseSession {
  const complaint = readValue(FIELD_SELECTORS.complaint);
  const routing = buildCaseRouting(complaint);
  const redFlags = readValue(FIELD_SELECTORS.redFlags);
  const alerts = [
    redFlags ? "Sinais de alarme descritos" : "",
    Number(readValue(FIELD_SELECTORS.spo2)) < 92 &&
    Number(readValue(FIELD_SELECTORS.spo2)) > 0
      ? "SpO2 baixa"
      : "",
    Number(readValue(FIELD_SELECTORS.glicemia)) < 70 &&
    Number(readValue(FIELD_SELECTORS.glicemia)) > 0
      ? "Hipoglicemia possível"
      : "",
  ].filter(Boolean);

  return {
    complaint: routing.complaint?.title || complaint,
    age: readValue(FIELD_SELECTORS.age),
    sex: findSelect("Sexo")?.value || "",
    severity: findSelect("Gravidade inicial")?.value || "A definir",
    vitals: {
      pa: readValue(FIELD_SELECTORS.pa),
      fc: readValue(FIELD_SELECTORS.fc),
      fr: readValue(FIELD_SELECTORS.fr),
      temp: readValue(FIELD_SELECTORS.temp),
      spo2: readValue(FIELD_SELECTORS.spo2),
      glicemia: readValue(FIELD_SELECTORS.glicemia),
    },
    redFlags,
    notes: readValue(FIELD_SELECTORS.notes),
    alerts,
    priorities: routing.priorities,
    updatedAt: new Date().toISOString(),
  };
}

function hydrateCase(saved: ClinicalCaseSession) {
  setNativeValue(findField(FIELD_SELECTORS.complaint), saved.complaint);
  setNativeValue(findField(FIELD_SELECTORS.age), saved.age);
  setNativeValue(findSelect("Sexo"), saved.sex);
  setNativeValue(findSelect("Gravidade inicial"), saved.severity);
  setNativeValue(findField(FIELD_SELECTORS.pa), saved.vitals.pa);
  setNativeValue(findField(FIELD_SELECTORS.fc), saved.vitals.fc);
  setNativeValue(findField(FIELD_SELECTORS.fr), saved.vitals.fr);
  setNativeValue(findField(FIELD_SELECTORS.temp), saved.vitals.temp);
  setNativeValue(findField(FIELD_SELECTORS.spo2), saved.vitals.spo2);
  setNativeValue(findField(FIELD_SELECTORS.glicemia), saved.vitals.glicemia);
  setNativeValue(findField(FIELD_SELECTORS.redFlags), saved.redFlags);
  setNativeValue(findField(FIELD_SELECTORS.notes), saved.notes);
}

export default function ClinicalCaseSessionBridge() {
  const pathname = usePathname();
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);

  useEffect(() => {
    function refresh() {
      setActiveCase(loadClinicalCaseSession());
    }

    refresh();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (pathname !== "/caso-rapido") return;

    let attempts = 0;
    let cleanup = () => {};

    const timer = window.setInterval(() => {
      const complaintField = findField(FIELD_SELECTORS.complaint);
      attempts += 1;

      if (!complaintField && attempts < 20) return;
      window.clearInterval(timer);
      if (!complaintField) return;

      const saved = loadClinicalCaseSession();
      if (saved) hydrateCase(saved);

      const handleChange = () => {
        const current = collectCase();
        const hasContent =
          current.complaint ||
          current.age ||
          current.redFlags ||
          current.notes ||
          Object.values(current.vitals).some(Boolean);

        if (hasContent) saveClinicalCaseSession(current);
      };

      document.addEventListener("input", handleChange);
      document.addEventListener("change", handleChange);
      handleChange();

      cleanup = () => {
        document.removeEventListener("input", handleChange);
        document.removeEventListener("change", handleChange);
      };
    }, 150);

    return () => {
      window.clearInterval(timer);
      cleanup();
    };
  }, [pathname]);

  if (!activeCase?.complaint) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border border-cyan-200 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.16)] print:hidden">
      <Link
        href="/plantao/sbar"
        className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-cyan-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Stethoscope className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Caso ativo
          </span>
          <span className="block truncate text-sm font-semibold text-slate-950">
            {activeCase.complaint}
          </span>
        </span>
        <ClipboardCheck className="h-4 w-4 shrink-0 text-slate-400" />
      </Link>

      <button
        type="button"
        onClick={clearClinicalCaseSession}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Limpar caso ativo"
        title="Limpar caso ativo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
