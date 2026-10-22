/* "⚠ texto" → { confirmar: true, texto: "texto" }. Mantido à parte dos dados
   para que os componentes não carreguem o dossiê inteiro. */
export function separarConfirmar(texto: string) {
  const inicio = texto.trimStart();
  const confirmar = inicio.startsWith("⚠");
  return { confirmar, texto: confirmar ? inicio.slice(1).trimStart() : texto };
}
