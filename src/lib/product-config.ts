const patientRecordsEnabled =
  process.env.NEXT_PUBLIC_RESIBOOK_ENABLE_PATIENT_RECORDS === "true";

const clinicalAudioEnabled =
  patientRecordsEnabled &&
  process.env.NEXT_PUBLIC_RESIBOOK_ENABLE_CLINICAL_AUDIO === "true";

export const PRODUCT_CAPABILITIES = Object.freeze({
  patientRecords: patientRecordsEnabled,
  clinicalAudio: clinicalAudioEnabled,
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

  return (
    !PRODUCT_CAPABILITIES.clinicalAudio &&
    (pathname === "/consulta-audio" ||
      pathname.startsWith("/consulta-audio/") ||
      pathname === "/api/ai/case-review" ||
      pathname === "/api/consultas" ||
      pathname.startsWith("/api/consultas/"))
  );
}
