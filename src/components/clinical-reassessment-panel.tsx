"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Minus,
  TimerReset,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import CopyButton from "./copy-button";
import {
  CLINICAL_CASE_SESSION_EVENT,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";

type VitalKey = keyof ClinicalCaseSession["vitals"];
type Reassessment = NonNullable<ClinicalCaseSession["reassessment"]>;

const EMPTY_VITALS: ClinicalCaseSession["vitals"] = {
  pa: "",
  fc: "",
  fr: "",
  temp: "",
  spo2: "",
  glicemia: "",
};

const EMPTY_REASSESSMENT: Reassessment = {
  vitals: EMPTY_VITALS,
  symptomStatus: "",
  treatmentResponse: "",
  decision: "",
  notes: "",
  recordedAt: "",
};

const VITALS: Array<[VitalKey, string, string]> = [
  ["pa", "PA", "Ex.: 130x80"],
  ["fc", "FC", "bpm"],
  ["fr", "FR", "irpm"],
  ["temp", "Temperatura", "°C"],
  ["spo2", "SpO2", "%"],
  ["glicemia", "Glicemia", "mg/dL"],
];

function parseNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBloodPressure(value: string) {
  const match = value.match(/(\d{2,3})\D+(\d{2,3})/);
  return match ? { systolic: Number(match[1]), diastolic: Number(match[2]) } : null;
}

function getTrend(key: VitalKey, initialValue: string, currentValue: string) {
  if (!initialValue.trim() || !currentValue.trim()) return null;

  if (key === "pa") {
    const initial = parseBloodPressure(initialValue);
    const current = parseBloodPressure(currentValue);
    if (!initial || !current) return null;
    const delta = current.systolic - initial.systolic;
    return Math.abs(delta) < 5 ? "stable" : delta > 0 ? "up" : "down";
  }

  const initial = parseNumber(initialValue);
  const current = parseNumber(currentValue);
  if (!initial || !current) return null;
  const tolerance = key === "temp" ? 0.2 : key === "spo2" ? 1 : 3;
  const delta = current - initial;
  return Math.abs(delta) <= tolerance ? "stable" : delta > 0 ? "up" : "down";
}

function buildText(activeCase: ClinicalCaseSession, value: Reassessment) {
  const formatVitals = (vitals: ClinicalCaseSession["vitals"]) =>
    Object.entries(vitals)
      .filter(([, item]) => item.trim())
      .map(([key, item]) => `${key.toUpperCase()} ${item}`)
      .join(" | ");

  return [
    "REAVALIAÇÃO CLÍNICA - RESIBOOK",
    `Queixa: ${activeCase.complaint}`,
    value.recordedAt
      ? `Registro: ${new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(value.recordedAt))}`
      : "",
    formatVitals(activeCase.vitals)
      ? `Sinais vitais iniciais: ${formatVitals(activeCase.vitals)}`
      : "",
    formatVitals(value.vitals)
      ? `Sinais vitais atuais: ${formatVitals(value.vitals)}`
      : "",
    value.symptomStatus ? `Evolução do sintoma: ${value.symptomStatus}` : "",
    value.treatmentResponse
      ? `Resposta às medidas: ${value.treatmentResponse}`
      : "",
    value.decision ? `Decisão / destino: ${value.decision}` : "",
    value.notes ? `Observações: ${value.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ClinicalReassessmentPanel() {
  const pathname = usePathname();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [value, setValue] = useState<Reassessment>(EMPTY_REASSESSMENT);
  const isCasePage = pathname === "/caso-rapido";

  useEffect(() => {
    if (!isCasePage) return;
    const content = document.querySelector<HTMLElement>("main > div");
    const firstSection = content?.querySelector<HTMLElement>(":scope > section");
    if (!content || !firstSection) return;

    const node = document.createElement("div");
    node.dataset.clinicalReassessment = "true";
    firstSection.after(node);
    setMountNode(node);
    return () => {
      setMountNode(null);
      node.remove();
    };
  }, [isCasePage, pathname]);

  useEffect(() => {
    function refresh() {
      const loaded = loadClinicalCaseSession();
      setActiveCase(loaded);
      setValue(loaded?.reassessment || EMPTY_REASSESSMENT);
    }

    refresh();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
  }, []);

  const copiedText = useMemo(
    () => (activeCase ? buildText(activeCase, value) : ""),
    [activeCase, value]
  );

  if (!mountNode || !isCasePage || !activeCase?.complaint) return null;

  function updateVital(key: VitalKey, nextValue: string) {
    setValue((current) => ({
      ...current,
      vitals: { ...current.vitals, [key]: nextValue },
    }));
  }

  function register() {
    if (!activeCase) return;
    const reassessment = { ...value, recordedAt: new Date().toISOString() };
    setValue(reassessment);
    saveClinicalCaseSession({
      ...activeCase,
      reassessment,
      updatedAt: reassessment.recordedAt,
    });
  }

  return createPortal(
    <section className="mt-5 overflow-hidden rounded-[24px] border border-cyan-200 bg-white shadow-sm">
      <div className="border-b border-cyan-100 bg-cyan-50/70 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
              Acompanhamento do atendimento
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Reavaliação clínica
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Compare a resposta atual com a avaliação inicial do caso.
            </p>
          </div>
          {value.recordedAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Registrada
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VITALS.map(([key, label, placeholder]) => {
            const trend = getTrend(key, activeCase.vitals[key], value.vitals[key]);
            const TrendIcon =
              trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

            return (
              <label
                key={key}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
              >
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                  {label}
                  {trend ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <TrendIcon className="h-3.5 w-3.5" />
                      {trend === "stable" ? "estável" : trend === "up" ? "subiu" : "reduziu"}
                    </span>
                  ) : null}
                </span>
                <div className="mt-2 grid grid-cols-[0.8fr_1fr] gap-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs">
                    <span className="block text-[9px] font-semibold uppercase text-slate-400">
                      Inicial
                    </span>
                    <span className="mt-0.5 block truncate font-medium text-slate-700">
                      {activeCase.vitals[key] || "-"}
                    </span>
                  </div>
                  <input
                    value={value.vitals[key]}
                    onChange={(event) => updateVital(key, event.target.value)}
                    placeholder={placeholder}
                    className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm outline-none focus:border-cyan-400"
                  />
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            value={value.symptomStatus}
            onChange={(event) =>
              setValue((current) => ({ ...current, symptomStatus: event.target.value }))
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Evolução do sintoma</option>
            <option>Melhora importante</option>
            <option>Melhora parcial</option>
            <option>Sem mudança</option>
            <option>Piora clínica</option>
          </select>
          <select
            value={value.decision}
            onChange={(event) =>
              setValue((current) => ({ ...current, decision: event.target.value }))
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Decisão / destino</option>
            <option>Manter em observação</option>
            <option>Alta com orientações</option>
            <option>Internação</option>
            <option>Transferência</option>
            <option>Reavaliar após nova intervenção</option>
          </select>
        </div>

        <textarea
          rows={3}
          value={value.treatmentResponse}
          onChange={(event) =>
            setValue((current) => ({
              ...current,
              treatmentResponse: event.target.value,
            }))
          }
          placeholder="Resposta às medidas realizadas, analgesia, hidratação, broncodilatador..."
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none"
        />
        <textarea
          rows={2}
          value={value.notes}
          onChange={(event) =>
            setValue((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Exame direcionado, pendências ou justificativa da decisão."
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={register}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-900 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            <TimerReset className="h-4 w-4" />
            Registrar reavaliação
          </button>
          {value.recordedAt ? (
            <CopyButton
              text={copiedText}
              label="Copiar evolução"
              copiedLabel="Evolução copiada"
            />
          ) : null}
        </div>
      </div>
    </section>,
    mountNode
  );
}
