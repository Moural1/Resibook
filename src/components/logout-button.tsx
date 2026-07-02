"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearClinicalCaseSession } from "@/lib/clinical-case-session";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();

    try {
      clearClinicalCaseSession();
      await supabase.auth.signOut();
    } finally {
      window.location.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}

