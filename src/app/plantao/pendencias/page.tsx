"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../../components/copy-button";
import { formatCaseContext, formatCaseIdentification, loadClinicalCaseSession } from "@/lib/clinical-case-session";
import { ArrowLeft, ClipboardCheck, Clock3, FileSearch, ListChecks, MessageSquareText, ShieldAlert, Stethoscope } from "lucide-react";

type PendingKey = "exams" | "reassessment" | "medications" | "consults" | "destination" | "alerts";
type PendingBlock = { key: PendingKey; title: string; description: string; placeholder: string; icon: React.ComponentType<{ className?: string }> };

const PENDING_BLOCKS: PendingBlock[] = [
  { key: "exams", title: "Exames e resultados", description: "O que ainda precisa sair ou ser conferido.", placeholder: "Ex.: troponina 2h, gasometria pós-BD, TC com laudo pendente.", icon: FileSearch },
  { key: "reassessment", title: "Reavaliação", description: "Horário, parâmetro e gatilho de decisão.", placeholder: "Ex.: reavaliar dor e PA às 18h; repetir SatO2 após broncodilatador.", icon: Clock3 },
  { key: "medications", title: "Medicações / condutas", description: "Medida em andamento, resposta esperada ou próxima dose.", placeholder: "Ex.: analgesia feita 16h, observar resposta; hidratação em curso.", icon: Stethoscope },
  { key: "consults", title: "Contato / encaminhamento", description: "Especialista, regulação, familiar ou equipe acionada.", placeholder: "Ex.: cirurgia avisada; aguardando vaga; familiar orientado.", icon: MessageSquareText },
  { key: "destination", title: "Destino provável", description: "Alta, observação, internação, transferência ou retorno.", placeholder: "Ex.: alta se controle de sintomas e exames sem alteração; observar se piora.", icon: ClipboardCheck },
  { key: "alerts", title: "Alertas de segurança", description: "Red flags, instabilidade, alergias ou pontos que não podem passar batido.", placeholder: "Ex.: alergia a dipirona; risco de queda; retornar se dor recorrente.", icon: ShieldAlert },
];

const PRIORITY_OPTIONS = ["Baixa", "Moderada", "Alta", "Crítica"] as const;

function buildPendingText({ patient, priority, owner, values }: { patient: string; priority: string; owner: string; values: Record<PendingKey, string> }) {
  const filledBlocks = PENDING_BLOCKS.filter((block) => values[block.key].trim());
  return [
    "MAPA DE PENDÊNCIAS - RESIBOOK",
    `Paciente / leito: ${patient.trim() || "não informado"}`,
    `Prioridade: ${priority}`,
    `Responsável / próximo passo: ${owner.trim() || "não informado"}`,
    "",
    filledBlocks.length ? "Pendências:" : "Pendências: sem pendências registradas.",
    ...filledBlocks.flatMap((block) => ["", `${block.title}:`, ...values[block.key].split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`)]),
  ].join("\n");
}

export default function PendingMapPage() {
  const [patient, setPatient] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITY_OPTIONS)[number]>("Moderada");
  const [owner, setOwner] = useState("");
  const [values, setValues] = useState<Record<PendingKey, string>>({ exams: "", reassessment: "", medications: "", consults: "", destination: "", alerts: "" });
  const [hasSessionContext, setHasSessionContext] = useState(false);

  useEffect(() => {
    const saved = loadClinicalCaseSession();
    if (!saved) return;
    setPatient(formatCaseIdentification(saved));
    setPriority(saved.severity === "Emergência" ? "Crítica" : saved.severity === "Urgência" ? "Alta" : saved.severity === "Observação" ? "Moderada" : "Baixa");
    setOwner("Reavaliar evolução, pendências e destino.");
    setValues((current) => ({
      ...current,
      reassessment: saved.priorities.join("\n"),
      destination: "Definir após reavaliação clínica e resultados pendentes.",
      alerts: [saved.alerts.join("\n"), saved.redFlags.trim(), formatCaseContext(saved)].filter(Boolean).join("\n"),
    }));
    setHasSessionContext(true);
  }, []);

  const pendingCount = PENDING_BLOCKS.filter((block) => values[block.key].trim()).length;
  const text = useMemo(() => buildPendingText({ patient, priority, owner, values }), [patient, priority, owner, values]);
  function updateValue(key: PendingKey, value: string) { setValues((current) => ({ ...current, [key]: value })); }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/plantao" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Central de plantão</Link>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Troca de turno</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Mapa de pendências</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Organize o que ainda precisa ser visto, reavaliado ou decidido antes de passar o caso.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasSessionContext ? <span className="inline-flex h-10 items-center rounded-2xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-semibold text-cyan-800">Caso em andamento aplicado</span> : null}
              <CopyButton text={text} label="Copiar pendências" copiedLabel="Pendências copiadas" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"><ListChecks className="h-4.5 w-4.5" /></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Identificação</p><h2 className="text-xl font-semibold tracking-tight text-slate-950">Quem fica no radar?</h2></div></div>
              <div className="mt-4 grid gap-3">
                <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-600">Paciente / leito</span><input value={patient} onChange={(event) => setPatient(event.target.value)} placeholder="Ex.: João, leito 03, dor torácica" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></label>
                <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-600">Responsável / próximo passo</span><input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Ex.: reavaliar após troponina; avisar R2 se dor voltar" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" /></label>
              </div>
              <div className="mt-4"><p className="mb-2 text-xs font-semibold text-slate-600">Prioridade</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{PRIORITY_OPTIONS.map((option) => <button key={option} type="button" onClick={() => setPriority(option)} className={`h-10 rounded-2xl border px-3 text-sm font-semibold transition ${priority === option ? "border-slate-400 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>{option}</button>)}</div></div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumo</p><div className="mt-3 grid gap-2 sm:grid-cols-3"><Metric label="Blocos preenchidos" value={String(pendingCount)} /><Metric label="Prioridade" value={priority} /><Metric label="Destino" value={values.destination.trim() ? "definido" : "pendente"} /></div></div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">{PENDING_BLOCKS.map((block) => <PendingTextarea key={block.key} block={block} value={values[block.key]} onChange={(value) => updateValue(block.key, value)} />)}</div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Texto copiável</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Passagem de pendências</h2></div><CopyButton text={text} label="Copiar" copiedLabel="Copiado" /></div><pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">{text}</pre></div>
          </section>
        </div>
      </section>
    </div>
  );
}

function PendingTextarea({ block, value, onChange }: { block: PendingBlock; value: string; onChange: (value: string) => void }) {
  const Icon = block.icon;
  return <label className="block rounded-[24px] border border-slate-200 bg-white p-4"><span className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"><Icon className="h-4.5 w-4.5" /></span><span><span className="block text-sm font-semibold text-slate-950">{block.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{block.description}</span></span></span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} placeholder={block.placeholder} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" /></label>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div>; }
