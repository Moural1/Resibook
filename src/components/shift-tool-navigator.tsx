"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ClipboardCheck,
  FileText,
  Gauge,
  ListChecks,
  LogOut,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const SHIFT_TOOLS = [
  { href: "/plantao", label: "Central", icon: Activity },
  { href: "/plantao/roteiro-caso", label: "Roteiro", icon: Workflow },
  { href: "/caso-rapido", label: "Caso rápido", icon: Gauge },
  { href: "/plantao/sbar", label: "SBAR", icon: FileText },
  { href: "/plantao/pendencias", label: "Pendências", icon: ListChecks },
  { href: "/plantao/checklist-risco", label: "Risco", icon: ShieldCheck },
  {
    href: "/plantao/prescricao-guiada",
    label: "Plano",
    icon: ClipboardCheck,
  },
  { href: "/plantao/alta-segura", label: "Alta", icon: LogOut },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function ShiftToolNavigator() {
  const pathname = usePathname();
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const isShiftTool =
    pathname === "/caso-rapido" ||
    (pathname.startsWith("/plantao/") && pathname !== "/plantao");

  useEffect(() => {
    if (!isShiftTool) return;

    const content = document.querySelector<HTMLElement>("main > div");
    if (!content) return;

    const node = document.createElement("div");
    node.dataset.shiftToolNavigator = "true";
    content.insertBefore(node, content.firstChild);
    setMountNode(node);

    return () => {
      setMountNode(null);
      node.remove();
    };
  }, [isShiftTool, pathname]);

  if (!mountNode || !isShiftTool) return null;

  return createPortal(
    <nav
      aria-label="Ferramentas do plantão"
      className="sticky top-[73px] z-20 mb-4 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl print:hidden"
    >
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
        {SHIFT_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = isActive(pathname, tool.href);

          return (
            <Link
              key={tool.href}
              href={tool.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tool.label}
            </Link>
          );
        })}
      </div>
    </nav>,
    mountNode
  );
}
