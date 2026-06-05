"use client";

import { Printer } from "lucide-react";

export default function PrintProntuarioButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="fixed bottom-4 right-4 z-50 hidden h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition hover:bg-slate-800 lg:inline-flex print:hidden"
    >
      <Printer className="h-4 w-4" />
      Exportar PDF
    </button>
  );
}