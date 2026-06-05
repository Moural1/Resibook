"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Patient = {
  id: string;
  nome: string;
  idade?: number | null;
  sexo?: string | null;
  telefone?: string | null;
  especialidade?: string | null;
  queixa?: string | null;
  created_at?: string | null;
};

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function PacientesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sexo, setSexo] = useState(searchParams.get("sexo") || "");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) {
        setPatients([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar pacientes:", error.message);
        setPatients([]);
      } else {
        setPatients((data as Patient[]) || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (sexo) params.set("sexo", sexo);

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [query, sexo, pathname, router]);

  const sexos = useMemo(() => {
    return Array.from(
      new Set(patients.map((item) => item.sexo).filter(Boolean))
    ) as string[];
  }, [patients]);

  const filtered = useMemo(() => {
    return patients.filter((item) => {
      const matchesQuery =
        !query ||
        normalize(item.nome).includes(normalize(query)) ||
        normalize(item.especialidade).includes(normalize(query)) ||
        normalize(item.queixa).includes(normalize(query)) ||
        normalize(item.telefone).includes(normalize(query));

      const matchesSexo = !sexo || item.sexo === sexo;

      return matchesQuery && matchesSexo;
    });
  }, [patients, query, sexo]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Pacientes
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Busca instantânea
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Pacientes
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Pesquisa em tempo real por nome, queixa, especialidade ou telefone.
          </p>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {loading ? "Carregando..." : `Total carregado do banco: ${patients.length}`}
          </p>
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente, queixa, especialidade, telefone..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              <option value="">— todos os sexos —</option>
              {sexos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSexo("");
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-600">
          {loading ? "Carregando resultados..." : `${filtered.length} resultado(s).`}
        </p>
      </section>

      {loading ? (
        <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Carregando pacientes...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
          Nenhum paciente encontrado.
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.nome}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.especialidade || "Sem especialidade"}{" "}
                      {item.sexo ? `• ${item.sexo}` : ""}
                      {typeof item.idade === "number" ? ` • ${item.idade} anos` : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Queixa:</span>{" "}
                    {item.queixa || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-900">Telefone:</span>{" "}
                    {item.telefone || "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}