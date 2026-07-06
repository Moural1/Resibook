import type { BillingEnvironment } from "./config.ts";
import { BILLING_PLANS } from "./plans.ts";
import type { ParsedExternalReference } from "./security.ts";

export type SubscriptionSnapshot = {
  id: string;
  status: string;
  payer_email?: string | null;
  init_point?: string | null;
  next_payment_date?: string | null;
  date_created?: string | null;
  last_modified?: string | null;
  auto_recurring?: {
    transaction_amount?: number | string | null;
    currency_id?: string | null;
  } | null;
};

export function buildSubscriptionRow(input: {
  subscription: SubscriptionSnapshot;
  reference: ParsedExternalReference;
  environment: BillingEnvironment;
  paymentId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  paymentStatus?: string | null;
  paymentStatusDetail?: string | null;
  keepAccessAfterCancellation?: boolean;
  now?: string;
}) {
  const { subscription, reference, environment } = input;
  const plan = BILLING_PLANS[reference.planId];
  const amount = Number(subscription.auto_recurring?.transaction_amount ?? plan.price);
  const currency = subscription.auto_recurring?.currency_id || "BRL";
  const validPrice = Number.isFinite(amount) && Math.abs(amount - plan.price) < 0.01;

  return {
    user_id: reference.userId,
    provider: "mercado_pago",
    provider_subscription_id: subscription.id,
    ...(input.paymentId ? { mercado_pago_payment_id: input.paymentId } : {}),
    environment,
    plan_id: reference.planId,
    status: !validPrice || currency !== "BRL"
      ? "invalid_amount"
      : subscription.status === "cancelled"
        ? "cancelled"
        : input.paymentStatus === "rejected"
          ? "payment_failed"
          : subscription.status,
    last_payment_status: input.paymentStatus || null,
    last_payment_status_detail: input.paymentStatusDetail || null,
    payer_email: subscription.payer_email || null,
    amount,
    currency,
    checkout_url: subscription.init_point || null,
    next_payment_at: subscription.next_payment_date || null,
    ...(input.currentPeriodStart
      ? { current_period_start: input.currentPeriodStart }
      : {}),
    current_period_end:
      subscription.status === "cancelled" &&
      input.keepAccessAfterCancellation === false
        ? null
        : subscription.next_payment_date || input.currentPeriodEnd || null,
    canceled_at:
      subscription.status === "cancelled"
        ? subscription.last_modified || input.now || new Date().toISOString()
        : null,
    provider_created_at: subscription.date_created || null,
    provider_updated_at: subscription.last_modified || null,
    updated_at: input.now || new Date().toISOString(),
  };
}
