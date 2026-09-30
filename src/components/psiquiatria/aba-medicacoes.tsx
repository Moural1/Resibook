"use client";

import { useState } from "react";
import {
  ADESAO,
  CLASSES_MEDICACAO,
  EXAMES,
  FARMACOS,
  MESES_MINIMOS_TENTATIVA,
  RESPOSTAS_TERAPEUTICAS,
  UNIDADES_EXAME,
  rotuloHumor,
  type ClasseMedicacao,
  type Exame,
  type RespostaTerapeutica,
} from "@/lib/psiquiatria/catalogos.ts";
import {
  adequacaoTentativa,
  falhasTerapeuticas,
  identificarFarmaco,
  tentativasInadequadas,
} from "@/lib/psiquiatria/farmacologia.ts";
import { monitorizacao } from "@/lib/psiquiatria/monitorizacao.ts";
import type { Medicacao } from "@/lib/psiquiatria/tipos.ts";
import { formatarNumero, porMes } from "@/lib/psiquiatria/util.ts";
import { novoId, type PropsAba } from "./contexto";
import { MiniGraficosExames } from "./graficos";
import {
  AvisoPrivacidade,
  Botao,
  BotaoConfirmar,
  LinhaLista,
  Painel,
  Rotulo,
  Selo,
  Vazio,
  classeCampo,
  textoBloqueado,
} from "./ui";

type FormMed = { nome: string; dose: string; classe: ClasseMedicacao; inicio: string; fim: string; resposta: RespostaTerapeutica; motivo: string };

