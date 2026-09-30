"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import acls from "../../public/landing/acls.webp";
import calculadora from "../../public/landing/calculadora.webp";
import flashcards from "../../public/landing/flashcards.webp";
import prescricao from "../../public/landing/prescricao.webp";
import topicos from "../../public/landing/topicos.webp";

type Slide = {
  id: string;
  label: string;
  title: string;
  description: string;
  image: StaticImageData;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    id: "prescricao",
    label: "Prescrição guiada",
    title: "Prescrição organizada por síndrome",
    description:
      "Sintomáticos, exames, segurança e reavaliação no mesmo plano, prontos para copiar.",
    image: prescricao,
    alt: "Tela de prescrição guiada do Resibook com o plano para dor torácica",
  },
  {
    id: "calculadoras",
    label: "Calculadoras",
    title: "Escores com interpretação e próximo passo",
    description:
      "CURB-65, qSOFA, Wells, HAS-BLED e outros, com resultado pronto para a evolução.",
    image: calculadora,
    alt: "Calculadora CURB-65 do Resibook com resultado e interpretação",
  },
  {
    id: "acls",
    label: "ACLS",
    title: "ACLS a um toque",
    description:
      "Protocolos de PCR, ritmos e drogas organizados para consulta rápida, com eBook estruturado.",
    image: acls,
    alt: "Tela de protocolos ACLS do Resibook",
  },
  {
    id: "topicos",
    label: "Tópicos",
    title: "Biblioteca clínica por área",
    description:
      "Tópicos com diagnóstico, exames, tratamento e urgência, ligados ao caso rápido.",
    image: topicos,
    alt: "Lista de tópicos clínicos de cirurgia no Resibook",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    title: "Revisão para a prova e para o plantão",
    description:
      "Flashcards por área e matéria, com marcação de difíceis e cópia para o seu acervo.",
    image: flashcards,
    alt: "Flashcards do Resibook com resposta revelada",
  },
];

export default function LandingGallery() {
  const [activeId, setActiveId] = useState(SLIDES[0].id);
  const active = SLIDES.find((slide) => slide.id === activeId) ?? SLIDES[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Telas do Resibook"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {SLIDES.map((slide) => {
          const selected = slide.id === active.id;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              id={`galeria-aba-${slide.id}`}
              aria-selected={selected}
              aria-controls="galeria-painel"
              onClick={() => setActiveId(slide.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-cyan-800 bg-cyan-800 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-900"
              }`}
            >
              {slide.label}
            </button>
          );
        })}
      </div>

      <div
        id="galeria-painel"
        role="tabpanel"
        aria-labelledby={`galeria-aba-${active.id}`}
        className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(9,26,56,0.12)]">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <Image
            key={active.id}
            src={active.image}
            alt={active.alt}
            placeholder="blur"
            sizes="(min-width: 1024px) 860px, 100vw"
            className="landing-fade h-auto w-full"
          />
        </div>
        <div className="lg:pt-4">
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#091a38]">
            {active.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {active.description}
          </p>
          <p className="mt-4 text-xs font-medium text-slate-400">
            Tela real do app, sem montagem.
          </p>
        </div>
      </div>
    </div>
  );
}
