export type AclsNavigationItem = {
  slug: string;
  label: string;
  available: boolean;
};

export const ACLS_NAVIGATION: AclsNavigationItem[] = [
  { slug: "", label: "Introdução", available: false },
  { slug: "cadeia-de-sobrevivencia", label: "Cadeia de Sobrevivência", available: true },
  { slug: "rcp-de-alta-qualidade", label: "RCP de Alta Qualidade", available: true },
  { slug: "avaliacao-inicial-sbv", label: "Avaliação Inicial (SBV)", available: true },
  { slug: "avaliacao-primaria-abcde", label: "Avaliação Primária (ABCDE)", available: true },
  { slug: "avaliacao-secundaria-sample", label: "Avaliação Secundária (SAMPLE)", available: true },
  { slug: "5hs-e-5ts", label: "5Hs e 5Ts", available: true },
  { slug: "pcr-ritmo-chocavel", label: "PCR Ritmo Chocável", available: false },
  { slug: "pcr-ritmo-nao-chocavel", label: "PCR Ritmo Não Chocável", available: false },
  { slug: "bradicardia", label: "Bradicardia", available: false },
  { slug: "taquicardia", label: "Taquicardia", available: false },
  { slug: "pos-pcr", label: "Pós-PCR", available: false },
  { slug: "drogas-acls", label: "Drogas ACLS", available: false },
  { slug: "iam", label: "IAM", available: false },
  { slug: "avc", label: "AVC", available: false },
  { slug: "via-aerea", label: "Via Aérea", available: false },
];

export function getAclsHref(slug: string) {
  return slug ? `/acls/${slug}` : "/acls";
}
