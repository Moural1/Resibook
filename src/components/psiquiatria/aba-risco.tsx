"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { SECOES_PLANO, type SecaoPlano } from "@/lib/psiquiatria/catalogos.ts";
import { NIVEIS_CSSRS, PERGUNTAS_CSSRS, nivelCssrs, normalizarRespostasCssrs } from "@/lib/psiquiatria/cssrs.ts";
import { sugestoesPlano, textoPlanoSeguranca } from "@/lib/psiquiatria/textos.ts";
import type { RespostasCssrs } from "@/lib/psiquiatria/tipos.ts";
import { porMes, ultimo } from "@/lib/psiquiatria/util.ts";
import { mesPadrao, novoId, type PropsAba } from "./contexto";
import { TOM_RISCO } from "./aba-resumo";
import {
  AvisoPrivacidade,
  Botao,
  BotaoConfirmar,
  CampoTexto,
  LinhaLista,
  Painel,
  Selo,
  Vazio,
  classeCampo,
  textoBloqueado,
} from "./ui";

type Resposta = "" | "1" | "0";
const CHAVES: Array<keyof RespostasCssrs> = ["q1", "q2", "q3", "q4", "q5", "q6", "q6r"];

function SimNao({ id, pergunta, valor, onChange }: { id: string; pergunta: string; valor: Resposta; onChange: (v: Resposta) => void }) {
  return (
    <fieldset className="flex flex-col gap-2 border-b border-slate-100 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <legend className="float-left text-sm leading-6 text-slate-800">{pergunta}</legend>
      <div className="flex shrink-0 gap-1.5">
        {(["1", "0"] as const).map((v) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={id} value={v} checked={valor === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-8 min-w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition peer-checked:border-cyan-800 peer-checked:bg-cyan-800 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500">
              {v === "1" ? "Sim" : "Não"}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FormCssrs({ paciente, atualizar, rascunho }: PropsAba) {
  const vazio = Object.fromEntries(CHAVES.map((k) => [k, ""])) as Record<keyof RespostasCssrs, Resposta>;
  const [r, setR] = useState(vazio);
  const [mes, setMes] = useState(String(mesPadrao(paciente, rascunho)));
  const [obs, setObs] = useState("");
  const q2 = r.q2 === "1";
  const q6 = r.q6 === "1";
  const completo = r.q1 && r.q2 && r.q6 && (!q2 || (r.q3 && r.q4 && r.q5)) && (!q6 || r.q6r);
  const respostas = normalizarRespostasCssrs(
    Object.fromEntries(CHAVES.map((k) => [k, r[k] === "1"])) as RespostasCssrs
  );
  const nivel = completo ? nivelCssrs(respostas) : null;

  return (
    <Painel titulo="Aplicar C-SSRS (versão de rastreio)">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nivel || textoBloqueado(obs)) return;
          atualizar((p) => {
            p.cssrs.push({ id: novoId(), mes: Number(mes), r: respostas, nivel, obs: obs.trim() });
          }, `C-SSRS salvo: ${NIVEIS_CSSRS[nivel].rotulo.toLowerCase()}`);
          setR(vazio);
          setObs("");
        }}
      >
        <label className="flex w-32 flex-col gap-1 text-[13px] font-medium text-slate-600">
          Mês
          <input type="number" min={0} required value={mes} onChange={(e) => setMes(e.target.value)} className={classeCampo} />
        </label>
        <p className="text-xs text-slate-500">As perguntas 1 a 5 se referem ao último mês. A 3, a 4 e a 5 só aparecem se a 2 for sim.</p>
        <div>
          <SimNao id="q1" pergunta={`1. ${PERGUNTAS_CSSRS.q1}`} valor={r.q1} onChange={(v) => setR({ ...r, q1: v })} />
          <SimNao id="q2" pergunta={`2. ${PERGUNTAS_CSSRS.q2}`} valor={r.q2} onChange={(v) => setR({ ...r, q2: v })} />
          {q2 ? (
            <>
              <SimNao id="q3" pergunta={`3. ${PERGUNTAS_CSSRS.q3}`} valor={r.q3} onChange={(v) => setR({ ...r, q3: v })} />
              <SimNao id="q4" pergunta={`4. ${PERGUNTAS_CSSRS.q4}`} valor={r.q4} onChange={(v) => setR({ ...r, q4: v })} />
              <SimNao id="q5" pergunta={`5. ${PERGUNTAS_CSSRS.q5}`} valor={r.q5} onChange={(v) => setR({ ...r, q5: v })} />
            </>
          ) : null}
          <SimNao id="q6" pergunta={`6. ${PERGUNTAS_CSSRS.q6}`} valor={r.q6} onChange={(v) => setR({ ...r, q6: v })} />
          {q6 ? <SimNao id="q6r" pergunta={PERGUNTAS_CSSRS.q6r} valor={r.q6r} onChange={(v) => setR({ ...r, q6r: v })} /> : null}
        </div>
        <CampoTexto rotulo="Observação" valor={obs} onChange={setObs} maxLength={120} placeholder="Sem nomes ou lugares" />
        <div className="sticky bottom-[88px] lg:bottom-0 flex items-center justify-between gap-3 border-t border-slate-100 bg-white pt-3">
          {nivel ? <Selo tom={TOM_RISCO[nivel]}>{NIVEIS_CSSRS[nivel].rotulo}</Selo> : <span className="text-sm text-slate-500">Responda as perguntas</span>}
          <Botao type="submit" variante="primario" disabled={!nivel || textoBloqueado(obs)}>
            Salvar C-SSRS
          </Botao>
        </div>
      </form>
    </Painel>
  );
}

function SecaoDoPlano({ secao, props }: { secao: (typeof SECOES_PLANO)[number]; props: PropsAba }) {
  const { paciente: p, atualizar } = props;
  const [novo, setNovo] = useState("");
  const itens = p.plano?.[secao.chave] ?? [];
  const sugestoes = sugestoesPlano(p, secao.chave as SecaoPlano);
  const adicionar = (valor: string) =>
    atualizar((x) => {
      if (!x.plano) return;
      x.plano[secao.chave].push(valor);
      x.plano.mes = x.atual;
    });
  return (
    <section className="min-w-0">
      <h4 className="text-sm font-semibold text-slate-900">{secao.titulo}</h4>
      {secao.descricao ? <p className="mt-0.5 text-xs text-slate-500">{secao.descricao}</p> : null}
      <ul className="mt-2">
        {itens.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-center justify-between gap-2 border-b border-slate-100 py-1.5 text-sm text-slate-800">
            <span className="min-w-0">{item}</span>
            <BotaoConfirmar
              onConfirmar={() =>
                atualizar((x) => {
                  x.plano?.[secao.chave].splice(i, 1);
                  if (x.plano) x.plano.mes = x.atual;
                })
              }
            />
          </li>
        ))}
      </ul>
      {sugestoes.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sugestoes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => adicionar(s)}
              className="rounded-full border border-dashed border-cyan-600 px-2.5 py-0.5 text-xs text-cyan-800 transition hover:bg-cyan-50"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="mt-2 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          const v = novo.trim();
          if (!v || textoBloqueado(v)) return;
          adicionar(v);
          setNovo("");
        }}
      >
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          maxLength={80}
          placeholder={secao.exemplo}
          aria-label={`Adicionar em ${secao.titulo}`}
          className={`${classeCampo} h-9`}
        />
        <Botao type="submit" pequeno className="h-9">Adicionar</Botao>
      </form>
      <AvisoPrivacidade texto={novo} />
    </section>
  );
}

