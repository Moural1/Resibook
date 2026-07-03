import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { isDisabledCommercialRoute } from "../src/lib/product-config.ts";
import { BILLING_PLANS, MERCADO_PAGO_WEBHOOK_URL } from "../src/lib/billing/plans.ts";
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
  const reference = buildExternalReference(userId, "complete");
  assert.deepEqual(parseExternalReference(reference), { userId, planId: "complete" });
  assert.equal(parseExternalReference("resibook|outro|admin"), null);
});

test("webhook do Mercado Pago exige assinatura HMAC válida", () => {
  process.env.MERCADO_PAGO_WEBHOOK_SECRET = "segredo-de-teste";
  const dataId = "ABC123";
  const requestId = "request-1";
  const timestamp = "1704908010";
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const hash = createHmac("sha256", process.env.MERCADO_PAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  assert.equal(verifyMercadoPagoSignature({
    xSignature: `ts=${timestamp},v1=${hash}`,
    xRequestId: requestId,
    dataId,
  }), true);
  assert.equal(verifyMercadoPagoSignature({
    xSignature: `ts=${timestamp},v1=${"0".repeat(64)}`,
    xRequestId: requestId,
    dataId,
  }), false);
  delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
});
