import type { Metadata } from "next";
import PsiquiatriaApp from "@/components/psiquiatria/psiquiatria-app";

export const metadata: Metadata = {
  title: "Psiquiatria",
  robots: { index: false, follow: false },
};

export default function PsiquiatriaPage() {
  return <PsiquiatriaApp />;
}
