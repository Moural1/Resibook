"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CopyButton from "../../../components/copy-button";
import { buildCaseRouting, findBestComplaint } from "@/lib/clinical-case-routing";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  HeartPulse,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

type RiskGuide = {
  title: string;
  summary: string;
  redFlags: string[];
  dischargeBlockers: string[];
  reassessment: string[];
  documentation: string[];
};

const DETAILED_GUIDES: RiskGuide[] = [
  {
    title: "Dor torácica",
    summary: "Priorize excluir instabilidade, SCA e diagnósticos tempo-dependentes antes de alta.",
    redFlags: [
      "Dor opressiva persistente, recorrente, em repouso ou com irradiação",
      "Síncope, sudorese fria, hipotensão, dispneia, confusão ou má perfusão",
      "ECG alterado, troponina em elevação ou dor associada a déficit neurológico",
    ],
    dischargeBlockers: [
      "Dor ativa ou recorrente sem explicação segura",
      "Sinais vitais instáveis ou ECG/exames pendentes relevantes",
      "Paciente sem compreensão dos sinais de retorno ou sem acesso a reavaliação",
    ],
    reassessment: [
      "Repetir dor, PA, FC, SatO2 e perfusão após analgesia/conduta",
      "Rever ECG e exames seriados conforme protocolo local",
      "Documentar hipótese, diferenciais perigosos e motivo da decisão",
    ],
    documentation: [
      "Característica da dor, tempo, fatores de risco e exame cardiovascular",
      "ECG/exames avaliados e sinais de alarme pesquisados",
      "Orientações de retorno imediato e plano se sintomas recorrentes",
    ],
  },
  {
    title: "Dispneia",
    summary: "Segurança depende de esforço respiratório, saturação, resposta terapêutica e causa provável.",
    redFlags: [
      "Fala entrecortada, uso de musculatura acessória, cianose ou rebaixamento",
      "SatO2 baixa, dor torácica, síncope, hemoptise ou hipotensão",
      "Piora progressiva apesar de medidas iniciais",
    ],
    dischargeBlockers: [
      "Esforço respiratório persistente ou necessidade frequente de broncodilatador",
      "Hipoxemia, instabilidade ou suspeita de causa grave sem estratificação",
      "Sem plano claro de retorno se piora ou se medicação de resgate falhar",
    ],
    reassessment: [
      "Reavaliar FR, SatO2, ausculta e capacidade de falar após intervenção",
      "Checar resposta objetiva, não só melhora subjetiva",
      "Definir observação, internação ou alta com critérios explícitos",
    ],
    documentation: [
      "FR, SatO2, ausculta, esforço respiratório e resposta ao tratamento",
      "Fatores de risco para TEP/IC/pneumonia quando aplicável",
      "Sinais de retorno e uso correto das medicações orientadas",
    ],
  },
  {
    title: "Dor abdominal",
    summary: "Reexame e evolução temporal são parte da segurança, especialmente se exame inicial é pouco específico.",
    redFlags: [
      "Dor localizada progressiva, defesa, rigidez, peritonismo ou massa pulsátil",
      "Febre persistente, hipotensão, síncope, sangramento digestivo ou vômitos incoercíveis",
      "Gestação, imunossupressão, idoso frágil ou dor desproporcional",
    ],
    dischargeBlockers: [
      "Sem tolerância oral ou dor sem melhora/reavaliação",
      "Exame abdominal preocupante ou sinais vitais alterados",
      "Exame pendente que pode mudar conduta sem plano de checagem",
    ],
    reassessment: [
      "Repetir exame abdominal após analgesia e observar mudança de localização",
      "Checar hidratação, diurese, febre e tolerância oral",
      "Explicar retorno se dor migrar, localizar ou piorar",
    ],
    documentation: [
      "Exame abdominal inicial e reexame",
      "Sinais vitais, tolerância oral e sinais de alarme negados",
      "Plano para exames pendentes e orientação de retorno",
    ],
  },
  {
    title: "Cefaleia",
    summary: "O foco é não perder cefaleia secundária com red flags neurológicas, infecciosas ou vasculares.",
    redFlags: [
      "Pior cefaleia da vida, início súbito ou progressão rápida",
      "Déficit focal, convulsão, confusão, papiledema ou alteração visual importante",
      "Febre, rigidez de nuca, imunossupressão, gestação/puerpério ou trauma",
    ],
    dischargeBlockers: [
      "Déficit neurológico, alteração do nível de consciência ou rigidez de nuca",
      "Dor refratária ou padrão novo preocupante sem investigação adequada",
      "Sem acompanhante/orientação se sedação ou medicação com sonolência",
    ],
    reassessment: [
      "Reavaliar dor, PA, exame neurológico e estado mental",
      "Confirmar melhora funcional, não apenas redução parcial da dor",
      "Definir seguimento se recorrência ou mudança de padrão",
    ],
    documentation: [
      "Red flags pesquisadas e exame neurológico",
      "Resposta ao tratamento e condição no momento da alta",
      "Orientações de retorno para déficit, febre, piora súbita ou convulsão",
    ],
  },
  {
    title: "Febre",
    summary: "Estratifique gravidade por aparência clínica, foco provável, comorbidades e sinais de sepse.",
    redFlags: [
      "Hipotensão, confusão, taquipneia, má perfusão ou oligúria",
      "Rigidez de nuca, petéquias, dispneia, dor torácica ou dor abdominal importante",
      "Imunossupressão, extremos de idade, gestação ou retorno por piora",
    ],
    dischargeBlockers: [
      "Sinais vitais instáveis ou suspeita de sepse",
      "Foco grave sem plano terapêutico/seguimento claro",
      "Incapacidade de hidratar, prostração ou ausência de rede de apoio",
    ],
    reassessment: [
      "Repetir sinais vitais após antitérmico, hidratação ou antibiótico quando indicado",
      "Checar perfusão, estado mental, diurese e tolerância oral",
      "Definir prazo objetivo de retorno se febre persistente",
    ],
    documentation: [
      "Sinais vitais, foco pesquisado e aparência geral",
      "Critérios de gravidade avaliados",
      "Orientação de retorno e pendências laboratoriais/culturais",
    ],
  },
  {
    title: "Vômitos / diarreia",
    summary: "A decisão gira em torno de hidratação, tolerância oral e sinais de abdome grave ou infecção invasiva.",
    redFlags: [
      "Sangue nas fezes, dor abdominal localizada, febre alta persistente",
      "Sonolência, tontura importante, pouca urina ou sinais de desidratação",
      "Vômitos incoercíveis, idoso frágil, gestante ou comorbidade relevante",
    ],
    dischargeBlockers: [
      "Sem tolerância oral ou desidratação não corrigida",
      "Dor progressiva/localizada ou sinais vitais alterados",
      "Dificuldade de retorno se piora ou grupo de maior risco",
    ],
    reassessment: [
      "Reavaliar hidratação, diurese referida, tontura e tolerância oral",
      "Checar abdome novamente se dor associada",
      "Orientar hidratação fracionada e retorno se sinais de alarme",
    ],
    documentation: [
      "Estado de hidratação, sinais vitais e tolerância oral",
      "Presença/ausência de sangue, febre e dor localizada",
      "Orientações de retorno e grupos de risco",
    ],
  },
];

