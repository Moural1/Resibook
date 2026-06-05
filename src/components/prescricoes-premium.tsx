type PrescriptionBlock = {
  id: string | number;
  category: string;
  specialty?: string | null;
  title: string;
  note?: string | null;
  sections: {
    label: string;
    content: string;
  }[];
};

type PrescricaoPremiumProps = {
  title: string;
  subtitle: string;
  totalItems: number;
  heroText: string;
  items: PrescriptionBlock[];
};

export default function PrescricaoPremium({
  title,
  subtitle,
  totalItems,
  heroText,
  items,
}: PrescricaoPremiumProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Prescrição
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-2xl text-slate-500">{subtitle}</p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-lg font-semibold text-blue-700">
            {totalItems} itens
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded-l-[24px] border-l-4 border-violet-500 pl-5">
            <p className="text-2xl font-semibold text-slate-900">{heroText}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#3275e7] to-[#3b82f6] px-8 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.28)]"
            >
              + Nova prescrição
            </button>

            <button
              type="button"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-lg font-semibold text-slate-700"
            >
              📎 Inserir conteúdo
            </button>
          </div>
        </div>
      </section>

      <section id="list" className="space-y-8">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-lg font-semibold text-blue-700">
                {item.category}
              </span>

              {item.specialty ? (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-lg font-medium text-slate-600">
                  {item.specialty}
                </span>
              ) : null}
            </div>

            {item.note ? (
              <div className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 px-6 py-5">
                <p className="text-xl font-semibold text-slate-900">Observações</p>
                <p className="mt-2 text-xl leading-8 text-slate-700">{item.note}</p>
              </div>
            ) : null}

            <div className="mt-8 space-y-8">
              {item.sections.map((section, index) => (
                <div key={`${item.id}-${index}`}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {section.label}
                    </h3>

                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-700"
                    >
                      Copiar
                    </button>
                  </div>

                  <div className="rounded-[26px] bg-[#07183d] px-7 py-6">
                    <pre className="whitespace-pre-wrap font-mono text-[1.7rem] leading-[1.7] text-slate-100 md:text-[1.85rem]">
                      {section.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}