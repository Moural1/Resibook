import "./globals.css";
import type { Metadata } from "next";
import Toaster from "../components/toaster";
import AppShell from "../components/app-shell";

export const metadata: Metadata = {
  title: "ResiBook",
  description: "Sistema clínico ResiBook",
  icons: {
    icon: "/logo-resibook.png",
    shortcut: "/logo-resibook.png",
    apple: "/logo-resibook.png",
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
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}