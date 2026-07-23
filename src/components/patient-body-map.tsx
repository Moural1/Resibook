"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ScanLine,
} from "lucide-react";

type PatientBodyMapInput = {
  gestante?: boolean | null;
  funcao_renal_alterada?: boolean | null;
  hepatopatia?: boolean | null;
  epilepsia?: boolean | null;
  asma?: boolean | null;
  gastrite_ulcera?: boolean | null;
  insuficiencia_cardiaca?: boolean | null;
  arritmia_qt_longo?: boolean | null;
  queixa?: string | null;
  queixa_principal?: string | null;
  hma?: string | null;
  hpp?: string | null;
  comorbidades?: string | null;
  exame_fisico?: string | null;
  hipotese_diagnostica?: string | null;
};

type BodyMapProblem = {
  id: number | string;
  titulo: string;
  status?: string | null;
  prioridade?: number | null;
  observacoes?: string | null;
};

type BodyMapConsultation = {
  id: number | string;
  queixa_principal?: string | null;
  exame_fisico?: string | null;
  hipotese_diagnostica?: string | null;
  created_at?: string | null;
};

type Props = {
  patient: PatientBodyMapInput;
  problems: BodyMapProblem[];
  consultations: BodyMapConsultation[];
};

type BodyView = "front" | "back";
type RegionId =
  | "head"
  | "chest"
  | "abdomen"
  | "pelvis"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "spine"
  | "kidneys";

type Region = {
  id: RegionId;
  label: string;
  view: BodyView;
  x: number;
  y: number;
};

type Finding = {
  id: string;
  region: RegionId;
  label: string;
  detail: string;
  source: "Problema ativo" | "Cadastro" | "Consulta recente";
  priority: "attention" | "information";
};

const REGIONS: Region[] = [
  { id: "head", label: "Cabeça e neurologia", view: "front", x: 50, y: 12 },
  { id: "chest", label: "Tórax", view: "front", x: 50, y: 34 },
  { id: "abdomen", label: "Abdome", view: "front", x: 50, y: 49 },
  { id: "pelvis", label: "Pelve", view: "front", x: 50, y: 61 },
  { id: "leftArm", label: "Membro superior esquerdo", view: "front", x: 24, y: 42 },
  { id: "rightArm", label: "Membro superior direito", view: "front", x: 76, y: 42 },
  { id: "leftLeg", label: "Membro inferior esquerdo", view: "front", x: 40, y: 81 },
  { id: "rightLeg", label: "Membro inferior direito", view: "front", x: 60, y: 81 },
  { id: "spine", label: "Coluna e dorso", view: "back", x: 50, y: 42 },
  { id: "kidneys", label: "Região renal", view: "back", x: 50, y: 54 },
];

const REGION_PATTERNS: Array<{ region: RegionId; patterns: RegExp[] }> = [
  {
    region: "head",
    patterns: [
      /cefale|cabe[cç]a|enxaquec|migr[aâ]n|avc|convuls|epilep|vertig|tontur|neurol|pupila|facial/i,
    ],
  },
  {
    region: "chest",
    patterns: [
      /tor[aá]c|peito|card[ií]|coron|arrit|insufici[eê]ncia card|dispne|asma|dpoc|pneum|pulm|sibil|tosse|respirat/i,
    ],
  },
  {
    region: "abdomen",
    patterns: [
      /abdom|epigastr|gastr|[uú]lcera|hepat|f[ií]gad|pancre|intestinal|diarre|v[oô]mit|n[aá]use|colec|apend/i,
    ],
  },
  {
    region: "pelvis",
    patterns: [
      /p[eé]lv|gesta|gravidez|uter|ovar|ginecol|inguinal|bexiga|dis[uú]ria|urin[aá]r|pr[oó]stat/i,
    ],
  },
  {
    region: "spine",
    patterns: [/lomb|coluna|dorsal|cervicalgia|ciatal|vertebr|dorso/i],
  },
  {
    region: "kidneys",
    patterns: [/renal|rim|rins|creatinin|di[aá]lise|nefro|flanco/i],
  },
  {
    region: "leftArm",
    patterns: [/(bra[cç]o|m[aã]o|ombro|cotovelo|membro superior).{0,20}(esquerd|e\b)/i],
  },
  {
    region: "rightArm",
    patterns: [/(bra[cç]o|m[aã]o|ombro|cotovelo|membro superior).{0,20}(direit|d\b)/i],
  },
  {
    region: "leftLeg",
    patterns: [/(perna|p[eé]|joelho|coxa|tornozelo|membro inferior).{0,20}(esquerd|e\b)/i],
  },
  {
    region: "rightLeg",
    patterns: [/(perna|p[eé]|joelho|coxa|tornozelo|membro inferior).{0,20}(direit|d\b)/i],
  },
];

