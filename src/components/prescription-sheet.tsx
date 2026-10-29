import { parsePrescriptionSheet } from "@/lib/prescription-sheet";

/* Modelo de prescrição exibido como folha de receituário: vias de uso como
   cabeçalho, itens numerados em destaque e posologia logo abaixo. O texto não
   é reescrito, só organizado. Ver src/lib/prescription-sheet.ts. */
export default function PrescriptionSheet({ value, className = "" }: { value?: string | null; className?: string }) {
  const blocks = parsePrescriptionSheet(value);

  if (!blocks.length) {
    return <p className="text-sm text-slate-400">Sem conteúdo</p>;
  }

  return (
    <div className={`space-y-3 text-[14px] leading-6 text-slate-700 ${className}`}>
      {blocks.map((block, index) => {
        if (block.kind === "route") {
          return (
            <p
              key={index}
              className="border-b border-slate-200 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-800 first:pt-0"
            >
              {block.text}
            </p>
          );
        }

        if (block.kind === "item") {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cyan-50 px-1 text-[11px] font-bold tabular-nums text-cyan-800 ring-1 ring-cyan-100">
                {block.number}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{block.title}</p>
                {block.lines.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-slate-600">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        if (block.kind === "or") {
          return (
            <p key={index} className="flex items-center gap-3 pl-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              ou
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            </p>
          );
        }

        if (block.kind === "label") {
          return (
            <p key={index} className="pt-1 text-[13px] font-semibold text-slate-900">
              {block.text}
            </p>
          );
        }

        return (
          <div key={index} className="space-y-0.5 text-slate-600">
            {block.lines.map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
