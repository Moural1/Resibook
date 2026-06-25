"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AccessibilityBridge() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;
    main.id = "conteudo-principal";
    main.tabIndex = -1;
  }, [pathname]);
  return null;
}
