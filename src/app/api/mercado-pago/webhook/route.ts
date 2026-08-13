import { NextResponse } from "next/server";
import {
  getMercadoPagoAccessToken,
  getMercadoPagoWebhookSecret,
  type BillingEnvironment,
} from "@/lib/billing/config";
import { logBillingError } from "@/lib/billing/logger";
import { parseExternalReference } from "@/lib/billing/security";
import {
  claimWebhookEvent,
  finishWebhookEvent,
} from "@/lib/billing/webhook-idempotency";
import { buildWebhookEventId } from "@/lib/billing/webhook-event-id";
import {
  createBillingAdminClient,
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  verifyMercadoPagoSignature,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

type WebhookBody = {
  id?: string | number;
  action?: string;
  type?: string;
  data?: { id?: string | number };
};

type AuthorizedPayment = {
  id: string | number;
  preapproval_id?: string | null;
  debit_date?: string | null;
  payment?: {
    id?: string | number | null;
    status?: string | null;
    status_detail?: string | null;
  } | null;
};

type AuthorizedPaymentSearch = { results?: AuthorizedPayment[] };
type MercadoPagoPayment = {
  id: string | number;
  status?: string | null;
  status_detail?: string | null;
};

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
    return {
      preapprovalId: dataId,
      paymentId: null,
      periodStart: null,
      paymentStatus: null,
      paymentStatusDetail: null,
    };
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
      paymentStatus: invoice.payment?.status || null,
      paymentStatusDetail: invoice.payment?.status_detail || null,
    };
  }

  if (type === "payment") {
    // A payment notification does not identify the subscription directly.
    // Resolve it through the provider's authorized-payment search endpoint.
    const payment = await mercadoPagoRequest<MercadoPagoPayment>(
      `/v1/payments/${encodeURIComponent(dataId)}`,
      undefined,
      environment
    );
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
      paymentStatus: payment.status || invoice?.payment?.status || null,
      paymentStatusDetail:
        payment.status_detail || invoice?.payment?.status_detail || null,
    };
  }

  return {
    preapprovalId: null,
    paymentId: null,
    periodStart: null,
    paymentStatus: null,
    paymentStatusDetail: null,
  };
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

  const admin = createBillingAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Webhook não configurado.", code: "billing_configuration_invalid" },
      { status: 503 }
    );
  }

  const eventId = buildWebhookEventId({
    bodyEventId: body?.id,
    requestId: signatureInput.xRequestId,
    notificationType,
    dataId,
    action: body?.action,
  });

  let configurationMissing = false;
  let ignoredEnvironmentMismatch = false;
  for (const environment of verifiedEnvironments) {
    if (!getMercadoPagoAccessToken(environment)) {
      configurationMissing = true;
      continue;
    }

    const claim = await claimWebhookEvent({
      admin,
      environment,
      eventId,
      notificationType,
      dataId,
    });
    if (!claim.claimed) {
      if ("duplicate" in claim && claim.duplicate) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      logBillingError("webhook_event_claim_failed", {
        environment,
        notificationType,
        databaseCode: "databaseCode" in claim ? claim.databaseCode : "unknown",
      });
      return NextResponse.json(
        { error: "Falha ao registrar evento.", code: "billing_event_ledger_failed" },
        { status: 503 }
      );
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
        await finishWebhookEvent({
          admin,
          environment,
          eventId,
          status: "completed",
          outcome: "ignored_plan_event",
        });
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
          await finishWebhookEvent({
            admin,
            environment,
            eventId,
            status: "completed",
            outcome: "ignored_unlinked_payment",
          });
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
      if (!reference || reference.environment !== environment) {
        ignoredEnvironmentMismatch = true;
        await finishWebhookEvent({
          admin,
          environment,
          eventId,
          status: "completed",
          outcome: "ignored_environment_mismatch",
        });
        continue;
      }
      await syncMercadoPagoSubscription(subscription, environment, {
        id: notification.paymentId,
        periodStart: notification.periodStart,
        paymentStatus: notification.paymentStatus,
        paymentStatusDetail: notification.paymentStatusDetail,
      });
      await finishWebhookEvent({
        admin,
        environment,
        eventId,
        status: "completed",
        outcome: "subscription_synced",
      });
      return NextResponse.json({ received: true });
    } catch {
      await finishWebhookEvent({
        admin,
        environment,
        eventId,
        status: "failed",
        outcome: "subscription_sync_failed",
      });
      logBillingError("webhook_subscription_sync_failed", {
        environment,
        notificationType,
      });
    }
  }

  if (ignoredEnvironmentMismatch && !configurationMissing) {
    return NextResponse.json({ received: true, ignored: true });
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
