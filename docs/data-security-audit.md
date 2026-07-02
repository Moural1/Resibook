# Auditoria de dados e isolamento multiusuário

Data da revisão: 2 de julho de 2026.

## Modelo adotado

O ResiBook usa três classes de dados:

1. Biblioteca global, lida por usuários autenticados e alterada apenas pelo admin.
2. Dados individuais, acessíveis somente quando `user_id = auth.uid()`.
3. Dados clínicos sensíveis, isolados por `user_id` e, nas tabelas filhas, também pelo paciente pertencente ao mesmo usuário.

A migration `20260702150000_multi_tenant_security.sql` remove policies antigas das tabelas auditadas antes de instalar as regras abaixo. Isso evita que uma policy permissiva sobreviva à revisão.

## Conteúdo global compartilhado

| Tabela ou módulo | Uso | Leitura | Escrita |
| --- | --- | --- | --- |
| `prescription_templates` | Modelos de prescrição | Autenticados | Admin |
| `flashcards` | Banco-base de flashcards | Autenticados | Admin |
| `cids` | Biblioteca CID | Autenticados | Admin |
| `topicos_medicos` | Tópicos clínicos | Autenticados | Admin |
| `exam_templates` | Modelos de exames e evolução | Autenticados | Admin |
| Calculadoras | Código local tipado, sem dados persistidos | Autenticados pelo app | Alteração por deploy |
| Plantão e condutas estáticas | Rotas e conteúdo do app | Autenticados conforme perfil | Alteração por deploy/admin |

As telas já ocultam comandos administrativos para médicos comuns. A RLS passa a ser a barreira definitiva contra chamadas diretas ao Supabase.

## Dados individuais do médico

| Tabela | Conteúdo | Isolamento |
| --- | --- | --- |
| `user_profiles` | Nome, CRM, UF, especialidade, assinatura e preferências | Próprio `user_id` |
| `user_legal_acceptances` | Aceite dos termos e privacidade | Próprio `user_id` |
| `flashcard_user_marks` | Marcações de cards difíceis | Próprio `user_id` |
| `high_risk_confirmation_logs` | Confirmações pessoais de prescrição | Próprio `user_id` |
| `activity_logs` | Histórico de atividade | Próprio `user_id` |
| `login_logs` | Registro de acesso | Usuário insere o próprio; admin lê |
| `blocked_users` | Estado de bloqueio | Usuário lê o próprio; admin gerencia |

Favoritos de modelos e históricos recentes ficam no navegador, agora com chave separada pelo UUID do usuário. Eles não cruzam contas no mesmo navegador, mas não sincronizam entre dispositivos. Caso sejam migrados ao banco, deverão usar `user_id` obrigatório e policies próprias.

## Dados clínicos sensíveis

| Tabela | Conteúdo | Regra |
| --- | --- | --- |
| `patients` | Cadastro e prontuário-base | Próprio `user_id` |
| `prescriptions` | Prescrições reais | Próprio `user_id`; paciente vinculado deve ser próprio |
| `patient_notes` | Evoluções e anotações | Usuário e paciente devem coincidir |
| `patient_problem_list` | Lista de problemas | Usuário e paciente devem coincidir |
| `patient_followups` | Retornos | Usuário e paciente devem coincidir |
| `patient_exam_requests` | Solicitações de exames | Usuário e paciente devem coincidir |
| `patient_consultations` | Consultas do prontuário | Usuário e paciente devem coincidir |
| `consultas` | Consulta por áudio estruturada | Próprio `user_id` |
| `ai_cases` | Casos enviados à IA | Próprio `user_id` |

O produto ainda contém prontuário e dados identificáveis de pacientes. Eles não devem ser apresentados como biblioteca compartilhada. Para uma edição comercial sem prontuário, as rotas `/pacientes` e `/consulta-audio` devem ser ocultadas por configuração de produto, não apenas removidas visualmente.

## Rotas e queries revisadas

- Busca global filtra `patients`, `prescriptions` e marcações por `user_id`.
- Contagens privadas da sidebar e dashboard filtram o usuário; contagens da biblioteca são globais intencionalmente.
- A rota de IA agora autentica a sessão, valida ownership do paciente e grava `user_id`.
- A página de consulta por áudio usa o cliente Supabase do servidor e filtra pacientes/casos pelo usuário.
- A rota de criação de consulta valida que o paciente pertence ao usuário.
- APIs antigas de pacientes, prescrições, flashcards, consultas por ID e modelos de exame foram encerradas com HTTP 410.
- Administração de contas valida o e-mail administrador no servidor antes de usar a service role.

## Riscos residuais e LGPD

- A migration precisa ser aplicada no Supabase antes de considerar o isolamento implantado.
- Registros antigos de `ai_cases` sem `user_id` ficam invisíveis aos médicos; devem ser atribuídos manualmente ou eliminados por política de retenção.
- A `SUPABASE_SERVICE_ROLE_KEY` ignora RLS. Deve existir somente no servidor e ser limitada às rotas administrativas revisadas.
- O administrador de infraestrutura do Supabase continua tecnicamente capaz de acessar dados; isso exige governança, logs, contrato, política de retenção e resposta a incidentes.
- Casos enviados à IA podem conter dados pessoais. É necessário definir base legal, minimização, transparência, retenção e contrato com o subprocessador antes de uso comercial.
- Backups baixados pelo médico saem do controle técnico do sistema e precisam de orientação de armazenamento seguro.
- O e-mail do admin ainda é uma regra de produto. Para uma equipe administrativa maior, migrar futuramente para tabela de papéis gerenciada fora do cliente.

## Aplicação segura

1. Fazer backup do banco.
2. Aplicar a migration primeiro em projeto Supabase de staging.
3. Executar o checklist de dois usuários.
4. Somente depois aplicar em produção.
5. Confirmar que nenhuma chave service role está exposta em variáveis `NEXT_PUBLIC_*`.

