export type AclsEbookTextSegment = {
  kind: "text";
  text: string;
  bold: boolean;
  red: boolean;
};

export type AclsEbookRichText =
  | AclsEbookTextSegment
  | { kind: "image"; src: string };

export type AclsEbookBlockMeta = {
  id?: string;
  layoutHintKey?: number | null;
};

export type AclsEbookFlowTone = "info" | "conduct" | "warning" | "danger" | "pearl" | "medication";

export type AclsEbookSourceBlock = AclsEbookBlockMeta & (
  | { kind: "heading"; level: number; content: AclsEbookRichText[] }
  | { kind: "paragraph"; listStyle: "bullet" | "number" | null; content: AclsEbookRichText[] }
  | { kind: "image"; src: string }
  | { kind: "table"; rows: AclsEbookRichText[][][]; hasHeader: boolean }
  | {
      kind: "flow";
      title: string;
      nodes: Array<{ id: string; title: string; detail: string; tone: AclsEbookFlowTone }>;
    }
);

export type AclsEbookSourceChapter = {
  slug: string;
  title: string;
  group: string;
  sourceLines: [number, number];
  sourcePages: [number, number];
  blocks: AclsEbookSourceBlock[];
};

export type AclsEbookDocument = {
  schemaVersion: 1;
  chapters: AclsEbookSourceChapter[];
};

export type AclsEbookValidationResult =
  | { valid: true; document: AclsEbookDocument; errors: [] }
  | { valid: false; document: null; errors: string[] };

const FLOW_TONES = new Set<AclsEbookFlowTone>(["info", "conduct", "warning", "danger", "pearl", "medication"]);
const MAX_TEXT_LENGTH = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeImageSource(value: unknown) {
  return typeof value === "string" && value.length <= 500 && value.startsWith("/acls-ebook/");
}

function isRichText(value: unknown): value is AclsEbookRichText[] {
  if (!Array.isArray(value) || value.length > 500) return false;
  return value.every((segment) => {
    if (!isRecord(segment) || typeof segment.kind !== "string") return false;
    if (segment.kind === "image") return isSafeImageSource(segment.src);
    return segment.kind === "text" &&
      typeof segment.text === "string" && segment.text.length <= MAX_TEXT_LENGTH &&
      typeof segment.bold === "boolean" && typeof segment.red === "boolean";
  });
}

function validateBlock(value: unknown, path: string, errors: string[]): value is AclsEbookSourceBlock {
  if (!isRecord(value) || typeof value.kind !== "string") {
    errors.push(`${path}: bloco inválido.`);
    return false;
  }
  if (value.id !== undefined && (typeof value.id !== "string" || value.id.length > 100)) errors.push(`${path}: identificador inválido.`);
  if (value.layoutHintKey !== undefined && value.layoutHintKey !== null && (!Number.isInteger(value.layoutHintKey) || Number(value.layoutHintKey) < 0)) {
    errors.push(`${path}: referência editorial inválida.`);
  }
  if (value.kind === "heading") {
    if (!Number.isInteger(value.level) || Number(value.level) < 1 || Number(value.level) > 4) errors.push(`${path}: nível do título inválido.`);
    if (!isRichText(value.content)) errors.push(`${path}: conteúdo do título inválido.`);
  } else if (value.kind === "paragraph") {
    if (![null, "bullet", "number"].includes(value.listStyle as never)) errors.push(`${path}: estilo de lista inválido.`);
    if (!isRichText(value.content)) errors.push(`${path}: texto inválido.`);
  } else if (value.kind === "image") {
    if (!isSafeImageSource(value.src)) errors.push(`${path}: imagem deve pertencer ao acervo ACLS.`);
  } else if (value.kind === "table") {
    if (typeof value.hasHeader !== "boolean" || !Array.isArray(value.rows) || value.rows.length < 1 || value.rows.length > 80) {
      errors.push(`${path}: tabela inválida.`);
    } else {
      const width = Array.isArray(value.rows[0]) ? value.rows[0].length : 0;
      if (width < 1 || width > 8 || !value.rows.every((row) => Array.isArray(row) && row.length === width && row.every(isRichText))) {
        errors.push(`${path}: todas as linhas da tabela devem ter de 1 a 8 colunas iguais.`);
      }
    }
  } else if (value.kind === "flow") {
    if (typeof value.title !== "string" || value.title.length > 300) errors.push(`${path}: título do fluxo inválido.`);
    if (!Array.isArray(value.nodes) || value.nodes.length < 2 || value.nodes.length > 40) {
      errors.push(`${path}: o fluxo deve ter entre 2 e 40 etapas.`);
    } else {
      value.nodes.forEach((node, index) => {
        if (!isRecord(node) || typeof node.id !== "string" || typeof node.title !== "string" || node.title.length < 1 || node.title.length > 500 || typeof node.detail !== "string" || node.detail.length > 2_000 || !FLOW_TONES.has(node.tone as AclsEbookFlowTone)) {
          errors.push(`${path}.etapa${index + 1}: etapa do fluxo inválida.`);
        }
      });
    }
  } else {
    errors.push(`${path}: tipo de bloco não permitido.`);
  }
  return errors.length === 0;
}

