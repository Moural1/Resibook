import { CircleCheck, Lock, ShieldAlert, Target, TriangleAlert, X } from "lucide-react";
import type { GraficoIntervalos, LinhaDoTempo, Quadro } from "@/lib/fluxos";
import { separarTitulo, separarVeredito } from "@/lib/fluxos/destaque";
import { separarConfirmar } from "@/lib/fluxos/enamed/confirmar";
import { SeloConfirmar, TextoComSelo, TituloComSelo } from "./selo-confirmar";
import TextoRico from "./texto-rico";

const ETIQUETAS = new Set(["URGÊNCIA", "IMAGEM"]);

/* Rótulo da linha: "⚠ TCE · URGÊNCIA · IMAGEM" → selo + "TCE" + etiquetas. */
function RotuloLinha({ texto }: { texto: string }) {
  const { confirmar, texto: limpo } = separarConfirmar(texto);
  const partes = limpo.split(" · ");
  const etiquetas = partes.filter((parte) => ETIQUETAS.has(parte));
  const nome = partes.filter((parte) => !ETIQUETAS.has(parte)).join(" · ");
  const subitem = nome.startsWith("↳");
  return (
    <>
      <span className={subitem ? "font-medium text-slate-600" : undefined}>{nome}</span>
      {confirmar || etiquetas.length ? (
        <span className="mt-1 flex flex-wrap gap-1">
          {confirmar ? <SeloConfirmar /> : null}
          {etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-slate-600">
              {etiqueta === "URGÊNCIA" ? "Urgência" : "Imagem"}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
}

/* Linhas cujo rótulo está vazio ou começa com "↳" continuam a linha de cima
   (ex.: uma norma com vários pontos, uma aposta com subitens). */
function agruparLinhas(linhas: string[][]) {
  const grupos: string[][][] = [];
  for (const linha of linhas) {
    const continua = grupos.length > 0 && (linha[0] === "" || linha[0].startsWith("↳"));
    if (continua) grupos[grupos.length - 1].push(linha);
    else grupos.push([linha]);
  }
  return grupos;
}

/* No celular, cada subitem ("↳ …") abre um trecho; linhas sem rótulo
   acrescentam valores às colunas do trecho atual. */
function segmentar(grupo: string[][]) {
  const segmentos: { rotulo: string; colunas: string[][] }[] = [];
  for (const [rotulo, ...valores] of grupo) {
    if (!segmentos.length || rotulo) segmentos.push({ rotulo, colunas: valores.map(() => []) });
    const atual = segmentos[segmentos.length - 1];
    valores.forEach((valor, index) => {
      if (valor) (atual.colunas[index] ??= []).push(valor);
    });
  }
  return segmentos;
}

/* Célula com destaque; "Trava: …" vira uma frase-trava em evidência. */
function CelulaQuadro({ texto }: { texto: string }) {
  const trava = /^Trava:\s*/.exec(texto);
  if (!trava) return <TextoComSelo texto={texto} />;
  return (
    <span className="inline-flex items-start gap-1.5 font-medium text-amber-900">
      <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-600" aria-label="Trava" />
      <span>
        <TextoComSelo texto={texto.slice(trava[0].length)} />
      </span>
    </span>
  );
}

/* Quadro comparativo: tabela no desktop, um cartão por linha no celular. */
export function QuadroComparativo({ quadro }: { quadro: Quadro }) {
  const [rotuloColuna, ...colunas] = quadro.colunas;
  const muitasColunas = quadro.colunas.length >= 4;
  const grupos = agruparLinhas(quadro.linhas);

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <figcaption className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-[15px] font-semibold text-slate-950">
        <span className="h-4 w-1 shrink-0 rounded-full bg-cyan-700" aria-hidden="true" />
        <span>
          <TituloComSelo texto={quadro.titulo} />
        </span>
      </figcaption>

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm leading-6" style={{ minWidth: muitasColunas ? 760 : undefined }}>
          <thead>
            <tr className="bg-cyan-900 text-white">
              {quadro.colunas.map((coluna, index) => (
                <th
                  key={`${coluna}-${index}`}
                  scope="col"
                  className={`px-4 py-2.5 text-[13px] font-semibold ${index === 0 ? "w-[22%] min-w-[140px]" : ""}`}
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          {grupos.map((grupo, grupoIndex) => (
            <tbody key={grupoIndex} className={grupoIndex % 2 ? "bg-slate-50/70" : "bg-white"}>
              {grupo.map((linha, linhaIndex) => (
                <tr key={linhaIndex} className={`align-top ${linhaIndex > 0 ? "border-t border-dashed border-slate-200" : ""}`}>
                  {linha.map((celula, index) =>
                    index === 0 ? (
                      <th key={index} scope="row" className={`border-r border-slate-200 px-4 font-semibold text-slate-900 ${linhaIndex > 0 ? "py-2" : "py-3"}`}>
                        {celula ? <RotuloLinha texto={celula} /> : null}
                      </th>
                    ) : (
                      <td key={index} className={`border-r border-slate-100 px-4 text-slate-700 last:border-r-0 ${linhaIndex > 0 ? "py-2" : "py-3"}`}>
                        <CelulaQuadro texto={celula} />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* Celular: linhas sem rótulo somam-se à coluna correspondente da linha de cima. */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {grupos.map((grupo, grupoIndex) => (
          <li key={grupoIndex} className="space-y-3 px-4 py-3">
            {segmentar(grupo).map((segmento, segmentoIndex) => (
              <div key={segmentoIndex}>
                {segmento.rotulo ? (
                  <p className="text-sm font-semibold text-slate-950">
                    {rotuloColuna && segmentoIndex === 0 ? <span className="font-normal text-slate-500">{rotuloColuna}: </span> : null}
                    <RotuloLinha texto={segmento.rotulo} />
                  </p>
                ) : null}
                <dl className={`space-y-2 ${segmento.rotulo ? "mt-2" : ""}`}>
                  {segmento.colunas.map((valores, index) =>
                    valores.length ? (
                      <div key={index} className="rounded-lg bg-slate-50 px-3 py-2">
                        {colunas[index] ? <dt className="text-xs font-semibold text-cyan-800">{colunas[index]}</dt> : null}
                        {valores.map((valor, valorIndex) => (
                          <dd key={valorIndex} className={`text-sm leading-6 text-slate-700 ${valorIndex > 0 ? "mt-1.5 border-t border-dashed border-slate-200 pt-1.5" : ""}`}>
                            <CelulaQuadro texto={valor} />
                          </dd>
                        ))}
                      </div>
                    ) : null
                  )}
                </dl>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function LinhaDoTempoVisual({ linha }: { linha: LinhaDoTempo }) {
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <figcaption className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-slate-950">
        <span className="h-4 w-1 rounded-full bg-cyan-700" aria-hidden="true" />
        {linha.titulo}
      </figcaption>
      <ol className="relative space-y-3 border-l-2 border-cyan-100 pl-5">
        {linha.marcos.map((marco) => (
          <li key={marco.quando} className="relative rounded-lg bg-slate-50 px-3.5 py-2.5">
            <span className="absolute -left-[27px] top-3.5 h-3 w-3 rounded-full border-2 border-white bg-cyan-700" aria-hidden="true" />
            <p className="text-sm font-semibold text-cyan-900">{marco.quando}</p>
            <p className="mt-0.5 text-sm leading-6 text-slate-700">
              <TextoRico texto={marco.texto} />
            </p>
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
      <figcaption className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-slate-950">
        <span className="h-4 w-1 rounded-full bg-cyan-700" aria-hidden="true" />
        {grafico.titulo}
      </figcaption>
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

function CabecalhoPainel({ icone: Icone, titulo, subtitulo, tom }: { icone: typeof Target; titulo: string; subtitulo: string; tom: "cyan" | "rose" }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          tom === "cyan" ? "bg-cyan-800 text-white" : "bg-rose-600 text-white"
        }`}
      >
        <Icone className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-950">{titulo}</h2>
        <p className="text-sm text-slate-500">{subtitulo}</p>
      </div>
    </div>
  );
}

export function OQueCai({ itens }: { itens: string[] }) {
  return (
    <section aria-label="O que cai" className="space-y-4 rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-white p-4 md:p-5">
      <CabecalhoPainel icone={Target} titulo="O que cai" subtitulo={`${itens.length} pontos que a banca cobra`} tom="cyan" />
      <ol className="grid gap-3 md:grid-cols-2">
        {itens.map((item, index) => {
          const { titulo, corpo } = separarTitulo(item);
          return (
            <li key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-800 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 text-sm leading-6 text-slate-700">
                {titulo ? <p className="font-semibold text-slate-950">{titulo}</p> : null}
                <p>
                  <TextoRico texto={titulo ? corpo.charAt(0).toUpperCase() + corpo.slice(1) : corpo} />
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Pegadinhas({ itens }: { itens: string[] }) {
  return (
    <section aria-label="Pegadinhas" className="space-y-4 rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/70 to-white p-4 md:p-5">
      <CabecalhoPainel icone={ShieldAlert} titulo="Pegadinhas" subtitulo="Como a banca tenta te pegar" tom="rose" />
      <ul className="grid gap-3 md:grid-cols-2">
        {itens.map((item) => {
          const { enunciado, veredito } = separarVeredito(item);
          return (
            <li key={item} className="relative overflow-hidden rounded-xl border border-rose-100 bg-white p-3.5 pl-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-rose-500" aria-hidden="true" />
              <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <X className="h-3.5 w-3.5" />
                Armadilha
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-800">
                <TextoRico texto={enunciado} />
                {veredito ? (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-rose-600 px-2 py-0.5 align-middle text-[11px] font-semibold text-white">
                    {veredito}
                  </span>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
        Em verde, a resposta certa quando a pegadinha já traz a correção.
      </p>
    </section>
  );
}

export function PontoDeRevisao({ itens }: { itens: string[] }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-950">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">Ponto que mais confunde</p>
        {itens.map((item) => (
          <p key={item} className="mt-1 text-sm leading-6">
            <TextoRico texto={item} />
          </p>
        ))}
      </div>
    </div>
  );
}
