// Catálogos do módulo de acompanhamento psiquiátrico longitudinal.
// Tudo aqui é dado estático: nenhuma dependência de interface ou de banco.
// Portado de docs/prototipos/prototipo-psiquiatria.html.

export const FAIXAS_ETARIAS = [
  "Menos de 18",
  "18–24",
  "25–34",
  "35–44",
  "45–59",
  "60 ou mais",
] as const;
export type FaixaEtaria = (typeof FAIXAS_ETARIAS)[number];

export const SEXOS = {
  F: "Feminino",
  M: "Masculino",
  U: "Outro / não informado",
} as const;
export type Sexo = keyof typeof SEXOS;

/* ---------- genograma: só parentesco, nunca nome ---------- */

export const PARENTESCOS = {
  avo_pat_m: { rotulo: "Avô paterno", curto: "Avô pat.", sexo: "M", primeiroGrau: false },
  avo_pat_f: { rotulo: "Avó paterna", curto: "Avó pat.", sexo: "F", primeiroGrau: false },
  avo_mat_m: { rotulo: "Avô materno", curto: "Avô mat.", sexo: "M", primeiroGrau: false },
  avo_mat_f: { rotulo: "Avó materna", curto: "Avó mat.", sexo: "F", primeiroGrau: false },
  pai: { rotulo: "Pai", curto: "Pai", sexo: "M", primeiroGrau: true },
  mae: { rotulo: "Mãe", curto: "Mãe", sexo: "F", primeiroGrau: true },
  tio_pat: { rotulo: "Tio paterno", curto: "Tio pat.", sexo: "M", primeiroGrau: false },
  tia_pat: { rotulo: "Tia paterna", curto: "Tia pat.", sexo: "F", primeiroGrau: false },
  tio_mat: { rotulo: "Tio materno", curto: "Tio mat.", sexo: "M", primeiroGrau: false },
  tia_mat: { rotulo: "Tia materna", curto: "Tia mat.", sexo: "F", primeiroGrau: false },
  irmao: { rotulo: "Irmão", curto: "Irmão", sexo: "M", primeiroGrau: true },
  irma: { rotulo: "Irmã", curto: "Irmã", sexo: "F", primeiroGrau: true },
  conjuge_m: { rotulo: "Cônjuge (homem)", curto: "Cônjuge", sexo: "M", primeiroGrau: false },
  conjuge_f: { rotulo: "Cônjuge (mulher)", curto: "Cônjuge", sexo: "F", primeiroGrau: false },
  filho: { rotulo: "Filho", curto: "Filho", sexo: "M", primeiroGrau: true },
  filha: { rotulo: "Filha", curto: "Filha", sexo: "F", primeiroGrau: true },
} as const;
export type Parentesco = keyof typeof PARENTESCOS;

/** Parentescos que só podem aparecer uma vez no genograma. */
export const PARENTESCOS_UNICOS: readonly Parentesco[] = [
  "avo_pat_m",
  "avo_pat_f",
  "avo_mat_m",
  "avo_mat_f",
  "pai",
  "mae",
];

export const CONDICOES_FAMILIARES = {
  dep: { rotulo: "Depressão", sigla: "DEP", risco: false },
  tab: { rotulo: "Transtorno bipolar", sigla: "TAB", risco: false },
  psi: { rotulo: "Psicose", sigla: "PSI", risco: false },
  ans: { rotulo: "Ansiedade", sigla: "ANS", risco: false },
  spa: { rotulo: "Álcool ou outras substâncias", sigla: "SPA", risco: false },
  ts: { rotulo: "Tentativa de suicídio", sigla: "TS", risco: true },
  sui: { rotulo: "Suicídio", sigla: "SUI", risco: true },
  dem: { rotulo: "Demência", sigla: "DEM", risco: false },
  vio: { rotulo: "Violência ou abuso", sigla: "VIO", risco: true },
} as const;
export type CondicaoFamiliar = keyof typeof CONDICOES_FAMILIARES;

