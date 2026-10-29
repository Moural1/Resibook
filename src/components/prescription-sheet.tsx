import { parsePrescriptionSheet, readablePrescriptionLine, splitItemTitle } from "@/lib/prescription-sheet";

// "-Fazer compressa..." vira item de lista com marcador discreto.
function SheetLine({ line, className = "" }: { line: string; className?: string }) {
  const bullet = line.match(/^[-–•]\s*(?=\S)/);
  const text = readablePrescriptionLine(bullet ? line.slice(bullet[0].length) : line);
  if (!bullet) return <p className={className}>{text}</p>;
  return (
    <p className={`flex gap-2 ${className}`}>
      <span className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
      <span className="min-w-0">{text}</span>
    </p>
  );
}

/* Modelo de prescrição exibido como folha de receituário: vias de uso como
   cabeçalho, itens numerados com a quantidade alinhada à direita e posologia
   logo abaixo, em caixa normal. O texto salvo não muda (copiar e imprimir
   usam o original). Ver src/lib/prescription-sheet.ts.
   paper: moldura de documento (cabeçalho e linha de assinatura). */
export default function PrescriptionSheet({
  value,
  paper = false,
  label,
  className = "",
}: {
  value?: string | null;
  paper?: boolean;
  label?: string;
  className?: string;
}) {
  const blocks = parsePrescriptionSheet(value);

  const body = blocks.length ? (
    <div className={`space-y-4 text-[14px] leading-6 text-slate-700 ${className}`}>
      {blocks.map((block, index) => {
        if (block.kind === "route") {
          return (
            <div key={index} className="flex items-center gap-3 pt-2 first:pt-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-800">{block.text}</span>
              <span className="h-px flex-1 bg-cyan-100" aria-hidden="true" />
            </div>
          );
        }

        if (block.kind === "item") {
          const { name, quantity } = splitItemTitle(readablePrescriptionLine(block.title));
          return (
            <div key={index} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1.5">
              <span className="text-sm font-semibold tabular-nums leading-6 text-slate-400">{block.number}.</span>
              <div className="min-w-0">
                <div className="flex items-end gap-2">
                  <p className="text-[15px] font-semibold leading-6 text-slate-950">{name}</p>
                  {quantity ? (
                    <>
                      <span className="mb-1.5 hidden min-w-6 flex-1 border-b border-dotted border-slate-300 sm:block" aria-hidden="true" />
                      <span className="shrink-0 text-sm leading-6 text-slate-500">{quantity}</span>
                    </>
                  ) : null}
                </div>
                {block.lines.map((line, lineIndex) => (
                  <SheetLine key={lineIndex} line={line} className="text-slate-600" />
                ))}
              </div>
            </div>
          );
        }

        if (block.kind === "or") {
          return (
            <p key={index} className="pl-8 text-xs font-medium italic text-slate-400">
              ou
            </p>
          );
        }

        if (block.kind === "label") {
          return (
            <p key={index} className="pt-1 text-[13px] font-semibold text-slate-900">
              {readablePrescriptionLine(block.text)}
            </p>
          );
        }

        return (
          <div key={index} className="space-y-0.5 text-slate-600">
            {block.lines.map((line, lineIndex) => (
              <SheetLine key={lineIndex} line={line} />
            ))}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-sm text-slate-400">Sem conteúdo</p>
  );

  if (!paper) return body;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-3 md:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Receituário</span>
        {label ? <span className="truncate text-[11px] font-medium text-slate-400">{label}</span> : null}
      </div>
      <div className="px-6 py-6 md:px-8 md:py-7">{body}</div>
      <div className="flex justify-end px-6 pb-6 md:px-8">
        <span className="w-44 border-t border-slate-300 pt-1.5 text-center text-[11px] text-slate-400">Assinatura e carimbo</span>
      </div>
    </div>
  );
}
