"use client";

export type ClinicalAlertLevel = "high" | "medium" | "info";

export type PatientRiskProfile = {
  id?: string;
  nome?: string | null;
  idade?: number | null;
  alergias?: string | null;
  comorbidades?: string | null;
  medicamentos_em_uso?: string | null;
  hpp?: string | null;
  gestante?: boolean | null;
  funcao_renal_alterada?: boolean | null;
  hepatopatia?: boolean | null;
  idoso_fragil?: boolean | null;
  diabetes?: boolean | null;
  epilepsia?: boolean | null;
  asma?: boolean | null;
  gastrite_ulcera?: boolean | null;
  insuficiencia_cardiaca?: boolean | null;
  arritmia_qt_longo?: boolean | null;
  uso_anticoagulante?: boolean | null;
  uso_isrs?: boolean | null;
  uso_sedativos?: boolean | null;
};

export type TemplateRiskProfile = {
  titulo?: string | null;
  contraindicacoes?: string | null;
  cuidados_especiais?: string | null;
  alerta_gestante?: string | null;
  alerta_idoso?: string | null;
  alerta_drc?: string | null;
  alerta_hepatopatia?: string | null;
  alerta_alergias?: string | null;
  alerta_interacoes?: string | null;
  tags_risco?: string | null;
  risk_tags?: string | null;
  condition_tags?: string | null;
  interaction_tags?: string | null;
};

type ClinicalAlertsProps = {
  patient?: PatientRiskProfile | null;
  medicationText?: string | null;
  templateMeta?: TemplateRiskProfile | null;
  className?: string;
};

export type ClinicalAlert = {
  id: string;
  level: ClinicalAlertLevel;
  title: string;
  message: string;
};

const BETA_LACTAMS = [
  "amoxicilina",
  "amoxicilina clavulanato",
  "amoxicilina-clavulanato",
  "ampicilina",
  "penicilina",
  "benzetacil",
  "ceftriaxona",
  "cefalexina",
  "cefadroxil",
  "cefuroxima",
];

const DYPIRONE = ["dipirona", "metamizol", "novalgina"];
const SULFAS = [
  "sulfametoxazol trimetoprim",
  "sulfametoxazol-trimetoprim",
  "trimetoprim sulfametoxazol",
  "bactrim",
  "sulfatrim",
];
const AINES = [
  "aine",
  "ibuprofeno",
  "diclofenaco",
  "cetoprofeno",
  "naproxeno",
  "nimesulida",
  "meloxicam",
  "celecoxibe",
  "etoricoxibe",
  "indometacina",
  "piroxicam",
];
const QUINOLONES = [
  "ciprofloxacino",
  "levofloxacino",
  "moxifloxacino",
  "ofloxacino",
  "norfloxacino",
  "quinolona",
  "fluoroquinolona",
];
const TETRACYCLINES = ["doxiciclina", "tetraciclina", "minociclina"];
const MACROLIDES = ["azitromicina", "claritromicina", "eritromicina"];
const AMINOGLYCOSIDES = ["gentamicina", "amicacina", "tobramicina"];
const OPIOIDS = ["tramadol", "codeina", "codeína", "morfina", "oxicodona", "fentanil"];
const BENZOS = ["clonazepam", "diazepam", "alprazolam", "lorazepam", "midazolam"];
const ANTIPSYCHOTICS = ["quetiapina", "risperidona", "haloperidol", "olanzapina"];
const HEPATIC_RISK_DRUGS = [
  "paracetamol",
  "acetaminofeno",
  "valproato",
  "acido valproico",
  "ácido valpróico",
  "isoniazida",
  "fluconazol",
  "metronidazol",
];
const ANTICOAGULANTS = [
  "varfarina",
  "marevan",
  "rivaroxabana",
  "apixabana",
  "dabigatrana",
  "edoxabana",
  "clopidogrel",
  "heparina",
  "enoxaparina",
  "aas",
];
const ISRS = [
  "sertralina",
  "fluoxetina",
  "escitalopram",
  "paroxetina",
  "citalopram",
  "fluvoxamina",
];
const HYPERKALEMIA_MEDS = ["losartana", "enalapril", "captopril", "valsartana", "espironolactona"];

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesAny(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(normalizeText(term)));
}

