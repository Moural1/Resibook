"use client";

// Módulo de acompanhamento psiquiátrico longitudinal.
// Estado local + salvamento automático no Supabase (tabela psiq_patients).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp, Lock, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { temAlertaAlto } from "@/lib/psiquiatria/alertas.ts";
import { FAIXAS_ETARIAS, SEXOS, type FaixaEtaria, type Sexo } from "@/lib/psiquiatria/catalogos.ts";
import { pacienteExemplo } from "@/lib/psiquiatria/exemplo.ts";
import { importarPaciente, proximoCodigo } from "@/lib/psiquiatria/privacidade.ts";
import type { RascunhoConsulta } from "@/lib/psiquiatria/textos.ts";
import { novoPaciente, type PacientePsiquiatria } from "@/lib/psiquiatria/tipos.ts";
import { AbaConsulta } from "./aba-consulta";
import { AbaEscalas } from "./aba-escalas";
import { AbaEcomapa, AbaFormulacao, AbaGenograma, AbaTempo } from "./aba-familia";
import { AbaHistorico, AbaMedicacoes } from "./aba-medicacoes";
import { AbaResumo } from "./aba-resumo";
import { AbaRisco } from "./aba-risco";
import { ABAS, novoId, type Aba, type PropsAba } from "./contexto";
import {
  TabelaAusenteError,
  criarPaciente,
  excluirPaciente,
  excluirTodosPacientes,
  listarPacientes,
  salvarPaciente,
  type Registro,
} from "./dados";
import { Botao, BotaoConfirmar, CampoTexto, Painel, Rotulo, classeCampo, textoBloqueado } from "./ui";

type EstadoSalvo = "salvo" | "salvando" | "pendente" | "erro";

