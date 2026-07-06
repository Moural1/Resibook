import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isDisabledCommercialRoute } from "../src/lib/product-config.ts";
import {
  isResibookAdmin,
  isSubscriptionExempt,
} from "../src/lib/auth-role.ts";
import { BILLING_PLANS, MERCADO_PAGO_WEBHOOK_URL } from "../src/lib/billing/plans.ts";
import {
  getBillingRuntimeConfig,
  getMercadoPagoAccessToken,
} from "../src/lib/billing/config.ts";
import { buildCheckoutPayload } from "../src/lib/billing/checkout-payload.ts";
import { sanitizeBillingLog } from "../src/lib/billing/logger.ts";
import { buildSubscriptionRow } from "../src/lib/billing/persistence.ts";
import { normalizeBillingEmail } from "../src/lib/billing/email.ts";
import {
  extractMercadoPagoDiagnostic,
  MercadoPagoApiError,
  mercadoPagoErrorResponse,
} from "../src/lib/billing/mercado-pago-error.ts";
import {
  buildManualPixOrder,
  getManualPixAccessState,
  getManualPixDaysRemaining,
  getManualPixConfig,
} from "../src/lib/billing/manual-pix.ts";
import {
  getBestActiveEntitlement,
  hasSubscriptionAccess,
} from "../src/lib/billing/entitlement.ts";
import {
  buildExternalReference,
  parseExternalReference,
  verifyMercadoPagoSignature,
} from "../src/lib/billing/security.ts";

test("carteira de pacientes permanece disponível para usuários autenticados", () => {
  assert.equal(isDisabledCommercialRoute("/pacientes"), false);
  assert.equal(isDisabledCommercialRoute("/pacientes/123"), false);
  assert.equal(isDisabledCommercialRoute("/api/patients"), false);
  assert.equal(isDisabledCommercialRoute("/api/patients/123"), false);
});

test("conta proprietária é reconhecida como administradora", () => {
  assert.equal(isResibookAdmin({ email: "igormoura@resibook.com" }), true);
  assert.equal(isResibookAdmin({ email: "medico@example.com" }), false);
  assert.equal(
    isResibookAdmin({
      email: "medico@example.com",
      app_metadata: { role: "admin" },
    }),
    true
  );
});

test("contas internas ficam isentas da cobrança sem receber permissão administrativa", () => {
  for (const email of ["liviarosa@resibook.com", "convidado@resibook.com"]) {
    assert.equal(isSubscriptionExempt({ email }), true);
    assert.equal(isResibookAdmin({ email }), false);
  }
  assert.equal(isSubscriptionExempt({ email: " LIVIAROSA@RESIBOOK.COM " }), true);
  assert.equal(isSubscriptionExempt({ email: "medico@example.com" }), false);
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
    billingEmail: "real@example.com",
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
    billingEmail: "customer@example.com",
    siteUrl: "https://www.resibook.com.br",
  });
  assert.equal(payload.payer_email, "customer@example.com");
  assert.doesNotMatch(payload.reason, /TESTE/);
  assert.match(payload.external_reference, /\|production\|/);
  assert.equal(getMercadoPagoAccessToken("production", env), "production-token");
  assert.notEqual(getMercadoPagoAccessToken("production", {
    ...env,
    MERCADO_PAGO_TEST_ACCESS_TOKEN: "test-token",
  }), "test-token");
});

test("e-mail de cobrança é editável, normalizado e validado", () => {
  assert.equal(normalizeBillingEmail(" Buyer@Example.COM "), "buyer@example.com");
  assert.equal(normalizeBillingEmail("email-invalido"), null);
});

