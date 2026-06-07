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

type ClinicalAlertsProps = {
  patient?: PatientRiskProfile | null;
  medicationText?: string | null;
  className?: string;
};

type ClinicalAlert = {
  id: string;
  level: ClinicalAlertLevel;
  title: string;
  message: string;
};

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function buildAlerts(
  patient?: PatientRiskProfile | null,
  medicationText?: string | null
): ClinicalAlert[] {
  if (!patient || !medicationText?.trim()) return [];

  const alerts: ClinicalAlert[] = [];
  const text = normalizeText(medicationText);
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
  const isPregnant = Boolean(patient.gestante) || includesAny(historyText, ["gestante", "gravida", "grávida", "gestacao", "gestação"]);

  const usesAnticoagulant = includesAny(medsInUse, [
    "varfarina",
    "marevan",
    "rivaroxabana",
    "apixabana",
    "dabigatrana",
    "edoxabana",
    "clopidogrel",
    "heparina",
    "enoxaparina",
  ]);

  const usesSsri = includesAny(medsInUse, [
    "sertralina",
    "fluoxetina",
    "escitalopram",
    "paroxetina",
    "citalopram",
    "fluvoxamina",
  ]);

  const hasEpilepsy = includesAny(historyText, [
    "epilepsia",
    "convuls",
    "crise epileptica",
    "crise epiletica",
  ]);

  const isPenicillin = includesAny(text, [
    "amoxicilina",
    "penicilina",
    "ampicilina",
    "amoxicilina + clavulanato",
    "amoxicilina clavulanato",
    "benzetacil",
  ]);

  const isNsaid = includesAny(text, [
    "ibuprofeno",
    "diclofenaco",
    "cetoprofeno",
    "naproxeno",
    "nimesulida",
    "meloxicam",
    "celecoxibe",
    "etoricoxibe",
    "aine",
  ]);

  const isNitrofurantoin = includesAny(text, ["nitrofurantoina", "nitrofurantoína"]);
  const isQuinolone = includesAny(text, [
    "ciprofloxacino",
    "levofloxacino",
    "moxifloxacino",
    "ofloxacino",
    "norfloxacino",
    "quinolona",
    "fluoroquinolona",
  ]);
  const isTetracycline = includesAny(text, [
    "doxiciclina",
    "tetraciclina",
    "minociclina",
  ]);
  const isTramadol = includesAny(text, ["tramadol"]);
  const isBupropion = includesAny(text, ["bupropiona"]);
  const isHepatotoxic = includesAny(text, [
    "paracetamol",
    "acetaminofeno",
    "valproato",
    "isoniazida",
  ]);

  if (
    allergiesText &&
    isPenicillin &&
    includesAny(allergiesText, ["penic", "amoxic", "beta lact", "betalact"])
  ) {
    alerts.push({
      id: "allergy-penicillin",
      level: "high",
      title: "Alergia relevante",
      message:
        "Paciente com alergia compatível a penicilinas/betalactâmicos. Revisar o modelo antes de prescrever.",
    });
  }

  if (isPregnant && (isTetracycline || isQuinolone)) {
    alerts.push({
      id: "pregnancy-risk",
      level: "high",
      title: "Gestação / suspeita de gestação",
      message:
        "O texto atual cita tetraciclina ou quinolona. Confirmar segurança na gestação antes de manter a prescrição.",
    });
  }

  if (hasRenalRisk && (isNsaid || isNitrofurantoin)) {
    alerts.push({
      id: "renal-risk",
      level: "high",
      title: "Função renal alterada / DRC",
      message:
        "Há risco de piora renal ou necessidade de ajuste. Revisar dose, indicação e alternativa terapêutica.",
    });
  }

  if (usesAnticoagulant && isNsaid) {
    alerts.push({
      id: "bleeding-risk",
      level: "high",
      title: "Interação com anticoagulante",
      message:
        "Paciente usa anticoagulante e o rascunho contém AINE. Avaliar risco hemorrágico antes de prescrever.",
    });
  }

  if (isElderly && (isNsaid || isQuinolone || isTramadol)) {
    alerts.push({
      id: "elderly-risk",
      level: "medium",
      title: "Paciente idoso / frágil",
      message:
        "Redobrar atenção para eventos adversos, delirium, queda, sangramento e ajuste de dose no idoso.",
    });
  }

  if (hasLiverRisk && isHepatotoxic) {
    alerts.push({
      id: "liver-risk",
      level: "medium",
      title: "Hepatopatia",
      message:
        "Há antecedente hepático e o rascunho inclui medicamento com potencial hepatotóxico. Revisar dose e monitorização.",
    });
  }

  if (usesSsri && isNsaid) {
    alerts.push({
      id: "ssri-nsaid",
      level: "medium",
      title: "ISRS + AINE",
      message:
        "Combinação pode aumentar risco gastrointestinal/hemorrágico. Reavaliar necessidade e proteção gástrica.",
    });
  }

  if (hasEpilepsy && (isTramadol || isBupropion)) {
    alerts.push({
      id: "seizure-risk",
      level: "medium",
      title: "História de convulsão / epilepsia",
      message:
        "O rascunho atual contém fármaco que pode reduzir limiar convulsivo. Conferir risco-benefício.",
    });
  }

  alerts.push({
    id: "decision-support",
    level: "info",
    title: "Apoio à decisão clínica",
    message:
      "Revise contexto clínico, dose, idade, função renal/hepática, alergias, gestação e interações antes de salvar.",
  });

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
  className = "",
}: ClinicalAlertsProps) {
  const alerts = buildAlerts(patient, medicationText);

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
          Checagem automática baseada no perfil do paciente e no texto atual da prescrição.
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
