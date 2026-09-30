"use client";

import { useEffect, type ReactNode } from "react";
import { Copy } from "lucide-react";
import {
  ADESAO,
  EFEITOS_ADVERSOS,
  ESTADOS_HUMOR,
  EXAME_ESTADO_MENTAL,
  exameEstadoMentalSemAlteracoes,
  rotuloHumor,
  type Adesao,
} from "@/lib/psiquiatria/catalogos.ts";
import { alertas } from "@/lib/psiquiatria/alertas.ts";
import { NIVEIS_CSSRS } from "@/lib/psiquiatria/cssrs.ts";
import { resumoEscala } from "@/lib/psiquiatria/escalas.ts";
import { monitorizacao } from "@/lib/psiquiatria/monitorizacao.ts";
import { humorSugerido, novoRascunho, textoEvolucao, type RascunhoConsulta } from "@/lib/psiquiatria/textos.ts";
import { porMes, ultimo, unicos } from "@/lib/psiquiatria/util.ts";
import { novoId, type PropsAba } from "./contexto";
import { Botao, BotaoConfirmar, CampoTexto, Painel, Pilulas, Selo, Vazio, classeCampo, textoBloqueado } from "./ui";

function Passo({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <Painel
      titulo={
        <span className="flex items-center gap-2.5">
          <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-cyan-800 text-xs font-semibold text-white">{n}</span>
          {titulo}
        </span>
      }
    >
      {children}
    </Painel>
  );
}

