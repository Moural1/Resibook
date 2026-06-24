"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  ListChecks,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { buildCaseRouting } from "@/lib/clinical-case-routing";
import {
  CLINICAL_CASE_SESSION_EVENT,
  clearClinicalCaseSession,
  formatCaseContext,
  formatCaseIdentification,
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

function clickComplaintOption(complaint: string) {
  const option = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent?.trim() === complaint
  );
  option?.click();
}

export default function ClinicalCaseSessionBridge() {
  const pathname = usePathname();
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [expanded, setExpanded] = useState(false);
  const caseSnapshot = useRef<ClinicalCaseSession | null>(null);

  useEffect(() => {
    function refresh() {
      const loaded = loadClinicalCaseSession();
      const previous = caseSnapshot.current;

      if (pathname === "/plantao/sbar" && loaded && previous) {
        const preserved: ClinicalCaseSession = {
          ...loaded,
          age: previous.age,
          sex: previous.sex,
          vitals: previous.vitals,
          alerts: loaded.alerts.length ? loaded.alerts : previous.alerts,
        };
        const changed =
          preserved.age !== loaded.age ||
          preserved.sex !== loaded.sex ||
          JSON.stringify(preserved.vitals) !== JSON.stringify(loaded.vitals) ||
          JSON.stringify(preserved.alerts) !== JSON.stringify(loaded.alerts);

        caseSnapshot.current = preserved;
        setActiveCase(preserved);
        if (changed) saveClinicalCaseSession(preserved);
        return;
      }

      caseSnapshot.current = loaded;
      setActiveCase(loaded);
    }

    refresh();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
  }, [pathname]);

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

  useEffect(() => {
    if (
      pathname !== "/plantao/prescricao-guiada" &&
      pathname !== "/plantao/alta-segura"
    ) {
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      const saved = loadClinicalCaseSession();
      attempts += 1;
      if (!saved && attempts < 20) return;
      if (!saved) {
        window.clearInterval(timer);
        return;
      }

      if (pathname === "/plantao/prescricao-guiada") {
        const notes = document.querySelector<HTMLTextAreaElement>(
          'textarea[placeholder^="Ex.: alergias"]'
        );
        if (!notes && attempts < 20) return;
        window.clearInterval(timer);
        setNativeValue(notes, formatCaseContext(saved));
        clickComplaintOption(saved.complaint);
        return;
      }

      const patient = document.querySelector<HTMLInputElement>(
        'input[placeholder^="Ex.: Maria"]'
      );
      const notes = document.querySelector<HTMLTextAreaElement>(
        'textarea[placeholder^="Ex.: exame pendente"]'
      );
      if ((!patient || !notes) && attempts < 20) return;
      window.clearInterval(timer);
      setNativeValue(patient, formatCaseIdentification(saved));
      setNativeValue(
        notes,
        [
          formatCaseContext(saved),
          saved.priorities.length
            ? `Pontos para reavaliação:\n${saved.priorities
                .map((item) => `- ${item}`)
                .join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n")
      );
      clickComplaintOption(saved.complaint);
    }, 150);

    return () => window.clearInterval(timer);
  }, [pathname]);

  if (!activeCase?.complaint) return null;

  const query = encodeURIComponent(activeCase.complaint);
  const vitals = Object.entries(activeCase.vitals)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key.toUpperCase()} ${value}`)
    .join(" · ");
  const actions = [
    { label: "Conduta", href: `/condutas?busca=${query}`, icon: Search },
    { label: "Risco", href: `/plantao/checklist-risco?q=${query}`, icon: ShieldCheck },
    { label: "Plano", href: `/plantao/prescricao-guiada?q=${query}`, icon: ClipboardCheck },
    { label: "SBAR", href: "/plantao/sbar", icon: FileText },
    { label: "Pendências", href: "/plantao/pendencias", icon: ListChecks },
    { label: "Alta", href: `/plantao/alta-segura?q=${query}`, icon: LogOut },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] print:hidden">
      {expanded ? (
        <div className="border-b border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Stethoscope className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Central do caso ativo
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">
                {activeCase.complaint}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {[activeCase.age, activeCase.sex, activeCase.severity]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Recolher central do caso"
              title="Recolher"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {vitals ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              {vitals}
            </p>
          ) : null}

          {activeCase.alerts.length ? (
            <p className="mt-2 text-xs font-medium leading-5 text-rose-700">
              {activeCase.alerts.join(" · ")}
            </p>
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                onClick={() => setExpanded(false)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <Link
              href="/caso-rapido"
              onClick={() => setExpanded(false)}
              className="text-xs font-semibold text-cyan-700 transition hover:text-cyan-900"
            >
              Editar dados do caso
            </Link>
            <button
              type="button"
              onClick={clearClinicalCaseSession}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              Encerrar caso
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-cyan-50"
          aria-expanded={expanded}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <Stethoscope className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Caso ativo
            </span>
            <span className="block truncate text-sm font-semibold text-slate-950">
              {activeCase.complaint}
            </span>
          </span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
          )}
        </button>

        <Link
          href="/plantao/sbar"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Abrir SBAR"
          title="Abrir SBAR"
        >
          <ClipboardCheck className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
