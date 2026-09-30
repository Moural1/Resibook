"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AccessibilityBridge() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;
    // Só completa o que faltar: reescrever atributos já renderizados pelo React
    // gera aviso de hidratação quando o efeito roda antes do <main> hidratar.
    if (!main.id) main.id = "conteudo-principal";
    if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
  }, [pathname]);
  return null;
}
