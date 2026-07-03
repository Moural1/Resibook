import { createClient } from "@supabase/supabase-js";
import { BILLING_PLANS } from "./plans";
import { parseExternalReference } from "./security";

export { buildExternalReference, verifyMercadoPagoSignature } from "./security";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export type MercadoPagoSubscription = {
  id: string;
  external_reference?: string | null;
  payer_email?: string | null;
  status: string;
  init_point?: string | null;
  next_payment_date?: string | null;
  date_created?: string | null;
  last_modified?: string | null;
  auto_recurring?: {
    transaction_amount?: number | string | null;
    currency_id?: string | null;
  } | null;
};

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercelHost ? `https://${vercelHost}` : "http://localhost:3000";
}

export function createBillingAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function mercadoPagoRequest<T>(path: string, init?: RequestInit) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Mercado Pago não configurado.");

  const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok || !payload) {
    console.error("Mercado Pago request failed", response.status, payload?.message);
    throw new Error("Não foi possível processar a assinatura no Mercado Pago.");
  }

  return payload;
}

export async function syncMercadoPagoSubscription(
  subscription: MercadoPagoSubscription
) {
  const reference = parseExternalReference(subscription.external_reference);
  const admin = createBillingAdminClient();
  if (!reference || !admin) throw new Error("Assinatura sem vínculo válido.");

  const plan = BILLING_PLANS[reference.planId];
  const amount = Number(subscription.auto_recurring?.transaction_amount ?? plan.price);
  const currency = subscription.auto_recurring?.currency_id || "BRL";
  const validPrice = Number.isFinite(amount) && Math.abs(amount - plan.price) < 0.01;
  const { data: account, error: accountError } = await admin.auth.admin.getUserById(reference.userId);
  const accountEmail = account.user?.email?.trim().toLowerCase() || "";
  const payerEmail = subscription.payer_email?.trim().toLowerCase() || "";
  if (accountError || !account.user || (payerEmail && payerEmail !== accountEmail)) {
    throw new Error("Assinatura vinculada a uma conta inválida.");
  }

  const { error } = await admin.from("billing_subscriptions").upsert(
    {
      user_id: reference.userId,
      provider: "mercado_pago",
      provider_subscription_id: subscription.id,
      plan_id: reference.planId,
      status: validPrice && currency === "BRL" ? subscription.status : "invalid_amount",
      payer_email: subscription.payer_email || null,
      amount,
      currency,
      checkout_url: subscription.init_point || null,
      next_payment_at: subscription.next_payment_date || null,
      provider_created_at: subscription.date_created || null,
      provider_updated_at: subscription.last_modified || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_subscription_id" }
  );

  if (error) {
    console.error("Failed to persist billing subscription", error.message);
    throw new Error("Não foi possível atualizar a assinatura.");
  }
}
