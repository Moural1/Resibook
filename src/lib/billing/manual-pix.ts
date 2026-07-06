import { normalizeBillingEmail } from "./email.ts";
import { getBillingPlan, type BillingPlanId } from "./plans.ts";

type BillingEnv = Record<string, string | undefined>;

export type ManualPixStatus = "pending" | "approved" | "rejected" | "canceled";

export type ManualPixOrder = {
  id: string;
  plan_id: BillingPlanId;
  status: ManualPixStatus;
  amount: number;
  customer_email: string;
  customer_name?: string | null;
  notes?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  access_status?: string | null;
  access_started_at?: string | null;
  access_expires_at?: string | null;
};

export type ManualPixAccessState =
  | "pending"
  | "active"
  | "expired"
  | "rejected"
  | "canceled"
  | "missing";

export function getManualPixAccessState(
  order: ManualPixOrder,
  now = new Date()
): ManualPixAccessState {
  if (order.status !== "approved") return order.status;
  if (!order.access_expires_at) return "missing";
  const expiresAt = new Date(order.access_expires_at);
  if (Number.isNaN(expiresAt.getTime())) return "missing";
  return expiresAt.getTime() > now.getTime() ? "active" : "expired";
}

export function getManualPixDaysRemaining(
  expiresAt?: string | null,
  now = new Date()
) {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export function getManualPixConfig(env: BillingEnv = process.env) {
  const key = env.RESIBOOK_PIX_KEY?.trim() || "";
  const receiverName = env.RESIBOOK_PIX_RECEIVER_NAME?.trim() || "";
  const receiverDocument = env.RESIBOOK_PIX_RECEIVER_DOCUMENT?.trim() || "";
  return {
    configured: Boolean(key && receiverName),
    key,
    receiverName,
    receiverDocument,
  };
}

export function buildManualPixOrder(input: {
  userId: string;
  planId: unknown;
  customerEmail: unknown;
  customerName?: unknown;
}) {
  const plan = getBillingPlan(input.planId);
  const customerEmail = normalizeBillingEmail(input.customerEmail);
  if (!plan || !customerEmail) return null;
  const customerName = typeof input.customerName === "string"
    ? input.customerName.trim().slice(0, 120) || null
    : null;

  return {
    user_id: input.userId,
    plan_id: plan.id,
    status: "pending" as const,
    payment_method: "pix_manual" as const,
    amount: plan.price,
    customer_email: customerEmail,
    customer_name: customerName,
  };
}
