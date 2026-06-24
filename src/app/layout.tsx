import "./globals.css";
import "./module-surfaces.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";
import AccessLogger from "../components/access-logger";
import ClinicalCaseSessionBridge from "../components/clinical-case-session-bridge";
import ClinicalCaseFreshnessGuard from "../components/clinical-case-freshness-guard";
import ClinicalReassessmentPanel from "../components/clinical-reassessment-panel";
import GlobalSearchShortcut from "../components/global-search-shortcut";
import MobileClinicalNav from "../components/mobile-clinical-nav";
import PatientRecordNavigator from "../components/patient-record-navigator";
import PatientTimelineControls from "../components/patient-timeline-controls";
import ShiftToolNavigator from "../components/shift-tool-navigator";
import VisualSystemController from "../components/visual-system-controller";

export const metadata: Metadata = {
  title: "ResiBook",
  description: "Sistema médico premium",
  icons: {
    icon: [
      {
        url: "/resibook-icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/resibook-icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Suspense fallback={null}>
          <AccessLogger />
        </Suspense>

        <AppShell>{children}</AppShell>
        <VisualSystemController />
        <PatientRecordNavigator />
        <PatientTimelineControls />
        <ShiftToolNavigator />
        <GlobalSearchShortcut />
        <MobileClinicalNav />
        <ClinicalCaseSessionBridge />
        <ClinicalCaseFreshnessGuard />
        <ClinicalReassessmentPanel />
        <Toaster />
      </body>
    </html>
  );
}
