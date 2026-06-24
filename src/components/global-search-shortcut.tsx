"use client";

import { useEffect } from "react";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function findGlobalSearch() {
  return document.querySelector<HTMLInputElement>(
    'header input[type="text"][placeholder*="Buscar"]'
  );
}

export default function GlobalSearchShortcut() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const commandShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";
      const slashShortcut =
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTypingTarget(event.target);

      if (!commandShortcut && !slashShortcut) return;

      const search = findGlobalSearch();
      if (!search) return;

      event.preventDefault();
      search.focus();
      search.select();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
