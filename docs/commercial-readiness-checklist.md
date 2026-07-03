# Checklist de prontidão comercial

## Configuração de produto

- [ ] Manter `NEXT_PUBLIC_RESIBOOK_ENABLE_PATIENT_RECORDS=false` na edição biblioteca.
- [ ] Manter `NEXT_PUBLIC_RESIBOOK_ENABLE_CLINICAL_AUDIO=false` enquanto não houver governança específica para dados enviados à IA.
- [ ] Se a edição clínica for habilitada, revisar base legal, retenção, resposta a incidentes e contratos de operadores antes do lançamento.

## Supabase e acesso

- [ ] Aplicar todas as migrations em staging e depois em produção.
- [ ] Confirmar `app_metadata.role = admin` nas contas administrativas.
- [ ] Manter `SUPABASE_SERVICE_ROLE_KEY` somente em variáveis de servidor da Vercel.
- [ ] Confirmar que nenhuma variável `NEXT_PUBLIC_*` contém service role ou outro segredo.
- [ ] Executar o checklist de dois usuários em `docs/meu-resibook-security-checklist.md`.

## Operação comercial

- [ ] Criar aplicação no Mercado Pago e configurar `MERCADO_PAGO_ACCESS_TOKEN`.
- [ ] Configurar `MERCADO_PAGO_WEBHOOK_SECRET` e testar o evento `subscription_preapproval`.
- [ ] Aplicar `20260703190000_billing_subscriptions.sql` antes de ativar cobranças.
- [ ] Testar os planos Básico (R$ 30/mês) e Completo (R$ 50/mês) em ambiente de teste.
- [ ] Ativar `RESIBOOK_ENFORCE_SUBSCRIPTIONS=true` somente após o teste ponta a ponta.
- [ ] Publicar termos de uso, política de privacidade, canal de suporte e responsável pelo tratamento.
- [ ] Definir política de retenção e exclusão de contas/dados.
- [ ] Documentar backup, restauração e resposta a incidentes.
- [ ] Validar preços, escopo dos planos e processo de liberação antes de divulgar.
- [ ] Testar navegação mobile, login, convite, bloqueio, recuperação de senha e logout.

## Validação técnica por release

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run test:clinical`
- [ ] `npm run test:security`
- [ ] `npm run build`
- [ ] Teste manual com médico A, médico B e admin.
