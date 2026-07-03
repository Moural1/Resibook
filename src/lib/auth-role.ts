export const LEGACY_ADMIN_EMAIL = "igormoura@resibook.com";

type AuthUserLike = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export function isResibookAdmin(user?: AuthUserLike | null) {
  const role = user?.app_metadata?.role;
  const email = user?.email?.trim().toLowerCase() || "";
  return role === "admin" || email === LEGACY_ADMIN_EMAIL;
}
