import { createClient } from "@supabase/supabase-js";
import {
  getBillingEnvironment,
  getMercadoPagoAccessToken,
  getTestPayerEmail,
  type BillingEnvironment,
} from "./config";
import { logBillingError } from "./logger";
import { buildSubscriptionRow, type SubscriptionSnapshot } from "./persistence";
import { parseExternalReference } from "./security";

export { buildExternalReference, verifyMercadoPagoSignature } from "./security";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export type MercadoPagoSubscription = SubscriptionSnapshot & {
  external_reference?: string | null;
};

export class BillingConfigurationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Configuração de billing incompleta: ${missing.join(", ")}`);
    this.name = "BillingConfigurationError";
  }
}

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

export async function mercadoPagoRequest<T>(
  path: string,
  init?: RequestInit,
  environment: BillingEnvironment = getBillingEnvironment()
) {
  const accessToken = getMercadoPagoAccessToken(environment);
  if (!accessToken) {
    throw new BillingConfigurationError([
      environment === "test"
        ? "MERCADO_PAGO_TEST_ACCESS_TOKEN"
        : "MERCADO_PAGO_ACCESS_TOKEN",
    ]);
  }

  const response = await fetch(`${MERCADO_PAGO_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !payload) {
    logBillingError("mercado_pago_request_failed", {
      environment,
      status: response.status,
      method: init?.method || "GET",
    });
    throw new Error("Não foi possível processar a assinatura no Mercado Pago.");
  }

  return payload;
}

export async function syncMercadoPagoSubscription(
  subscription: MercadoPagoSubscription,
  environment: BillingEnvironment = getBillingEnvironment(),
  payment?: { id?: string | number | null; periodStart?: string | null }
) {
  const reference = parseExternalReference(subscription.external_reference);
  const admin = createBillingAdminClient();
  if (!reference || reference.environment !== environment || !admin) {
    throw new Error("Assinatura sem vínculo válido para este ambiente.");
  }

  const { data: account, error: accountError } = await admin.auth.admin.getUserById(
    reference.userId
  );
  const payerEmail = subscription.payer_email?.trim().toLowerCase() || "";
  const expectedPayerEmail =
    environment === "test"
      ? getTestPayerEmail()?.toLowerCase() || ""
      : account.user?.email?.trim().toLowerCase() || "";
  if (
    accountError ||
    !account.user ||
    !expectedPayerEmail ||
    (payerEmail && payerEmail !== expectedPayerEmail)
  ) {
    throw new Error("Assinatura vinculada a uma conta inválida.");
  }

  const row = buildSubscriptionRow({
    subscription,
    reference,
    environment,
    paymentId: payment?.id ? String(payment.id) : null,
    currentPeriodStart: payment?.periodStart,
  });
  const { error } = await admin
    .from("billing_subscriptions")
    .upsert(row, { onConflict: "provider_subscription_id" });

  if (error) {
    logBillingError("subscription_persistence_failed", {
      environment,
      databaseCode: error.code,
    });
    throw new Error("Não foi possível atualizar a assinatura.");
  }
}
