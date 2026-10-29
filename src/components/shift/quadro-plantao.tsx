"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  BedDouble,
  Check,
  ClipboardList,
  Lock,
  Plus,
  Share2,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import CopyButton from "@/components/copy-button";
import ModulePageHeader from "@/components/module-page-header";
import {
  CLINICAL_CASE_SESSION_EVENT,
  formatCaseVitals,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import { canonicalizeClinicalComplaint } from "@/lib/clinical-shift-context";
import { etapasDoCaso, leituraDoCaso, proximaEtapa } from "@/lib/shift/caso";
import {
  OPCOES_REAVALIACAO,
  adicionarPaciente,
  adicionarPendencia,
  agendarReavaliacao,
  alternarPendencia,
  apagarQuadro,
  formatarMinutos,
  ordenarPacientes,
  prioridadePaciente,
  removerPaciente,
  removerPendencia,
  resumoQuadro,
  statusReavaliacao,
  textoPassagem,
  type PacienteQuadro,
} from "@/lib/shift/quadro";
import { PRIORIDADES } from "@/lib/shift/triagem";
import { COR_PRIORIDADE, NOME_COR } from "./prioridade";
import { useQuadro } from "./use-quadro";

const INPUT =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100";

function casoNovo(queixa: string): ClinicalCaseSession {
  return {
    complaint: canonicalizeClinicalComplaint(queixa),
    age: "",
    sex: "",
    severity: "A definir",
    vitals: { pa: "", fc: "", fr: "", temp: "", spo2: "", glicemia: "" },
    redFlags: "",
    notes: "",
    alerts: [],
    priorities: [],
    updatedAt: new Date().toISOString(),
  };
}

function rotuloMinutos(minutos: number) {
  return minutos >= 60 ? `${minutos / 60} h` : `${minutos} min`;
}

function Timer({ paciente, agora, onAgendar }: { paciente: PacienteQuadro; agora: number; onAgendar: (minutos: number | null) => void }) {
  const status = statusReavaliacao(paciente, agora);
  const chip =
    status.estado === "atrasada"
      ? { classe: "bg-rose-600 text-white motion-safe:animate-pulse", texto: `Reavaliar agora · atrasada ${formatarMinutos(status.minutos)}` }
      : status.estado === "proxima"
        ? { classe: "bg-[#FBBF24] text-[#451a03]", texto: `Reavaliar em ${formatarMinutos(status.minutos)}` }
        : status.estado === "em-dia"
          ? { classe: "bg-slate-100 text-slate-700", texto: `Reavaliar em ${formatarMinutos(status.minutos)}` }
          : { classe: "border border-dashed border-slate-300 text-slate-500", texto: "Sem horário de reavaliação" };

  return (
    <div className="space-y-2">
      <p className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${chip.classe}`} role={status.estado === "atrasada" ? "alert" : undefined}>
        <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
        {chip.texto}
      </p>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Agendar reavaliação">
        {OPCOES_REAVALIACAO.map((minutos) => (
          <button
            key={minutos}
            type="button"
            onClick={() => onAgendar(minutos)}
            className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 transition hover:border-cyan-700/40 hover:text-cyan-900"
          >
            {rotuloMinutos(minutos)}
          </button>
        ))}
        {status.estado !== "sem" ? (
          <button type="button" onClick={() => onAgendar(null)} className="h-7 rounded-md px-2 text-xs font-medium text-slate-400 transition hover:text-slate-700">
            Limpar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CartaoPaciente({
  paciente,
  agora,
  ativo,
  onAbrir,
  onAgendar,
  onPendencia,
  onAlternar,
  onRemoverPendencia,
  onRemover,
}: {
  paciente: PacienteQuadro;
  agora: number;
  ativo: boolean;
  onAbrir: () => void;
  onAgendar: (minutos: number | null) => void;
  onPendencia: (texto: string) => void;
  onAlternar: (id: string) => void;
  onRemoverPendencia: (id: string) => void;
  onRemover: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const leitura = useMemo(() => leituraDoCaso(paciente.caso), [paciente.caso]);
  const nivel = prioridadePaciente(paciente);
  const cor = nivel ? COR_PRIORIDADE[nivel] : null;
  const proximo = proximaEtapa(etapasDoCaso(paciente.caso));
  const vitais = formatCaseVitals(paciente.caso);

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${ativo ? "border-cyan-700 ring-2 ring-cyan-700/20" : "border-slate-200"}`}>
      <header className={`flex items-start justify-between gap-3 px-4 py-3 ${cor ? cor.faixa : "bg-slate-100 text-slate-700"}`}>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
            <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
            {paciente.leito || "Sem leito"}
            {ativo ? " · caso aberto" : ""}
          </p>
          <h3 className="truncate text-lg font-semibold">{paciente.caso.complaint}</h3>
        </div>
        <p className="shrink-0 text-right text-xs font-semibold">
          {nivel ? (
            <>
              {NOME_COR[nivel]}
              <span className="block font-medium opacity-90">{PRIORIDADES[nivel].rotulo}</span>
            </>
          ) : (
            <>
              Prioridade
              <span className="block font-medium opacity-90">a definir</span>
            </>
          )}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-0.5 text-sm text-slate-600">
          <p>{[paciente.caso.age, paciente.caso.sex].filter(Boolean).join(" · ") || "Idade e sexo não informados"}</p>
          <p className="text-slate-700">{vitais || "Sinais vitais não registrados"}</p>
          {leitura.news2 || leitura.alertas.length ? (
            <p className="text-xs text-slate-500">
              {[leitura.news2 ? `NEWS2 ${leitura.news2.pontos}${leitura.news2.completo ? "" : " (parcial)"}` : "", leitura.alertas.length ? `${leitura.alertas.length} alerta${leitura.alertas.length === 1 ? "" : "s"}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>

        <Timer paciente={paciente} agora={agora} onAgendar={onAgendar} />

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Pendências
          </p>
          {paciente.pendencias.length ? (
            <ul className="mt-1.5 space-y-1">
              {paciente.pendencias.map((item) => (
                <li key={item.id} className="group flex items-start gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => onAlternar(item.id)}
                    aria-pressed={item.feita}
                    aria-label={`${item.feita ? "Reabrir" : "Concluir"}: ${item.texto}`}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.feita ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`}
                  >
                    {item.feita ? <Check className="h-3 w-3" /> : null}
                  </button>
                  <span className={`min-w-0 flex-1 leading-5 ${item.feita ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.texto}</span>
                  <button
                    type="button"
                    onClick={() => onRemoverPendencia(item.id)}
                    aria-label={`Remover pendência: ${item.texto}`}
                    className="text-slate-300 transition hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <form
            className="mt-2 flex gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              onPendencia(texto);
              setTexto("");
            }}
          >
            <input value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Ex.: troponina 2ª amostra" aria-label="Nova pendência" className={`${INPUT} h-9`} />
            <button type="submit" aria-label="Adicionar pendência" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-cyan-700/40 hover:text-cyan-900">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={onAbrir} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-cyan-800 px-3 text-xs font-semibold text-white transition hover:bg-cyan-900">
            <Stethoscope className="h-3.5 w-3.5" />
            {proximo ? proximo.acao : "Abrir caso"}
          </button>
          {confirmar ? (
            <>
              <button type="button" onClick={onRemover} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white">
                Tirar do quadro
              </button>
              <button type="button" onClick={() => setConfirmar(false)} className="h-9 rounded-lg px-2 text-xs font-medium text-slate-500">
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Trash2 className="h-3.5 w-3.5" />
              Alta / remover
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function QuadroPlantao() {
  const router = useRouter();
  const { quadro, pronto, agora, alterar } = useQuadro();
  const [leito, setLeito] = useState("");
  const [queixa, setQueixa] = useState("");
  const [casoAtivo, setCasoAtivo] = useState<ClinicalCaseSession | null>(null);
  const [leitoAtivo, setLeitoAtivo] = useState("");
  const [limpar, setLimpar] = useState(false);
  const [podeCompartilhar, setPodeCompartilhar] = useState(false);

  useEffect(() => {
    setPodeCompartilhar(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    const atualizar = () => setCasoAtivo(loadClinicalCaseSession());
    atualizar();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
  }, []);

  const pacientes = useMemo(() => ordenarPacientes(quadro.pacientes, agora), [quadro, agora]);
  const resumo = useMemo(() => resumoQuadro(quadro, agora), [quadro, agora]);
  const passagem = useMemo(() => textoPassagem(quadro, agora), [quadro, agora]);
  const ativoNoQuadro = Boolean(casoAtivo?.quadroId && quadro.pacientes.some((p) => p.id === casoAtivo.quadroId));

  /* Reavaliação vencida aparece também no título da aba. */
  useEffect(() => {
    const original = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = resumo.atrasadas ? `(${resumo.atrasadas}) ${original}` : original;
    return () => {
      document.title = original;
    };
  }, [resumo.atrasadas]);

  function abrir(paciente: PacienteQuadro) {
    saveClinicalCaseSession({ ...paciente.caso, quadroId: paciente.id, leito: paciente.leito, updatedAt: new Date().toISOString() });
    router.push("/caso-rapido");
  }

  function novoPaciente(event: React.FormEvent) {
    event.preventDefault();
    if (!queixa.trim()) return;
    let criado: PacienteQuadro | undefined;
    alterar((atual, momento) => {
      const { quadro: proximo, id } = adicionarPaciente(atual, { leito, caso: casoNovo(queixa) }, momento);
      criado = proximo.pacientes.find((p) => p.id === id);
      return proximo;
    });
    if (criado) abrir(criado);
  }

  function adicionarAtivo(event: React.FormEvent) {
    event.preventDefault();
    if (!casoAtivo) return;
    let novoId = "";
    alterar((atual, momento) => {
      const { quadro: proximo, id } = adicionarPaciente(atual, { leito: leitoAtivo || casoAtivo.leito || "", caso: casoAtivo }, momento);
      novoId = id;
      return proximo;
    });
    saveClinicalCaseSession({ ...casoAtivo, quadroId: novoId, leito: (leitoAtivo || casoAtivo.leito || "").trim() });
    setLeitoAtivo("");
  }

  async function compartilhar() {
    try {
      await navigator.share({ title: "Passagem de plantão", text: passagem });
    } catch {
      // Cancelado pelo usuário ou indisponível: o botão de copiar segue disponível.
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <ModulePageHeader
        eyebrow="Resibook Shift"
        title="Quadro do plantão"
        description="Todos os pacientes do plantão em um lugar: prioridade, próxima reavaliação, pendências e a passagem pronta para a troca de turno."
        badges={[{ label: "Só neste aparelho", tone: "cyan" }, { label: "Sem nome do paciente", tone: "emerald" }]}
        metrics={[
          { label: "Pacientes", value: resumo.total },
          { label: "Reavaliações atrasadas", value: resumo.atrasadas },
          { label: "Pendências abertas", value: resumo.pendencias },
        ]}
        actions={
          <>
            <a href="#passagem" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition">
              Passagem do plantão
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/plantao" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition">
              Central
            </Link>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={novoPaciente} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Novo paciente</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto]">
              <label>
                <span className="sr-only">Leito ou iniciais</span>
                <input value={leito} onChange={(event) => setLeito(event.target.value)} placeholder="Leito ou iniciais" className={INPUT} />
              </label>
              <label>
                <span className="sr-only">Queixa principal</span>
                <input value={queixa} onChange={(event) => setQueixa(event.target.value)} placeholder="Queixa (ex.: dor torácica)" list="queixas-quadro" className={INPUT} />
              </label>
              <button type="submit" disabled={!queixa.trim()} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-50">
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
            <datalist id="queixas-quadro">
              {QUICK_COMPLAINTS.map((item) => (
                <option key={item.title} value={item.title} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-slate-500">Abre o Caso rápido já vinculado ao leito. Não use o nome do paciente.</p>
          </form>

          {casoAtivo?.complaint && !ativoNoQuadro ? (
            <form onSubmit={adicionarAtivo} className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">Caso aberto fora do quadro</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{casoAtivo.complaint}</p>
              <div className="mt-2 flex gap-2">
                <label className="flex-1">
                  <span className="sr-only">Leito ou iniciais do caso aberto</span>
                  <input value={leitoAtivo} onChange={(event) => setLeitoAtivo(event.target.value)} placeholder={casoAtivo.leito || "Leito ou iniciais"} className={INPUT} />
                </label>
                <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-cyan-700 bg-white px-3 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-800 hover:text-white">
                  <Plus className="h-4 w-4" />
                  Pôr no quadro
                </button>
              </div>
            </form>
          ) : (
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600">
              <Lock className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p>
                O quadro fica só neste aparelho, identifica os pacientes por leito ou iniciais e se apaga sozinho 12 h depois da última atualização, ao sair da conta ou se
                outra conta entrar.
              </p>
            </div>
          )}
        </div>
      </ModulePageHeader>

      {!pronto ? (
        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" aria-hidden="true" />
      ) : pacientes.length ? (
        <section aria-label="Pacientes do plantão" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {(["vermelho", "laranja", "amarelo", "verde"] as const).map((nivel) =>
              resumo.porPrioridade[nivel] ? (
                <span key={nivel} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${COR_PRIORIDADE[nivel].borda} ${COR_PRIORIDADE[nivel].fundo} ${COR_PRIORIDADE[nivel].texto}`}>
                  <span className={`h-2 w-2 rounded-full ${COR_PRIORIDADE[nivel].ponto}`} aria-hidden="true" />
                  {resumo.porPrioridade[nivel]} {NOME_COR[nivel].toLowerCase()}
                </span>
              ) : null
            )}
            <span className="text-slate-400">Prioridade a definir primeiro, depois a mais grave (definida por você); no mesmo nível, reavaliação vencida antes.</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pacientes.map((paciente) => (
              <CartaoPaciente
                key={paciente.id}
                paciente={paciente}
                agora={agora}
                ativo={casoAtivo?.quadroId === paciente.id}
                onAbrir={() => abrir(paciente)}
                onAgendar={(minutos) => alterar((atual, momento) => agendarReavaliacao(atual, paciente.id, minutos, momento))}
                onPendencia={(texto) => alterar((atual, momento) => adicionarPendencia(atual, paciente.id, texto, momento))}
                onAlternar={(id) => alterar((atual, momento) => alternarPendencia(atual, paciente.id, id, momento))}
                onRemoverPendencia={(id) => alterar((atual, momento) => removerPendencia(atual, paciente.id, id, momento))}
                onRemover={() => alterar((atual) => removerPaciente(atual, paciente.id))}
              />
            ))}
          </div>
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Nenhum paciente no quadro. Adicione pelo leito e pela queixa para acompanhar reavaliações e pendências.
        </p>
      )}

      <section id="passagem" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Troca de turno</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Passagem do plantão (SBAR de todos)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {podeCompartilhar ? (
              <button type="button" onClick={compartilhar} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
            ) : null}
            <CopyButton text={passagem} label="Copiar passagem" copiedLabel="Passagem copiada" />
          </div>
        </div>
        <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[13px] leading-6 text-slate-800">{passagem}</pre>
        {pacientes.length ? (
          <div className="mt-4 flex justify-end">
            {limpar ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Apagar todos os pacientes deste aparelho?</span>
                <button
                  type="button"
                  onClick={() => {
                    apagarQuadro();
                    setLimpar(false);
                  }}
                  className="h-9 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white"
                >
                  Apagar quadro
                </button>
                <button type="button" onClick={() => setLimpar(false)} className="h-9 rounded-lg px-2 text-xs font-medium text-slate-500">
                  Cancelar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setLimpar(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                <Trash2 className="h-3.5 w-3.5" />
                Encerrar plantão e apagar quadro
              </button>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
