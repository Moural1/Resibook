"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  Copy,
  HeartPulse,
  ImagePlus,
  RotateCcw,
  ShieldAlert,
  Upload,
} from "lucide-react";
import CopyButton from "@/components/copy-button";
import ModulePageHeader from "@/components/module-page-header";

type ToggleValue = "" | "yes" | "no";

type EcgState = {
  context: string;
  rate: string;
  rhythm: string;
  axis: string;
  pr: string;
  qrs: string;
  qtc: string;
  stElevation: ToggleValue;
  stDepression: ToggleValue;
  tWaveChange: ToggleValue;
  pathologicQ: ToggleValue;
  avBlock: string;
  bundleBranchBlock: string;
  hypertrophy: ToggleValue;
  urgentSymptoms: ToggleValue;
  notes: string;
};

const initialState: EcgState = {
  context: "",
  rate: "",
  rhythm: "",
  axis: "",
  pr: "",
  qrs: "",
  qtc: "",
  stElevation: "",
  stDepression: "",
  tWaveChange: "",
  pathologicQ: "",
  avBlock: "",
  bundleBranchBlock: "",
  hypertrophy: "",
  urgentSymptoms: "",
  notes: "",
};

const rhythmOptions = [
  ["", "Selecione"],
  ["sinusal", "Sinusal"],
  ["fibrilacao_atrial", "Fibrilação atrial"],
  ["flutter", "Flutter atrial"],
  ["taquicardia_regular", "Taquicardia regular"],
  ["bradicardia", "Bradicardia"],
  ["ritmo_marca_passo", "Ritmo de marca-passo"],
  ["indeterminado", "Indeterminado"],
];

const axisOptions = [
  ["", "Selecione"],
  ["normal", "Normal"],
  ["esquerdo", "Desvio para esquerda"],
  ["direito", "Desvio para direita"],
  ["extremo", "Eixo extremo"],
  ["indeterminado", "Indeterminado"],
];

const avBlockOptions = [
  ["", "Selecione"],
  ["ausente", "Sem bloqueio AV evidente"],
  ["primeiro_grau", "BAV de 1º grau"],
  ["segundo_grau", "BAV de 2º grau"],
  ["terceiro_grau", "BAV avançado / 3º grau"],
  ["indeterminado", "Indeterminado"],
];

const bundleOptions = [
  ["", "Selecione"],
  ["ausente", "Sem bloqueio de ramo evidente"],
  ["brd", "Bloqueio de ramo direito"],
  ["bre", "Bloqueio de ramo esquerdo"],
  ["qrs_largo_indefinido", "QRS largo / distúrbio inespecífico"],
  ["indeterminado", "Indeterminado"],
];

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toggleLabel(value: ToggleValue) {
  if (value === "yes") return "sim";
  if (value === "no") return "não";
  return "não informado";
}

function selectLabel(options: string[][], value: string) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || "Não informado";
}

function classifyRate(rate: number | null) {
  if (rate === null) return null;
  if (rate < 40) return "bradicardia importante";
  if (rate < 60) return "bradicardia";
  if (rate <= 100) return "frequência dentro da faixa usual";
  if (rate <= 150) return "taquicardia";
  return "taquicardia importante";
}

function getRedFlags(values: EcgState) {
  const rate = toNumber(values.rate);
  const qrs = toNumber(values.qrs);
  const qtc = toNumber(values.qtc);
  const flags: string[] = [];

  if (values.urgentSymptoms === "yes") flags.push("sintomas/instabilidade clínica informados");
  if (values.stElevation === "yes") flags.push("supradesnivelamento de ST informado");
  if (values.stDepression === "yes") flags.push("infradesnivelamento de ST informado");
  if (values.avBlock === "terceiro_grau") flags.push("bloqueio AV avançado/3º grau informado");
  if (values.bundleBranchBlock === "bre") flags.push("bloqueio de ramo esquerdo informado");
  if (rate !== null && (rate < 40 || rate > 150)) flags.push(`frequência ${rate} bpm`);
  if (qrs !== null && qrs >= 120) flags.push(`QRS alargado (${qrs} ms)`);
  if (qtc !== null && qtc >= 500) flags.push(`QTc prolongado importante (${qtc} ms)`);

  return flags;
}

