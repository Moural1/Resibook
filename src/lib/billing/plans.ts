export type BillingPlanId = "basic" | "complete";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  basic: {
    id: "basic",
    name: "Básico",
    price: 30,
    description: "Biblioteca clínica para consulta, estudo e apoio no plantão.",
    features: [
      "Calculadoras clínicas",
      "CIDs e tópicos médicos",
      "Flashcards e biblioteca essencial",
    ],
  },
  complete: {
    id: "complete",
    name: "Completo",
    price: 50,
    description: "Todos os recursos e o workspace privado do médico.",
    features: [
      "Tudo do plano Básico",
      "Meu Resibook e cópias privadas",
      "Plantão, prescrições, exames e condutas",
    ],
  },
};

export function isBillingPlanId(value: unknown): value is BillingPlanId {
  return value === "basic" || value === "complete";
}

export function getBillingPlan(value: unknown) {
  return isBillingPlanId(value) ? BILLING_PLANS[value] : null;
}

export function formatPlanPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(price);
}
