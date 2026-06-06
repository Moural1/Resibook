"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const blocked = searchParams.get("blocked") === "1";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const formValido = useMemo(() => {
    return email.trim().length > 0 && senha.trim().length > 0;
  }, [email, senha]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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

      window.location.replace(redirectTo);
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/logo-resibook.png"
            alt="ResiBook"
            className="mb-3 h-16 w-16 object-contain"
          />

          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-blue-900">RESI</span>
            <span className="text-teal-500">BOOK</span>
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

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-600">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-lg border border-gray-300 bg-white/70 px-4 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="senha" className="text-sm font-medium text-gray-600">
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-lg border border-gray-300 bg-white/70 px-4 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={!formValido || loading}
            className="h-11 w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs leading-5 text-slate-500">
            Ao acessar o ResiBook, você concorda com os{" "}
            <a
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              Termos de Uso
            </a>{" "}
            e com a{" "}
            <a
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
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