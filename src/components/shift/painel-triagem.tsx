import { Activity, Gauge, HeartPulse, Info, ShieldAlert } from "lucide-react";
import {
  ORDEM_PRIORIDADE,
  PRIORIDADES,
  type LeituraTriagem,
  type NivelPrioridade,
} from "@/lib/shift/triagem";
import { COR_PRIORIDADE, NOME_COR, NOME_GRAVIDADE } from "./prioridade";

const FAIXA_NEWS2: Record<string, string> = {
  baixo: "baixo risco",
  "baixo-medio": "parâmetro isolado extremo",
  medio: "risco intermediário",
  alto: "alto risco",
};

function Escore({ icone: Icone, nome, valor, detalhe }: { icone: typeof Gauge; nome: string; valor: string; detalhe: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-2 sm:px-3 sm:py-2.5">
      <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-slate-500">
        <Icone className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
        {nome}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-950">{valor}</p>
      <p className="text-[11px] leading-4 text-slate-500 sm:text-xs sm:leading-5">{detalhe}</p>
    </div>
  );
}

/* Prioridade escolhida pelo médico, escores e alertas do caso. O sistema
   não sugere prioridade: só lê os valores e mostra alertas. */
export default function PainelTriagem({
  leitura,
  manual,
  onManual,
}: {
  leitura: LeituraTriagem;
  manual: NivelPrioridade | null;
  onManual: (nivel: NivelPrioridade | null) => void;
}) {
  const cor = manual ? COR_PRIORIDADE[manual] : null;

  return (
    <section id="leitura-caso" aria-label="Prioridade e alertas" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className={`px-4 py-3 ${cor ? cor.faixa : "bg-slate-100 text-slate-700"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold opacity-90">Prioridade de atendimento · definida por você</p>
            <p className="text-xl font-semibold">{manual ? `${NOME_COR[manual]} · ${PRIORIDADES[manual].rotulo}` : "A definir"}</p>
          </div>
          {manual ? (
            <button
              type="button"
              onClick={() => onManual(null)}
              className="h-8 rounded-lg border border-white/40 bg-white/15 px-2.5 text-xs font-semibold transition hover:bg-white/25"
            >
              Limpar
            </button>
          ) : null}
        </div>
        <div role="radiogroup" aria-label="Escolher prioridade" className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {ORDEM_PRIORIDADE.map((nivel) => {
            const ativo = manual === nivel;
            return (
              <button
                key={nivel}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => onManual(nivel)}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition ${
                  ativo ? "border-white bg-white text-slate-900 shadow-sm" : "border-slate-300/60 bg-white/70 text-slate-700 hover:bg-white"
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${COR_PRIORIDADE[nivel].ponto}`} aria-hidden="true" />
                {NOME_COR[nivel]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {manual ? <p className="text-sm leading-6 text-slate-700">{PRIORIDADES[manual].descricao}</p> : null}

        {leitura.news2 || leitura.qsofa || leitura.indiceChoque !== null ? (
          <div className="grid grid-cols-3 gap-2">
            {leitura.news2 ? (
              <Escore
                icone={Activity}
                nome="NEWS2"
                valor={String(leitura.news2.pontos)}
                detalhe={`${FAIXA_NEWS2[leitura.news2.faixa]}${leitura.news2.completo ? "" : ` · parcial, ${leitura.news2.parametros} de 7`}`}
              />
            ) : null}
            {leitura.qsofa ? (
              <Escore
                icone={Gauge}
                nome="qSOFA"
                valor={String(leitura.qsofa.pontos)}
                detalhe={leitura.qsofa.criterios.length ? leitura.qsofa.criterios.join(" · ") : "nenhum critério"}
              />
            ) : null}
            {leitura.indiceChoque !== null ? (
              <Escore
                icone={HeartPulse}
                nome="Índice de choque"
                valor={leitura.indiceChoque.toFixed(2).replace(".", ",")}
                detalhe={leitura.indiceChoque >= 1 ? "hipoperfusão provável" : leitura.indiceChoque >= 0.9 ? "limítrofe" : "FC/PAS normal"}
              />
            ) : null}
          </div>
        ) : null}

        {leitura.alertas.length ? (
          <ul className="space-y-2">
            {leitura.alertas.map((item) => (
              <li key={item.id} className={`flex gap-2.5 rounded-xl border px-3 py-2 ${COR_PRIORIDADE[item.nivel].borda} ${COR_PRIORIDADE[item.nivel].fundo}`}>
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${COR_PRIORIDADE[item.nivel].ponto}`} aria-hidden="true" />
                <span className="min-w-0 text-sm leading-6">
                  <span className={`font-semibold ${COR_PRIORIDADE[item.nivel].texto}`}>{item.titulo}</span>
                  <span className="text-slate-700"> — {item.detalhe}</span>
                  <span className="sr-only"> (gravidade: {NOME_GRAVIDADE[item.nivel]})</span>
                </span>
              </li>
            ))}
          </ul>
        ) : leitura.preenchidos ? (
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldAlert className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Nenhum alerta pelos dados preenchidos.
          </p>
        ) : null}

        {leitura.notas.map((nota) => (
          <p key={nota} className="flex gap-2 text-xs leading-5 text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {nota}
          </p>
        ))}
        <p className="text-[11px] leading-5 text-slate-400">
          Os alertas leem os valores preenchidos por regras fixas e não classificam o paciente. A prioridade é sua, conforme o protocolo de acolhimento do seu serviço.
        </p>
      </div>
    </section>
  );
}
