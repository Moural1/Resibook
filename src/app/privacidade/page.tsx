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
            Última atualização: 03/07/2026
          </p>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Objetivo desta política
            </h2>
            <p className="mt-2">
              Esta Política de Privacidade explica como o ResiBook trata dados
              pessoais e dados sensíveis inseridos no sistema por seus usuários,
              especialmente informações relacionadas a pacientes, prontuários,
              prescrições e evoluções clínicas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Dados que podem ser tratados
            </h2>
            <p className="mt-2">
              O ResiBook pode armazenar os seguintes tipos de informação:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>dados de conta do usuário, como e-mail de login;</li>
              <li>plano contratado, situação da assinatura e datas de cobrança;</li>
              <li>dados cadastrais de pacientes, como nome, idade, sexo e telefone;</li>
              <li>dados de plano de saúde ou carteirinha, quando preenchidos;</li>
              <li>dados clínicos, como queixa, HMA, HPP e medicamentos em uso;</li>
              <li>exame físico, hipótese diagnóstica, condutas e observações;</li>
              <li>evoluções, anotações, prescrições e documentos vinculados;</li>
              <li>logs de acesso, como e-mail, data, hora e navegador utilizado;</li>
              <li>marcações pessoais do usuário, como flashcards difíceis.</li>
              <li>casos clínicos desidentificados enviados voluntariamente a recursos de IA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Dados pessoais sensíveis
            </h2>
            <p className="mt-2">
              Informações de saúde são consideradas dados pessoais sensíveis.
              Por isso, o usuário deve cadastrar tais informações apenas quando
              houver fundamento adequado, autorização, dever profissional,
              finalidade assistencial, organizacional ou justificativa legal
              compatível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Finalidades do tratamento
            </h2>
            <p className="mt-2">
              Os dados podem ser utilizados para:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>permitir login e autenticação de usuários;</li>
              <li>organizar pacientes por usuário;</li>
              <li>registrar prontuários, evoluções, prescrições e condutas;</li>
              <li>permitir impressão/exportação de documentos clínicos;</li>
              <li>separar dados privados de cada usuário;</li>
              <li>melhorar a navegação e segurança do sistema;</li>
              <li>registrar acessos para auditoria básica;</li>
              <li>bloquear usuários quando necessário.</li>
              <li>processar a contratação e controlar o acesso ao plano escolhido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Separação de dados por usuário
            </h2>
            <p className="mt-2">
              O ResiBook utiliza autenticação e regras de segurança no banco de
              dados para que pacientes, prescrições e evoluções fiquem
              vinculados ao usuário que os cadastrou.
            </p>
            <p className="mt-2">
              Usuários comuns não devem visualizar pacientes, prescrições ou
              evoluções cadastrados por outros usuários.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Conteúdos compartilhados
            </h2>
            <p className="mt-2">
              Algumas bases do sistema podem ser compartilhadas entre usuários,
              como CIDs, tópicos médicos, modelos de exames, modelos de
              prescrição e flashcards gerais. Esses conteúdos não devem conter
              dados identificáveis de pacientes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Medidas de segurança
            </h2>
            <p className="mt-2">
              O ResiBook adota medidas técnicas e organizacionais para proteger
              os dados, incluindo:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>login individual por usuário;</li>
              <li>controle de sessão;</li>
              <li>separação de dados por identificador do usuário;</li>
              <li>Row Level Security no banco de dados;</li>
              <li>restrição de acesso ao usuário convidado;</li>
              <li>logs de acesso;</li>
              <li>bloqueio administrativo de usuários;</li>
              <li>conexão segura por HTTPS no ambiente de hospedagem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Compartilhamento de dados
            </h2>
            <p className="mt-2">
              O ResiBook não tem como finalidade vender, divulgar ou compartilhar
              dados de pacientes com terceiros. Os dados podem ser processados
              por serviços técnicos necessários ao funcionamento do sistema,
              como hospedagem, autenticação e banco de dados.
            </p>
            <p className="mt-2">
              O usuário é responsável por qualquer exportação, impressão,
              compartilhamento externo ou uso clínico dos dados que cadastrar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Backup e exportação
            </h2>
            <p className="mt-2">
              O sistema pode permitir exportação ou backup dos dados. O usuário
              deve armazenar arquivos exportados em local seguro, especialmente
              quando contiverem dados clínicos ou informações identificáveis de
              pacientes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9.1. Processamento por inteligência artificial
            </h2>
            <p className="mt-2">
              Quando o recurso de IA estiver habilitado, o texto desidentificado
              do caso poderá ser enviado ao provedor técnico configurado para gerar
              a resposta. O sistema bloqueia padrões de CPF, CNS, telefone e e-mail,
              mas o usuário continua responsável por remover outros identificadores.
            </p>
            <p className="mt-2">
              Para processar assinaturas, o e-mail da conta, o plano escolhido e
              uma referência interna do usuário são enviados ao Mercado Pago. Os
              dados do cartão e demais dados financeiros são coletados e tratados
              diretamente pelo provedor de pagamento, não pelo ResiBook.
            </p>
            <p className="mt-2">
              No Pix manual, o ResiBook registra usuário, plano, valor, e-mail,
              nome de identificação e situação da conferência. O comprovante é
              enviado pelo canal de suporte e deve conter apenas os dados
              necessários para confirmar o pagamento.
            </p>
            <p className="mt-2">
              O vínculo interno com um paciente, quando utilizado, serve apenas para
              organização e validação de acesso e não inclui automaticamente o nome
              do paciente no texto enviado à IA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Retenção e exclusão
            </h2>
            <p className="mt-2">
              Os dados podem permanecer armazenados enquanto a conta estiver
              ativa ou enquanto forem necessários para as finalidades do sistema.
              O usuário pode solicitar exclusão ou correção de dados, observadas
              eventuais obrigações profissionais, legais ou éticas relacionadas
              a registros médicos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Direitos dos titulares
            </h2>
            <p className="mt-2">
              Nos termos da legislação aplicável, titulares de dados podem ter
              direitos como confirmação de tratamento, acesso, correção,
              anonimização, bloqueio, eliminação, informação sobre
              compartilhamento e revogação de consentimento quando aplicável.
            </p>
            <p className="mt-2">
              Solicitações relacionadas a dados de pacientes devem ser avaliadas
              considerando a responsabilidade profissional do usuário que
              cadastrou as informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              12. Responsabilidade do usuário
            </h2>
            <p className="mt-2">
              O usuário é responsável por:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>manter sigilo de sua senha;</li>
              <li>não compartilhar sua conta;</li>
              <li>cadastrar apenas dados necessários e adequados;</li>
              <li>revisar informações antes de imprimir ou exportar;</li>
              <li>guardar arquivos exportados em local seguro;</li>
              <li>cumprir deveres éticos, profissionais e legais aplicáveis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              13. Alterações desta política
            </h2>
            <p className="mt-2">
              Esta Política de Privacidade poderá ser atualizada periodicamente
              para refletir mudanças no sistema, melhorias de segurança,
              alterações legais ou novas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              14. Contato
            </h2>
            <p className="mt-2">
              Dúvidas, solicitações de privacidade ou pedidos relacionados a
              dados pessoais devem ser encaminhados ao administrador do sistema.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
