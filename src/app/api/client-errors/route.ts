import { NextResponse } from "next/server";
import { redactErrorText, sanitizePath } from "@/lib/client-error-report";

/* Recebe erros de JavaScript do navegador e registra nos logs do servidor
   (Vercel → Logs, filtro "[client-error]"). Não grava em banco. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const message = redactErrorText(body?.message, 300);

  if (!message) return new NextResponse(null, { status: 204 });

  console.error(
    "[client-error]",
    JSON.stringify({
      message,
      stack: redactErrorText(body?.stack, 1500),
      path: sanitizePath(body?.path),
      digest: redactErrorText(body?.digest, 60),
      kind: body?.kind === "boundary" || body?.kind === "rejection" ? body.kind : "error",
      userAgent: (request.headers.get("user-agent") || "").slice(0, 160),
    })
  );

  return new NextResponse(null, { status: 204 });
}
