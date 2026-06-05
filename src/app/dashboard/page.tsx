import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Patient = {
  id: string;
  nome: string;
  especialidade: string | null;
  queixa: string | null;
  created_at: string;
};

type Prescription = {
  id: number;
  medicamento: string | null;
  paciente_nome: string | null;
  created_at: string;
};

type ExamTemplate = {
  id: number;
  categoria: string;
  titulo: string;
};

type Flashcard = {
  id: string;
  frente: string;
  source_group: string | null;
};

type Cid = {
  id: number;
  codigo: string;
  descricao: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

async function getDashboardData() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      patients: [] as Patient[],
      prescriptions: [] as Prescription[],
      examTemplates: [] as ExamTemplate[],
      flashcards: [] as Flashcard[],
      cids: [] as Cid[],
      counts: {
        patients: 0,
        prescriptions: 0,
        examTemplates: 0,
        flashcards: 0,
        cids: 0,
      },
    };
  }

  const [
    patientsRes,
    prescriptionsRes,
    examTemplatesRes,
    flashcardsRes,
    cidsRes,
    patientsCountRes,
    prescriptionsCountRes,
    examTemplatesCountRes,
    flashcardsCountRes,
    cidsCountRes,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, nome, especialidade, queixa, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("prescriptions")
      .select("id, medicamento, paciente_nome, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("exam_templates")
      .select("id, categoria, titulo")
      .order("id", { ascending: false })
      .limit(5),

    supabase
      .from("flashcards")
      .select("id, frente, source_group")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("cids")
      .select("id, codigo, descricao")
      .order("codigo", { ascending: true })
      .limit(5),

    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("prescriptions").select("*", { count: "exact", head: true }),
    supabase.from("exam_templates").select("*", { count: "exact", head: true }),
    supabase.from("flashcards").select("*", { count: "exact", head: true }),
    supabase.from("cids").select("*", { count: "exact", head: true }),
  ]);

  return {
    patients: (patientsRes.data as Patient[]) || [],
    prescriptions: (prescriptionsRes.data as Prescription[]) || [],
    examTemplates: (examTemplatesRes.data as ExamTemplate[]) || [],
    flashcards: (flashcardsRes.data as Flashcard[]) || [],
    cids: (cidsRes.data as Cid[]) || [],
    counts: {
      patients: patientsCountRes.count || 0,
      prescriptions: prescriptionsCountRes.count || 0,
      examTemplates: examTemplatesCountRes.count || 0,
      flashcards: flashcardsCountRes.count || 0,
      cids: cidsCountRes.count || 0,
    },
  };
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function truncate(text?: string | null, max = 90) {
  if (!text) return "Sem descrição";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default async function DashboardPage() {
  const { patients, prescriptions, examTemplates, flashcards, cids, counts } =
    await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              ResiBook
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Central clínica
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Painel operacional
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Visão rápida da sua base clínica: pacientes, prescrições, biblioteca
            de exames, flashcards e CID-10. Tudo centralizado para plantão e revisão.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Pacientes"
              value={counts.patients}
              href="/pacientes"
              description="Cadastros ativos"
            />
            <MetricCard
              title="Prescrições"
              value={counts.prescriptions}
              href="/prescricao"
              description="Registros salvos"
            />
            <MetricCard
              title="Exames / Evolução"
              value={counts.examTemplates}
              href="/exames-evolucao"
              description="Blocos clínicos"
            />
            <MetricCard
              title="Flashcards"
              value={counts.flashcards}
              href="/flashcards"
              description="Cartões de revisão"
            />
            <MetricCard
              title="CIDs"
              value={counts.cids}
              href="/cids"
              description="Base de consulta"
            />
            <MetricCard
              title="Acessar usuário"
              value="Perfil"
              href="/usuario"
              description="Conta e preferências"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Atalhos rápidos
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Entradas diretas para o fluxo do plantão.
          </p>

          <div className="mt-6 space-y-3">
            <ShortcutCard
              href="/pacientes"
              title="Novo paciente"
              description="Cadastrar e editar prontuários rapidamente."
              emoji="🧑‍⚕️"
            />
            <ShortcutCard
              href="/prescricao"
              title="Nova prescrição"
              description="Prescrever e copiar modelos prontos."
              emoji="📋"
            />
            <ShortcutCard
              href="/exames-evolucao"
              title="Exames / evolução"
              description="Solicitações, condutas e evolução clínica."
              emoji="🧪"
            />
            <ShortcutCard
              href="/flashcards"
              title="Revisão por flashcards"
              description="Revisar conteúdo médico em poucos segundos."
              emoji="🧠"
            />
            <ShortcutCard
              href="/cids"
              title="Consultar CID"
              description="Buscar códigos e descrições na hora."
              emoji="🏷️"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Pacientes recentes"
          subtitle="Últimos cadastros da base"
          actionHref="/pacientes"
          actionLabel="Ver todos"
        >
          {patients.length === 0 ? (
            <EmptyState text="Nenhum paciente cadastrado ainda." />
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <RowItem
                  key={patient.id}
                  title={patient.nome}
                  subtitle={
                    patient.especialidade
                      ? `${patient.especialidade} • ${truncate(patient.queixa, 60)}`
                      : truncate(patient.queixa, 60)
                  }
                  meta={formatDate(patient.created_at)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Prescrições recentes"
          subtitle="Últimos registros clínicos"
          actionHref="/prescricao"
          actionLabel="Abrir módulo"
        >
          {prescriptions.length === 0 ? (
            <EmptyState text="Nenhuma prescrição registrada." />
          ) : (
            <div className="space-y-3">
              {prescriptions.map((item) => (
                <RowItem
                  key={item.id}
                  title={item.medicamento || "Prescrição sem medicamento"}
                  subtitle={item.paciente_nome || "Paciente não vinculado"}
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Exames / evolução"
          subtitle="Blocos clínicos recentes"
          actionHref="/exames-evolucao"
          actionLabel="Ver biblioteca"
        >
          {examTemplates.length === 0 ? (
            <EmptyState text="Nenhum bloco disponível." />
          ) : (
            <div className="space-y-3">
              {examTemplates.map((item) => (
                <RowItem
                  key={item.id}
                  title={item.titulo}
                  subtitle={item.categoria || "Sem categoria"}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Flashcards"
          subtitle="Últimos cartões cadastrados"
          actionHref="/flashcards"
          actionLabel="Abrir revisão"
        >
          {flashcards.length === 0 ? (
            <EmptyState text="Nenhum flashcard disponível." />
          ) : (
            <div className="space-y-3">
              {flashcards.map((item) => (
                <RowItem
                  key={item.id}
                  title={truncate(item.frente, 58)}
                  subtitle={item.source_group || "Sem grupo"}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Consulta CID"
          subtitle="Base inicial disponível"
          actionHref="/cids"
          actionLabel="Abrir CIDs"
        >
          {cids.length === 0 ? (
            <EmptyState text="Nenhum CID carregado." />
          ) : (
            <div className="space-y-3">
              {cids.map((item) => (
                <RowItem
                  key={item.id}
                  title={item.codigo}
                  subtitle={truncate(item.descricao, 58)}
                />
              ))}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string | number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Link>
  );
}

function ShortcutCard({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <Link
          href={actionHref}
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function RowItem({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        {meta ? (
          <span className="shrink-0 text-xs font-medium text-slate-400">
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}