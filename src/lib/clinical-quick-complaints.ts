export type QuickComplaint = {
  title: string;
  description: string;
  href: string;
  group: "PA" | "Urgência" | "Clínica" | "Estudo";
  terms: string[];
};

export const QUICK_COMPLAINTS: QuickComplaint[] = [
  {
    title: "Dor torácica",
    description: "SCA, IAM, TEP, dissecção e causas não cardíacas.",
    href: "/condutas?busca=dor%20tor%C3%A1cica",
    group: "Urgência",
    terms: [
      "dor torácica",
      "dor toracica",
      "dor no peito",
      "dor precordial",
      "SCA",
      "IAM",
      "infarto",
      "angina",
      "supra",
      "troponina",
    ],
  },
  {
    title: "Dispneia",
    description: "Asma, DPOC, IC, TEP, pneumonia e anafilaxia.",
    href: "/condutas?busca=dispneia",
    group: "Urgência",
    terms: [
      "dispneia",
      "falta de ar",
      "asma",
      "DPOC",
      "TEP",
      "insuficiência cardíaca",
      "insuficiencia cardiaca",
      "pneumonia",
      "sibilância",
      "sibilancia",
    ],
  },
  {
    title: "Dor abdominal",
    description: "Abdome agudo, pancreatite, colecistite e apendicite.",
    href: "/condutas?busca=dor%20abdominal",
    group: "PA",
    terms: [
      "dor abdominal",
      "abdome agudo",
      "apendicite",
      "colecistite",
      "pancreatite",
      "diverticulite",
      "obstrução intestinal",
      "obstrucao intestinal",
    ],
  },
  {
    title: "Cefaleia",
    description: "Sinais de alarme, migrânea, HSA, AVC e hipertensão.",
    href: "/condutas?busca=cefaleia",
    group: "PA",
    terms: [
      "cefaleia",
      "dor de cabeça",
      "dor de cabeca",
      "migrânea",
      "migranea",
      "enxaqueca",
      "HSA",
      "AVC",
      "hipertensão",
      "hipertensao",
      "sinais de alarme",
    ],
  },
  {
    title: "Febre",
    description: "Foco infeccioso, sepse, dengue, IVAS e ITU.",
    href: "/condutas?busca=febre",
    group: "PA",
    terms: [
      "febre",
      "sepse",
      "infecção",
      "infeccao",
      "dengue",
      "IVAS",
      "ITU",
      "pneumonia",
      "meningite",
    ],
  },
  {
    title: "Vômitos / diarreia",
    description: "Gastroenterite, desidratação, dengue e causas cirúrgicas.",
    href: "/condutas?busca=v%C3%B4mitos%20diarreia",
    group: "PA",
    terms: [
      "vômitos",
      "vomitos",
      "diarreia",
      "gastroenterite",
      "desidratação",
      "desidratacao",
      "náuseas",
      "nauseas",
      "náusea",
      "nausea",
      "dor abdominal",
      "dengue",
    ],
  },
  {
    title: "Vertigem",
    description: "Diferenciar periférica de central e reconhecer AVC.",
    href: "/condutas?busca=vertigem",
    group: "Urgência",
    terms: [
      "vertigem",
      "tontura",
      "labirintite",
      "neurite vestibular",
      "AVC",
      "HINTS",
      "ataxia",
    ],
  },
  {
    title: "Síncope",
    description: "Risco cardiogênico, ECG, ortostase e sinais de gravidade.",
    href: "/condutas?busca=s%C3%ADncope",
    group: "Urgência",
    terms: [
      "síncope",
      "sincope",
      "desmaio",
      "lipotimia",
      "arritmia",
      "ECG",
      "ortostase",
      "ortostática",
      "ortostatica",
      "cardiogênica",
      "cardiogenica",
    ],
  },
  {
    title: "Crise convulsiva",
    description: "Primeira crise, estado de mal, hipoglicemia e neuroimagem.",
    href: "/condutas?busca=crise%20convulsiva",
    group: "Urgência",
    terms: [
      "crise convulsiva",
      "convulsão",
      "convulsao",
      "epilepsia",
      "rebaixamento",
      "pós-ictal",
      "pos-ictal",
      "estado de mal",
      "diazepam",
      "fenitoína",
      "fenitoina",
      "hipoglicemia",
    ],
  },
  {
    title: "Lombalgia",
    description: "Red flags, analgesia, ciatalgia e encaminhamento.",
    href: "/condutas?busca=lombalgia",
    group: "Clínica",
    terms: [
      "lombalgia",
      "dor lombar",
      "ciatalgia",
      "hérnia",
      "hernia",
      "red flags",
      "síndrome cauda equina",
      "sindrome cauda equina",
    ],
  },
  {
    title: "Tosse",
    description: "Sintomáticos, pneumonia, asma, influenza e sinais de alarme.",
    href: "/condutas?busca=tosse",
    group: "Clínica",
    terms: [
      "tosse",
      "IVAS",
      "resfriado",
      "influenza",
      "pneumonia",
      "asma",
      "bronquite",
    ],
  },
  {
    title: "Icterícia",
    description: "Colestase, hepatites, hemólise e sinais de gravidade.",
    href: "/condutas?busca=icter%C3%ADcia",
    group: "Clínica",
    terms: [
      "icterícia",
      "ictericia",
      "colestase",
      "hepatite",
      "hepatites",
      "bilirrubina",
      "colúria",
      "coluria",
      "acolia",
      "hemólise",
      "hemolise",
    ],
  },
  {
    title: "Agitação / ansiedade",
    description: "Agitação psicomotora, ansiedade, abstinência e delirium.",
    href: "/condutas?busca=agita%C3%A7%C3%A3o%20ansiedade",
    group: "Urgência",
    terms: [
      "agitação",
      "agitacao",
      "ansiedade",
      "agitação psicomotora",
      "agitacao psicomotora",
      "pânico",
      "panico",
      "delirium",
      "abstinência",
      "abstinencia",
      "surto",
    ],
  },
  {
    title: "Hipertensão no PA",
    description: "Urgência, emergência hipertensiva e lesão de órgão-alvo.",
    href: "/condutas?busca=hipertens%C3%A3o",
    group: "Urgência",
    terms: [
      "hipertensão",
      "hipertensao",
      "PA alta",
      "crise hipertensiva",
      "emergência hipertensiva",
      "emergencia hipertensiva",
      "urgência hipertensiva",
      "urgencia hipertensiva",
      "encefalopatia",
      "lesão órgão alvo",
      "lesao orgao alvo",
    ],
  },
  {
    title: "Picada de escorpião",
    description: "Escorpionismo, dor intensa e sinais sistêmicos.",
    href: "/condutas?busca=picada%20de%20escorpi%C3%A3o",
    group: "Urgência",
    terms: [
      "picada de escorpião",
      "picada de escorpiao",
      "escorpionismo",
      "escorpião",
      "escorpiao",
      "acidente escorpiônico",
      "acidente escorpionico",
      "soro antiescorpiônico",
      "soro antiescorpionico",
    ],
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findQuickComplaint(query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const exactTitle = QUICK_COMPLAINTS.find(
    (complaint) => normalize(complaint.title) === normalizedQuery
  );
  if (exactTitle) return exactTitle;

  const exactAliases = QUICK_COMPLAINTS.filter((complaint) =>
    complaint.terms.some((term) => normalize(term) === normalizedQuery)
  );
  if (exactAliases.length === 1) return exactAliases[0];

  if (normalizedQuery.length < 4) return null;

  const titleMatches = QUICK_COMPLAINTS.filter((complaint) => {
    const normalizedTitle = normalize(complaint.title);
    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedTitle)
    );
  });

  return titleMatches.length === 1 ? titleMatches[0] : null;
}

export function getClinicalSearchTerms(query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return [];

  const expanded = new Set<string>([query, normalizedQuery]);

  const complaint = findQuickComplaint(query);
  if (complaint) {
    expanded.add(complaint.title);
    for (const term of complaint.terms) expanded.add(term);
  }

  return Array.from(expanded).filter(Boolean);
}
