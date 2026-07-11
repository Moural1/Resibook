export type CalculatorValue = string | number | boolean;
export type CalculatorValues = Record<string, CalculatorValue>;

export type CalculatorOption = {
  label: string;
  value: string;
};

export type CalculatorField = {
  id: string;
  label: string;
  type: "number" | "boolean" | "select";
  defaultValue?: CalculatorValue;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  options?: CalculatorOption[];
  required?: boolean;
  unitByValue?: {
    fieldId: string;
    units: Record<string, string>;
  };
  validate?: (value: number, values: CalculatorValues) => string | null;
};

export type CalculatorResult = {
  value: string;
  label: string;
  classification: string;
  interpretation: string;
  recommendation: string;
  limitations: string;
  copyText: string;
  breakdown?: string[];
};

export type ClinicalCalculator = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  fields: CalculatorField[];
  reference: {
    label: string;
    url: string;
  };
  calculate: (values: CalculatorValues) => CalculatorResult | null;
};

function num(values: CalculatorValues, id: string) {
  const raw = values[id];
  if (raw === "" || raw === null || raw === undefined) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function yes(values: CalculatorValues, id: string) {
  return values[id] === true;
}

function selected(values: CalculatorValues, id: string) {
  return String(values[id] ?? "");
}

function checkbox(id: string, label: string, help?: string): CalculatorField {
  return { id, label, type: "boolean", defaultValue: "", help, required: true };
}

function numberField(
  id: string,
  label: string,
  unit: string,
  min: number,
  max: number,
  step = 1,
  help?: string,
  required = true
): CalculatorField {
  return { id, label, type: "number", defaultValue: "", unit, min, max, step, help, required };
}

function selectField(
  id: string,
  label: string,
  options: CalculatorOption[],
  defaultValue?: string,
  help?: string
): CalculatorField {
  return {
    id,
    label,
    type: "select",
    options,
    defaultValue: defaultValue ?? options[0]?.value ?? "",
    help,
  };
}

function result(
  value: string,
  label: string,
  classification: string,
  interpretation: string,
  recommendation: string,
  limitations: string,
  copyText: string,
  breakdown?: string[]
): CalculatorResult {
  return {
    value,
    label,
    classification,
    interpretation,
    recommendation,
    limitations,
    copyText,
    breakdown,
  };
}

const curb65: ClinicalCalculator = {
  id: "curb65",
  name: "CURB-65",
  shortName: "CURB-65",
  category: "Infectologia e pneumologia",
  description: "Estratificação de gravidade na pneumonia adquirida na comunidade.",
  fields: [
    numberField("age", "Idade", "anos", 18, 120),
    selectField(
      "ureaUnit",
      "Exame e unidade da ureia",
      [
        { value: "urea_mgdl", label: "Ureia total (mg/dL) — padrão no Brasil" },
        { value: "bun_mgdl", label: "Nitrogênio ureico / BUN (mg/dL)" },
        { value: "urea_mmoll", label: "Ureia (mmol/L)" },
      ],
      "urea_mgdl",
      "Pontua se ureia > 42 mg/dL, BUN > 19,6 mg/dL ou ureia > 7 mmol/L."
    ),
    {
      ...numberField(
        "urea",
        "Resultado da ureia",
        "mg/dL",
        0,
        500,
        0.1,
        "Informe o valor exatamente como aparece no laboratório."
      ),
      unitByValue: {
        fieldId: "ureaUnit",
        units: {
          urea_mgdl: "mg/dL",
          bun_mgdl: "mg/dL (BUN)",
          urea_mmoll: "mmol/L",
        },
      },
      validate(value, values) {
        const unit = selected(values, "ureaUnit");
        const max = unit === "urea_mmoll" ? 80 : unit === "bun_mgdl" ? 250 : 500;
        return value > max
          ? `Resultado de ureia fora da faixa aceita para ${unit === "urea_mmoll" ? "mmol/L" : "mg/dL"}.`
          : null;
      },
    },
    numberField("rr", "Frequência respiratória", "irpm", 1, 80),
    numberField("sbp", "Pressão arterial sistólica", "mmHg", 30, 300),
    numberField("dbp", "Pressão arterial diastólica", "mmHg", 10, 200),
    checkbox("confusion", "Confusão mental nova"),
  ],
  reference: {
    label: "Lim et al., Thorax 2003",
    url: "https://thorax.bmj.com/content/58/5/377",
  },
  calculate(values) {
    const age = num(values, "age");
    const urea = num(values, "urea");
    const ureaUnit = selected(values, "ureaUnit");
    const rr = num(values, "rr");
    const sbp = num(values, "sbp");
    const dbp = num(values, "dbp");
    if ([age, urea, rr, sbp, dbp].some((value) => value === null)) return null;

    const elevatedUrea =
      ureaUnit === "urea_mmoll"
        ? urea! > 7
        : ureaUnit === "bun_mgdl"
          ? urea! > 19.6
          : urea! > 42;
    const ureaDescription =
      ureaUnit === "urea_mmoll"
        ? "ureia > 7 mmol/L"
        : ureaUnit === "bun_mgdl"
          ? "BUN > 19,6 mg/dL"
          : "ureia total > 42 mg/dL";

    const criteria = [
      [yes(values, "confusion"), "confusão"],
      [elevatedUrea, ureaDescription],
      [rr! >= 30, "FR ≥ 30 irpm"],
      [sbp! < 90 || dbp! <= 60, "PAS < 90 ou PAD ≤ 60 mmHg"],
      [age! >= 65, "idade ≥ 65 anos"],
    ] as const;
    const score = criteria.filter(([active]) => active).length;
    const breakdown = criteria.filter(([active]) => active).map(([, label]) => `+1 ${label}`);

    if (score <= 1) {
      return result(
        String(score),
        "ponto(s)",
        "Baixa gravidade pelo escore",
        "CURB-65 entre 0 e 1 sugere menor risco de mortalidade na pneumonia comunitária.",
        "Avaliar tratamento ambulatorial apenas se oxigenação, comorbidades, tolerância oral, suporte e reavaliação forem adequados.",
        "Não contempla hipoxemia, descompensação de comorbidades nem fatores sociais; não deve definir sozinho o local de cuidado.",
        `CURB-65 = ${score} ponto${score === 1 ? "" : "s"}. Baixa gravidade pelo escore. Considerar manejo ambulatorial somente conforme oxigenação, comorbidades, tolerância oral, suporte domiciliar e resposta inicial.`,
        breakdown
      );
    }

    if (score === 2) {
      return result(
        "2",
        "pontos",
        "Risco intermediário",
        "Pontuação intermediária, associada a maior risco e necessidade de avaliação hospitalar.",
        "Considerar internação ou observação estruturada conforme contexto clínico e resposta inicial.",
        "O escore não substitui avaliação de hipoxemia, choque, necessidade ventilatória ou critérios de terapia intensiva.",
        "CURB-65 = 2 pontos. Risco intermediário. Considerar internação conforme contexto clínico, comorbidades, saturação, suporte domiciliar e resposta inicial.",
        breakdown
      );
    }

    return result(
      String(score),
      "pontos",
      "Pneumonia grave pelo escore",
      "CURB-65 ≥ 3 identifica grupo de maior risco.",
      "Indicar avaliação hospitalar urgente e considerar cuidado intensivo conforme instabilidade, oxigenação e disfunções orgânicas.",
      "Não é instrumento isolado para indicação de UTI e não substitui avaliação fisiológica completa.",
      `CURB-65 = ${score} pontos. Pneumonia grave pelo escore. Indicar avaliação hospitalar urgente e considerar terapia intensiva conforme instabilidade, oxigenação e disfunções orgânicas.`,
      breakdown
    );
  },
};

const qsofa: ClinicalCalculator = {
  id: "qsofa",
  name: "qSOFA",
  shortName: "qSOFA",
  category: "Emergência e sepse",
  description: "Sinaliza maior risco de desfecho desfavorável em adultos com suspeita de infecção.",
  fields: [
    numberField("rr", "Frequência respiratória", "irpm", 1, 80),
    numberField("sbp", "Pressão arterial sistólica", "mmHg", 30, 300),
    checkbox("altered", "Alteração do estado mental / Glasgow < 15"),
  ],
  reference: {
    label: "Sepsis-3, JAMA 2016",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4968574/",
  },
  calculate(values) {
    const rr = num(values, "rr");
    const sbp = num(values, "sbp");
    if (rr === null || sbp === null) return null;
    const criteria = [
      [rr >= 22, "FR ≥ 22 irpm"],
      [sbp <= 100, "PAS ≤ 100 mmHg"],
      [yes(values, "altered"), "alteração do estado mental"],
    ] as const;
    const score = criteria.filter(([active]) => active).length;
    const breakdown = criteria.filter(([active]) => active).map(([, label]) => `+1 ${label}`);
    const elevated = score >= 2;
    return result(
      String(score),
      "ponto(s)",
      elevated ? "Maior risco de desfecho desfavorável" : "Sem alto risco pelo qSOFA",
      elevated
        ? "qSOFA ≥ 2 associa-se a maior risco de mortalidade ou permanência prolongada em UTI fora da terapia intensiva."
        : "qSOFA < 2 não afasta sepse nem disfunção orgânica.",
      elevated
        ? "Acelerar avaliação de disfunção orgânica, perfusão, lactato, foco infeccioso e necessidade de escalonamento terapêutico."
        : "Manter rastreio clínico e laboratorial de sepse se houver suspeita; repetir avaliação diante de mudança clínica.",
      "qSOFA não diagnostica sepse e tem sensibilidade limitada; não deve ser usado para excluir doença ou atrasar tratamento.",
      `qSOFA = ${score} ponto${score === 1 ? "" : "s"}. ${
        elevated
          ? "Maior risco de desfecho desfavorável; acelerar avaliação de disfunção orgânica, perfusão e necessidade de escalonamento."
          : "Sem alto risco pelo qSOFA, sem excluir sepse; manter avaliação clínica e laboratorial conforme suspeita."
      }`,
      breakdown
    );
  },
};

function scoreNewsRespiratoryRate(value: number) {
  if (value <= 8 || value >= 25) return 3;
  if (value <= 11) return 1;
  if (value <= 20) return 0;
  return 2;
}

function scoreNewsSpo2(value: number, scale: string, oxygen: boolean) {
  if (scale === "scale2") {
    if (value <= 83) return 3;
    if (value <= 85) return 2;
    if (value <= 87) return 1;
    if (value <= 92 || !oxygen) return 0;
    if (value <= 94) return 1;
    if (value <= 96) return 2;
    return 3;
  }
  if (value <= 91) return 3;
  if (value <= 93) return 2;
  if (value <= 95) return 1;
  return 0;
}

function scoreNewsSbp(value: number) {
  if (value <= 90 || value >= 220) return 3;
  if (value <= 100) return 2;
  if (value <= 110) return 1;
  return 0;
}

function scoreNewsPulse(value: number) {
  if (value <= 40 || value >= 131) return 3;
  if (value <= 50 || (value >= 91 && value <= 110)) return 1;
  if (value >= 111) return 2;
  return 0;
}

function scoreNewsTemperature(value: number) {
  if (value <= 35) return 3;
  if (value <= 36 || (value >= 38.1 && value <= 39)) return 1;
  if (value >= 39.1) return 2;
  return 0;
}

const news2: ClinicalCalculator = {
  id: "news2",
  name: "NEWS2",
  shortName: "NEWS2",
  category: "Emergência e deterioração",
  description: "Pontuação padronizada para detecção e resposta à deterioração clínica em adultos.",
  fields: [
    numberField("rr", "Frequência respiratória", "irpm", 1, 80),
    numberField("spo2", "Saturação de oxigênio", "%", 50, 100),
    selectField(
      "oxygenScale",
      "Escala de SpO₂",
      [
        { value: "scale1", label: "Escala 1 - padrão" },
        { value: "scale2", label: "Escala 2 - alvo 88-92% prescrito" },
      ],
      "scale1",
      "Use Escala 2 apenas em insuficiência respiratória hipercápnica confirmada e com alvo prescrito."
    ),
    checkbox("oxygen", "Em oxigênio suplementar"),
    numberField("sbp", "Pressão arterial sistólica", "mmHg", 30, 300),
    numberField("pulse", "Frequência cardíaca", "bpm", 20, 250),
    selectField("consciousness", "Consciência", [
      { value: "alert", label: "Alerta" },
      { value: "confusion", label: "Nova confusão" },
      { value: "voice", label: "Resposta à voz" },
      { value: "pain", label: "Resposta à dor" },
      { value: "unresponsive", label: "Não responsivo" },
    ]),
    numberField("temperature", "Temperatura", "°C", 25, 45, 0.1),
  ],
  reference: {
    label: "Royal College of Physicians - NEWS2",
    url: "https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/",
  },
  calculate(values) {
    const rr = num(values, "rr");
    const spo2 = num(values, "spo2");
    const sbp = num(values, "sbp");
    const pulse = num(values, "pulse");
    const temperature = num(values, "temperature");
    if ([rr, spo2, sbp, pulse, temperature].some((value) => value === null)) return null;

    const oxygen = yes(values, "oxygen");
    const scale = selected(values, "oxygenScale");
    const consciousness = selected(values, "consciousness");
    const parameterScores = [
      ["FR", scoreNewsRespiratoryRate(rr!)],
      ["SpO₂", scoreNewsSpo2(spo2!, scale, oxygen)],
      ["PAS", scoreNewsSbp(sbp!)],
      ["FC", scoreNewsPulse(pulse!)],
      ["Consciência", consciousness === "alert" ? 0 : 3],
      ["Temperatura", scoreNewsTemperature(temperature!)],
    ] as const;
    const oxygenScore = oxygen ? 2 : 0;
    const score = parameterScores.reduce((sum, [, points]) => sum + points, oxygenScore);
    const singleThree = parameterScores.some(([, points]) => points === 3);
    const breakdown = [
      ...parameterScores.filter(([, points]) => points > 0).map(([label, points]) => `${label}: ${points}`),
      ...(oxygen ? ["Oxigênio suplementar: 2"] : []),
    ];

    let classification = "Baixo risco agregado";
    let interpretation = "NEWS2 entre 0 e 4, sem parâmetro isolado de 3 pontos.";
    let recommendation = "Manter monitorização conforme protocolo local e reavaliar diante de mudança clínica.";
    if (score >= 7) {
      classification = "Alto risco clínico";
      interpretation = "NEWS2 ≥ 7 indica alto risco de deterioração aguda.";
      recommendation = "Solicitar avaliação clínica emergencial e considerar resposta de equipe crítica conforme protocolo local.";
    } else if (score >= 5) {
      classification = "Risco clínico intermediário";
      interpretation = "NEWS2 entre 5 e 6 requer resposta clínica urgente.";
      recommendation = "Aumentar frequência de monitorização e solicitar avaliação clínica urgente conforme protocolo local.";
    } else if (singleThree) {
      classification = "Baixo-médio risco por parâmetro extremo";
      interpretation = "NEWS2 agregado baixo, porém há um parâmetro isolado com 3 pontos.";
      recommendation = "Solicitar avaliação clínica e aumentar monitorização conforme o parâmetro alterado e o protocolo local.";
    }

    return result(
      String(score),
      "pontos",
      classification,
      interpretation,
      recommendation,
      "Aplicável a adultos; a Escala 2 de SpO₂ exige insuficiência respiratória hipercápnica confirmada e alvo de 88-92% prescrito. Não substitui avaliação imediata de instabilidade.",
      `NEWS2 = ${score} pontos (${scale === "scale2" ? "SpO₂ escala 2" : "SpO₂ escala 1"}${oxygen ? ", em O₂ suplementar" : ", em ar ambiente"}). ${classification}. ${recommendation}`,
      breakdown
    );
  },
};

const wellsPe: ClinicalCalculator = {
  id: "wells-pe",
  name: "Wells para TEP",
  shortName: "Wells TEP",
  category: "Tromboembolismo",
  description: "Probabilidade clínica pré-teste de tromboembolismo pulmonar em modelo de dois níveis.",
  fields: [
    checkbox("dvtSigns", "Sinais clínicos de TVP", "Edema e dor à palpação do sistema venoso profundo."),
    checkbox("peLikely", "TEP é mais provável que diagnóstico alternativo"),
    numberField("heartRate", "Frequência cardíaca", "bpm", 20, 250),
    checkbox("immobilization", "Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas"),
    checkbox("previousVte", "TVP ou TEP prévios"),
    checkbox("hemoptysis", "Hemoptise"),
    checkbox("malignancy", "Malignidade ativa / tratada nos últimos 6 meses / paliativa"),
  ],
  reference: {
    label: "NICE NG158 - Wells de dois níveis",
    url: "https://www.nice.org.uk/guidance/ng158/chapter/Recommendations",
  },
  calculate(values) {
    const heartRate = num(values, "heartRate");
    if (heartRate === null) return null;
    const criteria: Array<[boolean, number, string]> = [
      [yes(values, "dvtSigns"), 3, "sinais clínicos de TVP"],
      [yes(values, "peLikely"), 3, "TEP mais provável"],
      [heartRate > 100, 1.5, "FC > 100 bpm"],
      [yes(values, "immobilization"), 1.5, "imobilização/cirurgia recente"],
      [yes(values, "previousVte"), 1.5, "TVP/TEP prévios"],
      [yes(values, "hemoptysis"), 1, "hemoptise"],
      [yes(values, "malignancy"), 1, "malignidade"],
    ];
    const score = criteria.reduce((sum, [active, points]) => sum + (active ? points : 0), 0);
    const likely = score > 4;
    return result(
      score.toFixed(score % 1 ? 1 : 0),
      "pontos",
      likely ? "TEP provável" : "TEP improvável",
      likely ? "Wells > 4 no modelo de dois níveis." : "Wells ≤ 4 no modelo de dois níveis.",
      likely
        ? "Prosseguir com imagem diagnóstica e manejo provisório conforme estabilidade, contraindicações e protocolo local."
        : "Aplicar estratégia com D-dímero validado e considerar PERC apenas quando clinicamente apropriado e previsto no protocolo local.",
      "A variável 'TEP mais provável' exige julgamento clínico. O escore não deve atrasar estabilização ou investigação de paciente instável.",
      `Wells para TEP = ${score.toFixed(score % 1 ? 1 : 0)} pontos. ${likely ? "TEP provável" : "TEP improvável"} no modelo de dois níveis. ${
        likely ? "Prosseguir investigação por imagem conforme estabilidade e protocolo local." : "Considerar estratégia com D-dímero conforme probabilidade clínica e protocolo local."
      }`,
      criteria.filter(([active]) => active).map(([, points, label]) => `+${points} ${label}`)
    );
  },
};

const wellsDvt: ClinicalCalculator = {
  id: "wells-dvt",
  name: "Wells para TVP",
  shortName: "Wells TVP",
  category: "Tromboembolismo",
  description: "Probabilidade clínica pré-teste de trombose venosa profunda em modelo de dois níveis.",
  fields: [
    checkbox("cancer", "Câncer ativo"),
    checkbox("immobilization", "Paralisia, paresia ou imobilização gessada de membro inferior"),
    checkbox("bedridden", "Acamado ≥ 3 dias ou cirurgia de grande porte nas últimas 12 semanas"),
    checkbox("tenderness", "Dor localizada no trajeto do sistema venoso profundo"),
    checkbox("legSwelling", "Edema de toda a perna"),
    checkbox("calfSwelling", "Panturrilha ≥ 3 cm maior que o lado assintomático"),
    checkbox("pittingEdema", "Edema depressível restrito ao membro sintomático"),
    checkbox("collateralVeins", "Veias superficiais colaterais não varicosas"),
    checkbox("previousDvt", "TVP prévia documentada"),
    checkbox("alternative", "Diagnóstico alternativo tão provável quanto TVP"),
  ],
  reference: {
    label: "NICE NG158 - Wells de dois níveis",
    url: "https://www.nice.org.uk/guidance/ng158/chapter/Recommendations",
  },
  calculate(values) {
    const positive = [
      ["cancer", "câncer ativo"],
      ["immobilization", "paralisia/paresia/gesso"],
      ["bedridden", "acamado/cirurgia recente"],
      ["tenderness", "dor no sistema venoso profundo"],
      ["legSwelling", "edema de toda a perna"],
      ["calfSwelling", "diferença de panturrilha ≥ 3 cm"],
      ["pittingEdema", "edema depressível unilateral"],
      ["collateralVeins", "veias colaterais"],
      ["previousDvt", "TVP prévia"],
    ] as const;
    const score = positive.filter(([id]) => yes(values, id)).length - (yes(values, "alternative") ? 2 : 0);
    const likely = score >= 2;
    const breakdown = positive.filter(([id]) => yes(values, id)).map(([, label]) => `+1 ${label}`);
    if (yes(values, "alternative")) breakdown.push("-2 diagnóstico alternativo tão provável");
    return result(
      String(score),
      "pontos",
      likely ? "TVP provável" : "TVP improvável",
      likely ? "Wells ≥ 2 no modelo de dois níveis." : "Wells ≤ 1 no modelo de dois níveis.",
      likely
        ? "Solicitar ultrassonografia venosa em tempo oportuno e seguir manejo provisório conforme protocolo local."
        : "Considerar D-dímero; se positivo, prosseguir com ultrassonografia conforme protocolo local.",
      "O escore deve ser usado após história e exame direcionados e não substitui investigação urgente quando houver ameaça ao membro ou instabilidade.",
      `Wells para TVP = ${score} pontos. ${likely ? "TVP provável" : "TVP improvável"}. ${
        likely ? "Solicitar ultrassonografia venosa e seguir protocolo local." : "Considerar D-dímero e prosseguir conforme resultado e protocolo local."
      }`,
      breakdown
    );
  },
};

const cha2ds2Vasc: ClinicalCalculator = {
  id: "cha2ds2-vasc",
  name: "CHA₂DS₂-VASc",
  shortName: "CHA₂DS₂-VASc",
  category: "Cardiologia",
  description: "Estratificação de risco tromboembólico em fibrilação atrial.",
  fields: [
    numberField("age", "Idade", "anos", 18, 120),
    selectField("sex", "Sexo", [
      { value: "male", label: "Masculino" },
      { value: "female", label: "Feminino" },
    ]),
    checkbox("heartFailure", "Insuficiência cardíaca / disfunção ventricular esquerda"),
    checkbox("hypertension", "Hipertensão arterial"),
    checkbox("diabetes", "Diabetes mellitus"),
    checkbox("stroke", "AVC, AIT ou embolia sistêmica prévios"),
    checkbox("vascular", "Doença vascular", "IAM prévio, doença arterial periférica ou placa aórtica."),
  ],
  reference: {
    label: "ACC/AHA/ACCP/HRS 2023 - fibrilação atrial",
    url: "https://www.acc.org/guidelines/hubs/atrial-fibrillation",
  },
  calculate(values) {
    const age = num(values, "age");
    if (age === null) return null;
    const female = selected(values, "sex") === "female";
    let score = 0;
    const breakdown: string[] = [];
    for (const [id, label] of [
      ["heartFailure", "insuficiência cardíaca"],
      ["hypertension", "hipertensão"],
      ["diabetes", "diabetes"],
      ["vascular", "doença vascular"],
    ] as const) {
      if (yes(values, id)) {
        score += 1;
        breakdown.push(`+1 ${label}`);
      }
    }
    if (yes(values, "stroke")) {
      score += 2;
      breakdown.push("+2 AVC/AIT/embolia prévios");
    }
    if (age >= 75) {
      score += 2;
      breakdown.push("+2 idade ≥ 75 anos");
    } else if (age >= 65) {
      score += 1;
      breakdown.push("+1 idade 65-74 anos");
    }
    if (female) {
      score += 1;
      breakdown.push("+1 sexo feminino");
    }

    const low = (!female && score === 0) || (female && score === 1);
    const elevated = (!female && score >= 2) || (female && score >= 3);
    const classification = low
      ? "Baixo risco pelo escore"
      : elevated
        ? "Risco tromboembólico elevado"
        : "Risco intermediário";
    const recommendation = low
      ? "Em geral, não há indicação de anticoagulação apenas por este escore; reavaliar periodicamente."
      : elevated
        ? "Avaliar anticoagulação oral, risco de sangramento, preferências e contraindicações conforme diretriz vigente."
        : "Individualizar anticoagulação conforme risco anual estimado, modificadores clínicos e decisão compartilhada.";

    return result(
      String(score),
      "pontos",
      classification,
      "Quanto maior a pontuação, maior o risco de AVC ou embolia sistêmica em fibrilação atrial.",
      recommendation,
      "Use em fibrilação atrial; sexo feminino isolado atua como modificador de risco. Diretrizes mais recentes podem adotar limiares ou modelos diferentes.",
      `CHA₂DS₂-VASc = ${score} pontos. ${classification}. ${recommendation}`,
      breakdown
    );
  },
};

type AscvdCoefficientSet = {
  baselineSurvival: number;
  meanTerms: number;
  lnAge: number;
  lnAgeSquared?: number;
  lnTotalCholesterol: number;
  lnAgeTotalCholesterol?: number;
  lnHdl: number;
  lnAgeHdl?: number;
  lnTreatedSbp: number;
  lnAgeTreatedSbp?: number;
  lnUntreatedSbp: number;
  lnAgeUntreatedSbp?: number;
  smoker: number;
  lnAgeSmoker?: number;
  diabetes: number;
};

const ascvdPceCoefficients: Record<string, AscvdCoefficientSet> = {
  female_other: {
    baselineSurvival: 0.9665,
    meanTerms: -29.18,
    lnAge: -29.799,
    lnAgeSquared: 4.884,
    lnTotalCholesterol: 13.54,
    lnAgeTotalCholesterol: -3.114,
    lnHdl: -13.578,
    lnAgeHdl: 3.149,
    lnTreatedSbp: 2.019,
    lnUntreatedSbp: 1.957,
    smoker: 7.574,
    lnAgeSmoker: -1.665,
    diabetes: 0.661,
  },
  male_other: {
    baselineSurvival: 0.9144,
    meanTerms: 61.18,
    lnAge: 12.344,
    lnTotalCholesterol: 11.853,
    lnAgeTotalCholesterol: -2.664,
    lnHdl: -7.99,
    lnAgeHdl: 1.769,
    lnTreatedSbp: 1.797,
    lnUntreatedSbp: 1.764,
    smoker: 7.837,
    lnAgeSmoker: -1.795,
    diabetes: 0.658,
  },
  female_black: {
    baselineSurvival: 0.9533,
    meanTerms: 86.61,
    lnAge: 17.114,
    lnTotalCholesterol: 0.94,
    lnHdl: -18.92,
    lnAgeHdl: 4.475,
    lnTreatedSbp: 29.291,
    lnAgeTreatedSbp: -6.432,
    lnUntreatedSbp: 27.82,
    lnAgeUntreatedSbp: -6.087,
    smoker: 0.691,
    diabetes: 0.874,
  },
  male_black: {
    baselineSurvival: 0.8954,
    meanTerms: 19.54,
    lnAge: 2.469,
    lnTotalCholesterol: 0.302,
    lnHdl: -0.307,
    lnTreatedSbp: 1.916,
    lnUntreatedSbp: 1.809,
    smoker: 0.549,
    diabetes: 0.645,
  },
};

function calculateAscvdPooledCohortRisk(input: {
  sex: string;
  race: string;
  age: number;
  totalCholesterol: number;
  hdl: number;
  sbp: number;
  treatedSbp: boolean;
  smoker: boolean;
  diabetes: boolean;
}) {
  const key = `${input.sex}_${input.race}`;
  const coefficients = ascvdPceCoefficients[key] || ascvdPceCoefficients[`${input.sex}_other`];
  const lnAge = Math.log(input.age);
  const lnTotalCholesterol = Math.log(input.totalCholesterol);
  const lnHdl = Math.log(input.hdl);
  const lnSbp = Math.log(input.sbp);
  const sbpCoefficient = input.treatedSbp
    ? coefficients.lnTreatedSbp
    : coefficients.lnUntreatedSbp;
  const ageSbpCoefficient = input.treatedSbp
    ? coefficients.lnAgeTreatedSbp
    : coefficients.lnAgeUntreatedSbp;

  const sum =
    coefficients.lnAge * lnAge +
    (coefficients.lnAgeSquared || 0) * Math.pow(lnAge, 2) +
    coefficients.lnTotalCholesterol * lnTotalCholesterol +
    (coefficients.lnAgeTotalCholesterol || 0) * lnAge * lnTotalCholesterol +
    coefficients.lnHdl * lnHdl +
    (coefficients.lnAgeHdl || 0) * lnAge * lnHdl +
    sbpCoefficient * lnSbp +
    (ageSbpCoefficient || 0) * lnAge * lnSbp +
    (input.smoker ? coefficients.smoker + (coefficients.lnAgeSmoker || 0) * lnAge : 0) +
    (input.diabetes ? coefficients.diabetes : 0);

  return (1 - Math.pow(coefficients.baselineSurvival, Math.exp(sum - coefficients.meanTerms))) * 100;
}

const ascvdRisk: ClinicalCalculator = {
  id: "ascvd-risk",
  name: "Risco cardiovascular ASCVD em 10 anos",
  shortName: "Risco CV 10 anos",
  category: "Cardiologia",
  description: "Estimativa de risco de evento cardiovascular aterosclerótico em 10 anos pelas Pooled Cohort Equations ACC/AHA.",
  fields: [
    numberField("age", "Idade", "anos", 40, 79, 1, "Aplicável de 40 a 79 anos."),
    selectField("sex", "Sexo", [
      { value: "male", label: "Masculino" },
      { value: "female", label: "Feminino" },
    ]),
    selectField(
      "race",
      "Grupo usado na equação",
      [
        { value: "other", label: "Branco / outro / não negro" },
        { value: "black", label: "Negro" },
      ],
      "other",
      "A equação original é norte-americana e usa grupos branco e negro; para outros grupos, costuma-se usar 'branco/outro' com cautela."
    ),
    numberField("totalCholesterol", "Colesterol total", "mg/dL", 130, 320, 1),
    numberField("hdl", "HDL-colesterol", "mg/dL", 20, 100, 1),
    numberField("sbp", "Pressão arterial sistólica", "mmHg", 90, 200, 1),
    checkbox("treatedSbp", "Em tratamento para hipertensão"),
    checkbox("diabetes", "Diabetes mellitus"),
    checkbox("smoker", "Tabagista atual"),
    checkbox("knownAscvdOrLdl190", "ASCVD clínica conhecida ou LDL ≥ 190 mg/dL", "Se sim, a calculadora não deve guiar sozinha decisão de prevenção primária."),
  ],
  reference: {
    label: "ACC/AHA 2013 - Pooled Cohort Equations",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4700825/",
  },
  calculate(values) {
    const age = num(values, "age");
    const totalCholesterol = num(values, "totalCholesterol");
    const hdl = num(values, "hdl");
    const sbp = num(values, "sbp");
    if ([age, totalCholesterol, hdl, sbp].some((value) => value === null)) return null;

    if (yes(values, "knownAscvdOrLdl190")) {
      return result(
        "—",
        "fora do escopo",
        "Não aplicar como decisão isolada",
        "ASCVD clínica conhecida ou LDL ≥ 190 mg/dL colocam o paciente fora do uso habitual da calculadora de prevenção primária.",
        "Conduzir conforme diretriz de prevenção secundária ou hipercolesterolemia importante, com avaliação individual de estatina, metas, causas secundárias e risco global.",
        "A Pooled Cohort Equation foi desenhada para estimar risco em prevenção primária. Não substitui diretriz, julgamento clínico nem discussão compartilhada.",
        "Risco ASCVD 10 anos não calculado como decisão isolada: ASCVD clínica conhecida ou LDL ≥ 190 mg/dL. Conduzir conforme prevenção secundária/hipercolesterolemia importante e contexto clínico.",
        ["Fora do escopo de prevenção primária"]
      );
    }

    const risk = calculateAscvdPooledCohortRisk({
      sex: selected(values, "sex"),
      race: selected(values, "race"),
      age: age!,
      totalCholesterol: totalCholesterol!,
      hdl: hdl!,
      sbp: sbp!,
      treatedSbp: yes(values, "treatedSbp"),
      smoker: yes(values, "smoker"),
      diabetes: yes(values, "diabetes"),
    });
    const displayedRisk = Math.max(0, Math.min(100, risk));
    const classification = displayedRisk < 5
      ? "Baixo risco"
      : displayedRisk < 7.5
        ? "Risco limítrofe"
        : displayedRisk < 20
          ? "Risco intermediário"
          : "Alto risco";
    const recommendation = displayedRisk < 5
      ? "Priorizar mudanças de estilo de vida e controle de fatores modificáveis; reavaliar periodicamente conforme contexto."
      : displayedRisk < 7.5
        ? "Discutir intensificação de estilo de vida e considerar modificadores de risco antes de decisão medicamentosa."
        : displayedRisk < 20
          ? "Discutir prevenção farmacológica, intensidade de estatina, risco-benefício e preferências, considerando LDL, comorbidades e modificadores de risco."
          : "Risco alto: avaliar prevenção intensiva, estatina conforme diretriz, controle agressivo de fatores modificáveis e acompanhamento estruturado.";

    const percent = displayedRisk.toFixed(displayedRisk < 10 ? 1 : 0);
    return result(
      percent,
      "% em 10 anos",
      classification,
      `Risco estimado de ASCVD em 10 anos de aproximadamente ${percent}%.`,
      recommendation,
      "Equação derivada de coortes norte-americanas, validada principalmente para adultos de 40-79 anos sem ASCVD clínica. Pode superestimar ou subestimar risco em populações brasileiras; não substitui diretrizes locais, LDL, história familiar, DRC, albuminúria, CAC ou outros modificadores.",
      `Risco cardiovascular ASCVD em 10 anos ≈ ${percent}% (${classification}). ${recommendation}`,
      [
        `${age} anos`,
        `CT ${totalCholesterol} mg/dL`,
        `HDL ${hdl} mg/dL`,
        `PAS ${sbp} mmHg${yes(values, "treatedSbp") ? " tratada" : " não tratada"}`,
        yes(values, "diabetes") ? "diabetes" : "sem diabetes",
        yes(values, "smoker") ? "tabagista" : "não tabagista",
      ]
    );
  },
};

const hasBled: ClinicalCalculator = {
  id: "has-bled",
  name: "HAS-BLED",
  shortName: "HAS-BLED",
  category: "Cardiologia",
  description: "Identificação de fatores modificáveis associados a sangramento em fibrilação atrial.",
  fields: [
    numberField("age", "Idade", "anos", 18, 120),
    checkbox("hypertension", "Hipertensão não controlada (PAS > 160 mmHg)"),
    checkbox(
      "renal",
      "Função renal anormal",
      "Diálise, transplante renal ou creatinina ≥ 2,26 mg/dL (200 µmol/L)."
    ),
    checkbox(
      "liver",
      "Função hepática anormal",
      "Cirrose ou alteração bioquímica relevante conforme definição do escore."
    ),
    checkbox("stroke", "AVC prévio"),
    checkbox("bleeding", "Sangramento maior prévio ou predisposição"),
    checkbox("labileInr", "INR lábil / tempo terapêutico baixo", "Inclui TTR < 60%."),
    checkbox("drugs", "Fármacos que aumentam sangramento", "Antiagregantes ou AINEs."),
    checkbox("alcohol", "Uso relevante de álcool", "Referência usual: ≥ 8 doses por semana."),
  ],
  reference: {
    label: "ACC/AHA/ACCP/HRS 2023 - fibrilação atrial",
    url: "https://www.acc.org/guidelines/hubs/atrial-fibrillation",
  },
  calculate(values) {
    const age = num(values, "age");
    if (age === null) return null;
    const criteria = [
      [yes(values, "hypertension"), "hipertensão não controlada"],
      [yes(values, "renal"), "função renal anormal"],
      [yes(values, "liver"), "função hepática anormal"],
      [yes(values, "stroke"), "AVC prévio"],
      [yes(values, "bleeding"), "sangramento/predisposição"],
      [yes(values, "labileInr"), "INR lábil"],
      [age > 65, "idade > 65 anos"],
      [yes(values, "drugs"), "fármacos predisponentes"],
      [yes(values, "alcohol"), "álcool"],
    ] as const;
    const score = criteria.filter(([active]) => active).length;
    const high = score >= 3;
    return result(
      String(score),
      "pontos",
      high ? "Maior risco de sangramento" : "Sem alto risco pelo escore",
      high
        ? "HAS-BLED ≥ 3 sinaliza necessidade de revisão mais próxima e correção de fatores modificáveis."
        : "Pontuação abaixo de 3 não elimina risco de sangramento.",
      "Rever pressão arterial, interações, AINEs/antiagregantes, álcool, função renal/hepática e qualidade do controle do INR quando aplicável.",
      "Não usar isoladamente para negar anticoagulação. O objetivo principal é identificar riscos modificáveis e planejar seguimento.",
      `HAS-BLED = ${score} pontos. ${high ? "Maior risco de sangramento" : "Sem alto risco pelo escore"}. Rever fatores modificáveis, interações, função renal/hepática e necessidade de acompanhamento mais próximo.`,
      criteria.filter(([active]) => active).map(([, label]) => `+1 ${label}`)
    );
  },
};

const glasgow: ClinicalCalculator = {
  id: "glasgow",
  name: "Escala de Coma de Glasgow",
  shortName: "Glasgow",
  category: "Neurologia e trauma",
  description: "Registro padronizado das melhores respostas ocular, verbal e motora.",
  fields: [
    selectField("eyes", "Resposta ocular", [
      { value: "4", label: "4 - Espontânea" },
      { value: "3", label: "3 - Ao som" },
      { value: "2", label: "2 - À pressão/dor" },
      { value: "1", label: "1 - Ausente" },
    ]),
    selectField("verbal", "Resposta verbal", [
      { value: "5", label: "5 - Orientada" },
      { value: "4", label: "4 - Confusa" },
      { value: "3", label: "3 - Palavras inadequadas" },
      { value: "2", label: "2 - Sons incompreensíveis" },
      { value: "1", label: "1 - Ausente" },
    ]),
    selectField("motor", "Resposta motora", [
      { value: "6", label: "6 - Obedece comandos" },
      { value: "5", label: "5 - Localiza estímulo" },
      { value: "4", label: "4 - Flexão normal" },
      { value: "3", label: "3 - Flexão anormal" },
      { value: "2", label: "2 - Extensão" },
      { value: "1", label: "1 - Ausente" },
    ]),
  ],
  reference: {
    label: "Glasgow Coma Scale - avaliação oficial",
    url: "https://www.glasgowcomascale.org/what-is-gcs/",
  },
  calculate(values) {
    const eyes = Number(selected(values, "eyes"));
    const verbal = Number(selected(values, "verbal"));
    const motor = Number(selected(values, "motor"));
    const score = eyes + verbal + motor;
    const classification = score <= 8 ? "Grave" : score <= 12 ? "Moderada" : "Leve";
    const recommendation = score <= 8
      ? "Priorizar via aérea, ventilação, causas reversíveis e avaliação neurológica/trauma urgente conforme contexto."
      : score <= 12
        ? "Monitorização seriada e investigação dirigida; considerar escalonamento diante de queda do escore ou sinais focais."
        : "Manter observação e avaliações seriadas conforme mecanismo, sintomas e fatores de risco.";
    return result(
      String(score),
      `E${eyes} V${verbal} M${motor}`,
      `Alteração ${classification.toLowerCase()} pela classificação usual em trauma`,
      `Glasgow ${score}/15, composto por E${eyes}, V${verbal} e M${motor}.`,
      recommendation,
      "Registre os três componentes, não apenas o total. Intubação, sedação, barreiras linguísticas e déficits prévios podem impedir avaliação válida.",
      `Escala de Coma de Glasgow = ${score}/15 (E${eyes} V${verbal} M${motor}). Alteração ${classification.toLowerCase()} pela classificação usual em trauma. ${recommendation}`,
      [`Ocular E${eyes}`, `Verbal V${verbal}`, `Motora M${motor}`]
    );
  },
};

const cockcroftGault: ClinicalCalculator = {
  id: "cockcroft-gault",
  name: "Cockcroft-Gault",
  shortName: "Cockcroft-Gault",
  category: "Nefrologia e dose",
  description: "Estimativa de clearance de creatinina para apoio ao ajuste de medicamentos.",
  fields: [
    numberField("age", "Idade", "anos", 18, 120),
    numberField("weight", "Peso utilizado na fórmula", "kg", 20, 300, 0.1),
    numberField("creatinine", "Creatinina sérica", "mg/dL", 0.1, 20, 0.01),
    selectField("sex", "Sexo", [
      { value: "male", label: "Masculino" },
      { value: "female", label: "Feminino" },
    ]),
  ],
  reference: {
    label: "Cockcroft e Gault, Nephron 1976",
    url: "https://pubmed.ncbi.nlm.nih.gov/1244564/",
  },
  calculate(values) {
    const age = num(values, "age");
    const weight = num(values, "weight");
    const creatinine = num(values, "creatinine");
    if ([age, weight, creatinine].some((value) => value === null) || creatinine! <= 0) return null;
    const female = selected(values, "sex") === "female";
    const clearance = ((140 - age!) * weight!) / (72 * creatinine!) * (female ? 0.85 : 1);
    const rounded = Math.max(0, clearance);
    const classification = rounded >= 90
      ? "Clearance estimado preservado"
      : rounded >= 60
        ? "Redução leve do clearance estimado"
        : rounded >= 30
          ? "Redução moderada do clearance estimado"
          : rounded >= 15
            ? "Redução importante do clearance estimado"
            : "Redução grave do clearance estimado";
    return result(
      rounded.toFixed(1),
      "mL/min",
      classification,
      `Clearance de creatinina estimado em ${rounded.toFixed(1)} mL/min pela fórmula de Cockcroft-Gault.`,
      "Conferir a faixa de ajuste na bula/protocolo específico do medicamento e reavaliar função renal seriada quando necessário.",
      "Não usar em creatinina instável/lesão renal aguda. A escolha entre peso real, ideal ou ajustado deve considerar composição corporal e protocolo de dose.",
      `Clearance de creatinina estimado por Cockcroft-Gault = ${rounded.toFixed(1)} mL/min. ${classification}. Conferir ajuste na bula ou protocolo específico e considerar limitações do peso utilizado e da estabilidade da creatinina.`
    );
  },
};

const anionGap: ClinicalCalculator = {
  id: "anion-gap",
  name: "Ânion gap",
  shortName: "Ânion gap",
  category: "Distúrbios ácido-base",
  description: "Calcula Na - (Cl + HCO₃) e corrige opcionalmente para albumina.",
  fields: [
    numberField("sodium", "Sódio", "mEq/L", 80, 200, 0.1),
    numberField("chloride", "Cloro", "mEq/L", 50, 180, 0.1),
    numberField("bicarbonate", "Bicarbonato / CO₂ total", "mEq/L", 1, 60, 0.1),
    numberField("albumin", "Albumina (opcional)", "g/dL", 0.5, 6, 0.1, "Se preenchida, aplica AG corrigido = AG + 2,5 × (4 - albumina).", false),
  ],
  reference: {
    label: "Revisão NCBI - acidose metabólica",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK448090/",
  },
  calculate(values) {
    const sodium = num(values, "sodium");
    const chloride = num(values, "chloride");
    const bicarbonate = num(values, "bicarbonate");
    if ([sodium, chloride, bicarbonate].some((value) => value === null)) return null;
    const albumin = num(values, "albumin");
    const measured = sodium! - (chloride! + bicarbonate!);
    const corrected = albumin === null ? null : measured + 2.5 * (4 - albumin);
    const displayed = corrected ?? measured;
    const classification = displayed > 12
      ? "Ânion gap elevado pela referência usual"
      : displayed < 8
        ? "Ânion gap baixo pela referência usual"
        : "Dentro da referência usual de 8-12 mEq/L";
    const recommendation = displayed > 12
      ? "Correlacionar com pH, lactato, cetonas, função renal, tóxicos e delta gap conforme contexto clínico."
      : "Interpretar em conjunto com gasometria, cloro, albumina e faixa de referência do laboratório.";
    return result(
      displayed.toFixed(1),
      "mEq/L",
      classification,
      corrected === null
        ? `Ânion gap medido = ${measured.toFixed(1)} mEq/L, sem correção por albumina.`
        : `Ânion gap medido = ${measured.toFixed(1)} mEq/L; corrigido para albumina = ${corrected.toFixed(1)} mEq/L.`,
      recommendation,
      "A referência varia por laboratório e método. Ânion gap normal não exclui hiperlactatemia; a correção por albumina tem limitações e não substitui medida de lactato.",
      `Ânion gap = ${measured.toFixed(1)} mEq/L${corrected === null ? "" : `; corrigido para albumina = ${corrected.toFixed(1)} mEq/L`}. ${classification}. ${recommendation}`,
      corrected === null ? undefined : [`AG medido: ${measured.toFixed(1)} mEq/L`, `Albumina: ${albumin!.toFixed(1)} g/dL`]
    );
  },
};

const centor: ClinicalCalculator = {
  id: "centor-mcisaac",
  name: "Centor modificado / McIsaac",
  shortName: "Centor/McIsaac",
  category: "Infectologia e otorrino",
  description: "Probabilidade clínica de faringite estreptocócica e apoio à decisão de testagem e antibioticoterapia.",
  fields: [
    numberField("age", "Idade", "anos", 3, 120),
    checkbox("exudate", "Exsudato ou edema tonsilar"),
    checkbox("nodes", "Linfonodos cervicais anteriores dolorosos"),
    checkbox("fever", "Temperatura > 38 °C"),
    checkbox("noCough", "Ausência de tosse"),
  ],
  reference: {
    label: "CDC - faringite por estreptococo do grupo A",
    url: "https://www.cdc.gov/group-a-strep/hcp/clinical-guidance/strep-throat.html",
  },
  calculate(values) {
    const age = num(values, "age");
    if (age === null) return null;
    const criteria = [
      [yes(values, "exudate"), "exsudato/edema tonsilar"],
      [yes(values, "nodes"), "linfonodos cervicais dolorosos"],
      [yes(values, "fever"), "febre > 38 °C"],
      [yes(values, "noCough"), "ausência de tosse"],
    ] as const;
    let score = criteria.filter(([active]) => active).length;
    const breakdown = criteria.filter(([active]) => active).map(([, label]) => `+1 ${label}`);
    if (age <= 14) {
      score += 1;
      breakdown.push("+1 idade 3-14 anos");
    } else if (age >= 45) {
      score -= 1;
      breakdown.push("-1 idade ≥ 45 anos");
    }
    const classification = score <= 1
      ? "Baixo risco (7,6-13,1%)"
      : score <= 3
        ? "Risco intermediário (20,8-33,6%)"
        : "Alto risco (50,7-69,3%)";
    const recommendation = score <= 1
      ? "Antibiótico não indicado pelo escore. Em geral, não testar; oferecer cuidado sintomático e orientações, salvo fatores de alto risco ou suspeita de complicação."
      : score <= 3
        ? "Realizar teste rápido para estreptococo e/ou cultura conforme idade e protocolo. Prescrever antibiótico somente se houver confirmação de estreptococo do grupo A."
        : "Testar prontamente para estreptococo do grupo A. Prescrever antibiótico se o teste rápido ou a cultura forem positivos; o escore alto, isoladamente, não confirma etiologia bacteriana.";
    return result(
      String(score),
      "pontos",
      classification,
      `Centor/McIsaac = ${score}, compatível com ${classification.toLowerCase()} de teste positivo para estreptococo do grupo A.`,
      recommendation,
      "Não aplicar a menores de 3 anos. Sintomas virais claros reduzem a utilidade da testagem. O escore seleciona quem testar, mas não confirma etiologia nem indica antibiótico empírico; em crianças e adolescentes, teste rápido negativo costuma exigir cultura de confirmação conforme protocolo.",
      `Centor/McIsaac = ${score} pontos. ${classification} para teste positivo de estreptococo do grupo A. ${recommendation}`,
      breakdown
    );
  },
};

const bmi: ClinicalCalculator = {
  id: "bmi",
  name: "Índice de Massa Corporal",
  shortName: "IMC",
  category: "Antropometria",
  description: "Relação entre peso e altura para classificação antropométrica em adultos.",
  fields: [
    numberField("weight", "Peso", "kg", 10, 400, 0.1),
    numberField("height", "Altura", "cm", 80, 250, 0.1),
  ],
  reference: {
    label: "Organização Mundial da Saúde - IMC em adultos",
    url: "https://www.who.int/data/gho/data/themes/topics/indicator-groups/indicator-group-details/GHO/bmi-among-adults",
  },
  calculate(values) {
    const weight = num(values, "weight");
    const heightCm = num(values, "height");
    if ([weight, heightCm].some((value) => value === null) || heightCm! <= 0) return null;
    const bmiValue = weight! / Math.pow(heightCm! / 100, 2);
    const classification = bmiValue < 18.5
      ? "Baixo peso"
      : bmiValue < 25
        ? "Faixa de peso adequada"
        : bmiValue < 30
          ? "Sobrepeso"
          : bmiValue < 35
            ? "Obesidade grau I"
            : bmiValue < 40
              ? "Obesidade grau II"
              : "Obesidade grau III";
    return result(
      bmiValue.toFixed(1),
      "kg/m²",
      classification,
      `IMC calculado em ${bmiValue.toFixed(1)} kg/m².`,
      "Correlacionar com circunferência abdominal, composição corporal, comorbidades e objetivos do paciente.",
      "Classificação destinada a adultos e limitada em gestação, edema, amputações, extremos de massa muscular e população pediátrica.",
      `IMC = ${bmiValue.toFixed(1)} kg/m², classificado como ${classification.toLowerCase()}. Interpretar em conjunto com composição corporal, circunferência abdominal e contexto clínico.`
    );
  },
};

export const clinicalCalculators: ClinicalCalculator[] = [
  curb65,
  qsofa,
  news2,
  wellsPe,
  wellsDvt,
  cha2ds2Vasc,
  ascvdRisk,
  hasBled,
  glasgow,
  cockcroftGault,
  anionGap,
  centor,
  bmi,
];

export function getCalculatorInitialValues(calculator: ClinicalCalculator) {
  return calculator.fields.reduce<CalculatorValues>((acc, field) => {
    acc[field.id] = field.defaultValue ?? "";
    return acc;
  }, {});
}

export function validateCalculatorValues(
  calculator: ClinicalCalculator,
  values: CalculatorValues
) {
  for (const field of calculator.fields) {
    const value = values[field.id];

    if (field.type === "boolean") {
      if (field.required !== false && typeof value !== "boolean") {
        return `Responda “Sim” ou “Não” em: ${field.label}.`;
      }
      continue;
    }

    if (field.type === "select") {
      if (field.required !== false && !String(value ?? "").trim()) {
        return `Selecione uma opção em: ${field.label}.`;
      }
      continue;
    }

    if (value === "" || value === null || value === undefined) {
      if (field.required !== false) return `Preencha o campo: ${field.label}.`;
      continue;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return `Informe um número válido em: ${field.label}.`;
    if (field.min !== undefined && parsed < field.min) {
      return `${field.label} deve ser maior ou igual a ${field.min}${field.unit ? ` ${field.unit}` : ""}.`;
    }
    if (field.max !== undefined && parsed > field.max) {
      return `${field.label} deve ser menor ou igual a ${field.max}${field.unit ? ` ${field.unit}` : ""}.`;
    }
    const customError = field.validate?.(parsed, values);
    if (customError) return customError;
  }

  return null;
}

export function calculateClinicalScore(id: string, values: CalculatorValues) {
  return clinicalCalculators.find((calculator) => calculator.id === id)?.calculate(values) ?? null;
}

