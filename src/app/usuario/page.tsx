export default function UsuarioPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Usuário
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Perfil do usuário
          </h1>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Dados pessoais, permissões e identificação profissional.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                IG
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Igor
              </h2>
              <p className="text-sm text-slate-500">Médico • Clínica médica</p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  CRM
                </p>
                <p className="mt-1 text-sm text-slate-900">000000</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Nível de acesso
                </p>
                <p className="mt-1 text-sm text-slate-900">Administrador</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Dados do usuário
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome
                </label>
                <input
                  defaultValue="Igor"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  defaultValue="igor@email.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Especialidade
                </label>
                <input
                  defaultValue="Clínica médica"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CRM
                </label>
                <input
                  defaultValue="000000"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Observações
              </label>
              <textarea
                rows={5}
                defaultValue="Usuário com acesso à biblioteca clínica, prescrições e evolução."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]">
                Salvar perfil
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}