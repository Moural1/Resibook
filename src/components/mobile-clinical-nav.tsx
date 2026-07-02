"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  ClipboardList,
  Gauge,
  Menu,
  Search,
  Siren,
  Stethoscope,
} from "lucide-react";

const HIDDEN_PATHS = [
  "/login",
  "/signup",
  "/register",\n  "/redefinir-senha",
  "/aceite-legal",
  "/termos",
  "/privacidade",
];

export default function MobileClinicalNav() {
  const pathname = usePathname();
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const hidden = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const items = [
    { href: "/plantao", label: "Plantão", icon: Activity },
    { href: "/caso-rapido", label: "Caso", icon: Gauge },
    isGuest
      ? { href: "/topicos", label: "Tópicos", icon: Stethoscope }
      : { href: "/condutas", label: "Condutas", icon: Siren },
    { href: "/prescricao", label: "Prescrição", icon: ClipboardList },
  ];

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsGuest(
        data.session?.user?.email?.trim().toLowerCase() ===
          "convidado@resibook.com"
      );
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hidden) return;

    const trigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Abrir menu"]'
    );
    if (!trigger) return;

    menuTriggerRef.current = trigger;
    const previousDisplay = trigger.style.display;
    trigger.style.display = "none";

    return () => {
      trigger.style.display = previousDisplay;
      menuTriggerRef.current = null;
    };
  }, [hidden, pathname]);

  function openGlobalSearch() {
    const search = document.querySelector<HTMLInputElement>(
      'header input[type="text"][placeholder*="Buscar"]'
    );
    if (!search) return;
    search.focus();
    search.select();
  }

  if (hidden) return null;

  return (
    <nav
      className="fixed inset-x-3 z-50 grid h-[66px] grid-cols-6 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:hidden print:hidden"
      style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
      aria-label="Navegação clínica rápida"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl transition ${
              active
                ? "mobile-clinical-nav-active bg-cyan-800 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="max-w-full truncate px-1 text-[10px] font-semibold">
              {item.label}
            </span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={openGlobalSearch}
        className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-cyan-700 transition hover:bg-cyan-50"
        aria-label="Abrir busca clínica"
      >
        <Search className="h-[18px] w-[18px]" />
        <span className="text-[10px] font-semibold">Busca</span>
      </button>

      <button
        type="button"
        onClick={() => menuTriggerRef.current?.click()}
        className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="Abrir menu completo"
      >
        <Menu className="h-[18px] w-[18px]" />
        <span className="text-[10px] font-semibold">Menu</span>
      </button>
    </nav>
  );
}

