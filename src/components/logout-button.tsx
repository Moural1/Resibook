"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearClinicalCaseSession } from "@/lib/clinical-case-session";
import { clearOfflinePages } from "./service-worker-register";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();

    try {
      clearClinicalCaseSession();
      clearOfflinePages();
      await supabase.auth.signOut();
    } finally {
      window.location.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-200"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sair
    </button>
  );
}

