import { QUICK_COMPLAINTS, type QuickComplaint } from "@/lib/clinical-quick-complaints";

export type CaseRoute = {
  label: string;
  href: string;
  intent: string;
};

export type CaseRoutingResult = {
  query: string;
  searchTerm: string;
  confidence: "alta" | "moderada" | "livre";
  complaint: QuickComplaint | null;
  title: string;
  summary: string;
  priorities: string[];
  riskPrompts: string[];
  routes: CaseRoute[];
};

type FlowHint = {
  summary: string;
  priorities: string[];
  riskPrompts: string[];
};

const DEFAULT_HINT: FlowHint = {
  summary: "Use este roteiro para transformar uma queixa livre em ações clínicas organizadas, sem fechar diagnóstico automaticamente.",
  priorities: [
    "Repetir sinais vitais e definir prioridade operacional",
    "Pesquisar red flags antes de alta, observação ou transferência",
    "Abrir conduta relacionada e documentar hipótese principal",
    "Planejar reavaliação com critério objetivo",
  ],
  riskPrompts: [
    "Instabilidade hemodinâmica ou respiratória",
    "Rebaixamento, confusão, síncope, convulsão ou déficit focal",
    "Gestação, imunossupressão, extremos de idade ou comorbidade relevante",
    "Dor intensa, progressiva, recorrente ou desproporcional",
  ],
};

