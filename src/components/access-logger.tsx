"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "igormoura@resibook.com";

export default function AccessLogger() {
  const router = useRouter();
  const lastRunRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function checkBlockedAndLogLogin() {
      const runId = Date.now();
      lastRunRef.current = runId;

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted || lastRunRef.current !== runId) return;
      if (sessionError) return;

      const session = sessionData.session;
      const user = session?.user;
      const accessToken = session?.access_token || "";

      if (!user?.id || !user.email || !accessToken) return;

      const email = user.email.trim().toLowerCase();

      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!mounted || lastRunRef.current !== runId) return;
      if (blockedError) return;

      if (blockedData && email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();

        if (!mounted || lastRunRef.current !== runId) return;

        router.replace("/login?blocked=1");
        return;
      }

      const tokenPart = accessToken.slice(-16);
      const storageKey = `resibook_login_logged_${user.id}_${tokenPart}`;

      try {
        const alreadyLogged = sessionStorage.getItem(storageKey);
        if (alreadyLogged) return;

        sessionStorage.setItem(storageKey, "1");
      } catch {
        return;
      }

      const { error: insertError } = await supabase.from("login_logs").insert({
        user_id: user.id,
        user_email: user.email,
        user_agent: navigator.userAgent,
      });

      if (insertError) {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
      }
    }

    checkBlockedAndLogLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session?.user?.id || !session.user.email) return;

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        checkBlockedAndLogLogin();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}