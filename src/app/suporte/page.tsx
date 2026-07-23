"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  ShieldCheck,
  LifeBuoy,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_LINK,
} from "@/lib/support";
import ModulePageHeader from "@/components/module-page-header";

export default function SuportePage() {
  return (
    <div className="space-y-6">
      <ModulePageHeader
        eyebrow="Atendimento Resibook"
        title="Central de suporte"
        description="Canal oficial para dúvidas, problemas de acesso, correções no sistema e suporte administrativo."
        badges={[
          { label: "Atendimento direto", tone: "cyan" },
          { label: "Privacidade protegida", tone: "emerald" },
        ]}
        metrics={[
          { label: "Canais", value: "E-mail e WhatsApp" },
          { label: "Ajuda", value: "Técnica e administrativa" },
        ]}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  E-mail de suporte
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Para dúvidas, correções e solicitações administrativas.
                </p>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-3 inline-flex break-all rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
                <Phone className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Contato direto
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Use para suporte rápido quando necessário.
                </p>

                <a
                  href={`https://wa.me/${SUPPORT_PHONE_LINK}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  {SUPPORT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </ModulePageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <LifeBuoy className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Quando entrar em contato
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Problemas de login ou sessão</li>
            <li>• Conta bloqueada</li>
            <li>• Erro de carregamento em páginas</li>
            <li>• Dúvidas sobre uso do sistema</li>
            <li>• Solicitações administrativas</li>
          </ul>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <AlertCircle className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Ao relatar um problema
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Informe a página onde ocorreu</li>
            <li>• Descreva o que tentou fazer</li>
            <li>• Envie print, se possível</li>
            <li>• Diga seu e-mail de acesso</li>
            <li>• Informe horário aproximado do erro</li>
          </ul>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Privacidade e segurança
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Evite enviar dados clínicos sensíveis por canais externos, salvo
            quando estritamente necessário para suporte técnico. Sempre prefira
            relatar o problema com contexto técnico, sem expor informações de
            pacientes.
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Documentos legais
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Consulte também os documentos legais do sistema para informações
              sobre uso da plataforma, privacidade e tratamento de dados.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/termos"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Termos de Uso
              </Link>

              <Link
                href="/privacidade"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