function parseTags(value?: string | null) {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => normalizeText(item))
      .filter(Boolean)
  );
}

function hasTag(tags: Set<string>, tag: string) {
  return tags.has(normalizeText(tag));
}

function pushAlert(alerts: ClinicalAlert[], alert: ClinicalAlert) {
  if (alerts.some((item) => item.id === alert.id)) return;
  alerts.push(alert);
}

function withReason(base: string, reason: string) {
  return `${base} Motivo: ${reason}`;
}

function buildPatientConditionTags(patient?: PatientRiskProfile | null) {
  const tags = new Set<string>();

  if (!patient) return tags;

  const text = normalizeText(
    [
      patient.comorbidades,
      patient.hpp,
      patient.alergias,
      patient.medicamentos_em_uso,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (patient.gestante) tags.add("gestacao");
  if (patient.funcao_renal_alterada) tags.add("drc");
  if (patient.hepatopatia) tags.add("hepatopatia");
  if (patient.idoso_fragil || (patient.idade ?? 0) >= 60) tags.add("idoso_fragil");
  if (patient.epilepsia) tags.add("epilepsia");
  if (patient.arritmia_qt_longo) tags.add("arritmia_qt");
  if (patient.gastrite_ulcera) tags.add("gastrite_ulcera");
  if (patient.insuficiencia_cardiaca) tags.add("insuficiencia_cardiaca");
  if (patient.asma) tags.add("asma");
  if (patient.diabetes) tags.add("diabetes");

  if (includesAny(text, ["epilepsia", "convulsao", "convulsão", "crise convulsiva"])) {
    tags.add("epilepsia");
  }

  if (includesAny(text, ["qt longo", "arritmia", "palpitacao", "palpitação", "torsades"])) {
    tags.add("arritmia_qt");
  }

  if (includesAny(text, ["gastrite", "ulcera", "úlcera", "sangramento digestivo", "hemorragia digestiva", "melena"])) {
    tags.add("gastrite_ulcera");
  }

  if (includesAny(text, ["insuficiencia cardiaca", "insuficiência cardíaca", "icc", "ic"])) {
    tags.add("insuficiencia_cardiaca");
  }

  if (includesAny(text, ["asma", "broncoespasmo"])) {
    tags.add("asma");
  }

  if (includesAny(text, ["diabetes", "dm1", "dm2"])) {
    tags.add("diabetes");
  }

  if (includesAny(text, ["sulfa", "sulfonamida"])) {
    tags.add("alergia_sulfa");
  }

  if (includesAny(text, ["penicilina", "amoxicilina", "betalactamico", "beta lactamico", "cefalosporina"])) {
    tags.add("alergia_beta_lactamico");
  }

  return tags;
}

function buildPatientInteractionTags(
  medsText?: string | null,
  patient?: PatientRiskProfile | null
) {
  const text = normalizeText(medsText);
  const tags = new Set<string>();

  if (patient?.uso_anticoagulante) tags.add("anticoagulante");
  if (patient?.uso_isrs) tags.add("isrs");
  if (patient?.uso_sedativos) tags.add("sedativos");

  if (includesAny(text, ANTICOAGULANTS)) tags.add("anticoagulante");
  if (includesAny(text, ISRS)) tags.add("isrs");

  if (includesAny(text, [...BENZOS, ...ANTIPSYCHOTICS, ...OPIOIDS])) {
    tags.add("sedativos");
  }

  if (includesAny(text, HYPERKALEMIA_MEDS)) {
    tags.add("ieca_bra_espironolactona");
  }

  return tags;
}

export function buildClinicalAlerts(
  patient?: PatientRiskProfile | null,
  medicationText?: string | null,
  templateMeta?: TemplateRiskProfile | null
): ClinicalAlert[] {
  if (!patient || !medicationText?.trim()) return [];

  const alerts: ClinicalAlert[] = [];
  const prescriptionText = normalizeText(medicationText);
  const templateText = normalizeText(
    [
      templateMeta?.titulo,
      templateMeta?.contraindicacoes,
      templateMeta?.cuidados_especiais,
      templateMeta?.alerta_gestante,
      templateMeta?.alerta_idoso,
      templateMeta?.alerta_drc,
      templateMeta?.alerta_hepatopatia,
      templateMeta?.alerta_alergias,
      templateMeta?.alerta_interacoes,
      templateMeta?.tags_risco,
      templateMeta?.risk_tags,
      templateMeta?.condition_tags,
      templateMeta?.interaction_tags,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const text = `${prescriptionText} ${templateText}`.trim();
  const allergiesText = normalizeText(patient.alergias);
  const historyText = normalizeText(
    [
      patient.comorbidades,
      patient.hpp,
      patient.medicamentos_em_uso,
      patient.alergias,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const medsInUse = normalizeText(patient.medicamentos_em_uso);

  const age = typeof patient.idade === "number" ? patient.idade : 0;
  const isElderly = age >= 60 || Boolean(patient.idoso_fragil);
  const hasRenalRisk =
    Boolean(patient.funcao_renal_alterada) ||
    includesAny(historyText, [
      "drc",
      "doenca renal",
      "doença renal",
      "insuficiencia renal",
      "insuficiência renal",
      "renal",
      "dialise",
      "diálise",
      "creatinina elevada",
    ]);
  const hasLiverRisk =
    Boolean(patient.hepatopatia) ||
    includesAny(historyText, [
      "cirrose",
      "hepatopatia",
      "hepatite",
      "figado",
      "fígado",
      "insuficiencia hepatica",
      "insuficiência hepática",
    ]);
  const isPregnant =
    Boolean(patient.gestante) ||
    includesAny(historyText, ["gestante", "gestacao", "gestação", "gravida", "grávida"]);
  const hasEpilepsy = Boolean(patient.epilepsia) || includesAny(historyText, [
    "epilepsia",
    "convulsao",
    "convulsão",
    "crise convulsiva",
  ]);
  const hasQtRisk = Boolean(patient.arritmia_qt_longo) || includesAny(historyText, [
    "qt longo",
    "arritmia",
    "palpitacao",
    "palpitação",
    "torsades",
  ]);
  const hasGiRisk = Boolean(patient.gastrite_ulcera) || includesAny(historyText, [
    "gastrite",
    "ulcera",
    "úlcera",
    "sangramento digestivo",
    "hemorragia digestiva",
    "melena",
  ]);
  const hasHeartFailure = Boolean(patient.insuficiencia_cardiaca) || includesAny(historyText, [
    "insuficiencia cardiaca",
    "insuficiência cardíaca",
    "icc",
    "ic",
  ]);
  const hasAsthma = Boolean(patient.asma) || includesAny(historyText, ["asma", "broncoespasmo"]);
  const hasDiabetes = Boolean(patient.diabetes) || includesAny(historyText, ["diabetes", "dm1", "dm2"]);
  const usesAnticoagulant = Boolean(patient.uso_anticoagulante) || includesAny(medsInUse, ANTICOAGULANTS);
  const usesSsri = Boolean(patient.uso_isrs) || includesAny(medsInUse, ISRS);
  const usesSedatives = Boolean(patient.uso_sedativos) || includesAny(medsInUse, [...BENZOS, ...ANTIPSYCHOTICS, ...OPIOIDS]);
  const usesHyperkalemiaRiskMeds = includesAny(medsInUse, HYPERKALEMIA_MEDS);

  const patientConditionTags = buildPatientConditionTags(patient);
  const patientInteractionTags = buildPatientInteractionTags(patient.medicamentos_em_uso, patient);
  const templateRiskTags = parseTags(
    [templateMeta?.risk_tags, templateMeta?.tags_risco].filter(Boolean).join(",")
  );
  const templateConditionTags = parseTags(templateMeta?.condition_tags);
  const templateInteractionTags = parseTags(templateMeta?.interaction_tags);

  if (hasTag(templateRiskTags, "renal") && hasTag(patientConditionTags, "drc")) {
    pushAlert(alerts, {
      id: "tag-renal",
      level: "high",
      title: "Risco renal",
      message:
        templateMeta?.alerta_drc ||
        withReason(
          "O modelo foi marcado com risco renal.",
          "paciente com DRC/função renal alterada."
        ),
    });
  }

  if (hasTag(templateRiskTags, "gestante") && hasTag(patientConditionTags, "gestacao")) {
    pushAlert(alerts, {
      id: "tag-gestante",
      level: "high",
      title: "Risco na gestação",
      message:
        templateMeta?.alerta_gestante ||
        withReason(
          "O modelo foi marcado com alerta para gestação.",
          "paciente marcada como gestante."
        ),
    });
  }

  if (hasTag(templateRiskTags, "idoso") && hasTag(patientConditionTags, "idoso_fragil")) {
    pushAlert(alerts, {
      id: "tag-idoso",
      level: "medium",
      title: "Cautela em idoso",
      message:
        templateMeta?.alerta_idoso ||
        withReason(
          "O modelo foi marcado com cautela para idoso.",
          "faixa etária/fragilidade do paciente."
        ),
    });
  }

  if (hasTag(templateRiskTags, "hepatica") && hasTag(patientConditionTags, "hepatopatia")) {
    pushAlert(alerts, {
      id: "tag-hepatica",
      level: "high",
      title: "Cautela hepática",
      message:
        templateMeta?.alerta_hepatopatia ||
        withReason(
          "O modelo foi marcado com cautela hepática.",
          "paciente com hepatopatia."
        ),
    });
  }

  if (hasTag(templateInteractionTags, "anticoagulante") && hasTag(patientInteractionTags, "anticoagulante")) {
    pushAlert(alerts, {
      id: "tag-anticoagulante",
      level: "high",
      title: "Interação com anticoagulante",
      message:
        templateMeta?.alerta_interacoes ||
        withReason(
          "O modelo foi marcado com interação relevante para anticoagulantes.",
          "paciente usa anticoagulante/antiagregante."
        ),
    });
  }

  if (hasTag(templateInteractionTags, "isrs") && hasTag(patientInteractionTags, "isrs")) {
    pushAlert(alerts, {
      id: "tag-isrs",
      level: "medium",
      title: "Interação com ISRS",
      message:
        templateMeta?.alerta_interacoes ||
        withReason(
          "O modelo foi marcado com interação relevante para ISRS.",
          "paciente usa medicamento compatível."
        ),
    });
  }

  if (hasTag(templateInteractionTags, "sedativos") && hasTag(patientInteractionTags, "sedativos")) {
    pushAlert(alerts, {
      id: "tag-sedativos",
      level: "high",
      title: "Risco de sedação associada",
      message:
        templateMeta?.alerta_interacoes ||
        withReason(
          "O modelo foi marcado com sedação/interação com depressores do SNC.",
          "paciente já usa medicação sedativa."
        ),
    });
  }

  if (hasTag(templateConditionTags, "gastrite_ulcera") && hasTag(patientConditionTags, "gastrite_ulcera")) {
    pushAlert(alerts, {
      id: "tag-gi",
      level: "high",
      title: "Risco gastrointestinal",
      message:
        templateMeta?.cuidados_especiais ||
        withReason(
          "O modelo foi marcado com cautela gastrointestinal.",
          "paciente tem histórico compatível."
        ),
    });
  }

  if (includesAny(text, BETA_LACTAMS) && includesAny(allergiesText, ["penicilina", "amoxicilina", "beta lactam", "betalactam", "cefalosporina"])) {
    pushAlert(alerts, {
      id: "beta-lactam-allergy",
      level: "high",
      title: "Alergia compatível com betalactâmico",
      message:
        templateMeta?.alerta_alergias ||
        withReason(
          "A prescrição contém penicilina/cefalosporina.",
          "histórico de alergia compatível no paciente."
        ),
    });
  }

  if (includesAny(text, DYPIRONE) && includesAny(allergiesText, ["dipirona", "metamizol", "novalgina", "pirazolona", "pirazolonico", "pirazolônico"])) {
    pushAlert(alerts, {
      id: "dipyrone-allergy",
      level: "high",
      title: "Alergia compatível com dipirona",
      message:
        templateMeta?.alerta_alergias ||
        withReason(
          "A prescrição contém dipirona/metamizol.",
          "histórico de alergia compatível no paciente."
        ),
    });
  }

  if (includesAny(text, SULFAS) && includesAny(allergiesText, ["sulfa", "sulfonamida", "bactrim", "sulfametoxazol"])) {
    pushAlert(alerts, {
      id: "sulfa-allergy",
      level: "high",
      title: "Alergia compatível com sulfa",
      message:
        templateMeta?.alerta_alergias ||
        withReason(
          "A prescrição contém sulfametoxazol-trimetoprim.",
          "histórico de alergia compatível no paciente."
        ),
    });
  }

  if (includesAny(text, AINES)) {
    if (hasRenalRisk) {
      pushAlert(alerts, {
        id: "aine-renal",
        level: "high",
        title: "AINE em paciente com risco renal",
        message:
          templateMeta?.alerta_drc ||
          withReason(
            "AINE pode agravar função renal.",
            "paciente com DRC/função renal alterada."
          ),
      });
    }

    if (usesAnticoagulant) {
      pushAlert(alerts, {
        id: "aine-anticoagulant",
        level: "high",
        title: "AINE com anticoagulante/antiagregante",
        message:
          templateMeta?.alerta_interacoes ||
          withReason(
            "Há aumento de risco de sangramento.",
            "AINE associado a anticoagulante/antiagregante em uso."
          ),
      });
    }

    if (usesSsri) {
      pushAlert(alerts, {
        id: "aine-ssri",
        level: "medium",
        title: "AINE com ISRS",
        message:
          templateMeta?.alerta_interacoes ||
          withReason(
            "Pode aumentar risco de sangramento gastrointestinal.",
            "paciente usa ISRS."
          ),
      });
    }

    if (isElderly) {
      pushAlert(alerts, {
        id: "aine-elderly",
        level: "medium",
        title: "AINE em idoso",
        message:
          templateMeta?.alerta_idoso ||
          withReason(
            "Usar com cautela em idoso.",
            "maior risco renal, gastrointestinal e cardiovascular."
          ),
      });
    }

    if (hasGiRisk) {
      pushAlert(alerts, {
        id: "aine-gi",
        level: "high",
        title: "AINE com risco gastrointestinal",
        message:
          templateMeta?.cuidados_especiais ||
          withReason(
            "Rever risco-benefício e proteção gástrica.",
            "história de gastrite/úlcera/sangramento digestivo."
          ),
      });
    }

    if (hasHeartFailure) {
      pushAlert(alerts, {
        id: "aine-hf",
        level: "medium",
        title: "AINE em insuficiência cardíaca",
        message: withReason(
          "AINE pode piorar retenção hídrica e descompensação.",
          "paciente com insuficiência cardíaca."
        ),
      });
    }

    if (hasAsthma) {
      pushAlert(alerts, {
        id: "aine-asthma",
        level: "medium",
        title: "AINE em paciente com asma",
        message: withReason(
          "Alguns pacientes apresentam broncoespasmo associado a AINE.",
          "histórico de asma/broncoespasmo."
        ),
      });
    }
  }

  if (includesAny(text, ["nitrofurantoina", "nitrofurantoína"]) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "nitro-renal",
      level: "high",
      title: "Nitrofurantoína com função renal alterada",
      message:
        templateMeta?.alerta_drc ||
        withReason(
          "A eficácia e a segurança podem ficar comprometidas.",
          "paciente com insuficiência renal/DRC."
        ),
    });
  }

  if (includesAny(text, QUINOLONES)) {
    if (isPregnant) {
      pushAlert(alerts, {
        id: "quinolona-pregnancy",
        level: "high",
        title: "Quinolona em gestante",
        message:
          templateMeta?.alerta_gestante ||
          withReason(
            "Evitar em gestação salvo avaliação clínica específica.",
            "paciente marcada como gestante."
          ),
      });
    }

    if (isElderly) {
      pushAlert(alerts, {
        id: "quinolona-elderly",
        level: "medium",
        title: "Quinolona em idoso",
        message:
          templateMeta?.alerta_idoso ||
          withReason(
            "Maior cautela por eventos adversos neurológicos e tendíneos.",
            "faixa etária/fragilidade do paciente."
          ),
      });
    }

    if (hasEpilepsy) {
      pushAlert(alerts, {
        id: "quinolona-seizure",
        level: "medium",
        title: "Quinolona em paciente com risco convulsivo",
        message: withReason(
          "Pode reduzir limiar convulsivo em alguns contextos.",
          "paciente com epilepsia/convulsão."
        ),
      });
    }

    if (hasQtRisk) {
      pushAlert(alerts, {
        id: "quinolona-qt",
        level: "high",
        title: "Quinolona com risco de QT",
        message: withReason(
          "Rever risco-benefício e contexto cardiológico.",
          "paciente com arritmia/QT longo."
        ),
      });
    }
  }

  if (includesAny(text, TETRACYCLINES) && isPregnant) {
    pushAlert(alerts, {
      id: "tetracycline-pregnancy",
      level: "high",
      title: "Tetraciclina em gestante",
      message:
        templateMeta?.alerta_gestante ||
        withReason(
          "Evitar em gestação salvo exceção clínica muito bem indicada.",
          "paciente marcada como gestante."
        ),
    });
  }

  if (includesAny(text, MACROLIDES)) {
    if (hasQtRisk) {
      pushAlert(alerts, {
        id: "macrolide-qt",
        level: "high",
        title: "Macrolídeo com risco de QT",
        message: withReason(
          "Macrolídeos exigem mais cautela em contexto arrítmico.",
          "paciente com arritmia/QT longo."
        ),
      });
    }

    if (usesAnticoagulant) {
      pushAlert(alerts, {
        id: "macrolide-anticoagulant",
        level: "medium",
        title: "Macrolídeo com anticoagulante",
        message:
          templateMeta?.alerta_interacoes ||
          withReason(
            "Rever interação e monitorização clínica.",
            "paciente usa anticoagulante/antiagregante."
          ),
      });
    }
  }

  if (includesAny(text, AMINOGLYCOSIDES) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "aminoglycoside-renal",
      level: "high",
      title: "Aminoglicosídeo em paciente com risco renal",
      message: withReason(
        "Gentamicina/amicacina elevam cautela por nefrotoxicidade.",
        "paciente com DRC/função renal alterada."
      ),
    });
  }

  if (includesAny(text, ["tramadol", "bupropiona"]) && hasEpilepsy) {
    pushAlert(alerts, {
      id: "seizure-risk",
      level: "high",
      title: "Risco convulsivo",
      message:
        templateMeta?.cuidados_especiais ||
        withReason(
          "Tramadol ou bupropiona exigem revisão clínica.",
          "paciente com epilepsia/convulsão."
        ),
    });
  }

  if (includesAny(text, OPIOIDS) && isElderly) {
    pushAlert(alerts, {
      id: "opioid-elderly",
      level: "medium",
      title: "Opioide em idoso",
      message:
        templateMeta?.alerta_idoso ||
        withReason(
          "Maior cautela por sedação, queda, delirium e constipação.",
          "faixa etária/fragilidade do paciente."
        ),
    });
  }

  if (includesAny(text, OPIOIDS) && usesSedatives) {
    pushAlert(alerts, {
      id: "opioid-sedative",
      level: "high",
      title: "Opioide com outras drogas sedativas",
      message:
        templateMeta?.alerta_interacoes ||
        withReason(
          "Associação aumenta risco de sedação excessiva e depressão do SNC.",
          "paciente já usa droga sedativa."
        ),
    });
  }

  if (includesAny(text, BENZOS) && isElderly) {
    pushAlert(alerts, {
      id: "benzo-elderly",
      level: "medium",
      title: "Benzodiazepínico em idoso",
      message: withReason(
        "Maior cautela por confusão, queda e sedação.",
        "faixa etária/fragilidade do paciente."
      ),
    });
  }

  if (includesAny(text, BENZOS) && includesAny(text, OPIOIDS)) {
    pushAlert(alerts, {
      id: "benzo-opioid",
      level: "high",
      title: "Benzodiazepínico com opioide",
      message: withReason(
        "Associação aumenta risco de sedação importante e depressão respiratória.",
        "dois grupos sedativos na mesma prescrição."
      ),
    });
  }

  if (includesAny(text, ["metformina"]) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "metformin-renal",
      level: "high",
      title: "Metformina em paciente com risco renal",
      message:
        templateMeta?.alerta_drc ||
        withReason(
          "Rever função renal e adequação do uso.",
          "paciente com DRC/função renal alterada."
        ),
    });
  }

  if (includesAny(text, HEPATIC_RISK_DRUGS) && hasLiverRisk) {
    pushAlert(alerts, {
      id: "hepatic-risk",
      level: "high",
      title: "Medicamento com cautela hepática",
      message:
        templateMeta?.alerta_hepatopatia ||
        withReason(
          "Há potencial de impacto hepático relevante.",
          "paciente com hepatopatia."
        ),
    });
  }

  if (includesAny(text, ["fluconazol", "metronidazol"]) && usesAnticoagulant) {
    pushAlert(alerts, {
      id: "azole-metronidazole-anticoagulant",
      level: "high",
      title: "Interação com anticoagulante",
      message:
        templateMeta?.alerta_interacoes ||
        withReason(
          "Fluconazol/metronidazol podem aumentar risco de sangramento em algumas combinações.",
          "paciente usa anticoagulante/antiagregante."
        ),
    });
  }

  if (includesAny(text, SULFAS) && usesAnticoagulant) {
    pushAlert(alerts, {
      id: "sulfa-anticoagulant",
      level: "high",
      title: "Sulfa com anticoagulante",
      message: withReason(
        "Pode elevar risco de sangramento.",
        "paciente usa anticoagulante/antiagregante."
      ),
    });
  }

  if (includesAny(text, SULFAS) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "sulfa-renal",
      level: "medium",
      title: "Sulfa em paciente com risco renal",
      message: withReason(
        "Pode exigir ajuste e monitorização conforme contexto clínico.",
        "paciente com DRC/função renal alterada."
      ),
    });
  }

  if (includesAny(text, SULFAS) && usesHyperkalemiaRiskMeds) {
    pushAlert(alerts, {
      id: "sulfa-hyperkalemia",
      level: "high",
      title: "Risco de hipercalemia",
      message: withReason(
        "Sulfametoxazol-trimetoprim exige cautela com potássio.",
        "paciente usa IECA/BRA/espironolactona."
      ),
    });
  }

  if (includesAny(text, ["espironolactona"]) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "spironolactone-renal",
      level: "high",
      title: "Espironolactona em paciente com risco renal",
      message: withReason(
        "Monitorar potássio e função renal.",
        "paciente com DRC/função renal alterada."
      ),
    });
  }

  if (includesAny(text, ["glibenclamida", "gliclazida"]) && isElderly) {
    pushAlert(alerts, {
      id: "sulfonylurea-elderly",
      level: "medium",
      title: "Sulfonilureia em idoso",
      message: withReason(
        "Maior cautela por hipoglicemia.",
        "faixa etária/fragilidade do paciente."
      ),
    });
  }

  if (includesAny(text, ["prednisona", "prednisolona", "dexametasona", "metilprednisolona", "hidrocortisona"]) && hasDiabetes) {
    pushAlert(alerts, {
      id: "corticoid-diabetes",
      level: "medium",
      title: "Corticoide em paciente com diabetes",
      message: withReason(
        "Pode descompensar glicemia.",
        "paciente com diabetes."
      ),
    });
  }

  if (includesAny(text, ["aspirina", "acido acetilsalicilico", "ácido acetilsalicílico", "aas"])) {
    if (usesAnticoagulant) {
      pushAlert(alerts, {
        id: "aas-anticoagulant",
        level: "high",
        title: "AAS com anticoagulante/antiagregante",
        message: withReason(
          "Risco aumentado de sangramento.",
          "paciente usa anticoagulante/antiagregante."
        ),
      });
    }

    if (hasGiRisk) {
      pushAlert(alerts, {
        id: "aas-gi",
        level: "high",
        title: "AAS em paciente com risco gastrointestinal",
        message: withReason(
          "Rever risco-benefício e proteção gástrica.",
          "história de gastrite/úlcera/sangramento digestivo."
        ),
      });
    }
  }

  if (includesAny(text, ["isotretinoina", "isotretinoína"]) && isPregnant) {
    pushAlert(alerts, {
      id: "teratogenic-risk",
      level: "high",
      title: "Medicamento teratogênico em gestante",
      message:
        templateMeta?.alerta_gestante ||
        withReason(
          "A prescrição contém fármaco com contraindicação forte em gestação.",
          "paciente marcada como gestante."
        ),
    });
  }

  if (templateMeta?.contraindicacoes?.trim()) {
    pushAlert(alerts, {
      id: "structured-contraindications",
      level: "info",
      title: "Contraindicações do modelo",
      message: templateMeta.contraindicacoes,
    });
  }

  if (templateMeta?.cuidados_especiais?.trim()) {
    pushAlert(alerts, {
      id: "structured-care",
      level: "info",
      title: "Cuidados especiais do modelo",
      message: templateMeta.cuidados_especiais,
    });
  }

  return alerts;
}

