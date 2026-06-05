import type { ReactNode } from "react";

export default function UsuarioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}