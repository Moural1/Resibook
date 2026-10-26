"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Pencil, Search, Stethoscope, X } from "lucide-react";
import {
  CLINICAL_CASE_SESSION_EVENT,
  clearClinicalCaseSession,
  formatCaseVitals,
  formatClinicalCaseAge,
  loadClinicalCaseSession,
  saveClinicalCaseSession,
  type ClinicalCaseSession,
} from "@/lib/clinical-case-session";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import { etapasDoCaso, leituraDoCaso, prioridadeFinal, valoresParaCalculadoras } from "@/lib/shift/caso";
import { queixaShift } from "@/lib/shift/queixas";
import { PRIORIDADES } from "@/lib/shift/triagem";
import EtapasCaso from "./etapas-caso";
import KitQueixa from "./kit-queixa";
import { COR_PRIORIDADE, NOME_COR } from "./prioridade";

function ComecarCaso() {
  const router = useRouter();
  const [queixa, setQueixa] = useState("");

  function abrir(texto: string) {
    const limpo = texto.trim();
    router.push(limpo ? `/caso-rapido?q=${encodeURIComponent(limpo)}` : "/caso-rapido");
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Novo atendimento</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Qual é a queixa?</h2>
      <p className="mt-1 text-sm text-slate-500">Comece pela queixa: a prioridade, os sinais de alarme e o kit se montam a partir dela.</p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          abrir(queixa);
        }}
      >
        <label className="relative block flex-1">
          <span className="sr-only">Queixa principal</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={queixa}
            onChange={(event) => setQueixa(event.target.value)}
            placeholder="Ex.: dor torácica, febre, dispneia…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white transition hover:bg-cyan-900">
          Começar caso
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_COMPLAINTS.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => abrir(item.title)}
            className="h-8 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition hover:border-cyan-700/40 hover:bg-white"
          >
            {item.title}
          </button>
        ))}
      </div>
    </section>
  );
}

function CasoAtivo({ caso }: { caso: ClinicalCaseSession }) {
  const leitura = useMemo(() => leituraDoCaso(caso), [caso]);
  const etapas = useMemo(() => etapasDoCaso(caso), [caso]);
  const prioridade = prioridadeFinal(leitura.prioridade, caso.prioridadeManual);
  const cor = prioridade ? COR_PRIORIDADE[prioridade] : null;
  const vitais = formatCaseVitals(caso);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5 ${cor ? cor.faixa : "bg-slate-100 text-slate-700"}`}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold opacity-90">Caso ativo · {formatClinicalCaseAge(caso)}</p>
              <p className="truncate text-xl font-semibold">{caso.complaint}</p>
            </div>
          </div>
          <p className="text-sm font-semibold">
            {prioridade ? `${NOME_COR[prioridade]} · ${PRIORIDADES[prioridade].rotulo}` : "Prioridade a definir"}
          </p>
        </div>

        <div className="space-y-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1 text-sm text-slate-600">
              <p>{[caso.age, caso.sex].filter(Boolean).join(" · ") || "Idade e sexo não informados"}</p>
              {vitais ? <p className="text-slate-700">{vitais}</p> : <p>Sinais vitais ainda não preenchidos.</p>}
              {leitura.news2 || leitura.qsofa ? (
                <p className="text-xs text-slate-500">
                  {[
                    leitura.news2 ? `NEWS2 ${leitura.news2.pontos}${leitura.news2.completo ? "" : " (parcial)"}` : "",
                    leitura.qsofa ? `qSOFA ${leitura.qsofa.pontos}` : "",
                    leitura.indiceChoque !== null ? `IC ${leitura.indiceChoque.toFixed(2).replace(".", ",")}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Link href="/caso-rapido" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300">
                <Pencil className="h-3.5 w-3.5" />
                Editar caso
              </Link>
              <button
                type="button"
                onClick={clearClinicalCaseSession}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-3.5 w-3.5" />
                Encerrar
              </button>
            </div>
          </div>

          {leitura.alertas.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {leitura.alertas.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${COR_PRIORIDADE[item.nivel].borda} ${COR_PRIORIDADE[item.nivel].fundo} ${COR_PRIORIDADE[item.nivel].texto}`}
                >
                  <span className={`h-2 w-2 rounded-full ${COR_PRIORIDADE[item.nivel].ponto}`} aria-hidden="true" />
                  {item.titulo}
                </li>
              ))}
            </ul>
          ) : null}

          <EtapasCaso etapas={etapas} />
        </div>
      </section>

      <KitQueixa
        queixa={queixaShift(caso.complaint)}
        titulo={caso.complaint}
        valores={valoresParaCalculadoras(caso, leitura)}
        pediatrico={leitura.faixaEtaria === "pediatrico"}
        condutaDefinida={Boolean(caso.condutaDefinida)}
        onCondutaDefinida={(valor) => saveClinicalCaseSession({ ...caso, condutaDefinida: valor })}
      />
    </div>
  );
}

/* Topo da Central: o caso ativo com etapas e kit, ou o início de um caso novo. */
export default function CentralCaso() {
  const [caso, setCaso] = useState<ClinicalCaseSession | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    function atualizar() {
      setCaso(loadClinicalCaseSession());
      setPronto(true);
    }
    atualizar();
    window.addEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
    return () => window.removeEventListener(CLINICAL_CASE_SESSION_EVENT, atualizar);
  }, []);

  if (!pronto) return <div className="h-48 animate-pulse rounded-[24px] border border-slate-200 bg-white" aria-hidden="true" />;
  return caso?.complaint ? <CasoAtivo caso={caso} /> : <ComecarCaso />;
}
