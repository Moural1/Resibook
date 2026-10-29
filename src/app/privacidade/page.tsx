import Link from "next/link";
import { SELLER } from "@/lib/legal/seller";
import { PRIVACY_EMAIL } from "@/lib/support";

const linkClass = "font-semibold text-emerald-700 underline-offset-2 hover:underline";

const PROVIDERS = [
  { name: "Supabase", role: "banco de dados, autenticação e armazenamento das contas e registros" },
  { name: "Vercel", role: "hospedagem do site e métricas agregadas de uso, sem cookies" },
  { name: "Mercado Pago", role: "processamento das assinaturas e pagamentos com cartão" },
  { name: "Resend", role: "envio dos e-mails de confirmação de cadastro e de troca de senha" },
  { name: "ImprovMX", role: "encaminhamento das mensagens enviadas aos e-mails de contato" },
  { name: "OpenAI", role: "recursos de IA, somente com o texto desidentificado enviado pelo usuário" },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            ResiBook
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Política de Privacidade
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Última atualização: 29/10/2026
          </p>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-semibold text-slate-900">
              1. Quem trata os dados
            </h2>
            <p className="mt-2">
              O ResiBook é oferecido por {SELLER.name}, {SELLER.city}, que atua
              como <strong>controlador</strong> dos dados da conta do usuário e
              como <strong>encarregado</strong> pelo tratamento de dados pessoais
              (LGPD, art. 41). Identificação completa nos{" "}
              <Link href="/termos#fornecedor" className={linkClass}>Termos de Uso</Link>.
              Contato do encarregado:{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>{PRIVACY_EMAIL}</a>.
            </p>
            <p className="mt-2">
              Nos <strong>dados de pacientes</strong> que o usuário registra, o
              usuário (profissional de saúde) é o controlador e o ResiBook atua
              como <strong>operador</strong>: armazena e protege esses dados em
              nome do usuário, apenas para as finalidades do sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Dados tratados
            </h2>
            <p className="mt-2 font-semibold text-slate-900">Da conta do usuário</p>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>nome, e-mail e senha (guardada de forma cifrada, nunca em texto);</li>
              <li>aceite dos Termos e da Política, com data e versão;</li>
              <li>plano, situação da assinatura e datas de cobrança;</li>
              <li>no Pix manual: nome de identificação, valor e situação da conferência;</li>
              <li>registros de acesso (e-mail, data, hora e navegador);</li>
              <li>marcações de estudo, como flashcards e agendamento de revisões.</li>
            </ul>
            <p className="mt-3 font-semibold text-slate-900">Registrados pelo usuário sobre pacientes</p>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>dados cadastrais, como nome, idade, sexo, telefone e convênio, quando preenchidos;</li>
              <li>dados de saúde: queixa, história, exame físico, hipóteses, condutas, evoluções e prescrições.</li>
            </ul>
            <p className="mt-3 font-semibold text-slate-900">Técnicos</p>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>métricas agregadas de páginas visitadas, sem cookies e sem parâmetros de busca;</li>
              <li>registros de erro do navegador, com e-mails, documentos e identificadores removidos.</li>
            </ul>
            <p className="mt-2">
              O ResiBook não recebe nem armazena dados de cartão: eles são
              coletados diretamente pelo Mercado Pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Para que e com qual base legal
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                <strong>Prestar o serviço contratado</strong> (login, separação
                de dados por usuário, assinatura, suporte): execução de contrato
                (LGPD, art. 7º, V).
              </li>
              <li>
                <strong>Segurança e prevenção de fraude</strong> (registros de
                acesso, bloqueio de contas, erros técnicos): legítimo interesse
                (art. 7º, IX) e guarda de registros de acesso exigida pelo Marco
                Civil da Internet (Lei 12.965/2014, art. 15).
              </li>
              <li>
                <strong>Obrigações fiscais e legais</strong> sobre pagamentos:
                cumprimento de obrigação legal (art. 7º, II).
              </li>
              <li>
                <strong>Dados de saúde de pacientes</strong>: tratados por
                decisão do profissional, que define a base legal, em geral a
                tutela da saúde por profissional de saúde (art. 11, II, f).
              </li>
            </ul>
            <p className="mt-2">
              Os dados não são vendidos, não são usados para publicidade e não
              são usados para treinar modelos de IA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Com quem os dados são compartilhados
            </h2>
            <p className="mt-2">
              Somente com os fornecedores técnicos necessários para o sistema
              funcionar, cada um limitado à sua função:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {PROVIDERS.map((provider) => (
                <li key={provider.name}>
                  <strong>{provider.name}:</strong> {provider.role};
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Alguns desses fornecedores mantêm servidores fora do Brasil. A
              transferência internacional ocorre para executar o serviço
              contratado e com fornecedores que adotam cláusulas contratuais e
              padrões de segurança compatíveis com a LGPD (art. 33).
            </p>
            <p className="mt-2">
              Os dados também podem ser fornecidos a autoridades quando houver
              ordem judicial ou obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Inteligência artificial
            </h2>
            <p className="mt-2">
              Quando o usuário usa um recurso de IA, somente o texto do caso que
              ele escreveu é enviado ao provedor, sem o nome do paciente. O
              sistema bloqueia padrões de CPF, CNS, telefone e e-mail, mas o
              usuário continua responsável por remover outros identificadores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Segurança
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>conexão cifrada (HTTPS) em todo o site;</li>
              <li>login individual e confirmação de e-mail no cadastro;</li>
              <li>separação dos dados por usuário com regras no próprio banco de dados (Row Level Security);</li>
              <li>acesso administrativo restrito à conta do responsável pelo sistema;</li>
              <li>bloqueio de contas em caso de uso indevido.</li>
            </ul>
            <p className="mt-2">
              Em caso de incidente de segurança que possa causar risco ou dano
              relevante, os titulares afetados e a Autoridade Nacional de
              Proteção de Dados (ANPD) serão comunicados (LGPD, art. 48).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Cookies
            </h2>
            <p className="mt-2">
              O ResiBook usa apenas cookies essenciais de sessão, necessários
              para manter o login. Não usa cookies de publicidade nem de
              rastreamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Por quanto tempo os dados ficam guardados
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>dados da conta e registros do usuário: enquanto a conta existir;</li>
              <li>após o pedido de exclusão da conta: apagados em até 30 dias;</li>
              <li>registros de acesso: no mínimo 6 meses, como exige o Marco Civil da Internet;</li>
              <li>dados de pagamento: pelo prazo exigido pela legislação fiscal.</li>
            </ul>
            <p className="mt-2">
              Antes de excluir a conta, o usuário pode baixar uma cópia completa
              dos seus dados em Dados da conta. Registros clínicos podem ter
              prazos de guarda próprios definidos pelas normas profissionais,
              que são responsabilidade do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Seus direitos
            </h2>
            <p className="mt-2">
              O titular pode pedir, a qualquer momento: confirmação de que há
              tratamento, acesso, correção, anonimização, bloqueio ou eliminação
              de dados desnecessários, portabilidade, informação sobre
              compartilhamento, revogação de consentimento e exclusão da conta
              (LGPD, art. 18).
            </p>
            <p className="mt-2">
              Peça pelo e-mail{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>{PRIVACY_EMAIL}</a>,
              a partir do e-mail da conta. A resposta é dada em até 15 dias. O
              titular também pode reclamar à ANPD.
            </p>
            <p className="mt-2">
              Pedidos de pacientes sobre dados registrados por um profissional
              são encaminhados a esse profissional, que é o controlador desses
              dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Responsabilidade do usuário
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>manter sigilo da senha e não compartilhar a conta;</li>
              <li>cadastrar apenas dados de pacientes necessários e adequados;</li>
              <li>não colocar dados identificáveis de pacientes em conteúdos compartilhados;</li>
              <li>guardar em local seguro arquivos exportados ou impressos;</li>
              <li>cumprir os deveres éticos e legais da profissão.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Alterações desta política
            </h2>
            <p className="mt-2">
              Esta política pode ser atualizada. Quando houver mudança
              relevante, o novo texto será apresentado no próximo acesso para
              aceite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              12. Contato
            </h2>
            <p className="mt-2">
              Encarregado pelo tratamento de dados:{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className={linkClass}>{PRIVACY_EMAIL}</a>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
