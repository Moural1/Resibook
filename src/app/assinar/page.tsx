"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Check, CreditCard, ShieldCheck } from "lucide-react";
import { BILLING_PLANS, getBillingPlan, type BillingPlanId } from "@/lib/billing/plans";

function AssinarContent() {
  const searchParams = useSearchParams();
  const initial = getBillingPlan(searchParams.get("plano")) || BILLING_PLANS.complete;
  const [selected, setSelected] = useState<BillingPlanId>(initial.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; redirectUrl?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Pagamento indisponível.");
      if (payload.redirectUrl) {
        window.location.assign(payload.redirectUrl);
        return;
      }
      if (!payload.checkoutUrl) throw new Error("Pagamento indisponível.");
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Pagamento indisponível.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" />Voltar</Link>
        <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Assinatura mensal</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Escolha seu acesso ao Resibook</h1>
            <p className="mt-3 text-sm text-slate-600">Pagamento processado com segurança pelo Mercado Pago.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Object.values(BILLING_PLANS).map((plan) => (
              <button key={plan.id} type="button" onClick={() => setSelected(plan.id)} className={`rounded-2xl border p-6 text-left ${selected === plan.id ? "border-cyan-700 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white"}`}>
                <span className="text-sm font-semibold text-cyan-700">Plano {plan.name}</span>
                <span className="mt-2 block text-4xl font-semibold text-slate-950">R$ {plan.price}<small className="text-base font-medium text-slate-500">/mês</small></span>
                <span className="mt-3 block text-sm leading-6 text-slate-600">{plan.description}</span>
                <span className="mt-5 block space-y-2">{plan.features.map((feature) => <span key={feature} className="flex gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-cyan-700" />{feature}</span>)}</span>
              </button>
            ))}
          </div>
          {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
          <button type="button" onClick={checkout} disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60">
            <CreditCard className="h-5 w-5" />{loading ? "Abrindo pagamento..." : `Assinar plano ${BILLING_PLANS[selected].name}`}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" />O Resibook não recebe nem armazena os dados do seu cartão.</p>
        </div>
      </div>
    </main>
  );
}

export default function AssinarPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-100" />}><AssinarContent /></Suspense>;
}
