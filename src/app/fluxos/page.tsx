import type { Metadata } from "next";
import FluxosIndice from "./fluxos-indice";

export const metadata: Metadata = {
  title: "Fluxogramas de revisão",
  description: "Algoritmos, quadros, o que mais cai e pegadinhas de cirurgia, clínica, GO, pediatria e preventiva.",
};

export default function FluxosPage() {
  return <FluxosIndice />;
}
