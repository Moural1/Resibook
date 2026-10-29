// Pacientes é um recurso central do produto e já possui isolamento por usuário
// no Supabase. Não pode desaparecer por ausência de variável na Vercel.
const patientRecordsEnabled = true;

// ECG guiado (com análise de imagem por IA) fica fora do lançamento: leitura
// automática de traçado tende a ser enquadrada como dispositivo médico.
// Religar com NEXT_PUBLIC_RESIBOOK_ENABLE_ECG=true.
const ecgGuidedEnabled = process.env.NEXT_PUBLIC_RESIBOOK_ENABLE_ECG === "true";

const clinicalAudioEnabled =
  process.env.NEXT_PUBLIC_RESIBOOK_ENABLE_CLINICAL_AUDIO === "true";

export const PRODUCT_CAPABILITIES = Object.freeze({
  patientRecords: patientRecordsEnabled,
  clinicalAudio: clinicalAudioEnabled,
  ecgGuided: ecgGuidedEnabled,
});

export function isDisabledCommercialRoute(pathname: string) {
  if (
    !PRODUCT_CAPABILITIES.patientRecords &&
    (pathname === "/pacientes" ||
      pathname.startsWith("/pacientes/") ||
      pathname === "/api/patients" ||
      pathname.startsWith("/api/patients/"))
  ) {
    return true;
  }

  if (
    !PRODUCT_CAPABILITIES.ecgGuided &&
    (pathname === "/ecg-guiado" ||
      pathname.startsWith("/ecg-guiado/") ||
      pathname.startsWith("/api/ecg/"))
  ) {
    return true;
  }

  return (
    !PRODUCT_CAPABILITIES.clinicalAudio &&
    (pathname === "/consulta-audio" ||
      pathname.startsWith("/consulta-audio/") ||
      pathname === "/api/ai/case-review" ||
      pathname === "/api/consultas" ||
      pathname.startsWith("/api/consultas/"))
  );
}
