"use client";

type ClinicalAlertLevel = "high" | "medium" | "info";

type PatientRiskProfile = {
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
};

type TemplateRiskProfile = {
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

export type ClinicalAlertItem = {
  id: string;
  level: ClinicalAlertLevel;
  title: string;
  message: string;
};

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesAny(value: string, terms: string[]) {
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

function pushAlert(
  alerts: ClinicalAlertItem[],
  alert: ClinicalAlertItem
) {
  if (alerts.some((item) => item.id === alert.id)) return;
  alerts.push(alert);
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

  if (includesAny(text, ["epilepsia", "convulsao", "convulsão"])) {
    tags.add("epilepsia");
  }

  if (includesAny(text, ["qt longo", "arritmia", "palpitacao", "palpitação"])) {
    tags.add("arritmia_qt");
  }

  if (includesAny(text, ["gastrite", "ulcera", "úlcera", "sangramento digestivo", "hemorragia digestiva"])) {
    tags.add("gastrite_ulcera");
  }

  if (includesAny(text, ["insuficiencia cardiaca", "insuficiência cardíaca"])) {
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

function buildPatientInteractionTags(medsText?: string | null) {
  const text = normalizeText(medsText);
  const tags = new Set<string>();

  if (
    includesAny(text, [
      "varfarina",
      "marevan",
      "rivaroxabana",
      "apixabana",
      "dabigatrana",
      "edoxabana",
      "heparina",
      "enoxaparina",
      "clopidogrel",
      "aas",
    ])
  ) {
    tags.add("anticoagulante");
  }

  if (
    includesAny(text, [
      "sertralina",
      "fluoxetina",
      "escitalopram",
      "paroxetina",
      "citalopram",
      "fluvoxamina",
    ])
  ) {
    tags.add("isrs");
  }

  if (
    includesAny(text, [
      "clonazepam",
      "diazepam",
      "alprazolam",
      "lorazepam",
      "midazolam",
      "quetiapina",
      "olanzapina",
      "risperidona",
      "haloperidol",
      "tramadol",
      "morfina",
      "codeina",
      "codeína",
      "oxicodona",
      "fentanil",
    ])
  ) {
    tags.add("sedativos");
  }

  if (
    includesAny(text, [
      "losartana",
      "enalapril",
      "captopril",
      "valsartana",
      "espironolactona",
    ])
  ) {
    tags.add("ieca_bra_espironolactona");
  }

  return tags;
}

export function buildClinicalAlerts(
  patient?: PatientRiskProfile | null,
  medicationText?: string | null,
  templateMeta?: TemplateRiskProfile | null
): ClinicalAlertItem[] {
  if (!patient || !medicationText?.trim()) return [];

  const alerts: ClinicalAlertItem[] = [];
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
    includesAny(historyText, ["drc", "doenca renal", "doença renal", "renal", "dialise", "diálise"]);
  const hasLiverRisk =
    Boolean(patient.hepatopatia) ||
    includesAny(historyText, ["cirrose", "hepatopatia", "hepatite", "figado", "fígado"]);
  const isPregnant =
    Boolean(patient.gestante) ||
    includesAny(historyText, ["gestante", "gestacao", "gestação", "gravida", "grávida"]);
  const hasEpilepsy =
    includesAny(historyText, ["epilepsia", "convulsao", "convulsão", "crise convulsiva"]);
  const usesAnticoagulant =
    includesAny(medsInUse, [
      "varfarina",
      "marevan",
      "rivaroxabana",
      "apixabana",
      "dabigatrana",
      "clopidogrel",
      "enoxaparina",
      "heparina",
      "aas",
    ]);
  const usesSsri =
    includesAny(medsInUse, [
      "sertralina",
      "fluoxetina",
      "escitalopram",
      "paroxetina",
      "citalopram",
      "fluvoxamina",
    ]);

  const patientConditionTags = buildPatientConditionTags(patient);
  const patientInteractionTags = buildPatientInteractionTags(patient.medicamentos_em_uso);
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
        "O modelo foi marcado com risco renal e o paciente tem contexto compatível com DRC/função renal alterada.",
    });
  }

  if (hasTag(templateRiskTags, "gestante") && hasTag(patientConditionTags, "gestacao")) {
    pushAlert(alerts, {
      id: "tag-gestante",
      level: "high",
      title: "Risco na gestação",
      message:
        templateMeta?.alerta_gestante ||
        "O modelo foi marcado com alerta para gestação e o paciente está marcado como gestante.",
    });
  }

  if (hasTag(templateRiskTags, "idoso") && hasTag(patientConditionTags, "idoso_fragil")) {
    pushAlert(alerts, {
      id: "tag-idoso",
      level: "medium",
      title: "Cautela em idoso",
      message:
        templateMeta?.alerta_idoso ||
        "O modelo foi marcado com cautela para idoso e o paciente está em faixa/condição de maior risco.",
    });
  }

  if (hasTag(templateRiskTags, "hepatica") && hasTag(patientConditionTags, "hepatopatia")) {
    pushAlert(alerts, {
      id: "tag-hepatica",
      level: "high",
      title: "Cautela hepática",
      message:
        templateMeta?.alerta_hepatopatia ||
        "O modelo foi marcado com cautela hepática e o paciente tem contexto compatível com hepatopatia.",
    });
  }

  if (hasTag(templateInteractionTags, "anticoagulante") && hasTag(patientInteractionTags, "anticoagulante")) {
    pushAlert(alerts, {
      id: "tag-anticoagulante",
      level: "high",
      title: "Interação com anticoagulante",
      message:
        templateMeta?.alerta_interacoes ||
        "O modelo foi marcado com interação relevante para anticoagulantes e o paciente usa medicação compatível.",
    });
  }

  if (hasTag(templateInteractionTags, "isrs") && hasTag(patientInteractionTags, "isrs")) {
    pushAlert(alerts, {
      id: "tag-isrs",
      level: "medium",
      title: "Interação com ISRS",
      message:
        templateMeta?.alerta_interacoes ||
        "O modelo foi marcado com interação relevante para ISRS e o paciente usa medicação compatível.",
    });
  }

  if (hasTag(templateInteractionTags, "sedativos") && hasTag(patientInteractionTags, "sedativos")) {
    pushAlert(alerts, {
      id: "tag-sedativos",
      level: "high",
      title: "Risco de sedação associada",
      message:
        templateMeta?.alerta_interacoes ||
        "O modelo foi marcado com sedação/interação com depressores do SNC e o paciente já usa droga compatível.",
    });
  }

  if (hasTag(templateConditionTags, "gastrite_ulcera") && hasTag(patientConditionTags, "gastrite_ulcera")) {
    pushAlert(alerts, {
      id: "tag-gi",
      level: "high",
      title: "Risco gastrointestinal",
      message:
        templateMeta?.cuidados_especiais ||
        "O modelo foi marcado com cautela gastrointestinal e o paciente tem histórico compatível.",
    });
  }

  if (
    includesAny(text, ["amoxicilina", "penicilina", "ampicilina", "amoxicilina clavulanato", "amoxicilina-clavulanato", "benzetacil", "ceftriaxona", "cefalexina"]) &&
    includesAny(allergiesText, ["penicilina", "amoxicilina", "beta lactam", "betalactam", "cefalosporina"])
  ) {
    pushAlert(alerts, {
      id: "beta-lactam-allergy",
      level: "high",
      title: "Alergia compatível com betalactâmico",
      message:
        templateMeta?.alerta_alergias ||
        "A prescrição contém penicilina/cefalosporina e o paciente tem histórico sugestivo de alergia relacionada.",
    });
  }

  if (includesAny(text, ["aine", "ibuprofeno", "diclofenaco", "cetoprofeno", "naproxeno", "nimesulida", "meloxicam", "celecoxibe", "etoricoxibe"])) {
    if (hasRenalRisk) {
      pushAlert(alerts, {
        id: "aine-renal",
        level: "high",
        title: "AINE em paciente com risco renal",
        message:
          templateMeta?.alerta_drc ||
          "AINE pode agravar função renal. Rever necessidade, dose e hidratação.",
      });
    }

    if (usesAnticoagulant) {
      pushAlert(alerts, {
        id: "aine-anticoagulant",
        level: "high",
        title: "AINE com anticoagulante/antiagregante",
        message:
          templateMeta?.alerta_interacoes ||
          "Há aumento de risco de sangramento com essa combinação.",
      });
    }

    if (usesSsri) {
      pushAlert(alerts, {
        id: "aine-ssri",
        level: "medium",
        title: "AINE com ISRS",
        message:
          templateMeta?.alerta_interacoes ||
          "Pode aumentar risco de sangramento gastrointestinal.",
      });
    }

    if (isElderly) {
      pushAlert(alerts, {
        id: "aine-elderly",
        level: "medium",
        title: "AINE em idoso",
        message:
          templateMeta?.alerta_idoso ||
          "Usar com cautela em idoso pelo risco renal, gastrointestinal e cardiovascular.",
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
        "A eficácia e a segurança podem ficar comprometidas em insuficiência renal.",
    });
  }

  if (includesAny(text, ["ciprofloxacino", "levofloxacino", "moxifloxacino", "ofloxacino", "norfloxacino", "quinolona", "fluoroquinolona"])) {
    if (isPregnant) {
      pushAlert(alerts, {
        id: "quinolona-pregnancy",
        level: "high",
        title: "Quinolona em gestante",
        message:
          templateMeta?.alerta_gestante ||
          "Evitar em gestação salvo avaliação clínica específica.",
      });
    }

    if (isElderly) {
      pushAlert(alerts, {
        id: "quinolona-elderly",
        level: "medium",
        title: "Quinolona em idoso",
        message:
          templateMeta?.alerta_idoso ||
          "Maior cautela por eventos adversos, alterações neurológicas e tendíneas.",
      });
    }
  }

  if (includesAny(text, ["doxiciclina", "tetraciclina", "minociclina"]) && isPregnant) {
    pushAlert(alerts, {
      id: "tetracycline-pregnancy",
      level: "high",
      title: "Tetraciclina em gestante",
      message:
        templateMeta?.alerta_gestante ||
        "Evitar em gestação, salvo exceção clínica muito bem indicada.",
    });
  }

  if (includesAny(text, ["tramadol", "bupropiona"]) && hasEpilepsy) {
    pushAlert(alerts, {
      id: "seizure-risk",
      level: "high",
      title: "Risco convulsivo",
      message:
        templateMeta?.cuidados_especiais ||
        "Tramadol ou bupropiona em paciente com epilepsia/convulsão exigem revisão clínica.",
    });
  }

  if (includesAny(text, ["tramadol", "codeina", "codeína", "morfina", "oxicodona", "fentanil"]) && isElderly) {
    pushAlert(alerts, {
      id: "opioid-elderly",
      level: "medium",
      title: "Opioide em idoso",
      message:
        templateMeta?.alerta_idoso ||
        "Maior cautela por sedação, queda, delirium e constipação.",
    });
  }

  if (includesAny(text, ["metformina"]) && hasRenalRisk) {
    pushAlert(alerts, {
      id: "metformin-renal",
      level: "high",
      title: "Metformina em paciente com risco renal",
      message:
        templateMeta?.alerta_drc ||
        "Rever função renal e adequação do uso.",
    });
  }

  if (includesAny(text, ["paracetamol", "acetaminofeno", "valproato", "acido valproico", "ácido valpróico", "isoniazida", "fluconazol", "metronidazol"]) && hasLiverRisk) {
    pushAlert(alerts, {
      id: "hepatic-risk",
      level: "high",
      title: "Medicamento com cautela hepática",
      message:
        templateMeta?.alerta_hepatopatia ||
        "A prescrição contém fármaco com potencial de impacto hepático em paciente com hepatopatia.",
    });
  }

  if (includesAny(text, ["isotretinoina", "isotretinoína"]) && isPregnant) {
    pushAlert(alerts, {
      id: "teratogenic-risk",
      level: "high",
      title: "Medicamento teratogênico em gestante",
      message:
        templateMeta?.alerta_gestante ||
        "A prescrição contém fármaco com contraindicação forte em gestação.",
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

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
          Alertas clínicos
        </span>

        <p className="text-sm text-slate-500">
          Checagem automática baseada no perfil do paciente, tags do modelo e texto atual da prescrição.
        </p>
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