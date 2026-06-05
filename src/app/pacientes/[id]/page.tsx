"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import CopyButton from "../../../components/copy-button";

type Patient = {
  id: string;
  nome: string;
  idade: number | null;
  sexo: string | null;
  telefone: string | null;
  especialidade: string | null;
  queixa: string | null;
  diagnostico_principal: string | null;
  medicamentos_em_uso: string | null;
  observacoes: string | null;
  retorno_previsto_em: string | null;
  created_at: string | null;
};

type Prescription = {
  id: number;
  patient_id: string | null;
  paciente_nome: string | null;
  medicamento: string | null;
  posologia: string | null;
  duracao: string | null;
  via: string | null;
  orientacoes: string | null;
  created_at: string | null;
};

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
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

function formatDateOnly(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildPrescriptionText(item: Prescription) {
  const lines = [
    item.medicamento || "Prescrição sem medicamento definido",
    item.posologia || "",
    item.via ? `Via: ${item.via}` : "",
    item.duracao ? `Duração: ${item.duracao}` : "",
    item.orientacoes ? `Orientações: ${item.orientacoes}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function buildPatientSummary(patient: Patient, prescriptions: Prescription[]) {
  const main = [
    `PACIENTE: ${patient.nome || "-"}`,
    patient.idade ? `IDADE: ${patient.idade} anos` : "",
    patient.sexo ? `SEXO: ${patient.sexo}` : "",
    patient.telefone ? `TELEFONE: ${patient.telefone}` : "",
    patient.especialidade ? `ESPECIALIDADE: ${patient.especialidade}` : "",
    patient.queixa ? `QUEIXA: ${patient.queixa}` : "",
    patient.diagnostico_principal
      ? `DIAGNÓSTICO PRINCIPAL: ${patient.diagnostico_principal}`
      : "",
    patient.medicamentos_em_uso
      ? `MEDICAMENTOS EM USO:\n${patient.medicamentos_em_uso}`
      : "",
    patient.observacoes ? `OBSERVAÇÕES:\n${patient.observacoes}` : "",
    patient.retorno_previsto_em
      ? `RETORNO PREVISTO: ${formatDateOnly(patient.retorno_previsto_em)}`
      : "",
  ].filter(Boolean);

  const prescriptionText = prescriptions.length
    ? [
        "PRESCRIÇÕES VINCULADAS:",
        ...prescriptions.map((item, index) => {
          return `${index + 1}. ${buildPrescriptionText(item)}`;
        }),
      ]
    : [];

  return [...main, ...prescriptionText].join("\n\n");
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children?: string | null;
}) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {children}
      </p>
    </div>
  );
}

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();

  const patientId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPatient() {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }

    if (!patientId) {
      setError("ID do paciente não encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select(
        "id, nome, idade, sexo, telefone, especialidade, queixa, diagnostico_principal, medicamentos_em_uso, observacoes, retorno_previsto_em, created_at"
      )
      .eq("id", patientId)
      .single();

    if (patientError || !patientData) {
      setError(patientError?.message || "Paciente não encontrado.");
      setPatient(null);
      setPrescriptions([]);
      setLoading(false);
      return;
    }

    const currentPatient = patientData as Patient;
    setPatient(currentPatient);

    const byIdPromise = supabase
      .from("prescriptions")
      .select(
        "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
      )
      .eq("patient_id", currentPatient.id)
      .order("created_at", { ascending: false });

    const byNamePromise = currentPatient.nome
      ? supabase
          .from("prescriptions")
          .select(
            "id, patient_id, paciente_nome, medicamento, posologia, duracao, via, orientacoes, created_at"
          )
          .eq("paciente_nome", currentPatient.nome)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const [byIdRes, byNameRes] = await Promise.all([byIdPromise, byNamePromise]);

    if (byIdRes.error) {
      console.warn("Erro ao buscar prescrições por ID:", byIdRes.error.message);
    }

    if (byNameRes.error) {
      console.warn(
        "Erro ao buscar prescrições por nome:",
        byNameRes.error.message
      );
    }

    const mergedMap = new Map<number, Prescription>();

    ((byIdRes.data as Prescription[]) || []).forEach((item) => {
      mergedMap.set(item.id, item);
    });

    ((byNameRes.data as Prescription[]) || []).forEach((item) => {
      mergedMap.set(item.id, item);
    });

    const merged = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    setPrescriptions(merged);
    setLoading(false);
  }

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  if (loading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-600">
        Carregando prontuário do paciente...
      </section>
    );
  }

  if (error || !patient) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">
          Erro: {error || "Paciente não encontrado."}
        </p>

        <button
          type="button"
          onClick={() => router.push("/pacientes")}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
        >
          Voltar para pacientes
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Prontuário
                </span>

                {patient.especialidade ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {patient.especialidade}
                  </span>
                ) : null}

                {patient.retorno_previsto_em ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Retorno: {formatDateOnly(patient.retorno_previsto_em)}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {patient.nome}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {patient.sexo || "Sexo não informado"}
                {typeof patient.idade === "number"
                  ? ` • ${patient.idade} anos`
                  : ""}
                {patient.telefone ? ` • ${patient.telefone}` : ""}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-400">
                Cadastro: {formatDate(patient.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <CopyButton text={buildPatientSummary(patient, prescriptions)} />

              <Link
                href={`/prescricao?q=${encodeURIComponent(patient.nome)}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-700"
              >
                Ver prescrições
              </Link>

              <Link
                href="/pacientes"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Voltar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <InfoBlock title="Queixa">{patient.queixa}</InfoBlock>

          <InfoBlock title="Diagnóstico principal">
            {patient.diagnostico_principal}
          </InfoBlock>

          <InfoBlock title="Medicamentos em uso">
            {patient.medicamentos_em_uso}
          </InfoBlock>

          <InfoBlock title="Observações">{patient.observacoes}</InfoBlock>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Histórico
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Prescrições vinculadas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca por paciente vinculado ou pelo nome salvo na prescrição.
            </p>
          </div>

          <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {prescriptions.length}{" "}
            {prescriptions.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhuma prescrição vinculada encontrada.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {prescriptions.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Prescrição
                      </span>

                      {item.via ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          Via: {item.via}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {item.medicamento || "Prescrição clínica"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <CopyButton text={buildPrescriptionText(item)} />
                </div>

                <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                  <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                    {buildPrescriptionText(item)}
                  </pre>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}