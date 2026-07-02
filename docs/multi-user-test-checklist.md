# Checklist de isolamento com dois usuários

Use contas médicas comuns A e B, além da conta administradora. Execute primeiro em staging.

## Preparação

- [ ] Migration de segurança aplicada sem erro.
- [ ] Usuários A e B possuem UUIDs diferentes.
- [ ] DevTools aberto para observar respostas 401, 403 e erros de RLS.
- [ ] Nenhuma chave service role está presente no navegador.

## Biblioteca global

- [ ] A e B visualizam os mesmos modelos de prescrição.
- [ ] A e B visualizam os mesmos flashcards, CIDs, tópicos e modelos de exame.
- [ ] A e B usam as calculadoras sem persistência de dados clínicos.
- [ ] Médico comum não consegue criar, editar ou excluir conteúdo global pela interface.
- [ ] Uma tentativa direta de INSERT/UPDATE/DELETE com o token de A falha por RLS.
- [ ] Admin consegue criar, editar e excluir um registro global de teste.

## Dados individuais

- [ ] A altera nome, CRM, UF, especialidade e assinatura.
- [ ] B não vê o perfil de A por query nem por URL.
- [ ] A marca um flashcard como difícil.
- [ ] B não vê a marcação de A; pode criar a própria marcação no mesmo card.
- [ ] A favorita um modelo de prescrição e realiza buscas/CIDs recentes.
- [ ] No mesmo navegador, B não vê favoritos nem recentes de A.
- [ ] Métricas de A não mudam ao criar dados em B.
- [ ] Aceite legal de A não satisfaz nem altera o aceite de B.
- [ ] O status de bloqueio consultado por A não revela a lista de outros usuários.

Favoritos e recentes são locais ao navegador e separados pelo UUID. Eles não sincronizam entre dispositivos; uma futura persistência no Supabase exigirá `user_id` e RLS próprias.

## Prontuário e dados clínicos

- [ ] A cria um paciente e copia o ID da URL.
- [ ] B tenta abrir `/pacientes/ID_DE_A` e não recebe dados.
- [ ] B tenta selecionar diretamente `patients.id = ID_DE_A` e recebe zero linhas.
- [ ] B não consegue atualizar nem excluir o paciente de A por chamada direta.
- [ ] A cria evolução, problema, retorno, exame e consulta no próprio paciente.
- [ ] B não vê nenhum desses itens e não consegue vinculá-los ao paciente de A.
- [ ] A salva uma prescrição vinculada ao próprio paciente.
- [ ] B não vê a prescrição e não consegue criar prescrição apontando para o paciente de A.
- [ ] A salva um caso de IA; B não vê o caso nem o paciente associado.
- [ ] Busca global de B nunca retorna paciente ou prescrição de A.

## Administração e encerramento

- [ ] Médico comum recebe 403 ao chamar `/api/admin/users`.
- [ ] Admin consegue listar, convidar e remover uma conta de teste.
- [ ] Conta administradora não pode ser removida pela própria API.
- [ ] APIs legadas respondem HTTP 410 e não alteram dados.
- [ ] Logs não contêm conteúdo clínico, tokens ou chaves.
- [ ] Evidências do teste são arquivadas sem dados reais de pacientes.

