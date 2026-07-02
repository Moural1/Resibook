"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legal/constants";
import { clearClinicalCaseSession } from "@/lib/clinical-case-session";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

const GUEST_EMAIL = "convidado@resibook.com";

function sanitizeRedirect(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";

  return value;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const blocked = searchParams.get("blocked") === "1";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const formValido = useMemo(() => {
    return email.trim().length > 0 && senha.trim().length > 0;
  }, [email, senha]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      clearClinicalCaseSession();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: senha,
      });

      if (error) {
        setErro("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setErro(
          "Login realizado, mas a sessão não foi confirmada. Tente novamente."
        );
        setLoading(false);
        return;
      }

      const user = sessionData.session.user;
      const userId = user?.id || "";
      const sessionEmail = user?.email?.trim().toLowerCase() || "";
      const isGuest = sessionEmail === GUEST_EMAIL;

      if (!userId) {
        setErro("Usuário não identificado.");
        setLoading(false);
        return;
      }

      if (isGuest) {
        const nextPath = redirectTo === "/dashboard" ? "/prescricao" : redirectTo;
        window.location.replace(nextPath);
        return;
      }

      const { data: legalRow, error: legalError } = await supabase
        .from("user_legal_acceptances")
        .select("terms_version, privacy_version")
        .eq("user_id", userId)
        .maybeSingle();

      if (legalError) {
        setErro("Não foi possível validar o aceite legal.");
        setLoading(false);
        return;
      }

      const acceptedCurrentTerms = legalRow?.terms_version === TERMS_VERSION;
      const acceptedCurrentPrivacy =
        legalRow?.privacy_version === PRIVACY_VERSION;

      if (!acceptedCurrentTerms || !acceptedCurrentPrivacy) {
        window.location.replace("/aceite-legal");
        return;
      }

      window.location.replace(redirectTo);
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  }

  async function requestPasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();
    setErro("");
    setResetSent(false);

    if (!normalizedEmail) {
      setErro("Informe seu e-mail para recuperar a senha.");
      return;
    }

    try {
      setResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: `${window.location.origin}/redefinir-senha` }
      );

      if (error) {
        setErro("Não foi possível enviar a recuperação agora. Tente novamente.");
        return;
      }

      setResetSent(true);
    } catch {
      setErro("Não foi possível enviar a recuperação agora. Tente novamente.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.09)] sm:p-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <Image
              src="/logo-resibook.png"
              alt="ResiBook"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="text-slate-950">RESI</span>
            <span className="text-cyan-700">BOOK</span>
          </h1>

          <p className="mt-2 text-center text-sm text-slate-500">
            Entre para acessar o sistema clínico.
          </p>
        </div>

        {blocked ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Seu acesso foi bloqueado pelo administrador do sistema.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {erro ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          ) : null}

          {resetSent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Se houver uma conta com esse e-mail, o link para redefinir a senha
              chegará em instantes.
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-600">
              E-mail
            </label>

            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="senha" className="text-sm font-medium text-gray-600">
                Senha
              </label>
              <button
                type="button"
                onClick={requestPasswordReset}
                disabled={resetting || loading}
                className="text-xs font-semibold text-cyan-800 transition hover:text-cyan-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetting ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>

            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyUp={(event) =>
                  setCapsLock(event.getModifierState("CapsLock"))
                }
                onBlur={() => setCapsLock(false)}
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-12 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {capsLock ? (
              <p className="mt-2 text-xs font-medium text-amber-700">
                Caps Lock está ativado.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!formValido || loading}
            className="h-12 w-full rounded-xl bg-cyan-800 font-semibold text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs leading-5 text-slate-500">
            Ao acessar o ResiBook, você concorda com os{" "}
            <Link
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              Termos de Uso
            </Link>{" "}
            e com a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          Acesso restrito • Conteúdo profissional médico
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
            Carregando login...
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}


