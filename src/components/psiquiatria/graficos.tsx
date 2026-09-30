"use client";

// Gráficos longitudinais em SVG: linha do tempo, life chart e minigráficos.

import {
  CLASSES_MEDICACAO,
  ESTADOS_HUMOR,
  FAIXAS_REFERENCIA,
  UNIDADES_EXAME,
  rotuloHumor,
  type ClasseMedicacao,
  type Exame,
} from "@/lib/psiquiatria/catalogos.ts";
import { NIVEIS_CSSRS } from "@/lib/psiquiatria/cssrs.ts";
import type { NivelRiscoCssrs, PacientePsiquiatria } from "@/lib/psiquiatria/tipos.ts";
import { formatarNumero, humorNoMes, porMes, unicos } from "@/lib/psiquiatria/util.ts";

export const COR = {
  tinta: "#1e293b",
  suave: "#64748b",
  linha: "#e2e8f0",
  fundo: "#ffffff",
  destaque: "#0e7490",
  destaqueSuave: "#cffafe",
  atencao: "#b45309",
  atencaoSuave: "#fef3c7",
  risco: "#be123c",
  riscoSuave: "#ffe4e6",
};

const COR_CLASSE: Record<ClasseMedicacao, string> = {
  antidepressivo: "#7b68c2",
  triciclico: "#7b68c2",
  litio: "#c4862a",
  valproato: "#c4862a",
  lamotrigina: "#c4862a",
  antipsicotico: "#3c84c0",
  clozapina: "#3c84c0",
  benzodiazepinico: "#8a96a3",
  outro: "#4a9a8f",
};

const COR_RISCO: Record<NivelRiscoCssrs, { fill: string; stroke: string }> = {
  nenhum: { fill: COR.fundo, stroke: COR.destaque },
  baixo: { fill: COR.atencaoSuave, stroke: COR.atencao },
  moderado: { fill: COR.atencao, stroke: COR.atencao },
  alto: { fill: COR.risco, stroke: COR.risco },
};

const encurtar = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const txt = { fontSize: 12, fill: COR.suave } as const;