export function validateAclsEbookDocument(value: unknown): AclsEbookValidationResult {
  const errors: string[] = [];
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.chapters)) {
    return { valid: false, document: null, errors: ["Documento ACLS inválido."] };
  }
  if (value.chapters.length < 1 || value.chapters.length > 40) errors.push("O eBook deve ter entre 1 e 40 capítulos.");
  const slugs = new Set<string>();
  value.chapters.forEach((chapter, chapterIndex) => {
    const path = `Capítulo ${chapterIndex + 1}`;
    if (!isRecord(chapter)) return errors.push(`${path}: capítulo inválido.`);
    if (typeof chapter.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(chapter.slug) || slugs.has(chapter.slug)) errors.push(`${path}: slug inválido ou repetido.`);
    else slugs.add(chapter.slug);
    if (typeof chapter.title !== "string" || chapter.title.trim().length < 1 || chapter.title.length > 300) errors.push(`${path}: título inválido.`);
    if (typeof chapter.group !== "string" || chapter.group.length > 200) errors.push(`${path}: grupo inválido.`);
    if (!Array.isArray(chapter.sourceLines) || chapter.sourceLines.length !== 2 || !chapter.sourceLines.every(Number.isInteger)) errors.push(`${path}: linhas de origem inválidas.`);
    if (!Array.isArray(chapter.sourcePages) || chapter.sourcePages.length !== 2 || !chapter.sourcePages.every(Number.isInteger)) errors.push(`${path}: páginas de origem inválidas.`);
    if (!Array.isArray(chapter.blocks) || chapter.blocks.length < 1 || chapter.blocks.length > 1_000) errors.push(`${path}: quantidade de blocos inválida.`);
    else chapter.blocks.forEach((block, blockIndex) => validateBlock(block, `${path}, bloco ${blockIndex + 1}`, errors));
  });
  if (errors.length) return { valid: false, document: null, errors: errors.slice(0, 30) };
  return { valid: true, document: value as AclsEbookDocument, errors: [] };
}

export function plainRichText(text = ""): AclsEbookRichText[] {
  return [{ kind: "text", text, bold: false, red: false }];
}

export function richTextToPlain(content: AclsEbookRichText[]) {
  return content.filter((segment): segment is AclsEbookTextSegment => segment.kind === "text").map((segment) => segment.text).join("");
}

function editorId(prefix: string, chapterIndex: number, blockIndex: number) {
  return `${prefix}-${chapterIndex + 1}-${blockIndex + 1}`;
}

export function prepareAclsEbookDocumentForEditing(document: AclsEbookDocument): AclsEbookDocument {
  return {
    schemaVersion: 1,
    chapters: document.chapters.map((chapter, chapterIndex) => ({
      ...chapter,
      blocks: chapter.blocks.map((block, blockIndex) => ({
        ...block,
        id: block.id || editorId("block", chapterIndex, blockIndex),
        layoutHintKey: block.layoutHintKey === undefined ? blockIndex : block.layoutHintKey,
        ...(block.kind === "flow" ? {
          nodes: block.nodes.map((node, nodeIndex) => ({ ...node, id: node.id || editorId("flow", blockIndex, nodeIndex) })),
        } : {}),
      })) as AclsEbookSourceBlock[],
    })),
  };
}

export function discardLegacyAclsEbookLayoutHints(document: AclsEbookDocument): AclsEbookDocument {
  return {
    ...document,
    chapters: document.chapters.map((chapter) => ({
      ...chapter,
      blocks: chapter.blocks.map((block) => ({ ...block, layoutHintKey: null })),
    })),
  };
}

const APPROVED_ECG_IMAGE_NUMBERS = [
  ...Array.from({ length: 12 }, (_, index) => index + 5),
  25,
  26,
  27,
  28,
];

const APPROVED_ECG_IMAGE_SOURCES = new Set(
  APPROVED_ECG_IMAGE_NUMBERS.map((number) => `/acls-ebook/source/images/image-${String(number).padStart(2, "0")}.png`),
);

function sanitizeRichTextImages(content: AclsEbookRichText[]) {
  return content.filter((segment) => segment.kind !== "image" || APPROVED_ECG_IMAGE_SOURCES.has(segment.src));
}

/**
 * Keeps only the independently sourced ECG strips used in the bradycardia,
 * tachyarrhythmia and cardiac-arrest chapters. This also protects the public reader from legacy
 * drafts that still reference removed facsimiles or third-party illustrations.
 */
export function sanitizeAclsEbookDocumentImages(document: AclsEbookDocument): AclsEbookDocument {
  return {
    ...document,
    chapters: document.chapters.map((chapter) => ({
      ...chapter,
      blocks: chapter.blocks.flatMap<AclsEbookSourceBlock>((block) => {
        if (block.kind === "image") {
          return APPROVED_ECG_IMAGE_SOURCES.has(block.src) ? [block] : [];
        }
        if (block.kind === "heading" || block.kind === "paragraph") {
          return [{ ...block, content: sanitizeRichTextImages(block.content) }];
        }
        if (block.kind === "table") {
          return [{
            ...block,
            rows: block.rows.map((row) => row.map(sanitizeRichTextImages)),
          }];
        }
        return [block];
      }),
    })),
  };
}
