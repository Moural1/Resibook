import "./globals.css";
import "./module-surfaces.css";
import type { Metadata, Viewport } from "next";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";
import AccessibilityBridge from "../components/accessibility-bridge";
import ClinicalRuntime from "../components/clinical-runtime";
import VisualSystemController from "../components/visual-system-controller";

export const metadata: Metadata = {
  title: "Resibook | Apoio à rotina médica",
  description:
    "Ferramenta para médicos com prescrições, condutas, flashcards, CIDs, calculadoras e modelos de evolução.",
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
        <AppShell>{children}</AppShell>
        <VisualSystemController />
        <AccessibilityBridge />
        <ClinicalRuntime />
        <Toaster />
      </body>
    </html>
  );
}