function buildGeneratedGuide(title: string): RiskGuide {
  const routing = buildCaseRouting(title);

  return {
    title,
    summary: routing.summary,
    redFlags: routing.riskPrompts,
    dischargeBlockers: [
      "Qualquer red flag presente sem investigação, estabilização ou destino definido",
      "Sinais vitais alterados, piora clínica ou resposta insuficiente às medidas iniciais",
      "Ausência de reavaliação documentada ou de plano claro para retorno e seguimento",
    ],
    reassessment: routing.priorities,
    documentation: [
      "Cronologia da queixa, sinais vitais e achados positivos/negativos relevantes",
      "Red flags pesquisadas, hipóteses consideradas e resposta às medidas iniciais",
      "Motivo do destino escolhido, pendências e critérios objetivos de retorno",
    ],
  };
}

const ALL_GUIDES = QUICK_COMPLAINTS.map((complaint) => {
  return DETAILED_GUIDES.find((guide) => guide.title === complaint.title) || buildGeneratedGuide(complaint.title);
});

const DEFAULT_GUIDE = ALL_GUIDES[0];

function buildChecklistText(guide: RiskGuide, notes: string) {
  return [
    "CHECKLIST DE RISCO - RESIBOOK",
    `Síndrome: ${guide.title}`,
    `Resumo: ${guide.summary}`,
    "",
    "Red flags:",
    ...guide.redFlags.map((item) => `- ${item}`),
    "",
    "Bloqueios de alta:",
    ...guide.dischargeBlockers.map((item) => `- ${item}`),
    "",
    "Reavaliação mínima:",
    ...guide.reassessment.map((item) => `- ${item}`),
    "",
    "Documentar:",
    ...guide.documentation.map((item) => `- ${item}`),
    notes.trim() ? "" : null,
    notes.trim() ? `Observações do caso: ${notes.trim()}` : null,
  ].filter(Boolean).join("\n");
}

export default function RiskChecklistPage() {
  const searchParams = useSearchParams();
  const incomingQuery = searchParams.get("q") || searchParams.get("busca") || "";
  const incomingComplaint = findBestComplaint(incomingQuery);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [notes, setNotes] = useState("");
  const effectiveTitle = selectedTitle || incomingComplaint?.title || DEFAULT_GUIDE.title;
  const guide = ALL_GUIDES.find((item) => item.title === effectiveTitle) || DEFAULT_GUIDE;
  const text = useMemo(() => buildChecklistText(guide, notes), [guide, notes]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/plantao" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950">
                <ArrowLeft className="h-4 w-4" />
                Central de plantão
              </Link>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Segurança clínica</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Checklist de risco</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Revise red flags, bloqueios de alta e pontos mínimos de reavaliação antes de fechar a conduta.</p>
            </div>
            <CopyButton text={text} label="Copiar checklist" copiedLabel="Checklist copiado" />
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-4">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"><ShieldCheck className="h-4.5 w-4.5" /></div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Síndrome</p>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Escolha o cenário</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {incomingComplaint ? (
                  <div className="mb-1 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">Contexto recebido</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{incomingComplaint.title}</p>
                  </div>
                ) : null}

                {ALL_GUIDES.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setSelectedTitle(item.title)}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition ${item.title === guide.title ? "border-slate-400 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </section>

            <label className="block rounded-[24px] border border-slate-200 bg-white p-4">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Observações do caso</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                placeholder="Ex.: ECG sem supra, dor melhorou, troponina 2h pendente, retorno orientado."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </label>
          </aside>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Revisão</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{guide.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{guide.summary}</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <InfoBlock title="Red flags" items={guide.redFlags} icon={ShieldAlert} />
                <InfoBlock title="Bloqueios de alta" items={guide.dischargeBlockers} icon={ListChecks} />
                <InfoBlock title="Reavaliação mínima" items={guide.reassessment} icon={HeartPulse} />
                <InfoBlock title="Documentar" items={guide.documentation} icon={FileText} />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Texto copiável</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Checklist para prontuário/passagem</h2>
                </div>
                <CopyButton text={text} label="Copiar" copiedLabel="Copiado" />
              </div>
              <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">{text}</pre>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function InfoBlock({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
            <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
