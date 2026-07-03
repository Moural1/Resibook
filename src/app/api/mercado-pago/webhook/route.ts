import { NextResponse } from "next/server";
import {
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  verifyMercadoPagoSignature,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

type WebhookBody = {
  type?: string;
  data?: { id?: string | number };
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = (await request.json().catch(() => null)) as WebhookBody | null;
  const notificationType = url.searchParams.get("type") || body?.type || "";
  const dataId = String(
    url.searchParams.get("data.id") ||
      url.searchParams.get("data_id") ||
      body?.data?.id ||
      ""
  );

  const validSignature = verifyMercadoPagoSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  });
  if (!validSignature) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  if (notificationType !== "subscription_preapproval" || !dataId) {
    return NextResponse.json({ received: true });
  }

  try {
    const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
      `/preapproval/${encodeURIComponent(dataId)}`
    );
    await syncMercadoPagoSubscription(subscription);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to process Mercado Pago webhook", error);
    return NextResponse.json(
      { error: "Falha ao sincronizar assinatura." },
      { status: 500 }
    );
  }
}
