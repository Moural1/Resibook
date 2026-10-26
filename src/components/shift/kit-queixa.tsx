import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, Calculator, CheckCircle2, ClipboardList, Search, Tags, Workflow } from "lucide-react";
import { hrefCalculadora, hrefFluxo, type QueixaShift, type ValoresCaso } from "@/lib/shift/queixas";

function busca(path: string, termo: string, param = "q") {
  return `${path}?${param}=${encodeURIComponent(termo)}`;
}

function Grupo({ titulo, icone: Icone, children }: { titulo: string; icone: typeof Search; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Icone className="h-3.5 w-3.5" aria-hidden="true" />
        {titulo}
      </p>
      <div className="mt-2 grid gap-2">{children}</div>
    </div>
  );
}

function Item({ href, titulo, detalhe }: { href: string; titulo: string; detalhe?: string }) {
  return (
    <Link href={href} className="group flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-cyan-700/40 hover:bg-cyan-50/40">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">{titulo}</span>
        {detalhe ? <span className="block text-xs leading-5 text-slate-500">{detalhe}</span> : null}
      </span>
      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-700" aria-hidden="true" />
    </Link>
  );
}

/* Tudo o que o Resibook tem para a queixa, já filtrado e com os dados do caso. */
export default function KitQueixa({
  queixa,
  titulo,
  valores,
  pediatrico,
  condutaDefinida,
  onCondutaDefinida,
}: {
  queixa: QueixaShift | null;
  titulo: string;
  valores: ValoresCaso;
  pediatrico: boolean;
  condutaDefinida: boolean;
  onCondutaDefinida: (valor: boolean) => void;
}) {
  const termos = queixa?.busca ?? { conduta: titulo, prescricao: titulo, cid: titulo };
  const calculadoras = (queixa?.calculadoras ?? []).filter((calc) => !(pediatrico && calc.adulto));

  return (
    <section id="kit-queixa" aria-label="Kit da queixa" className="scroll-mt-24 rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-800">Kit da queixa</p>
          <h2 className="mt-0.5 text-lg font-semibold text-slate-950">{titulo || "Escolha a queixa"}</h2>
          <p className="text-xs text-slate-500">Conduta, cálculos, fluxogramas, prescrição e CID já filtrados pelo caso.</p>
        </div>
        <button
          type="button"
          onClick={() => onCondutaDefinida(!condutaDefinida)}
          aria-pressed={condutaDefinida}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
            condutaDefinida ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {condutaDefinida ? "Conduta definida" : "Marcar conduta definida"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Grupo titulo="Conduta e prescrição" icone={ClipboardList}>
          <Item href={busca("/condutas", termos.conduta, "busca")} titulo="Conduta" detalhe={`Protocolos para ${termos.conduta}`} />
          <Item href={busca("/prescricao", termos.prescricao)} titulo="Modelos de prescrição" detalhe="Copiar e adaptar" />
          <Item href={busca("/plantao/prescricao-guiada", titulo)} titulo="Plano guiado" detalhe="Sintomáticos, segurança e reavaliação" />
          <Item href={busca("/cids", termos.cid)} titulo="CID" detalhe={`Códigos para ${termos.cid}`} />
        </Grupo>

        <div className="space-y-4">
          {calculadoras.length ? (
            <Grupo titulo="Calculadoras com os dados do caso" icone={Calculator}>
              {calculadoras.map((calc) => (
                <Item key={calc.id} href={hrefCalculadora(calc, valores)} titulo={calc.nome} detalhe={calc.motivo} />
              ))}
            </Grupo>
          ) : null}

          {queixa?.fluxos.length ? (
            <Grupo titulo="Fluxogramas" icone={Workflow}>
              {queixa.fluxos.map((fluxo) => (
                <Item
                  key={hrefFluxo(fluxo) + fluxo.titulo}
                  href={hrefFluxo(fluxo)}
                  titulo={fluxo.titulo}
                  detalhe={fluxo.colecao === "enamed" ? "Dossiê ENAMED" : "Temas por área"}
                />
              ))}
            </Grupo>
          ) : (
            <Grupo titulo="Estudo" icone={BookOpenCheck}>
              <Item href="/fluxos" titulo="Fluxogramas" detalhe="Algoritmos por tema e Dossiê ENAMED" />
            </Grupo>
          )}
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Tags className="h-3 w-3" aria-hidden="true" />
        As calculadoras abrem preenchidas com o que já foi digitado; confira antes de usar o resultado.
      </p>
    </section>
  );
}
