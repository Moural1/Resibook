import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  Check,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Copy,
  FlaskConical,
  HeartPulse,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Do primeiro atendimento à passagem de plantão",
  description:
    "Condutas por queixa, prescrições, ACLS, checklist de risco e SBAR para residentes e plantonistas, com um acervo pessoal adaptável ao seu hospital.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

type IconType = ComponentType<{ className?: string }>;

const NAV_LINKS = [
  ["#como-funciona", "Como funciona"],
  ["#meu-resibook", "Meu Resibook"],
  ["#recursos", "Recursos"],
  ["#planos", "Planos"],
] as const;

const SHIFT_STEPS: { title: string; description: string; icon: IconType }[] = [
  {
    title: "Roteiro do caso",
    description: "Digite a queixa e abra condutas, diagnósticos diferenciais e red flags já contextualizados.",
    icon: Search,
  },
  {
    title: "Prescrição guiada",
    description: "Sintomas, segurança e reavaliação por síndrome, com modelos prontos para copiar.",
    icon: ClipboardList,
  },
  {
    title: "Checklist de risco",
    description: "Revise bloqueios de alta, sinais de alarme e documentação antes de liberar.",
    icon: ClipboardCheck,
  },
  {
    title: "Passagem SBAR",
    description: "Pendências e passagem objetiva para a troca de plantão, sem esquecer nada.",
    icon: MessageSquareText,
  },
];

const RESOURCE_GROUPS: { title: string; items: { label: string; icon: IconType }[] }[] = [
  {
    title: "Emergência",
    items: [
      { label: "ACLS com eBook estruturado", icon: HeartPulse },
      { label: "ECG guiado", icon: Activity },
      { label: "Calculadoras clínicas", icon: Calculator },
    ],
  },
  {
    title: "Paciente",
    items: [
      { label: "Pacientes e retornos", icon: Users },
      { label: "Exames e evolução", icon: FlaskConical },
      { label: "CIDs", icon: Tags },
    ],
  },
  {
    title: "Estudo",
    items: [
      { label: "Tópicos médicos", icon: BookOpen },
      { label: "Flashcards com revisão", icon: Brain },
      { label: "Condutas por síndrome", icon: Stethoscope },
    ],
  },
];

const FAQ = [
  ["Funciona no celular durante o plantão?", "Sim. O Resibook roda no navegador do celular, sem instalar nada, e foi desenhado para consulta rápida em tela pequena."],
  ["Minhas adaptações ficam visíveis para outras pessoas?", "Não. O Meu Resibook é privado e protegido por regras de acesso vinculadas à sua conta."],
  ["O Banco Resibook pode ser alterado por qualquer médico?", "Não. Médicos consultam e copiam; a edição do conteúdo global fica restrita à equipe autorizada."],
  ["Posso cancelar quando quiser?", "Sim. Não há fidelidade, e a assinatura é gerenciada na área Minha assinatura."],
] as const;

function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
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
        className={`${compact ? "text-base" : "text-xl"} font-semibold tracking-[0] ${
          inverse ? "text-white" : "text-[#0b1d40]"
        }`}
      >
        RESI
        <span className={inverse ? "text-cyan-300" : "text-cyan-700"}>
          BOOK
        </span>
      </span>
    </span>
  );
}