export function AbaConsulta(props: PropsAba) {
  const { paciente: p, atualizar, rascunho, setRascunho, irPara, avisar, abrirEscala } = props;

  useEffect(() => {
    if (!rascunho) setRascunho(novoRascunho(p));
  }, [rascunho, setRascunho, p]);
  if (!rascunho) return null;

  const d = rascunho;
  const m = Number(d.mes);
  const set = (parcial: Partial<RascunhoConsulta>) => setRascunho({ ...d, ...parcial });
  const ultimaAnterior = ultimo(porMes(p.consultas).filter((c) => c.mes < m));
  const roteiro = unicos([
    ...(ultimaAnterior?.combinado ? [`Combinado no mês ${ultimaAnterior.mes}: ${ultimaAnterior.combinado}`] : []),
    ...alertas(p).map((a) => a.texto),
    ...monitorizacao(p).filter((x) => x.status === "proximo").map((x) => `${x.rotulo} previsto para o mês ${x.previsto}`),
  ]);
  const escalasDoMes = [
    ...p.escalas.filter((e) => e.mes === m).map(resumoEscala),
    ...p.cssrs.filter((c) => c.mes === m).map((c) => `C-SSRS: ${NIVEIS_CSSRS[c.nivel].rotulo.toLowerCase()}`),
  ];
  const sugestao = humorSugerido(p, m);
  const eemAnterior = [...p.consultas].filter((c) => c.eem && c.mes < m).sort((a, b) => b.mes - a.mes)[0];
  const bloqueado = textoBloqueado(d.relato, d.combinado, d.efeitoOutro, d.texto);

  const salvar = () => {
    if (bloqueado) return avisar("Há identificadores no texto. Remova-os antes de salvar.");
    const texto = d.texto || textoEvolucao(p, d);
    atualizar((x) => {
      const mesAnterior = ultimo(porMes(x.consultas).filter((c) => c.mes < m))?.mes;
      x.consultas.push({
        id: novoId(),
        mes: m,
        resumo: d.relato.trim(),
        combinado: d.combinado.trim(),
        adesao: d.adesao,
        efeitos: [...d.efeitos, ...(d.efeitoOutro.trim() ? [d.efeitoOutro.trim()] : [])],
        eem: d.eem,
        humor: d.humor,
        roteiro: Object.keys(d.roteiro).filter((k) => d.roteiro[k]),
        texto,
      });
      if (d.humor !== "") {
        x.humor.push({ id: novoId(), ini: mesAnterior != null ? Math.min(mesAnterior + 1, m) : m, fim: m, v: Number(d.humor) });
      }
      x.atual = Math.max(x.atual, m);
    }, `Consulta do mês ${m} salva`);
    setRascunho(null);
    irPara("resumo");
  };

  return (
    <div className="space-y-5">
      <Painel>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex w-40 flex-col gap-1 text-[13px] font-medium text-slate-600">
            Mês da consulta
            <input type="number" min={0} value={d.mes} onChange={(e) => set({ mes: Number(e.target.value) })} className={classeCampo} />
          </label>
          <p className="text-xs text-slate-500">O rascunho é salvo sozinho. Você pode ir a outras abas, aplicar escalas e voltar.</p>
        </div>
      </Painel>

      <Passo n={1} titulo="Roteiro de hoje">
        <p className="-mt-1 mb-2 text-xs text-slate-500">Montado a partir dos alertas, do último combinado e dos exames previstos. Marque o que foi abordado.</p>
        {roteiro.length ? (
          <div className="space-y-2">
            {roteiro.map((t) => (
              <label key={t} className="flex items-start gap-2.5 text-sm leading-6 text-slate-800">
                <input
                  type="checkbox"
                  checked={!!d.roteiro[t]}
                  onChange={(e) => set({ roteiro: { ...d.roteiro, [t]: e.target.checked } })}
                  className="mt-1.5 h-4 w-4 shrink-0 accent-cyan-800"
                />
                {t}
              </label>
            ))}
          </div>
        ) : (
          <Vazio>Nada pendente.</Vazio>
        )}
      </Passo>

      <Passo n={2} titulo="Escalas deste mês">
        {escalasDoMes.length ? (
          <ul className="mb-3 space-y-1 text-sm text-slate-800">{escalasDoMes.map((e) => <li key={e}>{e}</li>)}</ul>
        ) : (
          <p className="mb-3 text-sm text-slate-500">Nenhuma escala aplicada no mês {m}.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {["PHQ-9", "GAD-7", "YMRS", "MDQ"].map((t) => (
            <Botao key={t} pequeno onClick={() => abrirEscala?.(t)}>Aplicar {t}</Botao>
          ))}
          <Botao pequeno onClick={() => irPara("risco")}>Aplicar C-SSRS</Botao>
        </div>
      </Passo>

      <Passo n={3} titulo="Adesão e efeitos adversos">
        <Pilulas
          nome="adesao"
          opcoes={(Object.keys(ADESAO) as Adesao[]).map((k) => ({ valor: k, rotulo: `Adesão ${ADESAO[k].toLowerCase()}` }))}
          selecionadas={d.adesao ? [d.adesao] : []}
          onAlternar={(v) => set({ adesao: v as Adesao })}
        />
        <div className="mt-3">
          <Pilulas
            nome="efeitos"
            multiplo
            opcoes={EFEITOS_ADVERSOS.map((e) => ({ valor: e, rotulo: e }))}
            selecionadas={d.efeitos}
            onAlternar={(v) => set({ efeitos: d.efeitos.includes(v) ? d.efeitos.filter((x) => x !== v) : [...d.efeitos, v] })}
          />
        </div>
        <div className="mt-3 max-w-md">
          <CampoTexto rotulo="Outro efeito" valor={d.efeitoOutro} onChange={(v) => set({ efeitoOutro: v })} maxLength={60} />
        </div>
      </Passo>

      <Passo n={4} titulo="Exame do estado mental">
        <div className="-mt-1 mb-3 flex flex-wrap gap-2">
          <Botao pequeno onClick={() => set({ eem: exameEstadoMentalSemAlteracoes() })}>Marcar exame sem alterações</Botao>
          {eemAnterior ? (
            <Botao pequeno onClick={() => set({ eem: JSON.parse(JSON.stringify(eemAnterior.eem)) })}>Copiar do mês {eemAnterior.mes}</Botao>
          ) : null}
        </div>
        <div className="divide-y divide-slate-100">
          {EXAME_ESTADO_MENTAL.map(({ chave, rotulo, opcoes }) => {
            const atual = d.eem[chave] ?? [];
            const anterior = eemAnterior?.eem?.[chave] ?? [];
            const mudou = !!eemAnterior && atual.length > 0 && anterior.join() !== atual.join();
            return (
              <div key={chave} className="grid gap-2 py-2.5 md:grid-cols-[170px_1fr]">
                <span className="pt-1 text-sm font-medium text-slate-800">{rotulo}</span>
                <div>
                  <Pilulas
                    nome={`eem-${chave}`}
                    multiplo
                    opcoes={opcoes.map((o) => ({ valor: o, rotulo: o }))}
                    selecionadas={atual}
                    onAlternar={(v) =>
                      set({ eem: { ...d.eem, [chave]: atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v] } })
                    }
                  />
                  {eemAnterior ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      Mês {eemAnterior.mes}: {anterior.length ? anterior.join(", ") : "sem registro"}
                      {mudou ? <Selo tom="atencao">mudou</Selo> : null}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Passo>

      <Passo n={5} titulo="Humor no período">
        <p className="-mt-1 mb-2 text-xs text-slate-500">
          Alimenta o life chart desde a última consulta.
          {sugestao != null ? ` Sugestão pelas escalas deste mês: ${rotuloHumor(Number(sugestao)).toLowerCase()}.` : ""}
        </p>
        <Pilulas
          nome="humor"
          opcoes={ESTADOS_HUMOR.map((v) => ({ valor: String(v), rotulo: rotuloHumor(v) }))}
          selecionadas={d.humor !== "" ? [d.humor] : []}
          onAlternar={(v) => set({ humor: v })}
        />
      </Passo>

      <Passo n={6} titulo="Relato e conduta">
        <div className="space-y-3">
          <CampoTexto rotulo="Relato" valor={d.relato} onChange={(v) => set({ relato: v })} multilinha linhas={4} maxLength={1200} placeholder="Sem nomes, datas ou lugares" />
          <CampoTexto rotulo="Conduta e combinado para a próxima" valor={d.combinado} onChange={(v) => set({ combinado: v })} multilinha linhas={3} maxLength={500} />
        </div>
      </Passo>

      <Passo n={7} titulo="Evolução">
        <p className="-mt-1 mb-2 text-xs text-slate-500">Gere o texto, ajuste se quiser e copie para o prontuário oficial.</p>
        <CampoTexto rotulo="Texto da evolução" valor={d.texto} onChange={(v) => set({ texto: v })} multilinha linhas={14} placeholder="Clique em Gerar evolução" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Botao onClick={() => { set({ texto: textoEvolucao(p, d) }); avisar("Evolução gerada"); }}>Gerar evolução</Botao>
          <Botao
            onClick={() => {
              const texto = d.texto || textoEvolucao(p, d);
              if (!d.texto) set({ texto });
              navigator.clipboard.writeText(texto).then(() => avisar("Evolução copiada"), () => avisar("Selecione o texto e copie manualmente"));
            }}
          >
            <Copy className="h-4 w-4" /> Copiar evolução
          </Botao>
          <Botao variante="primario" disabled={bloqueado} onClick={salvar}>Salvar consulta</Botao>
          <BotaoConfirmar confirmar="Toque de novo para descartar" onConfirmar={() => { setRascunho(null); irPara("resumo"); avisar("Rascunho descartado"); }}>
            Descartar rascunho
          </BotaoConfirmar>
        </div>
      </Passo>
    </div>
  );
}
