import { createHmac, timingSafeEqual } from "node:crypto";
import type { BillingEnvironment } from "./config";
import type { BillingPlanId } from "./plans";

export type ParsedExternalReference = {
  userId: string;
  planId: BillingPlanId;
  environment: BillingEnvironment;
};

export function buildExternalReference(
  userId: string,
  planId: BillingPlanId,
  environment: BillingEnvironment = "production"
) {
  return `resibook|${environment}|${userId}|${planId}`;
}

export function parseExternalReference(value?: string | null) {
  const parts = String(value || "").split("|");
  const legacy = parts.length === 3;
  const [product, rawEnvironment, rawUserId, rawPlanId] = legacy
    ? [parts[0], "production", parts[1], parts[2]]
    : parts;
  const environment = rawEnvironment as BillingEnvironment;
  const userId = rawUserId;
  const planId = rawPlanId;
  if (
    product !== "resibook" ||
    (environment !== "test" && environment !== "production") ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(userId || "") ||
    (planId !== "basic" && planId !== "complete")
  ) {
    return null;
  }

  return { userId, planId: planId as BillingPlanId, environment };
}

export function verifyMercadoPagoSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string | undefined;
}) {
  const secret = input.secret;
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
