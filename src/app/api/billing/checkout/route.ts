import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBillingPlan, MERCADO_PAGO_WEBHOOK_URL } from "@/lib/billing/plans";
import {
  buildExternalReference,
  getSiteUrl,
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user?.email) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { plan?: unknown } | null;
  const plan = getBillingPlan(body?.plan);
  if (!plan) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("billing_subscriptions")
    .select("plan_id, status, checkout_url, provider_subscription_id")
    .eq("user_id", user.id)
    .in("status", ["pending", "authorized"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "authorized") {
    if (existing.plan_id === "basic" && plan.id === "complete") {
      try {
        const upgraded = await mercadoPagoRequest<MercadoPagoSubscription>(
          `/preapproval/${encodeURIComponent(existing.provider_subscription_id)}`,
          {
            method: "PUT",
            body: JSON.stringify({
              reason: `Resibook ${plan.name} - assinatura mensal`,
              external_reference: buildExternalReference(user.id, plan.id),
              auto_recurring: { transaction_amount: plan.price, currency_id: "BRL" },
            }),
          }
        );
        await syncMercadoPagoSubscription(upgraded);
        return NextResponse.json({ redirectUrl: "/minha-assinatura?upgrade=1" });
      } catch (error) {
        console.error("Failed to upgrade subscription", error);
        return NextResponse.json({ error: "Não foi possível atualizar o plano agora." }, { status: 503 });
      }
    }

    return NextResponse.json(
      { error: existing.plan_id === plan.id ? "Este plano já está ativo na sua conta." : "Cancele o plano atual antes de contratar outro." },
      { status: 409 }
    );
  }
  if (existing?.plan_id === plan.id && existing.checkout_url) {
    return NextResponse.json({ checkoutUrl: existing.checkout_url });
  }
  if (existing?.status === "pending") {
    return NextResponse.json(
      { error: "Já existe um pagamento pendente. Cancele-o em Minha assinatura antes de escolher outro plano." },
      { status: 409 }
    );
  }

  const siteUrl = getSiteUrl();
  try {
    const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
      "/preapproval",
      {
        method: "POST",
        headers: { "X-Idempotency-Key": randomUUID() },
        body: JSON.stringify({
          reason: `Resibook ${plan.name} - assinatura mensal`,
          external_reference: buildExternalReference(user.id, plan.id),
          payer_email: user.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: plan.price,
            currency_id: "BRL",
          },
          back_url: `${siteUrl}/minha-assinatura?retorno=mercado-pago`,
          notification_url: MERCADO_PAGO_WEBHOOK_URL,
          status: "pending",
        }),
      }
    );

    await syncMercadoPagoSubscription(subscription);
    if (!subscription.init_point) throw new Error("Checkout não retornado.");
    return NextResponse.json({ checkoutUrl: subscription.init_point });
  } catch (error) {
    console.error("Failed to create Mercado Pago checkout", error);
    return NextResponse.json(
      { error: "Não foi possível abrir o pagamento agora." },
      { status: 503 }
    );
  }
}
