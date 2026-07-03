import "./globals.css";
import "./module-surfaces.css";
import type { Metadata, Viewport } from "next";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";
import AccessibilityBridge from "../components/accessibility-bridge";
import ClinicalRuntime from "../components/clinical-runtime";
import VisualSystemController from "../components/visual-system-controller";

const productionHost =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(productionHost),
  applicationName: "ResiBook",
  title: {
    default: "ResiBook | Banco clínico e workspace médico",
    template: "%s | ResiBook",
  },
  description:
    "Banco clínico organizado e workspace privado para médicos consultarem, adaptarem e organizarem conteúdo para a rotina e o plantão.",
  keywords: [
    "ResiBook",
    "banco clínico",
    "prescrições médicas",
    "plantão médico",
    "flashcards medicina",
    "workspace médico",
  ],
  creator: "ResiBook",
  publisher: "ResiBook",
  category: "medical software",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ResiBook",
    title: "ResiBook | O seu banco clínico, pronto para o plantão",
    description:
      "Consulte o Banco ResiBook e organize cópias privadas editáveis no Meu ResiBook.",
    images: [{ url: "/logo-resibook-horizontal.png", alt: "ResiBook" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResiBook | Banco clínico e workspace médico",
    description:
      "Conteúdo clínico organizado e um acervo privado para cada médico.",
    images: ["/logo-resibook-horizontal.png"],
  },
  robots: { index: false, follow: false },
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


