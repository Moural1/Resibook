// Monitorização laboratorial exigida pelas medicações em uso.

import { MONITORIZACAO, type ExigenciaMonitorizacao } from "./catalogos.ts";
import type { Medicacao, Mes, PacientePsiquiatria } from "./tipos.ts";
import { medicacoesAtivas } from "./farmacologia.ts";

export type StatusMonitorizacao = "pendente" | "proximo" | "ok";

export type ItemMonitorizacao = {
  rotulo: string;
  intervaloMeses: number;
  medicacao: string;
  ultimo: Mes | null;
  previsto: Mes;
  status: StatusMonitorizacao;
};

/**
 * Para cada exame exigido, usa o menor intervalo entre as medicações em uso.
 * - pendente: nunca feito desde o início da medicação, ou mês previsto já chegou;
 * - proximo: previsto para o mês seguinte;
 * - ok: em dia.
 * Exames feitos até 1 mês antes do início contam como basal.
 */
export function monitorizacao(paciente: PacientePsiquiatria): ItemMonitorizacao[] {
  const exigidos = new Map<string, { exigencia: ExigenciaMonitorizacao; med: Medicacao }>();
  for (const med of medicacoesAtivas(paciente)) {
    for (const exigencia of MONITORIZACAO[med.classe] ?? []) {
      const atual = exigidos.get(exigencia.rotulo);
      if (!atual || atual.exigencia.intervaloMeses > exigencia.intervaloMeses) {
        exigidos.set(exigencia.rotulo, { exigencia, med });
      }
    }
  }

  return [...exigidos.values()].map(({ exigencia, med }) => {
    const meses = paciente.exames
      .filter(
        (e) => exigencia.exames.includes(e.nome) && e.mes >= med.inicio - 1 && e.mes <= paciente.atual
      )
      .map((e) => e.mes);
    const ultimo = meses.length ? Math.max(...meses) : null;
    let previsto: Mes;
    let status: StatusMonitorizacao;
    if (ultimo == null) {
      previsto = med.inicio;
      status = "pendente";
    } else {
      previsto = ultimo + exigencia.intervaloMeses;
      status = previsto <= paciente.atual ? "pendente" : previsto - paciente.atual <= 1 ? "proximo" : "ok";
    }
    return {
      rotulo: exigencia.rotulo,
      intervaloMeses: exigencia.intervaloMeses,
      medicacao: med.nome,
      ultimo,
      previsto,
      status,
    };
  });
}
