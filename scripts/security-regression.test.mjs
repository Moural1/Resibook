import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { isDisabledCommercialRoute } from "../src/lib/product-config.ts";
import { BILLING_PLANS, MERCADO_PAGO_WEBHOOK_URL } from "../src/lib/billing/plans.ts";
import { getBillingRuntimeConfig } from "../src/lib/billing/config.ts";
import { buildCheckoutPayload } from "../src/lib/billing/checkout-payload.ts";
import { sanitizeBillingLog } from "../src/lib/billing/logger.ts";
import { buildSubscriptionRow } from "../src/lib/billing/persistence.ts";
import {
  buildExternalReference,
  parseExternalReference,
  verifyMercadoPagoSignature,
} from "../src/lib/billing/security.ts";

test("edição biblioteca bloqueia prontuário na página e na API", () => {
  assert.equal(isDisabledCommercialRoute("/pacientes"), true);
  assert.equal(isDisabledCommercialRoute("/pacientes/123"), true);
  assert.equal(isDisabledCommercialRoute("/api/patients"), true);
  assert.equal(isDisabledCommercialRoute("/api/patients/123"), true);
});

test("edição biblioteca bloqueia IA clínica e consultas também nas APIs", () => {
  assert.equal(isDisabledCommercialRoute("/consulta-audio"), true);
  assert.equal(isDisabledCommercialRoute("/api/ai/case-review"), true);
  assert.equal(isDisabledCommercialRoute("/api/consultas"), true);
  assert.equal(isDisabledCommercialRoute("/api/consultas/123"), true);
});

test("rotas da biblioteca permanecem disponíveis", () => {
  assert.equal(isDisabledCommercialRoute("/calculadoras"), false);
  assert.equal(isDisabledCommercialRoute("/meu-resibook"), false);
  assert.equal(isDisabledCommercialRoute("/api/global-search"), false);
});

test("preços dos planos não podem ser controlados pelo navegador", () => {
  assert.equal(BILLING_PLANS.basic.price, 30);
  assert.equal(BILLING_PLANS.complete.price, 50);
});

test("checkout usa o webhook público definitivo de assinaturas", () => {
  assert.equal(
    MERCADO_PAGO_WEBHOOK_URL,
    "https://www.resibook.com.br/api/mercado-pago/webhook"
  );
});

test("referência de cobrança vincula somente usuário e plano válidos", () => {
  const userId = "123e4567-e89b-12d3-a456-426614174000";
  const reference = buildExternalReference(userId, "complete", "test");
  assert.deepEqual(parseExternalReference(reference), {
    userId,
    planId: "complete",
    environment: "test",
  });
  assert.deepEqual(parseExternalReference(`resibook|${userId}|basic`), {
    userId,
    planId: "basic",
    environment: "production",
  });
  assert.equal(parseExternalReference("resibook|outro|admin"), null);
});

test("webhook do Mercado Pago exige assinatura HMAC válida", () => {
  const secret = "segredo-de-teste";
  const dataId = "ABC123";
  const requestId = "request-1";
  const timestamp = "1704908010";
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const hash = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  assert.equal(verifyMercadoPagoSignature({
    xSignature: `ts=${timestamp},v1=${hash}`,
    xRequestId: requestId,
    dataId,
    secret,
  }), true);
  assert.equal(verifyMercadoPagoSignature({
    xSignature: `ts=${timestamp},v1=${"0".repeat(64)}`,
    xRequestId: requestId,
    dataId,
    secret,
  }), false);
});

test("checkout de teste usa comprador, referência e aviso isolados", () => {
  const payload = buildCheckoutPayload({
    environment: "test",
    plan: BILLING_PLANS.basic,
    userId: "123e4567-e89b-12d3-a456-426614174000",
    accountEmail: "real@example.com",
    testPayerEmail: "buyer@testuser.com",
    siteUrl: "https://preview.example.com",
  });
  assert.equal(payload.payer_email, "buyer@testuser.com");
  assert.match(payload.reason, /^\[TESTE\]/);
  assert.match(payload.external_reference, /\|test\|/);
  assert.equal(payload.notification_url, MERCADO_PAGO_WEBHOOK_URL);
});

