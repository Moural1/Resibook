// Regiões do mapa corporal a partir do texto do prontuário.
//
// O mapa deve apontar onde há queixa ou alteração, não onde o exame foi
// descrito. Por isso: trechos negados ("nega dor abdominal", "MMII sem
// edema") são removidos antes de procurar a região, e no exame físico só
// contam os trechos com alguma alteração descrita.

export type RegionId =
  | "head"
  | "chest"
  | "abdomen"
  | "pelvis"
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "spine"
  | "kidneys";

export const REGION_PATTERNS: Array<{ region: RegionId | RegionId[]; patterns: RegExp[] }> = [
  {
    region: ["leftLeg", "rightLeg"],
    patterns: [/\bmmii\b|membros inferiores|ambas as pernas|\bpernas\b|bilateral(mente)? em (mmii|membros inferiores)/i],
  },
  {
    region: ["leftArm", "rightArm"],
    patterns: [/\bmmss\b|membros superiores|ambos os bra[cç]os/i],
  },
  {
    region: "head",
    patterns: [
      /cefale|cabe[cç]a|enxaquec|migr[aâ]n|avc|convuls|epilep|vertig|tontur|neurol|pupila|facial/i,
    ],
  },
  {
    region: "chest",
    patterns: [
      /tor[aá]c|peito|card[ií]|coron|arrit|insufici[eê]ncia card|dispne|asma|dpoc|pneum|pulm|sibil|tosse|respirat/i,
    ],
  },
  {
    region: "abdomen",
    patterns: [
      /abdom|epigastr|gastr|[uú]lcera|hepat|f[ií]gad|pancre|intestinal|diarre|v[oô]mit|n[aá]use|colec|apend/i,
    ],
  },
  {
    region: "pelvis",
    patterns: [
      /p[eé]lv|gesta|gravidez|uter|ovar|ginecol|inguinal|bexiga|dis[uú]ria|urin[aá]r|pr[oó]stat/i,
    ],
  },
  {
    region: "spine",
    patterns: [/lomb|coluna|dorsal|cervicalgia|ciatal|vertebr|dorso/i],
  },
  {
    region: "kidneys",
    patterns: [/renal|rim|rins|creatinin|di[aá]lise|nefro|flanco/i],
  },
  {
    region: "leftArm",
    patterns: [/(bra[cç]o|m[aã]o|ombro|cotovelo|membro superior).{0,20}(esquerd|e\b)/i],
  },
  {
    region: "rightArm",
    patterns: [/(bra[cç]o|m[aã]o|ombro|cotovelo|membro superior).{0,20}(direit|d\b)/i],
  },
  {
    region: "leftLeg",
    patterns: [/(perna|p[eé]|joelho|coxa|tornozelo|membro inferior).{0,20}(esquerd|e\b)/i],
  },
  {
    region: "rightLeg",
    patterns: [/(perna|p[eé]|joelho|coxa|tornozelo|membro inferior).{0,20}(direit|d\b)/i],
  },
];

// "sem edema", "nega dor", "ausência de sopros": o que vem depois da negação
// até a próxima vírgula/ponto não é achado.
const NEGATION_RE =
  /\b(?:sem|s\/|nega(?:m|ndo)?|negativ[oa]s?\s+para|aus[eê]ncia\s+de|ausentes?|n[aã]o|nenhum[a]?|livres?\s+de)\b[^,;.\n]*/gi;

// Termos de exame que descrevem algo alterado.
const ABNORMAL_RE =
  /\bdor\b|\bdoloros|edema|empastad|crepit|estert|sibil|ronc|sopro|massa|n[oó]dul|les[aã]o|ferida|[uú]lcera|hiperemi|eritem|assim[eé]tric|diminu[ií]d|reduzid|abolid|d[eé]ficit|pare[st]ia|parestes|pl[eé]gi|rigidez|defesa|positiv|fratur|deformid|hematoma|abaulament|\bcian[oó]|p[aá]lid|hipocorad|\bict[eé]r|ascite|visceromegal|hepatomegal|esplenomegal|turgênci|estase|claudica|tumefa|calor local|flogos|secre[cç]|exsudat|petéqui|equimos|taquicard|bradicard|irregular|arr[ií]tm|desvio|ptose|nistagmo|ataxi|sinal de \w+ (?:\+|presente)/i;

export function stripNegations(value: string) {
  return value.replace(NEGATION_RE, " ").replace(/\s+/g, " ").trim();
}

export function matchRegions(value: string): RegionId[] {
  const text = stripNegations(value);
  if (!text) return [];
  const regions = REGION_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(text))
  ).flatMap(({ region }) => region);
  return [...new Set(regions)];
}

/** Trechos do exame físico com alteração (sem as partes negadas). */
export function abnormalExamSegments(value: string) {
  return value
    .split(/[;\n]|\.\s/)
    .map((segment) => segment.trim())
    .filter((segment) => segment && ABNORMAL_RE.test(stripNegations(segment)));
}

export function matchExamRegions(value: string): RegionId[] {
  return [...new Set(abnormalExamSegments(value).flatMap((segment) => matchRegions(segment)))];
}
