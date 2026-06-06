"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "igormoura@resibook.com";

export default function AccessLogger() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkBlockedAndLogLogin() {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const user = session?.user;
      const accessToken = session?.access_token || "";

      if (!user?.id || !user.email || !accessToken) return;

      const email = user.email.trim().toLowerCase();

      const { data: blockedData } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!mounted) return;

      if (blockedData && email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        router.replace("/login?blocked=1");
        return;
      }

      const tokenPart = accessToken.slice(-16);
      const storageKey = `resibook_login_logged_${user.id}_${tokenPart}`;
      const alreadyLogged = sessionStorage.getItem(storageKey);

      if (alreadyLogged) return;

      sessionStorage.setItem(storageKey, "1");

      await supabase.from("login_logs").insert({
        user_id: user.id,
        user_email: user.email,
        user_agent: navigator.userAgent,
      });
    }

    checkBlockedAndLogLogin();

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;

      if (!user?.id || !user.email) return;

      checkBlockedAndLogLogin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}