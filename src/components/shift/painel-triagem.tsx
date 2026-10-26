import { Activity, Gauge, HeartPulse, Info, ShieldAlert } from "lucide-react";
import {
  ORDEM_PRIORIDADE,
  PRIORIDADES,
  type LeituraTriagem,
  type NivelPrioridade,
} from "@/lib/shift/triagem";
import { COR_PRIORIDADE, NOME_COR } from "./prioridade";

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

/* Prioridade sugerida, escolha manual, escores e alertas do caso. */
export default function PainelTriagem({
  leitura,
  manual,
  onManual,
}: {
  leitura: LeituraTriagem;
  manual: NivelPrioridade | null;
  onManual: (nivel: NivelPrioridade | null) => void;
}) {
  const final = manual ?? leitura.prioridade;
  const cor = final ? COR_PRIORIDADE[final] : null;

  return (
    <section id="leitura-caso" aria-label="Prioridade e alertas" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${cor ? cor.faixa : "bg-slate-100 text-slate-700"}`}>
        <div>
          <p className="text-xs font-semibold opacity-90">{manual ? "Prioridade escolhida" : "Prioridade sugerida"}</p>
          <p className="text-xl font-semibold">{final ? `${NOME_COR[final]} · ${PRIORIDADES[final].rotulo}` : "Preencha os sinais vitais"}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <span className="opacity-90">Ajustar</span>
          <select
            value={manual ?? ""}
            onChange={(event) => onManual((event.target.value || null) as NivelPrioridade | null)}
            className="h-9 rounded-lg border border-white/40 bg-white px-2 text-sm font-medium text-slate-800 outline-none"
          >
            <option value="">Usar sugestão</option>
            {ORDEM_PRIORIDADE.map((nivel) => (
              <option key={nivel} value={nivel}>
                {NOME_COR[nivel]} · {PRIORIDADES[nivel].rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3 p-4">
        {final ? <p className="text-sm leading-6 text-slate-700">{PRIORIDADES[final].descricao}</p> : null}
        {manual && leitura.prioridade && manual !== leitura.prioridade ? (
          <p className="text-xs text-slate-500">
            Sugestão pelos dados: {NOME_COR[leitura.prioridade]} · {PRIORIDADES[leitura.prioridade].rotulo}.
          </p>
        ) : null}

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
                  <span className="sr-only"> (nível {NOME_COR[item.nivel]})</span>
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
          Sugestão por regras fixas (cores no padrão de classificação de risco). Não substitui o protocolo de acolhimento do seu serviço.
        </p>
      </div>
    </section>
  );
}
