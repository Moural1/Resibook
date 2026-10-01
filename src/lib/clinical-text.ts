// Formatação de leitura para textos clínicos livres (flashcards e condutas).
//
// O conteúdo veio de fontes diferentes (PDFs importados, digitação manual,
// planilhas) e chega com quebras de linha no meio da frase, títulos em CAIXA
// ALTA, marcadores de lista variados ("-", "*", "•", "1)") e rótulos soltos
// ("Diagnóstico:"). Este módulo transforma o texto bruto em blocos
// estruturados para exibição. O texto salvo no banco não é alterado.

export type ClinicalInline = { bold: boolean; text: string };

export type ClinicalBlock =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; lines: ClinicalInline[][] }
  | { kind: "list"; ordered: boolean; items: { marker: string | null; content: ClinicalInline[] }[] }
  | { kind: "callout"; tone: "attention" | "tip"; label: string; content: ClinicalInline[] };

// Siglas e termos que devem continuar em maiúsculas quando uma linha em
// CAIXA ALTA é convertida para caixa normal.
const ACRONYMS = new Set([
  "AAS", "ACLS", "AESP", "AINE", "AINES", "AIT", "ALT", "AST", "ATB", "ATRA", "AVC", "AVCI", "AVCH", "BAV", "BCG", "BNP",
  "BRA", "BRE", "BRD", "CA", "CAD", "CI", "CIVD", "CPRE", "CPK", "DAC", "DIU", "DM", "DM1", "DM2", "DPOC", "DRGE", "DST",
  "EAP", "ECG", "EDA", "EEG", "EV", "FA", "FC", "FR", "FV", "GCS", "HAS", "HB", "HBV", "HCV", "HDA", "HDB", "HIV", "HPV",
  "HSA", "IAM", "IC", "ICC", "ICP", "ICS", "IECA", "IG", "IGA", "IGE", "IGG", "IGM", "IM", "INR", "IO", "IOT", "IRA",
  "IRC", "ISRS", "ITU", "IV", "IVAS", "LABA", "LAMA", "LCR", "LES", "LLA", "LLC", "LMA", "LMC", "LPA", "MMII", "MMSS",
  "MPO", "NNT", "NPT", "OMS", "PA", "PAD", "PAF", "PAM", "PAS", "PCR", "PEEP", "PET", "PIC", "PSA", "PSO", "PTH",
  "PTI", "RAR", "RCP", "RCE", "RCIU", "RN", "RNM", "RR", "RX", "SAMU", "SARA", "SC", "SCA", "SDR", "SIADH", "SIU",
  "SL", "SNC", "SNG", "SOP", "SPO2", "SRIS", "SST", "SUS", "T3", "T4", "TC", "TCE", "TEP", "TFG", "TGO", "TGP",
  "TOT", "TPSV", "TSH", "TSV", "TTPA", "TV", "TVP", "TVSP", "UBS", "UPA", "USG", "UTI", "VM", "VO", "VS", "VHS",
]);

// Palavras curtas do português que viram minúsculas mesmo em linha de caixa alta.
const SHORT_WORDS = new Set([
  "A", "AS", "O", "OS", "E", "É", "OU", "DE", "DA", "DAS", "DO", "DOS", "EM", "NA", "NAS", "NO", "NOS", "AO", "AOS",
  "À", "ÀS", "UM", "UMA", "COM", "SEM", "POR", "PRA", "SE", "QUE", "NÃO", "NAO", "SIM", "MAS", "SOB", "ATÉ", "PÓS",
  "PRÉ", "VIA", "SÓ", "JÁ", "MAIS", "MENOS", "TIPO", "GRAU", "ALTA", "BAIXA",
]);

const CALLOUT_LABELS: Record<string, "attention" | "tip"> = {
  pegadinha: "attention",
  atencao: "attention",
  cuidado: "attention",
  alerta: "attention",
  "nao fazer": "attention",
  "red flag": "attention",
  "red flags": "attention",
  macete: "tip",
  "macete final": "tip",
  dica: "tip",
  "frase mental": "tip",
  perola: "tip",
  "na prova": "tip",
  "para a prova": "tip",
  memorizar: "tip",
};

const BULLET_RE = /^(?:([-–•*▪●·])|(\d{1,2})[.)])\s*(?=\S)/;
const ARROW_RE = /^([→↑↓⇒➡↳])\s*/;
const TERMINAL_RE = /[.;!?)»"”]$/;

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function letters(value: string) {
  return value.replace(/[^\p{L}]/gu, "");
}

/** Linha "gritada": só maiúsculas e com pelo menos uma palavra longa de verdade. */
export function isShouting(value: string) {
  const onlyLetters = letters(value);
  if (onlyLetters.length < 4) return false;
  if (onlyLetters !== onlyLetters.toLocaleUpperCase("pt-BR")) return false;
  return /[\p{L}]{5,}/u.test(value.replace(/\b[\p{L}\d]*\d[\p{L}\d]*\b/gu, ""));
}

