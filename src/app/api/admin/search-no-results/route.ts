import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";

type SearchLog = {
  term: string;
  context: string;
  created_at: string;
};

type AggregatedTerm = {
  term: string;
  count: number;
  contexts: Record<string, number>;
  lastSeenAt: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  if (!isResibookAdmin(user)) {
    return NextResponse.json(
      { error: "Acesso permitido apenas ao administrador." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("search_no_result_logs")
    .select("term, context, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar as buscas sem resultado." },
      { status: 503 }
    );
  }

  const logs = (data || []) as SearchLog[];
  const aggregated = new Map<string, AggregatedTerm>();

  for (const log of logs) {
    const key = log.term.toLocaleLowerCase("pt-BR");
    const current = aggregated.get(key);

    if (current) {
      current.count += 1;
      current.contexts[log.context] =
        (current.contexts[log.context] || 0) + 1;
      continue;
    }

    aggregated.set(key, {
      term: log.term,
      count: 1,
      contexts: { [log.context]: 1 },
      lastSeenAt: log.created_at,
    });
  }

  const terms = [...aggregated.values()]
    .sort(
      (a, b) =>
        b.count - a.count ||
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    )
    .slice(0, 100);

  return NextResponse.json({
    terms,
    summary: {
      totalEvents: logs.length,
      uniqueTerms: aggregated.size,
      periodStart: logs.at(-1)?.created_at || null,
      periodEnd: logs[0]?.created_at || null,
    },
  });
}

export const dynamic = "force-dynamic";
