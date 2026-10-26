/* Caminho interno seguro para redirecionar depois do login ou da confirmação
   de e-mail. Recusa URLs externas e truques como "//site", "/\site" (o
   navegador trata "\" como "/") e caracteres de controle. */
const BASE = "https://resibook.invalid";

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
