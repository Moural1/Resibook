import { AlertTriangle, X } from "lucide-react";
import type { GraficoIntervalos, LinhaDoTempo, Quadro } from "@/lib/fluxos";

export function QuadroComparativo({ quadro }: { quadro: Quadro }) {
  const larguraMinima = Math.max(quadro.colunas.length * 170, 480);
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <figcaption className="border-b border-slate-200 px-4 py-3 text-[15px] font-semibold text-slate-950">{quadro.titulo}</figcaption>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm leading-6" style={{ minWidth: larguraMinima }}>
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {quadro.colunas.map((coluna, index) => (
                <th key={`${coluna}-${index}`} scope="col" className="px-4 py-2.5 font-semibold">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quadro.linhas.map((linha, linhaIndex) => (
              <tr key={linhaIndex} className="align-top">
                {linha.map((celula, index) =>
                  index === 0 ? (
                    <th key={index} scope="row" className="px-4 py-2.5 font-semibold text-slate-900">
                      {celula}
                    </th>
                  ) : (
                    <td key={index} className="px-4 py-2.5 text-slate-700">
                      {celula}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function LinhaDoTempoVisual({ linha }: { linha: LinhaDoTempo }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <figcaption className="mb-4 text-[15px] font-semibold text-slate-950">{linha.titulo}</figcaption>
      <ol className="relative space-y-4 border-l-2 border-cyan-100 pl-5">
        {linha.marcos.map((marco) => (
          <li key={marco.quando} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-cyan-700" aria-hidden="true" />
            <p className="text-sm font-semibold text-cyan-900">{marco.quando}</p>
            <p className="mt-0.5 text-sm leading-6 text-slate-700">{marco.texto}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function posicao(valor: number, escala: number[], logaritmica?: boolean) {
  const transformar = (v: number) => (logaritmica ? Math.log(v) : v);
  const minimo = transformar(escala[0]);
  const maximo = transformar(escala[escala.length - 1]);
  return ((transformar(valor) - minimo) / (maximo - minimo)) * 100;
}

function formatar(valor: number) {
  return String(valor).replace(".", ",");
}

export function GraficoIntervalosVisual({ grafico }: { grafico: GraficoIntervalos }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <figcaption className="mb-4 text-[15px] font-semibold text-slate-950">{grafico.titulo}</figcaption>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {grafico.grupos.map((grupo) => {
            const nulo = posicao(grupo.nulo, grupo.escala, grupo.logaritmica);
            return (
              <div key={grupo.titulo}>
                <p className="mb-2 text-sm font-medium text-slate-800">{grupo.titulo}</p>
                <div className="space-y-2">
                  {grupo.itens.map((item) => {
                    const significativo = item.superior < grupo.nulo || item.inferior > grupo.nulo;
                    const inicio = posicao(item.inferior, grupo.escala, grupo.logaritmica);
                    const fim = posicao(item.superior, grupo.escala, grupo.logaritmica);
                    const ponto = posicao(item.ponto, grupo.escala, grupo.logaritmica);
                    return (
                      <div key={item.rotulo} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-center gap-3">
                        <span className="text-xs leading-5 text-slate-600">{item.rotulo}</span>
                        <div className="relative h-6">
                          <span className="absolute inset-y-0 border-l-2 border-dashed border-rose-500" style={{ left: `${nulo}%` }} aria-hidden="true" />
                          <span
                            className={`absolute top-1/2 h-0.5 -translate-y-1/2 ${significativo ? "bg-cyan-800" : "bg-slate-400"}`}
                            style={{ left: `${inicio}%`, width: `${fim - inicio}%` }}
                          />
                          <span
                            className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm ${significativo ? "bg-cyan-800" : "bg-slate-500"}`}
                            style={{ left: `${ponto}%` }}
                          />
                          <span className="sr-only">{significativo ? "Significativo a 5%" : "Não significativo"}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-3">
                    <span />
                    <div className="relative h-4 border-t border-slate-200 text-[11px] text-slate-500">
                      {grupo.escala.map((marca) => (
                        <span key={marca} className="absolute top-0.5 -translate-x-1/2" style={{ left: `${posicao(marca, grupo.escala, grupo.logaritmica)}%` }}>
                          {formatar(marca)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          {grafico.leitura.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

export function OQueCai({ itens }: { itens: string[] }) {
  return (
    <ol className="grid gap-2.5 md:grid-cols-2">
      {itens.map((item, index) => (
        <li key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-semibold text-cyan-800">
            {index + 1}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Pegadinhas({ itens }: { itens: string[] }) {
  return (
    <ul className="grid gap-2.5 md:grid-cols-2">
      {itens.map((item) => (
        <li key={item} className="flex gap-2.5 rounded-lg border border-rose-100 bg-rose-50/70 px-3.5 py-3 text-sm leading-6 text-rose-950">
          <X className="mt-1 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PontoDeRevisao({ itens }: { itens: string[] }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">Ponto que mais confunde</p>
        {itens.map((item) => (
          <p key={item} className="mt-1 text-sm leading-6">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