/** Converte CAIXA ALTA em caixa normal, preservando siglas clínicas. */
export function toReadableCase(value: string) {
  const text = value.trim();
  if (!isShouting(text)) return text;

  let first = true;
  return text.replace(/[\p{L}\p{N}₂]+/gu, (word) => {
    const upper = word.toLocaleUpperCase("pt-BR");
    const hasDigit = /\d/.test(word);
    if (!/\p{L}/u.test(word)) return word;
    let out: string;
    if (ACRONYMS.has(upper) || (hasDigit && word.length <= 6)) out = upper;
    else if (word.length <= 3 && !SHORT_WORDS.has(upper) && !first) out = upper;
    else if (first) out = upper.charAt(0) + upper.slice(1).toLocaleLowerCase("pt-BR");
    else out = upper.toLocaleLowerCase("pt-BR");
    first = false;
    return out;
  });
}

/** Título de cartão, área ou matéria: corrige só quando está todo em maiúsculas. */
export function formatClinicalTitle(value?: string | null) {
  const clean = (value || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (isShouting(clean)) return toReadableCase(clean);
  return clean;
}

// Mesma especialidade escrita de jeitos diferentes nas importações.
const AREA_ALIASES: Record<string, string> = {
  clinica: "Clínica médica",
  "clinica medica": "Clínica médica",
  pediatria: "Pediatria",
  ginecologia: "Ginecologia",
  obstetricia: "Obstetrícia",
  oncohematologia: "Onco-hematologia",
  "onco hematologia": "Onco-hematologia",
  oftalmologia: "Oftalmologia",
  psiquiatria: "Psiquiatria",
  anestesiologia: "Anestesiologia",
  cirurgia: "Cirurgia",
  geriatria: "Geriatria",
  preventiva: "Medicina preventiva",
  "medicina preventiva": "Medicina preventiva",
  "saude publica": "Saúde pública",
  infectologia: "Infectologia",
};

/** Nome canônico de área/especialidade, para exibição e agrupamento de filtros. */
export function canonicalArea(value?: string | null) {
  const clean = (value || "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const key = stripAccents(clean).toLowerCase();
  return AREA_ALIASES[key] ?? formatClinicalTitle(clean);
}

/** Rótulos de origem técnica ("Importado", "PDF 1") não informam nada ao leitor. */
export function isTechnicalSourceLabel(value?: string | null) {
  const key = stripAccents((value || "").trim()).toLowerCase();
  return key === "importado" || /^pdf\s*\d*$/.test(key) || key === "cards novos";
}

export function parseInline(value: string): ClinicalInline[] {
  const parts: ClinicalInline[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value))) {
    if (match.index > last) parts.push({ bold: false, text: value.slice(last, match.index) });
    parts.push({ bold: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < value.length) parts.push({ bold: false, text: value.slice(last) });
  if (!parts.length) return [];

  // "Tratamento: excisão..." → rótulo em negrito no início da linha.
  const head = parts[0];
  if (!head.bold) {
    const label = head.text.match(/^([\p{Lu}][^:]{1,42}):\s+(?=\S)/u);
    if (label && !/[.;!?]/.test(label[1]) && label[1].split(/\s+/).length <= 6) {
      parts.splice(0, 1, { bold: true, text: `${label[1]}:` }, { bold: false, text: ` ${head.text.slice(label[0].length)}` });
    }
  }
  return parts.filter((part) => part.text);
}

type Line =
  | { type: "blank" }
  | { type: "bullet"; marker: string | null; ordered: boolean; text: string }
  | { type: "text"; text: string };

function classify(raw: string): Line {
  const line = raw.replace(/\s+/g, " ").replace(/,(?=\p{L})/gu, ", ").trim();
  if (!line || /^[-_=*]{3,}$/.test(line)) return { type: "blank" };
  const arrow = line.match(ARROW_RE);
  if (arrow) return { type: "bullet", marker: arrow[1], ordered: false, text: line.slice(arrow[0].length) };
  const bullet = line.match(BULLET_RE);
  if (bullet) {
    const rest = line.slice(bullet[0].length);
    // "1) LEUCEMIAS AGUDAS" isolado é título numerado, não item de lista.
    if (bullet[2] && isShouting(rest) && rest.length <= 70) return { type: "text", text: line };
    // "-5 mg" ou "*" decorativo não são marcadores.
    if (bullet[1] === "-" && /^\d/.test(rest)) return { type: "text", text: line };
    return { type: "bullet", marker: bullet[2] ? `${bullet[2]}.` : null, ordered: Boolean(bullet[2]), text: rest };
  }
  return { type: "text", text: line };
}

/** Junta linhas quebradas no meio da frase (efeito de PDF/copiar-colar). */
function joinSoftWraps(lines: Line[]) {
  const out: Line[] = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (
      line.type === "text" &&
      prev &&
      (prev.type === "text" || prev.type === "bullet") &&
      !TERMINAL_RE.test(prev.text) &&
      !/:$/.test(prev.text) &&
      /^[\p{Ll}(]/u.test(line.text)
    ) {
      prev.text = `${prev.text} ${line.text}`;
      continue;
    }
    out.push(line.type === "blank" ? line : { ...line });
  }
  return out;
}

function calloutFor(text: string) {
  const match = text.match(/^([^:]{2,24}):\s*(.*)$/);
  if (!match) return null;
  const key = stripAccents(match[1]).toLowerCase().replace(/[^\p{L}\s]/gu, "").trim();
  const tone = CALLOUT_LABELS[key];
  if (!tone) return null;
  return { tone, label: formatClinicalTitle(match[1].replace(/[^\p{L}\s]/gu, "").trim()), rest: match[2].trim() };
}

function isHeadingCandidate(text: string) {
  const clean = text.replace(/[:\s]+$/, "");
  if (clean.length < 3 || clean.length > 70) return false;
  if (/[.;,!?]$/.test(clean)) return false;
  return /^[\p{Lu}\d]/u.test(clean);
}

export function parseClinicalText(value?: string | null): ClinicalBlock[] {
  const source = (value || "").replace(/\r\n?/g, "\n").replace(/ /g, " ");
  if (!source.trim()) return [];

  const lines = joinSoftWraps(source.split("\n").map(classify));
  const blocks: ClinicalBlock[] = [];

  const next = (index: number) => {
    for (let i = index + 1; i < lines.length; i += 1) if (lines[i].type !== "blank") return lines[i];
    return null;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "blank") {
      i += 1;
      continue;
    }

    if (line.type === "bullet") {
      const items: { marker: string | null; content: ClinicalInline[] }[] = [];
      const ordered = line.ordered;
      while (i < lines.length && lines[i].type === "bullet" && (lines[i] as { ordered: boolean }).ordered === ordered) {
        const item = lines[i] as Extract<Line, { type: "bullet" }>;
        items.push({ marker: item.marker, content: parseInline(toReadableCase(item.text)) });
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const text = line.text;
    const callout = calloutFor(text);
    if (callout) {
      let rest = callout.rest;
      // "Macete:" sozinho na linha usa a linha seguinte como conteúdo.
      if (!rest && lines[i + 1]?.type === "text") {
        rest = (lines[i + 1] as Extract<Line, { type: "text" }>).text;
        i += 1;
      }
      blocks.push({ kind: "callout", tone: callout.tone, label: callout.label, content: parseInline(toReadableCase(rest)) });
      i += 1;
      continue;
    }

    const prevBlank = i === 0 || lines[i - 1].type === "blank";
    const following = next(i);
    const nextIsBlank = i + 1 >= lines.length || lines[i + 1].type === "blank";
    const endsWithColon = /:$/.test(text);

    if (isHeadingCandidate(text) && following) {
      const label = text.replace(/[:\s]+$/, "");
      const shortLabel = label.length <= 48 && label.split(/\s+/).length <= 7;
      // Rótulo de bloco: "Diagnóstico:" ou "Fisiológicas" seguido de lista.
      if (shortLabel && (endsWithColon || (!nextIsBlank && following.type === "bullet"))) {
        blocks.push({ kind: "subheading", text: toReadableCase(label) });
        i += 1;
        continue;
      }
      // Título de seção: linha curta isolada, ou em CAIXA ALTA.
      if (!endsWithColon && ((prevBlank && nextIsBlank) || isShouting(text))) {
        blocks.push({ kind: "heading", text: toReadableCase(label) });
        i += 1;
        continue;
      }
    }

    // Parágrafo: linhas de texto consecutivas, cada uma preservada.
    const raw: string[] = [];
    while (i < lines.length && lines[i].type === "text") {
      const current = (lines[i] as Extract<Line, { type: "text" }>).text;
      if (raw.length && (calloutFor(current) || (isHeadingCandidate(current) && /:$/.test(current) && current.length <= 50))) break;
      raw.push(current);
      i += 1;
    }
    // Três ou mais linhas curtas logo após um rótulo ou uma frase terminada
    // em ":" são, na prática, uma lista sem marcador.
    const previous = blocks[blocks.length - 1];
    const afterLabel =
      previous?.kind === "subheading" ||
      (previous?.kind === "paragraph" &&
        /:\s*$/.test(previous.lines[previous.lines.length - 1].map((part) => part.text).join("")));
    const lead = raw.length > 1 && /:$/.test(raw[0]) ? raw.shift()! : null;
    if (lead) blocks.push({ kind: "paragraph", lines: [parseInline(toReadableCase(lead))] });
    if ((afterLabel || lead) && raw.length >= 3 && raw.every((item) => item.length <= 110)) {
      blocks.push({ kind: "list", ordered: false, items: raw.map((item) => ({ marker: null, content: parseInline(toReadableCase(item)) })) });
    } else if (raw.length) {
      blocks.push({ kind: "paragraph", lines: raw.map((item) => parseInline(toReadableCase(item))) });
    }
  }

  return blocks;
}
