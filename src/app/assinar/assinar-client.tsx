"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  CreditCard,
  FileCheck2,
  MessageCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  BILLING_PLANS,
  getBillingPlan,
  type BillingPlanId,
} from "@/lib/billing/plans";
import type { ManualPixOrder } from "@/lib/billing/manual-pix";

type PixConfig = {
  configured: boolean;
  key: string;
  receiverName: string;
  receiverDocument: string;
};

type CheckoutError = {
  error?: string;
  message?: string;
  mercadoPagoMessage?: string | null;
  mercadoPagoStatusDetail?: string | null;
};

function friendlyCheckoutError(payload: CheckoutError) {
  const providerText = `${payload.mercadoPagoMessage || ""} ${payload.mercadoPagoStatusDetail || ""}`.toLowerCase();
  if (providerText.includes("e-mail") || providerText.includes("email")) {
    return "O e-mail informado não corresponde à conta Mercado Pago usada no checkout. Confira o e-mail e tente novamente.";
  }
  if (payload.error === "mercado_pago_checkout_failed") {
    return "O Mercado Pago não conseguiu criar esta tentativa. Confira o e-mail de cobrança ou tente o Pix manual.";
  }
  return payload.message || payload.error || "Pagamento indisponível.";
}

function formatOrderDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortOrderId(id?: string | null) {
  return id ? id.slice(0, 8).toUpperCase() : "";
}