function cleanText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function shorten(value: string, length = 130) {
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}

function matchRegions(value: string) {
  return REGION_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(value))
  ).map(({ region }) => region);
}

function buildFindings(
  patient: PatientBodyMapInput,
  problems: BodyMapProblem[],
  consultations: BodyMapConsultation[]
) {
  const findings: Finding[] = [];
  const seen = new Set<string>();

  function addFinding(finding: Finding) {
    const key = `${finding.region}:${finding.label.toLocaleLowerCase("pt-BR")}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(finding);
  }

  const structuredFlags: Array<{
    active: boolean;
    region: RegionId;
    label: string;
  }> = [
    { active: Boolean(patient.epilepsia), region: "head", label: "Epilepsia registrada" },
    { active: Boolean(patient.asma), region: "chest", label: "Asma registrada" },
    {
      active: Boolean(patient.insuficiencia_cardiaca),
      region: "chest",
      label: "Insuficiência cardíaca registrada",
    },
    {
      active: Boolean(patient.arritmia_qt_longo),
      region: "chest",
      label: "Arritmia ou QT longo registrado",
    },
    {
      active: Boolean(patient.gastrite_ulcera),
      region: "abdomen",
      label: "Gastrite ou úlcera registrada",
    },
    { active: Boolean(patient.hepatopatia), region: "abdomen", label: "Hepatopatia registrada" },
    { active: Boolean(patient.gestante), region: "pelvis", label: "Gestação registrada" },
    {
      active: Boolean(patient.funcao_renal_alterada),
      region: "kidneys",
      label: "Função renal alterada registrada",
    },
  ];

  structuredFlags.forEach((flag, index) => {
    if (!flag.active) return;
    addFinding({
      id: `flag-${index}`,
      region: flag.region,
      label: flag.label,
      detail: "Campo estruturado do cadastro do paciente.",
      source: "Cadastro",
      priority: "attention",
    });
  });

  problems
    .filter((problem) => !/resolvid|inativ|encerrad/i.test(problem.status || ""))
    .forEach((problem) => {
      const content = cleanText(`${problem.titulo} ${problem.observacoes || ""}`);
      matchRegions(content).forEach((region) => {
        addFinding({
          id: `problem-${problem.id}-${region}`,
          region,
          label: problem.titulo,
          detail: shorten(cleanText(problem.observacoes) || "Problema registrado sem observação adicional."),
          source: "Problema ativo",
          priority: (problem.prioridade || 0) >= 2 ? "attention" : "information",
        });
      });
    });

  const baseRecords = [
    {
      id: "base-complaint",
      label: "Queixa registrada",
      value: patient.queixa_principal || patient.queixa,
    },
    { id: "base-exam", label: "Exame físico base", value: patient.exame_fisico },
    { id: "base-hypothesis", label: "Hipótese diagnóstica base", value: patient.hipotese_diagnostica },
    { id: "base-history", label: "Antecedente registrado", value: patient.hpp || patient.comorbidades },
  ];

  baseRecords.forEach((record) => {
    const content = cleanText(record.value);
    if (!content) return;
    matchRegions(content).forEach((region) => {
      addFinding({
        id: `${record.id}-${region}`,
        region,
        label: record.label,
        detail: shorten(content),
        source: "Cadastro",
        priority: "information",
      });
    });
  });

  const latestConsultation = [...consultations]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .at(0);

  if (latestConsultation) {
    const consultationText = cleanText(
      [
        latestConsultation.queixa_principal,
        latestConsultation.exame_fisico,
        latestConsultation.hipotese_diagnostica,
      ]
        .filter(Boolean)
        .join(" ")
    );
    matchRegions(consultationText).forEach((region) => {
      addFinding({
        id: `consultation-${latestConsultation.id}-${region}`,
        region,
        label: latestConsultation.queixa_principal || "Consulta mais recente",
        detail: shorten(
          cleanText(
            latestConsultation.hipotese_diagnostica ||
              latestConsultation.exame_fisico ||
              consultationText
          )
        ),
        source: "Consulta recente",
        priority: "information",
      });
    });
  }

  return findings;
}

function BodySilhouette({ view }: { view: BodyView }) {
  return (
    <svg
      viewBox="0 0 260 520"
      className="h-full w-full drop-shadow-[0_18px_28px_rgba(8,47,73,0.18)]"
      role="img"
      aria-label={view === "front" ? "Silhueta humana anterior" : "Silhueta humana posterior"}
    >
      <defs>
        <linearGradient id={`body-fill-${view}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#effcff" />
          <stop offset="52%" stopColor="#cceff5" />
          <stop offset="100%" stopColor="#a9d9e4" />
        </linearGradient>
        <filter id={`body-glow-${view}`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        fill={`url(#body-fill-${view})`}
        stroke="#4ea6b8"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <ellipse cx="130" cy="48" rx="34" ry="40" />
        <path d="M111 83 Q110 105 96 116 L164 116 Q150 105 149 83 Z" />
        <path d="M94 110 Q130 96 166 110 L185 219 Q171 259 162 295 L98 295 Q89 259 75 219 Z" />
        <path d="M83 119 Q55 130 45 163 L18 274 Q14 296 31 301 Q45 302 51 279 L81 184 Z" />
        <path d="M177 119 Q205 130 215 163 L242 274 Q246 296 229 301 Q215 302 209 279 L179 184 Z" />
        <path d="M101 288 L129 288 L119 489 Q116 513 98 510 Q84 507 87 483 Z" />
        <path d="M131 288 L159 288 L173 483 Q176 507 162 510 Q144 513 141 489 Z" />
      </g>

      <g
        fill="none"
        stroke="#84c8d5"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.75"
      >
        <path d="M105 143 Q130 158 155 143" />
        <path d="M105 196 Q130 211 155 196" />
        <path d="M101 247 Q130 260 159 247" />
        {view === "front" ? (
          <>
            <path d="M130 119 L130 286" />
            <path d="M113 161 Q130 174 147 161" />
            <path d="M113 222 Q130 234 147 222" />
          </>
        ) : (
          <>
            <path
              d="M130 119 C124 154 136 184 130 218 C124 250 136 270 130 292"
              stroke="#087f96"
              strokeWidth="2.2"
              filter={`url(#body-glow-${view})`}
            />
            <path d="M102 216 Q113 199 125 220 Q118 250 101 246 Z" fill="#d9f7f5" />
            <path d="M158 216 Q147 199 135 220 Q142 250 159 246 Z" fill="#d9f7f5" />
          </>
        )}
      </g>
    </svg>
  );
}

export default function PatientBodyMap({
  patient,
  problems,
  consultations,
}: Props) {
  const findings = useMemo(
    () => buildFindings(patient, problems, consultations),
    [patient, problems, consultations]
  );
  const firstRegion = REGIONS.find((region) =>
    findings.some((finding) => finding.region === region.id)
  );
  const [view, setView] = useState<BodyView>(firstRegion?.view || "front");
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(
    findings[0]?.region || null
  );

  const regionsWithFindings = useMemo(
    () =>
      REGIONS.filter((region) =>
        findings.some((finding) => finding.region === region.id)
      ),
    [findings]
  );
  const selected =
    REGIONS.find((region) => region.id === selectedRegion) ||
    regionsWithFindings[0] ||
    null;
  const selectedFindings = selected
    ? findings.filter((finding) => finding.region === selected.id)
    : [];

  function selectRegion(region: Region) {
    setSelectedRegion(region.id);
    setView(region.view);
  }

  function changeView(nextView: BodyView) {
    setView(nextView);
    const firstVisibleRegion = regionsWithFindings.find(
      (region) => region.view === nextView
    );
    if (firstVisibleRegion) setSelectedRegion(firstVisibleRegion.id);
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#071a38] text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      <div className="border-b border-white/10 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-200">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                Visualização clínica
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                Mapa corporal do prontuário
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Organiza visualmente regiões mencionadas nos dados já registrados. Não gera diagnóstico.
              </p>
            </div>
          </div>

          <div className="flex rounded-xl border border-white/10 bg-white/[0.06] p-1">
            {([
              ["front", "Anterior"],
              ["back", "Posterior"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeView(value)}
                className={`inline-flex h-9 min-w-24 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                  view === value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-h-[540px] lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
        <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_58%)] p-5 lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(103,232,249,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative mx-auto h-[500px] max-w-[290px]">
            <BodySilhouette view={view} />

            {REGIONS.filter((region) => region.view === view).map((region) => {
              const regionFindings = findings.filter(
                (finding) => finding.region === region.id
              );
              if (regionFindings.length === 0) return null;
              const urgent = regionFindings.some(
                (finding) => finding.priority === "attention"
              );
              const active = selected?.id === region.id;

              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => selectRegion(region)}
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  className={`absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-[0_0_0_7px_rgba(255,255,255,0.08)] transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-200/30 ${
                    urgent
                      ? "border-rose-200 bg-rose-500 text-white"
                      : "border-cyan-100 bg-cyan-500 text-slate-950"
                  } ${active ? "scale-110 ring-4 ring-white/30" : ""}`}
                  aria-label={`${region.label}: ${regionFindings.length} registro(s)`}
                >
                  {regionFindings.length}
                </button>
              );
            })}
          </div>

          <div className="relative mt-1 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Atenção
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Registro
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-white p-5 text-slate-900 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">
                Índice anatômico
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                {selected?.label || "Sem região selecionada"}
              </h3>
            </div>
            <span className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
              {findings.length} {findings.length === 1 ? "registro visual" : "registros visuais"}
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Nenhum termo regional identificado
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                O mapa será preenchido conforme problemas, exame físico e consultas trouxerem regiões corporais reconhecíveis.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {regionsWithFindings.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => selectRegion(region)}
                    className={`inline-flex h-9 items-center rounded-xl border px-3 text-xs font-semibold transition ${
                      selected?.id === region.id
                        ? "border-cyan-700 bg-cyan-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {selectedFindings.map((finding) => (
                  <article
                    key={finding.id}
                    className={`rounded-2xl border p-4 ${
                      finding.priority === "attention"
                        ? "border-rose-200 bg-rose-50/70"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          finding.priority === "attention"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-cyan-50 text-cyan-700"
                        }`}
                      >
                        {finding.priority === "attention" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-950">
                            {finding.label}
                          </h4>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            {finding.source}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">
                          {finding.detail}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="mt-auto flex items-start gap-2 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
            <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            O mapa é um índice dos registros existentes. Confirme sempre no texto integral do prontuário.
          </div>
        </div>
      </div>
    </section>
  );
}
