"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { sanitizeAnalyticsUrl } from "@/lib/client-error-report";

const MAX_REPORTS_PER_PAGE = 5;
const reported = new Set<string>();

export function reportClientError(
  error: unknown,
  kind: "error" | "rejection" | "boundary" = "error",
  digest?: string
) {
  if (process.env.NODE_ENV !== "production") return;
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message || reported.has(message) || reported.size >= MAX_REPORTS_PER_PAGE) return;
  reported.add(message);

  const payload = JSON.stringify({
    message,
    stack: error instanceof Error ? error.stack : undefined,
    path: window.location.pathname,
    digest,
    kind,
  });

  try {
    fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Relatar erro nunca pode gerar outro erro.
  }
}

/* Captura erros não tratados do navegador e carrega a Vercel Analytics
   (sem cookies; URLs enviadas sem parâmetros e com IDs mascarados). */
export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => reportClientError(event.error || event.message, "error");
    const onRejection = (event: PromiseRejectionEvent) => reportClientError(event.reason, "rejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return <Analytics beforeSend={(event) => ({ ...event, url: sanitizeAnalyticsUrl(event.url) })} />;
}
