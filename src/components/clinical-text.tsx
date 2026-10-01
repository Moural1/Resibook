import { AlertTriangle, Lightbulb } from "lucide-react";
import { parseClinicalText, type ClinicalInline } from "@/lib/clinical-text";

/* Exibe textos clínicos livres (flashcards, condutas) com títulos, listas e
   destaques reconhecidos a partir do texto bruto. Ver src/lib/clinical-text.ts. */

function Inline({ parts }: { parts: ClinicalInline[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.bold ? (
          <strong key={index} className="font-semibold text-slate-900">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

export default function ClinicalText({
  value,
  emptyText = "Sem conteúdo",
  size = "base",
}: {
  value?: string | null;
  emptyText?: string;
  size?: "base" | "lg";
}) {
  const blocks = parseClinicalText(value);
  const body = size === "lg" ? "text-[15px] leading-7" : "text-sm leading-6";

  if (!blocks.length) {
    return <p className={`${body} text-slate-400`}>{emptyText}</p>;
  }

  return (
    <div className={`clinical-text space-y-3 text-slate-700 ${body}`}>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h4
              key={index}
              className="border-b border-slate-100 pb-1.5 pt-3 text-[15px] font-semibold leading-6 text-slate-950 first:pt-0"
            >
              {block.text}
            </h4>
          );
        }

        if (block.kind === "subheading") {
          return (
            <h5 key={index} className="pt-1 text-sm font-semibold leading-6 text-cyan-900 first:pt-0">
              {block.text}
            </h5>
          );
        }

        if (block.kind === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index} className="space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-2.5">
                  {item.marker ? (
                    <span className="min-w-[1.1rem] shrink-0 font-semibold tabular-nums text-cyan-800">{item.marker}</span>
                  ) : (
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-700/70" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <Inline parts={item.content} />
                  </span>
                </li>
              ))}
            </Tag>
          );
        }

        if (block.kind === "callout") {
          const attention = block.tone === "attention";
          const Icon = attention ? AlertTriangle : Lightbulb;
          return (
            <div
              key={index}
              className={`flex gap-2.5 rounded-lg border px-3.5 py-2.5 ${
                attention ? "border-amber-200 bg-amber-50 text-amber-950" : "border-cyan-100 bg-cyan-50/70 text-cyan-950"
              }`}
            >
              <Icon className={`mt-[0.2em] h-4 w-4 shrink-0 ${attention ? "text-amber-600" : "text-cyan-700"}`} />
              <p className="min-w-0">
                <strong className="font-semibold">{block.label}:</strong>{" "}
                <Inline parts={block.content} />
              </p>
            </div>
          );
        }

        return (
          <div key={index} className="space-y-1">
            {block.lines.map((line, lineIndex) => (
              <p key={lineIndex}>
                <Inline parts={line} />
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
