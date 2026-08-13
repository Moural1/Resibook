import type { BillingEnvironment } from "./config";
import { createBillingAdminClient } from "./server";

type BillingAdminClient = NonNullable<ReturnType<typeof createBillingAdminClient>>;

export async function claimWebhookEvent(input: {
  admin: BillingAdminClient;
  environment: BillingEnvironment;
  eventId: string;
  notificationType: string;
  dataId: string;
}) {
  const row = {
    provider: "mercado_pago",
    environment: input.environment,
    provider_event_id: input.eventId,
    notification_type: input.notificationType,
    provider_data_id: input.dataId,
    status: "processing",
  };
  const { error } = await input.admin.from("billing_webhook_events").insert(row);
  if (!error) return { claimed: true } as const;

  if (error.code !== "23505") {
    return { claimed: false, unavailable: true, databaseCode: error.code } as const;
  }

  const { data: existing, error: readError } = await input.admin
    .from("billing_webhook_events")
    .select("status")
    .eq("provider", "mercado_pago")
    .eq("environment", input.environment)
    .eq("provider_event_id", input.eventId)
    .maybeSingle();

  if (readError || !existing) {
    return {
      claimed: false,
      unavailable: true,
      databaseCode: readError?.code || "event_not_found",
    } as const;
  }

  if (existing.status !== "failed") return { claimed: false, duplicate: true } as const;

  const { data: retried, error: retryError } = await input.admin
    .from("billing_webhook_events")
    .update({
      status: "processing",
      outcome: null,
      last_error_code: null,
      processed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", "mercado_pago")
    .eq("environment", input.environment)
    .eq("provider_event_id", input.eventId)
    .eq("status", "failed")
    .select("attempts")
    .maybeSingle();

  if (retryError || !retried) {
    return { claimed: false, duplicate: true } as const;
  }

  await input.admin
    .from("billing_webhook_events")
    .update({ attempts: Number(retried.attempts || 1) + 1 })
    .eq("provider", "mercado_pago")
    .eq("environment", input.environment)
    .eq("provider_event_id", input.eventId);

  return { claimed: true } as const;
}

export async function finishWebhookEvent(input: {
  admin: BillingAdminClient;
  environment: BillingEnvironment;
  eventId: string;
  status: "completed" | "failed";
  outcome: string;
}) {
  const now = new Date().toISOString();
  const { error } = await input.admin
    .from("billing_webhook_events")
    .update({
      status: input.status,
      outcome: input.outcome,
      last_error_code: input.status === "failed" ? input.outcome : null,
      updated_at: now,
      processed_at: input.status === "completed" ? now : null,
    })
    .eq("provider", "mercado_pago")
    .eq("environment", input.environment)
    .eq("provider_event_id", input.eventId);

  if (error) {
    console.error("[billing] webhook_event_finalize_failed", {
      environment: input.environment,
      databaseCode: error.code,
    });
  }
}