export const RELACOES_FAMILIARES = {
  proxima: "Próxima",
  distante: "Distante",
  conflituosa: "Conflituosa",
  rompida: "Rompida",
  neutra: "Sem registro",
} as const;
export type RelacaoFamiliar = keyof typeof RELACOES_FAMILIARES;

export const QUALIDADES_VINCULO = {
  forte: "Forte",
  moderado: "Moderado",
  fraco: "Fraco",
  conflituoso: "Conflituoso",
} as const;
export type QualidadeVinculo = keyof typeof QUALIDADES_VINCULO;

/* ---------- medicações ---------- */

export const CLASSES_MEDICACAO = {
  antidepressivo: { rotulo: "Antidepressivo", grupo: "antidepressivo" },
  triciclico: { rotulo: "Antidepressivo tricíclico", grupo: "antidepressivo" },
  litio: { rotulo: "Lítio", grupo: "estabilizador" },
  valproato: { rotulo: "Valproato", grupo: "estabilizador" },
  lamotrigina: { rotulo: "Lamotrigina", grupo: "estabilizador" },
  antipsicotico: { rotulo: "Antipsicótico", grupo: "antipsicotico" },
  clozapina: { rotulo: "Clozapina", grupo: "antipsicotico" },
  benzodiazepinico: { rotulo: "Benzodiazepínico", grupo: "benzodiazepinico" },
  outro: { rotulo: "Outro", grupo: "outro" },
} as const;
export type ClasseMedicacao = keyof typeof CLASSES_MEDICACAO;

export const CLASSES_ANTIDEPRESSIVAS: readonly ClasseMedicacao[] = ["antidepressivo", "triciclico"];
/** Classes que contam como estabilizador de humor para as regras de virada. */
export const CLASSES_ESTABILIZADORAS: readonly ClasseMedicacao[] = [
  "litio",
  "valproato",
  "lamotrigina",
  "antipsicotico",
  "clozapina",
];
/** Janela terapêutica estreita e alta letalidade em superdosagem. */
export const CLASSES_ALTA_LETALIDADE: readonly ClasseMedicacao[] = ["litio", "triciclico"];

export const RESPOSTAS_TERAPEUTICAS = {
  aguardando: "Aguardando efeito",
  boa: "Boa resposta",
  parcial: "Resposta parcial",
  sem: "Sem resposta",
  intolerancia: "Intolerância",
} as const;
export type RespostaTerapeutica = keyof typeof RESPOSTAS_TERAPEUTICAS;

/** Tentativa adequada: dose mínima eficaz por pelo menos este número de meses (~6 a 8 semanas). */
export const MESES_MINIMOS_TENTATIVA = 2;

/**
 * Tabela simplificada de referência. dose mínima eficaz em mg/dia
 * (0 = sem dose de referência na tabela). Chaves normalizadas, sem acento.
 */
