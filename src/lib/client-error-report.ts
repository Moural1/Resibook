/* Sanitização dos relatos de erro do navegador antes de irem para os logs:
   nada de e-mail, documentos, telefones ou parâmetros de URL. */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const LONG_DIGITS = /\d[\d.\-\s/]{6,}\d/g;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

export function redactErrorText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value
    .replace(EMAIL, "[email]")
    .replace(UUID, "[id]")
    .replace(LONG_DIGITS, "[número]")
    .slice(0, maxLength);
}

/* Só o caminho, sem query string nem hash, e com IDs mascarados. */
export function sanitizePath(value: unknown) {
  if (typeof value !== "string") return "";
  const path = value.split(/[?#]/)[0] || "";
  return path.replace(UUID, "[id]").replace(/\/\d+(?=\/|$)/g, "/[id]").slice(0, 200);
}

/* Mesmo tratamento para a URL enviada à Vercel Analytics. */
export function sanitizeAnalyticsUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${sanitizePath(parsed.pathname)}`;
  } catch {
    return sanitizePath(url);
  }
}
