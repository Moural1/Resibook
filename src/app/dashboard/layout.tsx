import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import MobileSidebar from "@/components/mobile-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <MobileSidebar />

      <div className="flex min-h-screen">
        <aside className="hidden lg:block lg:w-[290px] lg:shrink-0">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}