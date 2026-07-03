"use client";

import { useState } from "react";
import { showToast } from "../lib/toast";

type Props = {
  text: string;
  cleanMetadata?: boolean;
  label?: string;
  copiedLabel?: string;
  confirmationMessage?: string;
};

function cleanCopiedText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => {
      const clean = line.trim();

      if (!clean) return true;

      return !(
        /^origem\s*:/i.test(clean) ||
        /^fonte\s*:/i.test(clean) ||
        /^arquivo\s*:/i.test(clean) ||
        /^arquivo de origem\s*:/i.test(clean) ||
        /^importad[oa]\s+de\b/i.test(clean) ||
        /^exportad[oa]\s+de\b/i.test(clean) ||
        /^resibook\s*[—-]\s*/i.test(clean)
      );
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function CopyButton({
  text,
  cleanMetadata = false,
  label = "Copiar",
  copiedLabel = "Copiado!",
  confirmationMessage,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (confirmationMessage && !window.confirm(confirmationMessage)) return;

    try {
      const textToCopy = cleanMetadata ? cleanCopiedText(text) : text.trim();

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      showToast({
        title: "Copiado com sucesso",
        description: "O conteúdo foi enviado para a área de transferência.",
        variant: "success",
      });

      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast({
        title: "Não foi possível copiar",
        description: "Tente novamente.",
        variant: "error",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
