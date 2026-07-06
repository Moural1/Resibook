import { createClient } from "@supabase/supabase-js";
import {
  getBillingEnvironment,
  getMercadoPagoAccessToken,
  type BillingEnvironment,
} from "./config";
import { logBillingError } from "./logger";
import {
  extractMercadoPagoDiagnostic,
  MercadoPagoApiError,
} from "./mercado-pago-error";
import { buildSubscriptionRow, type SubscriptionSnapshot } from "./persistence";
import { parseExternalReference } from "./security";

export { buildExternalReference, verifyMercadoPagoSignature } from "./security";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

function parseRequestBody(body?: BodyInit | null) {
  if (typeof body !== "string") return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

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
    const diagnostic = extractMercadoPagoDiagnostic(payload);
    const endpoint = path.split("?")[0];
    const requestId = response.headers.get("x-request-id");
    logBillingError("mercado_pago_request_failed", {
      environment,
      status: response.status,
      endpoint,
      method: init?.method || "GET",
      message: diagnostic.message,
      error: diagnostic.error,
      statusDetail: diagnostic.statusDetail,
      cause: diagnostic.cause,
      requestId,
      payload: parseRequestBody(init?.body),
    });
    throw new MercadoPagoApiError(
      response.status,
      endpoint,
      diagnostic,
      requestId
    );
  }

  return payload;
}

export async function syncMercadoPagoSubscription(
  subscription: MercadoPagoSubscription,
  environment: BillingEnvironment = getBillingEnvironment(),
  context?: {
    id?: string | number | null;
    periodStart?: string | null;
    periodEnd?: string | null;
    paymentStatus?: string | null;
    paymentStatusDetail?: string | null;
  }
) {
  const reference = parseExternalReference(subscription.external_reference);
  const admin = createBillingAdminClient();
  if (!reference || reference.environment !== environment || !admin) {
    throw new Error("Assinatura sem vínculo válido para este ambiente.");
  }

  const { data: account, error: accountError } = await admin.auth.admin.getUserById(
    reference.userId
  );
  if (accountError || !account.user) {
    throw new Error("Assinatura vinculada a uma conta inválida.");
  }

  const { data: existing } = await admin
    .from("billing_subscriptions")
    .select("status, mercado_pago_payment_id, current_period_start, current_period_end, last_payment_status, last_payment_status_detail")
    .eq("provider_subscription_id", subscription.id)
    .maybeSingle();

  const row = buildSubscriptionRow({
    subscription,
    reference,
    environment,
    paymentId: context?.id
      ? String(context.id)
      : existing?.mercado_pago_payment_id,
    currentPeriodStart:
      context?.periodStart || existing?.current_period_start,
    currentPeriodEnd: context?.periodEnd || existing?.current_period_end,
    paymentStatus: context?.paymentStatus ?? existing?.last_payment_status,
    paymentStatusDetail:
      context?.paymentStatusDetail ?? existing?.last_payment_status_detail,
    keepAccessAfterCancellation:
      subscription.status !== "cancelled" ||
      existing?.status === "authorized" ||
      (existing?.status === "cancelled" && Boolean(existing.current_period_end)),
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
