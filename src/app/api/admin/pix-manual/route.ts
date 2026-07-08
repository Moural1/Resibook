import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";
import { getBillingPlan } from "@/lib/billing/plans";
import { createBillingAdminClient } from "@/lib/billing/server";

const MANUAL_PIX_DAYS = 30;

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: "Sessão não autenticada.", status: 401 } as const;
  if (!isResibookAdmin(user)) {
    return { error: "Ação permitida apenas ao administrador.", status: 403 } as const;
  }
  return { supabase, user };
}

export async function GET() {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  const { data, error } = await authorization.supabase
    .from("manual_pix_orders")
    .select("id, user_id, plan_id, status, amount, customer_email, customer_name, notes, created_at, approved_at, rejected_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json({ error: "Não foi possível listar os pedidos Pix." }, { status: 503 });
  }
  const orders = data || [];
  const admin = createBillingAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Consulta de vencimentos não configurada no servidor." },
      { status: 503 }
    );
  }

  const subscriptionIds = orders.map((order) => `pix_manual:${order.id}`);
  const { data: subscriptions, error: subscriptionError } = subscriptionIds.length
    ? await admin
        .from("billing_subscriptions")
        .select("provider_subscription_id, status, current_period_start, current_period_end")
        .in("provider_subscription_id", subscriptionIds)
    : { data: [], error: null };
  if (subscriptionError) {
    return NextResponse.json(
      { error: "Não foi possível consultar os vencimentos dos acessos Pix." },
      { status: 503 }
    );
  }

  const subscriptionsByOrder = new Map(
    (subscriptions || []).map((subscription) => [
      subscription.provider_subscription_id,
      subscription,
    ])
  );
  const ordersWithAccess = orders.map((order) => {
    const subscription = subscriptionsByOrder.get(`pix_manual:${order.id}`);
    return {
      ...order,
      access_status: subscription?.status || null,
      access_started_at: subscription?.current_period_start || null,
      access_expires_at: subscription?.current_period_end || null,
    };
  });

  return NextResponse.json({ orders: ordersWithAccess });
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    orderId?: unknown;
    decision?: unknown;
    action?: unknown;
    notes?: unknown;
  } | null;
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const action = body?.action === "renew" || body?.action === "revoke"
    ? body.action
    : null;
  const decision = body?.decision === "approved" || body?.decision === "rejected"
    ? body.decision
    : null;
  const notes = typeof body?.notes === "string" ? body.notes.slice(0, 1000) : null;
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || (!decision && !action)) {
    return NextResponse.json({ error: "Revisão inválida." }, { status: 400 });
  }

  if (action) {
    return handleAccessAction({
      action,
      orderId,
      notes,
      supabase: authorization.supabase,
    });
  }

  const { data, error } = await authorization.supabase.rpc(
    "review_manual_pix_order",
    { p_order_id: orderId, p_decision: decision, p_notes: notes }
  );
  if (error) {
    return NextResponse.json(
      { error: "Não foi possível revisar o pedido Pix.", code: error.code },
      { status: error.code === "42501" ? 403 : 409 }
    );
  }

  return NextResponse.json({ order: data });
}

async function handleAccessAction(input: {
  action: "renew" | "revoke";
  orderId: string;
  notes: string | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const admin = createBillingAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Gestão de vencimentos não configurada no servidor." },
      { status: 503 }
    );
  }

  const { data: order, error: orderError } = await input.supabase
    .from("manual_pix_orders")
    .select("id, user_id, plan_id, status, amount, customer_email")
    .eq("id", input.orderId)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "Pedido Pix não encontrado." }, { status: 404 });
  }

  if (input.action === "renew" && order.status !== "approved") {
    return NextResponse.json(
      { error: "Apenas pedidos Pix aprovados podem ser renovados." },
      { status: 409 }
    );
  }

  const providerSubscriptionId = `pix_manual:${order.id}`;
  const now = new Date();
  const { data: current, error: currentError } = await admin
    .from("billing_subscriptions")
    .select("current_period_end")
    .eq("provider_subscription_id", providerSubscriptionId)
    .maybeSingle();
  if (currentError) {
    return NextResponse.json(
      { error: "Não foi possível consultar o acesso Pix atual." },
      { status: 503 }
    );
  }

  if (input.action === "renew") {
    const plan = getBillingPlan(order.plan_id);
    if (!plan) {
      return NextResponse.json({ error: "Plano do pedido Pix inválido." }, { status: 409 });
    }
    const currentEnd = current?.current_period_end
      ? new Date(current.current_period_end)
      : null;
    const base = currentEnd && !Number.isNaN(currentEnd.getTime()) && currentEnd > now
      ? currentEnd
      : now;
    const nextEnd = new Date(base.getTime() + MANUAL_PIX_DAYS * 86_400_000);
    const { error } = await admin
      .from("billing_subscriptions")
      .upsert({
        user_id: order.user_id,
        provider: "manual",
        provider_subscription_id: providerSubscriptionId,
        environment: "production",
        payment_method: "pix_manual",
        plan_id: plan.id,
        status: "active",
        payer_email: order.customer_email,
        amount: plan.price,
        currency: "BRL",
        current_period_start: now.toISOString(),
        current_period_end: nextEnd.toISOString(),
        provider_updated_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: "provider_subscription_id" });
    if (error) {
      return NextResponse.json(
        { error: "Não foi possível renovar o acesso Pix." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, current_period_end: nextEnd.toISOString() });
  }

  const { error: subscriptionError } = await admin
    .from("billing_subscriptions")
    .update({
      status: "cancelled",
      current_period_end: now.toISOString(),
      cancel_at: now.toISOString(),
      canceled_at: now.toISOString(),
      provider_updated_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("provider_subscription_id", providerSubscriptionId);
  if (subscriptionError) {
    return NextResponse.json(
      { error: "Não foi possível encerrar o acesso Pix." },
      { status: 503 }
    );
  }

  const { error: orderUpdateError } = await input.supabase
    .from("manual_pix_orders")
    .update({ status: "canceled", notes: input.notes || "Acesso encerrado pelo administrador." })
    .eq("id", input.orderId);
  if (orderUpdateError) {
    return NextResponse.json(
      { error: "Acesso encerrado, mas não foi possível atualizar o histórico Pix." },
      { status: 207 }
    );
  }

  return NextResponse.json({ ok: true });
}
