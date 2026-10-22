import { TriangleAlert } from "lucide-react";
import { separarConfirmar } from "@/lib/fluxos/enamed/confirmar";
import TextoRico from "./texto-rico";

/* Conteúdo ainda não reconferido com a fonte original. */
export function SeloConfirmar({ className = "" }: { className?: string }) {
  return (
    <span
      title="Item ainda não reconferido com a fonte. Confirme antes de memorizar."
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-1.5 py-px align-middle text-[11px] font-semibold leading-4 text-amber-800 ${className}`}
    >
      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
      A confirmar
    </span>
  );
}

/* Texto com destaque que troca o "⚠" inicial pelo selo. */
export function TextoComSelo({ texto, numeros = true }: { texto: string; numeros?: boolean }) {
  const { confirmar, texto: limpo } = separarConfirmar(texto);
  return (
    <>
      {confirmar ? <SeloConfirmar className="mr-1.5" /> : null}
      <TextoRico texto={limpo} numeros={numeros} />
    </>
  );
}

/* Título simples (sem destaque de números) com o selo quando houver "⚠". */
export function TituloComSelo({ texto }: { texto: string }) {
  const { confirmar, texto: limpo } = separarConfirmar(texto);
  return (
    <>
      {limpo}
      {confirmar ? <SeloConfirmar className="ml-2" /> : null}
    </>
  );
}
