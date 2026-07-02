"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import CopyButton from "./copy-button";
import {
  CLINICAL_CASE_SESSION_EVENT,
  formatCaseVitals,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";

type EvolutionMode = "soap" | "narrative" | "reassessment";

const MODES: Array<{
  value: EvolutionMode;
  label: string;
  icon: typeof FileText;
}> = [
  { value: "soap", label: "SOAP", icon: ClipboardCheck },
  { value: "narrative", label: "Narrativa", icon: FileText },
  { value: "reassessment", label: "Reavaliação", icon: RefreshCw },
];

function clean(value?: string) {
  return value?.trim() || "";
}

function sentence(value: string) {
  if (!value) return "";
  const normalized = value.replace(/[.;,\s]+$/, "");
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}.`;
}

function formatVitals(vitals: ClinicalCaseSession["vitals"]) {
  return Object.entries(vitals)
    .filter(([, value]) => clean(value))
    .map(([key, value]) => `${key.toUpperCase()} ${clean(value)}`)
    .join(" | ");
}

function patientLabel(activeCase: ClinicalCaseSession) {
  const details = [clean(activeCase.age), clean(activeCase.sex)].filter(Boolean);
  return details.length ? `Paciente ${details.join(", ")}` : "Paciente";
}

function selectedCidText(activeCase: ClinicalCaseSession) {
  return activeCase.selectedCid?.codigo
    ? `CID: ${activeCase.selectedCid.codigo} - ${activeCase.selectedCid.descricao}.`
    : "";
}

function buildSoap(activeCase: ClinicalCaseSession) {
  const reassessment = activeCase.reassessment;
  const subjective = [
    `${patientLabel(activeCase)}, em atendimento por ${clean(activeCase.complaint)}.`,
    clean(activeCase.notes) ? sentence(clean(activeCase.notes)) : "",
    reassessment?.symptomStatus
      ? `Na reavaliação, refere ${clean(reassessment.symptomStatus).toLowerCase()}.`
      : "",
    reassessment?.treatmentResponse
      ? `Resposta às medidas: ${sentence(clean(reassessment.treatmentResponse))}`
      : "",
  ].filter(Boolean);

  const objective = [
    formatVitals(activeCase.vitals)
      ? `Sinais vitais iniciais: ${formatVitals(activeCase.vitals)}.`
      : "",
    reassessment && formatVitals(reassessment.vitals)
      ? `Sinais vitais atuais: ${formatVitals(reassessment.vitals)}.`
      : "",
    clean(activeCase.redFlags)
      ? `Sinais de alarme avaliados: ${sentence(clean(activeCase.redFlags))}`
      : "",
  ].filter(Boolean);

  const assessment = [
    selectedCidText(activeCase),
    clean(activeCase.severity)
      ? `Classificação/prioridade: ${clean(activeCase.severity)}.`
      : "",
    activeCase.priorities.length
      ? `Problemas prioritários: ${activeCase.priorities.join("; ")}.`
      : "",
    activeCase.alerts.length
      ? `Alertas clínicos: ${activeCase.alerts.join("; ")}.`
      : "",
  ].filter(Boolean);

  const plan = [
    reassessment?.decision
      ? `Decisão e destino: ${sentence(clean(reassessment.decision))}`
      : "Conduta e destino a definir conforme evolução clínica.",
    reassessment?.notes
      ? `Pendências/orientações: ${sentence(clean(reassessment.notes))}`
      : "",
  ].filter(Boolean);

  return [
    `S - SUBJETIVO\n${subjective.join(" ") || "Queixa e evolução subjetiva não registradas."}`,
    `O - OBJETIVO\n${objective.join(" ") || "Dados objetivos não registrados."}`,
    `A - AVALIAÇÃO\n${assessment.join(" ") || "Impressão clínica a registrar."}`,
    `P - PLANO\n${plan.join(" ")}`,
  ].join("\n\n");
}

function buildNarrative(activeCase: ClinicalCaseSession) {
  const reassessment = activeCase.reassessment;
  return [
    `${patientLabel(activeCase)}, em atendimento por ${clean(activeCase.complaint)}.`,
    clean(activeCase.severity)
      ? `Classificação inicial: ${clean(activeCase.severity)}.`
      : "",
    formatCaseVitals(activeCase)
      ? `À admissão: ${formatCaseVitals(activeCase)}.`
      : "",
    clean(activeCase.notes) ? sentence(clean(activeCase.notes)) : "",
    clean(activeCase.redFlags)
      ? `Sinais de alarme considerados: ${sentence(clean(activeCase.redFlags))}`
      : "",
    activeCase.priorities.length
      ? `Prioridades clínicas: ${activeCase.priorities.join("; ")}.`
      : "",
    selectedCidText(activeCase),
    reassessment?.symptomStatus
      ? `Em reavaliação, apresenta ${clean(reassessment.symptomStatus).toLowerCase()}.`
      : "",
    reassessment?.treatmentResponse
      ? `Resposta às medidas instituídas: ${sentence(clean(reassessment.treatmentResponse))}`
      : "",
    reassessment && formatVitals(reassessment.vitals)
      ? `Sinais vitais atuais: ${formatVitals(reassessment.vitals)}.`
      : "",
    reassessment?.decision
      ? `Definido: ${sentence(clean(reassessment.decision))}`
      : "Mantido acompanhamento clínico, com conduta e destino conforme evolução.",
    reassessment?.notes ? sentence(clean(reassessment.notes)) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildReassessment(activeCase: ClinicalCaseSession) {
  const reassessment = activeCase.reassessment;
  if (!reassessment) {
    return [
      `Paciente em observação por ${clean(activeCase.complaint)}.`,
      selectedCidText(activeCase),
      formatCaseVitals(activeCase)
        ? `Parâmetros iniciais: ${formatCaseVitals(activeCase)}.`
        : "",
      "Reavaliação clínica pendente, incluindo resposta terapêutica, novos sinais vitais e definição de destino.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `REAVALIAÇÃO CLÍNICA - ${clean(activeCase.complaint)}`,
    selectedCidText(activeCase),
    reassessment.recordedAt
      ? `Registro: ${new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(reassessment.recordedAt))}`
      : "",
    formatCaseVitals(activeCase)
      ? `Sinais vitais iniciais: ${formatCaseVitals(activeCase)}`
      : "",
    formatVitals(reassessment.vitals)
      ? `Sinais vitais atuais: ${formatVitals(reassessment.vitals)}`
      : "",
    reassessment.symptomStatus
      ? `Evolução do sintoma: ${clean(reassessment.symptomStatus)}`
      : "",
    reassessment.treatmentResponse
      ? `Resposta às medidas: ${clean(reassessment.treatmentResponse)}`
      : "",
    reassessment.decision
      ? `Decisão/destino: ${clean(reassessment.decision)}`
      : "",
    reassessment.notes ? `Observações: ${clean(reassessment.notes)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getChecklist(activeCase: ClinicalCaseSession) {
  return [
    {
      label: "Identificação",
      complete: Boolean(clean(activeCase.age) && clean(activeCase.sex)),
    },
    {
      label: "Sinais vitais iniciais",
      complete: Boolean(formatCaseVitals(activeCase)),
    },
    {
      label: "História/exame direcionado",
      complete: Boolean(clean(activeCase.notes)),
    },
    {
      label: "Reavaliação",
      complete: Boolean(activeCase.reassessment?.recordedAt),
    },
    {
      label: "Decisão e destino",
      complete: Boolean(clean(activeCase.reassessment?.decision)),
    },
  ];
}

export default function ClinicalEvolutionComposer() {
  const pathname = usePathname();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);
  const [mode, setMode] = useState<EvolutionMode>("soap");
  const isCasePage = pathname === "/caso-rapido";

  useEffect(() => {
    if (!isCasePage) return;
    let attempts = 0;
    let timer = 0;

    const mount = () => {
      const reassessment = document.querySelector<HTMLElement>(
        "[data-clinical-reassessment]"
      );
      const content = document.querySelector<HTMLElement>("main > div");
      const firstSection = content?.querySelector<HTMLElement>(":scope > section");
      const anchor = reassessment || firstSection;

      if (!anchor && attempts < 20) {
        attempts += 1;
        timer = window.setTimeout(mount, 100);
        return;
      }
      if (!anchor) return;

      const node = document.createElement("div");
      node.dataset.clinicalEvolutionComposer = "true";
      anchor.after(node);
      setMountNode(node);
    };

    mount();
    return () => {
      window.clearTimeout(timer);
      setMountNode((node) => {
        node?.remove();
        return null;
      });
    };
  }, [isCasePage, pathname]);

  useEffect(() => {
    function refresh() {
      setActiveCase(loadClinicalCaseSession());
    }
    refresh();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refresh);
  }, []);

  const output = useMemo(() => {
    if (!activeCase) return "";
    if (mode === "narrative") return buildNarrative(activeCase);
    if (mode === "reassessment") return buildReassessment(activeCase);
    return buildSoap(activeCase);
  }, [activeCase, mode]);

  const checklist = useMemo(
    () => (activeCase ? getChecklist(activeCase) : []),
    [activeCase]
  );
  const completedItems = checklist.filter((item) => item.complete).length;

  if (!mountNode || !isCasePage || !activeCase?.complaint) return null;

  return createPortal(
    <section className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
              Documentação assistida
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Evolução clínica
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Estruture o registro com os dados já coletados neste atendimento.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            <Stethoscope className="h-4 w-4 text-cyan-700" />
            {completedItems}/{checklist.length} itens documentados
          </div>
        </div>

        <div
          className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Formato da evolução"
        >
          {MODES.map((item) => {
            const Icon = item.icon;
            const selected = item.value === mode;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMode(item.value)}
                className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition sm:text-sm ${
                  selected
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-4 md:p-5">
          <pre className="min-h-56 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans text-sm leading-6 text-slate-800">
            {output}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton
              text={output}
              label="Copiar evolução"
              copiedLabel="Evolução copiada"
            />
            <Link
              href={`/exames-evolucao?q=${encodeURIComponent(activeCase.complaint)}`}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Abrir exames/evolução
            </Link>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50/60 p-4 lg:border-l lg:border-t-0 md:p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            Conferência do registro
          </h3>
          <ul className="mt-3 space-y-2.5">
            {checklist.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                {item.complete ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Revise o texto e complemente achados relevantes antes de registrar no prontuário.
          </p>
        </aside>
      </div>
    </section>,
    mountNode
  );
}


