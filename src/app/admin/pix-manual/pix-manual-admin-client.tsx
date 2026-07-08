"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  RefreshCw,
  RotateCw,
  ShieldOff,
  TimerOff,
  X,
} from "lucide-react";
import {
  getManualPixAccessState,
  getManualPixDaysRemaining,
  isManualPixExpiringSoon,
  type ManualPixOrder,
} from "@/lib/billing/manual-pix";
import { BILLING_PLANS } from "@/lib/billing/plans";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function PixManualAdminClient() {
  const [orders, setOrders] = useState<ManualPixOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [updatingAccess, setUpdatingAccess] = useState<string | null>(null);
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

  async function updateAccess(orderId: string, action: "renew" | "revoke") {
    const isRenew = action === "renew";
    const message = isRenew
      ? "Confirmar renovação Pix por mais 30 dias para este cliente?"
      : "Encerrar o acesso Pix deste cliente agora?";
    if (!window.confirm(message)) return;
    setUpdatingAccess(orderId);
    setError("");
    const response = await fetch("/api/admin/pix-manual", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        action,
        notes: isRenew ? null : "Acesso encerrado pelo administrador.",
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) setError(payload?.error || "Não foi possível atualizar o acesso Pix.");
    await load();
    setUpdatingAccess(null);
  }

  const pending = orders.filter((order) => order.status === "pending");
  const reviewed = orders.filter((order) => order.status !== "pending");
  const active = reviewed.filter((order) => getManualPixAccessState(order) === "active");
  const expired = reviewed.filter((order) => getManualPixAccessState(order) === "expired");
  const expiringSoon = active.filter((order) => isManualPixExpiringSoon(order.access_expires_at));

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Administração</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Pagamentos Pix manuais</h1>
            <p className="mt-2 text-sm text-slate-600">Confira comprovantes, renove acessos e acompanhe vencimentos sem abrir o Supabase.</p>
          </div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Atualizar</button>
        </div>
        {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Pendentes</p><p className="mt-1 text-2xl font-semibold text-amber-950">{pending.length}</p></div>
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Ativos</p><p className="mt-1 text-2xl font-semibold text-emerald-950">{active.length}</p></div>
          <div className="rounded-2xl bg-cyan-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Vence em 7 dias</p><p className="mt-1 text-2xl font-semibold text-cyan-950">{expiringSoon.length}</p></div>
          <div className="rounded-2xl bg-slate-100 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Expirados</p><p className="mt-1 text-2xl font-semibold text-slate-950">{expired.length}</p></div>
        </div>
      </section>

      {expiringSoon.length > 0 ? <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <h2 className="text-lg font-semibold text-cyan-950">Clientes para cobrar renovação</h2>
        <p className="mt-1 text-sm text-cyan-800">Esses acessos Pix vencem em até 7 dias.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {expiringSoon.map((order) => {
            const daysRemaining = getManualPixDaysRemaining(order.access_expires_at);
            return <div key={order.id} className="rounded-xl bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-950">{order.customer_name || order.customer_email}</p>
              <p className="mt-1 text-slate-600">{order.customer_email}</p>
              <p className="mt-2 font-medium text-cyan-800">Vence em {daysRemaining} dia{daysRemaining === 1 ? "" : "s"}</p>
            </div>;
          })}
        </div>
      </section> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Aguardando confirmação ({pending.length})</h2>
        {pending.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nenhum pedido pendente.</div> : pending.map((order) => (
          <article key={order.id} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{order.customer_name || order.customer_email}</p>
                <p className="mt-1 text-sm text-slate-600">{order.customer_email}</p>
                <p className="mt-3 text-sm font-medium text-slate-800">Plano {BILLING_PLANS[order.plan_id].name} · {formatMoney(Number(order.amount))}</p>
                <p className="mt-1 text-xs text-slate-500">Criado em {formatDate(order.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void review(order.id, "approved")} disabled={reviewing === order.id} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" />Aprovar</button>
                <button onClick={() => void review(order.id, "rejected")} disabled={reviewing === order.id} className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 disabled:opacity-50"><X className="h-4 w-4" />Rejeitar</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {reviewed.length > 0 ? <section className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">Histórico de pagamentos</h2>{reviewed.map((order) => {
        const accessState = getManualPixAccessState(order);
        const daysRemaining = getManualPixDaysRemaining(order.access_expires_at);
        const statusLabel = accessState === "active"
          ? `Ativo · ${daysRemaining} dia${daysRemaining === 1 ? "" : "s"} restante${daysRemaining === 1 ? "" : "s"}`
          : accessState === "expired"
            ? "Expirado"
            : accessState === "rejected"
              ? "Rejeitado"
              : accessState === "canceled"
                ? "Cancelado"
                : "Acesso não localizado";
        return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-950">{order.customer_name || order.customer_email}</p>
              <p className="mt-1 text-sm text-slate-600">{order.customer_email}</p>
              <p className="mt-2 text-sm font-medium text-slate-800">Plano {BILLING_PLANS[order.plan_id].name} · {formatMoney(Number(order.amount))}</p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${accessState === "active" ? "bg-emerald-100 text-emerald-800" : accessState === "expired" ? "bg-slate-200 text-slate-700" : accessState === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
              {accessState === "expired" ? <TimerOff className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}{statusLabel}
            </span>
          </div>
          <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
            <p><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Pedido</span><span className="mt-1 block">{formatDate(order.created_at)}</span></p>
            <p><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Aprovação</span><span className="mt-1 block">{formatDate(order.approved_at || order.rejected_at)}</span></p>
            <p><span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Vencimento</span><span className="mt-1 block font-semibold">{formatDate(order.access_expires_at)}</span></p>
          </div>
          {order.status === "approved" ? <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void updateAccess(order.id, "renew")} disabled={updatingAccess === order.id} className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><RotateCw className="h-4 w-4" />Renovar +30 dias</button>
            <button onClick={() => void updateAccess(order.id, "revoke")} disabled={updatingAccess === order.id} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 disabled:opacity-50"><ShieldOff className="h-4 w-4" />Encerrar acesso</button>
          </div> : null}
        </article>;
      })}</section> : null}
    </div>
  );
}
