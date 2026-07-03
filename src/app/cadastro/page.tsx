"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Check, CreditCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BILLING_PLANS, getBillingPlan } from "@/lib/billing/plans";

function CadastroContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const initialPlan = getBillingPlan(searchParams.get("plano")) || BILLING_PLANS.complete;
  const [planId, setPlanId] = useState(initialPlan.id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accepted) return setError("Aceite os Termos e a Política de Privacidade.");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");

    setLoading(true);
    try {
      const nextPath = `/aceite-legal?next=${encodeURIComponent(`/assinar?plano=${planId}`)}`;
      localStorage.setItem("resibook_selected_plan", planId);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message.includes("already")
          ? "Este e-mail já possui uma conta. Entre para continuar."
          : "Não foi possível criar a conta. Confira os dados e tente novamente.");
        return;
      }

      if (data.session) window.location.assign(nextPath);
      else setConfirmationSent(true);
    } catch {
      setError("Não foi possível criar a conta agora.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Mail className="mx-auto h-10 w-10 text-cyan-700" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">Confirme seu e-mail</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enviamos um link para <strong>{email}</strong>. Depois da confirmação, entre e conclua o pagamento.
          </p>
          <Link href="/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white">
            Ir para o login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[#091a38] p-7 text-white sm:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/resibook-icon.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-lg bg-white" />
            <span className="text-xl font-semibold">RESI<span className="text-cyan-300">BOOK</span></span>
          </Link>
          <h1 className="mt-12 text-3xl font-semibold leading-tight">Crie sua conta e comece sem falar com atendimento.</h1>
          <ul className="mt-8 space-y-4 text-sm text-slate-200">
            {["Pagamento seguro no Mercado Pago", "Acesso individual protegido", "Cancelamento pela sua conta"].map((item) => (
              <li key={item} className="flex gap-3"><Check className="h-5 w-5 text-cyan-300" />{item}</li>
            ))}
          </ul>
        </aside>

        <section className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Cadastro</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Escolha seu plano</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.values(BILLING_PLANS).map((plan) => (
              <button key={plan.id} type="button" onClick={() => setPlanId(plan.id)} className={`rounded-2xl border p-4 text-left transition ${planId === plan.id ? "border-cyan-700 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200"}`}>
                <span className="font-semibold text-slate-950">{plan.name}</span>
                <span className="mt-1 block text-2xl font-semibold text-slate-950">R$ {plan.price}<small className="text-sm font-medium text-slate-500">/mês</small></span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Nome completo
              <span className="relative mt-1 block"><UserRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 outline-none focus:border-cyan-600" /></span>
            </label>
            <label className="block text-sm font-medium text-slate-700">E-mail
              <span className="relative mt-1 block"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 outline-none focus:border-cyan-600" /></span>
            </label>
            <label className="block text-sm font-medium text-slate-700">Senha
              <span className="relative mt-1 block"><LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 outline-none focus:border-cyan-600" /></span>
            </label>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
              <span>Li e aceito os <Link className="font-semibold text-cyan-700" href="/termos" target="_blank">Termos</Link> e a <Link className="font-semibold text-cyan-700" href="/privacidade" target="_blank">Política de Privacidade</Link>.</span>
            </label>
            {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60">
              <CreditCard className="h-4 w-4" />{loading ? "Criando conta..." : "Criar conta e continuar"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">Já possui conta? <Link href="/login" className="font-semibold text-cyan-700">Entrar</Link></p>
        </section>
      </div>
    </main>
  );
}

export default function CadastroPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-100" />}><CadastroContent /></Suspense>;
}
