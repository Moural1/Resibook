import type { Exame } from "./catalogos.ts";
import type { Mes, PacientePsiquiatria, RegistroExame } from "./tipos.ts";

export function porMes<T extends { mes: Mes }>(lista: readonly T[]): T[] {
  return [...lista].sort((a, b) => a.mes - b.mes);
}

export function ultimo<T>(lista: readonly T[]): T | undefined {
  return lista[lista.length - 1];
}

/** Minúsculas e sem acentos, para comparar nomes digitados. */
export function normalizar(texto: string) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function formatarNumero(valor: number) {
  return String(valor).replace(".", ",");
}

export function unicos<T>(lista: readonly T[]): T[] {
  return [...new Set(lista)];
}

/** Último registro com valor de um exame, opcionalmente a partir de um mês. */
export function ultimoValorExame(
  paciente: PacientePsiquiatria,
  nome: Exame,
  aPartirDoMes: Mes = -Infinity
): RegistroExame | undefined {
  return ultimo(
    porMes(
      paciente.exames.filter(
        (exame) => exame.nome === nome && exame.valor != null && exame.mes >= aPartirDoMes
      )
    )
  );
}

/** Estado de humor registrado para um mês (o último período que o cobre). */
export function humorNoMes(paciente: PacientePsiquiatria, mes: Mes): number | null {
  let valor: number | null = null;
  for (const periodo of paciente.humor) {
    if (mes >= periodo.ini && mes <= periodo.fim) valor = periodo.v;
  }
  return valor;
}
