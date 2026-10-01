import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import type { Metadata } from "next";
import LandingGallery from "../components/landing-gallery";
import modeloCard from "../../public/landing/modelo-card.webp";
import heroDesktop from "../../public/landing/hero-desktop.webp";
import heroMobile from "../../public/landing/hero-mobile.webp";
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
  FlaskConical,
  HeartPulse,
  MessageSquareText,
  Search,
  ShieldCheck,
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

const PLAN_ROWS: [string, boolean][] = [
  ["Calculadoras clínicas, CIDs e tópicos médicos", true],
  ["ACLS com eBook e ECG guiado", true],
  ["Flashcards do Banco Resibook", true],
  ["Plantão: roteiro do caso, caso rápido, alta segura e SBAR", false],
  ["Prescrições e modelos prontos para copiar", false],
  ["Exames, evolução e condutas", false],
  ["Revisão dos flashcards difíceis", false],
  ["Meu Resibook: cópias privadas e editáveis", false],
];

/* Depoimentos reais de usuários. A seção só aparece quando houver itens:
   nunca preencher com depoimentos fictícios. */
const TESTIMONIALS: { quote: string; name: string; role: string }[] = [];

const FAQ = [
  ["Funciona no celular durante o plantão?", "Sim. O Resibook roda no navegador do celular e foi desenhado para consulta rápida em tela pequena. Você também pode adicioná-lo à tela inicial para abrir como um app."],
  ["Qual a diferença entre o Básico e o Completo?", "O Básico reúne a biblioteca de consulta e estudo: calculadoras, CIDs, tópicos, ACLS e flashcards. O Completo acrescenta as ferramentas do plantão (roteiro do caso, prescrições, exames, condutas) e o Meu Resibook, seu acervo privado."],
  ["Quais as formas de pagamento?", "Cartão pelo Mercado Pago, com liberação automática, ou Pix. A assinatura é mensal."],
  ["Posso trocar de plano depois?", "Sim. Você pode começar no Básico e fazer upgrade para o Completo quando quiser, pela área Minha assinatura."],
  ["Minhas adaptações ficam visíveis para outras pessoas?", "Não. O Meu Resibook é privado e protegido por regras de acesso vinculadas à sua conta."],
  ["O Banco Resibook pode ser alterado por qualquer médico?", "Não. Médicos consultam e copiam; a edição do conteúdo global fica restrita à equipe autorizada."],
  ["Posso cancelar quando quiser?", "Sim. Não há fidelidade, e a assinatura é gerenciada na área Minha assinatura."],
  ["Como meus dados e os dos pacientes são protegidos?", "Cada conta só acessa os próprios registros, com regras de segurança no banco de dados. Recomendamos não registrar dados que identifiquem o paciente além do necessário, e você pode apagar seus registros a qualquer momento. Detalhes na Política de privacidade."],
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

const LIBRARY_STATS = [
  ["200+", "tópicos clínicos"],
  ["120+", "modelos de prescrição"],
  ["700+", "flashcards"],
  ["290+", "CIDs"],
  ["15", "calculadoras clínicas"],
] as const;

function BrowserFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_32px_80px_rgba(9,26,56,0.18)] ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-3 hidden h-5 flex-1 items-center rounded-md border border-slate-200 bg-white px-2 text-[10px] font-medium text-slate-400 sm:flex">
          Resibook · Roteiro de caso
        </span>
      </div>
      {children}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative lg:pb-10">
      <div className="mx-auto w-[244px] rounded-[34px] border border-slate-300/70 bg-[#0b1d40] p-2 shadow-[0_28px_70px_rgba(9,26,56,0.28)] sm:hidden">
        <Image
          src={heroMobile}
          alt="Roteiro de dor torácica do Resibook no celular"
          placeholder="blur"
          priority
          sizes="244px"
          className="h-auto w-full rounded-[27px]"
        />
      </div>
      <BrowserFrame className="hidden sm:block">
        <Image
          src={heroDesktop}
          alt="Roteiro de caso do Resibook com prioridades e red flags para dor torácica"
          placeholder="blur"
          priority
          sizes="(min-width: 1180px) 720px, 100vw"
          className="h-auto w-full"
        />
      </BrowserFrame>
      <div className="absolute -bottom-2 -left-6 hidden w-[168px] rounded-[30px] border border-slate-300/70 bg-[#0b1d40] p-1.5 shadow-[0_28px_70px_rgba(9,26,56,0.3)] sm:block xl:-left-10 xl:w-[188px]">
        <Image
          src={heroMobile}
          alt="O mesmo roteiro de dor torácica no celular"
          placeholder="blur"
          sizes="190px"
          className="h-auto w-full rounded-[24px]"
        />
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
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="landing-hero-grid relative mx-auto grid max-w-[1320px] items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20">
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

            <HeroVisual />
          </div>
        </section>

        <section aria-label="Conteúdo do Banco Resibook" className="border-b border-slate-200 bg-white">
          <dl className="mx-auto grid max-w-[1320px] grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-5 lg:px-10">
            {LIBRARY_STATS.map(([value, label]) => (
              <div key={label} className="text-center last:col-span-2 md:border-l md:border-slate-200 md:first:border-l-0 md:last:col-span-1">
                <dt className="sr-only">{label}</dt>
                <dd className="text-3xl font-semibold tracking-[-0.03em] text-[#091a38]">{value}</dd>
                <dd className="mt-1 text-sm font-medium text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
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

            <div className="mt-16 border-t border-slate-200 pt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Veja por dentro</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#091a38] sm:text-3xl">
                As telas que você vai usar no plantão.
              </h3>
              <div className="mt-8">
                <LandingGallery />
              </div>
            </div>
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
              <Image
                src={modeloCard}
                alt="Modelo de prescrição do Banco Resibook com os botões Favoritar, Copiar e Duplicar para Meu Resibook"
                placeholder="blur"
                sizes="(min-width: 1024px) 540px, 100vw"
                className="h-auto w-full"
              />
            </div>
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
                Crie sua conta, pague por cartão ou Pix e comece a usar no
                mesmo plantão.
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

            <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Comparação entre os planos Básico e Completo</caption>
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold sm:px-6">O que está incluído</th>
                    <th scope="col" className="w-20 px-2 py-3 text-center font-semibold sm:w-28">Básico</th>
                    <th scope="col" className="w-20 px-2 py-3 text-center font-semibold text-cyan-800 sm:w-28">Completo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PLAN_ROWS.map(([label, basic]) => (
                    <tr key={label}>
                      <th scope="row" className="px-4 py-3 font-medium text-slate-800 sm:px-6">{label}</th>
                      <td className="px-2 py-3 text-center">
                        {basic ? (
                          <Check className="mx-auto h-4 w-4 text-cyan-700" aria-label="Incluído" />
                        ) : (
                          <span className="text-slate-300" aria-label="Não incluído">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <Check className="mx-auto h-4 w-4 text-cyan-700" aria-label="Incluído" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
              {["Cartão via Mercado Pago ou Pix", "Acesso liberado na hora", "Sem fidelidade: cancele quando quiser"].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {TESTIMONIALS.length > 0 && (
          <section aria-label="Depoimentos" className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Quem usa</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#091a38]">O que dizem os médicos</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {TESTIMONIALS.map(({ quote, name, role }) => (
                  <figure key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <blockquote className="text-base leading-7 text-slate-700">“{quote}”</blockquote>
                    <figcaption className="mt-4 text-sm">
                      <span className="font-semibold text-slate-900">{name}</span>
                      <span className="text-slate-500"> · {role}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

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
