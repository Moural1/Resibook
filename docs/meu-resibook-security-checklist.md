# Checklist de segurança — Banco Resibook + Meu Resibook

## Preparação

- Aplicar `20260703120000_meu_resibook.sql` primeiro em staging.
- Usar dois usuários médicos reais de teste (A e B) e uma conta admin.
- Confirmar que nenhum teste usa a service role no navegador.

## Usuário A

- [ ] Favoritar uma prescrição global e recarregar a página.
- [ ] Duplicar a prescrição para o Meu Resibook, editar a cópia e confirmar que o modelo global não mudou.
- [ ] Criar, editar, copiar, favoritar, marcar como principal e excluir conteúdo pessoal.
- [ ] Duplicar um flashcard global para o Meu Resibook.
- [ ] Marcar um flashcard global como difícil e confirmar persistência após novo login.
- [ ] Encontrar um item pessoal na busca global e abrir `/meu-resibook`.

## Usuário B

- [ ] Visualizar o mesmo Banco Resibook disponível para o usuário A.
- [ ] Não visualizar favoritos, recentes, notas, cópias ou flashcards pessoais do usuário A.
- [ ] Tentar consultar, atualizar e excluir diretamente o UUID de um item pessoal do usuário A; todas as operações devem retornar zero linhas ou acesso negado.
- [ ] Criar e administrar conteúdos próprios normalmente.

## Administração

- [ ] Conta com `app_metadata.role = admin` consegue administrar conteúdo global.
- [ ] E-mail administrativo legado continua funcionando durante a transição.
- [ ] Admin visualiza modelos de prescrição em todos os estados de revisão.

## Médico comum

- [ ] Visualiza apenas modelos de prescrição com `review_status = revisado`.
- [ ] Não consegue inserir, editar ou excluir prescrições, flashcards e demais conteúdos globais.
- [ ] Consegue adaptar uma cópia global somente dentro do próprio Meu Resibook.

## Verificação de RLS

- [ ] RLS está habilitada e forçada em `personal_content_items`, `user_content_favorites`, `user_content_recents` e `user_content_notes`.
- [ ] Policies de `SELECT`, `INSERT`, `UPDATE` e `DELETE` exigem `user_id = auth.uid()`.
- [ ] Todas as consultas e mutações do frontend também incluem `user_id` como defesa em profundidade.
