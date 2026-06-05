import Image from "next/image";
import type { ReactNode } from "react";

type LoginPremiumProps = {
  error?: string | null;
  children?: ReactNode;
};

export default function LoginPremium({
  error,
  children,
}: LoginPremiumProps) {
  return (
    <div className="min-h-screen bg-[#eef5f6] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="w-full max-w-[550px] rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo-resibook-horizontal.png"
              alt="ResiBook"
              width={320}
              height={90}
              className="h-auto w-auto max-w-[320px] object-contain"
            />

            <p className="mt-5 text-[15px] text-slate-500">
              Biblioteca de estudos para residência
            </p>
          </div>

          {error ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-10">
            {children}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm uppercase tracking-[0.18em] text-slate-400">
              ou
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-[16px] font-semibold text-slate-700 shadow-sm"
          >
            👤 Entrar como convidado
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            Acesso restrito · Conteúdo profissional médico
          </p>
        </div>
      </div>
    </div>
  );
}