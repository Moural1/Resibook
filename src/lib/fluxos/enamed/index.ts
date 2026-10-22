import { CIRURGIA } from "./cirurgia.ts";
import { CLINICA_MEDICA } from "./clinica-medica.ts";
import { ESTRATEGIA } from "./estrategia.ts";
import { GINECOLOGIA_OBSTETRICIA } from "./ginecologia-obstetricia.ts";
import { PEDIATRIA } from "./pediatria.ts";
import { PREVENTIVA } from "./preventiva.ts";
import { SAUDE_MENTAL } from "./saude-mental.ts";
import type { NoFluxo } from "../tipos.ts";
import { separarConfirmar } from "./confirmar.ts";
import type { AreaDossie, BlocoDossie, ElementoDossie } from "./tipos.ts";

export * from "./tipos.ts";
export { separarConfirmar };
export { ROTULO_BLOCO } from "./rotulos.ts";

export const AREAS_DOSSIE: AreaDossie[] = [
  CIRURGIA,
  CLINICA_MEDICA,
  GINECOLOGIA_OBSTETRICIA,
  PEDIATRIA,
  PREVENTIVA,
  SAUDE_MENTAL,
  ESTRATEGIA,
];


export function encontrarBloco(areaId: string, blocoId: string) {
  const area = AREAS_DOSSIE.find((item) => item.id === areaId) ?? null;
  const bloco = area?.blocos.find((item) => item.id === blocoId) ?? null;
  return area && bloco ? { area, bloco } : null;
}

export function vizinhosBloco(area: AreaDossie, blocoId: string) {
  const index = area.blocos.findIndex((item) => item.id === blocoId);
  return {
    anterior: index > 0 ? area.blocos[index - 1] : null,
    proximo: index >= 0 && index < area.blocos.length - 1 ? area.blocos[index + 1] : null,
  };
}


function textosDoFluxo(nos: NoFluxo[]): string[] {
  return nos.flatMap((no) =>
    no.tipo === "decisao"
      ? [no.texto, ...no.ramos.flatMap((ramo) => [ramo.rotulo, ...textosDoFluxo(ramo.passos)])]
      : [no.texto]
  );
}

export function textosDoElemento(elemento: ElementoDossie): string[] {
  switch (elemento.tipo) {
    case "erros":
      return elemento.itens.flatMap((item) => [item.titulo, item.texto, item.trava ?? ""]);
    case "quadro":
      return [elemento.quadro.titulo, ...elemento.quadro.linhas.flat()];
    case "algoritmo":
      return [elemento.algoritmo.titulo, ...textosDoFluxo(elemento.algoritmo.passos)];
    case "padrao":
      return [
        elemento.padrao.titulo,
        ...elemento.padrao.mecanismos,
        elemento.padrao.antidoto,
        ...elemento.padrao.exemplos.flatMap((exemplo) => [exemplo.tema, exemplo.armadilha]),
      ];
  }
}

/* Títulos que identificam o bloco na busca: o próprio título, os títulos
   dos quadros/algoritmos/cartões e os rótulos das linhas. */
export function chavesDoBloco(bloco: BlocoDossie) {
  return bloco.elementos
    .flatMap((elemento) => {
      switch (elemento.tipo) {
        case "erros":
          return elemento.itens.map((item) => item.titulo);
        case "quadro":
          return [elemento.quadro.titulo, ...elemento.quadro.linhas.map((linha) => linha[0])];
        case "algoritmo":
          return [elemento.algoritmo.titulo];
        case "padrao":
          return [elemento.padrao.titulo, ...elemento.padrao.exemplos.map((exemplo) => exemplo.tema)];
      }
    })
    .map((texto) => separarConfirmar(texto).texto.replace(/ · (URGÊNCIA|IMAGEM)/g, ""))
    .filter(Boolean);
}

export function contarConfirmar(bloco: BlocoDossie) {
  return bloco.elementos.flatMap(textosDoElemento).filter((texto) => separarConfirmar(texto).confirmar).length;
}

export function totaisDossie() {
  const blocos = AREAS_DOSSIE.flatMap((area) => area.blocos);
  const elementos = blocos.flatMap((bloco) => bloco.elementos);
  return {
    areas: AREAS_DOSSIE.length,
    blocos: blocos.length,
    quadros: elementos.filter((elemento) => elemento.tipo === "quadro").length,
    algoritmos: elementos.filter((elemento) => elemento.tipo === "algoritmo").length,
    erros: elementos.reduce((total, elemento) => total + (elemento.tipo === "erros" ? elemento.itens.length : 0), 0),
  };
}
