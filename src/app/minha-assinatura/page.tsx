import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BILLING_PLANS, isBillingPlanId } from "@/lib/billing/plans";
import { BillingActions } from "./billing-actions";
import { getBillingRuntimeConfig } from "@/lib/billing/config";
import {
  getBestActiveEntitlement,
  hasSubscriptionAccess,
} from "@/lib/billing/entitlement";

const statusLabels: Record<string, string> = {
  authorized: "Ativa",
  pending: "Aguardando pagamento",
  paused: "Pausada",
  cancelled: "Cancelada",
  payment_failed: "Pagamento recusado",
  active: "Ativa",
};

type SubscriptionRow = {
  plan_id: string;
  status: string;
  amount: number | string;
  next_payment_at: string | null;
  current_period_end: string | null;
  updated_at: string;
  environment: string;
  provider: string;
  payment_method: string;
  last_payment_status_detail: string | null;
};

export default async function MinhaAssinaturaPage() {
  const billingConfig = getBillingRuntimeConfig();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const subscriptionsResult = user ? await supabase
    .from("billing_subscriptions")
    .select("plan_id, status, amount, next_payment_at, current_period_end, updated_at, environment, provider, payment_method, last_payment_status_detail")
    .eq("user_id", user.id)
    .eq("environment", billingConfig.environment)
    .order("updated_at", { ascending: false })
    .limit(10) : null;
  const subscriptions = (subscriptionsResult?.data || []) as SubscriptionRow[];
  const subscription = getBestActiveEntitlement(subscriptions) || subscriptions?.[0] || null;
  const plan = subscription && isBillingPlanId(subscription.plan_id) ? BILLING_PLANS[subscription.plan_id] : null;
  const isMercadoPago = subscription?.provider === "mercado_pago";
  const canCancel = isMercadoPago && ["authorized", "pending", "paused"].includes(subscription?.status || "");
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const hasAccess = subscription ? hasSubscriptionAccess({
        plan_id: subscription.plan_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      }) : false;
  const retry = ["payment_failed", "pending", "paused"].includes(subscription?.status || "");
  const canResubscribe = Boolean(
    subscription &&
      (retry || subscription.status === "cancelled" ||
        (subscription.payment_method === "pix_manual" && !hasAccess))
  );
  const accessExpired = Boolean(periodEnd && !Number.isNaN(periodEnd.getTime()) && !hasAccess);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><CreditCard /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Cobrança</p><h1 className="text-2xl font-semibold text-slate-950">Minha assinatura</h1></div></div>
        {billingConfig.testMode ? <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">Ambiente de teste — esta assinatura não altera o acesso comercial.</div> : null}
        {subscription && plan ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">Plano atual</p><p className="mt-1 text-xl font-semibold text-slate-950">{plan.name} · R$ {Number(subscription.amount).toFixed(0)}/mês</p></div><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{statusLabels[subscription.status] || subscription.status}</span></div>
            {subscription.status === "cancelled" && periodEnd ? (
              <p className={`mt-4 text-sm font-medium ${accessExpired ? "text-rose-700" : "text-slate-700"}`}>{accessExpired ? "O período pago terminou em" : "A renovação foi cancelada. Acesso disponível até"} {new Intl.DateTimeFormat("pt-BR").format(periodEnd)}.</p>
            ) : subscription.status === "cancelled" ? (
              <p className="mt-4 text-sm font-medium text-rose-700">A assinatura foi cancelada. Assine novamente para recuperar o acesso.</p>
            ) : subscription.status === "payment_failed" ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">Pagamento recusado pelo Mercado Pago ou banco emissor.</p><p className="mt-1">Tente outro cartão, outra conta Mercado Pago ou pagamento manual por Pix.</p></div>
            ) : subscription.payment_method === "pix_manual" && accessExpired ? (
              <p className="mt-4 text-sm font-medium text-rose-700">O período do Pix terminou em {periodEnd ? new Intl.DateTimeFormat("pt-BR").format(periodEnd) : "data não informada"}. Faça um novo pagamento para renovar.</p>
            ) : subscription.next_payment_at ? <p className="mt-4 text-sm text-slate-600">Próxima cobrança prevista: {new Intl.DateTimeFormat("pt-BR").format(new Date(subscription.next_payment_at))}</p> : null}
            <p className="mt-3 text-xs font-medium text-slate-500">Pagamento: {subscription.payment_method === "pix_manual" ? "Pix manual" : "Mercado Pago"}</p>
            {isMercadoPago && subscription.status === "authorized" ? <p className="mt-3 text-sm text-slate-600">Para alterar a forma de pagamento, gere uma nova tentativa após cancelar a renovação ou entre em contato com o suporte.</p> : null}
            <BillingActions canCancel={canCancel} canResubscribe={canResubscribe} canRefresh={isMercadoPago} retry={retry} planId={plan.id} />
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-semibold text-amber-900">Nenhuma assinatura encontrada.</p><p className="mt-2 text-sm text-amber-800">Escolha um plano para liberar seu acesso.</p><Link href="/assinar" className="mt-4 inline-flex h-11 items-center rounded-xl bg-cyan-700 px-5 text-sm font-semibold text-white">Ver planos</Link></div>
        )}
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Cobranças e dados de pagamento são processados pelo Mercado Pago.</p>
      </section>
    </div>
  );
}
