import { Check, CheckCheck } from "lucide-react";
import type { SinalAlarme } from "@/lib/shift/queixas";
import { COR_PRIORIDADE, NOME_COR } from "./prioridade";

/* Sinais de alarme da queixa como botões: marcar um sobe a prioridade. */
export default function SinaisAlarme({
  sinais,
  marcados,
  revisados,
  onAlternar,
  onNenhum,
}: {
  sinais: SinalAlarme[];
  marcados: string[];
  revisados: boolean;
  onAlternar: (id: string) => void;
  onNenhum: () => void;
}) {
  return (
    <div id="sinais-alarme" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sinais de alarme</p>
          <p className="mt-0.5 text-xs text-slate-500">Toque nos que estão presentes.</p>
        </div>
        <button
          type="button"
          onClick={onNenhum}
          aria-pressed={revisados && marcados.length === 0}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ${
            revisados && marcados.length === 0
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Nenhum presente
        </button>
      </div>
      <ul className="mt-3 grid gap-2">
        {sinais.map((sinal) => {
          const ativo = marcados.includes(sinal.id);
          const cor = COR_PRIORIDADE[sinal.nivel];
          return (
            <li key={sinal.id}>
              <button
                type="button"
                aria-pressed={ativo}
                onClick={() => onAlternar(sinal.id)}
                className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm leading-5 transition ${
                  ativo ? `${cor.borda} ${cor.fundo}` : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    ativo ? `${cor.ponto} border-transparent text-white` : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {ativo ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={ativo ? `font-semibold ${cor.texto}` : "text-slate-800"}>{sinal.texto}</span>
                  {ativo && sinal.acao ? <span className="mt-0.5 block text-xs text-slate-600">{sinal.acao}</span> : null}
                </span>
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cor.ponto}`} title={`Sugere ${NOME_COR[sinal.nivel].toLowerCase()}`} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
