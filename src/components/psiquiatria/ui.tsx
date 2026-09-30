"use client";

// Peças visuais do módulo de psiquiatria. Linguagem sóbria: painéis planos,
// bordas finas, pouca sombra e cor só onde carrega significado clínico.

import { useEffect, useId, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { ROTULO_NIVEL_ALERTA } from "@/lib/psiquiatria/alertas.ts";
import { REFERENCIAS } from "@/lib/psiquiatria/catalogos.ts";
import {
  MENSAGENS_PRIVACIDADE,
  verificarTextoLivre,
  type ProblemaPrivacidade,
} from "@/lib/psiquiatria/privacidade.ts";
import type { Alerta } from "@/lib/psiquiatria/tipos.ts";

export function Painel({
  titulo,
  acoes,
  children,
  className = "",
}: {
  titulo?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      {titulo || acoes ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {titulo ? <h3 className="text-[15px] font-semibold text-slate-900">{titulo}</h3> : <span />}
          {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export type TomSelo = "neutro" | "ok" | "atencao" | "risco" | "forte-atencao" | "forte-risco";

const TONS: Record<TomSelo, string> = {
  neutro: "border-slate-200 bg-slate-50 text-slate-700",
  ok: "border-cyan-100 bg-cyan-50 text-cyan-900",
  atencao: "border-amber-200 bg-amber-50 text-amber-900",
  risco: "border-rose-200 bg-rose-50 text-rose-800",
  "forte-atencao": "border-amber-600 bg-amber-600 text-white",
  "forte-risco": "border-rose-700 bg-rose-700 text-white",
};

export function Selo({ tom = "neutro", children }: { tom?: TomSelo; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONS[tom]}`}>
      {children}
    </span>
  );
}

type Variante = "primario" | "secundario" | "perigo" | "fantasma";
const VARIANTES: Record<Variante, string> = {
  primario: "border-cyan-800 bg-cyan-800 text-white hover:bg-cyan-900",
  secundario: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
  perigo: "border-slate-200 bg-white text-rose-700 hover:border-rose-200 hover:bg-rose-50",
  fantasma: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

export function Botao({
  variante = "secundario",
  pequeno = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; pequeno?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        pequeno ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
      } ${VARIANTES[variante]} ${className}`}
    />
  );
}

const CLASSE_ALERTA: Record<Alerta["nivel"], string> = {
  alto: "border-l-rose-600 bg-rose-50/70",
  atencao: "border-l-amber-500 bg-amber-50/60",
  info: "border-l-cyan-600 bg-cyan-50/50",
};

export function CartaoAlerta({ alerta, onAcao }: { alerta: Alerta; onAcao?: () => void }) {
  const referencia = alerta.porque.referencia ? REFERENCIAS[alerta.porque.referencia] : null;
  return (
    <div className={`rounded-r-lg border-l-4 px-3.5 py-2.5 ${CLASSE_ALERTA[alerta.nivel]}`}>
      <p className="text-[11px] font-semibold text-slate-500">{ROTULO_NIVEL_ALERTA[alerta.nivel]}</p>
      <p className="mt-0.5 text-sm leading-6 text-slate-900">{alerta.texto}</p>
      {alerta.acao === "risco" && onAcao ? (
        <Botao pequeno className="mt-2" onClick={onAcao}>
          Abrir avaliação de risco
        </Botao>
      ) : null}
      <details className="group mt-1.5 text-[13px]">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-slate-500 hover:text-slate-800">
          Por quê?
          <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
        </summary>
        <p className="mt-1 leading-6 text-slate-700">{alerta.porque.explicacao}</p>
        <p className="mt-0.5 italic text-slate-500">
          {referencia ?? "Racional clínico geral, sem uma referência única."}
        </p>
      </details>
    </div>
  );
}

/* ---------- campos de formulário ---------- */

export const classeCampo =
  "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-100";

export function Rotulo({ texto, children }: { texto: ReactNode; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[13px] font-medium text-slate-600">
      {texto}
      {children}
    </label>
  );
}

/** Problemas que impedem salvar (identificador direto). Datas e nomes só avisam. */
export function problemasBloqueantes(problemas: ProblemaPrivacidade[]) {
  return problemas.filter((p) => p !== "data_real" && p !== "possivel_nome");
}

export function AvisoPrivacidade({ texto }: { texto: string }) {
  const problemas = verificarTextoLivre(texto);
  if (!problemas.length) return null;
  const bloqueia = problemasBloqueantes(problemas).length > 0;
  return (
    <p
      role={bloqueia ? "alert" : "status"}
      className={`mt-1 flex items-start gap-1.5 text-xs leading-5 ${bloqueia ? "text-rose-700" : "text-amber-800"}`}
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {problemas.map((p) => MENSAGENS_PRIVACIDADE[p]).join(" ")}
        {bloqueia ? " Remova para salvar." : ""}
      </span>
    </p>
  );
}

export function textoBloqueado(...textos: string[]) {
  return textos.some((t) => problemasBloqueantes(verificarTextoLivre(t)).length > 0);
}

export function CampoTexto({
  rotulo,
  valor,
  onChange,
  multilinha = false,
  linhas = 3,
  ...props
}: {
  rotulo: ReactNode;
  valor: string;
  onChange: (valor: string) => void;
  multilinha?: boolean;
  linhas?: number;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-slate-600">
        {rotulo}
      </label>
      {multilinha ? (
        <textarea
          id={id}
          rows={linhas}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={`${classeCampo} h-auto py-2 leading-6`}
          {...props}
        />
      ) : (
        <input id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={classeCampo} {...props} />
      )}
      <AvisoPrivacidade texto={valor} />
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

export function LinhaLista({
  titulo,
  detalhe,
  acoes,
}: {
  titulo: ReactNode;
  detalhe?: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900">{titulo}</div>
        {detalhe ? <div className="mt-0.5 text-[13px] leading-5 text-slate-500">{detalhe}</div> : null}
      </div>
      {acoes ? <div className="flex shrink-0 gap-1.5">{acoes}</div> : null}
    </div>
  );
}

/** Botão de exclusão com confirmação em dois toques. */
export function BotaoConfirmar({
  onConfirmar,
  children = "Remover",
  confirmar = "Toque de novo para confirmar",
}: {
  onConfirmar: () => void;
  children?: ReactNode;
  confirmar?: string;
}) {
  const [armado, setArmado] = useState(false);
  useEffect(() => {
    if (!armado) return;
    const t = window.setTimeout(() => setArmado(false), 3500);
    return () => window.clearTimeout(t);
  }, [armado]);
  return (
    <Botao
      pequeno
      variante="perigo"
      onClick={() => {
        if (armado) {
          setArmado(false);
          onConfirmar();
        } else {
          setArmado(true);
        }
      }}
    >
      {armado ? confirmar : children}
    </Botao>
  );
}

/** Grupo de escolhas no formato de pílulas (radio ou checkbox). */
export function Pilulas({
  opcoes,
  selecionadas,
  onAlternar,
  multiplo = false,
  nome,
}: {
  opcoes: readonly { valor: string; rotulo: string }[];
  selecionadas: readonly string[];
  onAlternar: (valor: string) => void;
  multiplo?: boolean;
  nome: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role={multiplo ? "group" : "radiogroup"}>
      {opcoes.map((o) => {
        const ativo = selecionadas.includes(o.valor);
        return (
          <label key={o.valor} className="cursor-pointer">
            <input
              type={multiplo ? "checkbox" : "radio"}
              name={nome}
              value={o.valor}
              checked={ativo}
              onChange={() => onAlternar(o.valor)}
              className="peer sr-only"
            />
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[13px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 ${
                ativo ? "border-cyan-800 bg-cyan-800 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
              }`}
            >
              {o.rotulo}
            </span>
          </label>
        );
      })}
    </div>
  );
}
