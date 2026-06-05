"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 z-[90] inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-lg lg:hidden"
        >
          <span className="text-base">☰</span>
          Menu
        </button>
      )}

      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] bg-slate-950/60 lg:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-[85] w-[290px] max-w-[88vw] transform bg-slate-950 shadow-2xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
          >
            ✕
          </button>
        </div>

        <div className="h-[calc(100vh-73px)] overflow-y-auto">
          <Sidebar mobile onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}