export const FARMACOS: Record<string, { classe: ClasseMedicacao; doseMinima: number; nome: string }> = {
  sertralina: { classe: "antidepressivo", doseMinima: 50, nome: "Sertralina" },
  fluoxetina: { classe: "antidepressivo", doseMinima: 20, nome: "Fluoxetina" },
  paroxetina: { classe: "antidepressivo", doseMinima: 20, nome: "Paroxetina" },
  escitalopram: { classe: "antidepressivo", doseMinima: 10, nome: "Escitalopram" },
  citalopram: { classe: "antidepressivo", doseMinima: 20, nome: "Citalopram" },
  fluvoxamina: { classe: "antidepressivo", doseMinima: 100, nome: "Fluvoxamina" },
  desvenlafaxina: { classe: "antidepressivo", doseMinima: 50, nome: "Desvenlafaxina" },
  venlafaxina: { classe: "antidepressivo", doseMinima: 75, nome: "Venlafaxina" },
  duloxetina: { classe: "antidepressivo", doseMinima: 60, nome: "Duloxetina" },
  bupropiona: { classe: "antidepressivo", doseMinima: 150, nome: "Bupropiona" },
  mirtazapina: { classe: "antidepressivo", doseMinima: 15, nome: "Mirtazapina" },
  vortioxetina: { classe: "antidepressivo", doseMinima: 10, nome: "Vortioxetina" },
  trazodona: { classe: "antidepressivo", doseMinima: 150, nome: "Trazodona" },
  agomelatina: { classe: "antidepressivo", doseMinima: 25, nome: "Agomelatina" },
  amitriptilina: { classe: "triciclico", doseMinima: 75, nome: "Amitriptilina" },
  nortriptilina: { classe: "triciclico", doseMinima: 50, nome: "Nortriptilina" },
  clomipramina: { classe: "triciclico", doseMinima: 75, nome: "Clomipramina" },
  imipramina: { classe: "triciclico", doseMinima: 75, nome: "Imipramina" },
  "carbonato de litio": { classe: "litio", doseMinima: 0, nome: "Carbonato de lítio" },
  litio: { classe: "litio", doseMinima: 0, nome: "" },
  divalproato: { classe: "valproato", doseMinima: 0, nome: "Divalproato de sódio" },
  valproato: { classe: "valproato", doseMinima: 0, nome: "Valproato de sódio" },
  "acido valproico": { classe: "valproato", doseMinima: 0, nome: "Ácido valproico" },
  lamotrigina: { classe: "lamotrigina", doseMinima: 0, nome: "Lamotrigina" },
  quetiapina: { classe: "antipsicotico", doseMinima: 0, nome: "Quetiapina" },
  olanzapina: { classe: "antipsicotico", doseMinima: 0, nome: "Olanzapina" },
  risperidona: { classe: "antipsicotico", doseMinima: 0, nome: "Risperidona" },
  aripiprazol: { classe: "antipsicotico", doseMinima: 0, nome: "Aripiprazol" },
  lurasidona: { classe: "antipsicotico", doseMinima: 0, nome: "Lurasidona" },
  ziprasidona: { classe: "antipsicotico", doseMinima: 0, nome: "Ziprasidona" },
  paliperidona: { classe: "antipsicotico", doseMinima: 0, nome: "Paliperidona" },
  haloperidol: { classe: "antipsicotico", doseMinima: 0, nome: "Haloperidol" },
  clozapina: { classe: "clozapina", doseMinima: 0, nome: "Clozapina" },
  clonazepam: { classe: "benzodiazepinico", doseMinima: 0, nome: "Clonazepam" },
  alprazolam: { classe: "benzodiazepinico", doseMinima: 0, nome: "Alprazolam" },
  diazepam: { classe: "benzodiazepinico", doseMinima: 0, nome: "Diazepam" },
  lorazepam: { classe: "benzodiazepinico", doseMinima: 0, nome: "Lorazepam" },
  bromazepam: { classe: "benzodiazepinico", doseMinima: 0, nome: "Bromazepam" },
};

/* ---------- exames e monitorização ---------- */

export const EXAMES = [
  "Litemia",
  "Creatinina",
  "TSH",
  "Hemograma",
  "Função hepática",
  "Glicemia de jejum",
  "HbA1c",
  "Perfil lipídico",
  "Peso",
  "ECG",
  "Outro",
] as const;
export type Exame = (typeof EXAMES)[number];

export const UNIDADES_EXAME: Record<Exame, string> = {
  Litemia: "mEq/L",
  Creatinina: "mg/dL",
  TSH: "mUI/L",
  Hemograma: "neutrófilos/mm³",
  "Função hepática": "TGP em U/L",
  "Glicemia de jejum": "mg/dL",
  HbA1c: "%",
  "Perfil lipídico": "triglicerídeos em mg/dL",
  Peso: "kg",
  ECG: "QTc em ms",
  Outro: "",
};

export const FAIXAS_REFERENCIA: Partial<Record<Exame, [number, number]>> = {
  Litemia: [0.6, 1.0],
};

/**
 * Exigência de monitorização: um rótulo, os exames que a satisfazem e o
 * intervalo em meses. Intervalos simplificados; ajustar ao protocolo local.
 */
export type ExigenciaMonitorizacao = {
  rotulo: string;
  exames: readonly Exame[];
  intervaloMeses: number;
};

