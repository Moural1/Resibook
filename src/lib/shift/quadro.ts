import type { ClinicalCaseSession } from "../clinical-case-session.ts";
import { etapasDoCaso, leituraDoCaso, prioridadeFinal, proximaEtapa, sinaisMarcados } from "./caso.ts";
import { ORDEM_PRIORIDADE, PRIORIDADES, type NivelPrioridade } from "./triagem.ts";

/* Quadro do plantão: vários pacientes ao mesmo tempo, cada um com o caso,
   o horário da próxima reavaliação e as pendências. Fica só no aparelho
   (localStorage), identificado por leito ou iniciais, expira 12 h depois
   da última atualização e é apagado no logout ou se outra conta entrar. */

export type Pendencia = { id: string; texto: string; feita: boolean };

export type PacienteQuadro = {
  id: string;
  leito: string;
  caso: ClinicalCaseSession;
  reavaliarEm: string | null;
  pendencias: Pendencia[];
  criadoEm: string;
  atualizadoEm: string;
};

export type Quadro = { dono: string | null; pacientes: PacienteQuadro[] };

export type StatusReavaliacao =
  | { estado: "sem" }
  | { estado: "em-dia" | "proxima"; minutos: number }
  | { estado: "atrasada"; minutos: number };

const CHAVE = "resibook-shift-quadro-v1";
export const QUADRO_EVENT = "resibook:shift-quadro";
export const VALIDADE_MS = 12 * 60 * 60 * 1000;
export const LIMITE_PACIENTES = 30;
const PROXIMA_MIN = 10;

export const OPCOES_REAVALIACAO = [15, 30, 60, 120] as const;

export function quadroVazio(): Quadro {
  return { dono: null, pacientes: [] };
}

function novoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function valido(paciente: unknown): paciente is PacienteQuadro {
  const p = paciente as PacienteQuadro;
  return Boolean(p && typeof p.id === "string" && typeof p.leito === "string" && p.caso && typeof p.caso.complaint === "string" && Array.isArray(p.pendencias));
}

/* Remove pacientes sem atualização há mais de 12 h. */
export function limparExpirados(quadro: Quadro, agora = Date.now()): Quadro {
  const pacientes = quadro.pacientes.filter((p) => {
    const atualizado = Date.parse(p.atualizadoEm);
    return Number.isFinite(atualizado) && agora - atualizado <= VALIDADE_MS;
  });
  return pacientes.length === quadro.pacientes.length ? quadro : { ...quadro, pacientes };
}

export function carregarQuadro(agora = Date.now()): Quadro {
  if (typeof window === "undefined") return quadroVazio();
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return quadroVazio();
    const lido = JSON.parse(bruto) as Partial<Quadro>;
    const quadro: Quadro = {
      dono: typeof lido.dono === "string" ? lido.dono : null,
      pacientes: Array.isArray(lido.pacientes) ? lido.pacientes.filter(valido) : [],
    };
    const limpo = limparExpirados(quadro, agora);
    if (limpo !== quadro) window.localStorage.setItem(CHAVE, JSON.stringify(limpo));
    return limpo;
  } catch {
    return quadroVazio();
  }
}

export function salvarQuadro(quadro: Quadro) {
  if (typeof window === "undefined") return;
  try {
    if (quadro.pacientes.length) window.localStorage.setItem(CHAVE, JSON.stringify(quadro));
    else window.localStorage.removeItem(CHAVE);
    window.dispatchEvent(new CustomEvent(QUADRO_EVENT));
  } catch {
    // Sem armazenamento disponível o quadro some ao recarregar; o resto do app segue.
  }
}

export function apagarQuadro() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHAVE);
    window.dispatchEvent(new CustomEvent(QUADRO_EVENT));
  } catch {
    // Ignorado: nada a apagar.
  }
}

function alterar(quadro: Quadro, id: string, mudar: (p: PacienteQuadro) => PacienteQuadro, agora: number): Quadro {
  const carimbo = new Date(agora).toISOString();
  return {
    ...quadro,
    pacientes: quadro.pacientes.map((p) => (p.id === id ? { ...mudar(p), atualizadoEm: carimbo } : p)),
  };
}

export function adicionarPaciente(quadro: Quadro, dados: { leito: string; caso: ClinicalCaseSession }, agora = Date.now()) {
  const id = novoId();
  const carimbo = new Date(agora).toISOString();
  const leito = dados.leito.trim();
  const paciente: PacienteQuadro = {
    id,
    leito,
    caso: { ...dados.caso, quadroId: id, leito },
    reavaliarEm: null,
    pendencias: [],
    criadoEm: carimbo,
    atualizadoEm: carimbo,
  };
  return { quadro: { ...quadro, pacientes: [...quadro.pacientes, paciente].slice(-LIMITE_PACIENTES) }, id };
}

