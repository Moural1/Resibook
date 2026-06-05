import "./globals.css";
import type { Metadata } from "next";
import Toaster from "../components/toaster";

export const metadata: Metadata = {
  title: "ResiBook",
  description: "Sistema médico premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}