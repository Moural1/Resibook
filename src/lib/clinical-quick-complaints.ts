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
    href: "/condutas?busca=dor%20toracica",
    group: "Urgência",
    terms: ["dor toracica", "dor no peito", "SCA", "IAM", "infarto", "angina", "supra", "troponina", "dor precordial"],
  },
  {
    title: "Dispneia",
    description: "Asma, DPOC, IC, TEP, pneumonia e anafilaxia.",
    href: "/condutas?busca=dispneia",
    group: "Urgência",
    terms: ["dispneia", "falta de ar", "asma", "DPOC", "TEP", "insuficiencia cardiaca", "pneumonia", "sibilancia"],
  },
  {
    title: "Dor abdominal",
    description: "Abdome agudo, pancreatite, colecistite e apendicite.",
    href: "/condutas?busca=dor%20abdominal",
    group: "PA",
    terms: ["dor abdominal", "abdome agudo", "apendicite", "colecistite", "pancreatite", "diverticulite", "obstrucao intestinal"],
  },
  {
    title: "Cefaleia",
    description: "Sinais de alarme, migrânea, HSA, AVC e hipertensão.",
    href: "/condutas?busca=cefaleia",
    group: "PA",
    terms: ["cefaleia", "dor de cabeca", "migranea", "enxaqueca", "HSA", "AVC", "hipertensao", "sinais de alarme"],
  },
  {
    title: "Febre",
    description: "Foco infeccioso, sepse, dengue, IVAS e ITU.",
    href: "/condutas?busca=febre",
    group: "PA",
    terms: ["febre", "sepse", "infeccao", "dengue", "IVAS", "ITU", "pneumonia", "meningite"],
  },
  {
    title: "Vômitos/diarreia",
    description: "Gastroenterite, desidratação, dengue e causas cirúrgicas.",
    href: "/condutas?busca=vomitos%20diarreia",
    group: "PA",
    terms: ["vomitos", "diarreia", "gastroenterite", "desidratacao", "nausea", "dor abdominal", "dengue"],
  },
  {
    title: "Vertigem",
    description: "Diferenciar periférica de central e reconhecer AVC.",
    href: "/condutas?busca=vertigem",
    group: "Urgência",
    terms: ["vertigem", "tontura", "labirintite", "neurite vestibular", "AVC", "HINTS", "ataxia"],
  },
  {
    title: "Síncope",
    description: "Risco cardiogênico, ECG, ortostase e sinais de gravidade.",
    href: "/condutas?busca=sincope",
    group: "Urgência",
    terms: ["sincope", "desmaio", "lipotimia", "arritmia", "ECG", "ortostatica", "cardiogenica"],
  },
  {
    title: "Crise convulsiva",
    description: "Primeira crise, estado de mal, hipoglicemia e neuroimagem.",
    href: "/condutas?busca=crise%20convulsiva",
    group: "Urgência",
    terms: ["convulsao", "crise convulsiva", "epilepsia", "estado de mal", "diazepam", "fenitoina", "hipoglicemia"],
  },
  {
    title: "Lombalgia",
    description: "Red flags, analgesia, ciatalgia e encaminhamento.",
    href: "/condutas?busca=lombalgia",
    group: "Clínica",
    terms: ["lombalgia", "dor lombar", "ciatalgia", "hernia", "red flags", "sindrome cauda equina"],
  },
  {
    title: "Tosse/IVAS",
    description: "Sintomáticos, pneumonia, asma, influenza e sinais de alarme.",
    href: "/condutas?busca=tosse",
    group: "Clínica",
    terms: ["tosse", "IVAS", "resfriado", "influenza", "pneumonia", "asma", "bronquite"],
  },
  {
    title: "Hipertensão no PA",
    description: "Urgência, emergência hipertensiva e lesão de órgão-alvo.",
    href: "/condutas?busca=hipertensao",
    group: "Urgência",
    terms: ["hipertensao", "PA alta", "emergencia hipertensiva", "urgencia hipertensiva", "encefalopatia", "lesao orgao alvo"],
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

export function getClinicalSearchTerms(query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return [];

  const expanded = new Set<string>([query, normalizedQuery]);

  for (const complaint of QUICK_COMPLAINTS) {
    const normalizedTerms = complaint.terms.map(normalize);
    const matched = normalizedTerms.some((term) => {
      return (
        term.includes(normalizedQuery) ||
        normalizedQuery.includes(term) ||
        normalizedQuery.split(" ").some((token) => token.length > 2 && term.includes(token))
      );
    });

    if (matched) {
      expanded.add(complaint.title);
      for (const term of complaint.terms) expanded.add(term);
    }
  }

  return Array.from(expanded).filter(Boolean);
}
