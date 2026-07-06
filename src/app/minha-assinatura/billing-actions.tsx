"use client";

import Link from "next/link";
import { useState } from "react";

export function BillingActions({
  canCancel,
  canResubscribe,
  canRefresh,
  retry,
  planId,
}: {
  canCancel: boolean;
  canResubscribe: boolean;
  canRefresh: boolean;
  retry: boolean;
  planId: string;
}) {
  const [loading, setLoading] = useState<"refresh" | "cancel" | null>(null);
  const [error, setError] = useState("");

  async function run(action: "refresh" | "cancel") {
    if (action === "cancel" && !window.confirm("Deseja cancelar a renovação? O acesso continua até o fim do período já pago.")) return;
    setLoading(action);
    setError("");
    const response = await fetch(`/api/billing/${action === "refresh" ? "status" : "cancel"}`, { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(payload?.error || "Não foi possível atualizar a assinatura.");
      setLoading(null);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {canResubscribe ? (
        <Link href={`/assinar?plano=${encodeURIComponent(planId)}${retry ? "&retry=1" : ""}`} className="inline-flex h-11 items-center rounded-xl bg-cyan-700 px-5 text-sm font-semibold text-white hover:bg-cyan-800">
          {retry ? "Tentar pagamento novamente" : "Assinar novamente"}
        </Link>
      ) : null}
      {canRefresh ? <button onClick={() => run("refresh")} disabled={loading !== null} className={`h-11 rounded-xl px-5 text-sm font-semibold disabled:opacity-60 ${canResubscribe ? "border border-slate-300 bg-white text-slate-700" : "bg-slate-900 text-white"}`}>{loading === "refresh" ? "Atualizando..." : "Atualizar status"}</button> : null}
      {canCancel ? <button onClick={() => run("cancel")} disabled={loading !== null} className="h-11 rounded-xl border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-700 disabled:opacity-60">{loading === "cancel" ? "Cancelando..." : "Cancelar assinatura"}</button> : null}
      {error ? <p className="w-full text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
