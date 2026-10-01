/* Primeiros passos exibidos no dashboard. O progresso é uma conveniência
   local (localStorage) e nunca é usado para liberar acesso. */
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  /* Rotas cuja visita conclui o passo. */
  routes: string[];
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "roteiro",
    title: "Abra o roteiro de um caso",
    description: "Escolha uma queixa no plantão e veja conduta, prescrição e red flags juntos.",
    href: "/plantao",
    routes: ["/plantao/roteiro-caso", "/caso-rapido"],
  },
  {
    id: "acls",
    title: "Conheça o ACLS",
    description: "Protocolos de parada com doses e algoritmos, disponível até sem internet.",
    href: "/acls",
    routes: ["/acls"],
  },
  {
    id: "flashcards",
    title: "Revise seus primeiros flashcards",
    description: "Marque os difíceis e eles voltam na revisão.",
    href: "/flashcards",
    routes: ["/flashcards"],
  },
  {
    id: "acervo",
    title: "Monte seu acervo",
    description: "Copie um modelo para o Meu Resibook e ajuste ao seu hospital.",
    href: "/meu-resibook",
    routes: ["/meu-resibook"],
  },
];

export const ONBOARDING_STORAGE_KEY = "resibook-onboarding-v1";

export type OnboardingState = {
  done: string[];
  installed: boolean;
  dismissed: boolean;
};

export const EMPTY_ONBOARDING: OnboardingState = { done: [], installed: false, dismissed: false };

export function parseOnboardingState(raw: string | null): OnboardingState {
  if (!raw) return { ...EMPTY_ONBOARDING };
  try {
    const value = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      done: Array.isArray(value.done) ? value.done.filter((item): item is string => typeof item === "string") : [],
      installed: value.installed === true,
      dismissed: value.dismissed === true,
    };
  } catch {
    return { ...EMPTY_ONBOARDING };
  }
}

export function stepForPath(pathname: string): string | null {
  const step = ONBOARDING_STEPS.find((item) =>
    item.routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
  return step?.id ?? null;
}

export function markVisited(state: OnboardingState, pathname: string): OnboardingState {
  const id = stepForPath(pathname);
  if (!id || state.done.includes(id)) return state;
  return { ...state, done: [...state.done, id] };
}

export function onboardingProgress(state: OnboardingState) {
  const total = ONBOARDING_STEPS.length + 1;
  const completed = ONBOARDING_STEPS.filter((step) => state.done.includes(step.id)).length + (state.installed ? 1 : 0);
  return { completed, total, finished: completed >= total };
}
