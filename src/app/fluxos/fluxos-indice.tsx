"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, GitBranch, Search, Table2, Zap } from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import ColecoesFluxos from "@/components/fluxos/colecoes";
import { AREAS_FLUXOS, contarRegras, textoDoTema, totaisFluxos } from "@/lib/fluxos";
import { rankSearchResults } from "@/lib/search";

const TOTAIS = totaisFluxos();

export default function FluxosIndice() {
  const [busca, setBusca] = useState("");
  const [areaAtiva, setAreaAtiva] = useState("todas");

  const areas = useMemo(() => {
    const termo = busca.trim();
    return AREAS_FLUXOS.filter((area) => areaAtiva === "todas" || area.id === areaAtiva)
      .map((area) => ({
        area,
        temas: termo
          ? rankSearchResults(area.temas, termo, (tema) => [
              { value: tema.titulo, weight: 10 },
              { value: textoDoTema(tema), weight: 1 },
            ])
          : area.temas,
      }))
      .filter((grupo) => grupo.temas.length > 0 || !termo);
  }, [busca, areaAtiva]);

  const encontrados = areas.reduce((total, grupo) => total + grupo.temas.length, 0);

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Revisão para residência"
        title="Fluxogramas"
        description="Algoritmos de decisão, quadros comparativos, o que mais cai e as pegadinhas de cada tema, organizados por área e pela frequência nas provas."
        metrics={[
          { label: "Temas", value: TOTAIS.temas },
          { label: "Algoritmos", value: TOTAIS.algoritmos },
          { label: "Regras relâmpago", value: TOTAIS.regras },
          { label: "Áreas", value: TOTAIS.areas },
        ]}
      />

      <ColecoesFluxos ativa="temas" />

      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-md">
            <span className="sr-only">Buscar tema</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar tema, sigla ou conduta (ex.: Forrest, HELLP)"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-1.5">
            {[{ id: "todas", nome: "Todas" }, ...AREAS_FLUXOS].map((area) => {
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
            {encontrados} {encontrados === 1 ? "tema encontrado" : "temas encontrados"}
          </p>
        ) : null}
      </section>

      {areas.map(({ area, temas }) => (
        <section key={area.id} aria-labelledby={`area-${area.id}`} className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id={`area-${area.id}`} className="text-lg font-semibold text-slate-950">{area.nome}</h2>
              <p className="text-sm text-slate-500">
                {area.temas.length} temas · {contarRegras(area)} regras relâmpago
              </p>
            </div>
            <Link
              href={`/fluxos/${area.id}/relampago`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyan-100 bg-cyan-50 px-3 text-sm font-medium text-cyan-900 transition hover:border-cyan-800 hover:bg-cyan-800 hover:text-white"
            >
              <Zap className="h-4 w-4" />
              Revisão relâmpago
            </Link>
          </div>

          {temas.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {temas.map((tema) => (
                <Link
                  key={tema.id}
                  href={`/fluxos/${area.id}/${tema.id}`}
                  className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-700/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-slate-900">{tema.titulo}</h3>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-800" />
                  </div>
                  {tema.questoes ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {tema.questoes} {tema.questoes === 1 ? "questão" : "questões"} nas últimas 4 provas
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-600">
                    {tema.algoritmos?.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5">
                        <GitBranch className="h-3 w-3 text-cyan-700" />
                        {tema.algoritmos.length === 1 ? "Algoritmo" : `${tema.algoritmos.length} algoritmos`}
                      </span>
                    ) : null}
                    {tema.quadros?.length ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5">
                        <Table2 className="h-3 w-3 text-cyan-700" />
                        {tema.quadros.length === 1 ? "Quadro" : `${tema.quadros.length} quadros`}
                      </span>
                    ) : null}
                    {tema.linhasDoTempo?.length ? <span className="rounded-full border border-slate-200 px-2 py-0.5">Linha do tempo</span> : null}
                    {tema.graficos?.length ? <span className="rounded-full border border-slate-200 px-2 py-0.5">Gráfico</span> : null}
                    <span className="rounded-full border border-slate-200 px-2 py-0.5">{tema.oQueCai?.length ?? 0} pontos de prova</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
              Nenhum tema desta área corresponde à busca.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
