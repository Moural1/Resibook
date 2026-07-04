import { NextResponse } from "next/server";
import {
  getMercadoPagoAccessToken,
  getMercadoPagoWebhookSecret,
  type BillingEnvironment,
} from "@/lib/billing/config";
import { logBillingError } from "@/lib/billing/logger";
import { parseExternalReference } from "@/lib/billing/security";
import {
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  verifyMercadoPagoSignature,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

type WebhookBody = {
  action?: string;
  type?: string;
  data?: { id?: string | number };
};

type AuthorizedPayment = {
  id: string | number;
  preapproval_id?: string | null;
  debit_date?: string | null;
  payment?: { id?: string | number | null } | null;
};

type AuthorizedPaymentSearch = { results?: AuthorizedPayment[] };

const ENVIRONMENTS: BillingEnvironment[] = ["production", "test"];
const SUPPORTED_TYPES = new Set([
  "payment",
  "subscription_preapproval",
  "subscription_authorized_payment",
  "subscription_preapproval_plan",
]);

async function getSubscriptionNotification(
  type: string,
  dataId: string,
  environment: BillingEnvironment
) {
  if (type === "subscription_preapproval") {
    return { preapprovalId: dataId, paymentId: null, periodStart: null };
  }

  if (type === "subscription_authorized_payment") {
    const invoice = await mercadoPagoRequest<AuthorizedPayment>(
      `/authorized_payments/${encodeURIComponent(dataId)}`,
      undefined,
      environment
    );
    return {
      preapprovalId: invoice.preapproval_id || null,
      paymentId: invoice.payment?.id || null,
      periodStart: invoice.debit_date || null,
    };
  }

  if (type === "payment") {
    // A payment notification does not identify the subscription directly.
    // Resolve it through the provider's authorized-payment search endpoint.
    const result = await mercadoPagoRequest<AuthorizedPaymentSearch>(
      `/authorized_payments/search?payment_id=${encodeURIComponent(dataId)}`,
      undefined,
      environment
    );
    const invoice = result.results?.[0];
    return {
      preapprovalId: invoice?.preapproval_id || null,
      paymentId: invoice?.payment?.id || dataId,
      periodStart: invoice?.debit_date || null,
    };
  }

  return { preapprovalId: null, paymentId: null, periodStart: null };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = (await request.json().catch(() => null)) as WebhookBody | null;
  const notificationType = url.searchParams.get("type") || body?.type || "";
  const dataId = String(
    url.searchParams.get("data.id") ||
      url.searchParams.get("data_id") ||
      body?.data?.id ||
      ""
  );
  const signatureInput = {
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  };
  const environmentsWithSecret = ENVIRONMENTS.filter((environment) =>
    getMercadoPagoWebhookSecret(environment)
  );
  if (environmentsWithSecret.length === 0) {
    return NextResponse.json(
      { error: "Webhook não configurado.", code: "billing_configuration_invalid" },
      { status: 503 }
    );
  }

  const verifiedEnvironments = environmentsWithSecret.filter((environment) =>
    verifyMercadoPagoSignature({
      ...signatureInput,
      secret: getMercadoPagoWebhookSecret(environment),
    })
  );
  if (verifiedEnvironments.length === 0) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  if (!SUPPORTED_TYPES.has(notificationType) || !dataId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  let configurationMissing = false;
  for (const environment of verifiedEnvironments) {
    if (!getMercadoPagoAccessToken(environment)) {
      configurationMissing = true;
      continue;
    }

    try {
      if (notificationType === "subscription_preapproval_plan") {
        // The Resibook creates subscriptions without a reusable plan. Querying
        // the provider validates the event, but there is no user row to update.
        await mercadoPagoRequest(
          `/preapproval_plan/${encodeURIComponent(dataId)}`,
          undefined,
          environment
        );
        return NextResponse.json({ received: true, ignored: true });
      }

      const notification = await getSubscriptionNotification(
        notificationType,
        dataId,
        environment
      );
      if (!notification.preapprovalId) {
        // A generic payment may not belong to a Resibook subscription.
        if (notificationType === "payment") {
          return NextResponse.json({ received: true, ignored: true });
        }
        throw new Error("Notificação sem assinatura vinculada.");
      }

      const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
        `/preapproval/${encodeURIComponent(notification.preapprovalId)}`,
        undefined,
        environment
      );
      const reference = parseExternalReference(subscription.external_reference);
      if (!reference || reference.environment !== environment) continue;
      await syncMercadoPagoSubscription(subscription, environment, {
        id: notification.paymentId,
        periodStart: notification.periodStart,
      });
      return NextResponse.json({ received: true });
    } catch {
      logBillingError("webhook_subscription_sync_failed", {
        environment,
        notificationType,
      });
    }
  }

  return NextResponse.json(
    {
      error: configurationMissing
        ? "Configuração do webhook incompleta."
        : "Falha ao sincronizar assinatura.",
      code: configurationMissing ? "billing_configuration_invalid" : "billing_sync_failed",
    },
    { status: configurationMissing ? 503 : 500 }
  );
}
