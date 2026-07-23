import { createClient } from "@/lib/supabase/server";
import {
  isSearchNoResultContext,
  sanitizeNoResultTerm,
} from "@/lib/search-no-result";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    term?: unknown;
    context?: unknown;
  } | null;
  const term = sanitizeNoResultTerm(body?.term);
  const context = body?.context;

  if (!term || !isSearchNoResultContext(context)) {
    return new Response(null, { status: 204 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return new Response(null, { status: 204 });
  }

  const { error } = await supabase.rpc("record_search_no_result", {
    p_term: term,
    p_context: context,
  });

  if (error) {
    console.warn("Falha ao registrar busca sem resultado:", error.code);
  }

  return new Response(null, { status: 204 });
}

export const dynamic = "force-dynamic";
