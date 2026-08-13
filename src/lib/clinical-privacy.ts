export type DirectIdentifierKind =
  | "cpf"
  | "cns"
  | "email"
  | "phone"
  | "labelled_identifier";

const DIRECT_IDENTIFIER_CHECKS: Array<{
  kind: DirectIdentifierKind;
  pattern: RegExp;
}> = [
  { kind: "cpf", pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
  { kind: "cns", pattern: /\b\d{3}[ .-]?\d{4}[ .-]?\d{4}[ .-]?\d{4}\b/ },
  { kind: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  {
    kind: "phone",
    pattern: /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]\d{4}\b/,
  },
  {
    kind: "labelled_identifier",
    pattern:
      /\b(?:nome(?:\s+do\s+paciente)?|cpf|cns|cart[aã]o\s+sus|prontu[aá]rio|telefone|celular|e-?mail|endere[cç]o|data\s+de\s+nascimento)\s*:/i,
  },
];

export function detectDirectIdentifier(value: string) {
  return DIRECT_IDENTIFIER_CHECKS.find(({ pattern }) => pattern.test(value))?.kind ?? null;
}

export function stringifyClinicalInput(value: unknown, maxLength = 12_000) {
  try {
    return JSON.stringify(value).slice(0, maxLength);
  } catch {
    return "";
  }
}
