"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type Filter = "Todos" | "Consulta" | "Evolução" | "Exame" | "Prescrição" | "Problema" | "Retorno";

const FILTERS: Filter[] = [
  "Todos",
  "Consulta",
  "Evolução",
  "Exame",
  "Prescrição",
  "Problema",
  "Retorno",
];

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function PatientTimelineControls() {
  const pathname = usePathname();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [section, setSection] = useState<HTMLElement | null>(null);
  const [filter, setFilter] = useState<Filter>("Todos");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const isRecord = /^\/pacientes\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (!isRecord) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const heading = Array.from(document.querySelectorAll("main h2")).find(
        (item) => normalize(item.textContent) === "linha do tempo clinica"
      );
      const target = heading?.closest<HTMLElement>("section");
      if (!target && attempts < 30) return;
      window.clearInterval(timer);
      if (!target) return;

      const header = heading?.parentElement?.parentElement;
      const node = document.createElement("div");
      node.dataset.patientTimelineControls = "true";
      header?.after(node);
      setSection(target);
      setMountNode(node);
    }, 150);

    return () => {
      window.clearInterval(timer);
      setMountNode((current) => {
        current?.remove();
        return null;
      });
      setSection(null);
    };
  }, [isRecord, pathname]);

  useEffect(() => {
    if (!section) return;
    const targetSection = section;
    let observer: MutationObserver | null = null;

    function apply() {
      observer?.disconnect();
      const cards = Array.from(
        targetSection.querySelectorAll<HTMLElement>("article")
      );
      const nextCounts: Record<string, number> = { Todos: cards.length };

      targetSection
        .querySelectorAll<HTMLElement>("[data-timeline-day-separator]")
        .forEach((item) => item.remove());

      let previousDay = "";
      for (const card of cards) {
        const badge = Array.from(card.querySelectorAll("span")).find((item) =>
          FILTERS.slice(1).includes((item.textContent?.trim() || "") as Filter)
        );
        const type = badge?.textContent?.trim() || "";
        nextCounts[type] = (nextCounts[type] || 0) + 1;
        const visible = filter === "Todos" || type === filter;
        card.style.display = visible ? "" : "none";
        if (!visible) continue;

        const dateText =
          Array.from(card.querySelectorAll("span"))
            .map((item) => item.textContent?.trim() || "")
            .find((item) => /^\d{2}\/\d{2}\/\d{2,4}/.test(item)) || "Sem data";
        const day = dateText.split(",")[0].split(" ")[0];
        if (day !== previousDay) {
          const separator = document.createElement("div");
          separator.dataset.timelineDaySeparator = "true";
          separator.className =
            "ml-10 flex items-center gap-3 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500";
          separator.innerHTML = `<span>${day}</span><span class="h-px flex-1 bg-slate-200"></span>`;
          card.before(separator);
          previousDay = day;
        }
      }
      setCounts(nextCounts);
      observer?.observe(targetSection, { childList: true, subtree: true });
    }

    observer = new MutationObserver(apply);
    apply();
    return () => observer?.disconnect();
  }, [filter, section]);

  if (!mountNode || !isRecord) return null;

  return createPortal(
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 print:hidden">
      {FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setFilter(item)}
          className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
            filter === item
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {item}
          <span className={filter === item ? "text-slate-300" : "text-slate-400"}>
            {counts[item] || 0}
          </span>
        </button>
      ))}
    </div>,
    mountNode
  );
}
