"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
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

/* Coordenadas em % da figura (viewBox 200x440). Na vista anterior o lado
   direito do paciente fica à esquerda de quem olha. */
const REGIONS: Region[] = [
  { id: "head", label: "Cabeça e neurologia", view: "front", x: 50, y: 9.5 },
  { id: "chest", label: "Tórax", view: "front", x: 50, y: 27 },
  { id: "abdomen", label: "Abdome", view: "front", x: 50, y: 40 },
  { id: "pelvis", label: "Pelve", view: "front", x: 50, y: 51 },
  { id: "rightArm", label: "Membro superior direito", view: "front", x: 18, y: 40 },
  { id: "leftArm", label: "Membro superior esquerdo", view: "front", x: 82, y: 40 },
  { id: "rightLeg", label: "Membro inferior direito", view: "front", x: 39, y: 73 },
  { id: "leftLeg", label: "Membro inferior esquerdo", view: "front", x: 61, y: 73 },
  { id: "spine", label: "Coluna e dorso", view: "back", x: 50, y: 25 },
  { id: "kidneys", label: "Região renal", view: "back", x: 59, y: 42 },
];

const REGION_PATTERNS: Array<{ region: RegionId | RegionId[]; patterns: RegExp[] }> = [
  {
    region: ["leftLeg", "rightLeg"],
    patterns: [/\bmmii\b|membros inferiores|ambas as pernas|\bpernas\b|bilateral(mente)? em (mmii|membros inferiores)/i],
  },
  {
    region: ["leftArm", "rightArm"],
    patterns: [/\bmmss\b|membros superiores|ambos os bra[cç]os/i],
  },
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
  const regions = REGION_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(value))
  ).flatMap(({ region }) => region);
  return [...new Set(regions)];
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

const TORSO =
  "M64 86 C80 80 120 80 136 86 C150 90 156 100 154 116 L148 196 C146 214 146 226 144 246 L56 246 C54 226 54 214 52 196 L46 116 C44 100 50 90 64 86 Z";
const ARM_RIGHT = "M54 102 C42 142 34 192 30 244"; // direito do paciente (esquerda da tela na vista anterior)
const ARM_LEFT = "M146 102 C158 142 166 192 170 244";
const LEG_RIGHT = "M80 242 L76 400";
const LEG_LEFT = "M120 242 L124 400";

type Tone = { fill: string; stroke: string };
const TONE_ATTENTION: Tone = { fill: "fill-rose-500", stroke: "stroke-rose-500" };
const TONE_INFO: Tone = { fill: "fill-cyan-500", stroke: "stroke-cyan-600" };

/* Forma de cada região, desenhada por cima da silhueta quando há registro. */
function RegionShape({ id, view, tone, selected }: { id: RegionId; view: BodyView; tone: Tone; selected: boolean }) {
  const fillOpacity = selected ? 0.55 : 0.28;
  const area = { className: `${tone.fill} ${tone.stroke}`, fillOpacity, strokeWidth: selected ? 2 : 1.2 };
  const limb = (d: string, width: number) => (
    <path d={d} fill="none" className={tone.stroke} strokeWidth={width} strokeLinecap="round" strokeOpacity={selected ? 0.6 : 0.32} />
  );
  // Membros espelham na vista posterior.
  const flip = view === "back";
  switch (id) {
    case "head":
      return <circle cx="100" cy="42" r="25" {...area} />;
    case "chest":
      return <path d="M50 104 C52 92 70 86 100 86 C130 86 148 92 150 104 L148 152 L52 152 Z" {...area} />;
    case "abdomen":
      return <path d="M52 152 L148 152 L146 202 L54 202 Z" {...area} />;
    case "pelvis":
      return <path d="M54 202 L146 202 L144 246 L56 246 Z" {...area} />;
    case "rightArm":
      return limb(flip ? ARM_LEFT : ARM_RIGHT, 20);
    case "leftArm":
      return limb(flip ? ARM_RIGHT : ARM_LEFT, 20);
    case "rightLeg":
      return limb(flip ? LEG_LEFT : LEG_RIGHT, 30);
    case "leftLeg":
      return limb(flip ? LEG_RIGHT : LEG_LEFT, 30);
    case "spine":
      return <rect x="93" y="86" width="14" height="158" rx="7" {...area} />;
    case "kidneys":
      return (
        <g {...area}>
          <ellipse cx="81" cy="186" rx="11" ry="17" />
          <ellipse cx="119" cy="186" rx="11" ry="17" />
        </g>
      );
  }
}

