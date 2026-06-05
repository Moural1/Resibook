"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "paciente" | "prescricao" | "exame" | "cid";
};

type PatientRow = {
  id: string;
  nome: string | null;
  especialidade: string | null;
  queixa: string | null;
};

type PrescriptionRow = {
  id: number;
  paciente_nome: string | null;
  medicamento: string | null;
};

type ExamRow = {
  id: number;
  titulo: string | null;
  categoria: string | null;
};

type CidRow = {
  id: number;
  codigo: string | null;
  descricao: string | null;
};

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function badgeLabel(type: SearchResult["type"]) {
  if (type === "paciente") return "Paciente";
  if (type === "prescricao") return "Prescrição";
  if (type === "exame") return "Exame";
  return "CID";
}

function badgeClass(type: SearchResult["type"]) {
  if (type === "paciente") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (type === "prescricao") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (type === "exame") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function Topbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const firstResult = useMemo(() => results[0], [results]);

  useEffect(() => {
    const q = query.trim();

    async function runSearch() {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const patientsPromise = supabase
        .from("patients")
        .select("id, nome, especialidade, queixa")
        .limit(8);

      const prescriptionsPromise = supabase
        .from("prescriptions")
        .select("id, paciente_nome, medicamento")
        .limit(8);

      const examsPromise = supabase
        .from("exam_templates")
        .select("id, titulo, categoria")
        .limit(8);

      const cidsPromise = supabase
        .from("cids")
        .select("id, codigo, descricao")
        .limit(8);

      const [patientsRes, prescriptionsRes, examsRes, cidsRes] =
        await Promise.all([
          patientsPromise,
          prescriptionsPromise,
          examsPromise,
          cidsPromise,
        ]);

      const normalizedQuery = normalize(q);

      const patientResults: SearchResult[] = ((patientsRes.data ||
        []) as PatientRow[])
        .filter((item) =>
          normalize(
            `${item.nome || ""} ${item.especialidade || ""} ${item.queixa || ""}`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `paciente-${item.id}`,
          title: item.nome || "Paciente sem nome",
          subtitle:
            item.especialidade || item.queixa || "Cadastro de paciente",
          href: "/pacientes",
          type: "paciente",
        }));

      const prescriptionResults: SearchResult[] = ((prescriptionsRes.data ||
        []) as PrescriptionRow[])
        .filter((item) =>
          normalize(
            `${item.medicamento || ""} ${item.paciente_nome || ""}`
          ).includes(normalizedQuery)
        )
        .map((item) => ({
          id: `prescricao-${item.id}`,
          title: item.medicamento || "Prescrição sem medicamento",
          subtitle: item.paciente_nome || "Prescrição clínica",
          href: "/prescricao",
          type: "prescricao",
        }));

      const examResults: SearchResult[] = ((examsRes.data || []) as ExamRow[])
        .filter((item) =>
          normalize(`${item.titulo || ""} ${item.categoria || ""}`).includes(
            normalizedQuery
          )
        )
        .map((item) => ({
          id: `exame-${item.id}`,
          title: item.titulo || "Bloco sem título",
          subtitle: item.categoria || "Exames e evolução",
          href: "/exames-evolucao",
          type: "exame",
        }));

      const cidResults: SearchResult[] = ((cidsRes.data || []) as CidRow[])
        .filter((item) =>
          normalize(`${item.codigo || ""} ${item.descricao || ""}`).includes(
            normalizedQuery
          )
        )
        .map((item) => ({
          id: `cid-${item.id}`,
          title: item.codigo || "CID",
          subtitle: item.descricao || "Consulta CID",
          href: "/cids",
          type: "cid",
        }));

      const merged = [
        ...patientResults,
        ...prescriptionResults,
        ...examResults,
        ...cidResults,
      ].slice(0, 10);

      setResults(merged);
      setLoading(false);
    }

    const timer = window.setTimeout(() => {
      runSearch();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="relative flex items-center gap-3 px-4 py-4 md:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }

              if (e.key === "Enter" && firstResult) {
                window.location.href = firstResult.href;
              }
            }}
            placeholder="Buscar pacientes, prescrições, exames, CIDs..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />

          {open && query.trim() ? (
            <div className="absolute left-4 right-4 top-[76px] z-50 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl md:left-6 md:right-6 lg:left-8 lg:right-8">
              {loading ? (
                <div className="rounded-2xl px-4 py-6 text-sm text-slate-500">
                  Buscando...
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-2xl px-4 py-6 text-sm text-slate-500">
                  Nenhum resultado encontrado.
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.subtitle}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                            item.type
                          )}`}
                        >
                          {badgeLabel(item.type)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {open && query.trim() ? (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 md:inline-flex"
          >
            Fechar
          </button>
        ) : null}
      </div>
    </header>
  );
}