function DialogoPaciente({
  titulo,
  codigo,
  inicial,
  onSalvar,
  onFechar,
  onExcluir,
}: {
  titulo: string;
  codigo: string;
  inicial: { faixa: FaixaEtaria; sexo: Sexo; hip: string };
  onSalvar: (d: { faixa: FaixaEtaria; sexo: Sexo; hip: string }) => void;
  onFechar: () => void;
  onExcluir?: () => void;
}) {
  const [faixa, setFaixa] = useState(inicial.faixa);
  const [sexo, setSexo] = useState(inicial.sexo);
  const [hip, setHip] = useState(inicial.hip);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:items-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <form
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (textoBloqueado(hip)) return;
          onSalvar({ faixa, sexo, hip: hip.trim() });
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">Código: {codigo}. Nenhum nome é pedido.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Rotulo texto="Faixa etária">
            <select value={faixa} onChange={(e) => setFaixa(e.target.value as FaixaEtaria)} className={classeCampo}>
              {FAIXAS_ETARIAS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Rotulo>
          <Rotulo texto="Sexo">
            <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} className={classeCampo}>
              {Object.entries(SEXOS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Rotulo>
        </div>
        <div className="mt-3">
          <CampoTexto rotulo="Hipótese diagnóstica" valor={hip} onChange={setHip} maxLength={140} placeholder="Ex.: Episódio depressivo moderado" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Botao type="submit" variante="primario">Salvar paciente</Botao>
          <Botao onClick={onFechar}>Cancelar</Botao>
          {onExcluir ? <BotaoConfirmar confirmar="Toque de novo para excluir" onConfirmar={onExcluir}>Excluir paciente</BotaoConfirmar> : null}
        </div>
      </form>
    </div>
  );
}

export default function PsiquiatriaApp() {
  const supabase = useMemo(() => createClient(), []);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("resumo");
  const [escalaInicial, setEscalaInicial] = useState<string | undefined>();
  const [carregando, setCarregando] = useState(true);
  const [tabelaAusente, setTabelaAusente] = useState(false);
  const [erro, setErro] = useState("");
  const [estado, setEstado] = useState<EstadoSalvo>("salvo");
  const [dialogo, setDialogo] = useState<"novo" | "editar" | null>(null);
  const pendentes = useRef(new Set<string>());
  const temporizador = useRef<number | null>(null);
  const registrosRef = useRef(registros);
  useEffect(() => {
    registrosRef.current = registros;
  }, [registros]);
  const entradaArquivo = useRef<HTMLInputElement>(null);

  const avisar = useCallback((title: string) => showToast({ title, variant: "success" }), []);

  useEffect(() => {
    let ativo = true;
    listarPacientes(supabase)
      .then((lista) => {
        if (!ativo) return;
        setRegistros(lista);
        setSelId(lista[0]?.paciente.id ?? null);
      })
      .catch((e) => {
        if (!ativo) return;
        if (e instanceof TabelaAusenteError) setTabelaAusente(true);
        else setErro(e instanceof Error ? e.message : "Não foi possível carregar os pacientes.");
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [supabase]);

  const gravarPendentes = useCallback(async () => {
    const ids = [...pendentes.current];
    pendentes.current.clear();
    if (!ids.length) return;
    setEstado("salvando");
    try {
      for (const id of ids) {
        const r = registrosRef.current.find((x) => x.paciente.id === id);
        if (r) await salvarPaciente(supabase, r);
      }
      setEstado(pendentes.current.size ? "pendente" : "salvo");
    } catch {
      ids.forEach((id) => pendentes.current.add(id));
      setEstado("erro");
    }
  }, [supabase]);

  const agendar = useCallback(
    (id: string) => {
      pendentes.current.add(id);
      setEstado("pendente");
      if (temporizador.current) window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => void gravarPendentes(), 700);
    },
    [gravarPendentes]
  );

  // Garante o envio do que estiver pendente ao sair da página.
  useEffect(() => {
    const antesDeSair = (e: BeforeUnloadEvent) => {
      if (pendentes.current.size) {
        void gravarPendentes();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", antesDeSair);
    return () => window.removeEventListener("beforeunload", antesDeSair);
  }, [gravarPendentes]);

  const registro = registros.find((r) => r.paciente.id === selId) ?? null;

  const atualizar = useCallback(
    (receita: (p: PacientePsiquiatria) => void, aviso?: string) => {
      if (!selId) return;
      setRegistros((lista) =>
        lista.map((r) => {
          if (r.paciente.id !== selId) return r;
          const copia = structuredClone(r.paciente);
          receita(copia);
          return { ...r, paciente: copia };
        })
      );
      agendar(selId);
      if (aviso) avisar(aviso);
    },
    [selId, agendar, avisar]
  );

  const setRascunho = useCallback(
    (rascunho: RascunhoConsulta | null) => {
      if (!selId) return;
      setRegistros((lista) => lista.map((r) => (r.paciente.id === selId ? { ...r, rascunho } : r)));
      agendar(selId);
    },
    [selId, agendar]
  );

  const irPara = useCallback((a: Aba) => {
    setAba(a);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const codigos = registros.map((r) => r.paciente.code);

  async function adicionar(paciente: PacientePsiquiatria, mensagem: string) {
    try {
      const salvo = await criarPaciente(supabase, { paciente, rascunho: null });
      setRegistros((lista) => [...lista, salvo].sort((a, b) => a.paciente.code.localeCompare(b.paciente.code)));
      setSelId(salvo.paciente.id);
      setAba("resumo");
      avisar(mensagem);
      return true;
    } catch (e) {
      showToast({ title: e instanceof Error ? e.message : "Não foi possível criar o paciente.", variant: "error" });
      return false;
    }
  }

  async function importarArquivo(arquivo: File) {
    try {
      const json = JSON.parse(await arquivo.text());
      const lista: unknown[] = Array.isArray(json) ? json : Array.isArray(json?.patients) ? json.patients : [];
      let usados = [...codigos];
      let ok = 0;
      for (const bruto of lista) {
        const p = importarPaciente(bruto);
        if (!p) continue;
        if (usados.includes(p.code)) p.code = proximoCodigo(usados);
        usados = [...usados, p.code];
        if (await adicionar({ ...p, id: novoId() }, `${p.code} importado`)) ok++;
      }
      showToast({ title: ok ? `${ok} paciente(s) importado(s)` : "Nenhum paciente válido no arquivo", variant: ok ? "success" : "error" });
    } catch {
      showToast({ title: "Arquivo inválido: use um backup exportado deste módulo ou do protótipo.", variant: "error" });
    }
  }

  function exportar() {
    const dados = { exportado: "Resibook Psiquiatria", versao: 1, patients: registros.map((r) => r.paciente) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "resibook-psiquiatria-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (carregando) {
    return (
      <div className="animate-pulse space-y-4" role="status">
        <span className="sr-only">Carregando pacientes</span>
        <div className="h-24 rounded-xl bg-slate-200/70" />
        <div className="h-64 rounded-xl bg-slate-200/60" />
      </div>
    );
  }

  if (tabelaAusente || erro) {
    return (
      <Painel titulo={tabelaAusente ? "Módulo aguardando ativação" : "Não foi possível carregar"}>
        <p className="text-sm leading-6 text-slate-600">
          {tabelaAusente
            ? "A estrutura segura do banco para este módulo ainda não foi aplicada. Assim que a migration psiq_patients for aplicada no Supabase, os pacientes aparecem aqui."
            : erro}
        </p>
      </Painel>
    );
  }

  const p = registro?.paciente ?? null;
  const props: PropsAba | null =
    p && registro
      ? {
          paciente: p,
          atualizar,
          irPara,
          rascunho: registro.rascunho,
          setRascunho,
          avisar,
          escalaInicial,
          abrirEscala: (t) => {
            setEscalaInicial(t);
            irPara("escalas");
          },
        }
      : null;

  async function excluirTudo() {
    try {
      await excluirTodosPacientes(supabase);
      pendentes.current.clear();
      setRegistros([]);
      setSelId(null);
      avisar("Todos os pacientes foram apagados");
    } catch {
      showToast({ title: "Não foi possível apagar os pacientes.", variant: "error" });
    }
  }

  const ferramentas = (
    <>
        <div className="flex items-start gap-2 rounded-lg bg-cyan-50/70 p-3 text-xs leading-5 text-cyan-950">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />
          <span>Use só o código do paciente e meses de seguimento. Não registre nomes, datas reais, cidades ou documentos.</span>
        </div>
        <div className="flex flex-wrap gap-1.5 lg:flex-col">
          <Botao pequeno variante="fantasma" className="justify-start" onClick={exportar} disabled={!registros.length}>
            <Download className="h-3.5 w-3.5" /> Exportar backup
          </Botao>
          <Botao pequeno variante="fantasma" className="justify-start" onClick={() => entradaArquivo.current?.click()}>
            <FileUp className="h-3.5 w-3.5" /> Importar backup
          </Botao>
          <Botao
            pequeno
            variante="fantasma"
            className="justify-start"
            onClick={() => {
              const code = proximoCodigo(codigos);
              void adicionar({ ...pacienteExemplo(novoId(), code) }, "Paciente de exemplo adicionado");
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Paciente de exemplo
          </Botao>
        </div>
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-[11px] leading-5 text-slate-500">
            Os dados ficam guardados enquanto sua conta existir e são apagados automaticamente se a conta for excluída. Você pode apagar tudo a qualquer momento; exporte o backup antes, se quiser guardar uma cópia.
          </p>
          {registros.length ? (
            <BotaoConfirmar
              confirmar={`Toque de novo para apagar ${registros.length} paciente${registros.length === 1 ? "" : "s"}`}
              onConfirmar={excluirTudo}
            >
              Apagar todos os pacientes
            </BotaoConfirmar>
          ) : null}
        </div>
        <p className="text-[11px] leading-5 text-slate-400">
          Intervalos de monitorização simplificados; ajuste ao protocolo do seu serviço. Não substitui o prontuário oficial nem o julgamento clínico.
        </p>
    </>
  );

  const rotuloEstado = { salvo: "Salvo", salvando: "Salvando…", pendente: "Alterações não salvas", erro: "Falha ao salvar, tentando de novo" }[estado];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Psiquiatria</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhamento longitudinal pseudonimizado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${estado === "erro" ? "text-rose-700" : "text-slate-500"}`}
            aria-live="polite"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${estado === "salvo" ? "bg-emerald-500" : estado === "erro" ? "bg-rose-500" : "bg-amber-400"}`} />
            {rotuloEstado}
          </span>
          {estado === "erro" ? <Botao pequeno onClick={() => void gravarPendentes()}>Tentar de novo</Botao> : null}
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-24">
          <Botao variante="primario" className="w-full" onClick={() => setDialogo("novo")}>
            <UserPlus className="h-4 w-4" /> Novo paciente
          </Botao>
          <nav aria-label="Pacientes" className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {registros.map((r) => {
              const ativo = r.paciente.id === selId;
              return (
                <button
                  key={r.paciente.id}
                  type="button"
                  onClick={() => {
                    setSelId(r.paciente.id);
                    setAba("resumo");
                  }}
                  aria-current={ativo ? "true" : undefined}
                  className={`flex min-w-[150px] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition lg:min-w-0 ${
                    ativo ? "border-slate-200 bg-white shadow-sm" : "border-transparent hover:bg-white/70"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{r.paciente.code}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {r.paciente.faixa} anos, mês {r.paciente.atual}
                    </span>
                  </span>
                  {temAlertaAlto(r.paciente) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600" title="Alerta de prioridade alta" /> : null}
                </button>
              );
            })}
            {!registros.length ? <p className="px-1 text-sm text-slate-500">Nenhum paciente ainda.</p> : null}
          </nav>
          <details className="group rounded-lg border border-slate-200 bg-white px-3 py-2 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-cyan-800" /> Privacidade e backup
            </summary>
            <div className="mt-3 space-y-3">{ferramentas}</div>
          </details>
          <div className="hidden space-y-3 lg:block">{ferramentas}</div>
          <input
          ref={entradaArquivo}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importarArquivo(f);
            e.target.value = "";
          }}
          />
        </aside>

        <div className="min-w-0">
          {!p || !registro ? (
            <Painel>
              <div className="py-10 text-center">
                <Lock className="mx-auto h-6 w-6 text-slate-400" />
                <h2 className="mt-3 text-lg font-semibold text-slate-900">Comece cadastrando um paciente</h2>
                <p className="mt-1 text-sm text-slate-500">O app gera um código automático. Nenhum nome é pedido.</p>
                <Botao variante="primario" className="mt-4" onClick={() => setDialogo("novo")}>Novo paciente</Botao>
              </div>
            </Painel>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-4xl font-semibold leading-none tracking-tight text-slate-950">{p.code}</p>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">
                    {p.faixa} anos, {p.sexo === "F" ? "feminino" : p.sexo === "M" ? "masculino" : "sexo não informado"}. {p.hip || "Sem hipótese registrada."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2">
                    <span className="text-3xl font-semibold tabular-nums leading-none text-slate-950">{p.atual}</span>
                    <span className="text-xs leading-tight text-slate-500">
                      {p.atual === 1 ? "mês" : "meses"} de
                      <br />
                      seguimento
                    </span>
                  </span>
                  <Botao pequeno onClick={() => setDialogo("editar")}>Editar dados</Botao>
                  {aba !== "consulta" ? (
                    <Botao pequeno variante="primario" onClick={() => irPara("consulta")}>
                      {registro?.rascunho ? "Continuar consulta" : "Iniciar consulta"}
                    </Botao>
                  ) : null}
                </div>
              </div>

              <nav role="tablist" aria-label="Seções do paciente" className="mb-5 mt-5 flex gap-0.5 overflow-x-auto border-b border-slate-200">
                {(Object.keys(ABAS) as Aba[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={aba === k}
                    onClick={() => {
                      if (k === "escalas") setEscalaInicial(undefined);
                      setAba(k);
                    }}
                    className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition ${
                      aba === k ? "border-cyan-700 font-semibold text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {ABAS[k]}
                    {k === "consulta" && registro?.rascunho ? " •" : ""}
                  </button>
                ))}
              </nav>

              <div key={`${p.id}-${aba}-${escalaInicial ?? ""}`} className="page-enter">
                <div>
                  {aba === "resumo" ? <AbaResumo {...(props as PropsAba)} /> : null}
                  {aba === "consulta" ? <AbaConsulta {...(props as PropsAba)} /> : null}
                  {aba === "risco" ? <AbaRisco {...(props as PropsAba)} /> : null}
                  {aba === "tempo" ? <AbaTempo {...(props as PropsAba)} /> : null}
                  {aba === "formulacao" ? <AbaFormulacao {...(props as PropsAba)} /> : null}
                  {aba === "medicacoes" ? <AbaMedicacoes {...(props as PropsAba)} /> : null}
                  {aba === "escalas" ? <AbaEscalas {...(props as PropsAba)} /> : null}
                  {aba === "genograma" ? <AbaGenograma {...(props as PropsAba)} /> : null}
                  {aba === "ecomapa" ? <AbaEcomapa {...(props as PropsAba)} /> : null}
                  {aba === "historico" ? <AbaHistorico {...(props as PropsAba)} /> : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {dialogo === "novo" ? (
        <DialogoPaciente
          titulo="Novo paciente"
          codigo={proximoCodigo(codigos)}
          inicial={{ faixa: "25–34", sexo: "F", hip: "" }}
          onFechar={() => setDialogo(null)}
          onSalvar={async (d) => {
            const code = proximoCodigo(codigos);
            if (await adicionar(novoPaciente({ id: novoId(), code, ...d }), `${code} criado`)) setDialogo(null);
          }}
        />
      ) : null}
      {dialogo === "editar" && p ? (
        <DialogoPaciente
          titulo="Editar dados do paciente"
          codigo={p.code}
          inicial={{ faixa: p.faixa, sexo: p.sexo, hip: p.hip }}
          onFechar={() => setDialogo(null)}
          onSalvar={(d) => {
            atualizar((x) => Object.assign(x, d), "Dados salvos");
            setDialogo(null);
          }}
          onExcluir={async () => {
            try {
              await excluirPaciente(supabase, p.id);
              pendentes.current.delete(p.id);
              const resto = registros.filter((r) => r.paciente.id !== p.id);
              setRegistros(resto);
              setSelId(resto[0]?.paciente.id ?? null);
              setDialogo(null);
              avisar("Paciente excluído");
            } catch {
              showToast({ title: "Não foi possível excluir o paciente.", variant: "error" });
            }
          }}
        />
      ) : null}
    </div>
  );
}
