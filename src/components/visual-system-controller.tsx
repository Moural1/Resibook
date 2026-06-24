"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LIBRARY_ROUTES = ["/flashcards", "/topicos", "/cids", "/condutas"];
const WORKFLOW_ROUTES = [
  "/prescricao",
  "/modelos-prescricao",
  "/exames-evolucao",
  "/pacientes",
];
const OPERATIONS_ROUTES = [
  "/dashboard",
  "/metricas",
  "/dados-da-conta",
  "/acessos",
];

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function VisualSystemController() {
  const pathname = usePathname();

  useEffect(() => {
    const surface = matches(pathname, LIBRARY_ROUTES)
      ? "library"
      : matches(pathname, WORKFLOW_ROUTES)
        ? "workflow"
        : matches(pathname, OPERATIONS_ROUTES)
          ? "operations"
          : "clinical";

    document.body.dataset.resibookSurface = surface;
    return () => {
      delete document.body.dataset.resibookSurface;
    };
  }, [pathname]);

  return null;
}
