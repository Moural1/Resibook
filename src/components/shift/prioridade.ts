import type { NivelPrioridade } from "@/lib/shift/triagem";

/* Cores fixas por nível (vermelho/laranja/amarelo/verde) para faixas,
   pílulas e pontos. Usa tons ≥ 500 nos preenchimentos para manter a cor
   também no modo escuro. */
export const COR_PRIORIDADE: Record<NivelPrioridade, { faixa: string; texto: string; borda: string; fundo: string; ponto: string }> = {
  vermelho: { faixa: "bg-rose-600 text-white", texto: "text-rose-800", borda: "border-rose-200", fundo: "bg-rose-50", ponto: "bg-rose-600" },
  laranja: { faixa: "bg-orange-500 text-white", texto: "text-orange-800", borda: "border-orange-200", fundo: "bg-orange-50", ponto: "bg-orange-500" },
  amarelo: { faixa: "bg-amber-400 text-amber-950", texto: "text-amber-800", borda: "border-amber-200", fundo: "bg-amber-50", ponto: "bg-amber-400" },
  verde: { faixa: "bg-emerald-600 text-white", texto: "text-emerald-800", borda: "border-emerald-200", fundo: "bg-emerald-50", ponto: "bg-emerald-600" },
};

export const NOME_COR: Record<NivelPrioridade, string> = {
  vermelho: "Vermelho",
  laranja: "Laranja",
  amarelo: "Amarelo",
  verde: "Verde",
};
