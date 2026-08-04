export type ReferralPriority = "" | "Eletivo" | "Prioritário" | "Urgente";

export type ClinicalReferralInput = {
  patient: string;
  complaint: string;
  specialty: string;
  request: string;
  sourceText: string;
  priorCare: string;
  functionalImpact: string;
  clinicalReason: string;
  priority: ReferralPriority;
};

export type ReferralSectionKey =
  | "patient"
  | "complaint"
  | "history"
  | "background"
  | "medications"
  | "allergies"
  | "exam"
  | "tests"
  | "treatment"
  | "alerts"
  | "assessment";

export type ReferralCompletenessItem = {
  id: string;
  label: string;
  complete: boolean;
  detail: string;
};

export type ClinicalReferralResult = {
  text: string;
  sections: Record<ReferralSectionKey, string[]>;
  completeness: ReferralCompletenessItem[];
  score: number;
};

const SECTION_KEYS: ReferralSectionKey[] = [
  "patient",
  "complaint",
  "history",
  "background",
  "medications",
  "allergies",
  "exam",
  "tests",
  "treatment",
  "alerts",
  "assessment",
];

const SECTION_ALIASES: Array<{
  key: ReferralSectionKey;
  aliases: string[];
}> = [
  { key: "patient", aliases: ["paciente", "identificacao", "identificação"] },
  { key: "complaint", aliases: ["qp", "queixa", "queixa principal", "motivo"] },
  {
    key: "history",
    aliases: [
      "hda",
      "hma",
      "historia",
      "história",
      "historia clinica",
      "história clínica",
      "historia da doenca atual",
      "história da doença atual",
      "anamnese",
    ],
  },
  {
    key: "background",
    aliases: ["ap", "antecedentes", "comorbidades", "historico", "histórico"],
  },
  {
    key: "medications",
    aliases: ["muc", "medicacoes", "medicações", "medicamentos em uso"],
  },
  { key: "allergies", aliases: ["alergia", "alergias"] },
  {
    key: "exam",
    aliases: ["ef", "exame", "exame fisico", "exame físico", "sinais vitais"],
  },
  {
    key: "tests",
    aliases: ["exames", "exames complementares", "resultados"],
  },
  {
    key: "treatment",
    aliases: [
      "conduta",
      "condutas",
      "tratamento",
      "tratamentos",
      "medidas realizadas",
    ],
  },
  {
    key: "alerts",
    aliases: ["red flags", "sinais de alarme", "sinais de gravidade"],
  },
  {
    key: "assessment",
    aliases: [
      "hd",
      "hipotese",
      "hipótese",
      "impressao",
      "impressão",
      "avaliacao",
      "avaliação",
      "cid",
    ],
  },
];

