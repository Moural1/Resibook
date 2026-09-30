"use client";

// Genograma e ecomapa. Familiares aparecem só pelo parentesco.

import {
  CONDICOES_FAMILIARES,
  PARENTESCOS,
  QUALIDADES_VINCULO,
  RELACOES_FAMILIARES,
  type Parentesco,
  type RelacaoFamiliar,
  type Sexo,
} from "@/lib/psiquiatria/catalogos.ts";
import type { Familiar, PacientePsiquiatria, Vinculo } from "@/lib/psiquiatria/tipos.ts";
import { COR } from "./graficos";

type Ponto = { x: number; y: number };

/** Curva quadrática; em zigue-zague para relações conflituosas. */
function curva(a: Ponto, c: Ponto, b: Ponto, zigue: boolean) {
  if (!zigue) return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const N = Math.max(8, Math.round(len / 9));
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const mt = 1 - t;
    const x = mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x;
    const y = mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y;
    const dx = 2 * mt * (c.x - a.x) + 2 * t * (b.x - c.x);
    const dy = 2 * mt * (c.y - a.y) + 2 * t * (b.y - c.y);
    const l = Math.hypot(dx, dy) || 1;
    const off = i === 0 || i === N ? 0 : i % 2 ? 5 : -5;
    d += `${i ? "L" : "M"}${(x - (dy / l) * off).toFixed(1)},${(y + (dx / l) * off).toFixed(1)} `;
  }
  return d;
}

function Forma({ x, y, sexo, r, ...props }: { x: number; y: number; sexo: Sexo | "M" | "F"; r: number } & React.SVGProps<SVGElement>) {
  const p = props as React.SVGProps<SVGRectElement & SVGCircleElement & SVGPathElement>;
  if (sexo === "M") return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} {...p} />;
  if (sexo === "F") return <circle cx={x} cy={y} r={r} {...p} />;
  return <path d={`M${x},${y - r - 3} L${x + r + 3},${y} L${x},${y + r + 3} L${x - r - 3},${y} Z`} {...p} />;
}

const ESTILO_RELACAO: Record<Exclude<RelacaoFamiliar, "neutra">, React.SVGProps<SVGPathElement>> = {
  proxima: { stroke: COR.destaque, strokeWidth: 3 },
  distante: { stroke: COR.suave, strokeWidth: 2, strokeDasharray: "7 6" },
  conflituosa: { stroke: COR.risco, strokeWidth: 2 },
  rompida: { stroke: COR.suave, strokeWidth: 3, strokeDasharray: "1 7" },
};

type No = { chave: string; rel: Parentesco | "paciente"; x: number; y: number; dado: Familiar | null; sexo: Sexo | "M" | "F" };