const METABOLICO: ExigenciaMonitorizacao[] = [
  { rotulo: "Peso", exames: ["Peso"], intervaloMeses: 3 },
  { rotulo: "Glicemia ou HbA1c", exames: ["Glicemia de jejum", "HbA1c"], intervaloMeses: 12 },
  { rotulo: "Perfil lipídico", exames: ["Perfil lipídico"], intervaloMeses: 12 },
];

export const MONITORIZACAO: Partial<Record<ClasseMedicacao, ExigenciaMonitorizacao[]>> = {
  litio: [
    { rotulo: "Litemia", exames: ["Litemia"], intervaloMeses: 3 },
    { rotulo: "Creatinina", exames: ["Creatinina"], intervaloMeses: 6 },
    { rotulo: "TSH", exames: ["TSH"], intervaloMeses: 6 },
  ],
  valproato: [
    { rotulo: "Hemograma", exames: ["Hemograma"], intervaloMeses: 6 },
    { rotulo: "Função hepática", exames: ["Função hepática"], intervaloMeses: 6 },
  ],
  clozapina: [{ rotulo: "Hemograma", exames: ["Hemograma"], intervaloMeses: 1 }, ...METABOLICO],
  antipsicotico: METABOLICO,
};

/* ---------- consulta ---------- */

export const HUMOR = {
  "3": "Mania grave",
  "2": "Mania moderada",
  "1": "Hipomania",
  "0": "Eutimia",
  "-1": "Depressão leve",
  "-2": "Depressão moderada",
  "-3": "Depressão grave",
} as const;
export type EstadoHumor = -3 | -2 | -1 | 0 | 1 | 2 | 3;
export const ESTADOS_HUMOR: readonly EstadoHumor[] = [3, 2, 1, 0, -1, -2, -3];
export function rotuloHumor(valor: number) {
  return HUMOR[String(valor) as keyof typeof HUMOR] ?? "";
}

export const EXAME_ESTADO_MENTAL = [
  { chave: "apresentacao", rotulo: "Apresentação", opcoes: ["Adequada", "Descuidada", "Exuberante", "Bizarra"] },
  { chave: "atitude", rotulo: "Atitude", opcoes: ["Colaborativa", "Pouco colaborativa", "Desconfiada", "Hostil"] },
  { chave: "consciencia", rotulo: "Consciência", opcoes: ["Vígil", "Sonolenta", "Flutuante"] },
  { chave: "orientacao", rotulo: "Orientação", opcoes: ["Orientado(a)", "Desorientado(a) no tempo", "Desorientado(a) no espaço"] },
  { chave: "atencao", rotulo: "Atenção", opcoes: ["Preservada", "Reduzida", "Distraibilidade"] },
  { chave: "memoria", rotulo: "Memória", opcoes: ["Preservada", "Prejuízo recente", "Prejuízo remoto"] },
  { chave: "humor", rotulo: "Humor", opcoes: ["Eutímico", "Deprimido", "Ansioso", "Irritável", "Eufórico"] },
  { chave: "afeto", rotulo: "Afeto", opcoes: ["Congruente e modulado", "Embotado", "Lábil", "Incongruente"] },
  { chave: "curso", rotulo: "Curso do pensamento", opcoes: ["Sem alterações", "Lentificado", "Acelerado", "Fuga de ideias", "Desagregado"] },
  { chave: "conteudo", rotulo: "Conteúdo do pensamento", opcoes: ["Sem alterações", "Ideias de culpa ou ruína", "Ideação suicida", "Ideias de grandeza", "Ideias persecutórias", "Obsessões"] },
  { chave: "senso", rotulo: "Sensopercepção", opcoes: ["Sem alterações", "Alucinações auditivas", "Alucinações visuais", "Atitude alucinatória"] },
  { chave: "psicomotricidade", rotulo: "Psicomotricidade", opcoes: ["Sem alterações", "Lentificada", "Agitada", "Inquietação"] },
  { chave: "volicao", rotulo: "Volição", opcoes: ["Preservada", "Hipobulia", "Hiperbulia"] },
  { chave: "juizo", rotulo: "Juízo e crítica", opcoes: ["Preservados", "Parciais", "Prejudicados"] },
] as const;