function normalizeForMatching(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFragment(value: string) {
  return value
    .replace(/^\s*[-–—•▪◦*]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentence(value: string) {
  const clean = cleanFragment(value);
  if (!clean) return "";
  const capitalized = `${clean.charAt(0).toLocaleUpperCase("pt-BR")}${clean.slice(1)}`;
  return /[.!?;:]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function withoutTerminalPunctuation(value: string) {
  return cleanFragment(value).replace(/[.!?;:]+$/, "");
}

function joinFragments(values: string[]) {
  return values.map(sentence).filter(Boolean).join(" ");
}

function emptySections(): Record<ReferralSectionKey, string[]> {
  return SECTION_KEYS.reduce<Record<ReferralSectionKey, string[]>>(
    (sections, key) => {
      sections[key] = [];
      return sections;
    },
    {} as Record<ReferralSectionKey, string[]>
  );
}

function matchSectionLabel(value: string) {
  const normalized = normalizeForMatching(value);
  return SECTION_ALIASES.find(({ aliases }) =>
    aliases.some((alias) => normalizeForMatching(alias) === normalized)
  )?.key;
}

export function parseClinicalReferralSource(sourceText: string) {
  const sections = emptySections();
  let currentSection: ReferralSectionKey = "history";

  for (const rawLine of sourceText.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const inlineHeading = line.match(/^([^:]{1,45}):\s*(.*)$/);
    if (inlineHeading) {
      const matchedSection = matchSectionLabel(inlineHeading[1]);
      if (matchedSection) {
        currentSection = matchedSection;
        const inlineValue = cleanFragment(inlineHeading[2]);
        if (inlineValue) sections[currentSection].push(inlineValue);
        continue;
      }
    }

    const headingOnly = matchSectionLabel(line.replace(/[:\-–—]+$/, ""));
    if (headingOnly) {
      currentSection = headingOnly;
      continue;
    }

    const fragment = cleanFragment(line);
    if (fragment) sections[currentSection].push(fragment);
  }

  return sections;
}

function firstOrFallback(first: string, fallback: string[]) {
  return cleanFragment(first) || cleanFragment(fallback[0] || "");
}

function referralSubject(value: string) {
  const clean = cleanFragment(value);
  if (!clean) return "paciente";
  if (/^paciente\b/i.test(clean)) {
    return clean.replace(/^Paciente\b/, "paciente");
  }
  return /^(sr\.?|sra\.?)\b/i.test(clean) ? clean : `paciente ${clean}`;
}

function detectAny(source: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(source));
}

export function assessClinicalReferralCompleteness(
  input: ClinicalReferralInput,
  sections = parseClinicalReferralSource(input.sourceText)
) {
  const searchable = normalizeForMatching(
    [input.sourceText, input.priorCare, input.functionalImpact, input.clinicalReason]
      .filter(Boolean)
      .join(" ")
  );
  const storyLength = cleanFragment(input.sourceText).length;
  const hasExam =
    sections.exam.length > 0 ||
    detectAny(searchable, [
      /ao exame/,
      /exame fisico/,
      /sinais vitais/,
      /\bpa\b/,
      /\bfc\b/,
      /\bfr\b/,
      /spo2/,
      /saturacao/,
    ]);
  const hasEvolution = detectAny(searchable, [
    /\bha\s+(?:cerca de\s+)?\d/,
    /\bdesde\b/,
    /\binicio\b/,
    /\bevolu/,
    /\bpiora/,
    /\bprogress/,
    /\bpersist/,
  ]);
  const hasPriorCare =
    cleanFragment(input.priorCare).length > 0 || sections.treatment.length > 0;

  const completeness: ReferralCompletenessItem[] = [
    {
      id: "destination",
      label: "Destino definido",
      complete: Boolean(cleanFragment(input.specialty)),
      detail: "Informe a especialidade ou serviço que receberá o caso.",
    },
    {
      id: "story",
      label: "História clínica suficiente",
      complete: storyLength >= 40,
      detail: "Conte o início, a evolução e o estado atual do quadro.",
    },
    {
      id: "evolution",
      label: "Tempo e evolução",
      complete: hasEvolution,
      detail: "Registre há quanto tempo começou e se houve melhora ou piora.",
    },
    {
      id: "exam",
      label: "Exame ou dados objetivos",
      complete: hasExam,
      detail: "Inclua os achados que sustentam a solicitação, quando disponíveis.",
    },
    {
      id: "previous-care",
      label: "Medidas já realizadas",
      complete: hasPriorCare,
      detail: "Mostre tratamentos, exames ou condutas já tentados, quando aplicável.",
    },
    {
      id: "reason",
      label: "Justificativa clínica",
      complete: cleanFragment(input.clinicalReason).length >= 12,
      detail: "Explique por que o caso precisa do serviço de destino.",
    },
    {
      id: "request",
      label: "Pedido explícito",
      complete: cleanFragment(input.request).length >= 5,
      detail: "Diga claramente o que está solicitando ao serviço.",
    },
  ];

  return completeness;
}

export function buildClinicalReferral(
  input: ClinicalReferralInput
): ClinicalReferralResult {
  const sections = parseClinicalReferralSource(input.sourceText);
  const patient = firstOrFallback(input.patient, sections.patient);
  const complaint = firstOrFallback(input.complaint, sections.complaint);
  const specialty = cleanFragment(input.specialty);
  const request = cleanFragment(input.request);

  const opening = [
    `Encaminho ${referralSubject(patient)}`,
    specialty ? `para avaliação pela equipe de ${specialty}` : "para avaliação especializada",
    complaint ? `por ${complaint}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const clinicalStory = [
    ...sections.history,
    ...sections.background,
    ...sections.medications,
    ...sections.allergies,
  ];
  const objectiveData = [
    ...sections.exam,
    ...sections.tests,
    ...sections.alerts,
    ...sections.assessment,
  ];
  const priorCare = [
    ...sections.treatment,
    cleanFragment(input.priorCare),
  ].filter(Boolean);

  const narrativeParts = [
    sentence(opening),
    joinFragments(clinicalStory),
    objectiveData.length
      ? `Na avaliação registrada: ${joinFragments(objectiveData)}`
      : "",
    priorCare.length
      ? `Até o momento: ${joinFragments(priorCare)}`
      : "",
    cleanFragment(input.functionalImpact)
      ? `O quadro repercute da seguinte forma: ${sentence(input.functionalImpact)}`
      : "",
  ].filter(Boolean);

  const fallbackRequest = `avaliação e definição de conduta pela equipe de ${specialty || "referência"}`;
  const requestedAction = withoutTerminalPunctuation(request || fallbackRequest);
  const clinicalReason = withoutTerminalPunctuation(input.clinicalReason);
  const closingParts = [
    clinicalReason
      ? `Considerando ${clinicalReason}, solicito ${requestedAction}.`
      : `Solicito ${requestedAction}.`,
    input.priority ? `Prioridade informada pelo profissional solicitante: ${input.priority}.` : "",
  ].filter(Boolean);

  const completeness = assessClinicalReferralCompleteness(input, sections);
  const completed = completeness.filter((item) => item.complete).length;

  return {
    text: [narrativeParts.join(" "), closingParts.join(" ")]
      .filter(Boolean)
      .join("\n\n")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/\.{2,}/g, ".")
      .trim(),
    sections,
    completeness,
    score: Math.round((completed / completeness.length) * 100),
  };
}
