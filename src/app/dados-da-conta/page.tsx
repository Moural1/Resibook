export default function DadosDaContaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Conta
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Dados da conta
          </h1>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Informações institucionais, acesso e preferências do sistema.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Informações principais
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome da conta
                </label>
                <input
                  defaultValue="ResiBook Premium"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail institucional
                </label>
                <input
                  defaultValue="contato@resibook.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Plano
                </label>
                <input
                  defaultValue="Premium"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Preferências
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  Modo clínico
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Interface otimizada para plantão e consulta rápida.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  Biblioteca sincronizada
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Conteúdos e templates mantidos centralmente.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  Status da conta
                </p>
                <p className="mt-1 text-sm text-slate-700">Conta ativa e operacional.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]">
            Salvar alterações
          </button>
        </div>
      </section>
    </div>
  );
}