import { destacar } from "@/lib/fluxos/destaque";

/* Texto dos fluxogramas com números de prova, armadilhas e correções em
   destaque. Exibição apenas. */
export default function TextoRico({ texto, numeros = true }: { texto: string; numeros?: boolean }) {
  return (
    <>
      {destacar(texto, { numeros }).map((trecho, index) => {
        if (trecho.tipo === "numero") {
          return (
            <span key={index} className="whitespace-nowrap font-semibold tabular-nums text-slate-950">
              {trecho.texto}
            </span>
          );
        }
        if (trecho.tipo === "armadilha") {
          return (
            <span key={index} className="rounded bg-rose-100 px-1 text-rose-800">
              {trecho.texto}
            </span>
          );
        }
        if (trecho.tipo === "correcao") {
          return (
            <span key={index} className="whitespace-nowrap rounded bg-emerald-50 px-1 font-medium text-emerald-800">
              ✓ {trecho.texto.slice(1, -1)}
            </span>
          );
        }
        return <span key={index}>{trecho.texto}</span>;
      })}
    </>
  );
}
