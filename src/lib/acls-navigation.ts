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
  { slug: "pcr-ritmo-chocavel", label: "PCR Ritmo Chocável", available: true },
  { slug: "pcr-ritmo-nao-chocavel", label: "PCR Ritmo Não Chocável", available: true },
  { slug: "bradicardia", label: "Bradicardia", available: true },
  { slug: "taquicardia", label: "Taquicardia", available: true },
  { slug: "pos-pcr", label: "Pós-PCR", available: false },
  { slug: "drogas-acls", label: "Drogas ACLS", available: true },
  { slug: "ritmos-cardiacos", label: "Ritmos Cardíacos", available: true },
  { slug: "cardioversao-vs-desfibrilacao", label: "Cardioversão x Desfibrilação", available: true },
  { slug: "iam", label: "SCA / IAM", available: true },
  { slug: "iam-com-supra", label: "IAM com Supra", available: true },
  { slug: "estrategias-reperfusao-iamcsst", label: "Estratégias de Reperfusão", available: true },
  { slug: "trombolise-iam-com-supra", label: "Trombólise no IAM", available: true },
  { slug: "icp-resgate", label: "ICP de Resgate", available: true },
  { slug: "iam-sem-supra", label: "IAM sem Supra", available: true },
  { slug: "medicamentos-iam", label: "Medicamentos do IAM", available: true },
  { slug: "complicacoes-iam", label: "Complicações do IAM", available: true },
  { slug: "avc", label: "AVC", available: false },
  { slug: "via-aerea", label: "Via Aérea", available: true },
];

export function getAclsHref(slug: string) {
  return slug ? `/acls/${slug}` : "/acls";
}
