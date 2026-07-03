import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mercadoPagoRequest,
  syncMercadoPagoSubscription,
  type MercadoPagoSubscription,
} from "@/lib/billing/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: current } = await supabase
    .from("billing_subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!current?.provider_subscription_id) {
    return NextResponse.json({ status: "none" });
  }

  try {
    const subscription = await mercadoPagoRequest<MercadoPagoSubscription>(
      `/preapproval/${encodeURIComponent(current.provider_subscription_id)}`
    );
    await syncMercadoPagoSubscription(subscription);
    return NextResponse.json({ status: subscription.status });
  } catch (error) {
    console.error("Failed to refresh subscription", error);
    return NextResponse.json({ error: "Não foi possível atualizar a assinatura." }, { status: 503 });
  }
}
