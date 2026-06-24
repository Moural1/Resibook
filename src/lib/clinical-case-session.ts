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
  updatedAt: string;
};

const STORAGE_KEY = "resibook-clinical-case-session-v1";

export function loadClinicalCaseSession(): ClinicalCaseSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClinicalCaseSession) : null;
  } catch {
    return null;
  }
}

export function saveClinicalCaseSession(value: ClinicalCaseSession) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The workflow remains usable if browser storage is unavailable.
  }
}

export function clearClinicalCaseSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function formatCaseIdentification(value: ClinicalCaseSession) {
  return [value.age.trim(), value.sex.trim(), value.complaint.trim()]
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
