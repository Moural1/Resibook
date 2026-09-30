"use client";

import { ADESAO } from "@/lib/psiquiatria/catalogos.ts";
import { alertas } from "@/lib/psiquiatria/alertas.ts";
import { NIVEIS_CSSRS } from "@/lib/psiquiatria/cssrs.ts";
import { ESCALAS } from "@/lib/psiquiatria/escalas.ts";
import { medicacoesAtivas } from "@/lib/psiquiatria/farmacologia.ts";
import type { NivelRiscoCssrs, TipoEscala } from "@/lib/psiquiatria/tipos.ts";
import { porMes, ultimo } from "@/lib/psiquiatria/util.ts";
import type { PropsAba } from "./contexto";
import { LinhaDoTempo } from "./graficos";
import { Botao, CartaoAlerta, Painel, Selo, Vazio, type TomSelo } from "./ui";

export const TOM_RISCO: Record<NivelRiscoCssrs, TomSelo> = {
  nenhum: "ok",
  baixo: "atencao",
  moderado: "forte-atencao",
  alto: "forte-risco",
};

export function AbaResumo({ paciente: p, irPara }: PropsAba) {
  const lista = alertas(p);
  const ativos = medicacoesAtivas(p);
  const ultimoCssrs = ultimo(porMes(p.cssrs));
  const ultimaConsulta = ultimo(porMes(p.consultas));

  const escala = (tipo: TipoEscala) => {
    const apl = porMes(p.escalas.filter((e) => e.tipo === tipo));
    const u = apl[apl.length - 1];
    const ant = apl[apl.length - 2];
    if (!u) return <p className="py-1.5 text-sm text-slate-500">{tipo}: sem aplicação</p>;
    const d = ant ? u.total - ant.total : null;
    return (
      <div className="flex items-baseline gap-3 py-1.5">
        <span className="w-10 text-2xl font-semibold tabular-nums text-slate-900">{u.total}</span>
        <span className="text-sm text-slate-700">
          <b className="font-medium">{tipo}</b>, {ESCALAS[tipo].gravidade(u.total, u.itens)}
          <span className="block text-xs text-slate-500">
            mês {u.mes}
            {d == null ? "" : `, ${d < 0 ? `caiu ${-d}` : d > 0 ? `subiu ${d}` : "estável"} desde o mês ${ant.mes}`}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Painel titulo="Onde investigar hoje">
          {lista.length ? (
            <div className="space-y-2">
              {lista.map((a, i) => (
                <CartaoAlerta key={`${a.regra}-${i}`} alerta={a} onAcao={() => irPara("risco")} />
              ))}
            </div>
          ) : (
            <Vazio>Nenhum alerta. Preencha genograma, ecomapa e escalas para o app sugerir caminhos.</Vazio>
          )}
        </Painel>

        <div className="space-y-5">
          <Painel titulo="Risco de suicídio" acoes={<Botao pequeno onClick={() => irPara("risco")}>Abrir avaliação</Botao>}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
              <span className="text-slate-600">C-SSRS{ultimoCssrs ? `, mês ${ultimoCssrs.mes}` : ""}</span>
              {ultimoCssrs ? (
                <Selo tom={TOM_RISCO[ultimoCssrs.nivel]}>{NIVEIS_CSSRS[ultimoCssrs.nivel].rotulo}</Selo>
              ) : (
                <span className="text-slate-500">nunca aplicado</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-slate-600">Plano de segurança</span>
              <span className="text-slate-500">{p.plano ? `revisado no mês ${p.plano.mes}` : "não registrado"}</span>
            </div>
          </Painel>

          <Painel titulo="Medicação atual">
            {ativos.length ? (
              ativos.map((m) => {
                const meses = p.atual - m.inicio;
                return (
                  <div key={m.id} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
                    <span>
                      <b className="font-medium text-slate-900">{m.nome}</b> <span className="text-slate-600">{m.dose}</span>
                    </span>
                    <span className="text-slate-500">
                      {meses < 1 ? "iniciada neste mês" : `há ${meses} ${meses === 1 ? "mês" : "meses"}`}
                    </span>
                  </div>
                );
              })
            ) : (
              <Vazio>Nenhuma em uso.</Vazio>
            )}
          </Painel>

          <Painel titulo="Escalas">
            {escala("PHQ-9")}
            {escala("GAD-7")}
            {p.escalas.some((e) => e.tipo === "YMRS") ? escala("YMRS") : null}
          </Painel>

          <Painel titulo="Última consulta">
            {ultimaConsulta ? (
              <>
                <p className="text-sm leading-6 text-slate-800">{ultimaConsulta.combinado || "Nada combinado."}</p>
                <p className="mt-1.5 text-xs text-slate-500">
                  Mês {ultimaConsulta.mes}
                  {ultimaConsulta.adesao ? `. Adesão ${ADESAO[ultimaConsulta.adesao].toLowerCase()}` : ""}
                  {ultimaConsulta.efeitos.length ? `. Efeitos: ${ultimaConsulta.efeitos.join(", ").toLowerCase()}` : ""}
                </p>
              </>
            ) : (
              <Vazio>Nenhuma consulta registrada.</Vazio>
            )}
          </Painel>
        </div>
      </div>

      <Painel titulo="Linha do tempo">
        <LinhaDoTempo paciente={p} />
      </Painel>
    </div>
  );
}