test("checkout de produção preserva o comprador real e exige env crítica", () => {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    MERCADO_PAGO_ACCESS_TOKEN: "production-token",
    MERCADO_PAGO_WEBHOOK_SECRET: "production-secret",
    RESIBOOK_BILLING_TEST_MODE: "false",
  };
  assert.equal(getBillingRuntimeConfig(env).configured, true);
  assert.equal(getBillingRuntimeConfig({ ...env, MERCADO_PAGO_ACCESS_TOKEN: "" }).configured, false);

  const payload = buildCheckoutPayload({
    environment: "production",
    plan: BILLING_PLANS.complete,
    userId: "123e4567-e89b-12d3-a456-426614174000",
    accountEmail: "customer@example.com",
    siteUrl: "https://www.resibook.com.br",
  });
  assert.equal(payload.payer_email, "customer@example.com");
  assert.doesNotMatch(payload.reason, /TESTE/);
  assert.match(payload.external_reference, /\|production\|/);
});

test("modo teste nunca permite enforcement comercial", () => {
  const config = getBillingRuntimeConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    MERCADO_PAGO_TEST_ACCESS_TOKEN: "test-token",
    MERCADO_PAGO_TEST_WEBHOOK_SECRET: "test-secret",
    MERCADO_PAGO_TEST_PAYER_EMAIL: "buyer@testuser.com",
    RESIBOOK_BILLING_TEST_MODE: "true",
    RESIBOOK_ENFORCE_SUBSCRIPTIONS: "true",
  });
  assert.equal(config.configured, true);
  assert.equal(config.enforcementSafe, false);
});

test("enforcement false mantém o acesso liberado mesmo com produção configurada", () => {
  const config = getBillingRuntimeConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    MERCADO_PAGO_ACCESS_TOKEN: "production-token",
    MERCADO_PAGO_WEBHOOK_SECRET: "production-secret",
    RESIBOOK_BILLING_TEST_MODE: "false",
    RESIBOOK_ENFORCE_SUBSCRIPTIONS: "false",
  });
  assert.equal(config.configured, true);
  assert.equal(config.enforcementRequested, false);
  assert.equal(config.enforcementSafe, false);
});

test("referências externas mantêm usuários isolados", () => {
  const first = parseExternalReference(
    buildExternalReference("123e4567-e89b-12d3-a456-426614174000", "basic", "production")
  );
  const second = parseExternalReference(
    buildExternalReference("223e4567-e89b-12d3-a456-426614174001", "basic", "production")
  );
  assert.notEqual(first?.userId, second?.userId);
});

test("sincronização prepara billing_subscriptions com ambiente e preço validados", () => {
  const reference = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    planId: "basic",
    environment: "test",
  };
  const valid = buildSubscriptionRow({
    environment: "test",
    reference,
    paymentId: "payment-123",
    currentPeriodStart: "2026-07-03T00:00:00.000Z",
    now: "2026-07-03T00:00:00.000Z",
    subscription: {
      id: "preapproval-1",
      status: "authorized",
      auto_recurring: { transaction_amount: 30, currency_id: "BRL" },
    },
  });
  assert.equal(valid.environment, "test");
  assert.equal(valid.status, "authorized");
  assert.equal(valid.mercado_pago_payment_id, "payment-123");
  assert.equal(valid.current_period_start, "2026-07-03T00:00:00.000Z");

  const invalid = buildSubscriptionRow({
    environment: "test",
    reference,
    subscription: {
      id: "preapproval-2",
      status: "authorized",
      auto_recurring: { transaction_amount: 1, currency_id: "BRL" },
    },
  });
  assert.equal(invalid.status, "invalid_amount");
});

test("logs de billing removem credenciais e dados pessoais", () => {
  const secret = "APP_USR-super-secret-token";
  const sanitized = JSON.stringify(sanitizeBillingLog({
    accessToken: secret,
    webhookSecret: "webhook-value",
    nested: { payerEmail: "person@example.com", status: 401 },
  }));
  assert.doesNotMatch(sanitized, /APP_USR|webhook-value|person@example\.com/);
  assert.match(sanitized, /REDACTED/);
  assert.match(sanitized, /401/);
});
