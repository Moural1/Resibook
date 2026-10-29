// Leitura de modelos de prescrição como receituário.
//
// Os modelos chegam como texto livre, quase sempre em CAIXA ALTA, no formato
// de receituário brasileiro: "USO ORAL", itens numerados "1) DIPIRONA 500 MG",
// linhas de posologia logo abaixo, "OU" entre alternativas e rótulos como
// "SE DOR NEUROPÁTICA IMPORTANTE:". Este módulo só estrutura o texto para
// exibição; o conteúdo copiado e salvo continua sendo o texto original.

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
