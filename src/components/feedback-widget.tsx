"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquareHeart, Send, X } from "lucide-react";

const FEEDBACK_OPTIONS = [
  "Não entendi como usar",
  "Não achei o que procurei",
  "Conteúdo incompleto",
  "Visual confuso",
  "Sugestão de melhoria",
];

type SubmitState = "idle" | "sending" | "sent" | "error";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(FEEDBACK_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  async function submitFeedback() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Escreva pelo menos uma frase para eu entender o problema.");
      return;
    }

    setState("sending");
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: trimmed,
          pagePath: pathname,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Não foi possível enviar agora.");
      }

      setState("sent");
      setMessage("");
    } catch (submitError) {
      setState("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar agora."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
          setError("");
        }}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:border-cyan-200 hover:text-cyan-900"
      >
        <MessageSquareHeart className="h-4 w-4 text-cyan-700" />
        Enviar feedback
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 backdrop-blur-sm md:items-center">
          <section className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Ajude a melhorar
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Encontrou algo ruim ou faltando?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Conte em poucos segundos. Isso salva a próxima melhoria do Resibook.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Fechar feedback"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {FEEDBACK_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    category === option
                      ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setState("idle");
                setError("");
              }}
              maxLength={1200}
              rows={5}
              className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white"
              placeholder="Ex: entrei e não soube por onde começar; procurei pneumonia e senti falta de..."
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Página atual: <span className="font-medium">{pathname}</span>
              </p>

              <button
                type="button"
                onClick={submitFeedback}
                disabled={state === "sending"}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {state === "sending" ? "Enviando..." : "Enviar feedback"}
              </button>
            </div>

            {state === "sent" ? (
              <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Recebido. Valeu — isso ajuda muito a lapidar o app.
              </p>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
