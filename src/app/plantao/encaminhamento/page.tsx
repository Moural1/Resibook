"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  LockKeyhole,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import CopyButton from "@/components/copy-button";
import {
  formatCaseVitals,
  loadClinicalCaseSession,
} from "@/lib/clinical-case-session";
import {
  buildClinicalReferral,
  type ClinicalReferralInput,
  type ReferralPriority,
} from "@/lib/clinical-referral";
import { resolveClinicalShiftContext } from "@/lib/clinical-shift-context";

const SPECIALTIES = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Psiquiatria",
  "Urologia",
];

const PRIORITIES: ReferralPriority[] = ["", "Eletivo", "Prioritário", "Urgente"];

const EMPTY_FORM: ClinicalReferralInput = {
  patient: "",
  complaint: "",
  specialty: "",
  request: "avaliação especializada e definição de conduta",
  sourceText: "",
  priorCare: "",
  functionalImpact: "",
  clinicalReason: "",
  priority: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50";
const TEXTAREA_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50";

function buildPatientLabel(age: string, sex: string) {
  const details = [age.trim() ? `de ${age.trim()}` : "", sex.trim()].filter(Boolean);
  return details.length ? `Paciente ${details.join(", ")}` : "";
}

export default function AssistedReferralPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ClinicalReferralInput>(EMPTY_FORM);
  const [contextLabel, setContextLabel] = useState("");
  const result = useMemo(() => buildClinicalReferral(form), [form]);
  const [finalText, setFinalText] = useState(result.text);

  useEffect(() => {
    const query = searchParams.get("q") || searchParams.get("busca") || "";
    const context = resolveClinicalShiftContext(query, loadClinicalCaseSession());
    if (!context.complaint) return;

    const saved = context.session;
    const vitals = saved ? formatCaseVitals(saved) : "";
    const sourceText = saved
      ? [
          `Queixa principal: ${saved.complaint}`,
          saved.notes.trim() ? `HDA: ${saved.notes.trim()}` : "",
          vitals ? `Sinais vitais: ${vitals}` : "",
          saved.redFlags.trim()
            ? `Sinais de alarme: ${saved.redFlags.trim()}`
            : "",
          saved.selectedCid?.codigo
            ? `CID: ${saved.selectedCid.codigo} - ${saved.selectedCid.descricao}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : `Queixa principal: ${context.complaint}`;

    setForm((current) => ({
      ...current,
      patient: saved ? buildPatientLabel(saved.age, saved.sex) : current.patient,
      complaint: context.complaint,
      sourceText,
    }));
    setContextLabel(
      saved ? "Caso em andamento aplicado" : "Queixa do fluxo aplicada"
    );
  }, [searchParams]);

  useEffect(() => {
    setFinalText(result.text);
  }, [result.text]);

  function update<K extends keyof ClinicalReferralInput>(
    key: K,
    value: ClinicalReferralInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const missingCount = result.completeness.filter((item) => !item.complete).length;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 overflow-x-hidden">
      <section className="w-full min-w-0 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_36%),linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/plantao"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Central de plantão
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
                  Resibook Shift
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                  <LockKeyhole className="h-3 w-3" /> Sem IA externa
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Encaminhamento assistido
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Cole sua anamnese e transforme o conteúdo em uma narrativa clínica
                contínua, objetiva e pronta para revisão — sem inventar informações.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {contextLabel ? (
                <span className="inline-flex h-10 items-center rounded-2xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-semibold text-cyan-800">
                  {contextLabel}
                </span>
              ) : null}
              <CopyButton
                text={finalText}
                label="Copiar encaminhamento"
                copiedLabel="Encaminhamento copiado"
              />
            </div>
          </div>
        </header>

        <div className="min-w-0 space-y-5 p-4 md:p-5">
          <section className="min-w-0 space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <SectionTitle
                icon={Send}
                eyebrow="Destino"
                title="Para onde o paciente vai?"
                description="Defina o serviço e o pedido. O sistema não escolhe prioridade nem especialidade por você."
              />

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                <Field label="Especialidade ou serviço">
                  <input
                    value={form.specialty}
                    onChange={(event) => update("specialty", event.target.value)}
                    placeholder="Ex.: Ortopedia, Cardiologia, Regulação"
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="O que você está solicitando">
                  <input
                    value={form.request}
                    onChange={(event) => update("request", event.target.value)}
                    placeholder="Ex.: avaliação e definição de conduta"
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {SPECIALTIES.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => update("specialty", specialty)}
                    className={`h-9 shrink-0 rounded-xl border px-3 text-xs font-semibold transition ${
                      form.specialty === specialty
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
              <SectionTitle
                icon={FileText}
                eyebrow="História clínica"
                title="Cole do jeito que você escreveu"
                description="Aceita texto corrido, tópicos e títulos como HDA, exame, conduta e exames."
              />

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                <Field label="Identificação breve (opcional)">
                  <input
                    value={form.patient}
                    onChange={(event) => update("patient", event.target.value)}
                    placeholder="Ex.: Paciente de 58 anos, hipertenso"
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Problema principal">
                  <input
                    value={form.complaint}
                    onChange={(event) => update("complaint", event.target.value)}
                    placeholder="Ex.: gonalgia direita crônica"
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <Field label="Anamnese / registro do atendimento" className="mt-3">
                <textarea
                  value={form.sourceText}
                  onChange={(event) => update("sourceText", event.target.value)}
                  rows={12}
                  placeholder={
                    "Cole aqui sua anamnese. Ex.:\nHDA: dor em joelho direito há 8 meses, com piora progressiva...\nExame físico: dor à mobilização e limitação funcional...\nConduta: analgesia e fisioterapia sem melhora satisfatória..."
                  }
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>

            <ReferralFinalEditor
              text={finalText}
              generatedText={result.text}
              onChange={setFinalText}
              rows={12}
            />

            <details className="group min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Justificativa
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                    Fortalecer o motivo do encaminhamento
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Campos opcionais para tornar a necessidade clínica mais clara.
                  </p>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>

              <div className="mt-4 grid gap-3">
                <Field label="Medidas e tratamentos já realizados">
                  <textarea
                    value={form.priorCare}
                    onChange={(event) => update("priorCare", event.target.value)}
                    rows={3}
                    placeholder="Ex.: analgesia, fisioterapia e medidas locais, sem melhora satisfatória"
                    className={TEXTAREA_CLASS}
                  />
                </Field>
                <Field label="Impacto funcional ou clínico">
                  <textarea
                    value={form.functionalImpact}
                    onChange={(event) => update("functionalImpact", event.target.value)}
                    rows={3}
                    placeholder="Ex.: limitação progressiva para caminhar e trabalhar"
                    className={TEXTAREA_CLASS}
                  />
                </Field>
                <Field label="Por que precisa do serviço de destino">
                  <textarea
                    value={form.clinicalReason}
                    onChange={(event) => update("clinicalReason", event.target.value)}
                    rows={3}
                    placeholder="Ex.: persistência dos sintomas apesar do tratamento e prejuízo funcional progressivo"
                    className={TEXTAREA_CLASS}
                  />
                </Field>
                <Field label="Prioridade definida por você">
                  <div className="grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority || "not-informed"}
                        type="button"
                        onClick={() => update("priority", priority)}
                        className={`h-10 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl border px-2 text-xs font-semibold transition ${
                          form.priority === priority
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {priority || "Não informar"}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </details>
          </section>

          <section className="min-w-0 space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white md:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Completude documental
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{result.score}% revisado</h2>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {missingCount ? `${missingCount} ponto(s) para revisar` : "Itens essenciais presentes"}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Revisão rápida
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                    O que sustenta o pedido
                  </h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                {result.completeness.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3 ${
                      item.complete
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-amber-200 bg-amber-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          item.complete
                            ? "bg-emerald-600 text-white"
                            : "border border-amber-300 bg-white text-amber-700"
                        }`}
                      >
                        {item.complete ? <Check className="h-3 w-3" /> : "!"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{item.label}</p>
                        {!item.complete ? (
                          <p className="mt-1 text-[11px] leading-4 text-slate-600">{item.detail}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ReferralFinalEditor({
  text,
  generatedText,
  onChange,
  rows,
}: {
  text: string;
  generatedText: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <div id="texto-final" className="min-w-0 overflow-hidden rounded-[24px] border border-cyan-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-cyan-100 bg-cyan-50/50 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            <Sparkles className="h-3.5 w-3.5" /> Prévia atualizada em tempo real
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Encaminhamento final
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Você pode editar livremente o texto abaixo antes de copiar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(generatedText)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar
          </button>
          <CopyButton
            text={text}
            label="Copiar texto"
            copiedLabel="Texto copiado"
          />
        </div>
      </div>

      <div className="p-4 md:p-5">
        <textarea
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          aria-label="Texto final editável do encaminhamento"
          className="w-full min-w-0 resize-y rounded-[20px] border border-slate-200 bg-[#fcfcfb] px-5 py-4 font-serif text-[15px] leading-7 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
        />
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p>
            Revise o texto antes de usar. O organizador preserva o conteúdo informado,
            mas não valida indicação, prioridade, critérios do serviço receptor ou protocolo local.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
