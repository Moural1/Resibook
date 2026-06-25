"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm md:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><AlertTriangle className="h-5 w-5" /></span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Interrupção inesperada</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Não foi possível carregar esta área</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Seus dados não foram apagados. Tente carregar novamente ou retorne à visão geral.</p>
        {error.digest ? <p className="mt-3 text-xs text-slate-400">Referência: {error.digest}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Tentar novamente</button>
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700"><Home className="h-4 w-4" />Visão geral</Link>
        </div>
      </div>
    </section>
  );
}
