// Privacidade do módulo de psiquiatria (LGPD: dado de saúde é dado sensível).
// O paciente é pseudonimizado: código, faixa etária, sexo e meses de seguimento.
// Estas funções impedem que identificadores diretos entrem por texto livre.

import { detectDirectIdentifier, type DirectIdentifierKind } from "../clinical-privacy.ts";
import {
  CLASSES_MEDICACAO,
  CONDICOES_FAMILIARES,
  EXAMES,
  FAIXAS_ETARIAS,
  PARENTESCOS,
  QUALIDADES_VINCULO,
  RELACOES_FAMILIARES,
  RESPOSTAS_TERAPEUTICAS,
  SECOES_PLANO,
  SEXOS,
  type Exame,
} from "./catalogos.ts";
import { nivelCssrs, normalizarRespostasCssrs } from "./cssrs.ts";
import { ESCALAS, totalEscala } from "./escalas.ts";
import type { PacientePsiquiatria, PlanoSeguranca, TipoEscala } from "./tipos.ts";

export const PADRAO_CODIGO = /^PAC-\d{3,6}$/;

export function codigoValido(code: string) {
  return PADRAO_CODIGO.test(code);
}

/** Próximo código livre: PAC-001, PAC-002... */
export function proximoCodigo(existentes: readonly string[]) {
  const numeros = existentes.map((c) => Number.parseInt(String(c).replace(/\D/g, ""), 10) || 0);
  return `PAC-${String(Math.max(0, ...numeros) + 1).padStart(3, "0")}`;
}

export type ProblemaPrivacidade = DirectIdentifierKind | "data_real" | "possivel_nome";

export const MENSAGENS_PRIVACIDADE: Record<ProblemaPrivacidade, string> = {
  cpf: "Parece um CPF. Não registre documentos do paciente.",
  cns: "Parece um número de cartão SUS. Não registre documentos do paciente.",
  email: "Parece um e-mail. Não registre contatos do paciente.",
  phone: "Parece um telefone. Telefones vão só na cópia impressa do paciente.",
  labelled_identifier: "Parece um campo de identificação (nome, CPF, endereço...). Use só o código.",
  data_real: "Parece uma data real. Use o mês de seguimento (ex.: mês 3).",
  possivel_nome: "Parece um nome próprio. Use o parentesco ou o vínculo (ex.: mãe, trabalho).",
};

const DATA_REAL = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
  /\b\d{1,2}-\d{1,2}-\d{4}\b/,
  /\b(?:19|20)\d{2}\b/,
  /\b\d{1,2}\s+de\s+(?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/i,
];

// Palavras que costumam vir em maiúscula sem serem nomes de pessoas.
const NAO_NOMES = new Set(
  [
    "caps", "ubs", "upa", "samu", "cvv", "sus", "hospital", "ambulatório", "ambulatorio", "igreja",
    "escola", "trabalho", "faculdade", "clínica", "clinica", "centro", "posto", "psicoterapia",
    "mãe", "mae", "pai", "irmã", "irma", "irmão", "irmao", "filho", "filha", "avó", "avo", "avô",
    "tio", "tia", "esposa", "esposo", "marido", "namorado", "namorada", "amigo", "amiga",
  ].map((p) => p.toLowerCase())
);

function pareceNomeProprio(texto: string) {
  const padrao = /(?:^|[^.!?\n]\s)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{2,})(?:\s+(?:d[aeo]s?)\s+|\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]{2,})/g;
  for (const m of texto.matchAll(padrao)) {
    const inicioFrase = m.index === 0 && !/^\s/.test(m[0]);
    if (inicioFrase) continue;
    if (!NAO_NOMES.has(m[1].toLowerCase()) && !NAO_NOMES.has(m[2].toLowerCase())) return true;
  }
  return false;
}

/** Problemas de privacidade em um texto livre. Lista vazia = pode salvar. */
export function verificarTextoLivre(texto: string): ProblemaPrivacidade[] {
  const problemas: ProblemaPrivacidade[] = [];
  if (!texto || !texto.trim()) return problemas;
  const direto = detectDirectIdentifier(texto);
  if (direto) problemas.push(direto);
  if (DATA_REAL.some((p) => p.test(texto))) problemas.push("data_real");
  if (pareceNomeProprio(texto)) problemas.push("possivel_nome");
  return problemas;
}

