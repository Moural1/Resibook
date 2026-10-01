"use client";

import { useEffect } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const INSTALL_PROMPT_EVENT = "resibook:install-prompt";
let installPrompt: InstallPromptEvent | null = null;

/* Evento de instalação guardado para o botão "Instalar agora" (Chrome/Android). */
export function getInstallPrompt() {
  return installPrompt;
}

/* Registra o service worker (public/sw.js) só em produção, para o app ser
   instalável e abrir ACLS, calculadoras e ECG sem internet. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      installPrompt = event as InstallPromptEvent;
      window.dispatchEvent(new Event(INSTALL_PROMPT_EVENT));
    }
    function onInstalled() {
      installPrompt = null;
      window.dispatchEvent(new Event(INSTALL_PROMPT_EVENT));
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}

/* Apaga as páginas guardadas para uso offline (chamado ao sair da conta). */
export function clearOfflinePages() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.controller?.postMessage("resibook:clear-pages");
}