export function AbaMedicacoes({ paciente: p, atualizar, avisar }: PropsAba) {
  const vazio = (): FormMed => ({ nome: "", dose: "", classe: "antidepressivo", inicio: String(p.atual), fim: "", resposta: "aguardando", motivo: "" });
  const [form, setForm] = useState<FormMed>(vazio);
  const [editando, setEditando] = useState<string | null>(null);
  const falhas = falhasTerapeuticas(p);
  const inadequadas = tentativasInadequadas(p);
  const linhas = [...p.meds].sort((a, b) => (a.fim == null ? -1 : 0) - (b.fim == null ? -1 : 0) || b.inicio - a.inicio);

  const seloAdequacao = (m: Medicacao) => {
    const a = adequacaoTentativa(m, p);
    if (!a) return null;
    if (m.resposta === "intolerancia") return <Selo>Não tolerado</Selo>;
    if (a.doseAdequada === null) return <Selo>Dose de referência desconhecida</Selo>;
    if (!a.doseAdequada) return <Selo tom="atencao">Abaixo da dose mínima ({a.doseMinima} mg)</Selo>;
    if (!a.duracaoAdequada) return <Selo tom="atencao">{m.fim == null ? "Ainda em tempo de avaliação" : "Tempo insuficiente"}</Selo>;
    return <Selo tom="ok">Tentativa adequada</Selo>;
  };

  const editar = (m: Medicacao) => {
    setEditando(m.id);
    setForm({ nome: m.nome, dose: m.dose, classe: m.classe, inicio: String(m.inicio), fim: m.fim == null ? "" : String(m.fim), resposta: m.resposta, motivo: m.motivo });
  };

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Painel titulo={editando ? "Editar medicação" : "Adicionar medicação"}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fim = form.fim === "" ? null : Number(form.fim);
              if (fim != null && fim < Number(form.inicio)) return avisar("O mês de fim não pode ser antes do início");
              if (textoBloqueado(form.nome, form.dose, form.motivo)) return;
              const dados = { nome: form.nome.trim(), dose: form.dose.trim(), classe: form.classe, inicio: Number(form.inicio), fim, resposta: form.resposta, motivo: form.motivo.trim() };
              atualizar((x) => {
                if (editando) {
                  const m = x.meds.find((y) => y.id === editando);
                  if (m) Object.assign(m, dados);
                } else {
                  x.meds.push({ id: novoId(), ...dados });
                }
              }, editando ? "Medicação atualizada" : "Medicação adicionada");
              setEditando(null);
              setForm(vazio());
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Rotulo texto="Medicação">
                <input
                  required
                  list="psiq-farmacos"
                  maxLength={40}
                  autoComplete="off"
                  value={form.nome}
                  onChange={(e) => {
                    const info = identificarFarmaco(e.target.value);
                    setForm({ ...form, nome: e.target.value, ...(info ? { classe: info.classe } : {}) });
                  }}
                  className={classeCampo}
                />
              </Rotulo>
              <Rotulo texto="Dose">
                <input maxLength={30} placeholder="Ex.: 10 mg/dia" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} className={classeCampo} />
              </Rotulo>
            </div>
            <datalist id="psiq-farmacos">
              {Object.values(FARMACOS).filter((f) => f.nome).map((f) => (
                <option key={f.nome} value={f.nome} />
              ))}
            </datalist>
            <div className="grid gap-3 sm:grid-cols-3">
              <Rotulo texto="Classe">
                <select value={form.classe} onChange={(e) => setForm({ ...form, classe: e.target.value as ClasseMedicacao })} className={classeCampo}>
                  {Object.entries(CLASSES_MEDICACAO).map(([k, c]) => (
                    <option key={k} value={k}>{c.rotulo}</option>
                  ))}
                </select>
              </Rotulo>
              <Rotulo texto="Início (mês)">
                <input type="number" required value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} className={classeCampo} />
              </Rotulo>
              <Rotulo texto="Fim (mês)">
                <input type="number" placeholder="Em uso" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} className={classeCampo} />
              </Rotulo>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Rotulo texto="Resposta">
                <select value={form.resposta} onChange={(e) => setForm({ ...form, resposta: e.target.value as RespostaTerapeutica })} className={classeCampo}>
                  {Object.entries(RESPOSTAS_TERAPEUTICAS).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </Rotulo>
              <Rotulo texto="Motivo da troca ou observação">
                <input maxLength={80} value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className={classeCampo} />
              </Rotulo>
            </div>
            <AvisoPrivacidade texto={`${form.nome} ${form.dose} ${form.motivo}`} />
            <div className="flex gap-2">
              <Botao type="submit" variante="primario">{editando ? "Salvar alterações" : "Adicionar medicação"}</Botao>
              {editando ? <Botao onClick={() => { setEditando(null); setForm(vazio()); }}>Cancelar</Botao> : null}
            </div>
          </form>
        </Painel>

        <Painel titulo="Tentativas antidepressivas">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm">
            <span className="text-slate-600">Adequadas e sem resposta</span>
            <span className="flex items-center gap-2 font-medium tabular-nums">
              {falhas.length}
              {falhas.length >= 2 ? <Selo tom="forte-atencao">Critério de resistência</Selo> : null}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="text-slate-600">Interrompidas sem tentativa adequada</span>
            <span className="font-medium tabular-nums">{inadequadas.length}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Tentativa adequada: dose mínima eficaz por pelo menos {MESES_MINIMOS_TENTATIVA} meses (cerca de 6 a 8 semanas). As doses mínimas vêm de uma tabela de referência simplificada; confira na bula e nas diretrizes. Ao digitar o nome, a classe é preenchida sozinha.
          </p>
        </Painel>
      </div>

      <Painel titulo="Histórico farmacológico">
        {linhas.length ? (
          linhas.map((m) => {
            const d = (m.fim ?? p.atual) - m.inicio;
            return (
              <LinhaLista
                key={m.id}
                titulo={
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {m.nome} <span className="font-normal text-slate-600">{m.dose}</span>
                    <Selo tom={m.fim == null ? "ok" : "neutro"}>{m.fim == null ? "Em uso" : "Encerrada"}</Selo>
                    {seloAdequacao(m)}
                  </span>
                }
                detalhe={`${CLASSES_MEDICACAO[m.classe].rotulo}. Mês ${m.inicio} ${m.fim == null ? "até hoje" : `ao mês ${m.fim}`}, ${d < 1 ? "menos de 1 mês" : `${d} ${d === 1 ? "mês" : "meses"}`}. ${RESPOSTAS_TERAPEUTICAS[m.resposta]}${m.motivo ? `. ${m.motivo}` : ""}`}
                acoes={
                  <>
                    <Botao pequeno onClick={() => editar(m)}>Editar</Botao>
                    <BotaoConfirmar onConfirmar={() => atualizar((x) => { x.meds = x.meds.filter((y) => y.id !== m.id); }, "Removido")} />
                  </>
                }
              />
            );
          })
        ) : (
          <Vazio>Nenhuma medicação registrada.</Vazio>
        )}
      </Painel>
    </div>
  );
}

function sinalizarExame(nome: Exame, valor: number | null) {
  if (valor == null) return null;
  if (nome === "Litemia" && (valor > 1.2 || valor < 0.6)) return <Selo tom="atencao">fora da faixa</Selo>;
  if (nome === "TSH" && valor > 4.5) return <Selo tom="atencao">elevado</Selo>;
  if (nome === "Glicemia de jejum" && valor >= 100) return <Selo tom="atencao">elevada</Selo>;
  if (nome === "HbA1c" && valor >= 5.7) return <Selo tom="atencao">elevada</Selo>;
  return null;
}

