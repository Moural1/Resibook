import { CIRURGIA } from "./cirurgia.ts";
import { CLINICA } from "./clinica.ts";
import { GO } from "./go.ts";
import { PEDIATRIA } from "./pediatria.ts";
import { PREVENTIVA } from "./preventiva.ts";
import type { AreaFluxos, NoFluxo, Tema } from "./tipos.ts";

export * from "./tipos.ts";

export const AREAS_FLUXOS: AreaFluxos[] = [CIRURGIA, CLINICA, GO, PEDIATRIA, PREVENTIVA];

export function encontrarArea(areaId: string) {
  return AREAS_FLUXOS.find((area) => area.id === areaId) ?? null;
}

export function encontrarTema(areaId: string, temaId: string) {
  const area = encontrarArea(areaId);
  const tema = area?.temas.find((item) => item.id === temaId) ?? null;
  return area && tema ? { area, tema } : null;
}

/* Tema anterior e seguinte dentro da mesma área, para navegar em sequência. */
export function vizinhos(area: AreaFluxos, temaId: string) {
  const index = area.temas.findIndex((item) => item.id === temaId);
  return {
    anterior: index > 0 ? area.temas[index - 1] : null,
    proximo: index >= 0 && index < area.temas.length - 1 ? area.temas[index + 1] : null,
  };
}

export function contarRegras(area: AreaFluxos) {
  return (area.regrasRelampago?.length ?? 0) + (area.raioX?.regras.length ?? 0);
}

export function totaisFluxos() {
  return {
    areas: AREAS_FLUXOS.length,
    temas: AREAS_FLUXOS.reduce((total, area) => total + area.temas.length, 0),
    algoritmos: AREAS_FLUXOS.reduce(
      (total, area) =>
        total +
        area.temas.reduce((soma, tema) => soma + (tema.algoritmos?.length ?? 0), 0) +
        (area.raioX?.algoritmos?.length ?? 0),
      0
    ),
    regras: AREAS_FLUXOS.reduce((total, area) => total + contarRegras(area), 0),
  };
}

function textoDoFluxo(nos: NoFluxo[]): string[] {
  return nos.flatMap((no) =>
    no.tipo === "decisao"
      ? [no.texto, ...no.ramos.flatMap((ramo) => [ramo.rotulo, ...textoDoFluxo(ramo.passos)])]
      : [no.texto]
  );
}

/* Texto pesquisável de um tema (títulos, algoritmos, quadros e regras). */
export function textoDoTema(tema: Tema) {
  return [
    tema.titulo,
    ...(tema.revisar ?? []),
    ...(tema.algoritmos ?? []).flatMap((algoritmo) => [algoritmo.titulo, ...textoDoFluxo(algoritmo.passos)]),
    ...(tema.quadros ?? []).flatMap((quadro) => [quadro.titulo, ...quadro.linhas.flat()]),
    ...(tema.linhasDoTempo ?? []).flatMap((linha) => [linha.titulo, ...linha.marcos.flatMap((m) => [m.quando, m.texto])]),
    ...(tema.oQueCai ?? []),
    ...(tema.pegadinhas ?? []),
  ].join(" ");
}
