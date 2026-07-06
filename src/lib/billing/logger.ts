const SENSITIVE_KEY = /authorization|token|secret|password|card|email|cpf|cns|external_reference|user_id|service_role/i;

function sanitizeString(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/APP_USR-[A-Za-z0-9-]+/g, "[REDACTED_TOKEN]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]");
}

export function sanitizeBillingLog(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: "[REDACTED]" };
  }
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeBillingLog);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeBillingLog(entry),
      ])
    );
  }
  return value;
}

export function logBillingError(event: string, context: Record<string, unknown> = {}) {
  console.error(`[billing] ${event}`, sanitizeBillingLog(context));
}