test("erro do Mercado Pago retorna diagnóstico controlado e sanitizado", () => {
  const diagnostic = extractMercadoPagoDiagnostic({
    message: "payer buyer@example.com invalid",
    error: "bad_request",
    status_detail: "subscription_invalid_user",
    cause: [{ code: "invalid_email", payer_email: "buyer@example.com" }],
  });
  const response = mercadoPagoErrorResponse(
    new MercadoPagoApiError(400, "/preapproval", diagnostic, "request-123")
  );
  assert.equal(response.error, "mercado_pago_checkout_failed");
  assert.equal(response.mercadoPagoStatus, 400);
  assert.equal(response.mercadoPagoStatusDetail, "subscription_invalid_user");
  assert.doesNotMatch(JSON.stringify(response), /buyer@example\.com/);
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

  const rejected = buildSubscriptionRow({
    environment: "production",
    reference: { ...reference, environment: "production" },
    paymentStatus: "rejected",
    paymentStatusDetail: "cc_rejected_other_reason",
    subscription: {
      id: "preapproval-rejected",
      status: "pending",
      auto_recurring: { transaction_amount: 30, currency_id: "BRL" },
    },
  });
  assert.equal(rejected.status, "payment_failed");
  assert.equal(hasSubscriptionAccess(rejected), false);
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

test("cancelamento mantém acesso somente até o fim do período pago", () => {
  const now = new Date("2026-07-04T12:00:00.000Z");
  assert.equal(
    hasSubscriptionAccess(
      {
        plan_id: "complete",
        status: "cancelled",
        current_period_end: "2026-08-04T12:00:00.000Z",
      },
      now
    ),
    true
  );
  assert.equal(
    hasSubscriptionAccess(
      {
        plan_id: "complete",
        status: "cancelled",
        current_period_end: "2026-07-03T12:00:00.000Z",
      },
      now
    ),
    false
  );
});

test("plano completo ativo prevalece sobre o básico", () => {
  const entitlement = getBestActiveEntitlement([
    { plan_id: "basic", status: "authorized", current_period_end: null },
    { plan_id: "complete", status: "authorized", current_period_end: null },
  ]);
  assert.equal(entitlement?.plan_id, "complete");
});

test("cancelamento pendente não cria período de acesso pago", () => {
  const row = buildSubscriptionRow({
    environment: "production",
    reference: {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      planId: "basic",
      environment: "production",
    },
    currentPeriodEnd: "2026-08-04T12:00:00.000Z",
    keepAccessAfterCancellation: false,
    subscription: {
      id: "preapproval-pending-cancelled",
      status: "cancelled",
      next_payment_date: "2026-08-04T12:00:00.000Z",
    },
  });
  assert.equal(row.current_period_end, null);
});

test("Pix manual cria pedido pending com preço controlado pelo servidor", () => {
  const order = buildManualPixOrder({
    userId: "123e4567-e89b-12d3-a456-426614174000",
    planId: "complete",
    customerEmail: "doctor@example.com",
    customerName: "Dra. Teste",
  });
  assert.equal(order?.status, "pending");
  assert.equal(order?.payment_method, "pix_manual");
  assert.equal(order?.amount, 50);
  assert.equal(getManualPixConfig({}).configured, false);
});

test("Pix manual aprovado libera somente o período vigente", () => {
  const now = new Date("2026-07-05T12:00:00.000Z");
  assert.equal(hasSubscriptionAccess({
    plan_id: "complete",
    status: "active",
    current_period_end: "2026-08-04T12:00:00.000Z",
  }, now), true);
  assert.equal(hasSubscriptionAccess({
    plan_id: "complete",
    status: "active",
    current_period_end: "2026-07-04T12:00:00.000Z",
  }, now), false);
  assert.equal(hasSubscriptionAccess({
    plan_id: "complete",
    status: "rejected",
    current_period_end: "2026-08-04T12:00:00.000Z",
  }, now), false);
});

test("painel Pix identifica vencimento e dias restantes", () => {
  const order = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    plan_id: "complete",
    status: "approved",
    amount: 50,
    customer_email: "doctor@example.com",
    created_at: "2026-07-05T12:00:00.000Z",
    access_expires_at: "2026-07-08T00:00:00.000Z",
  };
  assert.equal(
    getManualPixAccessState(order, new Date("2026-07-06T12:00:00.000Z")),
    "active"
  );
  assert.equal(
    getManualPixDaysRemaining(order.access_expires_at, new Date("2026-07-06T12:00:00.000Z")),
    2
  );
  assert.equal(
    getManualPixAccessState(order, new Date("2026-07-08T00:00:00.000Z")),
    "expired"
  );
});

test("limpeza de usuários protege contas internas e remove registros órfãos", () => {
  const route = readFileSync(
    new URL("../src/app/api/admin/users/route.ts", import.meta.url),
    "utf8"
  );
  assert.match(route, /isSubscriptionExempt\(\{ email \}\)/);
  assert.match(route, /from\("login_logs"\)\.delete\(\)/);
  assert.match(route, /from\("blocked_users"\)\.delete\(\)/);
  assert.match(route, /deletedAccount: Boolean\(target\)/);
});

test("migration Pix isola usuários e restringe aprovação ao admin", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20260705120000_manual_pix_billing.sql", import.meta.url),
    "utf8"
  );
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /public\.is_resibook_admin\(\)/);
  assert.match(migration, /if not public\.is_resibook_admin\(\)/);
  assert.match(migration, /status = 'active'/);
  assert.match(migration, /payment_method[\s\S]+pix_manual/);
  assert.doesNotMatch(migration, /for update to authenticated[\s\S]{0,120}user_id = \(select auth\.uid\(\)\)/);
});

test("nova tentativa de pagamento não libera acesso pelo botão", () => {
  const actions = readFileSync(
    new URL("../src/app/minha-assinatura/billing-actions.tsx", import.meta.url),
    "utf8"
  );
  assert.match(actions, /retry=1/);
  assert.doesNotMatch(actions, /status:\s*["']authorized["']/);
});