function BodyFigure({
  view,
  regions,
  selected,
  onSelect,
}: {
  view: BodyView;
  regions: Array<{ region: Region; count: number; attention: boolean }>;
  selected: RegionId | null;
  onSelect: (region: Region) => void;
}) {
  const sides = view === "front" ? ["D", "E"] : ["E", "D"];
  return (
    <div className="relative mx-auto aspect-[200/440] h-[420px] max-h-[62vh]">
      <svg viewBox="0 0 200 440" className="h-full w-full" role="img" aria-label={view === "front" ? "Figura humana, vista anterior" : "Figura humana, vista posterior"}>
        <g className="fill-slate-200 stroke-slate-300" strokeWidth="1.5" strokeLinejoin="round">
          <path d={ARM_RIGHT} fill="none" strokeWidth="21" strokeLinecap="round" className="stroke-slate-200" />
          <path d={ARM_LEFT} fill="none" strokeWidth="21" strokeLinecap="round" className="stroke-slate-200" />
          <path d={LEG_RIGHT} fill="none" strokeWidth="31" strokeLinecap="round" className="stroke-slate-200" />
          <path d={LEG_LEFT} fill="none" strokeWidth="31" strokeLinecap="round" className="stroke-slate-200" />
          <rect x="90" y="60" width="20" height="28" rx="8" />
          <path d={TORSO} />
          <circle cx="100" cy="42" r="25" />
        </g>
        <g fill="none" className="stroke-slate-300" strokeWidth="1.2" strokeLinecap="round">
          {view === "front" ? (
            <>
              <path d="M78 104 Q100 112 122 104" />
              <path d="M100 150 L100 196" strokeDasharray="2 4" />
            </>
          ) : (
            <>
              <path d="M100 88 L100 244" strokeDasharray="3 4" />
              <path d="M72 110 Q86 128 84 150" />
              <path d="M128 110 Q114 128 116 150" />
            </>
          )}
        </g>

        {regions.map(({ region, attention }) => (
          <g key={region.id} className="cursor-pointer" onClick={() => onSelect(region)}>
            <RegionShape id={region.id} view={view} tone={attention ? TONE_ATTENTION : TONE_INFO} selected={selected === region.id} />
          </g>
        ))}
      </svg>

      <span className="pointer-events-none absolute left-0 top-1 text-[11px] font-semibold text-slate-400">{sides[0]}</span>
      <span className="pointer-events-none absolute right-0 top-1 text-[11px] font-semibold text-slate-400">{sides[1]}</span>

      {regions.map(({ region, count, attention }) => (
        <button
          key={region.id}
          type="button"
          onClick={() => onSelect(region)}
          style={{ left: `${region.x}%`, top: `${region.y}%` }}
          className={`absolute z-10 flex h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white shadow-sm ring-2 ring-white transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 ${
            attention ? "bg-rose-600" : "bg-cyan-700"
          } ${selected === region.id ? "scale-110" : ""}`}
          aria-label={`${region.label}: ${count} ${count === 1 ? "registro" : "registros"}`}
        >
          {count}
        </button>
      ))}
    </div>
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
  const regionsWithFindings = useMemo(
    () =>
      REGIONS.flatMap((region) => {
        const regionFindings = findings.filter((finding) => finding.region === region.id);
        if (!regionFindings.length) return [];
        return [{ region, count: regionFindings.length, attention: regionFindings.some((finding) => finding.priority === "attention") }];
      }),
    [findings]
  );
  const [view, setView] = useState<BodyView>(regionsWithFindings[0]?.region.view || "front");
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(regionsWithFindings[0]?.region.id || null);

  const selected = regionsWithFindings.find((item) => item.region.id === selectedRegion)?.region ?? regionsWithFindings[0]?.region ?? null;
  const selectedFindings = selected ? findings.filter((finding) => finding.region === selected.id) : [];
  const visibleRegions = regionsWithFindings.filter((item) => item.region.view === view);

  function selectRegion(region: Region) {
    setSelectedRegion(region.id);
    setView(region.view);
  }

  function changeView(nextView: BodyView) {
    setView(nextView);
    const first = regionsWithFindings.find((item) => item.region.view === nextView);
    if (first) setSelectedRegion(first.region.id);
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
            <ScanLine className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Mapa corporal</h2>
            <p className="text-sm text-slate-500">Regiões citadas no prontuário. É um índice dos registros, não um diagnóstico.</p>
          </div>
        </div>
        <div role="group" aria-label="Vista da figura" className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {([
            ["front", "Anterior"],
            ["back", "Posterior"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => changeView(value)}
              className={`inline-flex h-8 min-w-24 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                view === value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
              {regionsWithFindings.some((item) => item.region.view === value) ? (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-cyan-600" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-6 lg:border-b-0 lg:border-r">
          <BodyFigure view={view} regions={visibleRegions} selected={selected?.id ?? null} onSelect={selectRegion} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              Requer atenção
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-700" />
              Registro
            </span>
            <span>D/E = lado do paciente</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-5 md:p-6">
          {findings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">Nenhuma região citada ainda</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                O mapa se preenche quando queixa, exame físico, problemas ou consultas mencionam uma região do corpo.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {regionsWithFindings.map(({ region, count, attention }) => {
                  const active = selected?.id === region.id;
                  return (
                    <li key={region.id}>
                      <button
                        type="button"
                        onClick={() => selectRegion(region)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition ${active ? "bg-cyan-50/70" : "hover:bg-slate-50"}`}
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${attention ? "bg-rose-600" : "bg-cyan-700"}`} aria-hidden="true" />
                        <span className={`min-w-0 flex-1 truncate ${active ? "font-semibold text-slate-950" : "text-slate-700"}`}>{region.label}</span>
                        <span className="text-xs text-slate-400">{region.view === "front" ? "anterior" : "posterior"}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">{count}</span>
                        <ChevronRight className={`h-4 w-4 shrink-0 ${active ? "text-cyan-700" : "text-slate-300"}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {selected ? (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-slate-950">{selected.label}</h3>
                  <div className="mt-3 space-y-2.5">
                    {selectedFindings.map((finding) => (
                      <article
                        key={finding.id}
                        className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                          finding.priority === "attention" ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-white"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            finding.priority === "attention" ? "bg-rose-100 text-rose-700" : "bg-cyan-50 text-cyan-800"
                          }`}
                        >
                          {finding.priority === "attention" ? <AlertCircle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-950">{finding.label}</h4>
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              {finding.source}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{finding.detail}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}

          <p className="mt-auto flex items-start gap-2 pt-5 text-xs leading-5 text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Confirme sempre no texto integral do prontuário.
          </p>
        </div>
      </div>
    </section>
  );
}
