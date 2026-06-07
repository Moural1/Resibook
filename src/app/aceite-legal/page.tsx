"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal/constants";

const GUEST_EMAIL = "convidado@resibook.com";

export default function AceiteLegalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setError("");

    if (!acceptTerms || !acceptPrivacy) {
      setError("Você precisa aceitar os Termos e a Política de Privacidade.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Sessão inválida. Faça login novamente.");
      setLoading(false);
      return;
    }

    const normalizedEmail = user.email?.trim().toLowerCase() || "";
    const nextPath = normalizedEmail === GUEST_EMAIL ? "/prescricao" : "/dashboard";

    const { error: upsertError } = await supabase
      .from("user_legal_acceptances")
      .upsert({
        user_id: user.id,
        email: user.email || "",
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    router.replace(nextPath);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Aceite obrigatório
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Termos e privacidade
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Antes de continuar no ResiBook, confirme que leu e aceitou os
            documentos legais do sistema.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Versão dos Termos: {TERMS_VERSION}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Versão da Privacidade: {PRIVACY_VERSION}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/termos"
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Abrir Termos de Uso
            </Link>

            <Link
              href="/privacidade"
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Abrir Política de Privacidade
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm leading-6 text-slate-700">
                Li e aceito os Termos de Uso do ResiBook.
              </span>
            </label>

            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm leading-6 text-slate-700">
                Li e aceito a Política de Privacidade e o tratamento dos meus
                dados conforme descrito.
              </span>
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAccept}
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvando aceite..." : "Aceitar e continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}