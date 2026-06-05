"use client";

import { useEffect, useState } from "react";
import { subscribeToast, type ToastPayload } from "../lib/toast";

type ToastItem = ToastPayload & {
  id: string;
};

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800",
};

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToast((payload) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setItems((current) => [...current, { ...payload, id }]);

      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 2600);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => {
        const variant = item.variant || "info";

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${styles[variant]}`}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs leading-5 opacity-90">
                {item.description}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}