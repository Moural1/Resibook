"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LOG_INTERVAL_MS = 5 * 60 * 1000;

export default function AccessLogger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function logAccess() {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user?.id || !user.email) return;

      const queryString = searchParams?.toString();
      const path = queryString ? `${pathname}?${queryString}` : pathname;

      if (path === "/login") return;

      const storageKey = `resibook_access_log_${user.id}_${path}`;
      const lastLog = Number(sessionStorage.getItem(storageKey) || "0");
      const now = Date.now();

      if (now - lastLog < LOG_INTERVAL_MS) return;

      sessionStorage.setItem(storageKey, String(now));

      await supabase.from("access_logs").insert({
        user_id: user.id,
        user_email: user.email,
        path,
        page_title: document.title || "ResiBook",
        user_agent: navigator.userAgent,
      });
    }

    logAccess();
  }, [pathname, searchParams]);

  return null;
}
