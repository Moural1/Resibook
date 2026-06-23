"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CopyButton from "../../../components/copy-button";
import {
  ArrowLeft,
  ClipboardCheck,
  ClipboardList,
  FileText,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

type PrescriptionGuide = {
  title: string;
  focus: string;
  symptomBlocks: string[];
  exams: string[];
  safety: string[];
  reassessment: string[];
};

const GUIDES: PrescriptionGuide[] = [
  {
    title: "Dor torácica",
    focus: "Priorizar risco cardiovascular/respiratório antes de sintomáticos.",
    symptomBlocks: [
      "Analgesia conforme intensidade, perfil do paciente e contraindicações",
      "Antiemético se náuseas/vômitos associados",
      "Oxigênio apenas se hipoxemia ou desconforto respiratório relevante",
    ],
    exams: [
      "ECG precoce e repetir se dor persistente ou mudança clínica",
      "Troponina conforme protocolo local e tempo de início",
      "RX de tórax ou investigação de TEP/dissecção conforme probabilidade",
    ],
    safety: [
      "Checar alergias, uso de anticoagulante/antiagregante e risco de sangramento",
      "Evitar atribuir a ansiedade/refluxo antes de avaliar sinais de risco",
      "Documentar dor, irradiação, ECG e resposta às medidas iniciais",
    ],
    reassessment: [
      "Reavaliar dor, PA, FC, SpO2 e ECG se piora ou recorrência",
      "Definir critério de observação, alta, internação ou transferência",
    ],
  },
  {
    title: "Dispneia",
    focus: "Separar hipoxemia, broncoespasmo, congestão, infecção e TEP.",
    symptomBlocks: [
      "Oxigênio se hipoxemia, com alvo conforme contexto clínico",
      "Broncodilatador se broncoespasmo provável e sem contraindicação relevante",
      "Antitérmico/analgesia se síndrome infecciosa com febre ou dor",
    ],
    exams: [
      "Oximetria seriada e gasometria se gravidade ou retenção suspeita",
      "RX de tórax, ECG e exames direcionados pela hipótese principal",
      "Investigar TEP/IC/pneumonia conforme probabilidade clínica",
    ],
    safety: [
      "Checar sinais de exaustão, rebaixamento, cianose ou silêncio auscultatório",
      "Considerar isolamento se síndrome respiratória infecciosa",
      "Revisar comorbidades, tabagismo, medicações e alergias",
    ],
    reassessment: [
      "Reavaliar SpO2, FR, esforço respiratório e ausculta após medidas iniciais",
      "Escalonar suporte se piora, hipoxemia persistente ou fadiga",
    ],
  },
  {
    title: "Dor abdominal",
    focus: "Controlar sintomas sem perder abdome agudo, gestação ou sepse.",
    symptomBlocks: [
      "Analgesia proporcional à dor, com reavaliação do exame abdominal",
      "Antiemético se náuseas/vômitos",
      "Hidratação se vômitos, diarreia, jejum prolongado ou sinais de hipovolemia",
    ],
    exams: [
      "Hemograma/bioquímica conforme gravidade e hipótese",
      "EAS, beta-hCG quando aplicável e imagem conforme localização/alarme",
      "Amilase/lipase, função hepática ou lactato se contexto sugerir",
    ],
    safety: [
      "Checar gestação, alergias, função renal/hepática e uso de anticoagulante",
      "Pesquisar peritonite, sangramento, síncope, febre com toxemia e dor migratória",
      "Evitar alta sem reavaliar dor, vômitos e exame abdominal",
    ],
    reassessment: [
      "Reexaminar abdome após analgesia e hidratação",
      "Registrar sinais negativos importantes e critério de retorno",
    ],
  },
  {
    title: "Cefaleia",
    focus: "Tratar dor enquanto pesquisa sinais de alarme neurológico/infeccioso.",
    symptomBlocks: [
      "Analgesia conforme intensidade, com atenção a contraindicações",
      "Antiemético se náuseas/vômitos ou migrânea provável",
      "Hidratação se vômitos, baixa ingesta ou desidratação",
    ],
    exams: [
      "Imagem se início súbito, déficit, rebaixamento, papiledema ou alarme",
      "Laboratório conforme suspeita infecciosa/metabólica/hipertensiva",
      "Punção lombar apenas quando indicada e após segurança para o procedimento",
    ],
    safety: [
      "Pesquisar SNOOP, rigidez de nuca, febre, déficit focal e pior cefaleia da vida",
      "Checar PA, gestação, anticoagulação e imunossupressão",
      "Não chamar de migrânea antes de afastar red flags novas",
    ],
    reassessment: [
      "Reavaliar dor, nível de consciência, PA e exame neurológico",
      "Orientar retorno imediato se déficit, febre, piora ou mudança de padrão",
    ],
  },
  {
    title: "Vômitos / diarreia",
    focus: "Corrigir hidratação e eletrólitos sem perder abdome agudo ou sepse.",
    symptomBlocks: [
      "Hidratação oral ou venosa conforme tolerância e sinais de desidratação",
      "Antiemético se vômitos impedem hidratação",
      "Analgesia/antitérmico se dor ou febre, respeitando contraindicações",
    ],
    exams: [
      "Eletrólitos e função renal se grave, persistente, idoso ou comorbidade",
      "Hemograma se febre alta, sangue, toxemia ou diagnóstico incerto",
      "Imagem se dor localizada, peritonite ou suspeita cirúrgica",
    ],
    safety: [
      "Checar diurese, perfusão, PA, FC, mucosas e estado mental",
      "Pesquisar sangue nas fezes, dor localizada, gestação, imunossupressão e dengue",
      "Evitar alta se não tolera via oral ou mantém sinais de desidratação",
    ],
    reassessment: [
      "Reavaliar hidratação, vômitos, diurese e sinais vitais após medidas",
      "Definir retorno se piora, sangue, febre persistente ou dor localizada",
    ],
  },
  {
    title: "Crise convulsiva",
    focus: "Proteger via aérea, identificar causa reversível e prevenir recorrência.",
    symptomBlocks: [
      "Medidas de segurança, lateralização e proteção de via aérea quando necessário",
      "Corrigir hipoglicemia se presente conforme protocolo local",
      "Medicação anticonvulsivante apenas conforme protocolo e cenário clínico",
    ],
    exams: [
      "Glicemia imediata e eletrólitos conforme contexto",
      "TC se primeira crise, trauma, déficit focal, anticoagulação ou rebaixamento persistente",
      "Investigação infecciosa/toxicológica conforme história e exame",
    ],
    safety: [
      "Cronometrar crise e período pós-ictal",
      "Pesquisar trauma, febre, rigidez de nuca, intoxicação/abstinência e adesão medicamentosa",
      "Não liberar antes de recuperar segurança neurológica e causa provável",
    ],
    reassessment: [
      "Reavaliar consciência, via aérea, glicemia e déficit focal",
      "Definir observação, internação ou encaminhamento conforme risco de recorrência",
    ],
  },
];

const DEFAULT_GUIDE = GUIDES[0];

function buildPrescriptionText(guide: PrescriptionGuide, notes: string) {
  return [
    "PRESCRIÇÃO GUIADA - RESIBOOK",
    `Síndrome: ${guide.title}`,
    `Foco: ${guide.focus}`,
    "",
    "Blocos sintomáticos a considerar:",
    ...guide.symptomBlocks.map((item) => `- ${item}`),
    "",
    "Exames / avaliação:",
    ...guide.exams.map((item) => `- ${item}`),
    "",
    "Segurança antes de prescrever:",
    ...guide.safety.map((item) => `- ${item}`),
    "",
    "Reavaliação:",
    ...guide.reassessment.map((item) => `- ${item}`),
    notes.trim() ? "" : null,
    notes.trim() ? `Notas do caso: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function GuidedPrescriptionPage() {
  const [selectedTitle, setSelectedTitle] = useState(DEFAULT_GUIDE.title);
  const [notes, setNotes] = useState("");

  const guide =
    GUIDES.find((item) => item.title === selectedTitle) || DEFAULT_GUIDE;
  const copyText = useMemo(() => buildPrescriptionText(guide, notes), [guide, notes]);

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
                Prescrição segura
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Prescrição guiada por síndrome
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Organize sintomas, exames, pontos de segurança e reavaliação antes de fechar a prescrição do plantão.
              </p>
            </div>

            <CopyButton text={copyText} label="Copiar plano" copiedLabel="Plano copiado" />
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Síndrome
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
                  Notas do caso
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={6}
                  placeholder="Ex.: alergias, função renal, gestação, sinais vitais, resposta às medidas iniciais."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Plano
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{guide.focus}</p>
                </div>
                <CopyButton text={copyText} label="Copiar" copiedLabel="Copiado" />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <PlanBlock title="Sintomáticos" items={guide.symptomBlocks} icon={ClipboardList} />
                <PlanBlock title="Exames" items={guide.exams} icon={FileText} />
                <PlanBlock title="Segurança" items={guide.safety} icon={ShieldAlert} />
                <PlanBlock title="Reavaliação" items={guide.reassessment} icon={Stethoscope} />
              </div>
            </div>

            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {copyText}
            </pre>
          </section>
        </div>
      </section>
    </div>
  );
}

function PlanBlock({
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
