import type { Metadata } from "next";
import QuadroPlantao from "@/components/shift/quadro-plantao";

export const metadata: Metadata = {
  title: "Quadro do plantão",
  description: "Pacientes do plantão por prioridade, com timer de reavaliação, pendências e passagem SBAR de todos.",
};

export default function QuadroPlantaoPage() {
  return <QuadroPlantao />;
}
