/* Realce de leitura para os textos dos fluxogramas: números de prova
   (doses, cortes, prazos), a frase-armadilha entre aspas e a correção entre
   parênteses. Só formatação de exibição; o texto não muda. */

export type Trecho = { tipo: "texto" | "numero" | "armadilha" | "correcao"; texto: string };

const UNIDADES =
  "%|°C|\\/mm³|horas?|minutos?|mL\\/kg\\/h|mL\\/kg|mL\\/h|mL\\/24 h|mL|mg\\/kg\\/dia|mg\\/kg|mg\\/dL|mg\\/dia|mg|g\\/dL|g\\/kg|g|µg\\/kg\\/min|µg\\/L|UI\\/L|UI|U\\/kg\\/h|U\\/min|mmol\\/L|mmHg|cmH2O|cmH₂O|cm|mm|ms|bpm|ppm|kg|h|min|s|dias?|semanas?|meses|mês|anos?";
const NUMERO = new RegExp(
  `(?:[≥≤<>]\\s?)?\\d+(?:[.,]\\d+)*(?:\\s?(?:–|-|a)\\s?\\d+(?:[.,]\\d+)*)?(?:\\s?(?:${UNIDADES})(?![\\p{L}]))?`,
  "gu"
);
const ARMADILHA = /'[^']{2,}'|"[^"]{2,}"|“[^”]{2,}”/g;
const CORRECAO = /\((?:é|são|não|isso é|corte é|o corte é)\s[^)]+\)/g;

type Marca = { inicio: number; fim: number; tipo: Exclude<Trecho["tipo"], "texto"> };

function marcas(texto: string, regex: RegExp, tipo: Marca["tipo"]): Marca[] {
  return Array.from(texto.matchAll(regex), (m) => ({ inicio: m.index ?? 0, fim: (m.index ?? 0) + m[0].length, tipo }));
}

function ehNumeroUtil(trecho: string) {
  // Evita realçar ordinais soltos ("5º"), anos de diretriz ("2023") e números isolados de 1 dígito.
  if (/^(19|20)\d{2}$/.test(trecho)) return false;
  return /[≥≤<>%]|\d[.,]\d|\d\s?(?:–|-|a)\s?\d|[A-Za-zµ]/.test(trecho) || /\d{2,}/.test(trecho);
}

export function destacar(texto: string, { numeros = true }: { numeros?: boolean } = {}): Trecho[] {
  const fortes = [...marcas(texto, ARMADILHA, "armadilha"), ...marcas(texto, CORRECAO, "correcao")];
  const livres = (m: Marca) => !fortes.some((f) => m.inicio < f.fim && m.fim > f.inicio);
  const nums = numeros
    ? marcas(texto, NUMERO, "numero").filter((m) => livres(m) && ehNumeroUtil(texto.slice(m.inicio, m.fim).trim()))
    : [];
  const todas = [...fortes, ...nums].sort((a, b) => a.inicio - b.inicio);

  const trechos: Trecho[] = [];
  let cursor = 0;
  for (const marca of todas) {
    if (marca.inicio < cursor) continue;
    if (marca.inicio > cursor) trechos.push({ tipo: "texto", texto: texto.slice(cursor, marca.inicio) });
    trechos.push({ tipo: marca.tipo, texto: texto.slice(marca.inicio, marca.fim) });
    cursor = marca.fim;
  }
  if (cursor < texto.length) trechos.push({ tipo: "texto", texto: texto.slice(cursor) });
  return trechos;
}

/* "Termo: detalhe" vira título + corpo quando o termo é curto. */
export function separarTitulo(texto: string): { titulo: string | null; corpo: string } {
  const indice = texto.indexOf(": ");
  if (indice > 0 && indice <= 48) {
    const titulo = texto.slice(0, indice);
    if (titulo.split(/\s+/).length <= 7 && !/[.;]/.test(titulo)) return { titulo, corpo: texto.slice(indice + 2) };
  }
  return { titulo: null, corpo: texto };
}

/* Pegadinha: separa o veredito final (": falso", "está errado"…) do enunciado. */
export function separarVeredito(texto: string): { enunciado: string; veredito: string | null } {
  const m = texto.match(/^(.*?)(?::\s*|\s*[—-]\s*|\s+)((?:sempre )?falso|errado|está errado|é errado|= errado|= erro|não se usa|não existe|não fecha|não é)\.?$/i);
  if (m && m[1].length > 8) return { enunciado: m[1].replace(/[:\s]+$/, ""), veredito: m[2] };
  return { enunciado: texto, veredito: null };
}
