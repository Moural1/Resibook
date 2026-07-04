export type BillingEnvironment = "test" | "production";

type BillingEnv = Record<string, string | undefined>;

const SHARED_REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const ENVIRONMENT_REQUIRED = {
  production: [
    "MERCADO_PAGO_ACCESS_TOKEN",
    "MERCADO_PAGO_WEBHOOK_SECRET",
  ],
  test: [
    "MERCADO_PAGO_TEST_ACCESS_TOKEN",
    "MERCADO_PAGO_TEST_WEBHOOK_SECRET",
    "MERCADO_PAGO_TEST_PAYER_EMAIL",
  ],
} as const;

export function getBillingEnvironment(
  env: BillingEnv = process.env
): BillingEnvironment {
  return env.RESIBOOK_BILLING_TEST_MODE === "true" ? "test" : "production";
}

export function getBillingRuntimeConfig(env: BillingEnv = process.env) {
  const environment: BillingEnvironment = getBillingEnvironment(env);
  const required = [...SHARED_REQUIRED, ...ENVIRONMENT_REQUIRED[environment]];
  const missing = required.filter((name) => !env[name]?.trim());
  const enforcementRequested = env.RESIBOOK_ENFORCE_SUBSCRIPTIONS === "true";

  return {
    environment,
    testMode: environment === "test",
    configured: missing.length === 0,
    missing,
    enforcementRequested,
    // Test subscriptions must never control access in the commercial environment.
    enforcementSafe:
      enforcementRequested && environment === "production" && missing.length === 0,
  };
}

export function getMercadoPagoAccessToken(
  environment: BillingEnvironment,
  env: BillingEnv = process.env
) {
  return environment === "test"
    ? env.MERCADO_PAGO_TEST_ACCESS_TOKEN?.trim()
    : env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
}

export function getMercadoPagoWebhookSecret(
  environment: BillingEnvironment,
  env: BillingEnv = process.env
) {
  return environment === "test"
    ? env.MERCADO_PAGO_TEST_WEBHOOK_SECRET?.trim()
    : env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
}

export function getTestPayerEmail(env: BillingEnv = process.env) {
  return env.MERCADO_PAGO_TEST_PAYER_EMAIL?.trim();
}
