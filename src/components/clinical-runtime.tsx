"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AccessLogger from "./access-logger";
import ClinicalCaseSessionBridge from "./clinical-case-session-bridge";
import ClinicalCaseFreshnessGuard from "./clinical-case-freshness-guard";
import ClinicalEvolutionComposer from "./clinical-evolution-composer";
import ClinicalReassessmentPanel from "./clinical-reassessment-panel";
import GlobalSearchShortcut from "./global-search-shortcut";
import MobileClinicalNav from "./mobile-clinical-nav";
import MobilePrescriptionSafety from "./mobile-prescription-safety";
import PatientRecordNavigator from "./patient-record-navigator";
import PatientTimelineControls from "./patient-timeline-controls";
import ShiftToolNavigator from "./shift-tool-navigator";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/redefinir-senha",
  "/aceite-legal",
  "/termos",
  "/privacidade",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );
}

export default function ClinicalRuntime() {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) return null;

  return (
    <>
      <Suspense fallback={null}>
        <AccessLogger />
      </Suspense>
      <PatientRecordNavigator />
      <PatientTimelineControls />
      <ShiftToolNavigator />
      <GlobalSearchShortcut />
      <MobileClinicalNav />
      <MobilePrescriptionSafety />
      <ClinicalCaseSessionBridge />
      <ClinicalCaseFreshnessGuard />
      <ClinicalReassessmentPanel />
      <ClinicalEvolutionComposer />
    </>
  );
}