function PhonePreview() {
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[40px] border border-slate-300/70 bg-[#0b1d40] p-2.5 shadow-[0_32px_90px_rgba(9,26,56,0.28)]">
      <div className="overflow-hidden rounded-[32px] bg-slate-50">
        <div className="flex items-center justify-between bg-[#091a38] px-5 pb-4 pt-5 text-white">
          <Brand compact inverse />
          <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
            Plantão
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-800">dor torácica</span>
            <span className="ml-auto h-4 w-px animate-pulse bg-cyan-700" />
          </div>

          <div className="rounded-xl border border-cyan-200 bg-white p-3.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Urgência
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">Dor torácica</p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              SCA, IAM, TEP, dissecção e causas não cardíacas.
            </p>
          </div>

          <div className="space-y-1.5">
            {SHIFT_STEPS.map(({ title, icon: Icon }, index) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-semibold text-slate-800">{title}</span>
                {index < 2 ? (
                  <Check className="ml-auto h-4 w-4 text-emerald-600" />
                ) : (
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#091a38] px-3 py-2.5 text-white">
            <HeartPulse className="h-4 w-4 text-cyan-300" />
            <span className="text-[11px] font-semibold">ACLS a um toque</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white p-5 text-slate-950 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Meu Resibook
          </p>
          <p className="mt-1 text-sm font-semibold">Pneumonia comunitária — ambulatorial</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
          Minha versão
        </span>
      </div>
      <ol className="mt-4 space-y-2 text-xs leading-5 text-slate-700">
        <li className="rounded-lg bg-slate-50 px-3 py-2">1. Antibiótico conforme protocolo do serviço</li>
        <li className="rounded-lg border border-cyan-200 bg-cyan-50/60 px-3 py-2">
          <span className="font-semibold text-cyan-900">2. Ajuste do meu hospital:</span> reavaliar em 48 h no ambulatório
        </li>
        <li className="rounded-lg bg-slate-50 px-3 py-2">3. Sinais de alarme para retorno imediato</li>
      </ol>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#091a38] px-3 py-2 text-white">
          <Copy className="h-3.5 w-3.5" />
          Copiar prescrição
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-slate-600">
          <Star className="h-3.5 w-3.5" />
          Favorito
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:h-[70px] sm:px-6 lg:px-10">
          <Link href="/" aria-label="ResiBook - página inicial" className="shrink-0">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            {NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap px-2 text-sm font-semibold text-slate-700 sm:px-3 transition hover:text-slate-950"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro?plano=complete"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-cyan-800 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-900 sm:px-4"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo-principal" tabIndex={-1}>
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#eef4f9]">
          <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10 lg:pb-24 lg:pt-20">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cyan-900">
                <Stethoscope className="h-3.5 w-3.5" />
                Para residentes e plantonistas
              </p>
              <h1 className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#091a38] sm:text-5xl lg:text-[60px]">
                Do primeiro atendimento à passagem de plantão.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Digite a queixa e siga um fluxo pronto: conduta, prescrição,
                checklist de risco e SBAR. Com ACLS a um toque e um acervo
                pessoal onde você adapta tudo ao protocolo do seu hospital.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro?plano=complete"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(14,116,144,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-900"
                >
                  Criar minha conta
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-cyan-700 bg-white px-6 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Ver como funciona
                </a>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-700">
                {["Funciona no celular", "Planos a partir de R$ 30/mês", "Acervo privado por médico"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <PhonePreview />
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Como funciona</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-[#091a38] sm:text-4xl">
                Um caso inteiro, sem trocar de app.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Cada etapa já chega com o contexto da anterior. Você não recomeça
                a busca a cada decisão.
              </p>
            </div>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SHIFT_STEPS.map(({ title, description, icon: Icon }, index) => (
                <li key={title} className="relative rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#ffffff,#f5f9fc)] p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.18em] text-cyan-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="meu-resibook" className="scroll-mt-20 bg-[#091a38] py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Meu Resibook</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                O conteúdo é nosso. A versão final é sua.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Todo serviço tem seu jeito de fazer. Copie qualquer prescrição ou
                flashcard do Banco Resibook para o seu acervo, ajuste ao protocolo
                do seu hospital e tenha a sua versão pronta no próximo plantão.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {[
                  "Banco Resibook padronizado, mantido pela nossa equipe",
                  "Cópias privadas e editáveis, só você vê",
                  "Favoritos e modelos principais sempre à mão",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <WorkspacePreview />
          </div>
        </section>

        <section id="recursos" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Também no Resibook</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.025em] text-[#091a38] sm:text-4xl">
              Para a emergência, para o paciente e para a prova.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {RESOURCE_GROUPS.map(({ title, items }) => (
                <div key={title}>
                  <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
                  <ul className="mt-3 space-y-2">
                    {items.map(({ label, icon: Icon }) => (
                      <li key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-slate-800">
                        <Icon className="h-4 w-4 shrink-0 text-cyan-700" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Planos
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[0] text-[#091a38] sm:text-4xl">
                Menos que um lanche de plantão por semana
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Crie sua conta, pague com segurança no Mercado Pago e tenha o
                acesso liberado automaticamente.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Plano Básico</p>
                <p className="mt-3 text-4xl font-semibold tracking-[0] text-[#091a38]">
                  R$ 30<span className="text-base font-medium text-slate-500">/mês</span>
                </p>
                <p className="mt-5 text-sm leading-6 text-slate-600 md:min-h-[72px]">
                  Biblioteca clínica para consulta, estudo e apoio durante a
                  rotina médica.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {["Calculadoras clínicas", "CIDs e tópicos médicos", "Flashcards e biblioteca essencial"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-cyan-700" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro?plano=basic"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-cyan-700 bg-white px-5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                >
                  Assinar o Básico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>

              <article className="relative rounded-lg border border-cyan-700 bg-[#091a38] p-7 text-white shadow-[0_18px_48px_rgba(9,26,56,0.18)]">
                <span className="absolute right-5 top-5 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Para o plantão
                </span>
                <p className="text-sm font-semibold text-cyan-200">Plano Completo</p>
                <p className="mt-3 text-4xl font-semibold tracking-[0] text-white">
                  R$ 50<span className="text-base font-medium text-slate-300">/mês</span>
                </p>
                <p className="mt-5 text-sm leading-6 text-slate-300 md:min-h-[72px]">
                  Acesso completo ao workspace privado, plantão, prescrições,
                  exames e todos os recursos do Resibook.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {["Tudo do plano Básico", "Meu Resibook e cópias privadas", "Plantão, prescrições, exames e condutas"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-cyan-300" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro?plano=complete"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  Assinar o Completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section id="seguranca" className="scroll-mt-20 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Perguntas frequentes</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#091a38]">Antes de começar</h2>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-slate-950">
                    {question}
                    <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 text-sm leading-6 text-slate-700">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" />
              O Resibook é uma ferramenta de apoio para profissionais habilitados.
              Não substitui julgamento clínico, exame físico, protocolos locais ou
              diretrizes atualizadas.
            </p>
          </div>
        </section>

        <section className="bg-[#eef4f9] py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#091a38] sm:text-3xl">
              Seu próximo plantão pode começar mais organizado.
            </h2>
            <Link
              href="/cadastro?plano=complete"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-6 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              Criar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
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
            <Link href="/suporte" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Suporte
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
          © 2026 ResiBook. Uso profissional médico.
        </div>
      </footer>
    </div>
  );
}