function PlanoSeguranca(props: PropsAba) {
  const { paciente: p, atualizar, avisar } = props;
  const [motivo, setMotivo] = useState(p.plano?.motivo ?? "");
  if (!p.plano) {
    return (
      <Painel titulo="Plano de segurança">
        <p className="mb-3 text-sm leading-6 text-slate-600">
          Modelo de Stanley e Brown, construído junto com o paciente. O app sugere vínculos do ecomapa e medidas de restrição conforme a medicação em uso.
        </p>
        <Botao
          variante="primario"
          onClick={() =>
            atualizar((x) => {
              x.plano = { mes: x.atual, motivo: "", alerta: [], internas: [], distracao: [], ajuda: [], profissionais: [], meios: [] };
            }, "Plano de segurança criado")
          }
        >
          Criar plano de segurança
        </Botao>
      </Painel>
    );
  }
  const texto = textoPlanoSeguranca(p);
  return (
    <>
      <Painel
        titulo="Plano de segurança"
        acoes={
          <>
            <span className="text-xs text-slate-500">Revisado no mês {p.plano.mes}</span>
            <Botao pequeno onClick={() => atualizar((x) => { if (x.plano) x.plano.mes = x.atual; }, "Plano marcado como revisado")}>
              Marcar como revisado no mês {p.atual}
            </Botao>
          </>
        }
      >
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {SECOES_PLANO.map((s) => (
            <SecaoDoPlano key={s.chave} secao={s} props={props} />
          ))}
          <section className="md:col-span-2">
            <h4 className="text-sm font-semibold text-slate-900">O motivo mais importante para viver</h4>
            <form
              className="mt-2 flex gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (textoBloqueado(motivo)) return;
                atualizar((x) => {
                  if (!x.plano) return;
                  x.plano.motivo = motivo.trim();
                  x.plano.mes = x.atual;
                }, "Motivo salvo");
              }}
            >
              <input value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={100} placeholder="Nas palavras do paciente" className={`${classeCampo} h-9`} />
              <Botao type="submit" pequeno className="h-9">Salvar</Botao>
            </form>
            <AvisoPrivacidade texto={motivo} />
          </section>
        </div>
      </Painel>
      <Painel titulo="Cópia para o paciente">
        <p className="mb-2 text-xs text-slate-500">Nomes e telefones ficam em branco para preencher à mão, fora do app.</p>
        <textarea readOnly rows={12} value={texto} className={`${classeCampo} h-auto py-2 font-mono text-[13px] leading-6`} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Botao onClick={() => navigator.clipboard.writeText(texto).then(() => avisar("Texto copiado"), () => avisar("Selecione o texto e copie manualmente"))}>
            <Copy className="h-4 w-4" /> Copiar texto
          </Botao>
          <BotaoConfirmar onConfirmar={() => atualizar((x) => { x.plano = null; }, "Plano excluído")}>Excluir plano</BotaoConfirmar>
        </div>
      </Painel>
    </>
  );
}

