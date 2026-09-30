// Modelo de dados do acompanhamento psiquiátrico longitudinal.
//
// Regras de privacidade embutidas no próprio modelo:
// - o paciente é identificado só por um código (PAC-001), nunca por nome;
// - o tempo é contado em "mês de seguimento" (inteiro; negativo = antes do
//   início do acompanhamento), nunca por data real;
// - familiares entram só pelo parentesco, escolhido de uma lista fechada.

import type {
  Adesao,
  ClasseMedicacao,
  CondicaoFamiliar,
  Exame,
  FaixaEtaria,
  Parentesco,
  QualidadeVinculo,
  ReferenciaId,
  RelacaoFamiliar,
  RespostaTerapeutica,
  SecaoPlano,
  Sexo,
} from "./catalogos.ts";

/** Mês de seguimento. 0 = primeira consulta; negativo = antes do seguimento. */
export type Mes = number;

export type TipoEscala = "PHQ-9" | "GAD-7" | "YMRS" | "MDQ";

export type Consulta = {
  id: string;
  mes: Mes;
  resumo: string;
  combinado: string;
  adesao: Adesao | "";
  efeitos: string[];
  eem?: Record<string, string[]>;
  humor?: string;
  roteiro?: string[];
  texto?: string;
};

export type Medicacao = {
  id: string;
  nome: string;
  classe: ClasseMedicacao;
  dose: string;
  inicio: Mes;
  fim: Mes | null;
  resposta: RespostaTerapeutica;
  motivo: string;
};

export type AplicacaoEscala = {
  id: string;
  tipo: TipoEscala;
  mes: Mes;
  itens: number[];
  total: number;
};

export type RespostasCssrs = {
  q1: boolean;
  q2: boolean;
  q3: boolean;
  q4: boolean;
  q5: boolean;
  q6: boolean;
  q6r: boolean;
};

export type NivelRiscoCssrs = "nenhum" | "baixo" | "moderado" | "alto";

export type AplicacaoCssrs = {
  id: string;
  mes: Mes;
  r: RespostasCssrs;
  nivel: NivelRiscoCssrs;
  obs: string;
};

export type PlanoSeguranca = { mes: Mes; motivo: string } & Record<SecaoPlano, string[]>;

export type EventoVida = { id: string; mes: Mes; desc: string };

export type PeriodoHumor = { id: string; ini: Mes; fim: Mes; v: number };

export type Familiar = {
  id: string;
  rel: Parentesco;
  morto: boolean;
  conds: CondicaoFamiliar[];
  rela: RelacaoFamiliar;
};

export type Vinculo = { id: string; nome: string; v: QualidadeVinculo };

export type RegistroExame = { id: string; nome: Exame; mes: Mes; valor: number | null };

export type QuadranteFormulacao = "pre" | "prec" | "perp" | "prot";

export type Formulacao = Record<QuadranteFormulacao, string[]> & {
  sintese: string;
  /** Chaves de itens automáticos que o médico descartou. */
  off: string[];
};

export type PacientePsiquiatria = {
  id: string;
  /** Código pseudonimizado, formato PAC-001. Nunca o nome. */
  code: string;
  faixa: FaixaEtaria;
  sexo: Sexo;
  hip: string;
  /** Mês de seguimento atual. */
  atual: Mes;
  consultas: Consulta[];
  meds: Medicacao[];
  escalas: AplicacaoEscala[];
  cssrs: AplicacaoCssrs[];
  plano: PlanoSeguranca | null;
  eventos: EventoVida[];
  humor: PeriodoHumor[];
  geno: Familiar[];
  eco: Vinculo[];
  exames: RegistroExame[];
  form: Formulacao;
};

/* ---------- alertas ---------- */

export type NivelAlerta = "alto" | "atencao" | "info";

export type Alerta = {
  /** Identificador estável da regra que gerou o alerta. */
  regra: string;
  nivel: NivelAlerta;
  texto: string;
  /**
   * O "por quê" nunca se perde: toda regra explica o racional e cita a
   * referência. `referencia: null` só é aceito para regras de racional
   * clínico geral listadas em REGRAS_SEM_REFERENCIA_ESPECIFICA.
   */
  porque: { explicacao: string; referencia: ReferenciaId | null };
  /** Atalho sugerido na interface (ex.: abrir a avaliação de risco). */
  acao?: "risco";
};

export function novoPaciente(
  dados: Pick<PacientePsiquiatria, "id" | "code" | "faixa" | "sexo" | "hip">
): PacientePsiquiatria {
  return {
    ...dados,
    atual: 0,
    consultas: [],
    meds: [],
    escalas: [],
    cssrs: [],
    plano: null,
    eventos: [],
    humor: [],
    geno: [],
    eco: [],
    exames: [],
    form: { pre: [], prec: [], perp: [], prot: [], sintese: "", off: [] },
  };
}
