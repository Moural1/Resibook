"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, RefreshCw, X } from "lucide-react";
import type { ManualPixOrder } from "@/lib/billing/manual-pix";
import { BILLING_PLANS } from "@/lib/billing/plans";

export function PixManualAdminClient() {
  const [orders, setOrders] = useState<ManualPixOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/pix-manual", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as {
      orders?: ManualPixOrder[];
      error?: string;
    } | null;
    if (!response.ok) setError(payload?.error || "Não foi possível carregar os pedidos.");
    setOrders(payload?.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(orderId: string, decision: "approved" | "rejected") {
    const label = decision === "approved" ? "aprovar" : "rejeitar";
    if (!window.confirm(`Deseja ${label} este pedido Pix?`)) return;
    setReviewing(orderId);
    setError("");
    const response = await fetch("/api/admin/pix-manual", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, decision }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) setError(payload?.error || "Não foi possível revisar o pedido.");
    await load();
    setReviewing(null);
  }

  const pending = orders.filter((order) => order.status === "pending");
  const reviewed = orders.filter((order) => order.status !== "pending");

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Administração</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Pagamentos Pix manuais</h1>
            <p className="mt-2 text-sm text-slate-600">Confira o comprovante recebido antes de liberar 30 dias de acesso.</p>
          </div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Atualizar</button>
        </div>
        {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Aguardando confirmação ({pending.length})</h2>
        {pending.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nenhum pedido pendente.</div> : pending.map((order) => (
          <article key={order.id} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{order.customer_name || order.customer_email}</p>
                <p className="mt-1 text-sm text-slate-600">{order.customer_email}</p>
                <p className="mt-3 text-sm font-medium text-slate-800">Plano {BILLING_PLANS[order.plan_id].name} · R$ {Number(order.amount).toFixed(0)}</p>
                <p className="mt-1 text-xs text-slate-500">Criado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.created_at))}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void review(order.id, "approved")} disabled={reviewing === order.id} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" />Aprovar</button>
                <button onClick={() => void review(order.id, "rejected")} disabled={reviewing === order.id} className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 disabled:opacity-50"><X className="h-4 w-4" />Rejeitar</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {reviewed.length > 0 ? <section className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">Histórico recente</h2>{reviewed.slice(0, 20).map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm"><span>{order.customer_email} · Plano {BILLING_PLANS[order.plan_id].name}</span><span className="inline-flex items-center gap-2 font-semibold text-slate-600"><Clock3 className="h-4 w-4" />{order.status === "approved" ? "Aprovado" : order.status === "rejected" ? "Rejeitado" : "Cancelado"}</span></div>)}</section> : null}
    </div>
  );
}

