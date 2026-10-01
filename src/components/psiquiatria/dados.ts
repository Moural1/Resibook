// Persistência do módulo de psiquiatria no Supabase (tabela psiq_patients).
// O RLS garante que cada médico só lê e grava os próprios pacientes.

import type { SupabaseClient } from "@supabase/supabase-js";
import { importarPaciente } from "@/lib/psiquiatria/privacidade.ts";
import type { RascunhoConsulta } from "@/lib/psiquiatria/textos.ts";
import type { PacientePsiquiatria } from "@/lib/psiquiatria/tipos.ts";

export const TABELA = "psiq_patients";
const VERSAO_ESQUEMA = 1;

export type Registro = {
  paciente: PacientePsiquiatria;
  rascunho: RascunhoConsulta | null;
};

export class TabelaAusenteError extends Error {
  constructor() {
    super("A tabela do módulo de psiquiatria ainda não foi criada no banco.");
  }
}

function tabelaAusente(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /psiq_patients/.test(error.message ?? "") && /(schema cache|does not exist|não existe)/i.test(error.message ?? "")
  );
}

function paraLinha(registro: Registro) {
  // id e code ficam em colunas próprias; o resto vai no documento.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, code, ...dados } = registro.paciente;
  return {
    code,
    schema_version: VERSAO_ESQUEMA,
    dados: { ...dados, rascunho: registro.rascunho },
  };
}

function deLinha(linha: { id: string; code: string; dados: Record<string, unknown> }): Registro | null {
  const paciente = importarPaciente({ ...linha.dados, id: linha.id, code: linha.code });
  if (!paciente) return null;
  const r = linha.dados?.rascunho as RascunhoConsulta | null | undefined;
  const rascunho: RascunhoConsulta | null =
    r && typeof r === "object"
      ? {
          mes: Number(r.mes) || 0,
          relato: String(r.relato ?? ""),
          combinado: String(r.combinado ?? ""),
          adesao: r.adesao === "boa" || r.adesao === "parcial" || r.adesao === "ruim" ? r.adesao : ("" as const),
          efeitos: Array.isArray(r.efeitos) ? r.efeitos.map(String) : [],
          efeitoOutro: String(r.efeitoOutro ?? ""),
          eem: r.eem && typeof r.eem === "object" ? r.eem : {},
          humor: String(r.humor ?? ""),
          roteiro: r.roteiro && typeof r.roteiro === "object" ? r.roteiro : {},
          texto: String(r.texto ?? ""),
        }
      : null;
  return { paciente, rascunho };
}

export async function listarPacientes(supabase: SupabaseClient): Promise<Registro[]> {
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, code, dados")
    .order("code", { ascending: true });
  if (tabelaAusente(error)) throw new TabelaAusenteError();
  if (error) throw new Error(error.message);
  return (data ?? []).map(deLinha).filter((r): r is Registro => r != null);
}

export async function criarPaciente(supabase: SupabaseClient, registro: Registro): Promise<Registro> {
  const { data, error } = await supabase
    .from(TABELA)
    .insert(paraLinha(registro))
    .select("id, code, dados")
    .single();
  if (tabelaAusente(error)) throw new TabelaAusenteError();
  if (error) {
    if (error.code === "23505") throw new Error(`O código ${registro.paciente.code} já está em uso.`);
    throw new Error(error.message);
  }
  const salvo = deLinha(data);
  if (!salvo) throw new Error("Não foi possível ler o paciente salvo.");
  return salvo;
}

export async function salvarPaciente(supabase: SupabaseClient, registro: Registro) {
  const { error } = await supabase.from(TABELA).update(paraLinha(registro)).eq("id", registro.paciente.id);
  if (tabelaAusente(error)) throw new TabelaAusenteError();
  if (error) throw new Error(error.message);
}

export async function excluirPaciente(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABELA).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Direito de eliminação (LGPD art. 18, VI): apaga todos os pacientes de
 *  psiquiatria do médico logado. O filtro por user_id é explícito e o RLS
 *  garante, de qualquer forma, que só as linhas dele sejam atingidas. */
export async function excluirTodosPacientes(supabase: SupabaseClient) {
  const { data, error: erroSessao } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (erroSessao || !userId) throw new Error("Sessão expirada. Entre novamente.");
  const { error } = await supabase.from(TABELA).delete().eq("user_id", userId);
  if (tabelaAusente(error)) throw new TabelaAusenteError();
  if (error) throw new Error(error.message);
}
