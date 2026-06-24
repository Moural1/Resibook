"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CopyButton from "../../../components/copy-button";
import { buildCaseRouting } from "@/lib/clinical-case-routing";
import { formatCaseContext, formatCaseIdentification, loadClinicalCaseSession, saveClinicalCaseSession } from "@/lib/clinical-case-session";
import { AlertTriangle, ArrowLeft, ClipboardCheck, FileText, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";

const INITIAL_FORM = { identification: "", situation: "", background: "", assessment: "", recommendation: "", pending: "", risk: "A definir" };
const RISK_OPTIONS = ["A definir", "Baixo risco", "Observação", "Urgência", "Emergência"];

function buildInitialForm(query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return INITIAL_FORM;
  const routing = buildCaseRouting(cleanQuery);
  return { ...INITIAL_FORM, situation: `Queixa principal: ${routing.title}. Estado atual e motivo da passagem: `, recommendation: ["Reavaliar e definir destino conforme evolução clínica.", ...routing.priorities.slice(0, 2)].join("\n") };
}

function mapSessionRisk(severity: string) {
  if (severity === "Emergência") return "Emergência";
  if (severity === "Urgência") return "Urgência";
  if (severity === "Observação") return "Observação";
  if (severity === "Baixa complexidade") return "Baixo risco";
  return "A definir";
}

function normalize(value: string, fallback: string) { return value.trim() || fallback; }

function buildSbarText(form: typeof INITIAL_FORM) {
  return ["PASSAGEM SBAR - RESIBOOK", "", `Identificação: ${normalize(form.identification, "paciente não identificado")}`, `Risco/prioridade: ${form.risk}`, "", "S - Situação", normalize(form.situation, "Queixa principal, motivo da observação/transferência e estado atual ainda não preenchidos."), "", "B - Background", normalize(form.background, "Antecedentes, medicações, alergias, contexto e evolução prévia ainda não preenchidos."), "", "A - Avaliação", normalize(form.assessment, "Hipótese principal, sinais vitais, exame, exames relevantes e resposta inicial ainda não preenchidos."), "", "R - Recomendação", normalize(form.recommendation, "Conduta esperada, reavaliação, destino e critérios de acionamento ainda não preenchidos."), "", "Pendências", normalize(form.pending, "Sem pendências registradas."), "", "Checklist rápido", "- Repassar alergias, medicações em uso e comorbidades relevantes", "- Citar sinais vitais recentes e resposta às medidas iniciais", "- Deixar claro quem deve ser acionado e quando reavaliar"].join("\n");
}

export default function SbarPage() {
  const searchParams = useSearchParams();
  const incomingQuery = searchParams.get("q") || searchParams.get("busca") || "";
  const [form, setForm] = useState(() => buildInitialForm(incomingQuery));
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSessionContext, setHasSessionContext] = useState(false);

  useEffect(() => {
    const saved = loadClinicalCaseSession();
    if (saved) {
      const routing = buildCaseRouting(saved.complaint || incomingQuery);
      setForm((current) => ({ ...current, identification: formatCaseIdentification(saved), situation: formatCaseContext(saved), assessment: [saved.alerts.length ? `Alertas identificados: ${saved.alerts.join("; ")}` : "", saved.redFlags.trim() ? `Red flags descritas: ${saved.redFlags.trim()}` : ""].filter(Boolean).join("\n"), recommendation: ["Reavaliar e definir destino conforme evolução clínica.", ...routing.priorities.slice(0, 2)].join("\n"), pending: saved.priorities.map((item) => `- ${item}`).join("\n"), risk: mapSessionRisk(saved.severity) }));
      setHasSessionContext(true);
    }
    setSessionReady(true);
  }, [incomingQuery]);

  useEffect(() => {
    if (!sessionReady) return;
    const routing = buildCaseRouting(incomingQuery || form.situation);
    saveClinicalCaseSession({ complaint: routing.title, age: form.identification, sex: "", severity: form.risk, vitals: { pa: "", fc: "", fr: "", temp: "", spo2: "", glicemia: "" }, redFlags: form.assessment, notes: [form.situation, form.background].filter(Boolean).join("\n"), alerts: [], priorities: [...form.recommendation.split("\n"), ...form.pending.split("\n")].map((item) => item.replace(/^[-•]\s*/, "").trim()).filter(Boolean), updatedAt: new Date().toISOString() });
  }, [sessionReady, incomingQuery, form]);

  const sbarText = useMemo(() => buildSbarText(form), [form]);
  function updateField(field: keyof typeof INITIAL_FORM, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  return <div className="mx-auto max-w-6xl space-y-5"><section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><Link href="/plantao" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Central de plantão</Link><p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Passagem segura</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">SBAR de plantão</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Organize a troca de cuidado em Situação, Background, Avaliação e Recomendação, com uma cópia pronta para colar no prontuário ou enviar à equipe.</p></div><div className="flex flex-wrap gap-2">{incomingQuery || hasSessionContext ? <span className="inline-flex h-10 items-center rounded-2xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-semibold text-cyan-800">{hasSessionContext ? "Caso em andamento aplicado" : "Contexto do roteiro aplicado"}</span> : null}<CopyButton text={sbarText} label="Copiar SBAR" copiedLabel="SBAR copiado" /></div></div></div><div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.95fr_1.05fr]"><section className="space-y-4"><div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><Field label="Identificação"><input value={form.identification} onChange={(event) => updateField("identification", event.target.value)} placeholder="Ex.: João, 62a, leito 4, dor torácica" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></Field><Field label="Risco / prioridade"><select value={form.risk} onChange={(event) => updateField("risk", event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100">{RISK_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></Field></div></div><FieldCard icon={AlertTriangle} title="S - Situação" description="O problema agora, gravidade percebida e motivo da passagem." value={form.situation} placeholder="Ex.: dor torácica há 2h, ECG sem supra, dor parcial após analgesia, aguardando troponina." onChange={(value) => updateField("situation", value)} /><FieldCard icon={FileText} title="B - Background" description="Contexto clínico que muda decisão." value={form.background} placeholder="Ex.: HAS, DM, tabagista, uso de AAS, alergias negadas, sem IAM prévio conhecido." onChange={(value) => updateField("background", value)} /><FieldCard icon={Stethoscope} title="A - Avaliação" description="O que você encontrou e como interpretou." value={form.assessment} placeholder="Ex.: PA 150x90, FC 92, SpO2 97%, exame sem congestão, hipótese SCA baixo/intermediário risco." onChange={(value) => updateField("assessment", value)} /><FieldCard icon={ShieldCheck} title="R - Recomendação" description="O que precisa ser feito e quando reavaliar." value={form.recommendation} placeholder="Ex.: repetir ECG se dor, checar troponina seriada, reavaliar dor/sinais vitais em 30 min." onChange={(value) => updateField("recommendation", value)} /><Field label="Pendências"><textarea value={form.pending} onChange={(event) => updateField("pending", event.target.value)} rows={4} placeholder="Ex.: resultado de exame, parecer, medicação, contato com familiar, decisão de alta/internação." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></Field></section><section className="space-y-4"><div className="rounded-[24px] border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Prévia</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Texto pronto para copiar</h2></div><CopyButton text={sbarText} label="Copiar" copiedLabel="Copiado" /></div><pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">{sbarText}</pre></div><div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"><div className="flex gap-3"><ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" /><div><p className="text-sm font-semibold text-slate-950">Antes de passar</p><ul className="mt-3 space-y-2">{["Fale primeiro o risco e o motivo da passagem.", "Diga o que já foi feito e qual foi a resposta.", "Feche com uma recomendação acionável e um tempo de reavaliação."].map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700"><ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" /><span>{item}</span></li>)}</ul></div></div></div></section></div></section></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>{children}</label>; }
function FieldCard({ icon: Icon, title, description, value, placeholder, onChange }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; value: string; placeholder: string; onChange: (value: string) => void; }) { return <section className="rounded-[24px] border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"><Icon className="h-4.5 w-4.5" /></div><div className="min-w-0"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} placeholder={placeholder} className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" /></section>; }