export function Genograma({ paciente: p }: { paciente: PacientePsiquiatria }) {
  const G = (r: Parentesco) => p.geno.filter((g) => g.rel === r);
  const nos: No[] = [];
  const linhas: React.ReactNode[] = [];
  const Y = { a: 70, b: 200, c: 340, d: 480 };
  let k = 0;
  const no = (rel: No["rel"], x: number, y: number, dado: Familiar | null): No => {
    const n: No = { chave: `n${k++}`, rel, x, y, dado, sexo: rel === "paciente" ? p.sexo : PARENTESCOS[rel].sexo };
    nos.push(n);
    return n;
  };
  const linha = (x1: number, y1: number, x2: number, y2: number) =>
    linhas.push(<line key={`l${linhas.length}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COR.tinta} strokeWidth={1.6} />);
  const casal = (a: No, b: No, separados: boolean) => {
    const l = Math.min(a.x, b.x);
    const r = Math.max(a.x, b.x);
    linha(l + 20, a.y, r - 20, a.y);
    if (separados) {
      const m = (l + r) / 2;
      linha(m - 9, a.y + 9, m - 1, a.y - 9);
      linha(m + 1, a.y + 9, m + 9, a.y - 9);
    }
  };
  const familia = (a: No, b: No | null, filhos: No[]) => {
    if (!filhos.length) return;
    const mx = b ? (a.x + b.x) / 2 : a.x;
    const y0 = b ? a.y : a.y + 24;
    const barra = filhos[0].y - 58;
    const xs = [mx, ...filhos.map((f) => f.x)];
    linha(mx, y0, mx, barra);
    linha(Math.min(...xs), barra, Math.max(...xs), barra);
    for (const f of filhos) linha(f.x, barra, f.x, f.y - (f.rel === "paciente" ? 26 : 20));
  };

  const pac = no("paciente", 0, Y.c, null);
  const irmaos = [...G("irmao"), ...G("irma")].map((g, i) => no(g.rel, -120 * (i + 1), Y.c, g));
  const conjuge = G("conjuge_m")[0] ?? G("conjuge_f")[0];
  const cj = conjuge ? no(conjuge.rel, 130, Y.c, conjuge) : null;
  const filhosD = [...G("filho"), ...G("filha")];
  const km = cj ? 65 : 0;
  const filhos = filhosD.map((g, i) => no(g.rel, km + (i - (filhosD.length - 1) / 2) * 115, Y.d, g));
  const gm = Math.min(0, ...irmaos.map((n) => n.x)) / 2;
  const pai = no("pai", gm - 120, Y.b, G("pai")[0] ?? null);
  const mae = no("mae", gm + 120, Y.b, G("mae")[0] ?? null);
  const tiosP = [...G("tio_pat"), ...G("tia_pat")].map((g, i) => no(g.rel, pai.x - 115 * (i + 1), Y.b, g));
  const tiosM = [...G("tio_mat"), ...G("tia_mat")].map((g, i) => no(g.rel, mae.x + 115 * (i + 1), Y.b, g));
  casal(pai, mae, false);
  familia(pai, mae, [pac, ...irmaos]);
  if (cj && conjuge) casal(pac, cj, conjuge.rela === "rompida");
  familia(pac, cj, filhos);
  const avos = (m: Parentesco, f: Parentesco, filhosDe: No[]) => {
    const xs = filhosDe.map((n) => n.x);
    const meio = (Math.min(...xs) + Math.max(...xs)) / 2;
    const a = no(m, meio - 62, Y.a, G(m)[0] ?? null);
    const b = no(f, meio + 62, Y.a, G(f)[0] ?? null);
    casal(a, b, false);
    familia(a, b, filhosDe);
  };
  if (G("avo_pat_m").length || G("avo_pat_f").length || tiosP.length) avos("avo_pat_m", "avo_pat_f", [...tiosP.reverse(), pai]);
  if (G("avo_mat_m").length || G("avo_mat_f").length || tiosM.length) avos("avo_mat_m", "avo_mat_f", [mae, ...tiosM]);

  const xs = nos.map((n) => n.x);
  const ys = nos.map((n) => n.y);
  const minX = Math.min(...xs) - 80, maxX = Math.max(...xs) + 80, minY = Math.min(...ys) - 45, maxY = Math.max(...ys) + 80;

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className="block h-auto w-full min-w-[560px]" role="img" aria-label="Genograma">
      {linhas}
      {nos
        .filter((n) => n.dado && n.dado.rela !== "neutra")
        .map((n) => {
          const dx = n.x - pac.x, dy = n.y - pac.y, l = Math.hypot(dx, dy) || 1;
          const c = { x: (pac.x + n.x) / 2 + (-dy / l) * 32, y: (pac.y + n.y) / 2 + (dx / l) * 32 };
          const rela = n.dado!.rela as Exclude<RelacaoFamiliar, "neutra">;
          return (
            <path key={`e${n.chave}`} d={curva(pac, c, n, rela === "conflituosa")} fill="none" strokeLinecap="round" {...ESTILO_RELACAO[rela]}>
              <title>{`Relação ${RELACOES_FAMILIARES[rela].toLowerCase()} com ${PARENTESCOS[n.rel as Parentesco].rotulo.toLowerCase()}`}</title>
            </path>
          );
        })}
      {nos.map((n) => {
        const semDados = !n.dado && n.rel !== "paciente";
        const conds = (n.dado?.conds ?? []).filter((c) => c in CONDICOES_FAMILIARES);
        const larguras = conds.map((c) => CONDICOES_FAMILIARES[c].sigla.length * 7 + 10);
        const totalL = larguras.reduce((a, b) => a + b, 0) + Math.max(0, conds.length - 1) * 3;
        let cx = n.x - totalL / 2;
        return (
          <g key={n.chave}>
            {n.rel === "paciente" ? <Forma x={n.x} y={n.y} sexo={n.sexo} r={26} fill="none" stroke={COR.tinta} strokeWidth={2} /> : null}
            <Forma
              x={n.x}
              y={n.y}
              sexo={n.sexo}
              r={19}
              fill={semDados ? "#f8fafc" : COR.fundo}
              stroke={semDados ? COR.suave : COR.tinta}
              strokeWidth={2}
              strokeDasharray={semDados ? "4 3" : undefined}
            />
            {semDados ? <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={14} fill={COR.suave}>?</text> : null}
            {n.dado?.morto ? (
              <g stroke={COR.tinta} strokeWidth={2}>
                <line x1={n.x - 16} y1={n.y - 16} x2={n.x + 16} y2={n.y + 16} />
                <line x1={n.x + 16} y1={n.y - 16} x2={n.x - 16} y2={n.y + 16} />
              </g>
            ) : null}
            <text x={n.x} y={n.y + (n.rel === "paciente" ? 44 : 38)} textAnchor="middle" fontSize={13} fill={semDados ? COR.suave : COR.tinta}>
              {n.rel === "paciente" ? "Paciente" : PARENTESCOS[n.rel].curto}
            </text>
            {conds.map((c, i) => {
              const risco = CONDICOES_FAMILIARES[c].risco;
              const x = cx;
              cx += larguras[i] + 3;
              return (
                <g key={c}>
                  <rect x={x} y={n.y + 46} width={larguras[i]} height={16} rx={8} fill={risco ? COR.riscoSuave : COR.destaqueSuave} />
                  <text x={x + larguras[i] / 2} y={n.y + 58} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={risco ? COR.risco : COR.tinta}>
                    {CONDICOES_FAMILIARES[c].sigla}
                  </text>
                  <title>{CONDICOES_FAMILIARES[c].rotulo}</title>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function LegendaGenograma() {
  return (
    <div className="mt-3 space-y-1.5 text-xs text-slate-500">
      <p>Quadrado homem, círculo mulher, X falecido, contorno duplo paciente, tracejado sem dados, barras duplas separação.</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {(Object.keys(ESTILO_RELACAO) as Array<keyof typeof ESTILO_RELACAO>).map((r) => (
          <span key={r} className="inline-flex items-center gap-1.5">
            <svg width="22" height="8" aria-hidden>
              <line x1="1" y1="4" x2="21" y2="4" stroke={ESTILO_RELACAO[r].stroke} strokeWidth={ESTILO_RELACAO[r].strokeWidth} strokeDasharray={ESTILO_RELACAO[r].strokeDasharray} />
            </svg>
            {RELACOES_FAMILIARES[r]}
            {r === "conflituosa" ? " (zigue-zague)" : ""}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {Object.values(CONDICOES_FAMILIARES).map((c) => (
          <span key={c.sigla} className="inline-flex items-center gap-1">
            <span className={`rounded-full px-1.5 text-[10px] font-bold ${c.risco ? "bg-rose-100 text-rose-700" : "bg-cyan-50 text-slate-800"}`}>{c.sigla}</span>
            {c.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- ecomapa ---------- */

const ESTILO_VINCULO: Record<Vinculo["v"], React.SVGProps<SVGPathElement>> = {
  forte: { stroke: COR.destaque, strokeWidth: 5 },
  moderado: { stroke: COR.destaque, strokeWidth: 2.2 },
  fraco: { stroke: COR.suave, strokeWidth: 2, strokeDasharray: "6 6" },
  conflituoso: { stroke: COR.risco, strokeWidth: 2.2 },
};

function quebrar(t: string, n: number) {
  const palavras = t.split(/\s+/);
  const linhas = [""];
  for (const w of palavras) {
    const atual = linhas[linhas.length - 1];
    if (`${atual} ${w}`.trim().length > n && atual) linhas.push(w);
    else linhas[linhas.length - 1] = `${atual} ${w}`.trim();
  }
  if (linhas.length > 2) {
    const resto = linhas.slice(1).join(" ");
    return [linhas[0], resto.length > n ? `${resto.slice(0, n - 1)}…` : resto];
  }
  return linhas;
}

export function Ecomapa({ paciente: p }: { paciente: PacientePsiquiatria }) {
  const n = p.eco.length;
  const R = 180;
  const pontos = p.eco.map((e, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    return { e, x: R * Math.cos(a), y: R * Math.sin(a) };
  });
  return (
    <div>
      <svg viewBox="-290 -265 580 530" className="mx-auto block h-auto w-full max-w-[560px]" role="img" aria-label="Ecomapa">
        {pontos.map((q) => (
          <path key={`l${q.e.id}`} d={curva({ x: 0, y: 0 }, { x: q.x / 2, y: q.y / 2 }, q, q.e.v === "conflituoso")} fill="none" strokeLinecap="round" {...ESTILO_VINCULO[q.e.v]} />
        ))}
        <circle r={54} fill={COR.destaque} />
        <text y={-2} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">Paciente</text>
        <text y={18} textAnchor="middle" fontSize={13} fill="#fff">{p.code}</text>
        {pontos.map((q) => {
          const ls = quebrar(q.e.nome, 12);
          return (
            <g key={q.e.id}>
              <circle cx={q.x} cy={q.y} r={46} fill={COR.fundo} stroke={COR.linha} strokeWidth={1.5}>
                <title>{`${q.e.nome}: vínculo ${QUALIDADES_VINCULO[q.e.v].toLowerCase()}`}</title>
              </circle>
              {ls.map((l, i) => (
                <text key={i} x={q.x} y={q.y + 5 + (i - (ls.length - 1) / 2) * 16} textAnchor="middle" fontSize={13} fill={COR.tinta}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
        {!n ? <text y={110} textAnchor="middle" fontSize={13} fill={COR.suave}>Adicione vínculos abaixo</text> : null}
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {(Object.keys(ESTILO_VINCULO) as Array<Vinculo["v"]>).map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5">
            <svg width="22" height="8" aria-hidden>
              <line x1="1" y1="4" x2="21" y2="4" stroke={ESTILO_VINCULO[v].stroke} strokeWidth={Math.min(Number(ESTILO_VINCULO[v].strokeWidth), 4)} strokeDasharray={ESTILO_VINCULO[v].strokeDasharray} />
            </svg>
            {QUALIDADES_VINCULO[v]}
            {v === "conflituoso" ? " (zigue-zague)" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
