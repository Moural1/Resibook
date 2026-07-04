export type BillingEntitlement = {
  plan_id: string;
  status: string;
  current_period_end?: string | null;
};

export function hasSubscriptionAccess(
  subscription: BillingEntitlement,
  now = new Date()
) {
  if (subscription.status === "authorized") return true;
  if (subscription.status !== "cancelled" || !subscription.current_period_end) {
    return false;
  }

  const periodEnd = new Date(subscription.current_period_end);
  return !Number.isNaN(periodEnd.getTime()) && periodEnd.getTime() > now.getTime();
}

export function getBestActiveEntitlement(
  subscriptions: BillingEntitlement[] | null | undefined,
  now = new Date()
) {
  return (subscriptions || [])
    .filter((subscription) => hasSubscriptionAccess(subscription, now))
    .sort((left, right) => {
      const leftPriority = left.plan_id === "complete" ? 1 : 0;
      const rightPriority = right.plan_id === "complete" ? 1 : 0;
      return rightPriority - leftPriority;
    })[0] || null;
}

