"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Search } from "lucide-react";
import ModulePageHeader from "@/components/module-page-header";
import Fluxograma from "@/components/fluxos/fluxograma";
import { QuadroComparativo } from "@/components/fluxos/blocos";
import { encontrarArea, type RegraRelampago } from "@/lib/fluxos";
import { rankSearchResults } from "@/lib/search";

function CartaoRegra({ regra, oculto }: { regra: RegraRelampago; oculto: boolean }) {
  const [revelado, setRevelado] = useState(false);
  const mostrar = !oculto || revelado;

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-cyan-800">{regra.tema}</p>
      {regra.titulo ? <h3 className="mt-0.5 text-[15px] font-semibold text-slate-900">{regra.titulo}</h3> : null}
      {mostrar ? (
        <p className="mt-2 text-sm leading-6 text-slate-700">{regra.texto}</p>
      ) : (
        <button
          type="button"
          onClick={() => setRevelado(true)}
          className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-600 transition hover:border-cyan-700 hover:text-cyan-900"
        >
          <Eye className="h-4 w-4" />
          Lembrou? Mostrar a regra
        </button>
      )}
    </article>
  );
}

export default function RevisaoRelampago({ areaId }: { areaId: string }) {
  const area = encontrarArea(areaId)!;
  const [busca, setBusca] = useState("");
  const [modoRevisao, setModoRevisao] = useState(false);

  const { raioX, regras } = useMemo(() => {
    const termo = busca.trim();
    const filtrar = (lista: RegraRelampago[]) =>
      termo
        ? rankSearchResults(lista, termo, (regra) => [
            { value: regra.tema, weight: 8 },
            { value: regra.titulo, weight: 8 },
            { value: regra.texto, weight: 2 },
          ])
        : lista;
    return { raioX: filtrar(area.raioX?.regras ?? []), regras: filtrar(area.regrasRelampago ?? []) };
  }, [busca, area]);
  const total = (area.raioX?.regras.length ?? 0) + (area.regrasRelampago?.length ?? 0);

  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow={area.nome}
        title="Revisão relâmpago"
        description="Uma regra por tema, para bater o olho antes da prova. No modo revisão, tente lembrar antes de abrir cada cartão."
        metrics={[
          { label: "Regras", value: total },
          { label: "Temas da área", value: area.temas.length },
        ]}
        actions={
          <>
            <button type="button" onClick={() => setModoRevisao((valor) => !valor)} className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium">
              {modoRevisao ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {modoRevisao ? "Mostrar todas" : "Modo revisão"}
            </button>
            <Link href="/fluxos" className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Todos os temas
            </Link>
          </>
        }
      />

      <label className="relative block w-full md:max-w-md">
        <span className="sr-only">Buscar regra</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar nas regras desta área"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
        />
      </label>

      {area.raioX ? (
        <section aria-labelledby="raio-x" className="space-y-3">
          <div>
            <h2 id="raio-x" className="text-base font-semibold text-slate-950">Raio-X: temas de alta frequência</h2>
            <p className="text-sm text-slate-500">Uma linha por tema que costuma aparecer.</p>
          </div>
          <div key={`raio-${modoRevisao}`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {raioX.map((regra) => (
              <CartaoRegra key={`${regra.tema}-${regra.titulo ?? ""}`} regra={regra} oculto={modoRevisao} />
            ))}
          </div>
          {!busca.trim()
            ? area.raioX.quadros?.map((quadro) => <QuadroComparativo key={quadro.titulo} quadro={quadro} />)
            : null}
          {!busca.trim()
            ? area.raioX.algoritmos?.map((algoritmo) => <Fluxograma key={algoritmo.titulo} algoritmo={algoritmo} />)
            : null}
        </section>
      ) : null}

      {area.regrasRelampago?.length ? (
        <section aria-labelledby="regras" className="space-y-3">
          <div>
            <h2 id="regras" className="text-base font-semibold text-slate-950">Regras relâmpago: temas raros</h2>
            <p className="text-sm text-slate-500">Temas que caíram uma ou duas vezes.</p>
          </div>
          <div key={`regras-${modoRevisao}`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {regras.map((regra) => (
              <CartaoRegra key={`${regra.tema}-${regra.titulo ?? ""}`} regra={regra} oculto={modoRevisao} />
            ))}
          </div>
        </section>
      ) : null}

      {busca.trim() && raioX.length + regras.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
          Nenhuma regra desta área corresponde à busca.
        </p>
      ) : null}
    </div>
  );
}
