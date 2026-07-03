import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTypes: EmailOtpType[] = ["email", "signup", "invite", "magiclink", "recovery", "email_change"];

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && rawType && allowedTypes.includes(rawType)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: rawType, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL("/aceite-legal", request.url));
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
}