/** Exame do estado mental sem alterações: primeira opção de cada domínio. */
export function exameEstadoMentalSemAlteracoes(): Record<string, string[]> {
  return Object.fromEntries(EXAME_ESTADO_MENTAL.map(({ chave, opcoes }) => [chave, [opcoes[0]]]));
}

export const EFEITOS_ADVERSOS = [
  "Sonolência",
  "Ganho de peso",
  "Disfunção sexual",
  "Náusea",
  "Tremor",
  "Inquietação ou acatisia",
  "Insônia",
  "Cefaleia",
] as const;

export const ADESAO = { boa: "Boa", parcial: "Parcial", ruim: "Ruim" } as const;
export type Adesao = keyof typeof ADESAO;

/* ---------- plano de segurança (Stanley e Brown) ---------- */

export const SECOES_PLANO = [
  { chave: "alerta", titulo: "1. Sinais de alerta", tituloPaciente: "1. Sinais de que uma crise pode estar começando:", descricao: "Pensamentos, humor, situações ou comportamentos que antecedem uma crise.", exemplo: "Ex.: Ficar isolado no quarto" },
  { chave: "internas", titulo: "2. O que posso fazer sozinho(a)", tituloPaciente: "2. O que posso fazer sozinho(a) para me acalmar ou me distrair:", descricao: "Estratégias sem precisar contatar outra pessoa.", exemplo: "Ex.: Caminhar, ouvir música" },
  { chave: "distracao", titulo: "3. Pessoas e lugares que distraem", tituloPaciente: "3. Pessoas e lugares que me ajudam a mudar o foco:", descricao: "Convívio social e ambientes que ajudam a mudar o foco.", exemplo: "Ex.: Casa da irmã" },
  { chave: "ajuda", titulo: "4. Pessoas a quem pedir ajuda", tituloPaciente: "4. Pessoas a quem posso pedir ajuda:", descricao: "Registre só o vínculo. Nome e telefone vão apenas na cópia do paciente.", exemplo: "Ex.: Mãe" },
  { chave: "profissionais", titulo: "5. Profissionais e serviços em crise", tituloPaciente: "5. Profissionais e serviços que posso procurar:", descricao: "", exemplo: "Ex.: CAPS de referência" },
  { chave: "meios", titulo: "6. Ambiente seguro", tituloPaciente: "6. Como deixar meu ambiente mais seguro:", descricao: "Restrição de acesso a meios letais.", exemplo: "Ex.: Objetos cortantes guardados" },
] as const;
export type SecaoPlano = (typeof SECOES_PLANO)[number]["chave"];

export const SERVICOS_CRISE = [
  "Ambulatório de psiquiatria",
  "CAPS de referência",
  "CVV 188 (24 horas, gratuito)",
  "SAMU 192",
  "UPA ou pronto-socorro mais próximo",
];

/* ---------- referências citadas nos alertas ---------- */

export const REFERENCIAS = {
  cssrs: "Posner K. et al., Am J Psychiatry, 2011 (C-SSRS).",
  plano: "Stanley B., Brown G., Cogn Behav Pract, 2012 (plano de segurança).",
  canmatD: "CANMAT 2016, diretrizes para depressão.",
  canmatB: "CANMAT/ISBD 2018, diretrizes para transtorno bipolar.",
  meta: "Consenso ADA/APA, Diabetes Care, 2004 (antipsicóticos e metabolismo).",
  nice: "NICE CG185, transtorno bipolar (monitorização do lítio).",
  audit: "OMS: AUDIT e ASSIST.",
  mdq: "Hirschfeld R. et al., Am J Psychiatry, 2000 (MDQ).",
  ymrs: "Young R. et al., Br J Psychiatry, 1978 (YMRS).",
  phq: "Kroenke K. et al., J Gen Intern Med, 2001 (PHQ-9).",
  ada: "American Diabetes Association, Standards of Care (critérios de HbA1c).",
} as const;
export type ReferenciaId = keyof typeof REFERENCIAS;
