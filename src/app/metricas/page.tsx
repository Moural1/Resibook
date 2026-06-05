import { createClient } from "@supabase/supabase-js";

type Patient = {
  id: string;
  nome: string;
  idade: number | null;
  sexo: string | null;
  queixa: string | null;
  created_at: string;
};

type Prescription = {
  id: number;
  paciente_nome: string | null;
  medicamento: string | null;
  orientacoes: string | null;
  created_at: string;
};

type AICase = {
  id: number;
  titulo: string | null;
  queixa: string | null;
  resposta: string | null;
  created_at: string;
};

type Flashcard = {
  id: string;
  frente: string;
  created_at: string;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("patients")
    .select("id, nome, idade, sexo, queixa, created_at")
    .order("created_at", { ascending: false });

  return (data as Patient[]) || [];
}

async function getPrescriptions(): Promise<Prescription[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("prescriptions")
    .select("id, paciente_nome, medicamento, orientacoes, created_at")
    .order("created_at", { ascending: false });

  return (data as Prescription[]) || [];
}

async function getAICases(): Promise<AICase[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("ai_cases")
    .select("id, titulo, queixa, resposta, created_at")
    .order("created_at", { ascending: false });

  return (data as AICase[]) || [];
}

async function getFlashcards(): Promise<Flashcard[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("flashcards")
    .select("id, frente, created_at")
    .order("created_at", { ascending: false });

  return (data as Flashcard[]) || [];
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatShortDay(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

function buildActivity(
  prescriptions: Prescription[],
  aiCases: AICase[],
  patients: Patient[]
) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - index));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const allDates = [
    ...prescriptions.map((item) => item.created_at),
    ...aiCases.map((item) => item.created_at),
    ...patients.map((item) => item.created_at),
  ];

  return days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);

    const count = allDates.filter((value) => {
      const current = new Date(value);
      return current >= day && current < next;
    }).length;

    return {
      label: formatShortDay(day),
      value: count,
    };
  });
}

function buildDistribution(
  prescriptions: Prescription[],
  aiCases: AICase[],
  flashcards: Flashcard[]
) {
  const rows = [
    { label: "prescrição", value: prescriptions.length },
    { label: "casos IA", value: aiCases.length },
    { label: "flashcards", value: flashcards.length },
  ];

  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;

  return rows.map((row) => ({
    ...row,
    percentage: Math.round((row.value / total) * 100),
  }));
}

export default async function MetricasPage() {
  const [patients, prescriptions, aiCases, flashcards] = await Promise.all([
    getPatients(),
    getPrescriptions(),
    getAICases(),
    getFlashcards(),
  ]);

  const activity = buildActivity(prescriptions, aiCases, patients);
  const totalConsultas = activity.reduce((sum, item) => sum + item.value, 0);
  const distribution = buildDistribution(prescriptions, aiCases, flashcards);
  const maxActivity = Math.max(...activity.map((item) => item.value), 1);

  const recentPatients = patients.slice(0, 3);
  const recentConsults = [
    ...aiCases.slice(0, 10).map((item) => ({
      date: formatDate(item.created_at),
      type: "conduta",
      patient: "—",
      summary: item.titulo || item.queixa || item.resposta || "Sem resumo",
    })),
    ...prescriptions.slice(0, 10).map((item) => ({
      date: formatDate(item.created_at),
      type: "prescrição",
      patient: item.paciente_nome || "—",
      summary: item.medicamento || item.orientacoes || "Prescrição do caso",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">🩺</div>
            <div className="mt-5 text-6xl font-bold leading-none text-[#1e4aa8]">
              {totalConsultas}
            </div>
            <div className="mt-4 text-2xl font-bold uppercase tracking-wide text-slate-500">
              Total de consultas
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">📘</div>
            <div className="mt-5 text-6xl font-bold leading-none text-[#1e4aa8]">
              {aiCases.length}
            </div>
            <div className="mt-4 text-2xl font-bold uppercase tracking-wide text-slate-500">
              Condutas
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">💊</div>
            <div className="mt-5 text-6xl font-bold leading-none text-[#1e4aa8]">
              {prescriptions.length}
            </div>
            <div className="mt-4 text-2xl font-bold uppercase tracking-wide text-slate-500">
              Prescrições
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">🧠</div>
            <div className="mt-5 text-6xl font-bold leading-none text-[#1e4aa8]">
              {flashcards.length}
            </div>
            <div className="mt-4 text-2xl font-bold uppercase tracking-wide text-slate-500">
              Flashcards
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="text-3xl">👥</div>
            <div className="mt-5 text-6xl font-bold leading-none text-[#1e4aa8]">
              {patients.length}
            </div>
            <div className="mt-4 text-2xl font-bold uppercase tracking-wide text-slate-500">
              Pacientes únicos
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
            Atividade — últimos 14 dias
          </h2>
          <p className="text-3xl text-slate-700">
            Total: {totalConsultas} consultas
          </p>
        </div>

        <div className="mt-10 flex h-[360px] items-end gap-3">
          {activity.map((item) => {
            const height = Math.max(
              (item.value / maxActivity) * 100,
              item.value > 0 ? 8 : 2
            );

            return (
              <div
                key={item.label}
                className="flex flex-1 flex-col items-center justify-end gap-3"
              >
                <span className="text-lg font-semibold text-[#1e4aa8]">
                  {item.value > 0 ? item.value : ""}
                </span>
                <div className="flex h-[260px] w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#3b82f6] to-[#5b95f8]"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-base text-slate-400">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
          Distribuição por tipo
        </h2>

        <div className="mt-8 space-y-6">
          {distribution.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[140px_1fr_120px] items-center gap-4"
            >
              <span className="text-2xl text-slate-700">{item.label}</span>
              <div className="h-5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2c6ee8] to-[#28a2f2]"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-right text-2xl text-slate-500">
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
          Pacientes recentes
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentPatients.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
              Nenhum paciente recente.
            </div>
          ) : (
            recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-6"
              >
                <p className="text-3xl font-semibold text-slate-900">
                  {patient.nome}
                </p>
                <p className="mt-3 text-xl text-slate-500">
                  {patient.idade ? `${patient.idade} anos` : "Idade não informada"}
                  {patient.sexo ? ` · ${patient.sexo}` : ""}
                </p>
                <p className="mt-4 text-2xl text-slate-700">
                  {patient.queixa || "Sem queixa registrada"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
          Últimas 30 consultas
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xl font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Resumo</th>
              </tr>
            </thead>
            <tbody>
              {recentConsults.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500"
                  >
                    Nenhuma consulta recente.
                  </td>
                </tr>
              ) : (
                recentConsults.map((row, index) => (
                  <tr
                    key={`${row.date}-${index}`}
                    className="rounded-2xl bg-slate-50 text-xl text-slate-700"
                  >
                    <td className="px-4 py-4">{row.date}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-lg font-semibold text-blue-700">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">{row.patient}</td>
                    <td className="px-4 py-4">{row.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}