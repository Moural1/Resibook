import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";

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
  return NextResponse.json({ orders: data || [] });
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
    notes?: unknown;
  } | null;
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const decision = body?.decision === "approved" || body?.decision === "rejected"
    ? body.decision
    : null;
  const notes = typeof body?.notes === "string" ? body.notes.slice(0, 1000) : null;
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !decision) {
    return NextResponse.json({ error: "Revisão inválida." }, { status: 400 });
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

