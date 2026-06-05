"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const semSidebar = pathname === "/login";

  if (semSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[308px_1fr]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="min-h-screen">
          {pathname !== "/dashboard" ? (
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <div className="mx-auto max-w-[1400px]">
                <input
                  type="text"
                  placeholder="Buscar pacientes, prescrições, casos..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          ) : null}

          <div className="mx-auto max-w-[1400px] p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}