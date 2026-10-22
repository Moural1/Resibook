import { CircleX, Lock, ShieldCheck, Swords } from "lucide-react";
import type { ErroComum, PadraoBanca } from "@/lib/fluxos/enamed/tipos";
import { TextoComSelo, TituloComSelo } from "./selo-confirmar";

/* Cartões de erros comuns: o que confunde, a regra certa e a frase-trava. */
export function ErrosComuns({ itens }: { itens: ErroComum[] }) {
  return (
    <section aria-label="Erros comuns" className="space-y-4 rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/60 to-white p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
          <CircleX className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Erros comuns</h2>
          <p className="text-sm text-slate-500">Onde mais se erra neste tema e a trava que evita o erro</p>
        </div>
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {itens.map((item, index) => (
          <li key={`${index}-${item.titulo}`} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h3 className="text-[15px] font-semibold leading-6 text-slate-950">
              <TituloComSelo texto={item.titulo} />
            </h3>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-700">
              <TextoComSelo texto={item.texto} />
            </p>
            {item.trava ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Trava
                </p>
                <p className="mt-0.5 text-sm font-medium leading-6 text-amber-950">
                  <TextoComSelo texto={item.trava} />
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Um padrão de armadilha da banca, com como reconhecer, antídoto e exemplos. */
export function PadraoBancaCard({ padrao }: { padrao: PadraoBanca }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-start gap-3 border-b border-slate-200 p-4 md:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-900 text-sm font-bold tabular-nums text-white">
          {padrao.numero}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-6 text-slate-950">{padrao.titulo}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{padrao.frequencia}</p>
        </div>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:p-5">
        <div className="space-y-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Swords className="h-3.5 w-3.5" aria-hidden="true" />
              Como reconhecer
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {padrao.mecanismos.map((mecanismo) => (
                <li key={mecanismo} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {mecanismo}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Antídoto
            </p>
            <p className="mt-1 text-sm font-medium leading-6 text-emerald-950">{padrao.antidoto}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Exemplos de prova</p>
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {padrao.exemplos.map((exemplo, index) => (
              <li key={`${index}-${exemplo.tema}`} className="px-3.5 py-2.5">
                <p className="text-sm font-semibold text-slate-900">{exemplo.tema}</p>
                <p className="mt-0.5 text-sm leading-6 text-slate-600">
                  <span className="font-medium text-rose-700">Armadilha: </span>
                  <TextoComSelo texto={exemplo.armadilha} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
