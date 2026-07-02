import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  Check,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Search,
  ShieldCheck,
  Siren,
  Stethoscope,
  Tags,
} from "lucide-react";

export const WHATSAPP_NUMBER = "5531984812506";

const DEFAULT_MESSAGE = "Olá! Tenho interesse em conhecer o Resibook.";

function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const FEATURES: Feature[] = [
  {
    title: "Prescrições prontas",
    description: "Modelos organizados para consulta e adaptação à rotina clínica.",
    icon: ClipboardList,
  },
  {
    title: "Plantão rápido",
    description: "Fluxos práticos para estruturar avaliação, risco e próximos passos.",
    icon: Siren,
  },
  {
    title: "Flashcards do banco",
    description: "Revisões objetivas para manter conteúdos importantes acessíveis.",
    icon: Brain,
  },
  {
    title: "CIDs",
    description: "Busca rápida por códigos, descrições e áreas clínicas.",
    icon: Tags,
  },
  {
    title: "Calculadoras clínicas",
    description: "Escores com interpretação, limitações e texto para evolução.",
    icon: Calculator,
  },
  {
    title: "Tópicos médicos",
    description: "Biblioteca clínica estruturada para consulta durante o atendimento.",
    icon: Stethoscope,
  },
  {
    title: "Exames e evolução",
    description: "Modelos para organizar solicitações, registros e reavaliações.",
    icon: FlaskConical,
  },
];

const PREVIEW_MODULES = [
  { label: "Plantão", icon: Activity },
  { label: "Prescrição", icon: ClipboardList },
  { label: "Exames / Evolução", icon: FlaskConical },
  { label: "Tópicos", icon: BookOpen },
  { label: "Flashcards", icon: Brain },
  { label: "Condutas", icon: Siren },
  { label: "CIDs", icon: Tags },
  { label: "Calculadoras", icon: Calculator },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${compact ? "h-8 w-8" : "h-10 w-10"}`}
      >
        <Image
          src="/resibook-icon.svg"
          alt=""
          width={compact ? 32 : 40}
          height={compact ? 32 : 40}
          className="h-full w-full"
        />
      </span>
      <span
        className={`${compact ? "text-base" : "text-xl"} font-semibold tracking-[0] text-[#0b1d40]`}
      >
        RESI<span className="text-cyan-700">BOOK</span>
      </span>
    </span>
  );
}

function AppPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
      <div className="grid min-h-[430px] grid-cols-[150px_minmax(0,1fr)] sm:grid-cols-[175px_minmax(0,1fr)]">
        <aside className="bg-[#091a38] p-3.5 text-white sm:p-4">
          <Brand compact />
          <div className="mt-6 space-y-1">
            {PREVIEW_MODULES.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-[10px] font-medium sm:text-[11px] ${
                    index === 0
                      ? "bg-white/10 text-white"
                      : "text-slate-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="h-2 w-20 rounded-full bg-white/10" />
            <div className="mt-2 h-2 w-14 rounded-full bg-white/5" />
          </div>
        </aside>

        <div className="min-w-0 bg-slate-50 p-3 sm:p-5">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate text-[10px] text-slate-400 sm:text-xs">
              Buscar no ResiBook...
            </span>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Visão geral
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-[0] text-slate-950 sm:text-xl">
              Rotina clínica organizada
            </h2>
            <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
              Acesso direto aos módulos que apoiam o plantão e o estudo.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {PREVIEW_MODULES.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="min-h-[82px] rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan-100 bg-cyan-50 text-cyan-800">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2 truncate text-[10px] font-semibold text-slate-800 sm:text-[11px]">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Continuidade clínica
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-800">
                  Próximos passos em um só fluxo
                </p>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterestLink({
  message = DEFAULT_MESSAGE,
  children,
  className = "",
}: {
  message?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ResiBook - página inicial">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#recursos" className="transition hover:text-slate-950">
              Recursos
            </a>
            <a href="#planos" className="transition hover:text-slate-950">
              Planos
            </a>
            <a href="#seguranca" className="transition hover:text-slate-950">
              Segurança
            </a>
            <Link href="/login" className="transition hover:text-slate-950">
              Entrar
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center px-3 text-sm font-semibold text-slate-700 md:hidden"
            >
              Entrar
            </Link>
            <InterestLink
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-900"
            >
              <MessageCircle className="hidden h-4 w-4 sm:block" />
              Tenho interesse
            </InterestLink>
          </div>
        </div>
      </header>

      <main id="conteudo-principal">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#eef4f9]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:min-h-[650px] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-10 lg:pb-16 lg:pt-14">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                <HeartPulse className="h-4 w-4" />
                Plataforma para médicos
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[0] text-[#091a38] sm:text-5xl lg:text-[58px]">
                Sua rotina médica em um só lugar
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Prescrições, condutas de plantão, flashcards, CIDs,
                calculadoras, tópicos médicos e modelos de evolução em uma
                plataforma organizada para apoiar a rotina clínica.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <InterestLink className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(14,116,144,0.2)] transition hover:bg-cyan-900">
                  Tenho interesse
                  <ArrowRight className="h-4 w-4" />
                </InterestLink>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-cyan-700 bg-white px-6 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Entrar
                </Link>
              </div>

              <p className="mt-7 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-700" />
                Uso profissional médico • Ferramenta de apoio à decisão clínica
              </p>
            </div>

            <div className="relative z-10 lg:translate-x-4">
              <AppPreview />
            </div>
          </div>
        </section>

        <section id="recursos" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Recursos
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[0] text-[#091a38] sm:text-4xl">
                Menos navegação. Mais clareza no plantão.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Uma biblioteca clínica organizada para consulta rápida, estudo e
                documentação, sem misturar dados entre médicos.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-cyan-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-[0] text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="planos" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Planos
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[0] text-[#091a38] sm:text-4xl">
                Escolha o acesso para sua rotina
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Sem checkout automático neste momento. O atendimento e a
                liberação são feitos diretamente pelo WhatsApp.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Plano Básico</p>
                <p className="mt-3 text-4xl font-semibold tracking-[0] text-[#091a38]">
                  R$ 30<span className="text-base font-medium text-slate-500">/mês</span>
                </p>
                <p className="mt-5 min-h-[72px] text-sm leading-6 text-slate-600">
                  Acesso limitado às funções básicas do Resibook para consulta
                  rápida e organização da rotina médica.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {["Biblioteca clínica essencial", "Consulta rápida por módulos", "Acesso individual protegido"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-cyan-700" />
                      {item}
                    </li>
                  ))}
                </ul>
                <InterestLink
                  message="Olá! Tenho interesse no Plano Básico do Resibook."
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-cyan-700 bg-white px-5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Tenho interesse no Básico
                  <MessageCircle className="h-4 w-4" />
                </InterestLink>
              </article>

              <article className="relative rounded-lg border border-cyan-700 bg-[#091a38] p-7 text-white shadow-[0_18px_48px_rgba(9,26,56,0.18)]">
                <span className="absolute right-5 top-5 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Mais completo
                </span>
                <p className="text-sm font-semibold text-cyan-200">Plano Completo</p>
                <p className="mt-3 text-4xl font-semibold tracking-[0] text-white">
                  R$ 50<span className="text-base font-medium text-slate-300">/mês</span>
                </p>
                <p className="mt-5 min-h-[72px] text-sm leading-6 text-slate-300">
                  Acesso à aba de plantão rápido, prescrições prontas e
                  flashcards do banco, além dos recursos essenciais do Resibook.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {["Plantão rápido e condutas", "Prescrições e flashcards", "Todos os recursos essenciais"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-cyan-300" />
                      {item}
                    </li>
                  ))}
                </ul>
                <InterestLink
                  message="Olá! Tenho interesse no Plano Completo do Resibook."
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  Tenho interesse no Completo
                  <MessageCircle className="h-4 w-4" />
                </InterestLink>
              </article>
            </div>
          </div>
        </section>

        <section id="seguranca" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-[auto_1fr] md:items-center lg:px-10">
            <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-800">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Segurança e responsabilidade
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[0] text-[#091a38] sm:text-3xl">
                Apoio organizado, decisão sempre profissional
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                O Resibook é uma ferramenta de apoio para profissionais
                habilitados. Não substitui julgamento clínico, exame físico,
                protocolos locais ou diretrizes atualizadas.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#091a38] text-slate-300">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-xl font-semibold tracking-[0] text-white">
              RESI<span className="text-cyan-300">BOOK</span>
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Ferramenta de apoio à rotina médica
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link href="/termos" className="transition hover:text-white">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="transition hover:text-white">
              Política de privacidade
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Entrar
            </Link>
            <InterestLink className="inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </InterestLink>
          </nav>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
          © 2026 ResiBook. Uso profissional médico.
        </div>
      </footer>
    </div>
  );
}

