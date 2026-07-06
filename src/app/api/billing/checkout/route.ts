import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCheckoutPayload } from "@/lib/billing/checkout-payload";
import {
  getBillingRuntimeConfig,
  getTestPayerEmail,
} from "@/lib/billing/config";
import { normalizeBillingEmail } from "@/lib/billing/email";
import { getBestActiveEntitlement } from "@/lib/billing/entitlement";
import { logBillingError } from "@/lib/billing/logger";
import {
  MercadoPagoApiError,
  mercadoPagoErrorResponse,
} from "@/lib/billing/mercado-pago-error";
import { getBillingPlan } from "@/lib/billing/plans";
import {
  BillingConfigurationError,
  buildExternalReference,
  getSiteUrl,
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

function checkoutFailure(error: unknown) {
  if (error instanceof MercadoPagoApiError) {
    return NextResponse.json(mercadoPagoErrorResponse(error), { status: 502 });
  }
  if (error instanceof BillingConfigurationError) {
    return NextResponse.json(
      { error: "billing_configuration_invalid", missing: error.missing },
      { status: 503 }
    );
  }
  return NextResponse.json(
    {
      error: "checkout_unavailable",
      message: "Não foi possível abrir o pagamento agora.",
    },
    { status: 503 }
  );
}

export async function POST(request: Request) {
  const config = getBillingRuntimeConfig();
  if (!config.configured) {
    return NextResponse.json(
      {
        error: "billing_configuration_invalid",
        message: `Billing não configurado: ${config.missing.join(", ")}.`,
        missing: config.missing,
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

  const body = (await request.json().catch(() => null)) as {
    plan?: unknown;
    billingEmail?: unknown;
    retry?: unknown;
  } | null;
  const plan = getBillingPlan(body?.plan);
  if (!plan) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }
  const billingEmail = normalizeBillingEmail(body?.billingEmail ?? user.email);
  if (!billingEmail) {
    return NextResponse.json(
      {
        error: "invalid_billing_email",
        message: "Informe um e-mail de cobrança válido.",
      },
      { status: 400 }
    );
  }
  const retry = body?.retry === true;

  const { data: activeEntitlements, error: entitlementError } = await supabase
    .from("billing_subscriptions")
    .select("plan_id, status, current_period_end, payment_method")
    .eq("user_id", user.id)
    .eq("environment", config.environment)
    .in("status", ["active", "authorized", "cancelled"])
    .limit(10);
  if (entitlementError) {
    return NextResponse.json(
      { error: "billing_check_failed", message: "Não foi possível validar o acesso atual." },
      { status: 503 }
    );
  }
  const activeEntitlement = getBestActiveEntitlement(activeEntitlements);
  if (activeEntitlement?.payment_method === "pix_manual") {
    return NextResponse.json(
      {
        error: "subscription_already_active",
        message: "Seu acesso por Pix ainda está ativo. Aguarde o fim do período antes de contratar novamente.",
      },
      { status: 409 }
    );
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
              auto_recurring: {
                transaction_amount: plan.price,
                currency_id: "BRL",
              },
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
        return checkoutFailure(error);
      }
    }

    return NextResponse.json(
      {
        error:
          existing.plan_id === plan.id
            ? "Este plano já está ativo na sua conta."
            : "Cancele o plano atual antes de contratar outro.",
      },
      { status: 409 }
    );
  }

  if (existing?.status === "pending" && !retry) {
    if (existing.plan_id === plan.id && existing.checkout_url) {
      return NextResponse.json({ checkoutUrl: existing.checkout_url });
    }
    return NextResponse.json(
      {
        error: "payment_pending",
        message:
          "Já existe uma tentativa pendente. Use 'Tentar novamente' para gerar um novo checkout.",
      },
      { status: 409 }
    );
  }

  if (existing?.status === "pending" && retry) {
    try {
      const cancelled = await mercadoPagoRequest<MercadoPagoSubscription>(
        `/preapproval/${encodeURIComponent(existing.provider_subscription_id)}`,
        { method: "PUT", body: JSON.stringify({ status: "cancelled" }) },
        config.environment
      );
      await syncMercadoPagoSubscription(cancelled, config.environment);
    } catch (error) {
      logBillingError("pending_checkout_cancel_failed", {
        environment: config.environment,
      });
      return checkoutFailure(error);
    }
  }

  try {
    const checkoutPayload = buildCheckoutPayload({
      environment: config.environment,
      plan,
      userId: user.id,
      billingEmail,
      testPayerEmail: getTestPayerEmail(),
      siteUrl: getSiteUrl(),
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
      providerError: error instanceof MercadoPagoApiError,
    });
    return checkoutFailure(error);
  }
}
