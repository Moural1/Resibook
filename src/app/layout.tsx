import "./globals.css";
import "./module-surfaces.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";
import AccessLogger from "../components/access-logger";
import AccessibilityBridge from "../components/accessibility-bridge";
import ClinicalCaseSessionBridge from "../components/clinical-case-session-bridge";
import ClinicalCaseFreshnessGuard from "../components/clinical-case-freshness-guard";
import ClinicalReassessmentPanel from "../components/clinical-reassessment-panel";
import GlobalSearchShortcut from "../components/global-search-shortcut";
import MobileClinicalNav from "../components/mobile-clinical-nav";
import MobilePrescriptionSafety from "../components/mobile-prescription-safety";
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

export const viewport: Viewport = {
  themeColor: "#09172d",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a
          href="#conteudo-principal"
          className="skip-link"
        >
          Ir para o conteúdo principal
        </a>
        <Suspense fallback={null}>
          <AccessLogger />
        </Suspense>

        <AppShell>{children}</AppShell>
        <VisualSystemController />
        <AccessibilityBridge />
        <PatientRecordNavigator />
        <PatientTimelineControls />
        <ShiftToolNavigator />
        <GlobalSearchShortcut />
        <MobileClinicalNav />
        <MobilePrescriptionSafety />
        <ClinicalCaseSessionBridge />
        <ClinicalCaseFreshnessGuard />
        <ClinicalReassessmentPanel />
        <Toaster />
      </body>
    </html>
  );
}

