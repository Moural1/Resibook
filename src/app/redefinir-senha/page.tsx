"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSessionReady(Boolean(data.session));
      setChecking(false);
    }

    void checkSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSessionReady(Boolean(session));
      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas digitadas não são iguais.");
      return;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError("O link expirou ou a senha não pôde ser atualizada.");
        return;
      }

      await supabase.auth.signOut();
      setSuccess(true);
    } catch {
      setError("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.09)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-800">
            {success ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <KeyRound className="h-6 w-6" />
            )}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
            ResiBook
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {success ? "Senha atualizada" : "Definir nova senha"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {success
              ? "Sua conta está protegida com a nova senha."
              : "Crie uma senha exclusiva para voltar ao ambiente clínico."}
          </p>
        </div>

        {checking ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-600">
            Validando o link seguro...
          </div>
        ) : success ? (
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-800 px-5 text-sm font-semibold text-white transition hover:bg-cyan-900"
          >
            Entrar no ResiBook
          </Link>
        ) : !sessionReady ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Este link é inválido ou expirou. Solicite uma nova recuperação na
              tela de login.
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={updatePassword}>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <PasswordField
              id="nova-senha"
              label="Nova senha"
              value={password}
              onChange={setPassword}
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmar-senha"
              label="Confirmar nova senha"
              value={confirmation}
              onChange={setConfirmation}
              visible={showConfirmation}
              onToggle={() => setShowConfirmation((current) => !current)}
              autoComplete="new-password"
            />

            <p className="text-xs leading-5 text-slate-500">
              Use pelo menos 8 caracteres e evite reutilizar senhas de outros
              serviços.
            </p>
            <button
              type="submit"
              disabled={loading || !password || !confirmation}
              className="h-12 w-full rounded-xl bg-cyan-800 font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          Link individual e sessão protegida
        </p>
      </section>
    </main>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative mt-1">
        <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-12 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          title={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

