"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import CopyButton from "../../components/copy-button";
import ModulePageHeader from "@/components/module-page-header";
import ResibookGuard from "@/components/resibook-guard";
import ClinicalReassessmentPanel from "@/components/clinical-reassessment-panel";
import ClinicalEvolutionComposer from "@/components/clinical-evolution-composer";
import PainelTriagem from "@/components/shift/painel-triagem";
import SinaisAlarme from "@/components/shift/sinais-alarme";
import KitQueixa from "@/components/shift/kit-queixa";
import { PorNoQuadro } from "@/components/shift/central-caso";
import { COR_PRIORIDADE, NOME_COR } from "@/components/shift/prioridade";
import { buildContextualShiftHref, clinicalComplaintsMatch } from "@/lib/clinical-shift-context";
import {
  CLINICAL_CASE_SESSION_EVENT,
  clearClinicalCaseSession,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import { findQuickComplaint, QUICK_COMPLAINTS, type QuickComplaint } from "@/lib/clinical-quick-complaints";
import { consciencia as lerConsciencia, gravidadeLegada, valoresParaCalculadoras } from "@/lib/shift/caso";
import { queixaShift, sinaisDaQueixa, type SinalAlarme } from "@/lib/shift/queixas";
import {
  CONSCIENCIA_OPCOES,
  PRIORIDADES,
  lerTriagem,
  type Consciencia,
  type LeituraTriagem,
  type NivelPrioridade,
} from "@/lib/shift/triagem";
import { Activity, ArrowUpRight, ClipboardCheck, FileText, ListChecks, LogOut, RotateCcw, Search, Send, ShieldAlert, Stethoscope } from "lucide-react";

type CaseProfile = {
  title: string;
  differentials: string[];
  redFlags: string[];
  initialActions: string[];
  examFocus: string[];
};

type CaseAlert = {
  label: string;
  detail: string;
  tone: "critical" | "warning" | "info";
};

const DEFAULT_PROFILE: CaseProfile = {
  title: "Avaliação clínica inicial",
  differentials: [
    "Causas prevalentes para a queixa",
    "Diagnósticos tempo-dependentes",
    "Condições que mudam conduta imediata",
  ],
  redFlags: [
    "Instabilidade hemodinâmica ou respiratória",
    "Rebaixamento do nível de consciência",
    "Dor intensa, progressiva ou atípica",
    "Imunossupressão, gestação, extremos de idade ou comorbidades relevantes",
  ],
  initialActions: [
    "Definir prioridade de atendimento",
    "Rever sinais vitais e glicemia se indicado",
    "Checar alergias, medicações em uso, gestação e função renal/hepática",
    "Registrar hipótese principal, diagnósticos diferenciais e plano",
  ],
  examFocus: [
    "Exames direcionados pela hipótese principal",
    "ECG se dor torácica, síncope, dispneia ou alteração clínica relevante",
    "Imagem ou laboratório se houver sinal de gravidade",
  ],
};

const CASE_PROFILES: Record<string, CaseProfile> = {
  "Dor torácica": {
    title: "Dor torácica no PA",
    differentials: ["SCA/IAM", "TEP", "Dissecção de aorta", "Pneumotórax", "Dor musculoesquelética/refluxo"],
    redFlags: ["Dor opressiva ou irradiada", "Sudorese, síncope ou hipotensão", "Dispneia ou hipoxemia", "Déficit de pulso ou dor migratória"],
    initialActions: ["ECG precoce", "Monitorização e acesso venoso conforme gravidade", "Estratificar risco e tempo de início", "Checar contraindicações antes de qualquer medicação"],
    examFocus: ["ECG seriado", "Troponina conforme protocolo", "RX de tórax se indicado", "D-dímero/angioTC se suspeita de TEP conforme probabilidade"],
  },
  Dispneia: {
    title: "Dispneia aguda",
    differentials: ["Asma/DPOC", "Pneumonia", "Insuficiência cardíaca", "TEP", "Anafilaxia"],
    redFlags: ["SpO2 baixa", "Uso de musculatura acessória", "Cianose ou exaustão", "Confusão, sonolência ou silêncio auscultatório"],
    initialActions: ["Avaliar via aérea, respiração e circulação", "Oxigênio conforme saturação e contexto", "Ausculta, sinais de congestão e perfusão", "Considerar isolamento se síndrome infecciosa respiratória"],
    examFocus: ["Oximetria contínua", "Gasometria se grave", "RX de tórax", "ECG e marcadores conforme suspeita"],
  },
  "Dor abdominal": {
    title: "Dor abdominal",
    differentials: ["Abdome agudo cirúrgico", "Apendicite/colecistite", "Pancreatite", "Obstrução", "Causas ginecológicas/urinárias"],
    redFlags: ["Peritonite", "Vômitos persistentes", "Febre com toxemia", "Sangramento, síncope ou instabilidade"],
    initialActions: ["Localizar dor e tempo de evolução", "Pesquisar defesa, descompressão brusca e massas", "Checar gestação quando aplicável", "Evitar mascarar sinais antes de reavaliar quando quadro cirúrgico é possível"],
    examFocus: ["Hemograma e bioquímica conforme contexto", "EAS/urocultura se urinário", "Beta-hCG quando aplicável", "US/TC conforme hipótese e gravidade"],
  },
  Cefaleia: {
    title: "Cefaleia",
    differentials: ["Migrânea", "HSA", "Meningite", "AVC", "Hipertensão com lesão de órgão-alvo"],
    redFlags: ["Pior cefaleia da vida ou início súbito", "Déficit neurológico", "Febre/rigidez de nuca", "Papiledema, rebaixamento ou crise convulsiva"],
    initialActions: ["Pesquisar SNOOP e exame neurológico", "Verificar PA e sinais infecciosos", "Definir necessidade de imagem antes de punção", "Reavaliar resposta e persistência de sinais de alarme"],
    examFocus: ["TC de crânio se alarme", "Laboratório conforme suspeita", "Punção lombar se indicada após segurança", "ECG/labs se crise hipertensiva suspeita"],
  },
  Febre: {
    title: "Febre no PA",
    differentials: ["IVAS/influenza/COVID", "ITU", "Pneumonia", "Dengue/arbovirose", "Sepse"],
    redFlags: ["Hipotensão, confusão ou extremidades frias", "Dispneia/hipoxemia", "Petéquias ou sangramento", "Imunossupressão ou neutropenia"],
    initialActions: ["Procurar foco e critérios de sepse", "Hidratação e antitérmico se indicado", "Avaliar risco epidemiológico", "Definir necessidade de antibiótico, coleta e observação"],
    examFocus: ["Hemograma conforme quadro", "EAS se sintomas urinários ou sem foco", "RX se respiratório", "Lactato/culturas se sepse provável"],
  },
  "Vômitos / diarreia": {
    title: "Vômitos e diarreia",
    differentials: ["Gastroenterite", "Desidratação", "Dengue", "Abdome agudo", "Distúrbio metabólico"],
    redFlags: ["Sinais de choque ou desidratação importante", "Sangue nas fezes", "Dor abdominal localizada ou peritonite", "Idoso, gestante, lactente ou imunossuprimido"],
    initialActions: ["Classificar hidratação", "Checar glicemia se prostração", "Avaliar necessidade de hidratação oral/venosa", "Rever sinais de dengue e causas cirúrgicas"],
    examFocus: ["Eletrólitos se grave ou persistente", "Função renal se desidratação", "Hemograma se febre alta/sangramento", "Imagem se suspeita cirúrgica"],
  },
  "Crise convulsiva": {
    title: "Crise convulsiva",
    differentials: ["Epilepsia", "Hipoglicemia", "Intoxicação/abstinência", "Infecção SNC", "Lesão estrutural/AVC"],
    redFlags: ["Crise prolongada ou recorrente", "Rebaixamento persistente", "Trauma, febre ou rigidez de nuca", "Primeira crise ou déficit focal"],
    initialActions: ["Proteger via aérea e lateralizar se possível", "Checar glicemia capilar", "Cronometrar crise e período pós-ictal", "Buscar gatilhos, drogas e adesão medicamentosa"],
    examFocus: ["Glicemia imediata", "Eletrólitos se indicado", "TC se primeira crise, trauma ou déficit", "Investigação infecciosa se febre/meningismo"],
  },
  Vertigem: {
    title: "Vertigem",
    differentials: ["VPPB", "Neurite vestibular", "Labirintite", "AVC de circulação posterior", "Causa medicamentosa/metabólica"],
    redFlags: ["Déficit neurológico focal", "Ataxia incapacitante", "Cefaleia nova intensa", "Nistagmo vertical ou sinais centrais"],
    initialActions: ["Diferenciar tontura inespecífica de vertigem verdadeira", "Avaliar marcha, coordenação, pares cranianos e nistagmo", "Aplicar raciocínio HINTS apenas se síndrome vestibular aguda contínua", "Rever medicações, PA, glicemia e risco vascular"],
    examFocus: ["Glicemia se prostração ou confusão", "ECG se pré-síncope/palpitação", "Imagem se sinal central ou alto risco", "Laboratório conforme vômitos, desidratação ou suspeita metabólica"],
  },
  Síncope: {
    title: "Síncope",
    differentials: ["Vasovagal", "Hipotensão ortostática", "Arritmia", "SCA/TEP", "Crise convulsiva simulando síncope"],
    redFlags: ["Síncope durante esforço", "Dor torácica, dispneia ou palpitação", "ECG alterado ou cardiopatia conhecida", "Trauma importante ou recorrência em curto intervalo"],
    initialActions: ["Confirmar perda transitória de consciência e recuperação", "Checar PA deitado/em pé quando possível", "Pesquisar pródromos, gatilhos e história cardíaca", "Estratificar risco antes de alta"],
    examFocus: ["ECG para todos os casos relevantes", "Glicemia se dúvida diagnóstica", "Troponina/D-dímero apenas se suspeita clínica", "Hemograma se sangramento ou anemia possível"],
  },
  Lombalgia: {
    title: "Lombalgia",
    differentials: ["Lombalgia mecânica", "Ciatalgia/radiculopatia", "Pielonefrite/cólica renal", "Fratura", "Compressão medular/cauda equina"],
    redFlags: ["Retenção urinária ou anestesia em sela", "Déficit motor progressivo", "Febre, câncer, trauma ou perda ponderal", "Dor noturna intensa ou imunossupressão"],
    initialActions: ["Pesquisar red flags antes de tratar como mecânica", "Avaliar força, sensibilidade, reflexos e marcha", "Definir analgesia e orientação de mobilização", "Evitar imagem de rotina se quadro mecânico sem alarme"],
    examFocus: ["EAS se sintomas urinários", "Imagem se trauma, déficit ou suspeita infecciosa/neoplásica", "PCR/hemograma se infecção possível", "Avaliação urgente se cauda equina"],
  },
  Tosse: {
    title: "Tosse",
    differentials: ["IVAS", "Pneumonia", "Asma/broncoespasmo", "DPOC exacerbado", "Influenza/COVID/tuberculose conforme contexto"],
    redFlags: ["Dispneia ou SpO2 baixa", "Hemoptise", "Dor torácica ou toxemia", "Febre persistente, perda ponderal ou imunossupressão"],
    initialActions: ["Caracterizar duração, febre, escarro e exposição", "Auscultar e medir saturação", "Pesquisar risco epidemiológico e comorbidades", "Separar sintomático simples de suspeita de pneumonia/exacerbação"],
    examFocus: ["RX de tórax se suspeita de pneumonia, hipoxemia ou alarme", "Testes virais conforme cenário", "Hemograma/PCR se infecção moderada/grave", "Baciloscopia/teste TB se tosse crônica e sinais compatíveis"],
  },
  Icterícia: {
    title: "Icterícia",
    differentials: ["Hepatite", "Colestase/obstrução biliar", "Hemólise", "Colangite", "Lesão hepática medicamentosa"],
    redFlags: ["Febre com dor em hipocôndrio direito", "Confusão, sonolência ou sangramento", "Hipotensão ou toxemia", "Dor intensa com vômitos persistentes"],
    initialActions: ["Diferenciar padrão colestático, hepatocelular e hemolítico", "Pesquisar colúria, acolia, prurido, dor e febre", "Revisar álcool, medicamentos e exposições", "Avaliar gravidade clínica e necessidade de encaminhamento"],
    examFocus: ["Bilirrubinas, AST/ALT, FA/GGT e coagulograma", "Hemograma e reticulócitos se hemólise possível", "US de abdome se colestase/obstrução", "Sorologias conforme suspeita de hepatite"],
  },
  "Agitação / ansiedade": {
    title: "Agitação e ansiedade",
    differentials: ["Crise de pânico", "Delirium", "Intoxicação/abstinência", "Psicose/agitação psicomotora", "Hipóxia, hipoglicemia ou causa orgânica"],
    redFlags: ["Risco de auto/heteroagressão", "Rebaixamento ou delirium", "Febre, rigidez, hipóxia ou hipoglicemia", "Intoxicação, abstinência ou trauma"],
    initialActions: ["Garantir segurança da equipe e do paciente", "Checar sinais vitais, SpO2 e glicemia", "Buscar causa orgânica antes de assumir ansiedade primária", "Usar abordagem verbal e ambiente menos estimulante quando possível"],
    examFocus: ["Glicemia imediata", "ECG se medicação, intoxicação ou dor torácica", "Tóxicos/laboratório conforme contexto", "Investigação infecciosa/metabólica se delirium"],
  },
  "Hipertensão no PA": {
    title: "PA elevada no PA",
    differentials: ["Elevação pressórica assintomática", "Urgência hipertensiva", "Emergência hipertensiva", "Dor/ansiedade/abstinência", "Lesão de órgão-alvo"],
    redFlags: ["Dor torácica", "Déficit neurológico", "Dispneia/congestão", "Alteração visual, confusão ou oligúria"],
    initialActions: ["Repetir PA com técnica adequada", "Pesquisar lesão de órgão-alvo", "Tratar sintoma e causa desencadeante", "Evitar queda brusca sem emergência definida"],
    examFocus: ["ECG se sintomas ou risco", "Função renal e urina se indicado", "Troponina/RX conforme dor ou dispneia", "TC de crânio se déficit ou rebaixamento"],
  },
  "Picada de escorpião": {
    title: "Escorpionismo",
    differentials: ["Acidente escorpiônico leve", "Escorpionismo moderado/grave", "Reação vagal/dor intensa", "Anafilaxia rara", "Outro acidente por animal peçonhento"],
    redFlags: ["Criança, idoso ou comorbidade importante", "Vômitos repetidos, sudorese intensa ou sialorreia", "Hipertensão, arritmia, dispneia ou choque", "Dor desproporcional com sinais sistêmicos"],
    initialActions: ["Avaliar tempo do acidente e identificação do animal se possível", "Tratar dor e observar evolução clínica", "Pesquisar sinais autonômicos e cardiopulmonares", "Acionar referência/toxicologia se moderado ou grave"],
    examFocus: ["Monitorização se sintomas sistêmicos", "ECG se manifestações cardiovasculares", "Glicemia/eletrólitos conforme gravidade", "Encaminhamento para soro conforme protocolo regional"],
  },
};

function getProfile(complaintTitle: string) {
  return CASE_PROFILES[complaintTitle] || DEFAULT_PROFILE;
}

function getFirstHourTasks(profile: CaseProfile, alerts: CaseAlert[]) {
  const tasks = [
    "Rever sinais vitais e estabilidade antes da alta ou transferência",
    profile.initialActions[0],
    profile.examFocus[0],
    "Registrar hipótese principal, diferenciais perigosos e plano de reavaliação",
  ].filter(Boolean);

  if (alerts.some((item) => item.tone === "critical")) {
    tasks.unshift("Acionar ajuda/retaguarda e priorizar monitorização");
  }

  return Array.from(new Set(tasks)).slice(0, 5);
}

function getSafetyChecks(alerts: CaseAlert[], severity: string) {
  const checks = [
    "Confirmar alergias, medicações em uso e comorbidades relevantes",
    "Checar gestação quando aplicável antes de exame, medicação ou conduta",
    "Considerar função renal/hepática antes de prescrever ou contrastar",
    "Registrar sinais de alarme negativos e orientar retorno se alta",
  ];

  if (severity === "Emergência" || alerts.some((item) => item.tone === "critical")) {
    checks.unshift("Reavaliar ABCDE, monitorização e necessidade de sala crítica");
  }

  if (alerts.length > 0) {
    checks.push("Repetir sinais vitais e documentar resposta às primeiras medidas");
  }

  return Array.from(new Set(checks)).slice(0, 6);
}

function getReassessmentPlan(alerts: CaseAlert[], severity: string) {
  const hasCriticalAlert = alerts.some((item) => item.tone === "critical");
  const hasWarningAlert = alerts.some((item) => item.tone === "warning");

  if (severity === "Emergência" || hasCriticalAlert) {
    return {
      label: "Reavaliação imediata",
      detail: "Não deixar sem rechecagem até estabilizar sinais vitais e prioridade.",
      items: [
        "Reavaliar ABCDE e sinais vitais após cada intervenção inicial",
        "Manter monitorização e acesso/retaguarda conforme gravidade",
        "Registrar resposta clínica e definir necessidade de transferência/sala crítica",
      ],
    };
  }

  if (severity === "Urgência" || hasWarningAlert) {
    return {
      label: "Reavaliação seriada",
      detail: "Programar rechecagem curta e documentar evolução antes de decidir destino.",
      items: [
        "Repetir sinais vitais após medidas iniciais ou mudança clínica",
        "Rever dor, dispneia, nível de consciência e sinais de alarme",
        "Definir critério objetivo para observação, alta, internação ou transferência",
      ],
    };
  }

  return {
    label: "Reavaliar antes da alta",
    detail: "Confirmar estabilidade, entendimento das orientações e sinais de retorno.",
    items: [
      "Rever sinais vitais e exame direcionado antes da alta",
      "Checar se dor/sintoma principal melhorou ou tem plano de seguimento",
      "Orientar retorno imediato se surgirem sinais de alarme",
    ],
  };
}


type TextoCaso = {
  complaint: string;
  age: string;
  sex: string;
  vitals: Record<string, string>;
  notes: string;
  profile: CaseProfile;
  leitura: LeituraTriagem;
  prioridade: NivelPrioridade | null;
  manual: boolean;
  sinais: SinalAlarme[];
  outrosSinais: string;
  firstHourTasks: string[];
  safetyChecks: string[];
  reassessment: ReturnType<typeof getReassessmentPlan>;
};

function linhaPrioridade(params: TextoCaso) {
  if (!params.prioridade) return "Prioridade: a definir";
  const { rotulo } = PRIORIDADES[params.prioridade];
  return `Prioridade: ${NOME_COR[params.prioridade]} · ${rotulo} (definida pelo médico)`;
}

function linhaEscores(leitura: LeituraTriagem) {
  return [
    leitura.news2 ? `NEWS2 ${leitura.news2.pontos}${leitura.news2.completo ? "" : ` (parcial, ${leitura.news2.parametros}/7)`}` : "",
    leitura.qsofa ? `qSOFA ${leitura.qsofa.pontos}` : "",
    leitura.indiceChoque !== null ? `índice de choque ${leitura.indiceChoque.toFixed(2).replace(".", ",")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function linhaVitais(vitals: Record<string, string>, separador: string) {
  return Object.entries(vitals)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key.toUpperCase()}${separador}${value}`)
    .join(separador === ": " ? " | " : ", ");
}

function buildCaseText(params: TextoCaso) {
  const vitalsText = linhaVitais(params.vitals, ": ");
  const escores = linhaEscores(params.leitura);
  return [
    "CASO RÁPIDO - RESIBOOK",
    `Queixa: ${params.complaint || "não definida"}`,
    `Paciente: ${params.age || "idade não informada"} | ${params.sex || "sexo não informado"}`,
    linhaPrioridade(params),
    vitalsText ? `Sinais vitais: ${vitalsText}` : "Sinais vitais: não preenchidos",
    escores ? `Escores: ${escores}` : "",
    params.leitura.alertas.length
      ? `Alertas: ${params.leitura.alertas.map((item) => item.titulo).join("; ")}`
      : "Alertas: sem alerta automático pelos campos preenchidos",
    params.sinais.length ? `Sinais de alarme presentes: ${params.sinais.map((item) => item.texto).join("; ")}` : "",
    params.outrosSinais ? `Outros sinais de alarme: ${params.outrosSinais}` : "",
    params.notes ? `Anotações: ${params.notes}` : "",
    "",
    "Hipóteses para lembrar:",
    ...params.profile.differentials.map((item) => `- ${item}`),
    "",
    "Ações iniciais:",
    ...params.profile.initialActions.map((item) => `- ${item}`),
    "",
    "Primeira hora / pendências:",
    ...params.firstHourTasks.map((item) => `- ${item}`),
    "",
    `Reavaliação: ${params.reassessment.label} - ${params.reassessment.detail}`,
    ...params.reassessment.items.map((item) => `- ${item}`),
    "",
    "Checklist de segurança:",
    ...params.safetyChecks.map((item) => `- ${item}`),
    "",
    "Exames/avaliação:",
    ...params.profile.examFocus.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildHandoffText(params: TextoCaso) {
  const vitalsText = linhaVitais(params.vitals, " ");
  const escores = linhaEscores(params.leitura);
  return [
    "PASSAGEM DE CASO - RESIBOOK",
    `Identificação: ${params.age || "idade não informada"}, ${params.sex || "sexo não informado"}.`,
    `Situação: ${params.complaint || "queixa não definida"}.`,
    `${linhaPrioridade(params)}.`,
    vitalsText ? `Sinais vitais: ${vitalsText}.` : "Sinais vitais: não preenchidos.",
    escores ? `Escores: ${escores}.` : "",
    params.leitura.alertas.length ? `Alertas: ${params.leitura.alertas.map((item) => item.titulo).join("; ")}.` : "",
    params.sinais.length ? `Sinais de alarme presentes: ${params.sinais.map((item) => item.texto).join("; ")}.` : "",
    params.outrosSinais ? `Outros sinais de alarme: ${params.outrosSinais}` : "",
    params.notes ? `Contexto/anotações: ${params.notes}` : "",
    `Hipóteses para lembrar: ${params.profile.differentials.slice(0, 3).join("; ")}.`,
    "Pendências da primeira hora:",
    ...params.firstHourTasks.map((item) => `- ${item}`),
    `Reavaliação: ${params.reassessment.label} - ${params.reassessment.detail}`,
    ...params.reassessment.items.map((item) => `- ${item}`),
    "Checklist de segurança:",
    ...params.safetyChecks.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
}

const VITAIS_VAZIOS = { pa: "", fc: "", fr: "", temp: "", spo2: "", glicemia: "" };

const INPUT =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

export default function CasoRapidoPage() {
  const searchParams = useSearchParams();

  const [complaint, setComplaint] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [redFlags, setRedFlags] = useState("");
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ ...VITAIS_VAZIOS });
  const [consciencia, setConsciencia] = useState<Consciencia>("");
  const [oxigenio, setOxigenio] = useState(false);
  const [sinaisMarcados, setSinaisMarcados] = useState<string[]>([]);
  const [alarmesRevisados, setAlarmesRevisados] = useState(false);
  const [manual, setManual] = useState<NivelPrioridade | null>(null);
  const [condutaDefinida, setCondutaDefinida] = useState(false);
  const [leito, setLeito] = useState("");
  const [sessaoAtual, setSessaoAtual] = useState<ClinicalCaseSession | null>(null);

  /* Restaura o caso ativo do aparelho; uma queixa diferente na URL abre caso novo. */
  useEffect(() => {
    const urlQuery = searchParams.get("q") || searchParams.get("busca") || "";
    const saved = loadClinicalCaseSession();
    if (saved && (!urlQuery || clinicalComplaintsMatch(urlQuery, saved.complaint))) {
      setComplaint(saved.complaint);
      setAge(saved.age);
      setSex(saved.sex);
      setVitals({ ...VITAIS_VAZIOS, ...saved.vitals });
      setRedFlags(saved.redFlags);
      setNotes(saved.notes);
      setConsciencia(lerConsciencia(saved.consciencia));
      setOxigenio(Boolean(saved.oxigenio));
      setSinaisMarcados(saved.sinaisAlarme ?? []);
      setAlarmesRevisados(Boolean(saved.alarmesRevisados));
      setManual(saved.prioridadeManual ?? null);
      setCondutaDefinida(Boolean(saved.condutaDefinida));
      setLeito(saved.leito ?? "");
      return;
    }
    if (urlQuery) setComplaint(urlQuery);
  }, [searchParams]);

  const activeComplaint = useMemo(() => findQuickComplaint(complaint), [complaint]);
  const workingComplaint = activeComplaint?.title || complaint.trim();
  const queixaAtual = useRef("");
  useEffect(() => {
    queixaAtual.current = workingComplaint;
  }, [workingComplaint]);
  const profile = getProfile(activeComplaint?.title || "");
  const sinais = useMemo(() => sinaisDaQueixa(activeComplaint?.title || ""), [activeComplaint]);
  const sinaisPresentes = useMemo(() => sinais.filter((sinal) => sinaisMarcados.includes(sinal.id)), [sinais, sinaisMarcados]);

  const leitura = useMemo(
    () =>
      lerTriagem({
        idade: age,
        vitals,
        consciencia,
        oxigenio,
        sinaisAlarme: [
          ...sinaisPresentes,
          ...(redFlags.trim() ? [{ id: "livre", texto: "Outros sinais de alarme descritos", nivel: "amarelo" as const, acao: redFlags.trim() }] : []),
        ],
      }),
    [age, vitals, consciencia, oxigenio, sinaisPresentes, redFlags]
  );

  const prioridade = manual;
  const severity = gravidadeLegada(prioridade);

  const alerts = useMemo<CaseAlert[]>(
    () =>
      leitura.alertas.map((item) => ({
        label: item.titulo,
        detail: item.detalhe,
        tone: item.nivel === "vermelho" || item.nivel === "laranja" ? "critical" : item.nivel === "amarelo" ? "warning" : "info",
      })),
    [leitura]
  );

  const firstHourTasks = useMemo(() => getFirstHourTasks(profile, alerts), [profile, alerts]);
  const safetyChecks = useMemo(() => getSafetyChecks(alerts, severity), [alerts, severity]);
  const reassessment = useMemo(() => getReassessmentPlan(alerts, severity), [alerts, severity]);

  const textoBase: TextoCaso = {
    complaint: workingComplaint,
    age,
    sex,
    vitals,
    notes,
    profile,
    leitura,
    prioridade,
    manual: Boolean(manual),
    sinais: sinaisPresentes,
    outrosSinais: redFlags.trim(),
    firstHourTasks,
    safetyChecks,
    reassessment,
  };
  const caseText = buildCaseText(textoBase);
  const handoffText = buildHandoffText(textoBase);

  const sessionBase = useMemo(
    () => ({
      complaint: workingComplaint,
      age,
      sex,
      severity,
      vitals,
      redFlags,
      notes,
      alerts: leitura.alertas.map((item) => item.titulo),
      priorities: firstHourTasks,
      consciencia,
      oxigenio,
      sinaisAlarme: sinaisPresentes.map((sinal) => sinal.id),
      alarmesRevisados,
      prioridadeManual: manual,
      condutaDefinida,
      leito: leito.trim(),
    }),
    [workingComplaint, age, sex, severity, vitals, redFlags, notes, leitura, firstHourTasks, consciencia, oxigenio, sinaisPresentes, alarmesRevisados, manual, condutaDefinida, leito]
  );

  useEffect(() => {
    if (!sessionBase.complaint) return;
    const previous = loadClinicalCaseSession();
    const sameCase = Boolean(previous && clinicalComplaintsMatch(previous.complaint, sessionBase.complaint));
    saveClinicalCaseSession({
      ...sessionBase,
      selectedCid: sameCase ? previous?.selectedCid || null : null,
      reassessment: sameCase ? previous?.reassessment || null : null,
      /* O vínculo com o Quadro do plantão vem da sessão (pode ter sido criado em outra tela). */
      quadroId: sameCase ? previous?.quadroId || "" : "",
      updatedAt: new Date().toISOString(),
    });
  }, [sessionBase]);

  const valoresCalculadora = useMemo(
    () => valoresParaCalculadoras({ ...sessionBase, updatedAt: "" }, leitura),
    [sessionBase, leitura]
  );

  function updateVital(key: keyof typeof vitals, value: string) {
    setVitals((current) => ({ ...current, [key]: value }));
  }

  function pickComplaint(item: QuickComplaint) {
    if (item.title !== activeComplaint?.title) {
      setSinaisMarcados([]);
      setAlarmesRevisados(false);
      setCondutaDefinida(false);
    }
    setComplaint(item.title);
  }

  function alternarSinal(id: string) {
    setAlarmesRevisados(true);
    setSinaisMarcados((atuais) => (atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]));
  }

  function nenhumSinal() {
    setSinaisMarcados([]);
    setAlarmesRevisados(true);
  }

  function novoCaso() {
    clearClinicalCaseSession();
    setComplaint("");
    setAge("");
    setSex("");
    setRedFlags("");
    setNotes("");
    setVitals({ ...VITAIS_VAZIOS });
    setConsciencia("");
    setOxigenio(false);
    setSinaisMarcados([]);
    setAlarmesRevisados(false);
    setManual(null);
    setCondutaDefinida(false);
    setLeito("");
  }

  /* Acompanha a sessão para mostrar o vínculo com o quadro e o leito definidos fora daqui. */
  useEffect(() => {
    function atualizar() {
      const sessao = loadClinicalCaseSession();
      const mesmoCaso = Boolean(sessao && queixaAtual.current && clinicalComplaintsMatch(sessao.complaint, queixaAtual.current));
      setSessaoAtual(mesmoCaso ? sessao : null);
      if (mesmoCaso && sessao?.leito !== undefined) setLeito((atual) => (atual.trim() === sessao.leito ? atual : sessao.leito ?? atual));
    }
    atualizar();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <ModulePageHeader
        eyebrow="Resibook Shift"
        title="Caso rápido"
        description="Preencha queixa e sinais vitais: os alertas, os escores e o kit da queixa se montam sozinhos. A prioridade é você quem define."
        badges={[
          { label: "Alertas automáticos", tone: "cyan" },
          { label: "Kit integrado", tone: "emerald" },
        ]}
        metrics={[
          { label: "Prioridade", value: prioridade ? NOME_COR[prioridade] : "A definir" },
          { label: "Alertas", value: leitura.alertas.length },
          { label: "NEWS2", value: leitura.news2 ? `${leitura.news2.pontos}${leitura.news2.completo ? "" : " (parcial)"}` : "—" },
        ]}
        actions={
          <>
            {sessaoAtual?.complaint ? <PorNoQuadro caso={sessaoAtual} /> : null}
            <button
              type="button"
              onClick={novoCaso}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
            >
              <RotateCcw className="h-4 w-4" />
              Novo caso
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Queixa principal" className="md:col-span-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={complaint}
                      onChange={(event) => setComplaint(event.target.value)}
                      placeholder="Ex.: cefaleia, dor torácica, dispneia..."
                      className={`${INPUT} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Leito / iniciais">
                  <input value={leito} onChange={(event) => setLeito(event.target.value)} placeholder="Ex.: Leito 3 (sem nome)" className={INPUT} />
                </Field>

                <Field label="Idade">
                  <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="Ex.: 62 anos ou 8 meses" className={INPUT} />
                </Field>

                <Field label="Sexo">
                  <select value={sex} onChange={(event) => setSex(event.target.value)} className={INPUT}>
                    <option value="">Não informado</option>
                    <option>Feminino</option>
                    <option>Masculino</option>
                    <option>Outro / não especificado</option>
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                {([
                  ["pa", "PA", "Ex.: 140x90"],
                  ["fc", "FC", "bpm"],
                  ["fr", "FR", "irpm"],
                  ["temp", "Temp.", "°C"],
                  ["spo2", "SpO2", "%"],
                  ["glicemia", "Glicemia", "mg/dL"],
                ] as const).map(([key, label, placeholder]) => (
                  <Field key={key} label={label}>
                    <input
                      value={vitals[key]}
                      onChange={(event) => updateVital(key, event.target.value)}
                      placeholder={placeholder}
                      inputMode={key === "pa" ? "text" : "decimal"}
                      className={INPUT}
                    />
                  </Field>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Consciência">
                  <select value={consciencia} onChange={(event) => setConsciencia(event.target.value as Consciencia)} className={INPUT}>
                    {CONSCIENCIA_OPCOES.map((opcao) => (
                      <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="flex items-end">
                  <span className="flex h-11 w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700">
                    <input type="checkbox" checked={oxigenio} onChange={(event) => setOxigenio(event.target.checked)} className="h-4 w-4 accent-cyan-700" />
                    Em oxigênio suplementar
                  </span>
                </label>
              </div>
            </div>

            {prioridade || leitura.alertas.length ? (
              <a
                href="#leitura-caso"
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold xl:hidden ${prioridade ? COR_PRIORIDADE[prioridade].faixa : "bg-slate-100 text-slate-800"}`}
              >
                <span>
                  {prioridade ? `${NOME_COR[prioridade]} · ${PRIORIDADES[prioridade].rotulo}` : "Prioridade a definir"}
                  <span className="block text-xs font-medium opacity-90">
                    {leitura.alertas.length} {leitura.alertas.length === 1 ? "alerta" : "alertas"}
                    {leitura.news2 ? ` · NEWS2 ${leitura.news2.pontos}` : ""}
                  </span>
                </span>
                <span className="text-xs">{prioridade ? "Ver leitura ↓" : "Definir ↓"}</span>
              </a>
            ) : null}

            <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4">
              <SinaisAlarme
                sinais={sinais}
                marcados={sinaisMarcados}
                revisados={alarmesRevisados}
                onAlternar={alternarSinal}
                onNenhum={nenhumSinal}
              />

              <Field label="Outros sinais de alarme">
                <textarea
                  rows={2}
                  value={redFlags}
                  onChange={(event) => setRedFlags(event.target.value)}
                  placeholder="Ex.: dor súbita, déficit focal, hipotensão, rigidez de nuca..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </Field>

              <Field label="Anotações rápidas">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="História curta, exame físico, contexto ou pendências."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Leitura do caso</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{profile.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={handoffText} label="Copiar passagem" copiedLabel="Copiada" />
                  <CopyButton text={caseText} label="Copiar caso" copiedLabel="Copiado" />
                </div>
              </div>
              <PainelTriagem leitura={leitura} manual={manual} onManual={setManual} />
            </div>

            <KitQueixa
              queixa={queixaShift(activeComplaint?.title || "")}
              titulo={workingComplaint}
              valores={valoresCalculadora}
              pediatrico={leitura.faixaEtaria === "pediatrico"}
              condutaDefinida={condutaDefinida}
              onCondutaDefinida={setCondutaDefinida}
            />

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex gap-3">
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{reassessment.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{reassessment.detail}</p>
                  <ul className="mt-3 space-y-2">
                    {reassessment.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                        <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <PlanBlock title="Hipóteses" items={profile.differentials} icon={Stethoscope} />
                <PlanBlock title="Exames" items={profile.examFocus} icon={FileText} />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <PlanBlock title="Ações iniciais" items={profile.initialActions} icon={ClipboardCheck} />
                <PlanBlock title="Primeira hora" items={firstHourTasks} icon={ShieldAlert} />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Checklist de segurança</p>
                <ul className="mt-3 space-y-2">
                  {safetyChecks.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <ModuleLink href={buildContextualShiftHref("/plantao/pendencias", workingComplaint)} title="Pendências" icon={ListChecks} />
              <ModuleLink href={buildContextualShiftHref("/plantao/sbar", workingComplaint)} title="Passagem SBAR" icon={FileText} />
              <ModuleLink href={buildContextualShiftHref("/plantao/encaminhamento", workingComplaint)} title="Encaminhamento" icon={Send} />
              <ModuleLink href={buildContextualShiftHref("/plantao/alta-segura", workingComplaint)} title="Alta segura" icon={LogOut} />
              <ModuleLink href={buildContextualShiftHref("/exames-evolucao", workingComplaint)} title="Exames / evolução" icon={FileText} />
              <ModuleLink href="/pacientes" title="Paciente" icon={Activity} />
            </div>
          </section>
        </div>
      </ModulePageHeader>

      <ClinicalReassessmentPanel />

      <ClinicalEvolutionComposer />

      <ResibookGuard context="plantao" />

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Entradas rápidas</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Comece pela síndrome</h2>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {QUICK_COMPLAINTS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => pickComplaint(item)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeComplaint?.title === item.title
                  ? "border-slate-300 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function PlanBlock({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-950">{title}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleLink({ href, title, icon: Icon }: { href: string; title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
    </Link>
  );
}
