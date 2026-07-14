export type AclsNavigationItem = {
  slug: string;
  label: string;
  group: string;
  available: boolean;
};

export const ACLS_NAVIGATION: AclsNavigationItem[] = [
  { slug: "", label: "Visão geral", group: "Início", available: true },
  { slug: "cadeia-de-sobrevivencia", label: "Cadeia de Sobrevivência", group: "Fundamentos", available: true },
  { slug: "rcp-de-alta-qualidade", label: "RCP de Alta Qualidade", group: "Fundamentos", available: true },
  { slug: "avaliacao-inicial-sbv", label: "Avaliação Inicial (SBV)", group: "Fundamentos", available: true },
  { slug: "avaliacao-primaria-abcde", label: "Avaliação Primária (ABCDE)", group: "Fundamentos", available: true },
  { slug: "avaliacao-secundaria-sample", label: "Avaliação Secundária (SAMPLE)", group: "Fundamentos", available: true },
  { slug: "5hs-e-5ts", label: "5Hs e 5Ts", group: "Fundamentos", available: true },
  { slug: "pcr-ritmo-chocavel", label: "PCR Ritmo Chocável", group: "PCR e arritmias", available: true },
  { slug: "pcr-ritmo-nao-chocavel", label: "PCR Ritmo Não Chocável", group: "PCR e arritmias", available: true },
  { slug: "bradicardia", label: "Bradicardia", group: "PCR e arritmias", available: true },
  { slug: "taquicardia", label: "Taquicardia", group: "PCR e arritmias", available: true },
  { slug: "drogas-acls", label: "Drogas ACLS", group: "PCR e arritmias", available: true },
  { slug: "ritmos-cardiacos", label: "Ritmos Cardíacos", group: "PCR e arritmias", available: true },
  { slug: "cardioversao-vs-desfibrilacao", label: "Cardioversão x Desfibrilação", group: "PCR e arritmias", available: true },
  { slug: "pos-pcr", label: "Cuidados Pós-PCR", group: "Pós-PCR", available: true },
  { slug: "iam", label: "SCA / IAM", group: "SCA e IAM", available: true },
  { slug: "iam-com-supra", label: "IAM com Supra", group: "SCA e IAM", available: true },
  { slug: "estrategias-reperfusao-iamcsst", label: "Estratégias de Reperfusão", group: "SCA e IAM", available: true },
  { slug: "trombolise-iam-com-supra", label: "Trombólise no IAM", group: "SCA e IAM", available: true },
  { slug: "icp-resgate", label: "ICP de Resgate", group: "SCA e IAM", available: true },
  { slug: "iam-sem-supra", label: "IAM sem Supra", group: "SCA e IAM", available: true },
  { slug: "medicamentos-iam", label: "Medicamentos do IAM", group: "SCA e IAM", available: true },
  { slug: "complicacoes-iam", label: "Complicações do IAM", group: "SCA e IAM", available: true },
  { slug: "avc", label: "Reconhecimento e fluxo inicial", group: "AVC", available: true },
  { slug: "avc-isquemico", label: "AVC Isquêmico", group: "AVC", available: true },
  { slug: "trombolise-avc-isquemico", label: "Trombólise no AVC", group: "AVC", available: true },
  { slug: "trombectomia-avc-isquemico", label: "Trombectomia Mecânica", group: "AVC", available: true },
  { slug: "cuidados-pos-trombolise", label: "Cuidados Pós-Trombólise", group: "AVC", available: true },
  { slug: "medicamentos-avc-isquemico", label: "Medicamentos no AVC", group: "AVC", available: true },
  { slug: "avc-hemorragico", label: "AVC Hemorrágico", group: "AVC", available: true },
  { slug: "fluxograma-final-avc", label: "Fluxograma Final do AVC", group: "AVC", available: true },
  { slug: "via-aerea", label: "Via Aérea", group: "Via aérea", available: true },
];

export function getAclsHref(slug: string) {
  return slug ? `/acls/${slug}` : "/acls";
}