function Legenda({ itens }: { itens: Array<{ amostra: React.ReactNode; rotulo: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
      {itens.map((i) => (
        <span key={i.rotulo} className="inline-flex items-center gap-1.5">
          {i.amostra}
          {i.rotulo}
        </span>
      ))}
    </div>
  );
}
const traco = (cor: string, estilo: "solid" | "dashed" = "solid", largura = 2.5) => (
  <i className="inline-block w-5" style={{ borderTop: `${largura}px ${estilo} ${cor}` }} />
);
const barra = (cor: string) => <i className="inline-block h-2.5 w-4 rounded" style={{ background: cor }} />;

/* ---------- linha do tempo ---------- */

export function LinhaDoTempo({ paciente: p }: { paciente: PacientePsiquiatria }) {
  const phq = porMes(p.escalas.filter((e) => e.tipo === "PHQ-9"));
  const gad = porMes(p.escalas.filter((e) => e.tipo === "GAD-7"));
  const meds = [...p.meds].sort((a, b) => a.inicio - b.inicio);
  const eventos = porMes(p.eventos.filter((e) => e.mes >= 0));
  const maxM = Math.max(
    6,
    p.atual,
    ...p.escalas.map((e) => e.mes),
    ...p.eventos.map((e) => e.mes),
    ...p.consultas.map((c) => c.mes),
    ...p.cssrs.map((c) => c.mes),
    ...p.meds.map((m) => m.fim ?? m.inicio)
  );
  const W = 900, L = 205, R = 40, T = 30, CH = 170;
  const EY = T + CH + 44, RY = EY + 38, MY = RY + 38, RH = 28;
  const H = MY + Math.max(1, meds.length) * RH + 30;
  const X = (m: number) => L + (m / maxM) * (W - L - R);
  const Y = (v: number) => T + CH - (v / 27) * CH;
  const passo = maxM <= 18 ? 1 : maxM <= 36 ? 3 : 6;
  const meses: number[] = [];
  for (let m = 0; m <= maxM; m += passo) meses.push(m);

  const serie = (lista: typeof phq, tracejado: boolean, abaixo: boolean) =>
    lista.length ? (
      <g>
        <path
          d={lista.map((e, i) => `${i ? "L" : "M"}${X(e.mes)},${Y(e.total)}`).join(" ")}
          fill="none"
          stroke={COR.tinta}
          strokeWidth={tracejado ? 2 : 2.5}
          strokeDasharray={tracejado ? "7 5" : undefined}
          strokeLinejoin="round"
        />
        {lista.map((e) => (
          <g key={e.id}>
            <circle cx={X(e.mes)} cy={Y(e.total)} r={5} fill={COR.fundo} stroke={COR.tinta} strokeWidth={tracejado ? 2 : 2.5}>
              <title>{`${e.tipo} ${e.total} no mês ${e.mes}`}</title>
            </circle>
            <text
              x={X(e.mes)}
              y={Y(e.total) + (abaixo ? 20 : -11)}
              textAnchor="middle"
              fontSize={12}
              fontWeight={tracejado ? 400 : 700}
              fill={tracejado ? COR.suave : COR.tinta}
            >
              {e.total}
            </text>
          </g>
        ))}
      </g>
    ) : null;

  const classesUsadas = unicos(p.meds.map((m) => m.classe));
  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[640px]" role="img" aria-label="Linha do tempo com escalas, eventos, risco e medicações">
          {[0, 5, 10, 15, 20, 25].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke={COR.linha} />
              <text x={L - 10} y={Y(v) + 4} textAnchor="end" {...txt}>{v}</text>
            </g>
          ))}
          {meses.map((m) => (
            <g key={m}>
              <line x1={X(m)} x2={X(m)} y1={T} y2={H - 24} stroke={COR.linha} opacity={0.5} />
              <text x={X(m)} y={H - 6} textAnchor="middle" {...txt}>M{m}</text>
            </g>
          ))}
          <text x={L - 10} y={EY + 4} textAnchor="end" {...txt}>Eventos</text>
          {p.consultas.map((c) => (
            <circle key={c.id} cx={X(c.mes)} cy={H - 24} r={4} fill={COR.destaque}>
              <title>{`Consulta no mês ${c.mes}`}</title>
            </circle>
          ))}
          <line x1={X(p.atual)} x2={X(p.atual)} y1={T - 8} y2={H - 24} stroke={COR.destaque} strokeWidth={2} strokeDasharray="4 4" />
          <text x={X(p.atual)} y={T - 14} textAnchor="middle" fontSize={12} fontWeight={700} fill={COR.destaque}>agora</text>
          {serie(gad, true, true)}
          {serie(phq, false, false)}
          {!phq.length && !gad.length ? (
            <text x={L + 12} y={T + CH / 2} {...txt}>Nenhuma escala aplicada ainda</text>
          ) : null}
          {eventos.map((e, i) => {
            const x = X(e.mes);
            const direita = x > W - 190;
            return (
              <g key={e.id}>
                <path d={`M${x},${EY - 7} L${x + 7},${EY} L${x},${EY + 7} L${x - 7},${EY} Z`} fill={COR.atencao}>
                  <title>{`${e.desc} (mês ${e.mes})`}</title>
                </path>
                <text x={direita ? x - 11 : x + 11} y={EY + (i % 2 ? 15 : -4)} textAnchor={direita ? "end" : "start"} fontSize={12} fill={COR.tinta}>
                  {encurtar(e.desc, 24)}
                </text>
              </g>
            );
          })}
          <text x={L - 10} y={RY + 4} textAnchor="end" {...txt}>Risco (C-SSRS)</text>
          {porMes(p.cssrs).map((c) => (
            <circle key={c.id} cx={X(c.mes)} cy={RY} r={7} strokeWidth={2} fill={COR_RISCO[c.nivel].fill} stroke={COR_RISCO[c.nivel].stroke}>
              <title>{`C-SSRS no mês ${c.mes}: ${NIVEIS_CSSRS[c.nivel].rotulo}`}</title>
            </circle>
          ))}
          {meds.map((m, i) => {
            const y = MY + i * RH;
            const x1 = X(m.inicio);
            let x2 = X(m.fim == null ? p.atual : m.fim);
            if (x2 - x1 < 10) x2 = x1 + 10;
            const cor = COR_CLASSE[m.classe];
            return (
              <g key={m.id}>
                <text x={L - 10} y={y + 4} textAnchor="end" fontSize={12.5} fill={COR.tinta}>
                  {encurtar(`${m.nome} ${m.dose}`, 27)}
                </text>
                <rect x={x1} y={y - 7} width={x2 - x1} height={14} rx={7} fill={cor} opacity={m.fim == null ? 1 : 0.55}>
                  <title>{`${m.nome} ${m.dose}, mês ${m.inicio} a ${m.fim == null ? "hoje" : `mês ${m.fim}`}`}</title>
                </rect>
                {m.fim == null ? <path d={`M${x2 + 3},${y - 7} L${x2 + 12},${y} L${x2 + 3},${y + 7} Z`} fill={cor} /> : null}
              </g>
            );
          })}
          {!meds.length ? <text x={L + 12} y={MY + 4} {...txt}>Nenhuma medicação registrada</text> : null}
        </svg>
      </div>
      <Legenda
        itens={[
          { amostra: traco(COR.tinta), rotulo: "PHQ-9 (humor)" },
          { amostra: traco(COR.tinta, "dashed", 2), rotulo: "GAD-7 (ansiedade)" },
          { amostra: <i className="inline-block h-2.5 w-2.5 rotate-45" style={{ background: COR.atencao }} />, rotulo: "Evento de vida" },
          { amostra: <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COR.destaque }} />, rotulo: "Consulta" },
          { amostra: <i className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: COR.atencao, background: COR.atencaoSuave }} />, rotulo: "C-SSRS (cor pelo nível de risco)" },
          ...classesUsadas.map((c) => ({ amostra: barra(COR_CLASSE[c]), rotulo: CLASSES_MEDICACAO[c].rotulo })),
        ]}
      />
    </div>
  );
}

