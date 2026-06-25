export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-5" aria-busy="true">
      <div className="h-32 rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
      </div>
      <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
      <span className="sr-only">Carregando conteúdo clínico...</span>
    </div>
  );
}
