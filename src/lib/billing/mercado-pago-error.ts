import { sanitizeBillingLog } from "./logger.ts";

export type MercadoPagoDiagnostic = {
  message: string | null;
  error: string | null;
  statusDetail: string | null;
  cause: unknown[];
};

function readString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return sanitizeBillingLog(value.trim()) as string;
}

export function extractMercadoPagoDiagnostic(payload: unknown): MercadoPagoDiagnostic {
  const record = payload && typeof payload === "object"
    ? payload as Record<string, unknown>
    : {};
  const cause = Array.isArray(record.cause) ? record.cause : [];

  return {
    message: readString(record.message),
    error: readString(record.error),
    statusDetail:
      readString(record.status_detail) || readString(record.statusDetail),
    cause: sanitizeBillingLog(cause) as unknown[],
  };
}

export class MercadoPagoApiError extends Error {
  readonly name = "MercadoPagoApiError";
  readonly status: number;
  readonly endpoint: string;
  readonly diagnostic: MercadoPagoDiagnostic;
  readonly requestId: string | null;

  constructor(
    status: number,
    endpoint: string,
    diagnostic: MercadoPagoDiagnostic,
    requestId: string | null
  ) {
    super("Mercado Pago request failed");
    this.status = status;
    this.endpoint = endpoint;
    this.diagnostic = diagnostic;
    this.requestId = requestId;
  }
}

export function mercadoPagoErrorResponse(error: MercadoPagoApiError) {
  return {
    error: "mercado_pago_checkout_failed",
    mercadoPagoStatus: error.status,
    mercadoPagoMessage: error.diagnostic.message || error.diagnostic.error,
    mercadoPagoStatusDetail: error.diagnostic.statusDetail,
    mercadoPagoCause: error.diagnostic.cause,
  };
}
