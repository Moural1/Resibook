import { createHmac, timingSafeEqual } from "node:crypto";
import type { BillingPlanId } from "./plans";

export function buildExternalReference(userId: string, planId: BillingPlanId) {
  return `resibook|${userId}|${planId}`;
}

export function parseExternalReference(value?: string | null) {
  const [product, userId, planId] = String(value || "").split("|");
  if (
    product !== "resibook" ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(userId || "") ||
    (planId !== "basic" && planId !== "complete")
  ) {
    return null;
  }

  return { userId, planId: planId as BillingPlanId };
}

export function verifyMercadoPagoSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
}) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret || !input.xSignature || !input.xRequestId || !input.dataId) {
    return false;
  }

  const signatureParts = Object.fromEntries(
    input.xSignature.split(",").map((part) => {
      const [key, value] = part.trim().split("=");
      return [key, value];
    })
  );
  const timestamp = signatureParts.ts;
  const receivedHash = signatureParts.v1;
  if (!timestamp || !receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return false;
  }

  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.xRequestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");
  return timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(receivedHash, "hex"));
}
