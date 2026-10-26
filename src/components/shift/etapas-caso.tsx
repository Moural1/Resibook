import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { EtapaCaso } from "@/lib/shift/caso";

/* Linha do atendimento: Triagem → Alarmes → Conduta → Reavaliação → Destino. */
export default function EtapasCaso({ etapas }: { etapas: EtapaCaso[] }) {
  const proxima = etapas.find((etapa) => !etapa.feito) ?? null;
  const feitas = etapas.filter((etapa) => etapa.feito).length;

  return (
    <div className="space-y-3">
      <ol className="grid gap-2 sm:grid-cols-5" aria-label={`Etapas do atendimento: ${feitas} de ${etapas.length} concluídas`}>
        {etapas.map((etapa, index) => {
          const atual = proxima?.id === etapa.id;
          return (
            <li key={etapa.id}>
              <Link
                href={etapa.href}
                aria-current={atual ? "step" : undefined}
                className={`flex h-full items-start gap-2 rounded-xl border px-3 py-2.5 transition ${
                  etapa.feito
                    ? "border-emerald-200 bg-emerald-50"
                    : atual
                      ? "border-cyan-700 bg-white shadow-[0_4px_14px_rgba(14,116,144,0.15)]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    etapa.feito ? "bg-emerald-600 text-white" : atual ? "bg-cyan-800 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {etapa.feito ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${etapa.feito ? "text-emerald-900" : "text-slate-900"}`}>{etapa.titulo}</span>
                  <span className="block text-xs leading-5 text-slate-500">{etapa.descricao}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {proxima ? (
        <Link
          href={proxima.href}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900"
        >
          Próximo passo: {proxima.acao}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
          <Check className="h-4 w-4" />
          Atendimento completo. Passe o caso ou encerre para começar outro.
        </p>
      )}
    </div>
  );
}
