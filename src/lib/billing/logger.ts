const SENSITIVE_KEY = /authorization|token|secret|password|card|email|cpf|cns/i;

export function sanitizeBillingLog(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: "[REDACTED]" };
  }
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

