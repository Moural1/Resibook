import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";
import AccessLogger from "../components/access-logger";

export const metadata: Metadata = {
  title: "ResiBook",
  description: "Sistema médico premium",
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/icon.png"],
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
        <Toaster />
      </body>
    </html>
  );
}