/* Atualiza o caso a partir da sessão ativa. Uma reavaliação nova registrada
   cumpre o horário agendado, que então é limpo. */
export function atualizarCaso(quadro: Quadro, id: string, caso: ClinicalCaseSession, agora = Date.now()): Quadro {
  const atual = quadro.pacientes.find((p) => p.id === id);
  if (!atual) return quadro;
  const novaReavaliacao = Boolean(caso.reassessment?.recordedAt) && caso.reassessment?.recordedAt !== atual.caso.reassessment?.recordedAt;
  return alterar(
    quadro,
    id,
    (p) => ({
      ...p,
      leito: caso.leito?.trim() || p.leito,
      caso: { ...caso, quadroId: id, leito: caso.leito?.trim() || p.leito },
      reavaliarEm: novaReavaliacao ? null : p.reavaliarEm,
    }),
    agora
  );
}

export function renomearLeito(quadro: Quadro, id: string, leito: string, agora = Date.now()): Quadro {
  return alterar(quadro, id, (p) => ({ ...p, leito: leito.trim(), caso: { ...p.caso, leito: leito.trim() } }), agora);
}

export function removerPaciente(quadro: Quadro, id: string): Quadro {
  return { ...quadro, pacientes: quadro.pacientes.filter((p) => p.id !== id) };
}

export function agendarReavaliacao(quadro: Quadro, id: string, minutos: number | null, agora = Date.now()): Quadro {
  return alterar(quadro, id, (p) => ({ ...p, reavaliarEm: minutos === null ? null : new Date(agora + minutos * 60_000).toISOString() }), agora);
}

export function adicionarPendencia(quadro: Quadro, id: string, texto: string, agora = Date.now()): Quadro {
  const limpo = texto.trim();
  if (!limpo) return quadro;
  return alterar(quadro, id, (p) => ({ ...p, pendencias: [...p.pendencias, { id: novoId(), texto: limpo, feita: false }] }), agora);
}

export function alternarPendencia(quadro: Quadro, id: string, pendenciaId: string, agora = Date.now()): Quadro {
  return alterar(
    quadro,
    id,
    (p) => ({ ...p, pendencias: p.pendencias.map((item) => (item.id === pendenciaId ? { ...item, feita: !item.feita } : item)) }),
    agora
  );
}

export function removerPendencia(quadro: Quadro, id: string, pendenciaId: string, agora = Date.now()): Quadro {
  return alterar(quadro, id, (p) => ({ ...p, pendencias: p.pendencias.filter((item) => item.id !== pendenciaId) }), agora);
}

export function statusReavaliacao(paciente: Pick<PacienteQuadro, "reavaliarEm">, agora = Date.now()): StatusReavaliacao {
  if (!paciente.reavaliarEm) return { estado: "sem" };
  const alvo = Date.parse(paciente.reavaliarEm);
  if (!Number.isFinite(alvo)) return { estado: "sem" };
  const minutos = Math.ceil((alvo - agora) / 60_000);
  if (minutos <= 0) return { estado: "atrasada", minutos: Math.abs(Math.floor((alvo - agora) / 60_000)) };
  return { estado: minutos <= PROXIMA_MIN ? "proxima" : "em-dia", minutos };
}

export function prioridadePaciente(paciente: PacienteQuadro): NivelPrioridade | null {
  return prioridadeFinal(leituraDoCaso(paciente.caso).prioridade, paciente.caso.prioridadeManual);
}

function rank(nivel: NivelPrioridade | null) {
  return nivel ? ORDEM_PRIORIDADE.indexOf(nivel) : ORDEM_PRIORIDADE.length;
}

/* Mais grave primeiro; no mesmo nível, reavaliação vencida e depois a mais próxima. */
export function ordenarPacientes(pacientes: PacienteQuadro[], agora = Date.now()) {
  const chaveTempo = (p: PacienteQuadro) => {
    const status = statusReavaliacao(p, agora);
    if (status.estado === "sem") return Number.POSITIVE_INFINITY;
    return status.estado === "atrasada" ? -status.minutos : status.minutos;
  };
  return [...pacientes].sort(
    (a, b) =>
      rank(prioridadePaciente(a)) - rank(prioridadePaciente(b)) ||
      chaveTempo(a) - chaveTempo(b) ||
      a.leito.localeCompare(b.leito, "pt-BR", { numeric: true })
  );
}

