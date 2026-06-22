"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  Lock,
  Stethoscope,
  Tags,
  Users,
  Brain,
  BarChart3,
} from "lucide-react";

type Patient = {
  id: string;
  nome: string;
  especialidade: string | null;
  queixa: string | null;
  created_at: string;
};

type Prescription = {
  id: number;
  paciente_nome: string | null;
  medicamento: string | null;
  created_at: string;
};

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  created_at: string;
};

type TopicoMedico = {
  id: number;
  area: string;
  titulo: string;
  atualizado_em: string | null;
};

type DashboardCounts = {
  patients: number;
  prescriptions: number;
  examTemplates: number;
  topicosMedicos: number;
  flashcards: number;
  flashcardsDificeis: number;
  cids: number;
};

const GUEST_EMAIL = "convidado@resibook.com";

async function getTableCount(
  tableName: string,
  filter?: {
    column: string;
    value: string | number | boolean;
  }
): Promise<number> {
  try {
    const supabase = createClient();

    let query = supabase
      .from(tableName)
      .select("id", { count: "exact", head: true });

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    const { count, error } = await query;

    if (error) {
      console.warn(`Erro ao contar ${tableName}:`, error.message);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.warn(`Erro inesperado ao contar ${tableName}:`, error);
    return 0;
  }
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

export default function DashboardPage() {
  const supabase = createClient();

  const [counts, setCounts] = useState<DashboardCounts>({
    patients: 0,
    prescriptions: 0,
    examTemplates: 0,
    topicosMedicos: 0,
    flashcards: 0,
    flashcardsDificeis: 0,
    cids: 0,
  });

  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(
    []
  );
  const [recentExamTemplates, setRecentExamTemplates] = useState<ExamTemplate[]>(
    []
  );
  const [recentTopicos, setRecentTopicos] = useState<TopicoMedico[]>([]);

  const [favoritePrescriptionCount, setFavoritePrescriptionCount] = useState(0);
  const [favoriteExamCount, setFavoriteExamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        setSessionReady(true);
        return;
      }

      const userId = sessionData.session?.user?.id || null;
      const email = sessionData.session?.user?.email?.trim().toLowerCase() || "";
      const guest = email === GUEST_EMAIL;

      setIsGuest(guest);
      setSessionReady(true);

      if (!userId) {
        setError("Usuário autenticado não identificado.");
        setLoading(false);
        return;
      }

      if (guest) {
        setCounts({
          patients: 0,
          prescriptions: 0,
          examTemplates: 0,
          topicosMedicos: 0,
          flashcards: 0,
          flashcardsDificeis: 0,
          cids: 0,
        });
        setRecentPatients([]);
        setRecentPrescriptions([]);
        setRecentExamTemplates([]);
        setRecentTopicos([]);
        setFavoritePrescriptionCount(0);
        setFavoriteExamCount(0);
        setLoading(false);
        return;
      }

      const [
        patientsCount,
        prescriptionsCount,
        examTemplatesCount,
        topicosMedicosCount,
        flashcardsCount,
        cidsCount,
        difficultMarksCount,
        patientsRes,
        prescriptionsRes,
        examTemplatesRes,
        topicosRes,
      ] = await Promise.all([
        getTableCount("patients", { column: "user_id", value: userId }),
        getTableCount("prescriptions", { column: "user_id", value: userId }),
        getTableCount("exam_templates"),
        getTableCount("topicos_medicos"),
        getTableCount("flashcards"),
        getTableCount("cids"),

        supabase
          .from("flashcard_user_marks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("dificil", true)
          .then(({ count, error }) => {
            if (error) {
              console.warn(
                "Erro ao contar flashcards difíceis:",
                error.message
              );
              return 0;
            }

            return count ?? 0;
          }),

        supabase
          .from("patients")
          .select("id, nome, especialidade, queixa, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("prescriptions")
          .select("id, paciente_nome, medicamento, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("exam_templates")
          .select("id, categoria, titulo, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("topicos_medicos")
          .select("id, area, titulo, atualizado_em")
          .order("atualizado_em", { ascending: false, nullsFirst: false })
          .limit(5),
      ]);

      if (!mounted) return;

      setCounts({
        patients: patientsCount,
        prescriptions: prescriptionsCount,
        examTemplates: examTemplatesCount,
        topicosMedicos: topicosMedicosCount,
        flashcards: flashcardsCount,
        flashcardsDificeis: difficultMarksCount,
        cids: cidsCount,
      });

      if (patientsRes.error) {
        console.warn(
          "Erro ao carregar pacientes recentes:",
          patientsRes.error.message
        );
      }

      if (prescriptionsRes.error) {
        console.warn(
          "Erro ao carregar prescrições recentes:",
          prescriptionsRes.error.message
        );
      }

      if (examTemplatesRes.error) {
        console.warn(
          "Erro ao carregar exames/evoluções recentes:",
          examTemplatesRes.error.message
        );
      }

      if (topicosRes.error) {
        console.warn(
          "Erro ao carregar tópicos recentes:",
          topicosRes.error.message
        );
      }

      setRecentPatients((patientsRes.data as Patient[]) || []);
      setRecentPrescriptions((prescriptionsRes.data as Prescription[]) || []);
      setRecentExamTemplates((examTemplatesRes.data as ExamTemplate[]) || []);
      setRecentTopicos((topicosRes.data as TopicoMedico[]) || []);

      try {
        const prescriptionFavorites = JSON.parse(
          localStorage.getItem("resibook-prescription-template-favorites") || "[]"
        );
        const examFavorites = JSON.parse(
          localStorage.getItem("resibook-exam-template-favorites") || "[]"
        );

        setFavoritePrescriptionCount(
          Array.isArray(prescriptionFavorites) ? prescriptionFavorites.length : 0
        );
        setFavoriteExamCount(Array.isArray(examFavorites) ? examFavorites.length : 0);
      } catch {
        setFavoritePrescriptionCount(0);
        setFavoriteExamCount(0);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  if (!loading && sessionReady && isGuest) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-sm">
          <div className="border-b border-amber-100 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] p-6">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                <Lock className="h-5 w-5" />
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Acesso restrito
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                O perfil convidado não pode visualizar dashboard privado, métricas
                assistenciais, pacientes recentes nem prescrições recentes.
              </p>

              <Link
                href="/prescricao"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ir para prescrição
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03]">
        <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fbff_100%)] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
              ResiBook
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Painel principal
            </span>

            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privado por usuário
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Dashboard clínico
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Visão geral do seu login. Pacientes, prescrições e atividades
                clínicas são filtrados por usuário; bibliotecas médicas seguem
                compartilhadas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <HeaderPill label="Pacientes" value={counts.patients} />
              <HeaderPill label="Prescrições" value={counts.prescriptions} />
              <HeaderPill label="Condutas" value={counts.flashcardsDificeis} />
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {loading ? (
            <p className="mt-5 text-sm font-medium text-slate-500">
              Carregando dados do dashboard...
            </p>
          ) : null}
        </div>

        <div className="p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Pacientes"
              value={counts.patients}
              description="Cadastros do seu login"
              href="/pacientes"
              icon={Users}
            />

            <MetricCard
              title="Prescrições"
              value={counts.prescriptions}
              description="Itens salvos por você"
              href="/prescricao"
              icon={ClipboardList}
            />

            <MetricCard
              title="Exames / Evolução"
              value={counts.examTemplates}
              description="Biblioteca compartilhada"
              href="/exames-evolucao"
              icon={FlaskConical}
            />

            <MetricCard
              title="Tópicos"
              value={counts.topicosMedicos}
              description="Biblioteca médica"
              href="/topicos"
              icon={Stethoscope}
            />

            <MetricCard
              title="Flashcards"
              value={counts.flashcards}
              description="Biblioteca compartilhada"
              href="/flashcards"
              icon={Brain}
            />

            <MetricCard
              title="Condutas"
              value={counts.flashcardsDificeis}
              description="Marcadas por você"
              href="/condutas"
              icon={ClipboardCheck}
            />

            <MetricCard
              title="CIDs"
              value={counts.cids}
              description="Base de consulta"
              href="/cids"
              icon={Tags}
            />

            <MetricCard
              title="Revisão"
              value={counts.topicosMedicos}
              description="Modo estudo"
              href="/topicos"
              icon={BookOpen}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
          <SectionHeader
            title="Atalhos rápidos"
            description="Fluxos mais usados no dia a dia."
          />

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ShortcutCard
              href="/pacientes"
              title="Abrir pacientes"
              description="Cadastro, busca e edição rápida."
              icon={Users}
            />

            <ShortcutCard
              href="/prescricao"
              title="Abrir prescrição"
              description="Biblioteca, formulário e histórico."
              icon={ClipboardList}
            />

            <ShortcutCard
              href="/exames-evolucao"
              title="Abrir exames"
              description="Blocos clínicos e evolução."
              icon={FlaskConical}
            />

            <ShortcutCard
              href="/topicos"
              title="Abrir tópicos"
              description="Consultar biblioteca médica."
              icon={Stethoscope}
            />

            <ShortcutCard
              href="/flashcards"
              title="Abrir flashcards"
              description="Revisão médica rápida."
              icon={Brain}
            />

            <ShortcutCard
              href="/condutas"
              title="Abrir condutas"
              description="Protocolos marcados por você."
              icon={ClipboardCheck}
            />

            <ShortcutCard
              href="/cids"
              title="Consultar CIDs"
              description="Buscar códigos e descrições."
              icon={Tags}
            />

            <ShortcutCard
              href="/metricas"
              title="Métricas"
              description="Ver seus indicadores clínicos."
              icon={BarChart3}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
          <SectionHeader
            title="Favoritos salvos"
            description="Modelos favoritos para acesso rápido neste navegador."
          />

          <div className="mt-5 space-y-4">
            <FavoriteStatCard
              title="Favoritos de prescrição"
              value={favoritePrescriptionCount}
              description="Modelos marcados na biblioteca de plantão."
              href="/prescricao"
            />

            <FavoriteStatCard
              title="Favoritos de exames"
              value={favoriteExamCount}
              description="Blocos mais usados em exames e evolução."
              href="/exames-evolucao"
            />

            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fluxo recomendado
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Paciente → Prescrição → Exames/Evolução → Tópicos → Flashcards.
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentPanel
          title="Pacientes recentes"
          actionHref="/pacientes"
          actionLabel="Ver todos"
        >
          {recentPatients.length === 0 ? (
            <EmptyState text="Nenhum paciente recente no seu login." />
          ) : (
            <div className="space-y-3">
              {recentPatients.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.nome}
                  subtitle={
                    item.especialidade
                      ? `${item.especialidade}${
                          item.queixa ? ` • ${item.queixa}` : ""
                        }`
                      : item.queixa || "Sem observação"
                  }
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Prescrições recentes"
          actionHref="/prescricao"
          actionLabel="Abrir módulo"
        >
          {recentPrescriptions.length === 0 ? (
            <EmptyState text="Nenhuma prescrição recente no seu login." />
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.medicamento || "Sem medicamento"}
                  subtitle={item.paciente_nome || "Paciente não vinculado"}
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Exames / evolução recentes"
          actionHref="/exames-evolucao"
          actionLabel="Abrir módulo"
        >
          {recentExamTemplates.length === 0 ? (
            <EmptyState text="Nenhum bloco recente." />
          ) : (
            <div className="space-y-3">
              {recentExamTemplates.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.titulo}
                  subtitle={item.categoria || "Sem categoria"}
                  meta={formatDate(item.created_at)}
                />
              ))}
            </div>
          )}
        </RecentPanel>

        <RecentPanel
          title="Tópicos atualizados"
          actionHref="/topicos"
          actionLabel="Abrir tópicos"
        >
          {recentTopicos.length === 0 ? (
            <EmptyState text="Nenhum tópico recente." />
          ) : (
            <div className="space-y-3">
              {recentTopicos.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.titulo}
                  subtitle={item.area}
                  meta={formatDate(item.atualizado_em)}
                />
              ))}
            </div>
          )}
        </RecentPanel>
      </section>
    </div>
  );
}

function HeaderPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 pb-4">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function ShortcutCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  );
}

function FavoriteStatCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-base font-semibold text-slate-800">
          {value}
        </div>
      </div>
    </Link>
  );
}

function RecentPanel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.02]">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
          {title}
        </h2>

        <Link
          href={actionHref}
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function RecentRow({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {meta}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}