"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Smartphone, X } from "lucide-react";
import {
  EMPTY_ONBOARDING,
  ONBOARDING_STEPS,
  ONBOARDING_STORAGE_KEY,
  markVisited,
  onboardingProgress,
  parseOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding";
import { getInstallPrompt, INSTALL_PROMPT_EVENT } from "./service-worker-register";

function readState(): OnboardingState {
  try {
    return parseOnboardingState(window.localStorage.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return { ...EMPTY_ONBOARDING };
  }
}

function writeState(state: OnboardingState) {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Armazenamento indisponível (aba privada): o checklist só não guarda progresso.
  }
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/* Marca como concluído o passo da página visitada. Montado no layout. */
export function OnboardingTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const current = readState();
    let next = markVisited(current, pathname);
    if (!next.installed && isStandalone()) next = { ...next, installed: true };
    if (next !== current) writeState(next);
  }, [pathname]);

  return null;
}

export default function OnboardingChecklist() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [canPrompt, setCanPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    const initial = readState();
    setState(isStandalone() && !initial.installed ? { ...initial, installed: true } : initial);
    setCanPrompt(Boolean(getInstallPrompt()));
    const onPrompt = () => setCanPrompt(Boolean(getInstallPrompt()));
    window.addEventListener(INSTALL_PROMPT_EVENT, onPrompt);
    return () => window.removeEventListener(INSTALL_PROMPT_EVENT, onPrompt);
  }, []);

  if (!state || state.dismissed) return null;
  const { completed, total, finished } = onboardingProgress(state);
  if (finished) return null;

  function update(next: OnboardingState) {
    setState(next);
    writeState(next);
  }

  async function install() {
    const prompt = getInstallPrompt();
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") update({ ...state!, installed: true });
      return;
    }
    setShowIosHint((value) => !value);
  }

  return (
    <section aria-labelledby="onboarding-title" className="rounded-xl border border-cyan-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="onboarding-title" className="text-base font-semibold text-slate-950">Primeiros passos</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {completed} de {total} concluídos. Leva poucos minutos e você aproveita o Resibook desde o primeiro plantão.
          </p>
        </div>
        <button
          type="button"
          onClick={() => update({ ...state, dismissed: true })}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Ocultar primeiros passos"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-cyan-700 transition-all" style={{ width: `${(completed / total) * 100}%` }} />
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {ONBOARDING_STEPS.map((step) => {
          const done = state.done.includes(step.id);
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`group flex h-full gap-3 rounded-lg border p-3 transition ${
                  done ? "border-slate-100 bg-slate-50/70" : "border-slate-200 hover:border-cyan-700/40 hover:bg-cyan-50/40"
                }`}
              >
                <StepMark done={done} />
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"}`}>
                    {step.title}
                  </span>
                  {!done && <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.description}</span>}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <div className={`flex h-full gap-3 rounded-lg border p-3 ${state.installed ? "border-slate-100 bg-slate-50/70" : "border-slate-200"}`}>
            <StepMark done={state.installed} />
            <span className="min-w-0">
              <span className={`block text-sm font-medium ${state.installed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"}`}>
                Instale no celular
              </span>
              {!state.installed && (
                <>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">Abre como app, em tela cheia.</span>
                  <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <button type="button" onClick={install} className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800 hover:underline">
                      <Smartphone className="h-3.5 w-3.5" />
                      {canPrompt ? "Instalar agora" : "Como instalar"}
                    </button>
                    <button type="button" onClick={() => update({ ...state, installed: true })} className="text-xs text-slate-500 hover:text-slate-800">
                      Já instalei
                    </button>
                  </span>
                  {showIosHint && (
                    <span className="mt-2 block rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-600">
                      No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. No Android: menu ⋮ do Chrome → Instalar app.
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        </li>
      </ol>
    </section>
  );
}

function StepMark({ done }: { done: boolean }) {
  return done ? (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-white">
      <Check className="h-3 w-3" />
    </span>
  ) : (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-300">
      <ArrowRight className="h-3 w-3" />
    </span>
  );
}
