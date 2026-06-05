"use client";

import { useState } from "react";
import { showToast } from "../lib/toast";

type Props = {
  text: string;
};

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
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
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}