import Link from "next/link";
import ModulePageHeader from "@/components/module-page-header";
import ResibookGuard from "@/components/resibook-guard";
import { QUICK_COMPLAINTS } from "@/lib/clinical-quick-complaints";
import {
  ArrowUpRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Gauge,
  ListChecks,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Tags,
  Workflow,
} from "lucide-react";

const SHIFT_ACTIONS = [
  {
    title: "Roteiro de caso",
    description: "Digite uma queixa e abra o fluxo completo já contextualizado.",
    href: "/plantao/roteiro-caso",
    icon: Workflow,
  },
  {
    title: "Começar caso",
    description: "Estruture queixa, sinais vitais, prioridade e passagem.",
    href: "/caso-rapido",
    icon: Gauge,
  },
  {
    title: "Passagem SBAR",
    description: "Monte uma passagem objetiva para troca de plantão.",
    href: "/plantao/sbar",
    icon: FileText,
  },
  {
    title: "Pendências",
    description: "Organize exames, reavaliações e decisões antes da troca.",
    href: "/plantao/pendencias",
    icon: ListChecks,
  },
  {
    title: "Checklist de risco",
    description: "Revise red flags, bloqueios de alta e documentação.",
    href: "/plantao/checklist-risco",
    icon: ShieldCheck,
  },
  {
    title: "Buscar conduta",
    description: "Abra protocolos e condutas por síndrome.",
    href: "/condutas",
    icon: ShieldAlert,
  },
  {
    title: "Prescrever",
    description: "Acesse modelos e copie prescrições com mais rapidez.",
    href: "/prescricao",
    icon: ClipboardList,
  },
  {
    title: "Prescrição guiada",
    description: "Organize sintomas, segurança e reavaliação por síndrome.",
    href: "/plantao/prescricao-guiada",
    icon: ClipboardList,
  },
  {
    title: "Orientações de alta",
    description: "Gere orientações e sinais de retorno para o paciente.",
    href: "/plantao/alta-segura",
    icon: LogOut,
  },
  {
    title: "Exames / evolução",
    description: "Monte blocos de evolução, exame e plano.",
    href: "/exames-evolucao",
    icon: FileText,
  },
  {
    title: "Consultar CID",
    description: "Pesquise código e descrição sem sair do fluxo.",
    href: "/cids",
    icon: Tags,
  },
  {
    title: "Revisar depois",
    description: "Volte para flashcards e tópicos ao fim do plantão.",
    href: "/flashcards",
    icon: Stethoscope,
  },
];

const SAFETY_CHECKS = [
  "Alergias, gestação, função renal/hepática e medicações em uso",
  "Sinais vitais repetidos quando houver dor, febre, dispneia ou instabilidade",
  "Red flags documentados antes de alta, observação ou transferência",
  "Hipótese principal, diferenciais perigosos e plano de reavaliação",
  "Orientações de retorno e pendências comunicadas com clareza",
];

function queryHref(path: string, query: string) {
  return `${path}?q=${encodeURIComponent(query)}`;
}

export default function PlantaoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <ModulePageHeader
        eyebrow="Resibook Shift"
        title="Central de plantão"
        description="Comece pela queixa, abra o módulo certo e mantenha visíveis os pontos de segurança do atendimento."
        badges={[
          { label: "Decisão em segundos", tone: "cyan" },
          { label: "Checklist de segurança", tone: "emerald" },
        ]}
        metrics={[
          { label: "Atalhos", value: SHIFT_ACTIONS.length },
          { label: "Síndromes", value: QUICK_COMPLAINTS.length },
          { label: "Contexto", value: "Plantão" },
        ]}
        actions={
          <>
              <Link
                href="/plantao/roteiro-caso"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
              >
                <Workflow className="h-4 w-4" />
                Roteiro
              </Link>
              <Link
                href="/caso-rapido"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
              >
                <Gauge className="h-4 w-4" />
                Novo caso rápido
              </Link>
          </>
        }
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_0.82fr]">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ações
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  O que precisa acontecer agora?
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SHIFT_ACTIONS.map((item) => (
                <ActionCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                <ClipboardCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Checklist
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Segurança antes de fechar
                </h2>
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {SAFETY_CHECKS.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </ModulePageHeader>

      <ResibookGuard context="plantao" />

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Queixas rápidas
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Escolha a síndrome e vá direto para a ação
            </h2>
          </div>

          <Link
            href="/condutas"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Search className="h-4 w-4" />
            Ver condutas
          </Link>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {QUICK_COMPLAINTS.map((item) => (
            <ComplaintHub key={item.title} title={item.title} description={item.description} group={item.group} href={item.href} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ActionCard({
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
      className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </Link>
  );
}

function ComplaintHub({
  title,
  description,
  href,
  group,
}: {
  title: string;
  description: string;
  href: string;
  group: string;
}) {
  const actions = [
    { label: "Roteiro", href: queryHref("/plantao/roteiro-caso", title) },
    { label: "Caso", href: queryHref("/caso-rapido", title) },
    { label: "Conduta", href },
    { label: "Plano", href: queryHref("/plantao/prescricao-guiada", title) },
    { label: "Rx", href: queryHref("/prescricao", title) },
    { label: "Exames", href: queryHref("/exames-evolucao", title) },
    { label: "Alta", href: queryHref("/plantao/alta-segura", title) },
    { label: "CID", href: queryHref("/cids", title) },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <Link href={href} className="min-w-0 text-sm font-semibold text-slate-950 transition hover:text-cyan-700">
          {title}
        </Link>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {group}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{description}</p>

      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-7">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-950 hover:text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </article>
  );
}
