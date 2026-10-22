"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CircleX, GitBranch, Search, Swords, Table2, TriangleAlert } from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import ColecoesFluxos from "@/components/fluxos/colecoes";
import { ROTULO_BLOCO, type TipoBlocoDossie } from "@/lib/fluxos/enamed/rotulos";
import { rankSearchResults } from "@/lib/search";

export type ResumoBloco = {
  id: string;
  tipo: TipoBlocoDossie;
  titulo: string;
  resumo: string | null;
  quadros: number;
  algoritmos: number;
  erros: number;
  padroes: number;
  confirmar: number;
  chaves: string;
};

export type ResumoArea = { id: string; nome: string; blocos: ResumoBloco[] };

type Totais = { areas: number; blocos: number; quadros: number; algoritmos: number; erros: number };

const TOM_BLOCO: Record<TipoBlocoDossie, string> = {
  tema: "bg-cyan-900 text-white",
  algoritmos: "bg-cyan-50 text-cyan-900",
  contrastes: "bg-violet-50 text-violet-800",
  numeros: "bg-sky-50 text-sky-800",
  normativo: "bg-amber-50 text-amber-800",
  apostas: "bg-emerald-50 text-emerald-800",
  "pontos-cegos": "bg-slate-100 text-slate-700",
  travas: "bg-orange-50 text-orange-800",
  banca: "bg-rose-50 text-rose-800",
};

function Contagem({ icone: Icone, texto }: { icone: typeof Table2; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5">
      <Icone className="h-3 w-3 text-cyan-700" />
      {texto}
    </span>
  );
}

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

export default function DossieIndice({ areas, totais }: { areas: ResumoArea[]; totais: Totais }) {
  const [busca, setBusca] = useState("");
  const [areaAtiva, setAreaAtiva] = useState("todas");

  const grupos = useMemo(() => {
    const termo = busca.trim();
    return areas
      .filter((area) => areaAtiva === "todas" || area.id === areaAtiva)
      .map((area) => ({
        area,
        blocos: termo
          ? rankSearchResults(area.blocos, termo, (bloco) => [
              { value: bloco.titulo, weight: 10 },
              { value: bloco.chaves, weight: 3 },
            ])
          : area.blocos,
      }))
      .filter((grupo) => grupo.blocos.length > 0 || !termo);
  }, [areas, busca, areaAtiva]);

  const encontrados = grupos.reduce((total, grupo) => total + grupo.blocos.length, 0);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Revisão para residência"
        title="Dossiê ENAMED"
        description="Os temas que mais derrubam na prova em tabelas, algoritmos e frases-trava: erros comuns, contrastes, números, atualizações normativas e como a banca arma as questões."
        metrics={[
          { label: "Blocos", value: totais.blocos },
          { label: "Tabelas", value: totais.quadros },
          { label: "Algoritmos", value: totais.algoritmos },
          { label: "Erros comuns", value: totais.erros },
        ]}
      />

      <ColecoesFluxos ativa="enamed" />

      <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span>
          Itens com o selo <strong>A confirmar</strong> ainda não foram reconferidos com a fonte original — use como pista e confirme na diretriz
          antes de memorizar.
        </span>
      </p>

      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Buscar no dossiê</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar tema, tabela ou algoritmo (ex.: colangite, CTG)"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-1.5">
            {[{ id: "todas", nome: "Todas" }, ...areas].map((area) => {
              const ativa = area.id === areaAtiva;
              return (
                <button
                  key={area.id}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => setAreaAtiva(area.id)}
                  className={`h-8 rounded-full border px-3 text-xs font-medium transition ${
                    ativa ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {area.nome}
                </button>
              );
            })}
          </div>
        </div>
        {busca.trim() ? (
          <p className="mt-3 text-sm text-slate-500">
            {encontrados} {encontrados === 1 ? "bloco encontrado" : "blocos encontrados"}
          </p>
        ) : null}
      </section>

      {grupos.map(({ area, blocos }) => (
        <section key={area.id} aria-labelledby={`dossie-${area.id}`} className="space-y-3">
          <div>
            <h2 id={`dossie-${area.id}`} className="text-lg font-semibold text-slate-950">{area.nome}</h2>
            <p className="text-sm text-slate-500">{plural(area.blocos.length, "bloco", "blocos")}</p>
          </div>

          {blocos.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {blocos.map((bloco) => (
                <Link
                  key={bloco.id}
                  href={`/fluxos/enamed/${area.id}/${bloco.id}`}
                  className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-700/40"
                >
                  <span className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold ${TOM_BLOCO[bloco.tipo]}`}>{ROTULO_BLOCO[bloco.tipo]}</span>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-slate-900">{bloco.titulo}</h3>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-800" />
                  </div>
                  {bloco.resumo ? <p className="mt-1 text-xs leading-5 text-slate-500">{bloco.resumo}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-600">
                    {bloco.erros ? <Contagem icone={CircleX} texto={plural(bloco.erros, "erro comum", "erros comuns")} /> : null}
                    {bloco.algoritmos ? <Contagem icone={GitBranch} texto={plural(bloco.algoritmos, "algoritmo", "algoritmos")} /> : null}
                    {bloco.quadros ? <Contagem icone={Table2} texto={plural(bloco.quadros, "tabela", "tabelas")} /> : null}
                    {bloco.padroes ? <Contagem icone={Swords} texto={plural(bloco.padroes, "padrão", "padrões")} /> : null}
                    {bloco.confirmar ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
                        <TriangleAlert className="h-3 w-3" />
                        {bloco.confirmar} a confirmar
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
              Nenhum bloco desta área corresponde à busca.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
