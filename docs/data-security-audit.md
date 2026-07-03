# Auditoria de dados e isolamento multiusuário

Data da revisão: 3 de julho de 2026.

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

Favoritos de prescrições, conteúdos pessoais e históricos recentes ficam no Supabase com `user_id` obrigatório e policies próprias. Preferências legadas de outros módulos que ainda usam o navegador permanecem separadas pelo UUID e devem seguir a mesma migração antes de ganharem sincronização entre dispositivos.

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

O produto ainda contém prontuário e dados identificáveis de pacientes. Eles não são apresentados como biblioteca compartilhada. Na edição comercial, as rotas `/pacientes` e `/consulta-audio` ficam desativadas por configuração e bloqueadas no proxy. A edição clínica só deve habilitá-las explicitamente após atender aos requisitos de governança LGPD.

## Rotas e queries revisadas

- Busca global filtra `patients`, `prescriptions` e marcações por `user_id`.
- Contagens privadas da sidebar e dashboard filtram o usuário; contagens da biblioteca são globais intencionalmente.
- A rota de IA agora autentica a sessão, valida ownership do paciente e grava `user_id`.
- A página de consulta por áudio usa o cliente Supabase do servidor e filtra pacientes/casos pelo usuário.
- A rota de criação de consulta valida que o paciente pertence ao usuário.
- APIs antigas de pacientes, prescrições, flashcards, consultas por ID e modelos de exame foram encerradas com HTTP 410.
- Administração de contas exige `app_metadata.role = admin` no servidor antes de usar a service role; o e-mail histórico existe apenas como compatibilidade temporária.

## Riscos residuais e LGPD

- As migrations de isolamento e Meu Resibook precisam estar aplicadas no Supabase antes de cada release.
- Registros antigos de `ai_cases` sem `user_id` ficam invisíveis aos médicos; devem ser atribuídos manualmente ou eliminados por política de retenção.
- A `SUPABASE_SERVICE_ROLE_KEY` ignora RLS. Deve existir somente no servidor e ser limitada às rotas administrativas revisadas.
- O administrador de infraestrutura do Supabase continua tecnicamente capaz de acessar dados; isso exige governança, logs, contrato, política de retenção e resposta a incidentes.
- Casos enviados à IA podem conter dados pessoais. É necessário definir base legal, minimização, transparência, retenção e contrato com o subprocessador antes de uso comercial.
- Backups baixados pelo médico saem do controle técnico do sistema e precisam de orientação de armazenamento seguro.
- A autorização administrativa aceita `app_metadata.role = admin`; o e-mail histórico permanece apenas como compatibilidade temporária e deve ser removido após a migração das contas administrativas.

## Aplicação segura

1. Fazer backup do banco.
2. Aplicar a migration primeiro em projeto Supabase de staging.
3. Executar o checklist de dois usuários.
4. Somente depois aplicar em produção.
5. Confirmar que nenhuma chave service role está exposta em variáveis `NEXT_PUBLIC_*`.

## Configuração da edição comercial

- `NEXT_PUBLIC_RESIBOOK_ENABLE_PATIENT_RECORDS=false`: oculta e bloqueia prontuário.
- `NEXT_PUBLIC_RESIBOOK_ENABLE_CLINICAL_AUDIO=false`: oculta e bloqueia consulta por áudio.
- As duas capacidades são desativadas por padrão. A consulta por áudio também depende da habilitação do prontuário.
- A configuração de referência e o checklist de release estão em `.env.example` e `docs/commercial-readiness-checklist.md`.

