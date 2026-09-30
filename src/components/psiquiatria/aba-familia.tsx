"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import {
  CONDICOES_FAMILIARES,
  ESTADOS_HUMOR,
  PARENTESCOS,
  PARENTESCOS_UNICOS,
  QUALIDADES_VINCULO,
  RELACOES_FAMILIARES,
  rotuloHumor,
  type CondicaoFamiliar,
  type Parentesco,
  type QualidadeVinculo,
  type RelacaoFamiliar,
} from "@/lib/psiquiatria/catalogos.ts";
import { QUADRANTES, formulacaoAutomatica } from "@/lib/psiquiatria/formulacao.ts";
import { textoFormulacao } from "@/lib/psiquiatria/textos.ts";
import { porMes } from "@/lib/psiquiatria/util.ts";
import { novoId, type PropsAba } from "./contexto";
import { Ecomapa, Genograma, LegendaGenograma } from "./familia-svg";
import { LifeChart, LinhaDoTempo } from "./graficos";
import {
  AvisoPrivacidade,
  Botao,
  BotaoConfirmar,
  CampoTexto,
  LinhaLista,
  Painel,
  Rotulo,
  Selo,
  Vazio,
  classeCampo,
  textoBloqueado,
} from "./ui";

/* ---------- linha do tempo e life chart ---------- */

export function AbaTempo({ paciente: p, atualizar, avisar }: PropsAba) {
  const [ini, setIni] = useState(String(p.atual));
  const [fim, setFim] = useState(String(p.atual));
  const [estado, setEstado] = useState("0");
  const [mesEvento, setMesEvento] = useState(String(p.atual));
  const [desc, setDesc] = useState("");

  return (
    <div className="space-y-5">
      <Painel titulo="Escalas, eventos e medicações">
        <LinhaDoTempo paciente={p} />
      </Painel>
      <Painel titulo="Life chart do humor">
        <LifeChart paciente={p} />
      </Painel>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Painel titulo="Registrar período de humor">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (Number(fim) < Number(ini)) return avisar("O mês final não pode ser antes do inicial");
                atualizar((x) => {
                  x.humor.push({ id: novoId(), ini: Number(ini), fim: Number(fim), v: Number(estado) });
                }, "Período adicionado");
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <Rotulo texto="Do mês"><input type="number" required value={ini} onChange={(e) => setIni(e.target.value)} className={classeCampo} /></Rotulo>
                <Rotulo texto="Até o mês"><input type="number" required value={fim} onChange={(e) => setFim(e.target.value)} className={classeCampo} /></Rotulo>
              </div>
              <Rotulo texto="Estado">
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className={classeCampo}>
                  {ESTADOS_HUMOR.map((v) => (
                    <option key={v} value={String(v)}>{rotuloHumor(v)}</option>
                  ))}
                </select>
              </Rotulo>
              <p className="text-xs text-slate-500">Use meses negativos para episódios anteriores ao seguimento (ex.: -18). A consulta de hoje registra o período sozinha.</p>
              <Botao type="submit" variante="primario">Adicionar período</Botao>
            </form>
          </Painel>
          <Painel titulo="Registrar evento de vida">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!desc.trim() || textoBloqueado(desc)) return;
                atualizar((x) => {
                  x.eventos.push({ id: novoId(), mes: Number(mesEvento), desc: desc.trim() });
                }, "Evento adicionado");
                setDesc("");
              }}
            >
              <Rotulo texto="Mês"><input type="number" required value={mesEvento} onChange={(e) => setMesEvento(e.target.value)} className={`${classeCampo} w-32`} /></Rotulo>
              <CampoTexto rotulo="O que aconteceu" valor={desc} onChange={setDesc} maxLength={60} required placeholder="Ex.: Luto, separação, mudança de casa" />
              <p className="text-xs text-slate-500">Meses negativos entram na formulação como fatores predisponentes.</p>
              <Botao type="submit" variante="primario">Adicionar evento</Botao>
            </form>
          </Painel>
        </div>
        <div className="space-y-5">
          <Painel titulo="Períodos de humor">
            {p.humor.length ? (
              [...p.humor].sort((a, b) => a.ini - b.ini).map((x) => (
                <LinhaLista
                  key={x.id}
                  titulo={rotuloHumor(x.v)}
                  detalhe={`Mês ${x.ini}${x.fim !== x.ini ? ` a ${x.fim}` : ""}`}
                  acoes={<BotaoConfirmar onConfirmar={() => atualizar((y) => { y.humor = y.humor.filter((z) => z.id !== x.id); }, "Removido")} />}
                />
              ))
            ) : (
              <Vazio>Nenhum período ainda.</Vazio>
            )}
          </Painel>
          <Painel titulo="Eventos registrados">
            {p.eventos.length ? (
              porMes(p.eventos).map((e) => (
                <LinhaLista
                  key={e.id}
                  titulo={e.desc}
                  detalhe={`Mês ${e.mes}`}
                  acoes={<BotaoConfirmar onConfirmar={() => atualizar((y) => { y.eventos = y.eventos.filter((z) => z.id !== e.id); }, "Removido")} />}
                />
              ))
            ) : (
              <Vazio>Nenhum evento ainda.</Vazio>
            )}
          </Painel>
        </div>
      </div>
    </div>
  );
}

