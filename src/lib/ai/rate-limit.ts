import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
export type AiRateLimitRoute = "case-review" | "ecg-analyze";

type RateLimitRow = {
  allowed?: boolean;
  retry_after_seconds?: number;
};

export async function consumeAiRateLimit(
  supabase: ServerSupabaseClient,
  route: AiRateLimitRoute
) {
  const { data, error } = await supabase.rpc("consume_ai_rate_limit", {
    p_route: route,
  });

  if (error) {
    console.error("[ai] rate_limit_check_failed", {
      route,
      databaseCode: error.code,
    });
    return { allowed: false, retryAfterSeconds: 60, unavailable: true } as const;
  }

  const row = (Array.isArray(data) ? data[0] : data) as RateLimitRow | null;
  return {
    allowed: row?.allowed === true,
    retryAfterSeconds: Math.max(1, Number(row?.retry_after_seconds) || 60),
    unavailable: false,
  } as const;
}
