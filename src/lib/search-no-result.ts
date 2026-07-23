export const SEARCH_NO_RESULT_CONTEXTS = [
  "global",
  "condutas",
  "calculadoras",
] as const;

export type SearchNoResultContext =
  (typeof SEARCH_NO_RESULT_CONTEXTS)[number];

const SENSITIVE_MARKERS =
  /\b(cpf|rg|cart[aã]o\s+sus|prontu[aá]rio|telefone|celular|endere[cç]o|nascimento|e-?mail|paciente)\b/i;
const EMAIL_PATTERN = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;
const LONG_NUMBER_PATTERN = /\d{7,}/;
const DATE_PATTERN = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;

export function isSearchNoResultContext(
  value: unknown
): value is SearchNoResultContext {
  return (
    typeof value === "string" &&
    SEARCH_NO_RESULT_CONTEXTS.includes(value as SearchNoResultContext)
  );
}

export function sanitizeNoResultTerm(value: unknown) {
  if (typeof value !== "string") return null;

  const clean = value
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length < 2 || clean.length > 80) return null;
  if (
    EMAIL_PATTERN.test(clean) ||
    LONG_NUMBER_PATTERN.test(clean) ||
    DATE_PATTERN.test(clean) ||
    SENSITIVE_MARKERS.test(clean)
  ) {
    return null;
  }

  return clean;
}
