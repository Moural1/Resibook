import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import Fluxograma from "@/components/fluxos/fluxograma";
import {
  GraficoIntervalosVisual,
  LinhaDoTempoVisual,
  OQueCai,
  Pegadinhas,
  PontoDeRevisao,
  QuadroComparativo,
} from "@/components/fluxos/blocos";
import { AREAS_FLUXOS, encontrarTema, vizinhos } from "@/lib/fluxos";

type Props = { params: Promise<{ area: string; tema: string }> };

export function generateStaticParams() {
  return AREAS_FLUXOS.flatMap((area) => area.temas.map((tema) => ({ area: area.id, tema: tema.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, tema } = await params;
  const achado = encontrarTema(area, tema);
  return { title: achado ? `${achado.tema.titulo} · Fluxogramas` : "Fluxogramas" };
}

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={`secao-${id}`} aria-labelledby={id} className="scroll-mt-24 space-y-3">
      <h2 id={id} className="text-base font-semibold text-slate-950">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default async function TemaFluxoPage({ params }: Props) {
  const { area: areaId, tema: temaId } = await params;
  const achado = encontrarTema(areaId, temaId);
  if (!achado) notFound();
  const { area, tema } = achado;
  const { anterior, proximo } = vizinhos(area, tema.id);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow={area.nome}
        title={tema.titulo}
        description="Algoritmo de decisão, quadros comparativos, o que mais cai e as pegadinhas do tema."
        metrics={[
          ...(tema.questoes ? [{ label: "Questões em 4 provas", value: tema.questoes }] : []),
          { label: "Algoritmos", value: tema.algoritmos?.length ?? 0 },
          { label: "Quadros", value: tema.quadros?.length ?? 0 },
          { label: "Pontos de prova", value: tema.oQueCai?.length ?? 0 },
        ].filter((metrica) => metrica.value > 0)}
        actions={
          <>
            <Link href="/fluxos" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Todos os temas
            </Link>
            <Link href={`/fluxos/${area.id}/relampago`} className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Revisão relâmpago
            </Link>
          </>
        }
      />

      <nav aria-label="Seções do tema" className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-slate-500">Ir para:</span>
        {[
          tema.algoritmos?.length ? ["#secao-algoritmos", tema.algoritmos.length === 1 ? "Algoritmo" : "Algoritmos"] : null,
          tema.linhasDoTempo?.length ? ["#secao-linha-do-tempo", "Linha do tempo"] : null,
          tema.graficos?.length ? ["#secao-esquema", "Esquema"] : null,
          tema.quadros?.length ? ["#secao-quadros", tema.quadros.length === 1 ? "Quadro" : "Quadros"] : null,
          tema.oQueCai?.length ? ["#o-que-cai", "O que cai"] : null,
          tema.pegadinhas?.length ? ["#pegadinhas", "Pegadinhas"] : null,
        ]
          .filter((item): item is string[] => Boolean(item))
          .map(([href, rotulo]) => (
            <a key={href} href={href} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-cyan-700/40 hover:bg-cyan-50 hover:text-cyan-900">
              {rotulo}
            </a>
          ))}
      </nav>

      {tema.revisar?.length ? <PontoDeRevisao itens={tema.revisar} /> : null}

      {tema.algoritmos?.length ? (
        <Secao id="algoritmos" titulo={tema.algoritmos.length === 1 ? "Algoritmo" : "Algoritmos"}>
          <div className="space-y-4">
            {tema.algoritmos.map((algoritmo) => (
              <Fluxograma key={algoritmo.titulo} algoritmo={algoritmo} />
            ))}
          </div>
        </Secao>
      ) : null}

      {tema.linhasDoTempo?.length ? (
        <Secao id="linha-do-tempo" titulo="Linha do tempo">
          {tema.linhasDoTempo.map((linha) => (
            <LinhaDoTempoVisual key={linha.titulo} linha={linha} />
          ))}
        </Secao>
      ) : null}

      {tema.graficos?.length ? (
        <Secao id="esquema" titulo="Esquema">
          {tema.graficos.map((grafico) => (
            <GraficoIntervalosVisual key={grafico.titulo} grafico={grafico} />
          ))}
        </Secao>
      ) : null}

      {tema.quadros?.length ? (
        <Secao id="quadros" titulo={tema.quadros.length === 1 ? "Quadro" : "Quadros"}>
          <div className="space-y-4">
            {tema.quadros.map((quadro) => (
              <QuadroComparativo key={quadro.titulo} quadro={quadro} />
            ))}
          </div>
        </Secao>
      ) : null}

      {tema.oQueCai?.length ? (
        <div id="o-que-cai" className="scroll-mt-24">
          <OQueCai itens={tema.oQueCai} />
        </div>
      ) : null}

      {tema.pegadinhas?.length ? (
        <div id="pegadinhas" className="scroll-mt-24">
          <Pegadinhas itens={tema.pegadinhas} />
        </div>
      ) : null}

      <nav aria-label="Outros temas da área" className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
        {anterior ? (
          <Link href={`/fluxos/${area.id}/${anterior.id}`} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-700/40">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowLeft className="h-3.5 w-3.5" />
              Tema anterior
            </span>
            <span className="mt-1 block text-sm font-semibold text-slate-900">{anterior.titulo}</span>
          </Link>
        ) : (
          <span />
        )}
        {proximo ? (
          <Link href={`/fluxos/${area.id}/${proximo.id}`} className="group rounded-xl border border-slate-200 bg-white p-4 text-right transition hover:border-cyan-700/40">
            <span className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
              Próximo tema
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-sm font-semibold text-slate-900">{proximo.titulo}</span>
          </Link>
        ) : (
          <Link href={`/fluxos/${area.id}/relampago`} className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-right transition hover:border-cyan-700/40">
            <span className="flex items-center justify-end gap-1.5 text-xs text-cyan-800">
              Fim da área
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-sm font-semibold text-cyan-950">Revisão relâmpago de {area.nome}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