function levelClasses(level: ClinicalAlertLevel) {
  if (level === "high") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (level === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-blue-200 bg-blue-50 text-blue-900";
}

function levelLabel(level: ClinicalAlertLevel) {
  if (level === "high") return "alto risco";
  if (level === "medium") return "cautela";
  return "lembrete";
}

export default function ClinicalAlerts({
  patient,
  medicationText,
  templateMeta,
  className = "",
}: ClinicalAlertsProps) {
  const alerts = buildClinicalAlerts(patient, medicationText, templateMeta);

  if (!patient || alerts.length === 0) return null;

  const highCount = alerts.filter((item) => item.level === "high").length;
  const mediumCount = alerts.filter((item) => item.level === "medium").length;
  const infoCount = alerts.filter((item) => item.level === "info").length;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
          Alertas clínicos
        </span>

        <p className="text-sm text-slate-500">
          Checagem automática baseada no perfil do paciente, tags do modelo e regras críticas mais confiáveis.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {highCount ? (
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
            {highCount} alto risco
          </span>
        ) : null}

        {mediumCount ? (
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
            {mediumCount} cautela
          </span>
        ) : null}

        {infoCount ? (
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            {infoCount} lembrete
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border px-4 py-3 ${levelClasses(alert.level)}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{alert.title}</p>
              <span className="rounded-full border border-current/20 bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                {levelLabel(alert.level)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{alert.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