function AssinarContent({
  testMode,
  accountEmail,
  customerName,
  pixConfig,
  initialManualPixOrder,
  supportPhone,
}: {
  testMode: boolean;
  accountEmail: string;
  customerName: string;
  pixConfig: PixConfig;
  initialManualPixOrder: ManualPixOrder | null;
  supportPhone: string;
}) {
  const searchParams = useSearchParams();
  const initial = getBillingPlan(searchParams.get("plano")) ||
    getBillingPlan(initialManualPixOrder?.plan_id) ||
    BILLING_PLANS.complete;
  const [selected, setSelected] = useState<BillingPlanId>(initial.id);
  const [method, setMethod] = useState<"card" | "pix">(
    initialManualPixOrder?.status === "pending" ? "pix" : "card"
  );
  const [billingEmail, setBillingEmail] = useState(accountEmail);
  const [name, setName] = useState(customerName);
  const [loading, setLoading] = useState<"card" | "pix" | "refresh-pix" | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [manualPixOrder, setManualPixOrder] = useState(initialManualPixOrder);
  const retry = searchParams.get("retry") === "1";
  const pixAvailable = pixConfig.configured && !testMode;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim());
  const pixStatus = manualPixOrder?.status;
  const pixPlan = manualPixOrder
    ? BILLING_PLANS[manualPixOrder.plan_id]
    : BILLING_PLANS[selected];
  const hasOpenPixOrder = pixStatus === "pending";

  const whatsappUrl = useMemo(() => {
    const orderText = manualPixOrder?.id ? ` Pedido: ${manualPixOrder.id}.` : "";
    const text = `Olá! Enviei o comprovante do Pix do Resibook. Plano ${pixPlan.name}, e-mail ${accountEmail}.${orderText}`;
    return `https://wa.me/${supportPhone}?text=${encodeURIComponent(text)}`;
  }, [accountEmail, manualPixOrder?.id, pixPlan.name, supportPhone]);

  async function checkout() {
    if (!emailValid) {
      setError("Informe um e-mail de cobrança válido.");
      return;
    }
    setLoading("card");
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selected,
          billingEmail: billingEmail.trim(),
          retry,
        }),
      });
      const payload = (await response.json()) as CheckoutError & {
        checkoutUrl?: string;
        redirectUrl?: string;
      };
      if (!response.ok) throw new Error(friendlyCheckoutError(payload));
      if (payload.redirectUrl) return window.location.assign(payload.redirectUrl);
      if (!payload.checkoutUrl) throw new Error("Pagamento indisponível.");
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Pagamento indisponível.");
      setLoading(null);
    }
  }

  async function createPixOrder() {
    setLoading("pix");
    setError("");
    const response = await fetch("/api/billing/pix-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected, customerName: name }),
    });
    const payload = (await response.json().catch(() => null)) as {
      order?: ManualPixOrder;
      error?: string;
      message?: string;
    } | null;
    if (!response.ok || !payload?.order) {
      setError(payload?.message || payload?.error || "Não foi possível criar o pedido Pix.");
      setLoading(null);
      return;
    }
    setManualPixOrder(payload.order);
    setSelected(payload.order.plan_id);
    setLoading(null);
  }

  async function refreshPixOrder() {
    setLoading("refresh-pix");
    setError("");
    const response = await fetch("/api/billing/pix-manual", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as {
      order?: ManualPixOrder | null;
      error?: string;
    } | null;
    if (!response.ok) setError(payload?.error || "Não foi possível atualizar o pedido Pix.");
    setManualPixOrder(payload?.order || null);
    setLoading(null);
  }

  async function copyPixKey() {
    await navigator.clipboard.writeText(pixConfig.key);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" />Voltar</Link>
        <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          {testMode ? <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Modo de teste do Mercado Pago</p><p className="mt-1 text-sm">Use somente comprador e cartão de teste. Esta assinatura não libera nem bloqueia acessos reais.</p></div></div> : null}
          <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Assinatura mensal</p><h1 className="mt-3 text-3xl font-semibold text-slate-950">Escolha seu acesso ao Resibook</h1><p className="mt-3 text-sm text-slate-600">Cartão recorrente pelo Mercado Pago ou Pix com liberação manual por 30 dias.</p></div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Object.values(BILLING_PLANS).map((plan) => <button key={plan.id} type="button" onClick={() => setSelected(plan.id)} className={`rounded-2xl border p-6 text-left ${selected === plan.id ? "border-cyan-700 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white"}`}><span className="text-sm font-semibold text-cyan-700">Plano {plan.name}</span><span className="mt-2 block text-4xl font-semibold text-slate-950">R$ {plan.price}<small className="text-base font-medium text-slate-500">/mês</small></span><span className="mt-3 block text-sm leading-6 text-slate-600">{plan.description}</span><span className="mt-5 block space-y-2">{plan.features.map((feature) => <span key={feature} className="flex gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-cyan-700" />{feature}</span>)}</span></button>)}
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => setMethod("card")} className={`rounded-2xl border p-5 text-left ${method === "card" ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100" : "border-slate-200"}`}><CreditCard className="h-6 w-6 text-cyan-700" /><p className="mt-3 font-semibold text-slate-950">Assinatura automática</p><p className="mt-1 text-sm leading-6 text-slate-600">Cartão pelo Mercado Pago, com cobrança mensal automática.</p></button>
            <button type="button" onClick={() => setMethod("pix")} disabled={!pixAvailable} className={`rounded-2xl border p-5 text-left disabled:cursor-not-allowed disabled:opacity-50 ${method === "pix" ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200"}`}><QrCode className="h-6 w-6 text-emerald-700" /><p className="mt-3 font-semibold text-slate-950">Pix manual</p><p className="mt-1 text-sm leading-6 text-slate-600">Pagamento de 30 dias, liberado após conferência do comprovante.</p></button>
          </div>

          {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

          {method === "card" ? <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><label className="text-sm font-semibold text-slate-900" htmlFor="billing-email">E-mail de cobrança / Mercado Pago</label><input id="billing-email" type="email" value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-cyan-600" placeholder="seu-email@exemplo.com" /><p className="mt-2 text-xs text-slate-600">Use o mesmo e-mail da conta Mercado Pago que fará o pagamento.</p><button type="button" onClick={checkout} disabled={loading !== null || !emailValid} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"><CreditCard className="h-5 w-5" />{loading === "card" ? "Abrindo pagamento..." : testMode ? "Testar com cartão" : "Assinar com cartão"}</button></div> : null}

          {method === "pix" ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            {!pixAvailable ? <p className="text-sm font-semibold text-amber-800">{testMode ? "Pix manual desativado no modo de teste." : "Pix manual temporariamente indisponível. Configure os dados de recebimento na Vercel."}</p> : <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm"><QrCode className="h-5 w-5 text-emerald-700" /><p className="mt-2 font-semibold text-slate-950">1. Gere o pedido</p><p className="mt-1">Escolha o plano e copie a chave Pix.</p></div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm"><MessageCircle className="h-5 w-5 text-emerald-700" /><p className="mt-2 font-semibold text-slate-950">2. Envie o comprovante</p><p className="mt-1">O WhatsApp já vai com o pedido preenchido.</p></div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm"><FileCheck2 className="h-5 w-5 text-emerald-700" /><p className="mt-2 font-semibold text-slate-950">3. Aguarde liberação</p><p className="mt-1">Após conferência, o acesso fica ativo por 30 dias.</p></div>
              </div>

              <label className="mt-5 block text-sm font-semibold text-slate-900" htmlFor="customer-name">Nome para identificação do comprovante</label>
              <input id="customer-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-emerald-200 bg-white px-4 text-sm outline-none" placeholder="Seu nome" />

              {pixStatus === "approved" ? <div className="mt-4 rounded-xl bg-emerald-100 p-4 text-sm text-emerald-900"><p className="font-semibold">Acesso liberado.</p><p className="mt-1">Seu Pix foi aprovado. Você já pode usar o Resibook normalmente.</p><Link href="/dashboard" className="mt-3 inline-flex h-10 items-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white">Entrar no app</Link></div> : null}
              {pixStatus === "pending" ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="flex items-center gap-2 font-semibold text-amber-900"><Clock3 className="h-4 w-4" />Aguardando conferência do comprovante</p><p className="mt-1 text-sm text-amber-800">Pedido #{shortOrderId(manualPixOrder?.id)} criado em {formatOrderDate(manualPixOrder?.created_at)}. Depois de enviar o comprovante, atualize esta tela ou acompanhe em Minha assinatura.</p></div> : null}
              {pixStatus === "rejected" ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">Comprovante recusado.</p><p className="mt-1">Confira os dados e gere um novo pedido Pix.</p></div> : null}

              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-sm text-slate-700"><p><strong>Plano:</strong> {pixPlan.name}</p><p className="mt-2"><strong>Valor:</strong> R$ {pixPlan.price}</p><p className="mt-2"><strong>Recebedor:</strong> {pixConfig.receiverName}</p>{pixConfig.receiverDocument ? <p className="mt-2"><strong>Documento:</strong> {pixConfig.receiverDocument}</p> : null}<div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 p-3"><code className="min-w-0 flex-1 break-all text-xs">{pixConfig.key}</code><button type="button" onClick={() => void copyPixKey()} className="rounded-lg border bg-white p-2" title="Copiar chave Pix"><Copy className="h-4 w-4" /></button></div>{copied ? <p className="mt-2 text-xs font-semibold text-emerald-700">Chave Pix copiada.</p> : null}</div>

              {!hasOpenPixOrder && pixStatus !== "approved" ? <button type="button" onClick={createPixOrder} disabled={loading !== null} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"><QrCode className="h-5 w-5" />{loading === "pix" ? "Criando pedido..." : "Gerar pedido Pix"}</button> : null}

              {hasOpenPixOrder ? <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white"><MessageCircle className="h-5 w-5" />Enviar comprovante</a>
                <button type="button" onClick={() => void refreshPixOrder()} disabled={loading !== null} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-800 disabled:opacity-60"><RefreshCw className="h-5 w-5" />{loading === "refresh-pix" ? "Atualizando..." : "Atualizar status"}</button>
                <Link href="/minha-assinatura" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700">Minha assinatura</Link>
              </div> : null}
            </>}
          </div> : null}

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" />O Resibook não recebe nem armazena os dados do seu cartão.</p>
        </div>
      </div>
    </main>
  );
}

export function AssinarClient(props: Parameters<typeof AssinarContent>[0]) {
  return <Suspense fallback={<div className="min-h-screen bg-slate-100" />}><AssinarContent {...props} /></Suspense>;
}
