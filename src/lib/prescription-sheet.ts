// Leitura de modelos de prescrição como receituário.
//
// Os modelos chegam como texto livre, quase sempre em CAIXA ALTA, no formato
// de receituário brasileiro: "USO ORAL", itens numerados "1) DIPIRONA 500 MG",
// linhas de posologia logo abaixo, "OU" entre alternativas e rótulos como
// "SE DOR NEUROPÁTICA IMPORTANTE:". Este módulo só estrutura o texto para
// exibição; o conteúdo copiado e salvo continua sendo o texto original.

import { ACRONYMS, isShouting } from "./clinical-text.ts";

export type SheetBlock =
  | { kind: "route"; text: string }
  | { kind: "item"; number: string; title: string; lines: string[] }
  | { kind: "or" }
  | { kind: "label"; text: string }
  | { kind: "text"; lines: string[] };

const ROUTE_RE = /^USO\b/i;
const ITEM_RE = /^(\d{1,2})\)\s*(.*)$/;
const OR_RE = /^ou$/i;

export function parsePrescriptionSheet(value?: string | null): SheetBlock[] {
  const lines = (value || "").replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/\s+/g, " ").trim());
  const blocks: SheetBlock[] = [];
  // Bloco aberto que recebe as próximas linhas até uma linha em branco.
  let open: Extract<SheetBlock, { kind: "item" | "text" }> | null = null;

  for (const line of lines) {
    if (!line) {
      open = null;
      continue;
    }

    if (ROUTE_RE.test(line) && line.length <= 40) {
      blocks.push({ kind: "route", text: line });
      open = null;
      continue;
    }

    const item = line.match(ITEM_RE);
    if (item) {
      open = { kind: "item", number: item[1], title: item[2], lines: [] };
      blocks.push(open);
      continue;
    }

    if (OR_RE.test(line)) {
      blocks.push({ kind: "or" });
      open = null;
      continue;
    }

    if (open?.kind === "item") {
      open.lines.push(line);
      continue;
    }

    if (/:$/.test(line) && line.length <= 70) {
      blocks.push({ kind: "label", text: line.replace(/:$/, "") });
      open = null;
      continue;
    }

    if (open?.kind === "text") {
      open.lines.push(line);
      continue;
    }

    open = { kind: "text", lines: [line] };
    blocks.push(open);
  }

  return blocks;
}

// Leitura em caixa normal: o texto salvo continua igual (é o que se copia e
// imprime), só a exibição deixa de "gritar". Siglas e unidades são mantidas.
const RX_ACRONYMS = new Set([
  ...ACRONYMS,
  "SRO", "SF", "SG", "RL", "IBP", "AINE", "PS", "MS", "QT", "B12", "B6", "B1", "IGRA", "PPD", "IST", "HSV", "MRSA",
  "DRC", "AVE", "HPB", "SMX", "TMP", "ACO", "TARV", "PEP", "PREP", "DUM", "IG", "BCF", "PCR", "VHS", "EAS", "HB", "HT", "SpO2", "CPK",
]);

const UNITS: Record<string, string> = {
  MG: "mg", MCG: "mcg", ML: "mL", G: "g", KG: "kg", L: "L", UI: "UI", MEQ: "mEq", MMOL: "mmol", X: "x", H: "h", CM: "cm",
};

export function readablePrescriptionLine(line: string) {
  // Unidade já em minúscula ("250mg") não impede tratar a linha como caixa alta.
  if (!isShouting(line.replace(/(\d)\s?(mg|mcg|ml|g|kg)\b/gi, "$1"))) return line;
  let first = true;
  return line.replace(/[\p{L}\p{N}]+/gu, (word, offset: number, whole: string) => {
    const upper = word.toLocaleUpperCase("pt-BR");
    const before = whole[offset - 1] || "";
    const after = whole[offset + word.length] || "";
    let out: string;
    const withUnit = upper.match(/^(\d+(?:[.,]\d+)?)([A-Z]+)$/);
    if (/^\d+$/.test(word)) out = word;
    else if (withUnit && UNITS[withUnit[2]]) out = `${withUnit[1]}${UNITS[withUnit[2]]}`;
    else if (UNITS[upper] && (/[\d/]/.test(before) || before === " " && /\d\s$/.test(whole.slice(0, offset)) || after === "/")) out = UNITS[upper];
    else if (RX_ACRONYMS.has(upper) || /\d/.test(word)) out = upper;
    else if (word.length === 1 && (before === "(" || after === ".")) out = upper;
    else out = upper.toLocaleLowerCase("pt-BR");
    // Nova frase depois de ponto também começa com maiúscula.
    if (!first && /[.!?]\s+$/.test(whole.slice(0, offset))) first = true;
    if (first && /\p{L}/u.test(word)) {
      if (out === out.toLocaleLowerCase("pt-BR")) out = out.charAt(0).toLocaleUpperCase("pt-BR") + out.slice(1);
      first = false;
    }
    return out;
  });
}

/** "DIPIRONA 500 MG — 20 COMPRIMIDOS" → nome e quantidade separados. */
export function splitItemTitle(title: string) {
  const parts = title.split(/\s+[—–-]\s+(?=[\d(]|\p{L}+\s*$)/u);
  const quantity = parts.length > 1 && /^\d/.test(parts[parts.length - 1].trim()) ? parts.pop()!.trim() : "";
  return { name: parts.join(" — ").trim(), quantity };
}
