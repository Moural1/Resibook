import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
        <span className="text-sm font-semibold text-cyan-700">Erro 404</span>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Esta página não foi encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">O endereço pode ter mudado. Volte ao plantão ou abra a busca clínica.</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/plantao" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white"><ArrowLeft className="h-4 w-4" />Central de plantão</Link>
          <Link href="/condutas" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700"><Search className="h-4 w-4" />Buscar conduta</Link>
        </div>
      </div>
    </section>
  );
}