export function AbaHistorico({ paciente: p, atualizar, irPara, rascunho }: PropsAba) {
  const itens = monitorizacao(p);
  const [nome, setNome] = useState<Exame>("Litemia");
  const [mes, setMes] = useState(String(p.atual));
  const [valor, setValor] = useState("");

  return (
    <div className="space-y-5">
      <Botao variante="primario" onClick={() => irPara("consulta")}>
        {rascunho ? "Continuar consulta de hoje" : "Iniciar consulta de hoje"}
      </Botao>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Painel titulo="Monitorização laboratorial">
          {itens.length ? (
            itens.map((x) => (
              <div key={x.rotulo} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
                <span>
                  <b className="font-medium text-slate-900">{x.rotulo}</b>
                  <span className="block text-xs text-slate-500">
                    {x.medicacao}, a cada {x.intervaloMeses} {x.intervaloMeses === 1 ? "mês" : "meses"}
                  </span>
                </span>
                <span className="text-right">
                  {x.status === "pendente" ? <Selo tom="atencao">Pendente</Selo> : x.status === "proximo" ? <Selo tom="ok">Próximo mês</Selo> : <Selo>Em dia</Selo>}
                  <span className="block text-xs text-slate-500">{x.ultimo == null ? "sem registro" : `último no mês ${x.ultimo}`}</span>
                </span>
              </div>
            ))
          ) : (
            <Vazio>Nenhuma medicação em uso exige monitorização nesta lista.</Vazio>
          )}
          <form
            className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[1.4fr_0.7fr_1fr_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              const v = valor.trim().replace(",", ".");
              const numero = v === "" || Number.isNaN(Number(v)) ? null : Number(v);
              atualizar((x) => {
                x.exames.push({ id: novoId(), nome, mes: Number(mes), valor: numero });
              }, "Exame registrado");
              setValor("");
            }}
          >
            <Rotulo texto="Exame">
              <select value={nome} onChange={(e) => setNome(e.target.value as Exame)} className={classeCampo}>
                {EXAMES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Rotulo>
            <Rotulo texto="Mês">
              <input type="number" required value={mes} onChange={(e) => setMes(e.target.value)} className={classeCampo} />
            </Rotulo>
            <Rotulo texto="Valor (opcional)">
              <input inputMode="decimal" placeholder={UNIDADES_EXAME[nome]} value={valor} onChange={(e) => setValor(e.target.value)} className={classeCampo} />
            </Rotulo>
            <Botao type="submit">Registrar</Botao>
          </form>
        </Painel>

        <Painel titulo="Exames registrados">
          {p.exames.length ? (
            [...porMes(p.exames)].reverse().map((e) => (
              <LinhaLista
                key={e.id}
                titulo={
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {e.nome}
                    {e.valor != null ? (
                      <>
                        : {formatarNumero(e.valor)} <span className="font-normal text-slate-500">{UNIDADES_EXAME[e.nome]}</span>
                      </>
                    ) : null}
                    {sinalizarExame(e.nome, e.valor)}
                  </span>
                }
                detalhe={`Mês ${e.mes}`}
                acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.exames = x.exames.filter((y) => y.id !== e.id); }, "Removido")} />}
              />
            ))
          ) : (
            <Vazio>Nenhum exame ainda.</Vazio>
          )}
        </Painel>
      </div>

      {p.exames.some((e) => e.valor != null) ? (
        <Painel titulo="Evolução dos valores">
          <MiniGraficosExames paciente={p} />
          {!p.exames.some((e, _, arr) => e.valor != null && arr.filter((y) => y.nome === e.nome && y.valor != null).length >= 2) ? (
            <Vazio>Os gráficos aparecem a partir de dois valores do mesmo exame.</Vazio>
          ) : null}
        </Painel>
      ) : null}

      <Painel titulo="Consultas">
        {p.consultas.length ? (
          [...porMes(p.consultas)].reverse().map((c) => (
            <LinhaLista
              key={c.id}
              titulo={
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  Mês {c.mes}
                  {c.adesao ? <Selo tom={c.adesao === "boa" ? "ok" : "atencao"}>Adesão {ADESAO[c.adesao].toLowerCase()}</Selo> : null}
                  {c.humor != null && c.humor !== "" ? <Selo>{rotuloHumor(Number(c.humor))}</Selo> : null}
                </span>
              }
              detalhe={
                <>
                  {c.resumo}
                  {c.efeitos.length ? <span className="block">Efeitos: {c.efeitos.join(", ").toLowerCase()}</span> : null}
                  {c.combinado ? (
                    <span className="block">
                      <b className="font-medium text-slate-800">Combinado:</b> {c.combinado}
                    </span>
                  ) : null}
                  {c.texto ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-slate-500 hover:text-slate-800">Evolução completa</summary>
                      <p className="mt-1 whitespace-pre-wrap text-slate-700">{c.texto}</p>
                    </details>
                  ) : null}
                </>
              }
              acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.consultas = x.consultas.filter((y) => y.id !== c.id); }, "Removido")} />}
            />
          ))
        ) : (
          <Vazio>Nenhuma consulta ainda.</Vazio>
        )}
      </Painel>
    </div>
  );
}