/** Todos os textos livres de um paciente, com o caminho de onde vieram. */
export function textosLivres(p: PacientePsiquiatria): Array<{ campo: string; texto: string }> {
  const t: Array<{ campo: string; texto: string }> = [{ campo: "Hipótese diagnóstica", texto: p.hip }];
  for (const c of p.consultas) {
    t.push({ campo: `Consulta do mês ${c.mes}`, texto: [c.resumo, c.combinado, c.texto ?? ""].join("\n") });
  }
  for (const m of p.meds) t.push({ campo: `Medicação ${m.nome}`, texto: `${m.nome} ${m.dose} ${m.motivo}` });
  for (const c of p.cssrs) t.push({ campo: `C-SSRS do mês ${c.mes}`, texto: c.obs });
  for (const e of p.eventos) t.push({ campo: `Evento do mês ${e.mes}`, texto: e.desc });
  for (const v of p.eco) t.push({ campo: "Ecomapa", texto: v.nome });
  if (p.plano) {
    for (const s of SECOES_PLANO) for (const item of p.plano[s.chave]) t.push({ campo: `Plano: ${s.titulo}`, texto: item });
    t.push({ campo: "Plano: motivo para viver", texto: p.plano.motivo });
  }
  for (const q of ["pre", "prec", "perp", "prot"] as const) for (const x of p.form[q]) t.push({ campo: "Formulação", texto: x });
  t.push({ campo: "Formulação: síntese", texto: p.form.sintese });
  return t.filter((x) => x.texto && x.texto.trim());
}

/* ---------- importação de backups do protótipo ---------- */

const EXAMES_ANTIGOS: Record<string, Exame> = {
  "Peso / IMC": "Peso",
  "Glicemia / HbA1c": "Glicemia de jejum",
};

const inteiro = (v: unknown, padrao = 0) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : padrao);
const texto = (v: unknown, max = 2000) => String(v ?? "").slice(0, max);
const lista = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const chaveDe = <T extends string>(v: unknown, opcoes: Record<T, unknown>, padrao: T): T =>
  typeof v === "string" && v in opcoes ? (v as T) : padrao;
const id = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 64) : Math.random().toString(36).slice(2, 10));

/**
 * Converte um paciente vindo de backup (protótipo ou export) para o modelo
 * atual, descartando qualquer campo desconhecido. Devolve null se o código
 * não seguir o padrão pseudonimizado.
 */
