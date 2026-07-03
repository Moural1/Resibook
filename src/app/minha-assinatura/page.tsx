import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BILLING_PLANS, isBillingPlanId } from "@/lib/billing/plans";
import { BillingActions } from "./billing-actions";

const statusLabels: Record<string, string> = {
  authorized: "Ativa",
  pending: "Aguardando pagamento",
  paused: "Pausada",
  cancelled: "Cancelada",
};

export default async function MinhaAssinaturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = user ? await supabase
    .from("billing_subscriptions")
    .select("plan_id, status, amount, next_payment_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle() : { data: null };
  const plan = subscription && isBillingPlanId(subscription.plan_id) ? BILLING_PLANS[subscription.plan_id] : null;
  const canCancel = ["authorized", "pending", "paused"].includes(subscription?.status || "");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><CreditCard /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Cobrança</p><h1 className="text-2xl font-semibold text-slate-950">Minha assinatura</h1></div></div>
        {subscription && plan ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Plano atual</p><p className="mt-1 text-xl font-semibold text-slate-950">{plan.name} · R$ {Number(subscription.amount).toFixed(0)}/mês</p></div><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{statusLabels[subscription.status] || subscription.status}</span></div>
            {subscription.next_payment_at ? <p className="mt-4 text-sm text-slate-600">Próxima cobrança prevista: {new Intl.DateTimeFormat("pt-BR").format(new Date(subscription.next_payment_at))}</p> : null}
            <BillingActions canCancel={canCancel} />
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-semibold text-amber-900">Nenhuma assinatura encontrada.</p><p className="mt-2 text-sm text-amber-800">Escolha um plano para liberar seu acesso.</p><Link href="/assinar" className="mt-4 inline-flex h-11 items-center rounded-xl bg-cyan-700 px-5 text-sm font-semibold text-white">Ver planos</Link></div>
        )}
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Cobranças e dados de pagamento são processados pelo Mercado Pago.</p>
      </section>
    </div>
  );
}