function buildInterpretation(values: EcgState) {
  const rate = toNumber(values.rate);
  const pr = toNumber(values.pr);
  const qrs = toNumber(values.qrs);
  const qtc = toNumber(values.qtc);
  const redFlags = getRedFlags(values);
  const parts: string[] = [];
  const issues: string[] = [];

  if (values.context.trim()) parts.push(`Contexto: ${values.context.trim()}.`);
  if (rate !== null) parts.push(`Frequência ventricular aproximada: ${rate} bpm (${classifyRate(rate)}).`);
  if (values.rhythm) parts.push(`Ritmo: ${selectLabel(rhythmOptions, values.rhythm)}.`);
  if (values.axis) parts.push(`Eixo: ${selectLabel(axisOptions, values.axis)}.`);
  if (pr !== null) {
    parts.push(`Intervalo PR: ${pr} ms.`);
    if (pr < 120) issues.push("PR curto; considerar pré-excitação/ritmo juncional conforme morfologia.");
    if (pr > 200) issues.push("PR prolongado compatível com BAV de 1º grau se condução 1:1.");
  }
  if (qrs !== null) {
    parts.push(`QRS: ${qrs} ms.`);
    if (qrs >= 120) issues.push("QRS alargado; correlacionar com bloqueio de ramo, ritmo ventricular, marca-passo ou distúrbio inespecífico.");
  }
  if (qtc !== null) {
    parts.push(`QTc: ${qtc} ms.`);
    if (qtc >= 500) issues.push("QTc ≥ 500 ms aumenta preocupação para arritmia ventricular/torsades em contexto apropriado.");
    else if (qtc >= 470) issues.push("QTc prolongado/limítrofe; revisar sexo, frequência, fórmula, eletrólitos e fármacos.");
  }
  if (values.avBlock) parts.push(`Condução AV: ${selectLabel(avBlockOptions, values.avBlock)}.`);
  if (values.bundleBranchBlock) parts.push(`Condução intraventricular: ${selectLabel(bundleOptions, values.bundleBranchBlock)}.`);
  parts.push(`ST supra: ${toggleLabel(values.stElevation)}. ST infra: ${toggleLabel(values.stDepression)}. Alteração de T: ${toggleLabel(values.tWaveChange)}. Ondas Q patológicas: ${toggleLabel(values.pathologicQ)}. Sinais de hipertrofia: ${toggleLabel(values.hypertrophy)}.`);
  if (values.notes.trim()) parts.push(`Observações do traçado: ${values.notes.trim()}.`);

  if (values.stElevation === "yes") issues.push("ST supra deve ser revisado imediatamente no traçado original e correlacionado com dor torácica/tempo de sintomas.");
  if (values.stDepression === "yes") issues.push("ST infra pode sugerir isquemia/subendocárdico ou alteração secundária; correlacionar clinicamente.");
  if (values.tWaveChange === "yes") issues.push("Alterações de T são inespecíficas isoladamente; considerar isquemia, eletrólitos, sobrecarga, medicamentos e padrão secundário.");
  if (values.pathologicQ === "yes") issues.push("Ondas Q patológicas podem sugerir necrose prévia ou outras causas; revisar critérios por derivações contíguas.");
  if (values.avBlock === "segundo_grau" || values.avBlock === "terceiro_grau") issues.push("Bloqueio AV de grau elevado exige correlação com sintomas, fármacos, eletrólitos e risco de instabilidade.");

  const impression = issues.length
    ? issues.join(" ")
    : "Sem alerta maior informado pelos campos preenchidos; manter correlação clínica e revisão do traçado original.";
  const urgency = redFlags.length
    ? `Atenção: há achados/sinais de maior risco (${redFlags.join("; ")}). Priorizar avaliação clínica imediata conforme sintomas e protocolo local.`
    : "Sem red flags marcadas nesta triagem estruturada.";

  return [
    "ECG guiado - interpretação estruturada:",
    ...parts,
    `Impressão: ${impression}`,
    urgency,
    "Limitação: texto gerado a partir de campos preenchidos e imagem anexada apenas como apoio visual; não substitui laudo, revisão do ECG original nem julgamento clínico.",
  ].join("\n");
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ToggleValue;
  onChange: (value: ToggleValue) => void;
}) {
  return (
    <fieldset className={`rounded-xl border p-3.5 ${value ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/40"}`}>
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
        {[
          ["no", "Não"],
          ["yes", "Sim"],
          ["", "Não sei"],
        ].map(([optionValue, optionLabel]) => {
          const active = value === optionValue;
          return (
            <button
              key={optionValue || "empty"}
              type="button"
              onClick={() => onChange(optionValue as ToggleValue)}
              className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${active ? "bg-cyan-800 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function EcgGuiadoPage() {
  const [values, setValues] = useState<EcgState>(initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const interpretation = useMemo(() => buildInterpretation(values), [values]);
  const redFlags = useMemo(() => getRedFlags(values), [values]);

  function update<K extends keyof EcgState>(key: K, value: EcgState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setValues(initialState);
    setImagePreview(null);
  }

  function handleImage(file?: File) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImagePreview(null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Apoio clínico"
        title="ECG guiado"
        description="Interpretação estruturada de eletrocardiograma com checklist clínico e imagem anexada apenas como apoio visual."
        badges={[
          { label: "Sem laudo automático", tone: "amber" },
          { label: "Texto copiável", tone: "cyan" },
        ]}
        metrics={[
          { label: "Campos", value: 15 },
          { label: "Imagem", value: "Opcional" },
        ]}
        notice={
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-sm leading-6 text-amber-900">
              Este módulo não faz diagnóstico automático por IA. Use para organizar a leitura,
              detectar red flags preenchidas e gerar texto de evolução. Revise sempre o traçado original.
            </p>
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><HeartPulse className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Dados principais</h2>
                <p className="text-sm text-slate-500">Preencha o que for visível/confiável.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-slate-800">Contexto clínico</span>
                <textarea value={values.context} onChange={(event) => update("context", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="Ex.: dor torácica há 2h, síncope, palpitações, rotina..." />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">Frequência</span>
                <input type="number" value={values.rate} onChange={(event) => update("rate", event.target.value)} min={20} max={250} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="bpm" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">Ritmo</span>
                <select value={values.rhythm} onChange={(event) => update("rhythm", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100">
                  {rhythmOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">Eixo</span>
                <select value={values.axis} onChange={(event) => update("axis", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100">
                  {axisOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">PR</span>
                <input type="number" value={values.pr} onChange={(event) => update("pr", event.target.value)} min={60} max={400} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="ms" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">QRS</span>
                <input type="number" value={values.qrs} onChange={(event) => update("qrs", event.target.value)} min={40} max={240} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="ms" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">QTc</span>
                <input type="number" value={values.qtc} onChange={(event) => update("qtc", event.target.value)} min={250} max={700} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="ms" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">Condução AV</span>
                <select value={values.avBlock} onChange={(event) => update("avBlock", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100">
                  {avBlockOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-800">Ramo / QRS largo</span>
                <select value={values.bundleBranchBlock} onChange={(event) => update("bundleBranchBlock", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100">
                  {bundleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Achados do traçado</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ToggleField label="Supra de ST em derivações contíguas" value={values.stElevation} onChange={(value) => update("stElevation", value)} />
              <ToggleField label="Infra de ST" value={values.stDepression} onChange={(value) => update("stDepression", value)} />
              <ToggleField label="Alterações de onda T" value={values.tWaveChange} onChange={(value) => update("tWaveChange", value)} />
              <ToggleField label="Ondas Q patológicas" value={values.pathologicQ} onChange={(value) => update("pathologicQ", value)} />
              <ToggleField label="Sinais de hipertrofia/sobrecarga" value={values.hypertrophy} onChange={(value) => update("hypertrophy", value)} />
              <ToggleField label="Dor torácica, síncope, dispneia importante ou instabilidade" value={values.urgentSymptoms} onChange={(value) => update("urgentSymptoms", value)} />
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-800">Observações livres</span>
              <textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" placeholder="Ex.: derivações com artefato, baixa voltagem, padrão de repolarização, comparação com ECG prévio..." />
            </label>
          </article>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Camera className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Imagem de apoio</h2>
                <p className="text-sm text-slate-500">Fica apenas no navegador nesta versão.</p>
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-cyan-400 hover:bg-cyan-50/40">
              <ImagePlus className="h-8 w-8 text-slate-400" />
              <span className="mt-3 text-sm font-semibold text-slate-700">Enviar foto do ECG</span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG ou imagem do traçado</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImage(event.target.files?.[0])} />
            </label>
            {imagePreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                <Image src={imagePreview} alt="Imagem do ECG enviada" width={900} height={620} className="h-auto w-full object-contain" unoptimized />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <Upload className="mb-2 h-4 w-4" />
                A imagem ajuda você a conferir o preenchimento, mas o texto é gerado pelos campos estruturados.
              </div>
            )}
          </article>

          <article className={`rounded-2xl border p-5 shadow-sm ${redFlags.length ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex items-start gap-3">
              {redFlags.length ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />}
              <div>
                <h2 className={`font-semibold ${redFlags.length ? "text-rose-950" : "text-emerald-950"}`}>
                  {redFlags.length ? "Red flags preenchidas" : "Sem red flags marcadas"}
                </h2>
                <p className={`mt-1 text-sm leading-6 ${redFlags.length ? "text-rose-800" : "text-emerald-800"}`}>
                  {redFlags.length ? redFlags.join("; ") : "Ainda assim, um ECG aparentemente tranquilo não exclui doença conforme sintomas e contexto."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-white shadow-sm">
            <div className="border-b border-cyan-100 bg-cyan-50/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-cyan-700" />
                  <h2 className="font-semibold text-slate-950">Texto para evolução</h2>
                </div>
                <CopyButton text={interpretation} label="Copiar" copiedLabel="Copiado" />
              </div>
            </div>
            <pre className="max-h-[420px] whitespace-pre-wrap overflow-auto p-5 text-sm leading-6 text-slate-700">{interpretation}</pre>
            <div className="flex flex-wrap gap-3 border-t border-slate-100 p-5">
              <button type="button" onClick={() => void navigator.clipboard.writeText(interpretation)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white"><Copy className="h-4 w-4" />Copiar texto</button>
              <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"><RotateCcw className="h-4 w-4" />Limpar</button>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
