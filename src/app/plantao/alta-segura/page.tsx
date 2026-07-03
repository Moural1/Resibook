"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CopyButton from "../../../components/copy-button";
import { findBestComplaint } from "@/lib/clinical-case-routing";
import {
  CLINICAL_CASE_SESSION_EVENT,
  formatCaseIdentification,
  formatCaseVitals,
  loadClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  HeartPulse,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

type DischargeGuide = {
  title: string;
  summary: string;
  homeCare: string[];
  returnSigns: string[];
  followUp: string[];
  documentation: string[];
};

const GUIDES: DischargeGuide[] = [
  {
    title: "Dor torácica",
    summary: "Alta apenas se risco imediato foi reavaliado e critérios locais permitirem.",
    homeCare: [
      "Manter repouso relativo nas próximas horas se persistir mal-estar",
      "Usar apenas medicações orientadas na prescrição e evitar automedicação",
      "Evitar esforço intenso até reavaliação se a causa ainda não estiver totalmente esclarecida",
    ],
    returnSigns: [
      "Dor no peito forte, recorrente, opressiva ou com irradiação",
      "Falta de ar, desmaio, sudorese fria, palpitações ou piora importante",
      "Dor associada a fraqueza, confusão, lábios arroxeados ou mal-estar intenso",
    ],
    followUp: [
      "Reavaliar com serviço de saúde se sintomas retornarem ou se exames pendentes alterarem",
      "Levar ECG, exames e prescrição na próxima avaliação",
    ],
    documentation: [
      "Registrar ECG/exames avaliados, sinais de alarme negados e motivo da alta",
      "Documentar orientação de retorno imediato se recorrência da dor",
    ],
  },
  {
    title: "Dispneia",
    summary: "Alta exige melhora clínica, saturação estável e ausência de esforço respiratório relevante.",
    homeCare: [
      "Manter hidratação e repouso relativo",
      "Usar medicações e inaladores conforme prescrição, sem aumentar dose por conta própria",
      "Evitar fumaça, poeira e esforço até melhora sustentada",
    ],
    returnSigns: [
      "Falta de ar em repouso, piora progressiva ou dificuldade para falar frases",
      "Lábios arroxeados, sonolência, confusão, dor no peito ou desmaio",
      "Febre persistente, chiado importante ou saturação baixa se tiver oxímetro",
    ],
    followUp: [
      "Reavaliar em unidade de saúde se não houver melhora em 24-48h ou antes se piorar",
      "Retornar imediatamente se precisar usar broncodilatador com frequência maior que orientada",
    ],
    documentation: [
      "Registrar SpO2, FR, ausculta, resposta às medidas e orientação de retorno",
      "Documentar se havia ou não sinais de esforço respiratório no momento da alta",
    ],
  },
  {
    title: "Dor abdominal",
    summary: "Alta precisa de reexame abdominal, tolerância via oral e ausência de sinais cirúrgicos/sepse.",
    homeCare: [
      "Manter dieta leve e hidratação conforme tolerância",
      "Usar medicações prescritas e evitar anti-inflamatórios se houver contraindicação",
      "Não mascarar piora progressiva com repetidas medicações em casa",
    ],
    returnSigns: [
      "Dor localizada ou progressiva, barriga rígida, desmaio ou piora importante",
      "Febre persistente, vômitos repetidos, sangue nas fezes ou fezes pretas",
      "Impossibilidade de beber líquidos, pouca urina ou prostração",
    ],
    followUp: [
      "Reavaliar se a dor não melhorar, mudar de localização ou voltar com intensidade",
      "Levar resultados de exames e retornar se houver exame pendente alterado",
    ],
    documentation: [
      "Registrar reexame abdominal, tolerância oral e sinais de alarme negados",
      "Documentar orientação sobre retorno se dor migrar ou piorar",
    ],
  },
  {
    title: "Cefaleia",
    summary: "Alta exige melhora, exame neurológico seguro e ausência de red flags novas.",
    homeCare: [
      "Repousar em ambiente calmo, hidratar-se e seguir a prescrição",
      "Evitar álcool e privação de sono nas próximas 24h",
      "Não repetir analgésicos acima do orientado",
    ],
    returnSigns: [
      "Pior cefaleia da vida, início súbito ou dor progressiva",
      "Fraqueza, fala enrolada, confusão, desmaio, convulsão ou alteração visual",
      "Febre, rigidez de nuca, vômitos persistentes ou piora apesar da medicação",
    ],
    followUp: [
      "Reavaliar se houver mudança no padrão da dor ou necessidade frequente de medicação",
      "Procurar acompanhamento se crises forem recorrentes",
    ],
    documentation: [
      "Registrar exame neurológico, sinais de alarme pesquisados e resposta ao tratamento",
      "Documentar orientação de retorno para déficit, febre ou piora súbita",
    ],
  },
  {
    title: "Vômitos / diarreia",
    summary: "Alta depende de hidratação adequada, tolerância oral e ausência de sinais de gravidade.",
    homeCare: [
      "Priorizar hidratação oral fracionada e alimentação leve conforme tolerância",
      "Usar medicações prescritas e evitar automedicação com antidiarreicos sem orientação",
      "Observar diurese, sede intensa, tontura e estado geral",
    ],
    returnSigns: [
      "Sangue nas fezes, vômitos persistentes ou incapacidade de beber líquidos",
      "Febre alta persistente, dor abdominal localizada ou piora progressiva",
      "Pouca urina, tontura ao levantar, sonolência ou sinais de desidratação",
    ],
    followUp: [
      "Reavaliar se não houver melhora em 24-48h ou antes se sinais de alerta",
      "Retornar se criança, idoso, gestante ou comorbidade evoluir com piora",
    ],
    documentation: [
      "Registrar estado de hidratação, tolerância oral, sinais vitais e diurese referida",
      "Documentar orientação de retorno se sangue, desidratação ou dor localizada",
    ],
  },
  {
    title: "Crise convulsiva",
    summary: "Alta só deve ocorrer se recuperação neurológica for segura e risco de recorrência estiver endereçado.",
    homeCare: [
      "Não dirigir, nadar sozinho ou operar máquinas até liberação adequada",
      "Evitar álcool, privação de sono e abandono de medicações",
      "Manter acompanhante nas próximas horas se houver risco ou primeira crise",
    ],
    returnSigns: [
      "Nova crise, crise prolongada, trauma, febre ou rigidez de nuca",
      "Sonolência persistente, confusão, fraqueza focal ou dor de cabeça intensa",
      "Vômitos repetidos, comportamento muito diferente ou piora do estado geral",
    ],
    followUp: [
      "Agendar seguimento conforme orientação e levar exames/relato da crise",
      "Retornar imediatamente se recorrência ou recuperação incompleta",
    ],
    documentation: [
      "Registrar duração, pós-ictal, glicemia, exame neurológico e causa provável",
      "Documentar restrições orientadas e necessidade de acompanhamento",
    ],
  },
  {
    title: "Orientação geral",
    summary: "Use quando a queixa não se encaixa nos modelos específicos.",
    homeCare: [
      "Seguir exatamente a prescrição e as orientações combinadas",
      "Manter hidratação, repouso relativo e observar evolução dos sintomas",
      "Evitar automedicação e retornar se houver piora ou dúvida importante",
    ],
    returnSigns: [
      "Piora progressiva, falta de ar, dor forte, desmaio ou confusão",
      "Febre persistente, vômitos repetidos, sangramento ou prostração",
      "Qualquer sintoma novo importante ou dificuldade de acesso ao seguimento",
    ],
    followUp: [
      "Procurar reavaliação se não houver melhora no prazo orientado",
      "Levar exames, receitas e resumo do atendimento em nova avaliação",
    ],
    documentation: [
      "Registrar hipótese, estabilidade, sinais de alarme negados e plano de retorno",
      "Documentar entendimento das orientações pelo paciente/acompanhante",
    ],
  },
];

const DEFAULT_GUIDE = GUIDES[GUIDES.length - 1];

function findGuide(query: string) {
  const canonicalTitle = findBestComplaint(query)?.title.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  return GUIDES.find((item) => {
    const title = item.title.toLowerCase();
    return (
      title === canonicalTitle ||
      title === normalizedQuery ||
      title.includes(normalizedQuery) ||
      normalizedQuery.includes(title)
    );
  });
}

function buildCaseSummary(activeCase: ClinicalCaseSession | null) {
  if (!activeCase) return "";

  const reassessment = activeCase.reassessment;
  const currentVitals = reassessment
    ? Object.entries(reassessment.vitals)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => `${key.toUpperCase()} ${value.trim()}`)
        .join(" | ")
    : "";

  return [
    activeCase.selectedCid?.codigo
      ? `CID selecionado: ${activeCase.selectedCid.codigo} - ${activeCase.selectedCid.descricao}`
      : "",
    formatCaseVitals(activeCase)
      ? `Sinais vitais iniciais: ${formatCaseVitals(activeCase)}`
      : "",
    currentVitals ? `Sinais vitais na reavaliação: ${currentVitals}` : "",
    activeCase.redFlags.trim()
      ? `Sinais de alarme avaliados: ${activeCase.redFlags.trim()}`
      : "",
    activeCase.notes.trim()
      ? `História/exame direcionado: ${activeCase.notes.trim()}`
      : "",
    reassessment?.symptomStatus
      ? `Evolução do sintoma: ${reassessment.symptomStatus.trim()}`
      : "",
    reassessment?.treatmentResponse
      ? `Resposta às medidas: ${reassessment.treatmentResponse.trim()}`
      : "",
    reassessment?.decision
      ? `Decisão/destino registrado: ${reassessment.decision.trim()}`
      : "",
    reassessment?.notes
      ? `Observações da reavaliação: ${reassessment.notes.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getDischargeReadiness(activeCase: ClinicalCaseSession | null) {
  if (!activeCase) return [];

  return [
    {
      label: "Identificação completa",
      complete: Boolean(activeCase.age.trim() && activeCase.sex.trim()),
    },
    {
      label: "Sinais vitais iniciais",
      complete: Boolean(formatCaseVitals(activeCase)),
    },
    {
      label: "Sinais de alarme registrados",
      complete: Boolean(activeCase.redFlags.trim()),
    },
    {
      label: "Reavaliação registrada",
      complete: Boolean(activeCase.reassessment?.recordedAt),
    },
    {
      label: "Resposta ao tratamento",
      complete: Boolean(activeCase.reassessment?.treatmentResponse.trim()),
    },
    {
      label: "Decisão e destino",
      complete: Boolean(activeCase.reassessment?.decision.trim()),
    },
  ];
}

function buildDischargeText(
  guide: DischargeGuide,
  patient: string,
  notes: string,
  caseSummary: string
) {
  return [
    "ALTA SEGURA - RESIBOOK",
    `Paciente: ${patient.trim() || "não identificado"}`,
    `Quadro: ${guide.title}`,
    `Resumo: ${guide.summary}`,
    caseSummary ? "" : null,
    caseSummary ? "Contexto do atendimento:" : null,
    caseSummary || null,
    "",
    "Cuidados em casa:",
    ...guide.homeCare.map((item) => `- ${item}`),
    "",
    "Retornar imediatamente se:",
    ...guide.returnSigns.map((item) => `- ${item}`),
    "",
    "Seguimento:",
    ...guide.followUp.map((item) => `- ${item}`),
    "",
    "Checklist para documentar:",
    ...guide.documentation.map((item) => `- ${item}`),
    notes.trim() ? "" : null,
    notes.trim() ? `Observações adicionais: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function SafeDischargePage() {
  const searchParams = useSearchParams();
  const [selectedTitle, setSelectedTitle] = useState(DEFAULT_GUIDE.title);
  const [patient, setPatient] = useState("");
  const [notes, setNotes] = useState("");
  const [activeCase, setActiveCase] = useState<ClinicalCaseSession | null>(null);

  useEffect(() => {
    const query = searchParams.get("q")?.trim().toLowerCase();
    if (!query) return;

    const matched = findGuide(query);

    if (matched) {
      setSelectedTitle(matched.title);
    }
  }, [searchParams]);

  useEffect(() => {
    function refreshCase() {
      const saved = loadClinicalCaseSession();
      setActiveCase(saved);

      if (!saved) return;
      setPatient((current) => current || formatCaseIdentification(saved));

      const matched = findGuide(saved.complaint);
      if (matched) setSelectedTitle(matched.title);
    }

    refreshCase();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, refreshCase);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, refreshCase);
  }, []);

  const guide = GUIDES.find((item) => item.title === selectedTitle) || DEFAULT_GUIDE;
  const caseSummary = useMemo(() => buildCaseSummary(activeCase), [activeCase]);
  const readiness = useMemo(() => getDischargeReadiness(activeCase), [activeCase]);
  const completedItems = readiness.filter((item) => item.complete).length;
  const text = useMemo(
    () => buildDischargeText(guide, patient, notes, caseSummary),
    [caseSummary, guide, notes, patient]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/plantao"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Central de plantão
              </Link>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Alta e retorno
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Orientações de alta
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Gere orientações claras para casa, sinais de retorno e checklist de documentação antes de liberar o paciente.
              </p>
            </div>

            <CopyButton
              text={text}
              label="Copiar orientações"
              copiedLabel="Orientações copiadas"
              confirmationMessage="Confirme que estabilidade, critérios de alta, entendimento do paciente e sinais de retorno foram revisados. Deseja copiar as orientações?"
            />
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quadro
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {GUIDES.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setSelectedTitle(item.title)}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                      item.title === guide.title
                        ? "border-slate-400 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Paciente
                </span>
                <input
                  value={patient}
                  onChange={(event) => setPatient(event.target.value)}
                  placeholder="Ex.: Maria, 38a, atendimento por cefaleia"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Observações adicionais
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  placeholder="Ex.: exame pendente, medicação orientada, retorno agendado, acompanhante ciente."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </label>
            </div>

            {activeCase ? (
              <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">
                      Caso ativo integrado
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-950">
                      Conferência antes da alta
                    </h2>
                  </div>
                  <span className="rounded-lg border border-cyan-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-cyan-900">
                    {completedItems}/{readiness.length} documentados
                  </span>
                </div>

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {readiness.map((item) => (
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

                {completedItems < readiness.length ? (
                  <p className="mt-4 text-xs leading-5 text-slate-600">
                    Existem campos documentais pendentes. Isso não define sozinho a segurança clínica da alta; revise o caso e complete o registro.
                  </p>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-emerald-800">
                    Registro básico preenchido. Confirme estabilidade, critérios locais e entendimento das orientações.
                  </p>
                )}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Orientação
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{guide.summary}</p>
                </div>
                <CopyButton
                  text={text}
                  label="Copiar"
                  copiedLabel="Copiado"
                  confirmationMessage="Confirme que você revisou estas orientações para o paciente e o contexto atual. Deseja copiar?"
                />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <InfoBlock title="Cuidados em casa" items={guide.homeCare} icon={HeartPulse} />
                <InfoBlock title="Retornar se" items={guide.returnSigns} icon={ShieldAlert} />
                <InfoBlock title="Seguimento" items={guide.followUp} icon={Stethoscope} />
                <InfoBlock title="Documentar" items={guide.documentation} icon={FileText} />
              </div>
            </div>

            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {text}
            </pre>

            {activeCase ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/plantao/prescricao-guiada?q=${encodeURIComponent(activeCase.complaint)}`}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Revisar prescrição
                </Link>
                <Link
                  href={`/plantao/sbar?q=${encodeURIComponent(activeCase.complaint)}`}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Gerar SBAR
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  );
}

function InfoBlock({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
}) {
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


