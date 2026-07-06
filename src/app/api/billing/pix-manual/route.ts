import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBestActiveEntitlement } from "@/lib/billing/entitlement";
import { getBillingEnvironment } from "@/lib/billing/config";
import {
  buildManualPixOrder,
  getManualPixConfig,
} from "@/lib/billing/manual-pix";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("manual_pix_orders")
    .select("id, plan_id, status, amount, customer_email, customer_name, notes, created_at, approved_at, rejected_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "Não foi possível consultar o pedido Pix." }, { status: 503 });
  }
  return NextResponse.json({ order: data || null });
}

export async function POST(request: Request) {
  if (getBillingEnvironment() !== "production") {
    return NextResponse.json(
      { error: "pix_disabled_in_test_mode", message: "Pix manual não fica disponível no modo de teste." },
      { status: 409 }
    );
  }
  const pixConfig = getManualPixConfig();
  if (!pixConfig.configured) {
    return NextResponse.json(
      { error: "pix_not_configured", message: "Pix manual temporariamente indisponível." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    plan?: unknown;
    customerName?: unknown;
  } | null;
  const order = buildManualPixOrder({
    userId: user.id,
    planId: body?.plan,
    customerEmail: user.email,
    customerName: body?.customerName ?? user.user_metadata?.full_name,
  });
  if (!order) {
    return NextResponse.json({ error: "Dados do pedido Pix inválidos." }, { status: 400 });
  }

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("billing_subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", user.id)
    .eq("environment", "production")
    .in("status", ["active", "authorized", "cancelled"])
    .limit(10);
  if (subscriptionError) {
    return NextResponse.json({ error: "Não foi possível validar a assinatura atual." }, { status: 503 });
  }
  if (getBestActiveEntitlement(subscriptions)) {
    return NextResponse.json(
      { error: "subscription_already_active", message: "Sua conta já possui acesso ativo." },
      { status: 409 }
    );
  }

  const { data: pending } = await supabase
    .from("manual_pix_orders")
    .select("id, plan_id, status, amount, customer_email, customer_name, notes, created_at, approved_at, rejected_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (pending) return NextResponse.json({ order: pending, existing: true });

  const { data, error } = await supabase
    .from("manual_pix_orders")
    .insert(order)
    .select("id, plan_id, status, amount, customer_email, customer_name, notes, created_at, approved_at, rejected_at")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "manual_pix_order_failed", message: "Não foi possível criar o pedido Pix." },
      { status: 503 }
    );
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
