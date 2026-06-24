export type ClinicalCaseSession = {
  complaint: string;
  age: string;
  sex: string;
  severity: string;
  vitals: {
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    spo2: string;
    glicemia: string;
  };
  redFlags: string;
  notes: string;
  alerts: string[];
  priorities: string[];
  reassessment?: {
    vitals: ClinicalCaseSession["vitals"];
    symptomStatus: string;
    treatmentResponse: string;
    decision: string;
    notes: string;
    recordedAt: string;
  } | null;
  updatedAt: string;
};

const STORAGE_KEY = "resibook-clinical-case-session-v1";
const MAX_SESSION_AGE_MS = 12 * 60 * 60 * 1000;
export const CLINICAL_CASE_SESSION_EVENT = "resibook:clinical-case-session";

export function getClinicalCaseAgeMs(
  value: ClinicalCaseSession,
  now = Date.now()
) {
  const updatedAt = Date.parse(value.updatedAt);
  return Number.isFinite(updatedAt) ? Math.max(0, now - updatedAt) : 0;
}

export function formatClinicalCaseAge(
  value: ClinicalCaseSession,
  now = Date.now()
) {
  const minutes = Math.floor(getClinicalCaseAgeMs(value, now) / 60_000);

  if (minutes < 1) return "atualizado agora";
  if (minutes < 60) return `atualizado há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes
    ? `atualizado há ${hours}h ${remainingMinutes}min`
    : `atualizado há ${hours}h`;
}

function getCaseContentFingerprint(value: ClinicalCaseSession) {
  return JSON.stringify({
    complaint: value.complaint,
    age: value.age,
    sex: value.sex,
    severity: value.severity,
    vitals: value.vitals,
    redFlags: value.redFlags,
    notes: value.notes,
    reassessment: value.reassessment || null,
  });
}

export function loadClinicalCaseSession(): ClinicalCaseSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ClinicalCaseSession;
    if (!parsed?.complaint || getClinicalCaseAgeMs(parsed) > MAX_SESSION_AGE_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveClinicalCaseSession(value: ClinicalCaseSession) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const previous = raw ? (JSON.parse(raw) as ClinicalCaseSession) : null;
    const next =
      previous &&
      getCaseContentFingerprint(previous) === getCaseContentFingerprint(value)
        ? { ...value, updatedAt: previous.updatedAt }
        : value;

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CLINICAL_CASE_SESSION_EVENT));
  } catch {
    // The workflow remains usable if browser storage is unavailable.
  }
}

export function confirmClinicalCaseReassessment() {
  const current = loadClinicalCaseSession();
  if (!current) return;

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...current, updatedAt: new Date().toISOString() })
  );
  window.dispatchEvent(new CustomEvent(CLINICAL_CASE_SESSION_EVENT));
}

export function clearClinicalCaseSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CLINICAL_CASE_SESSION_EVENT));
}

export function formatCaseIdentification(value: ClinicalCaseSession) {
  return [
    value.age.trim(),
    value.sex.trim(),
    value.complaint.trim(),
  ]
    .filter(Boolean)
    .join(" | ");
}

export function formatCaseVitals(value: ClinicalCaseSession) {
  return Object.entries(value.vitals)
    .filter(([, item]) => item.trim())
    .map(([key, item]) => `${key.toUpperCase()} ${item.trim()}`)
    .join(", ");
}

export function formatCaseContext(value: ClinicalCaseSession) {
  const vitals = formatCaseVitals(value);

  return [
    value.complaint.trim() ? `Queixa: ${value.complaint.trim()}` : "",
    value.age.trim() || value.sex.trim()
      ? `Paciente: ${[value.age.trim(), value.sex.trim()].filter(Boolean).join(", ")}`
      : "",
    value.severity.trim() ? `Prioridade inicial: ${value.severity.trim()}` : "",
    vitals ? `Sinais vitais: ${vitals}` : "",
    value.redFlags.trim() ? `Sinais de alarme: ${value.redFlags.trim()}` : "",
    value.notes.trim() ? `Notas: ${value.notes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