/* ---------- life chart ---------- */

export function LifeChart({ paciente: p }: { paciente: PacientePsiquiatria }) {
  const meds = [...p.meds].sort((a, b) => a.inicio - b.inicio);
  const minM = Math.min(0, ...p.humor.map((x) => x.ini), ...p.eventos.map((e) => e.mes));
  const maxM = Math.max(6, p.atual, ...p.humor.map((x) => x.fim), ...p.meds.map((m) => m.fim ?? m.inicio));
  const W = 900, L = 168, R = 30, T = 26, U = 22;
  const BY = T + 3 * U, EY = BY + 3 * U + 30, MY = EY + 34, RH = 26;
  const HH = MY + Math.max(1, meds.length) * RH + 26;
  const cw = (W - L - R) / (maxM - minM + 1);
  const X = (m: number) => L + (m - minM) * cw;
  const passo = maxM - minM <= 12 ? 1 : maxM - minM <= 36 ? 3 : 6;
  const meses: number[] = [];
  for (let m = minM; m <= maxM; m++) meses.push(m);
  const corAlta = COR_CLASSE.litio;
  const corBaixa = COR_CLASSE.antidepressivo;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${HH}`} className="block h-auto w-full min-w-[640px]" role="img" aria-label="Life chart do humor">
          {ESTADOS_HUMOR.map((v) => {
            const y = BY - v * U;
            return (
              <g key={v}>
                {v !== 0 ? <line x1={L} x2={W - R} y1={y} y2={y} stroke={COR.linha} opacity={0.6} /> : null}
                <text x={L - 10} y={y + 4} textAnchor="end" {...txt}>{rotuloHumor(v)}</text>
              </g>
            );
          })}
          {meses.map((m) => {
            const v = humorNoMes(p, m);
            return (
              <g key={m}>
                {m % passo === 0 ? <text x={X(m) + cw / 2} y={HH - 6} textAnchor="middle" {...txt}>M{m}</text> : null}
                {v == null ? null : v === 0 ? (
                  <rect x={X(m) + 1} y={BY - 2} width={Math.max(cw - 2, 2)} height={4} fill={COR.suave}>
                    <title>{`Mês ${m}: eutimia`}</title>
                  </rect>
                ) : (
                  <rect x={X(m) + 1} y={v > 0 ? BY - v * U : BY} width={Math.max(cw - 2, 2)} height={Math.abs(v) * U} fill={v > 0 ? corAlta : corBaixa}>
                    <title>{`Mês ${m}: ${rotuloHumor(v)}`}</title>
                  </rect>
                )}
              </g>
            );
          })}
          <line x1={L} x2={W - R} y1={BY} y2={BY} stroke={COR.tinta} strokeWidth={1.5} />
          <line x1={X(0)} x2={X(0)} y1={T - 10} y2={HH - 22} stroke={COR.destaque} strokeWidth={2} strokeDasharray="4 4" />
          <text x={X(0) + 5} y={T - 12} {...txt}>início do seguimento</text>
          <text x={L - 10} y={EY + 4} textAnchor="end" {...txt}>Eventos</text>
          {porMes(p.eventos).map((e, i) => {
            const x = X(e.mes) + cw / 2;
            const direita = x > W - 190;
            return (
              <g key={e.id}>
                <path d={`M${x},${EY - 6} L${x + 6},${EY} L${x},${EY + 6} L${x - 6},${EY} Z`} fill={COR.atencao}>
                  <title>{`${e.desc} (mês ${e.mes})`}</title>
                </path>
                {cw >= 60 ? (
                  <text x={direita ? x - 10 : x + 10} y={EY + (i % 2 ? 14 : -3)} textAnchor={direita ? "end" : "start"} fontSize={12} fill={COR.tinta}>
                    {encurtar(e.desc, 22)}
                  </text>
                ) : null}
              </g>
            );
          })}
          {meds.map((m, i) => {
            const y = MY + i * RH;
            const x1 = X(m.inicio);
            const x2 = X(m.fim ?? p.atual) + cw;
            return (
              <g key={m.id}>
                <text x={L - 10} y={y + 4} textAnchor="end" fontSize={12.5} fill={COR.tinta}>{encurtar(`${m.nome} ${m.dose}`, 22)}</text>
                <rect x={x1 + 1} y={y - 6} width={Math.max(x2 - x1 - 2, 6)} height={12} rx={6} fill={COR_CLASSE[m.classe]} opacity={m.fim == null ? 1 : 0.55}>
                  <title>{`${m.nome} ${m.dose}`}</title>
                </rect>
              </g>
            );
          })}
          {!p.humor.length ? <text x={L + 12} y={BY - 8} {...txt}>Nenhum período de humor registrado</text> : null}
        </svg>
      </div>
      <Legenda
        itens={[
          { amostra: barra(corAlta), rotulo: "Acima da linha: hipomania ou mania" },
          { amostra: barra(corBaixa), rotulo: "Abaixo: depressão" },
          { amostra: <i className="inline-block h-1 w-4 rounded" style={{ background: COR.suave }} />, rotulo: "Eutimia" },
          { amostra: null, rotulo: "Altura: gravidade" },
        ]}
      />
    </div>
  );
}

/* ---------- minigráficos de exames ---------- */

export function MiniGraficosExames({ paciente: p }: { paciente: PacientePsiquiatria }) {
  const nomes = unicos(p.exames.filter((e) => e.valor != null).map((e) => e.nome));
  const graficos = nomes
    .map((nome) => {
      const pts = porMes(p.exames.filter((e) => e.nome === nome && e.valor != null));
      if (pts.length < 2) return null;
      const W = 300, H = 130, L = 40, R = 14, T = 16, B = 24;
      const vs = pts.map((e) => e.valor as number);
      let lo = Math.min(...vs);
      let hi = Math.max(...vs);
      const faixa = FAIXAS_REFERENCIA[nome as Exame];
      if (faixa) {
        lo = Math.min(lo, faixa[0]);
        hi = Math.max(hi, faixa[1]);
      }
      const pad = (hi - lo) * 0.2 || Math.abs(hi) * 0.1 || 1;
      lo -= pad;
      hi += pad;
      const m0 = pts[0].mes;
      const m1 = Math.max(pts[pts.length - 1].mes, m0 + 1);
      const X = (m: number) => L + ((m - m0) / (m1 - m0)) * (W - L - R);
      const Y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);
      return (
        <div key={nome}>
          <p className="text-sm font-medium text-slate-900">
            {nome} <span className="font-normal text-slate-500">{UNIDADES_EXAME[nome]}</span>
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-auto w-full" role="img" aria-label={`${nome} ao longo do tempo`}>
            {faixa ? (
              <rect x={L} y={Y(faixa[1])} width={W - L - R} height={Y(faixa[0]) - Y(faixa[1])} fill={COR.destaqueSuave} opacity={0.6}>
                <title>Faixa de referência</title>
              </rect>
            ) : null}
            <path d={pts.map((e, i) => `${i ? "L" : "M"}${X(e.mes)},${Y(e.valor as number)}`).join(" ")} fill="none" stroke={COR.destaque} strokeWidth={2.5} />
            {pts.map((e) => (
              <g key={e.id}>
                <circle cx={X(e.mes)} cy={Y(e.valor as number)} r={4} fill={COR.fundo} stroke={COR.destaque} strokeWidth={2} />
                <text x={X(e.mes)} y={Y(e.valor as number) - 9} textAnchor="middle" fontSize={11} fontWeight={700} fill={COR.tinta}>
                  {formatarNumero(e.valor as number)}
                </text>
              </g>
            ))}
            <text x={L} y={H - 6} fontSize={11} fill={COR.suave}>M{m0}</text>
            <text x={W - R} y={H - 6} textAnchor="end" fontSize={11} fill={COR.suave}>M{pts[pts.length - 1].mes}</text>
          </svg>
        </div>
      );
    })
    .filter(Boolean);
  if (!graficos.length) return null;
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{graficos}</div>;
}
