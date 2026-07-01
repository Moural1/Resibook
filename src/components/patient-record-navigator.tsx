"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileText,
  FlaskConical,
  ListChecks,
  NotebookPen,
  Pill,
  Stethoscope,
} from "lucide-react";

type RecordSection = {
  id: string;
  label: string;
  heading: string;
  icon: React.ComponentType<{ className?: string }>;
};

const RECORD_SECTIONS: RecordSection[] = [
  {
    id: "resumo",
    label: "Resumo",
    heading: "Prontuário clínico",
    icon: Stethoscope,
  },
  {
    id: "linha-do-tempo",
    label: "Linha do tempo",
    heading: "Linha do tempo clínica",
    icon: Activity,
  },
  {
    id: "consulta",
    label: "Nova consulta",
    heading: "Nova consulta",
    icon: NotebookPen,
  },
  {
    id: "problemas",
    label: "Problemas",
    heading: "Problemas do paciente",
    icon: ListChecks,
  },
  {
    id: "retornos",
    label: "Retornos",
    heading: "Retornos",
    icon: CalendarClock,
  },
  {
    id: "exames",
    label: "Exames",
    heading: "Exames do paciente",
    icon: FlaskConical,
  },
  {
    id: "evolucao",
    label: "Evolução",
    heading: "Nova evolução / anotação",
    icon: FileText,
  },
  {
    id: "prescricoes",
    label: "Prescrições",
    heading: "Prescrições vinculadas",
    icon: Pill,
  },
];

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function PatientRecordNavigator() {
  const pathname = usePathname();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [patientName, setPatientName] = useState("Prontuário");
  const [availableSections, setAvailableSections] = useState<RecordSection[]>([]);
  const [activeSection, setActiveSection] = useState("resumo");
  const initialSectionHandled = useRef(false);
  const patientId = useMemo(() => pathname.split("/")[2] || "", [pathname]);
  const isPatientRecord = /^\/pacientes\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (!isPatientRecord) return;

    const content = document.querySelector<HTMLElement>("main > div");
    if (!content) return;
    initialSectionHandled.current = false;

    const node = document.createElement("div");
    node.dataset.patientRecordNavigator = "true";
    content.insertBefore(node, content.firstChild);
    setMountNode(node);

    return () => {
      setMountNode(null);
      node.remove();
    };
  }, [isPatientRecord, pathname]);

  useEffect(() => {
    if (!mountNode) return;

    let intersectionObserver: IntersectionObserver | null = null;
    let attempts = 0;

    function mapRecord() {
      const patientHeading = Array.from(document.querySelectorAll("h1")).find(
        (heading) => heading.closest("main")
      );
      if (patientHeading?.textContent?.trim()) {
        setPatientName(patientHeading.textContent.trim());
      }

      const headings = Array.from(
        document.querySelectorAll<HTMLElement>("main h1, main h2")
      );
      const mapped = RECORD_SECTIONS.flatMap((definition) => {
        const heading =
          definition.id === "resumo"
            ? patientHeading
            : headings.find(
                (item) =>
                  normalize(item.textContent) === normalize(definition.heading)
              );
        const section = heading?.closest<HTMLElement>("section");
        if (!section) return [];
        section.id = `prontuario-${definition.id}`;
        section.style.scrollMarginTop = "150px";
        return [{ definition, section }];
      });

      setAvailableSections(mapped.map((item) => item.definition));

      if (!initialSectionHandled.current) {
        const requestedSection = new URLSearchParams(window.location.search).get(
          "secao"
        );
        const requestedTarget = mapped.find(
          (item) => item.definition.id === requestedSection
        );
        if (requestedTarget) {
          initialSectionHandled.current = true;
          window.requestAnimationFrame(() =>
            requestedTarget.section.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          );
        }
      }

      intersectionObserver?.disconnect();
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (!visible) return;
          setActiveSection(
            visible.target.id.replace("prontuario-", "") || "resumo"
          );
        },
        { rootMargin: "-150px 0px -62% 0px", threshold: [0, 0.05] }
      );
      mapped.forEach((item) => intersectionObserver?.observe(item.section));

      return mapped.length;
    }

    const timer = window.setInterval(() => {
      attempts += 1;
      const count = mapRecord();
      if (count >= RECORD_SECTIONS.length - 1 || attempts >= 30) {
        window.clearInterval(timer);
      }
    }, 150);

    return () => {
      window.clearInterval(timer);
      intersectionObserver?.disconnect();
    };
  }, [mountNode]);

  function navigateTo(id: string) {
    document
      .getElementById(`prontuario-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!mountNode || !isPatientRecord) return null;

  return createPortal(
    <div className="sticky top-[73px] z-20 mb-4 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden">
      <div className="flex items-center gap-2">
        <Link
          href="/pacientes"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Voltar aos pacientes"
          title="Voltar aos pacientes"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => navigateTo("resumo")}
          className="hidden min-w-0 shrink-0 px-2 text-left sm:block"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Prontuário longitudinal
          </span>
          <span className="block max-w-[190px] truncate text-sm font-semibold text-slate-950">
            {patientName}
          </span>
        </button>

        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {availableSections.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <Link
          href={`/prescricao?patient_id=${encodeURIComponent(patientId)}&paciente_nome=${encodeURIComponent(
            patientName
          )}`}
          className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 md:inline-flex"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Prescrever
        </Link>

        <button
          type="button"
          onClick={() => navigateTo("consulta")}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-cyan-700 px-3 text-xs font-semibold text-white transition hover:bg-cyan-800"
        >
          <NotebookPen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nova consulta</span>
          <span className="sm:hidden">Consulta</span>
        </button>
      </div>
    </div>,
    mountNode
  );
}

