import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpenCheck, TriangleAlert } from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import Fluxograma from "@/components/fluxos/fluxograma";
import { QuadroComparativo } from "@/components/fluxos/blocos";
import { ErrosComuns, PadraoBancaCard } from "@/components/fluxos/dossie";
import {
  AREAS_DOSSIE,
  ROTULO_BLOCO,
  contarConfirmar,
  encontrarBloco,
  vizinhosBloco,
  type BlocoDossie,
  type ElementoDossie,
  type TipoBlocoDossie,
} from "@/lib/fluxos/enamed";

type Props = { params: Promise<{ area: string; bloco: string }> };

export function generateStaticParams() {
  return AREAS_DOSSIE.flatMap((area) => area.blocos.map((bloco) => ({ area: area.id, bloco: bloco.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, bloco } = await params;
  const achado = encontrarBloco(area, bloco);
  return { title: achado ? `${achado.bloco.titulo} · Dossiê ENAMED` : "Dossiê ENAMED" };
}

const DESCRICAO: Record<TipoBlocoDossie, string> = {
  tema: "Erros comuns com a trava de cada um, algoritmos de decisão, tabelas e o que já caiu nas provas.",
  algoritmos: "Fluxos de decisão para não confundir condutas parecidas.",
  contrastes: "Pares parecidos o bastante para serem trocados, lado a lado com o que os distingue.",
  numeros: "Cutoffs, doses, janelas e prazos que mudam o gabarito.",
  normativo: "Atualizações recentes de diretrizes e normas: o que mudou e de onde veio.",
  apostas: "Temas com alta chance de cair e o que saber de cada um.",
  "pontos-cegos": "Temas que costumam passar despercebidos, com a pista e a conduta.",
  travas: "Frases curtas que travam a regra certa na hora da prova.",
  banca: "Os 12 movimentos que a banca usa para montar armadilhas, com como reconhecer e o antídoto.",
};

function contar(bloco: BlocoDossie, tipo: ElementoDossie["tipo"]) {
  return bloco.elementos.filter((elemento) => elemento.tipo === tipo).length;
}

function Elemento({ elemento }: { elemento: ElementoDossie }) {
  switch (elemento.tipo) {
    case "erros":
      return <ErrosComuns itens={elemento.itens} />;
    case "quadro":
      return <QuadroComparativo quadro={elemento.quadro} />;
    case "algoritmo":
      return <Fluxograma algoritmo={elemento.algoritmo} />;
    case "padrao":
      return <PadraoBancaCard padrao={elemento.padrao} />;
  }
}

export default async function BlocoDossiePage({ params }: Props) {
  const { area: areaId, bloco: blocoId } = await params;
  const achado = encontrarBloco(areaId, blocoId);
  if (!achado) notFound();
  const { area, bloco } = achado;
  const { anterior, proximo } = vizinhosBloco(area, bloco.id);
  const proximaArea = AREAS_DOSSIE[AREAS_DOSSIE.findIndex((item) => item.id === area.id) + 1] ?? null;
  const aConfirmar = contarConfirmar(bloco);
  const erros = bloco.elementos.reduce((total, elemento) => total + (elemento.tipo === "erros" ? elemento.itens.length : 0), 0);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow={`Dossiê ENAMED · ${area.nome}`}
        title={bloco.titulo}
        description={DESCRICAO[bloco.tipo]}
        badges={[{ label: ROTULO_BLOCO[bloco.tipo], tone: "cyan" }, ...(bloco.resumo ? [{ label: bloco.resumo }] : [])]}
        metrics={[
          { label: "Erros comuns", value: erros },
          { label: "Algoritmos", value: contar(bloco, "algoritmo") },
          { label: "Tabelas", value: contar(bloco, "quadro") },
          { label: "Padrões", value: contar(bloco, "padrao") },
          { label: "A confirmar", value: aConfirmar },
        ].filter((metrica) => metrica.value > 0)}
        actions={
          <Link href="/fluxos/enamed" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium">
            <BookOpenCheck className="h-4 w-4" />
            Todo o dossiê
          </Link>
        }
      />

      {aConfirmar || bloco.tipo === "normativo" ? (
        <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            {bloco.tipo === "normativo"
              ? "Atualizações recentes mudam com frequência: date a regra e confirme na fonte antes de memorizar. "
              : null}
            Itens com o selo <strong>A confirmar</strong> ainda não foram reconferidos com a fonte original.
          </span>
        </p>
      ) : null}

      <div className="space-y-4">
        {bloco.elementos.map((elemento, index) => (
          <Elemento key={index} elemento={elemento} />
        ))}
      </div>

      <nav aria-label="Outros blocos do dossiê" className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
        {anterior ? (
          <Link href={`/fluxos/enamed/${area.id}/${anterior.id}`} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-700/40">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowLeft className="h-3.5 w-3.5" />
              Bloco anterior
            </span>
            <span className="mt-1 block text-sm font-semibold text-slate-900">{anterior.titulo}</span>
          </Link>
        ) : (
          <span />
        )}
        {proximo || proximaArea ? (
          <Link
            href={proximo ? `/fluxos/enamed/${area.id}/${proximo.id}` : `/fluxos/enamed/${proximaArea!.id}/${proximaArea!.blocos[0].id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 text-right transition hover:border-cyan-700/40"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
              {proximo ? "Próximo bloco" : `Próxima área · ${proximaArea!.nome}`}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-sm font-semibold text-slate-900">{proximo ? proximo.titulo : proximaArea!.blocos[0].titulo}</span>
          </Link>
        ) : (
          <Link href="/fluxos/enamed" className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-right transition hover:border-cyan-700/40">
            <span className="flex items-center justify-end gap-1.5 text-xs text-cyan-800">Fim do dossiê</span>
            <span className="mt-1 block text-sm font-semibold text-cyan-950">Voltar ao índice do Dossiê ENAMED</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
