import { NextResponse } from "next/server";
import { getBillingRuntimeConfig } from "@/lib/billing/config";
import { logBillingError } from "@/lib/billing/logger";
import { createClient } from "@/lib/supabase/server";
import {
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

export async function POST() {
  const config = getBillingRuntimeConfig();
  if (!config.configured) {
    return NextResponse.json(
      { error: `Billing não configurado: ${config.missing.join(", ")}.`, code: "billing_configuration_invalid" },
      { status: 503 }
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: current } = await supabase
    .from("billing_subscriptions")
    .select("provider_subscription_id, status, current_period_end")
    .eq("user_id", user.id)
    .eq("environment", config.environment)
    .in("status", ["pending", "authorized", "paused"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!current?.provider_subscription_id) {
    return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
  }

  try {
    const beforeCancellation = await mercadoPagoRequest<MercadoPagoSubscription>(
      `/preapproval/${encodeURIComponent(current.provider_subscription_id)}`,
      undefined,
      config.environment
    );
    const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
      `/preapproval/${encodeURIComponent(current.provider_subscription_id)}`,
      { method: "PUT", body: JSON.stringify({ status: "cancelled" }) },
      config.environment
    );
    const accessUntil = current.status === "authorized"
      ? beforeCancellation.next_payment_date || current.current_period_end || null
      : null;
    await syncMercadoPagoSubscription(subscription, config.environment, {
      periodEnd: accessUntil,
    });
    return NextResponse.json({ success: true, accessUntil });
  } catch {
    logBillingError("subscription_cancel_failed", { environment: config.environment });
    return NextResponse.json({ error: "Não foi possível cancelar a assinatura." }, { status: 503 });
  }
}
