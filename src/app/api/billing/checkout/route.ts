import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCheckoutPayload } from "@/lib/billing/checkout-payload";
import {
  getBillingRuntimeConfig,
  getTestPayerEmail,
} from "@/lib/billing/config";
import { logBillingError } from "@/lib/billing/logger";
import { getBillingPlan } from "@/lib/billing/plans";
import {
  BillingConfigurationError,
  buildExternalReference,
  getSiteUrl,
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

export async function POST(request: Request) {
  const config = getBillingRuntimeConfig();
  if (!config.configured) {
    return NextResponse.json(
      {
        error: `Billing não configurado: ${config.missing.join(", ")}.`,
        code: "billing_configuration_invalid",
      },
      { status: 503 }
    );
  }

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
    .eq("environment", config.environment)
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
              reason: `${config.testMode ? "[TESTE] " : ""}Resibook ${plan.name} - assinatura mensal`,
              external_reference: buildExternalReference(
                user.id,
                plan.id,
                config.environment
              ),
              auto_recurring: { transaction_amount: plan.price, currency_id: "BRL" },
            }),
          },
          config.environment
        );
        await syncMercadoPagoSubscription(upgraded, config.environment);
        return NextResponse.json({ redirectUrl: "/minha-assinatura?upgrade=1" });
      } catch (error) {
        logBillingError("subscription_upgrade_failed", {
          environment: config.environment,
          configurationError: error instanceof BillingConfigurationError,
        });
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
    const checkoutPayload = buildCheckoutPayload({
      environment: config.environment,
      plan,
      userId: user.id,
      accountEmail: user.email,
      testPayerEmail: getTestPayerEmail(),
      siteUrl,
    });
    const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
      "/preapproval",
      {
        method: "POST",
        headers: { "X-Idempotency-Key": randomUUID() },
        body: JSON.stringify(checkoutPayload),
      },
      config.environment
    );

    await syncMercadoPagoSubscription(subscription, config.environment);
    if (!subscription.init_point) throw new Error("Checkout não retornado.");
    return NextResponse.json({ checkoutUrl: subscription.init_point });
  } catch (error) {
    logBillingError("checkout_creation_failed", {
      environment: config.environment,
      configurationError: error instanceof BillingConfigurationError,
    });
    return NextResponse.json(
      { error: "Não foi possível abrir o pagamento agora." },
      { status: 503 }
    );
  }
}
