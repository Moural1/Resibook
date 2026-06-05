"use client";

import { useMemo, useState } from "react";
import SearchInput from "./search-input";
import { includesSearch } from "../lib/search";

type Patient = {
  id: string;
  nome: string;
  idade: number | null;
  sexo: string | null;
  especialidade: string | null;
  queixa: string | null;
  observacoes: string | null;
  diagnostico_principal: string | null;
  medicamentos_em_uso: string | null;
  retorno_previsto_em: string | null;
  created_at: string;
};

type Props = {
  patients: Patient[];
};

export default function PatientsBrowser({ patients }: Props) {
  const [query, setQuery] = useState("");

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      includesSearch(
        [
          patient.nome,
          patient.idade ? String(patient.idade) : "",
          patient.sexo,
          patient.especialidade,
          patient.queixa,
          patient.observacoes,
          patient.diagnostico_principal,
          patient.medicamentos_em_uso,
        ],
        query
      )
    );
  }, [patients, query]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Pacientes cadastrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca instantânea por nome, especialidade, queixa, diagnóstico ou observações.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar paciente..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            {filteredPatients.length} de {patients.length} pacientes
          </span>

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          Nenhum paciente encontrado para essa busca.
        </div>
      ) : (
        <div className="mt-6 space-y-4" id="list">
          {filteredPatients.map((patient) => (
            <details
              key={patient.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {patient.nome}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {patient.idade ? `${patient.idade} anos` : "Idade não informada"}
                      {patient.especialidade ? ` • ${patient.especialidade}` : ""}
                    </p>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    Clique para editar
                  </span>
                </div>
              </summary>

              <form
                action={`/api/patients/${patient.id}`}
                method="POST"
                className="mt-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="nome"
                    defaultValue={patient.nome}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                  <input
                    name="idade"
                    type="number"
                    defaultValue={patient.idade ?? ""}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                  <input
                    name="sexo"
                    defaultValue={patient.sexo ?? ""}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                  <input
                    name="especialidade"
                    defaultValue={patient.especialidade ?? ""}
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <textarea
                    name="queixa"
                    rows={4}
                    defaultValue={patient.queixa ?? ""}
                    placeholder="Queixa / doença"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <textarea
                    name="diagnostico_principal"
                    rows={4}
                    defaultValue={patient.diagnostico_principal ?? ""}
                    placeholder="Diagnóstico principal"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <textarea
                    name="medicamentos_em_uso"
                    rows={4}
                    defaultValue={patient.medicamentos_em_uso ?? ""}
                    placeholder="Medicamentos em uso"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <textarea
                    name="observacoes"
                    rows={4}
                    defaultValue={patient.observacoes ?? ""}
                    placeholder="Observações"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="mt-4">
                  <input
                    name="retorno_previsto_em"
                    type="date"
                    defaultValue={
                      patient.retorno_previsto_em
                        ? new Date(patient.retorno_previsto_em).toISOString().slice(0, 10)
                        : ""
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
                  >
                    Salvar edição
                  </button>
                  <button
                    type="submit"
                    name="intent"
                    value="delete"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700"
                  >
                    Apagar
                  </button>
                </div>
              </form>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}