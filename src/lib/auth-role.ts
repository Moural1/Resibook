export const LEGACY_ADMIN_EMAIL = "igormoura@resibook.com";

const SUBSCRIPTION_EXEMPT_EMAILS = new Set([
  "liviarosa@resibook.com",
  "convidado@resibook.com",
]);

type AuthUserLike = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export function isResibookAdmin(user?: AuthUserLike | null) {
  const role = user?.app_metadata?.role;
  const email = user?.email?.trim().toLowerCase() || "";
  return role === "admin" || email === LEGACY_ADMIN_EMAIL;
}

export function isSubscriptionExempt(user?: AuthUserLike | null) {
  const email = user?.email?.trim().toLowerCase() || "";
  return SUBSCRIPTION_EXEMPT_EMAILS.has(email);
}
