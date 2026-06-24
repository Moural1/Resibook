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
  Vertigem: {
    summary: "Diferencie síndrome vestibular periférica de causa central antes de assumir quadro benigno.",
    priorities: [
      "Definir início, duração, gatilhos, sintomas auditivos e capacidade de marcha",
      "Realizar exame neurológico, oculomotor e HINTS apenas quando tecnicamente aplicável",
      "Checar glicemia, PA, medicações e causas metabólicas conforme contexto",
      "Reavaliar marcha, náusea e sinais neurológicos depois das medidas iniciais",
    ],
    riskPrompts: [
      "Déficit focal, diplopia, disartria, disfagia, cefaleia nova ou dor cervical",
      "Incapacidade de sentar ou caminhar sem apoio, ataxia truncal importante",
      "Nistagmo vertical, multidirecional ou exame incompatível com causa periférica",
    ],
  },
  Síncope: {
    summary: "Procure causa cardíaca, hemorrágica, neurológica ou metabólica antes de classificar como vasovagal.",
    priorities: [
      "Confirmar perda transitória de consciência e reconstruir pródromos, duração e recuperação",
      "Obter ECG, sinais vitais e glicemia; avaliar ortostase quando apropriado",
      "Pesquisar cardiopatia, sangramento, gestação e história familiar de morte súbita",
      "Definir necessidade de monitorização, observação ou seguimento prioritário",
    ],
    riskPrompts: [
      "Síncope durante esforço, em decúbito, sem pródromos ou com palpitação",
      "ECG alterado, cardiopatia estrutural, dor torácica, dispneia ou hipotensão",
      "Anemia/sangramento, trauma relevante, déficit focal ou recuperação incompleta",
    ],
  },
  "Crise convulsiva": {
    summary: "Priorize estabilização, causas reversíveis e reconhecimento precoce de estado de mal.",
    priorities: [
      "Proteger via aérea, cronometrar crise e checar glicemia imediatamente",
      "Tratar crise prolongada conforme protocolo local e reavaliar ventilação",
      "Pesquisar primeira crise, adesão, febre, trauma, tóxicos, gestação e distúrbios metabólicos",
      "Documentar recuperação pós-ictal e necessidade de imagem, observação ou transferência",
    ],
    riskPrompts: [
      "Crise com cinco minutos ou mais, crises repetidas ou ausência de recuperação",
      "Déficit focal persistente, trauma, febre/meningismo ou anticoagulação",
      "Gestação/puerpério, hipoglicemia, intoxicação ou primeira crise sem causa definida",
    ],
  },
  Lombalgia: {
    summary: "Separe lombalgia mecânica de cauda equina, infecção, fratura, neoplasia e causa vascular.",
    priorities: [
      "Pesquisar trauma, febre, câncer, imunossupressão, uso de drogas e déficit neurológico",
      "Avaliar força, sensibilidade, reflexos, marcha e função esfincteriana quando indicado",
      "Usar analgesia multimodal e estimular mobilidade segura conforme tolerância",
      "Evitar imagem de rotina sem red flags; definir retorno e seguimento",
    ],
    riskPrompts: [
      "Retenção/incontinência, anestesia em sela ou déficit motor progressivo",
      "Febre, dor noturna, imunossupressão, câncer ou infecção recente",
      "Trauma relevante, osteoporose, anticoagulação ou dor abdominal/pulsátil associada",
    ],
  },
  Tosse: {
    summary: "Estratifique gravidade respiratória e procure pneumonia, broncoespasmo e causas sistêmicas.",
    priorities: [
      "Checar duração, febre, dispneia, dor torácica, hemoptise e fatores epidemiológicos",
      "Avaliar FR, SatO2, ausculta e sinais de esforço respiratório",
      "Definir necessidade de imagem/testes conforme gravidade e hipótese",
      "Orientar tratamento sintomático, isolamento quando aplicável e sinais de retorno",
    ],
    riskPrompts: [
      "Hipoxemia, taquipneia, esforço respiratório, confusão ou hipotensão",
      "Hemoptise, dor torácica, síncope ou suspeita de TEP/tuberculose",
      "Idoso frágil, imunossupressão, gestação ou piora apesar de tratamento",
    ],
  },
  Icterícia: {
    summary: "Diferencie padrão colestático, hepatocelular e hemolítico, procurando obstrução e falência hepática.",
    priorities: [
      "Definir início, dor, febre, colúria, acolia, prurido, álcool, drogas e exposições",
      "Avaliar estado mental, sangramento, hidratação e sinais de hepatopatia crônica",
      "Solicitar perfil hepático, bilirrubinas, hemograma e imagem conforme hipótese",
      "Definir urgência de avaliação especializada se colangite, obstrução ou disfunção hepática",
    ],
    riskPrompts: [
      "Febre com dor em hipocôndrio direito, hipotensão ou confusão",
      "Encefalopatia, sangramento, hipoglicemia ou coagulopatia",
      "Dor intensa, vômitos persistentes, gestação ou início após fármaco/toxina",
    ],
  },
  "Agitação / ansiedade": {
    summary: "Antes de atribuir a causa psiquiátrica, exclua hipóxia, hipoglicemia, delirium, intoxicação e doença neurológica.",
    priorities: [
      "Garantir segurança da equipe e abordagem verbal com ambiente de baixo estímulo",
      "Checar glicemia, SatO2, temperatura, sinais vitais e estado mental",
      "Pesquisar intoxicação/abstinência, trauma, infecção, dor e risco de auto/heteroagressão",
      "Usar contenção física ou farmacológica apenas quando necessária e com monitorização",
    ],
    riskPrompts: [
      "Delirium, febre, rigidez, trauma, déficit focal, hipoxemia ou hipoglicemia",
      "Ideação suicida, violência, acesso a meios letais ou incapacidade de autocuidado",
      "Intoxicação, abstinência grave, gestação ou sedação com depressão respiratória",
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
  "Picada de escorpião": {
    summary: "Classifique gravidade pelo quadro sistêmico e acione precocemente o protocolo toxicológico local.",
    priorities: [
      "Confirmar horário, local da picada, idade/peso e evolução dos sintomas",
      "Tratar dor, higienizar o local e monitorar sinais vitais",
      "Pesquisar vômitos, sudorese, sialorreia, agitação, alterações cardíacas e respiratórias",
      "Contatar referência toxicológica e avaliar soro conforme gravidade e protocolo local",
    ],
    riskPrompts: [
      "Vômitos repetidos, sudorese intensa, sialorreia ou agitação importante",
      "Taquicardia/bradicardia, hipertensão/hipotensão, arritmia ou dor torácica",
      "Dispneia, edema pulmonar, choque, criança pequena ou progressão rápida",
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
      { label: "Risco", intent: "Checar red flags e bloqueios de alta", href: queryHref("/plantao/checklist-risco", searchTerm) },
      { label: "Plano", intent: "Montar prescrição guiada", href: queryHref("/plantao/prescricao-guiada", searchTerm) },
      { label: "Exames", intent: "Gerar evolução e plano de exames", href: queryHref("/exames-evolucao", searchTerm) },
      { label: "Alta", intent: "Criar orientações de retorno", href: queryHref("/plantao/alta-segura", searchTerm) },
      { label: "Passagem", intent: "Organizar SBAR", href: queryHref("/plantao/sbar", searchTerm) },
      { label: "CID", intent: "Pesquisar CID relacionado", href: queryHref("/cids", searchTerm) },
    ],
  };
}
