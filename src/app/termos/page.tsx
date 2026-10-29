import Link from "next/link";
import { BILLING_PLANS, formatPlanPrice } from "@/lib/billing/plans";
import { SELLER } from "@/lib/legal/seller";
import { PRIVACY_EMAIL, SUPPORT_EMAIL } from "@/lib/support";

const linkClass = "font-semibold text-blue-700 underline-offset-2 hover:underline";

export default function TermosDeUsoPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            ResiBook
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Termos de Uso
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Última atualização: 29/10/2026
          </p>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
          <section id="fornecedor" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-semibold text-slate-900">
              1. Quem oferece o ResiBook
            </h2>
            <ul className="mt-2 space-y-1">
              <li><strong>Fornecedor:</strong> {SELLER.name}, pessoa física</li>
              <li><strong>Documento:</strong> {SELLER.document}</li>
              <li><strong>Cidade:</strong> {SELLER.city}</li>
              <li>
                <strong>Atendimento:</strong>{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>{SUPPORT_EMAIL}</a>{" "}
                ou pela página <Link href="/suporte" className={linkClass}>Suporte</Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Aceitação dos termos
            </h2>
            <p className="mt-2">
              Ao criar uma conta, contratar um plano ou utilizar o ResiBook, o
              usuário declara que leu, compreendeu e concorda com estes Termos
              de Uso e com a{" "}
              <Link href="/privacidade" className={linkClass}>Política de Privacidade</Link>.
              Caso não concorde com alguma condição, o usuário não deve utilizar
              o sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. O que é o ResiBook
            </h2>
            <p className="mt-2">
              O ResiBook é uma ferramenta digital de apoio ao estudo e à
              organização da rotina médica, destinada a médicos e estudantes de
              Medicina. Reúne biblioteca de consulta, calculadoras, CIDs,
              flashcards, modelos de prescrição, evoluções e exames, quadro de
              plantão e espaço privado de anotações.
            </p>
            <p className="mt-2">
              O ResiBook <strong>não é um dispositivo médico</strong>, não faz
              diagnóstico, triagem nem classificação de risco de pacientes e não
              substitui julgamento clínico, protocolos institucionais, normas
              profissionais ou diretrizes oficiais. Toda decisão clínica,
              inclusive a prioridade de atendimento registrada no quadro de
              plantão, é tomada pelo profissional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Responsabilidade profissional
            </h2>
            <p className="mt-2">
              O usuário é integralmente responsável pelas informações que
              cadastra, pelas condutas que registra, pelas prescrições que emite
              e por qualquer decisão clínica tomada com apoio do sistema.
            </p>
            <p className="mt-2">
              Modelos, textos, prescrições prontas, resumos e materiais de apoio
              devem ser conferidos e adaptados pelo profissional antes de
              qualquer uso em contexto real. Doses, indicações e
              contraindicações devem ser checadas na bula e nas diretrizes
              vigentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Conteúdo de apoio e fontes
            </h2>
            <p className="mt-2">
              Os resumos, fluxogramas e materiais de revisão do ResiBook são
              elaborados a partir de diretrizes, literatura médica e provas de
              acesso público, com redação e organização próprias. Podem conter
              erros, omissões ou ficar desatualizados entre uma revisão e outra.
            </p>
            <p className="mt-2">
              O ResiBook é independente e não é afiliado, patrocinado nem
              endossado pela American Heart Association (AHA), por sociedades
              médicas, bancas examinadoras ou cursos preparatórios. Nomes e
              marcas citados pertencem aos respectivos titulares e aparecem
              apenas como referência.
            </p>
            <p className="mt-2">
              Se você identificar um erro ou um conteúdo que considere violar
              direito seu, escreva para{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>{SUPPORT_EMAIL}</a>.
              O conteúdo será revisado e, se for o caso, corrigido ou retirado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Conta e uso adequado
            </h2>
            <p className="mt-2">
              A conta é pessoal e intransferível. O usuário se compromete a:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>utilizar o sistema de forma ética, legal e profissional;</li>
              <li>não compartilhar sua senha ou conta com terceiros;</li>
              <li>não cadastrar dados falsos, ilícitos ou sem autorização;</li>
              <li>não tentar acessar dados de outros usuários;</li>
              <li>não copiar, revender ou distribuir o sistema ou seu conteúdo;</li>
              <li>manter backup próprio dos dados essenciais.</li>
            </ul>
            <p className="mt-2">
              O acesso pode ser suspenso ou encerrado em caso de uso indevido,
              compartilhamento de conta, risco de segurança ou violação destes
              termos. Sempre que possível, o usuário será avisado antes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Dados de pacientes
            </h2>
            <p className="mt-2">
              O usuário pode registrar dados de pacientes, inclusive dados de
              saúde, e é o responsável (controlador) por esse tratamento: deve
              ter fundamento legal ou dever profissional para registrá-los e
              cadastrar apenas o necessário. O ResiBook armazena esses dados em
              nome do usuário, com separação por conta e regras de segurança no
              banco de dados, conforme a{" "}
              <Link href="/privacidade" className={linkClass}>Política de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Recursos de inteligência artificial
            </h2>
            <p className="mt-2">
              Recursos de IA devem receber somente casos desidentificados. O
              usuário não deve inserir nome, CPF, CNS, telefone, e-mail ou outro
              identificador direto no texto enviado para análise. Respostas
              geradas por IA podem conter erros e exigem revisão clínica
              integral antes de qualquer uso.
            </p>
          </section>

          <section id="planos" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">
              9. Planos, pagamento e renovação
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {Object.values(BILLING_PLANS).map((plan) => (
                <li key={plan.id}>
                  <strong>Plano {plan.name}:</strong> {formatPlanPrice(plan.price)} por mês.
                </li>
              ))}
            </ul>
            <p className="mt-2">
              <strong>Cartão (assinatura automática):</strong> cobrança mensal
              processada pelo Mercado Pago, renovada automaticamente a cada mês
              até o cancelamento.
            </p>
            <p className="mt-2">
              <strong>Pix manual:</strong> pagamento único que libera 30 dias de
              acesso após a conferência do comprovante, sem renovação
              automática. O envio do comprovante não libera o acesso na hora e
              pode ser recusado em caso de divergência de valor, identificação
              ou recebimento.
            </p>
            <p className="mt-2">
              Mudanças de preço valem só para cobranças futuras e serão
              avisadas com pelo menos 30 dias de antecedência.
            </p>
          </section>

          <section id="cancelamento" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">
              10. Cancelamento e direito de arrependimento
            </h2>
            <p className="mt-2">
              <strong>Arrependimento em 7 dias:</strong> na primeira
              contratação, o usuário pode desistir em até 7 dias corridos a
              partir do pagamento e receber de volta o valor integral (Código de
              Defesa do Consumidor, art. 49). Basta pedir pelo e-mail{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>{SUPPORT_EMAIL}</a>{" "}
              ou cancelar em Minha assinatura e avisar pelo mesmo e-mail. O
              estorno é feito pelo mesmo meio de pagamento.
            </p>
            <p className="mt-2">
              <strong>Cancelamento a qualquer momento:</strong> a assinatura no
              cartão pode ser cancelada em Minha assinatura, sem multa. Depois
              do prazo de arrependimento, o cancelamento impede novas cobranças
              e o acesso continua até o fim do período já pago, sem reembolso
              proporcional.
            </p>
            <p className="mt-2">
              O acesso aos recursos pagos é suspenso quando a assinatura estiver
              cancelada e vencida, pausada ou com pagamento pendente. Os dados
              do usuário não são apagados por isso e podem ser exportados em
              Dados da conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Disponibilidade e limitações
            </h2>
            <p className="mt-2">
              O ResiBook é oferecido com empenho para funcionar de forma
              contínua e segura, mas pode passar por falhas, manutenções ou
              indisponibilidades temporárias. O usuário deve revisar todas as
              informações antes de utilizá-las em prontuários, prescrições,
              documentos médicos ou decisões assistenciais, e manter cópia
              própria dos dados essenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              12. Propriedade intelectual
            </h2>
            <p className="mt-2">
              O ResiBook, sua organização, layout, estrutura, funcionalidades e
              materiais próprios são protegidos. É proibido copiar, revender,
              sublicenciar, distribuir ou explorar comercialmente o sistema ou
              seu conteúdo sem autorização expressa. O que o usuário cadastra
              continua sendo dele.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              13. Alterações destes termos
            </h2>
            <p className="mt-2">
              Estes termos podem ser atualizados para refletir melhorias do
              sistema, mudanças legais ou novas funcionalidades. Quando houver
              mudança relevante, o novo texto será apresentado no próximo
              acesso para aceite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              14. Lei aplicável e foro
            </h2>
            <p className="mt-2">
              Estes termos seguem a legislação brasileira, incluindo o Código de
              Defesa do Consumidor e a Lei Geral de Proteção de Dados. Fica
              eleito o foro do domicílio do usuário consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              15. Contato
            </h2>
            <p className="mt-2">
              Dúvidas, solicitações ou reclamações:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>{SUPPORT_EMAIL}</a>.
              Pedidos sobre dados pessoais:{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>{PRIVACY_EMAIL}</a>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
