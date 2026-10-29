import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-redirect";

const allowedTypes: EmailOtpType[] = ["email", "signup", "invite", "magiclink", "recovery", "email_change"];

/* Links dos e-mails do Supabase apontam para cá com token_hash. A verificação
   acontece no servidor, então o link funciona mesmo aberto em outro aparelho
   ou navegador. Recuperação e convite seguem para a troca de senha. */
function destination(type: EmailOtpType, next: string | null) {
  const fallback = type === "recovery" || type === "invite" ? "/redefinir-senha" : "/aceite-legal";
  return safeInternalPath(next, fallback);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && rawType && allowedTypes.includes(rawType)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: rawType, token_hash: tokenHash });
    if (!error) {
      const next = destination(rawType, request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
}
