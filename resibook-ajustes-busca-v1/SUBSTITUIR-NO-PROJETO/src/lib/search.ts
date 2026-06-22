export type SearchField =
  | string
  | null
  | undefined
  | {
      value?: string | null;
      weight?: number;
    };

const SEARCH_STOPWORDS = new Set([
  "a",
  "o",
  "as",
  "os",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "com",
  "para",
  "por",
  "um",
  "uma",
]);

export function normalizeSearch(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearch(query?: string | null) {
  const rawTokens = normalizeSearch(query).split(" ").filter(Boolean);
  const meaningfulTokens = rawTokens.filter(
    (token) => token.length > 1 && !SEARCH_STOPWORDS.has(token)
  );

  return meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
}

function asWeightedField(field: SearchField) {
  if (typeof field === "string" || field == null) {
    return {
      value: normalizeSearch(field),
      weight: 1,
    };
  }

  return {
    value: normalizeSearch(field.value),
    weight: field.weight ?? 1,
  };
}

function hasWordStartingWith(value: string, token: string) {
  return value.split(" ").some((word) => word.startsWith(token));
}

export function getSearchScore(fields: SearchField[], query: string) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 1;

  const tokens = tokenizeSearch(normalizedQuery);
  if (tokens.length === 0) return 1;

  const weightedFields = fields
    .map(asWeightedField)
    .filter((field) => Boolean(field.value));

  if (weightedFields.length === 0) return 0;

  const haystack = weightedFields.map((field) => field.value).join(" ");

  // Para busca com mais de uma palavra, evita resultado frouxo: todas as
  // palavras relevantes precisam aparecer em algum campo do item.
  const allTokensWereFound = tokens.every((token) => haystack.includes(token));
  if (!allTokensWereFound) return 0;

  let score = 0;

  for (const field of weightedFields) {
    const value = field.value;
    const weight = field.weight;

    if (value === normalizedQuery) {
      score += 220 * weight;
    } else if (value.startsWith(normalizedQuery)) {
      score += 160 * weight;
    } else if (hasWordStartingWith(value, normalizedQuery)) {
      score += 115 * weight;
    } else if (value.includes(normalizedQuery)) {
      score += 70 * weight;
    }

    for (const token of tokens) {
      if (value === token) {
        score += 34 * weight;
      } else if (value.startsWith(token)) {
        score += 26 * weight;
      } else if (hasWordStartingWith(value, token)) {
        score += 18 * weight;
      } else if (value.includes(token)) {
        score += 6 * weight;
      }
    }
  }

  return score;
}

export function includesSearch(
  haystackParts: Array<string | null | undefined>,
  query: string
) {
  return getSearchScore(haystackParts, query) > 0;
}

export function rankSearchResults<T>(
  items: T[],
  query: string,
  getFields: (item: T) => SearchField[]
) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return items;

  return items
    .map((item, index) => ({
      item,
      index,
      score: getSearchScore(getFields(item), normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

export function formatLabel(value?: string | null) {
  if (!value) return "Sem título";

  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
