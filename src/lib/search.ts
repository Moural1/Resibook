export function normalizeSearch(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function includesSearch(
  haystackParts: Array<string | null | undefined>,
  query: string
) {
  const normalizedQuery = normalizeSearch(query).trim();
  if (!normalizedQuery) return true;

  const haystack = haystackParts.map(normalizeSearch).join(" ");
  return haystack.includes(normalizedQuery);
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