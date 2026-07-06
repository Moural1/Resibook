import type { BillingEnvironment } from "./config.ts";
import type { BillingPlan } from "./plans.ts";
import { MERCADO_PAGO_WEBHOOK_URL } from "./plans.ts";
import { buildExternalReference } from "./security.ts";

export function buildCheckoutPayload(input: {
  environment: BillingEnvironment;
  plan: BillingPlan;
  userId: string;
  billingEmail: string;
  testPayerEmail?: string;
  siteUrl: string;
}) {
  const isTest = input.environment === "test";
  if (isTest && !input.testPayerEmail) {
    throw new Error("E-mail do comprador de teste não configurado.");
  }

  return {
    reason: `${isTest ? "[TESTE] " : ""}Resibook ${input.plan.name} - assinatura mensal`,
    external_reference: buildExternalReference(
      input.userId,
      input.plan.id,
      input.environment
    ),
    payer_email: isTest ? input.testPayerEmail : input.billingEmail,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: input.plan.price,
      currency_id: "BRL",
    },
    back_url: `${input.siteUrl}/minha-assinatura?retorno=mercado-pago${
      isTest ? "&ambiente=teste" : ""
    }`,
    notification_url: MERCADO_PAGO_WEBHOOK_URL,
    status: "pending",
  };
}
