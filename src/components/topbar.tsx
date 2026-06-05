"use client";

import GlobalSearch from "./global-search";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-4 md:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}