const FLOW_HINTS: Record<string, FlowHint> = {
  "Dor torácica": {
    summary: "Priorize SCA, TEP, dissecção, pneumotórax e instabilidade antes de tratar como causa benigna.",
    priorities: [
      "ECG precoce e repetição se dor persistente ou mudança clínica",
      "Monitorização, acesso e sinais vitais seriados se risco moderado/alto",
      "Troponina conforme tempo de início e protocolo local",
      "Definir observação, transferência ou alta só após reavaliação documentada",
    ],
    riskPrompts: [
      "Dor opressiva, irradiada, em repouso ou recorrente",
      "Sudorese, síncope, hipotensão, dispneia ou má perfusão",
      "ECG alterado, troponina em elevação ou déficit neurológico",
    ],
  },
  Dispneia: {
    summary: "Separe hipoxemia, broncoespasmo, congestão, pneumonia, TEP e anafilaxia antes de fechar destino.",
    priorities: [
      "Avaliar fala, esforço respiratório, ausculta e SatO2",
      "Oxigênio se hipoxemia e suporte conforme gravidade",
      "Reavaliar resposta objetiva depois de broncodilatador, diurético, antibiótico ou outra medida",
      "Documentar critério de alta, observação ou internação",
    ],
    riskPrompts: [
      "SatO2 baixa, cianose, exaustão ou silêncio auscultatório",
      "Dor torácica, síncope, hemoptise ou hipotensão",
      "Piora progressiva apesar das medidas iniciais",
    ],
  },
  "Dor abdominal": {
    summary: "O reexame é parte da conduta: não deixe abdome agudo, gestação, sepse ou sangramento passarem batido.",
    priorities: [
      "Localizar dor, evolução temporal e sinais peritoneais",
      "Checar gestação quando aplicável",
      "Definir laboratório/imagem conforme hipótese e gravidade",
      "Reexaminar após analgesia e antes de alta",
    ],
    riskPrompts: [
      "Defesa, rigidez, dor localizada progressiva ou massa pulsátil",
      "Febre persistente, hipotensão, síncope ou sangramento digestivo",
      "Vômitos incoercíveis, gestação, idoso frágil ou imunossupressão",
    ],
  },
  Cefaleia: {
    summary: "A missão é não perder cefaleia secundária: vascular, infecciosa, hipertensiva ou neurológica.",
    priorities: [
      "Pesquisar SNOOP, PA, febre, rigidez de nuca e exame neurológico",
      "Definir necessidade de imagem antes de punção quando indicado",
      "Reavaliar dor, estado mental e sinais focais após tratamento",
      "Orientar retorno para piora súbita, déficit, febre ou convulsão",
    ],
    riskPrompts: [
      "Pior cefaleia da vida, início súbito ou progressão rápida",
      "Déficit focal, confusão, papiledema, convulsão ou alteração visual",
      "Febre, rigidez de nuca, gestação/puerpério, trauma ou imunossupressão",
    ],
  },
  Febre: {
    summary: "Estratifique gravidade por aparência clínica, foco provável, risco de sepse e comorbidades.",
    priorities: [
      "Repetir sinais vitais e avaliar perfusão/estado mental",
      "Procurar foco infeccioso e critérios de sepse",
      "Definir hidratação, antitérmico, coleta ou antibiótico quando indicado",
      "Combinar prazo de retorno ou reavaliação se alta",
    ],
    riskPrompts: [
      "Hipotensão, confusão, taquipneia, má perfusão ou oligúria",
      "Petéquias, rigidez de nuca, dispneia ou dor abdominal importante",
      "Imunossupressão, extremos de idade, gestação ou retorno por piora",
    ],
  },
  "Vômitos / diarreia": {
    summary: "A decisão gira em hidratação, tolerância oral e ausência de abdome grave ou infecção invasiva.",
    priorities: [
      "Classificar hidratação e tolerância oral",
      "Checar dor localizada, sangue, febre alta e sinais vitais",
      "Considerar eletrólitos/função renal se grave, idoso ou persistente",
      "Reavaliar depois de hidratação/antiemético antes de liberar",
    ],
    riskPrompts: [
      "Pouca urina, tontura importante, sonolência ou má perfusão",
      "Sangue nas fezes, febre alta persistente ou dor localizada",
      "Vômitos incoercíveis, gestação, idoso frágil ou comorbidade relevante",
    ],
  },
  "Hipertensão no PA": {
    summary: "Diferencie PA alta isolada de emergência hipertensiva com lesão de órgão-alvo.",
    priorities: [
      "Repetir PA com técnica adequada e tratar dor/ansiedade quando presentes",
      "Pesquisar dor torácica, déficit neurológico, dispneia, confusão e oligúria",
      "Evitar queda brusca se não houver emergência definida",
      "Definir seguimento, retorno e ajuste terapêutico seguro",
    ],
    riskPrompts: [
      "Dor torácica, dispneia, edema agudo ou ECG alterado",
      "Déficit focal, confusão, crise convulsiva ou alteração visual",
      "Oligúria, creatinina alterada ou suspeita de lesão de órgão-alvo",
    ],
  },
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryHref(path: string, query: string, param = "q") {
  const clean = query.trim();
  return clean ? `${path}?${param}=${encodeURIComponent(clean)}` : path;
}

export function findBestComplaint(query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return null;

  let best: { complaint: QuickComplaint; score: number } | null = null;

  for (const complaint of QUICK_COMPLAINTS) {
    const terms = [complaint.title, ...complaint.terms];
    let score = 0;

    for (const term of terms) {
      const normalizedTerm = normalize(term);

      if (!normalizedTerm) continue;
      if (normalizedTerm === normalizedQuery) score += 12;
      else if (normalizedTerm.includes(normalizedQuery) || normalizedQuery.includes(normalizedTerm)) score += 7;
      else {
        const tokens = normalizedQuery.split(" ").filter((token) => token.length > 2);
        score += tokens.filter((token) => normalizedTerm.includes(token)).length * 2;
      }
    }

    if (!best || score > best.score) {
      best = { complaint, score };
    }
  }

  return best && best.score >= 3 ? best.complaint : null;
}

export function buildCaseRouting(query: string): CaseRoutingResult {
  const cleanQuery = query.trim();
  const complaint = findBestComplaint(cleanQuery);
  const searchTerm = complaint?.title || cleanQuery;
  const hint = (complaint && FLOW_HINTS[complaint.title]) || DEFAULT_HINT;
  const confidence = !cleanQuery ? "livre" : complaint ? "alta" : "moderada";

  return {
    query: cleanQuery,
    searchTerm,
    confidence,
    complaint,
    title: complaint ? complaint.title : cleanQuery || "Caso sem queixa definida",
    summary: complaint ? hint.summary : DEFAULT_HINT.summary,
    priorities: hint.priorities,
    riskPrompts: hint.riskPrompts,
    routes: [
      { label: "Caso", intent: "Estruturar primeira abordagem", href: queryHref("/caso-rapido", searchTerm) },
      { label: "Conduta", intent: "Abrir protocolos e condutas", href: queryHref("/condutas", searchTerm, "busca") },
      { label: "Risco", intent: "Checar red flags e bloqueios de alta", href: "/plantao/checklist-risco" },
      { label: "Plano", intent: "Montar prescrição guiada", href: queryHref("/plantao/prescricao-guiada", searchTerm) },
      { label: "Exames", intent: "Gerar evolução e plano de exames", href: queryHref("/exames-evolucao", searchTerm) },
      { label: "Alta", intent: "Criar orientações de retorno", href: queryHref("/plantao/alta-segura", searchTerm) },
      { label: "Passagem", intent: "Organizar SBAR", href: "/plantao/sbar" },
      { label: "CID", intent: "Pesquisar CID relacionado", href: queryHref("/cids", searchTerm) },
    ],
  };
}
