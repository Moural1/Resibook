"use client";

import { useCallback, useEffect, useState } from "react";
import { QUADRO_EVENT, carregarQuadro, quadroVazio, salvarQuadro, type Quadro } from "@/lib/shift/quadro";

/* Quadro do plantão com atualização entre telas e abas, e um relógio que
   avança a cada 30 s para os timers de reavaliação. */
export function useQuadro() {
  const [quadro, setQuadro] = useState<Quadro>(quadroVazio);
  const [pronto, setPronto] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    function recarregar() {
      setQuadro(carregarQuadro());
      setAgora(Date.now());
      setPronto(true);
    }
    function storage(event: StorageEvent) {
      if (event.key === null || event.key.startsWith("resibook-shift-quadro")) recarregar();
    }
    recarregar();
    const relogio = window.setInterval(() => setAgora(Date.now()), 30_000);
    window.addEventListener(QUADRO_EVENT, recarregar);
    window.addEventListener("storage", storage);
    return () => {
      window.clearInterval(relogio);
      window.removeEventListener(QUADRO_EVENT, recarregar);
      window.removeEventListener("storage", storage);
    };
  }, []);

  /* Aplica a mudança sobre o estado mais recente salvo (outra aba pode ter mexido). */
  const alterar = useCallback((mudar: (atual: Quadro, agora: number) => Quadro) => {
    const momento = Date.now();
    salvarQuadro(mudar(carregarQuadro(momento), momento));
  }, []);

  return { quadro, pronto, agora, alterar };
}
