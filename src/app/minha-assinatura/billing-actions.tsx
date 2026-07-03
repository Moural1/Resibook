"use client";

import { useState } from "react";

export function BillingActions({ canCancel }: { canCancel: boolean }) {
  const [loading, setLoading] = useState<"refresh" | "cancel" | null>(null);
  const [error, setError] = useState("");

  async function run(action: "refresh" | "cancel") {
    if (action === "cancel" && !window.confirm("Deseja cancelar a renovação da assinatura?")) return;
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
      <button onClick={() => run("refresh")} disabled={loading !== null} className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-60">{loading === "refresh" ? "Atualizando..." : "Atualizar pagamento"}</button>
      {canCancel ? <button onClick={() => run("cancel")} disabled={loading !== null} className="h-11 rounded-xl border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-700 disabled:opacity-60">{loading === "cancel" ? "Cancelando..." : "Cancelar assinatura"}</button> : null}
      {error ? <p className="w-full text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
