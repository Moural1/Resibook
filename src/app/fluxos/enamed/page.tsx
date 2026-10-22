import type { Metadata } from "next";
import { AREAS_DOSSIE, chavesDoBloco, contarConfirmar, totaisDossie } from "@/lib/fluxos/enamed";
import DossieIndice, { type ResumoArea } from "./dossie-indice";

export const metadata: Metadata = {
  title: "Dossiê ENAMED · Fluxogramas",
  description: "Tabelas, algoritmos, erros comuns, travas, apostas e atualizações normativas por área, para a prova do ENAMED.",
};

export default function DossieEnamedPage() {
  /* Só o resumo de cada bloco vai para o navegador; o conteúdo completo fica nas páginas dos blocos. */
  const areas: ResumoArea[] = AREAS_DOSSIE.map((area) => ({
    id: area.id,
    nome: area.nome,
    blocos: area.blocos.map((bloco) => ({
      id: bloco.id,
      tipo: bloco.tipo,
      titulo: bloco.titulo,
      resumo: bloco.resumo ?? null,
      quadros: bloco.elementos.filter((elemento) => elemento.tipo === "quadro").length,
      algoritmos: bloco.elementos.filter((elemento) => elemento.tipo === "algoritmo").length,
      erros: bloco.elementos.reduce((total, elemento) => total + (elemento.tipo === "erros" ? elemento.itens.length : 0), 0),
      padroes: bloco.elementos.filter((elemento) => elemento.tipo === "padrao").length,
      confirmar: contarConfirmar(bloco),
      chaves: chavesDoBloco(bloco).join(" · "),
    })),
  }));

  return <DossieIndice areas={areas} totais={totaisDossie()} />;
}
