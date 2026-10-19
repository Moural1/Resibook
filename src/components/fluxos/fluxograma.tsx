import type { Algoritmo, NoFluxo, RamoFluxo } from "@/lib/fluxos";

/* Fluxograma vertical: cenário → avaliar → decisão (ramos lado a lado) →
   conduta → atenção. Os ramos empilham no celular. */

const ROTULO: Record<NoFluxo["tipo"], string> = {
  cenario: "Cenário",
  avaliar: "Avaliar",
  decisao: "Decisão",
  conduta: "Conduta",
  atencao: "Atenção",
};

function Conector() {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden="true">
      <span className="h-3 w-px bg-slate-300" />
      <span className="h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-slate-400" />
    </div>
  );
}

function Caixa({ no }: { no: Exclude<NoFluxo, { tipo: "decisao" }> | { tipo: "decisao"; texto: string } }) {
  const estilos: Record<NoFluxo["tipo"], { caixa: string; rotulo: string }> = {
    cenario: { caixa: "border-cyan-900 bg-cyan-900 text-center text-white", rotulo: "text-[#a5f3fc]" },
    avaliar: { caixa: "border-slate-200 bg-slate-50 text-center text-slate-700", rotulo: "text-slate-500" },
    decisao: { caixa: "rounded-2xl border-2 border-cyan-800/40 bg-white text-center font-semibold text-slate-900", rotulo: "text-cyan-800" },
    conduta: { caixa: "border-slate-200 border-l-4 border-l-cyan-700 bg-white text-left text-slate-800", rotulo: "text-cyan-800" },
    atencao: { caixa: "border-rose-200 border-l-4 border-l-rose-500 bg-rose-50 text-left text-rose-950", rotulo: "text-rose-700" },
  };
  const estilo = estilos[no.tipo];

  return (
    <div className={`w-full max-w-2xl rounded-lg border px-4 py-2.5 text-sm leading-6 ${estilo.caixa}`}>
      <span className={`block text-[11px] font-semibold ${estilo.rotulo}`}>{ROTULO[no.tipo]}</span>
      {no.texto}
    </div>
  );
}

function Ramos({ ramos }: { ramos: RamoFluxo[] }) {
  return (
    <div
      className="grid w-full gap-3 md:[grid-template-columns:repeat(var(--ramos),minmax(0,1fr))]"
      style={{ ["--ramos" as string]: ramos.length }}
    >
      {ramos.map((ramo) => (
        <div key={ramo.rotulo} className="flex min-w-0 flex-col items-center rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
          <span className="w-full rounded-full bg-cyan-800 px-3 py-1 text-center text-xs font-semibold leading-5 text-white">
            {ramo.rotulo}
          </span>
          <Conector />
          <Passos passos={ramo.passos} />
        </div>
      ))}
    </div>
  );
}

function Passos({ passos }: { passos: NoFluxo[] }) {
  return (
    <div className="flex w-full flex-col items-center">
      {passos.map((no, index) => (
        <div key={`${no.tipo}-${index}`} className="flex w-full flex-col items-center">
          {index > 0 ? <Conector /> : null}
          {no.tipo === "decisao" ? (
            <>
              <Caixa no={{ tipo: "decisao", texto: no.texto }} />
              <Conector />
              <Ramos ramos={no.ramos} />
            </>
          ) : (
            <Caixa no={no} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Fluxograma({ algoritmo }: { algoritmo: Algoritmo }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <figcaption className="mb-4 text-[15px] font-semibold text-slate-950">{algoritmo.titulo}</figcaption>
      <Passos passos={algoritmo.passos} />
    </figure>
  );
}
