"use client";

import { useState } from "react";
import { ESCALAS, TIPOS_ESCALA, gravidadeEscala, totalEscala } from "@/lib/psiquiatria/escalas.ts";
import type { TipoEscala } from "@/lib/psiquiatria/tipos.ts";
import { porMes } from "@/lib/psiquiatria/util.ts";
import { mesPadrao, novoId, type PropsAba } from "./contexto";
import { Botao, BotaoConfirmar, LinhaLista, Painel, Selo, Vazio, classeCampo } from "./ui";

export function AbaEscalas(props: PropsAba) {
  const { paciente: p, atualizar, rascunho, irPara, escalaInicial } = props;
  const [tipo, setTipo] = useState<TipoEscala>(
    TIPOS_ESCALA.includes(escalaInicial as TipoEscala) ? (escalaInicial as TipoEscala) : "PHQ-9"
  );
  const def = ESCALAS[tipo];
  const [mes, setMes] = useState(String(mesPadrao(p, rascunho)));
  const [respostas, setRespostas] = useState<Array<number | null>>(() => def.itens.map(() => null));
  const valores = respostas.map((v) => v ?? 0);
  const respondidas = respostas.filter((v) => v != null).length;
  const completo = respondidas === def.itens.length;
  const total = totalEscala(tipo, valores);

  const trocarTipo = (t: TipoEscala) => {
    setTipo(t);
    setRespostas(ESCALAS[t].itens.map(() => null));
  };

  const historico = [...porMes(p.escalas)].reverse();

  return (
    <div className="space-y-5">
      {rascunho ? (
        <Botao variante="primario" onClick={() => irPara("consulta")}>Voltar para a consulta de hoje</Botao>
      ) : null}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Painel titulo="Aplicar escala">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!completo) return;
              const itens = [...valores];
              atualizar((x) => {
                x.escalas.push({ id: novoId(), tipo, mes: Number(mes), itens, total: totalEscala(tipo, itens) });
              }, `${tipo} salvo`);
              setRespostas(def.itens.map(() => null));
            }}
          >
            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-40 flex-col gap-1 text-[13px] font-medium text-slate-600">
                Escala
                <select value={tipo} onChange={(e) => trocarTipo(e.target.value as TipoEscala)} className={classeCampo}>
                  {TIPOS_ESCALA.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="flex w-28 flex-col gap-1 text-[13px] font-medium text-slate-600">
                Mês
                <input type="number" min={0} required value={mes} onChange={(e) => setMes(e.target.value)} className={classeCampo} />
              </label>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{def.instrucao}</p>
            <div className="mt-2">
              {def.itens.map((item, i) => (
                <fieldset key={`${tipo}-${i}`} className="flex flex-col gap-2 border-b border-slate-100 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <legend className="float-left text-sm leading-6 text-slate-800">
                    {i + 1}. {item.texto}
                  </legend>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {item.opcoes.map(([valor, rotulo]) => (
                      <label key={valor} className="cursor-pointer">
                        <input
                          type="radio"
                          name={`item-${i}`}
                          checked={respostas[i] === valor}
                          onChange={() => setRespostas(respostas.map((r, j) => (j === i ? valor : r)))}
                          className="peer sr-only"
                          aria-label={rotulo}
                        />
                        <span
                          className={`inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 transition peer-checked:border-cyan-800 peer-checked:bg-cyan-800 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 ${
                            rotulo.length > 1 ? "px-3" : "w-8"
                          }`}
                        >
                          {rotulo}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="sticky bottom-[88px] lg:bottom-0 mt-1 flex items-center justify-between gap-3 border-t border-slate-100 bg-white py-3">
              <span className="text-sm text-slate-600">
                Total <b className="ml-1 text-2xl font-semibold tabular-nums text-slate-900">{total}</b>{" "}
                <span className="text-slate-500">
                  {completo ? gravidadeEscala(tipo, total, valores) : `${respondidas} de ${def.itens.length} itens`}
                </span>
              </span>
              <Botao type="submit" variante="primario" disabled={!completo}>
                Salvar {tipo}
              </Botao>
            </div>
          </form>
        </Painel>

        <Painel titulo="Aplicações">
          {historico.length ? (
            historico.map((e) => (
              <LinhaLista
                key={e.id}
                titulo={
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {e.tipo === "MDQ" ? (
                      <>MDQ: {gravidadeEscala("MDQ", e.total, e.itens)} <span className="font-normal text-slate-500">({e.total} de 13 sintomas)</span></>
                    ) : (
                      <>{e.tipo}: {e.total} <span className="font-normal text-slate-500">({gravidadeEscala(e.tipo, e.total, e.itens)})</span></>
                    )}
                    {e.tipo === "PHQ-9" && e.itens[8] > 0 ? <Selo tom="risco">Item 9 positivo</Selo> : null}
                  </span>
                }
                detalhe={`Mês ${e.mes}`}
                acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.escalas = x.escalas.filter((y) => y.id !== e.id); }, "Removido")} />}
              />
            ))
          ) : (
            <Vazio>Nenhuma aplicação ainda.</Vazio>
          )}
        </Painel>
      </div>
    </div>
  );
}
