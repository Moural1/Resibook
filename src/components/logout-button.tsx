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
      className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sair
    </button>
  );
}

