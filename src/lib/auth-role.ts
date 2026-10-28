const SUBSCRIPTION_EXEMPT_EMAILS = new Set([
  "igormouralopes@hotmail.com",
  "liviarosa@resibook.com",
  "convidado@resibook.com",
  "thiagoyan@resibook.com",
  "isabellaestevo@resibook.com",
]);

type AuthUserLike = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

/* Admin só pela marcação interna da conta (app_metadata, que o usuário não
   altera). E-mail nunca dá permissão: um domínio pode mudar de dono. */
export function isResibookAdmin(user?: AuthUserLike | null) {
  return user?.app_metadata?.role === "admin";
}

export function isSubscriptionExempt(user?: AuthUserLike | null) {
  const email = user?.email?.trim().toLowerCase() || "";
  return SUBSCRIPTION_EXEMPT_EMAILS.has(email);
}