export function AbaRisco(props: PropsAba) {
  const { paciente: p, atualizar } = props;
  const aplicacoes = porMes(p.cssrs);
  const u = ultimo(aplicacoes);
  const borda = u ? { alto: "border-l-rose-600", moderado: "border-l-amber-500", baixo: "border-l-amber-400", nenhum: "border-l-cyan-600" }[u.nivel] : "border-l-slate-200";
  return (
    <div className="space-y-5">
      <section className={`rounded-xl border border-l-[5px] border-slate-200 bg-white p-5 ${borda}`}>
        <h3 className="text-[15px] font-semibold text-slate-900">Situação atual</h3>
        {u ? (
          <>
            <p className="mt-2 flex flex-wrap items-center gap-2">
              <Selo tom={TOM_RISCO[u.nivel]}>{NIVEIS_CSSRS[u.nivel].rotulo}</Selo>
              <span className="text-xs text-slate-500">C-SSRS do mês {u.mes}{u.obs ? `. ${u.obs}` : ""}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{NIVEIS_CSSRS[u.nivel].conduta}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Nenhum C-SSRS aplicado ainda.</p>
        )}
        <p className="mt-2 text-xs text-slate-500">O C-SSRS é um instrumento de rastreio. A conduta é decisão clínica e segue o protocolo do seu serviço.</p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <FormCssrs {...props} />
        <Painel titulo="Aplicações">
          {aplicacoes.length ? (
            [...aplicacoes].reverse().map((c) => (
              <LinhaLista
                key={c.id}
                titulo={<Selo tom={TOM_RISCO[c.nivel]}>{NIVEIS_CSSRS[c.nivel].rotulo}</Selo>}
                detalhe={`Mês ${c.mes}${c.obs ? `. ${c.obs}` : ""}`}
                acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.cssrs = x.cssrs.filter((y) => y.id !== c.id); }, "Removido")} />}
              />
            ))
          ) : (
            <Vazio>Nenhuma aplicação ainda.</Vazio>
          )}
        </Painel>
      </div>

      <PlanoSeguranca {...props} />
    </div>
  );
}
