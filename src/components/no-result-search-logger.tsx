"use client";

import { useEffect, useRef } from "react";
import type { SearchNoResultContext } from "@/lib/search-no-result";

type Props = {
  term: string;
  resultCount: number;
  context: SearchNoResultContext;
  loading?: boolean;
};

const loggedInSession = new Set<string>();

export default function NoResultSearchLogger({
  term,
  resultCount,
  context,
  loading = false,
}: Props) {
  const latestRequest = useRef(0);

  useEffect(() => {
    const clean = term.trim();
    if (clean.length < 2 || loading || resultCount > 0) return;

    const key = `${context}:${clean.toLocaleLowerCase("pt-BR")}`;
    if (loggedInSession.has(key)) return;

    const requestId = ++latestRequest.current;
    const timer = window.setTimeout(() => {
      if (requestId !== latestRequest.current) return;

      loggedInSession.add(key);
      void fetch("/api/search/no-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: clean, context }),
        keepalive: true,
      }).catch(() => {
        loggedInSession.delete(key);
      });
    }, 1200);

    return () => {
      latestRequest.current += 1;
      window.clearTimeout(timer);
    };
  }, [context, loading, resultCount, term]);

  return null;
}