/* ---------- genograma ---------- */

export function AbaGenograma({ paciente: p, atualizar, avisar }: PropsAba) {
  const [rel, setRel] = useState<Parentesco>("pai");
  const [rela, setRela] = useState<RelacaoFamiliar>("neutra");
  const [morto, setMorto] = useState(false);
  const [conds, setConds] = useState<CondicaoFamiliar[]>([]);

  return (
    <div className="space-y-5">
      <Painel titulo="Genograma">
        <div className="overflow-x-auto">
          <Genograma paciente={p} />
        </div>
        <LegendaGenograma />
      </Painel>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Painel titulo="Adicionar familiar">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (PARENTESCOS_UNICOS.includes(rel) && p.geno.some((g) => g.rel === rel)) return avisar(`${PARENTESCOS[rel].rotulo} já está no genograma`);
              if (rel.startsWith("conjuge") && p.geno.some((g) => g.rel.startsWith("conjuge"))) return avisar("Já existe um cônjuge registrado");
              atualizar((x) => {
                x.geno.push({ id: novoId(), rel, rela, morto, conds });
              }, "Familiar adicionado");
              setMorto(false);
              setConds([]);
            }}
          >
            <p className="text-xs text-slate-500">Use só o parentesco, nunca o nome.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Rotulo texto="Parentesco">
                <select value={rel} onChange={(e) => setRel(e.target.value as Parentesco)} className={classeCampo}>
                  {Object.entries(PARENTESCOS).map(([k, v]) => (
                    <option key={k} value={k}>{v.rotulo}</option>
                  ))}
                </select>
              </Rotulo>
              <Rotulo texto="Relação com o paciente">
                <select value={rela} onChange={(e) => setRela(e.target.value as RelacaoFamiliar)} className={classeCampo}>
                  {Object.entries(RELACOES_FAMILIARES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Rotulo>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" checked={morto} onChange={(e) => setMorto(e.target.checked)} className="h-4 w-4 accent-cyan-800" /> Falecido(a)
            </label>
            <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {(Object.keys(CONDICOES_FAMILIARES) as CondicaoFamiliar[]).map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={conds.includes(c)}
                    onChange={(e) => setConds(e.target.checked ? [...conds, c] : conds.filter((x) => x !== c))}
                    className="h-4 w-4 accent-cyan-800"
                  />
                  {CONDICOES_FAMILIARES[c].rotulo}
                </label>
              ))}
            </div>
            <Botao type="submit" variante="primario">Adicionar familiar</Botao>
          </form>
        </Painel>
        <Painel titulo="Familiares registrados">
          {p.geno.length ? (
            p.geno.map((g) => (
              <LinhaLista
                key={g.id}
                titulo={`${PARENTESCOS[g.rel].rotulo}${g.morto ? " (falecido)" : ""}`}
                detalhe={
                  <span className="inline-flex flex-wrap items-center gap-1">
                    {g.conds.map((c) => (
                      <Selo key={c} tom={CONDICOES_FAMILIARES[c].risco ? "risco" : "ok"}>{CONDICOES_FAMILIARES[c].sigla}</Selo>
                    ))}
                    Relação {RELACOES_FAMILIARES[g.rela].toLowerCase()}
                  </span>
                }
                acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.geno = x.geno.filter((y) => y.id !== g.id); }, "Removido")} />}
              />
            ))
          ) : (
            <Vazio>Nenhum familiar ainda.</Vazio>
          )}
        </Painel>
      </div>
    </div>
  );
}

/* ---------- ecomapa ---------- */

