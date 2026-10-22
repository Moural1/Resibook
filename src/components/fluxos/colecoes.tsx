import Link from "next/link";
import { BookOpenCheck, Workflow } from "lucide-react";

const COLECOES = [
  { id: "temas", href: "/fluxos", rotulo: "Temas por área", detalhe: "Algoritmos, o que cai e pegadinhas", icone: Workflow },
  { id: "enamed", href: "/fluxos/enamed", rotulo: "Dossiê ENAMED", detalhe: "Tabelas, travas, apostas e normativo", icone: BookOpenCheck },
] as const;

/* Alterna entre as duas coleções dos Fluxogramas. */
export default function ColecoesFluxos({ ativa }: { ativa: (typeof COLECOES)[number]["id"] }) {
  return (
    <nav aria-label="Coleções de fluxogramas" className="grid gap-2 sm:grid-cols-2">
      {COLECOES.map((colecao) => {
        const atual = colecao.id === ativa;
        const Icone = colecao.icone;
        return (
          <Link
            key={colecao.id}
            href={colecao.href}
            aria-current={atual ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
              atual
                ? "border-cyan-800 bg-cyan-900 text-white shadow-[0_6px_18px_rgba(22,78,99,0.18)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-cyan-700/40"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${atual ? "bg-white/10" : "bg-cyan-50 text-cyan-800"}`}>
              <Icone className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${atual ? "text-white" : "text-slate-900"}`}>{colecao.rotulo}</span>
              <span className={`block text-xs ${atual ? "text-[#a5f3fc]" : "text-slate-500"}`}>{colecao.detalhe}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
