"use client";

import { useEffect } from "react";

/* Registra o service worker (public/sw.js) só em produção, para o app ser
   instalável e abrir ACLS, calculadoras e ECG sem internet. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}

/* Apaga as páginas guardadas para uso offline (chamado ao sair da conta). */
export function clearOfflinePages() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.controller?.postMessage("resibook:clear-pages");
}