export function AbaEcomapa({ paciente: p, atualizar }: PropsAba) {
  const [nome, setNome] = useState("");
  const [v, setV] = useState<QualidadeVinculo>("moderado");
  return (
    <div className="space-y-5">
      <Painel titulo="Ecomapa">
        <Ecomapa paciente={p} />
      </Painel>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Painel titulo="Adicionar vínculo">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nome.trim() || textoBloqueado(nome)) return;
              atualizar((x) => {
                x.eco.push({ id: novoId(), nome: nome.trim(), v });
              }, "Vínculo adicionado");
              setNome("");
            }}
          >
            <CampoTexto rotulo="Vínculo" valor={nome} onChange={setNome} maxLength={30} required placeholder="Ex.: Mãe, Trabalho, Igreja, CAPS" />
            <Rotulo texto="Qualidade">
              <select value={v} onChange={(e) => setV(e.target.value as QualidadeVinculo)} className={classeCampo}>
                {Object.entries(QUALIDADES_VINCULO).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </Rotulo>
            <Botao type="submit" variante="primario">Adicionar vínculo</Botao>
          </form>
        </Painel>
        <Painel titulo="Vínculos registrados">
          {p.eco.length ? (
            p.eco.map((e) => (
              <LinhaLista
                key={e.id}
                titulo={e.nome}
                detalhe={QUALIDADES_VINCULO[e.v]}
                acoes={<BotaoConfirmar onConfirmar={() => atualizar((x) => { x.eco = x.eco.filter((y) => y.id !== e.id); }, "Removido")} />}
              />
            ))
          ) : (
            <Vazio>Nenhum vínculo ainda.</Vazio>
          )}
        </Painel>
      </div>
    </div>
  );
}

/* ---------- formulação ---------- */

function AdicionarFator({ onAdicionar, titulo }: { onAdicionar: (v: string) => void; titulo: string }) {
  const [v, setV] = useState("");
  return (
    <>
      <form
        className="mt-3 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!v.trim() || textoBloqueado(v)) return;
          onAdicionar(v.trim());
          setV("");
        }}
      >
        <input value={v} onChange={(e) => setV(e.target.value)} maxLength={120} placeholder="Adicionar fator" aria-label={`Adicionar em ${titulo}`} className={`${classeCampo} h-9`} />
        <Botao type="submit" pequeno className="h-9">Adicionar</Botao>
      </form>
      <AvisoPrivacidade texto={v} />
    </>
  );
}

export function AbaFormulacao({ paciente: p, atualizar, avisar }: PropsAba) {
  const auto = formulacaoAutomatica(p);
  const [sintese, setSintese] = useState(p.form.sintese);
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        Rascunho montado a partir do genograma, do ecomapa, dos eventos, do life chart e do plano de segurança. Descarte o que não fizer sentido e complete.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {QUADRANTES.map(({ chave, titulo, descricao }) => {
          const visiveis = auto[chave].filter((x) => !p.form.off.includes(x.chave));
          const descartados = auto[chave].length - visiveis.length;
          return (
            <Painel key={chave} titulo={titulo}>
              <p className="-mt-2 mb-2 text-xs text-slate-500">{descricao}</p>
              {visiveis.map((x) => (
                <LinhaLista
                  key={x.chave}
                  titulo={<span className="font-normal">{x.texto}</span>}
                  detalhe={`Do ${x.origem}`}
                  acoes={<Botao pequeno onClick={() => atualizar((y) => { y.form.off.push(x.chave); })}>Descartar</Botao>}
                />
              ))}
              {p.form[chave].map((x, i) => (
                <LinhaLista
                  key={`m${i}`}
                  titulo={<span className="font-normal">{x}</span>}
                  detalhe="Adicionado por você"
                  acoes={<BotaoConfirmar onConfirmar={() => atualizar((y) => { y.form[chave].splice(i, 1); })} />}
                />
              ))}
              {!visiveis.length && !p.form[chave].length ? <Vazio>Nada ainda.</Vazio> : null}
              {descartados ? (
                <Botao
                  pequeno
                  className="mt-2"
                  onClick={() => {
                    const chaves = auto[chave].map((x) => x.chave);
                    atualizar((y) => { y.form.off = y.form.off.filter((k) => !chaves.includes(k)); });
                  }}
                >
                  Restaurar {descartados} descartado{descartados > 1 ? "s" : ""}
                </Botao>
              ) : null}
              <AdicionarFator titulo={titulo} onAdicionar={(v) => atualizar((y) => { y.form[chave].push(v); })} />
            </Painel>
          );
        })}
      </div>
      <Painel titulo="Síntese">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (textoBloqueado(sintese)) return;
            atualizar((y) => { y.form.sintese = sintese.trim(); }, "Síntese salva");
          }}
        >
          <CampoTexto rotulo="Como os fatores se conectam" valor={sintese} onChange={setSintese} multilinha linhas={4} maxLength={1000} />
          <div className="flex flex-wrap gap-2">
            <Botao type="submit" variante="primario">Salvar síntese</Botao>
            <Botao
              onClick={() =>
                navigator.clipboard.writeText(textoFormulacao(p)).then(
                  () => avisar("Formulação copiada"),
                  () => avisar("Não foi possível copiar")
                )
              }
            >
              <Copy className="h-4 w-4" /> Copiar formulação
            </Botao>
          </div>
        </form>
      </Painel>
      {p.form.off.length ? <p className="text-xs text-slate-400"><Selo>{p.form.off.length}</Selo> itens automáticos descartados no total.</p> : null}
    </div>
  );
}
