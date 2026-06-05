"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

type DashboardCounts = {
  patients: number;
  prescriptions: number;
  examTemplates: number;
  flashcards: number;
  cids: number;
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

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    patients: 0,
    prescriptions: 0,
    examTemplates: 0,
    flashcards: 0,
    cids: 0,
  });

  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(
    []
  );
  const [recentExamTemplates, setRecentExamTemplates] = useState<ExamTemplate[]>(
    []
  );

  const [favoritePrescriptionCount, setFavoritePrescriptionCount] = useState(0);
  const [favoriteExamCount, setFavoriteExamCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) return;

      const [
        patientsCountRes,
        prescriptionsCountRes,
        examTemplatesCountRes,
        flashcardsCountRes,
        cidsCountRes,
        patientsRes,
        prescriptionsRes,
        examTemplatesRes,
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("prescriptions").select("*", { count: "exact", head: true }),
        supabase.from("exam_templates").select("*", { count: "exact", head: true }),
        supabase.from("flashcards").select("*", { count: "exact", head: true }),
        supabase.from("cids").select("*", { count: "exact", head: true }),

        supabase
          .from("patients")
          .select("id, nome, especialidade, queixa, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("prescriptions")
          .select("id, paciente_nome, medicamento, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("exam_templates")
          .select("id, categoria, titulo, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setCounts({
        patients: patientsCountRes.count || 0,
        prescriptions: prescriptionsCountRes.count || 0,
        examTemplates: examTemplatesCountRes.count || 0,
        flashcards: flashcardsCountRes.count || 0,
        cids: cidsCountRes.count || 0,
      });

      setRecentPatients((patientsRes.data as Patient[]) || []);
      setRecentPrescriptions((prescriptionsRes.data as Prescription[]) || []);
      setRecentExamTemplates((examTemplatesRes.data as ExamTemplate[]) || []);

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
        setFavoriteExamCount(
          Array.isArray(examFavorites) ? examFavorites.length : 0
        );
      } catch {
        setFavoritePrescriptionCount(0);
        setFavoriteExamCount(0);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            ResiBook
          </span>
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Painel principal
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Dashboard clínico
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          Visão geral com contadores, atalhos rápidos, favoritos e atividade recente.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Pacientes"
            value={counts.patients}
            description="Cadastros ativos"
            href="/pacientes"
          />
          <MetricCard
            title="Prescrições"
            value={counts.prescriptions}
            description="Itens salvos"
            href="/prescricao"
          />
          <MetricCard
            title="Exames / Evolução"
            value={counts.examTemplates}
            description="Blocos clínicos"
            href="/exames-evolucao"
          />
          <MetricCard
            title="Flashcards"
            value={counts.flashcards}
            description="Revisão clínica"
            href="/flashcards"
          />
          <MetricCard
            title="CIDs"
            value={counts.cids}
            description="Base de consulta"
            href="/cids"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Atalhos rápidos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fluxos mais usados no dia a dia.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ShortcutCard
              href="/pacientes"
              emoji="🧑‍⚕️"
              title="Abrir pacientes"
              description="Cadastro, busca e edição rápida."
            />
            <ShortcutCard
              href="/prescricao"
              emoji="📋"
              title="Abrir prescrição"
              description="Biblioteca, formulário e histórico."
            />
            <ShortcutCard
              href="/exames-evolucao"
              emoji="🧪"
              title="Abrir exames"
              description="Blocos clínicos e evolução."
            />
            <ShortcutCard
              href="/flashcards"
              emoji="🧠"
              title="Abrir flashcards"
              description="Revisão médica rápida."
            />
            <ShortcutCard
              href="/cids"
              emoji="🏷️"
              title="Consultar CIDs"
              description="Buscar códigos e descrições."
            />
            <ShortcutCard
              href="/usuario"
              emoji="👤"
              title="Abrir usuário"
              description="Conta, preferências e perfil."
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Favoritos salvos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Seus modelos favoritos para acesso rápido.
            </p>
          </div>

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

            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Dica de uso
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Marque estrela nos modelos que você usa mais. Isso acelera muito o plantão.
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <RecentPanel
          title="Pacientes recentes"
          actionHref="/pacientes"
          actionLabel="Ver todos"
        >
          {recentPatients.length === 0 ? (
            <EmptyState text="Nenhum paciente recente." />
          ) : (
            <div className="space-y-3">
              {recentPatients.map((item) => (
                <RecentRow
                  key={item.id}
                  title={item.nome}
                  subtitle={
                    item.especialidade
                      ? `${item.especialidade}${item.queixa ? ` • ${item.queixa}` : ""}`
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
            <EmptyState text="Nenhuma prescrição recente." />
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
          title="Exames recentes"
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
  value: number;
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
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
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
      className="block rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-lg font-bold text-amber-700">
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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>

        <span className="shrink-0 text-xs font-medium text-slate-400">
          {meta}
        </span>
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