export function importarPaciente(bruto: unknown): PacientePsiquiatria | null {
  if (!bruto || typeof bruto !== "object") return null;
  const b = bruto as Record<string, unknown>;
  const code = texto(b.code, 12).toUpperCase();
  if (!codigoValido(code)) return null;
  const faixa = (FAIXAS_ETARIAS as readonly string[]).includes(String(b.faixa))
    ? (b.faixa as PacientePsiquiatria["faixa"])
    : "25–34";
  const planoBruto = b.plano as Record<string, unknown> | null | undefined;
  const plano: PlanoSeguranca | null = planoBruto
    ? (Object.fromEntries([
        ["mes", inteiro(planoBruto.mes)],
        ["motivo", texto(planoBruto.motivo, 100)],
        ...SECOES_PLANO.map((s) => [s.chave, lista<unknown>(planoBruto[s.chave]).map((x) => texto(x, 80))]),
      ]) as PlanoSeguranca)
    : null;
  const formBruto = (b.form ?? {}) as Record<string, unknown>;

  return {
    id: id(b.id),
    code,
    faixa,
    sexo: chaveDe(b.sexo, SEXOS, "U"),
    hip: texto(b.hip, 140),
    atual: Math.max(0, inteiro(b.atual)),
    consultas: lista<Record<string, unknown>>(b.consultas).map((c) => ({
      id: id(c.id),
      mes: inteiro(c.mes),
      resumo: texto(c.resumo, 1200),
      combinado: texto(c.combinado, 500),
      adesao: c.adesao === "boa" || c.adesao === "parcial" || c.adesao === "ruim" ? c.adesao : "",
      efeitos: lista<unknown>(c.efeitos).map((x) => texto(x, 60)),
      ...(c.eem && typeof c.eem === "object" ? { eem: c.eem as Record<string, string[]> } : {}),
      ...(c.humor != null && c.humor !== "" ? { humor: String(c.humor) } : {}),
      ...(Array.isArray(c.roteiro) ? { roteiro: lista<unknown>(c.roteiro).map((x) => texto(x, 300)) } : {}),
      ...(c.texto ? { texto: texto(c.texto, 6000) } : {}),
    })),
    meds: lista<Record<string, unknown>>(b.meds).map((m) => ({
      id: id(m.id),
      nome: texto(m.nome, 40),
      classe: chaveDe(m.classe, CLASSES_MEDICACAO, "outro"),
      dose: texto(m.dose, 30),
      inicio: inteiro(m.inicio),
      fim: m.fim == null || m.fim === "" ? null : inteiro(m.fim),
      resposta: chaveDe(m.resposta, RESPOSTAS_TERAPEUTICAS, "aguardando"),
      motivo: texto(m.motivo, 80),
    })),
    escalas: lista<Record<string, unknown>>(b.escalas)
      .filter((e) => typeof e.tipo === "string" && e.tipo in ESCALAS)
      .map((e) => {
        const tipo = e.tipo as TipoEscala;
        const itens = lista<unknown>(e.itens).map((x) => inteiro(x));
        return { id: id(e.id), tipo, mes: inteiro(e.mes), itens, total: totalEscala(tipo, itens) };
      }),
    cssrs: lista<Record<string, unknown>>(b.cssrs).map((c) => {
      const r0 = (c.r ?? {}) as Record<string, unknown>;
      const r = normalizarRespostasCssrs({
        q1: !!r0.q1, q2: !!r0.q2, q3: !!r0.q3, q4: !!r0.q4, q5: !!r0.q5, q6: !!r0.q6, q6r: !!r0.q6r,
      });
      return { id: id(c.id), mes: inteiro(c.mes), r, nivel: nivelCssrs(r), obs: texto(c.obs, 120) };
    }),
    plano,
    eventos: lista<Record<string, unknown>>(b.eventos).map((e) => ({ id: id(e.id), mes: inteiro(e.mes), desc: texto(e.desc, 60) })),
    humor: lista<Record<string, unknown>>(b.humor).map((x) => ({
      id: id(x.id),
      ini: inteiro(x.ini),
      fim: inteiro(x.fim),
      v: Math.max(-3, Math.min(3, inteiro(x.v))),
    })),
    geno: lista<Record<string, unknown>>(b.geno)
      .filter((g) => typeof g.rel === "string" && g.rel in PARENTESCOS)
      .map((g) => ({
        id: id(g.id),
        rel: g.rel as keyof typeof PARENTESCOS,
        morto: !!g.morto,
        conds: lista<string>(g.conds).filter((c): c is keyof typeof CONDICOES_FAMILIARES => c in CONDICOES_FAMILIARES),
        rela: chaveDe(g.rela, RELACOES_FAMILIARES, "neutra"),
      })),
    eco: lista<Record<string, unknown>>(b.eco).map((e) => ({
      id: id(e.id),
      nome: texto(e.nome, 30),
      v: chaveDe(e.v, QUALIDADES_VINCULO, "moderado"),
    })),
    exames: lista<Record<string, unknown>>(b.exames)
      .map((e) => {
        const nomeBruto = texto(e.nome, 40);
        const nome = EXAMES_ANTIGOS[nomeBruto] ?? ((EXAMES as readonly string[]).includes(nomeBruto) ? (nomeBruto as Exame) : null);
        const valor = e.valor == null || e.valor === "" || Number.isNaN(Number(e.valor)) ? null : Number(e.valor);
        return nome ? { id: id(e.id), nome, mes: inteiro(e.mes), valor } : null;
      })
      .filter((e): e is NonNullable<typeof e> => e != null),
    form: {
      pre: lista<unknown>(formBruto.pre).map((x) => texto(x, 120)),
      prec: lista<unknown>(formBruto.prec).map((x) => texto(x, 120)),
      perp: lista<unknown>(formBruto.perp).map((x) => texto(x, 120)),
      prot: lista<unknown>(formBruto.prot).map((x) => texto(x, 120)),
      sintese: texto(formBruto.sintese, 1000),
      off: lista<unknown>(formBruto.off).map((x) => texto(x, 80)),
    },
  };
}
