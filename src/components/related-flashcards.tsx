"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ClinicalText from "./clinical-text";
import CopyButton from "./copy-button";
import { canonicalArea, isTechnicalSourceLabel } from "@/lib/clinical-text";

export type RelatedFlashcard = {
  id: string | number;
  area?: string | null;
  materia?: string | null;
  tipo?: string | null;
  frente?: string | null;
  verso?: string | null;
};

// "resumo" e "curto" descrevem o formato da importação, não o assunto.
function subjectLabel(card: RelatedFlashcard) {
  const materia = card.materia?.trim();
  if (materia && !isTechnicalSourceLabel(materia)) return materia;
  const area = card.area?.trim();
  if (area && !isTechnicalSourceLabel(area)) return canonicalArea(area);
  return "";
}

/* Flashcards ligados a um tema (Tópicos e Condutas). A ligação vem de
   src/lib/clinical-links.ts. */
export default function RelatedFlashcards({
  cards,
  title = "Revise com flashcards",
  description = "Cards deste tema. Tente responder antes de revelar.",
  moreHref,
}: {
  cards: RelatedFlashcard[];
  title?: string;
  description?: string;
  moreHref?: string;
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  if (cards.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        {moreHref ? (
          <Link href={moreHref} className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800 hover:text-cyan-950">
            Estudar no modo flashcards
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {cards.map((card) => {
          const id = String(card.id);
          const open = openIds.includes(id);
          const subject = subjectLabel(card);

          return (
            <article key={id} className="rounded-xl border border-slate-200 bg-white p-4">
              {subject ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {subject}
                </span>
              ) : null}

              <h4 className={`${subject ? "mt-2.5" : ""} text-[15px] font-semibold leading-6 text-slate-900`}>{card.frente}</h4>

              {open ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <ClinicalText value={card.verso} />
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-expanded={open}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {open ? "Ocultar resposta" : "Revelar resposta"}
                </button>
                {card.verso ? <CopyButton text={`${card.frente}\n\n${card.verso}`} /> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