export function resumoQuadro(quadro: Quadro, agora = Date.now()) {
  const porPrioridade: Record<NivelPrioridade, number> = { vermelho: 0, laranja: 0, amarelo: 0, verde: 0 };
  let atrasadas = 0;
  let pendencias = 0;
  for (const p of quadro.pacientes) {
    const nivel = prioridadePaciente(p);
    if (nivel) porPrioridade[nivel] += 1;
    if (statusReavaliacao(p, agora).estado === "atrasada") atrasadas += 1;
    pendencias += p.pendencias.filter((item) => !item.feita).length;
  }
  return { total: quadro.pacientes.length, atrasadas, pendencias, porPrioridade };
}

export function formatarMinutos(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${String(resto).padStart(2, "0")} min` : `${horas} h`;
}

function horario(iso: string) {
  const data = new Date(iso);
  return `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
}

export function descreverReavaliacao(paciente: PacienteQuadro, agora = Date.now()) {
  const status = statusReavaliacao(paciente, agora);
  if (status.estado === "sem" || !paciente.reavaliarEm) return "sem horário de reavaliação";
  if (status.estado === "atrasada") return `reavaliação atrasada há ${formatarMinutos(status.minutos)} (era às ${horario(paciente.reavaliarEm)})`;
  return `reavaliar às ${horario(paciente.reavaliarEm)} (em ${formatarMinutos(status.minutos)})`;
}

function vitaisTexto(caso: ClinicalCaseSession) {
  return Object.entries(caso.vitals)
    .filter(([, valor]) => valor.trim())
    .map(([chave, valor]) => `${chave.toUpperCase()} ${valor.trim()}`)
    .join(", ");
}

/* Passagem SBAR de todos os pacientes, na ordem de prioridade. */
export function textoPassagem(quadro: Quadro, agora = Date.now()) {
  const pacientes = ordenarPacientes(quadro.pacientes, agora);
  const cabecalho = [
    `PASSAGEM DE PLANTÃO - RESIBOOK (${pacientes.length} ${pacientes.length === 1 ? "paciente" : "pacientes"}) - ${horario(new Date(agora).toISOString())}`,
    "Ordem: mais grave primeiro.",
  ];
  const blocos = pacientes.map((p, index) => {
    const caso = p.caso;
    const leitura = leituraDoCaso(caso);
    const nivel = prioridadePaciente(p);
    const sinais = sinaisMarcados(caso).map((s) => s.texto);
    const escores = [
      leitura.news2 ? `NEWS2 ${leitura.news2.pontos}${leitura.news2.completo ? "" : " (parcial)"}` : "",
      leitura.qsofa ? `qSOFA ${leitura.qsofa.pontos}` : "",
      leitura.indiceChoque !== null ? `IC ${leitura.indiceChoque.toFixed(2).replace(".", ",")}` : "",
    ].filter(Boolean);
    const reav = caso.reassessment;
    const proximo = proximaEtapa(etapasDoCaso(caso));
    const abertas = p.pendencias.filter((item) => !item.feita).map((item) => item.texto);
    const vitais = vitaisTexto(caso);
    return [
      `${index + 1}) ${p.leito || "Sem leito"} · ${caso.complaint} · ${nivel ? `${nivel.toUpperCase()} (${PRIORIDADES[nivel].rotulo})` : "prioridade a definir"}`,
      `S: ${[caso.age, caso.sex].filter(Boolean).join(", ") || "idade/sexo não informados"}; ${caso.complaint}.`,
      caso.notes.trim() ? `B: ${caso.notes.trim()}` : "",
      `A: ${[
        vitais ? `SV ${vitais}` : "SV não registrados",
        escores.join(", "),
        leitura.alertas.length ? `alertas: ${leitura.alertas.map((a) => a.titulo).join("; ")}` : "",
        sinais.length ? `sinais de alarme: ${sinais.join("; ")}` : "",
        reav?.recordedAt ? `reavaliado (${[reav.symptomStatus, reav.decision].filter(Boolean).join(", ") || "registrado"})` : "",
      ]
        .filter(Boolean)
        .join(" | ")}`,
      `R: ${[
        descreverReavaliacao(p, agora),
        proximo ? `próximo passo: ${proximo.acao.toLowerCase()}` : "atendimento completo",
        abertas.length ? `pendências: ${abertas.join("; ")}` : "sem pendências abertas",
      ].join(" | ")}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [...cabecalho, "", ...(blocos.length ? blocos.flatMap((b) => [b, ""]) : ["Nenhum paciente no quadro."])].join("\n").trim();
}
