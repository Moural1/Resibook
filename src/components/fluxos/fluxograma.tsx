import { CircleAlert, ClipboardCheck, GitBranch, Search, Stethoscope } from "lucide-react";
import type { Algoritmo, NoFluxo, RamoFluxo } from "@/lib/fluxos";
import TextoRico from "./texto-rico";

/* Fluxograma vertical: cenário → avaliar → decisão (ramos lado a lado,
   ligados por uma barra) → conduta → atenção. Os ramos empilham no celular. */

const ESTILO = {
  cenario: {
    rotulo: "Cenário",
    icone: Stethoscope,
    caixa: "border-cyan-900 bg-cyan-900 text-center text-white shadow-[0_6px_18px_rgba(22,78,99,0.18)]",
    etiqueta: "text-[#a5f3fc]",
  },
  avaliar: {
    rotulo: "Avaliar",
    icone: Search,
    caixa: "border-slate-200 bg-slate-50 text-center text-slate-700",
    etiqueta: "text-slate-500",
  },
  decisao: {
    rotulo: "Decisão",
    icone: GitBranch,
    caixa: "rounded-2xl border-2 border-cyan-700 bg-white text-center font-semibold text-slate-950 shadow-[0_4px_14px_rgba(14,116,144,0.12)]",
    etiqueta: "text-cyan-800",
  },
  conduta: {
    rotulo: "Conduta",
    icone: ClipboardCheck,
    caixa: "border-slate-200 border-l-4 border-l-cyan-700 bg-white text-left text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
    etiqueta: "text-cyan-800",
  },
  atencao: {
    rotulo: "Atenção",
    icone: CircleAlert,
    caixa: "border-rose-200 border-l-4 border-l-rose-500 bg-rose-50 text-left text-rose-950",
    etiqueta: "text-rose-700",
  },
} as const;

function Conector() {
  return (
    <div className="flex flex-col items-center py-0.5" aria-hidden="true">
      <span className="h-3.5 w-0.5 rounded bg-cyan-700/30" />
      <span className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-cyan-700/50" />
    </div>
  );
}

function Caixa({ tipo, texto }: { tipo: NoFluxo["tipo"]; texto: string }) {
  const estilo = ESTILO[tipo];
  const Icone = estilo.icone;
  return (
    <div className={`w-full max-w-2xl rounded-lg border px-4 py-2.5 text-sm leading-6 ${estilo.caixa}`}>
      <span className={`mb-0.5 flex items-center gap-1 text-[11px] font-semibold ${estilo.etiqueta} ${tipo === "conduta" || tipo === "atencao" ? "" : "justify-center"}`}>
        <Icone className="h-3 w-3" aria-hidden="true" />
        {estilo.rotulo}
      </span>
      <TextoRico texto={texto} numeros={tipo !== "cenario"} />
    </div>
  );
}

function Ramos({ ramos }: { ramos: RamoFluxo[] }) {
  const meio = 50 / ramos.length;
  return (
    <div className="relative w-full">
      {/* Barra horizontal que liga os ramos (desktop). */}
      <span
        className="absolute top-0 hidden h-0.5 rounded bg-cyan-700/30 md:block"
        style={{ left: `${meio}%`, right: `${meio}%` }}
        aria-hidden="true"
      />
      <div
        className="grid w-full gap-3 md:[grid-template-columns:repeat(var(--ramos),minmax(0,1fr))]"
        style={{ ["--ramos" as string]: ramos.length }}
      >
        {ramos.map((ramo) => (
          <div key={ramo.rotulo} className="flex min-w-0 flex-col items-center">
            <span className="hidden h-3 w-0.5 bg-cyan-700/30 md:block" aria-hidden="true" />
            <div className="flex w-full min-w-0 flex-1 flex-col items-center rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
              <span className="w-full rounded-full bg-cyan-800 px-3 py-1.5 text-center text-xs font-semibold leading-5 text-white">
                {ramo.rotulo}
              </span>
              <Conector />
              <Passos passos={ramo.passos} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Passos({ passos }: { passos: NoFluxo[] }) {
  return (
    <div className="flex w-full flex-col items-center">
      {passos.map((no, index) => (
        <div key={`${no.tipo}-${index}`} className="flex w-full flex-col items-center">
          {index > 0 ? <Conector /> : null}
          <Caixa tipo={no.tipo} texto={no.texto} />
          {no.tipo === "decisao" ? (
            <>
              <Conector />
              <Ramos ramos={no.ramos} />
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function Fluxograma({ algoritmo }: { algoritmo: Algoritmo }) {
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <figcaption className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
          <GitBranch className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-xs font-medium text-cyan-800">Algoritmo</span>
          <span className="block text-[15px] font-semibold leading-6 text-slate-950">{algoritmo.titulo}</span>
        </span>
      </figcaption>
      <Passos passos={algoritmo.passos} />
    </figure>
  );
}
