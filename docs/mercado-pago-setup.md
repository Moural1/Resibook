# Mercado Pago: produção e teste seguro de assinaturas

O Resibook cria uma `preapproval` no Mercado Pago e sempre envia:

```text
notification_url=https://www.resibook.com.br/api/mercado-pago/webhook
```

O cartão é informado somente no checkout hospedado do Mercado Pago. O Resibook
não recebe nem armazena os dados do cartão.

## Proteções implementadas

- assinaturas são gravadas como `test` ou `production`;
- uma assinatura `test` nunca libera nem bloqueia acesso de produção;
- o webhook valida HMAC antes de consultar a assinatura na API do provedor;
- o `external_reference` identifica ambiente, `user_id` e `plan_id`;
- falhas de configuração ou consulta não bloqueiam usuários silenciosamente;
- logs de billing não incluem token, secret, e-mail nem dados de cartão;
- `RESIBOOK_ENFORCE_SUBSCRIPTIONS=true` só é efetivo em produção com toda a
  configuração crítica presente.

## 1. Banco

Aplicar as migrations, na ordem:

```text
supabase/migrations/20260703190000_billing_subscriptions.sql
supabase/migrations/20260704100000_billing_test_mode.sql
```

A segunda migration marca registros anteriores como `production` e cria o
isolamento por ambiente. O cliente autenticado só lê as próprias assinaturas;
alterações continuam restritas à service role do servidor.

`provider_subscription_id` é o ID da `preapproval`. A migration complementar
também guarda `mercado_pago_payment_id`, início/fim do período e data de
cancelamento quando esses dados são fornecidos pelos eventos de fatura.

## 2. Configuração de produção

Na Vercel, em **Settings > Environment Variables**, configure no ambiente
**Production**:

```text
MERCADO_PAGO_ACCESS_TOKEN=token-da-conta-vendedora-real
MERCADO_PAGO_WEBHOOK_SECRET=assinatura-secreta-real
NEXT_PUBLIC_SITE_URL=https://www.resibook.com.br
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
RESIBOOK_BILLING_TEST_MODE=false
RESIBOOK_ENFORCE_SUBSCRIPTIONS=false
```

Nunca use `NEXT_PUBLIC_` em tokens, secrets ou service role. Não altere
`RESIBOOK_ENFORCE_SUBSCRIPTIONS` durante os testes.

## 3. Criar vendedor e comprador de teste

Segundo a documentação de [contas de teste para Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/test/accounts):

1. Acesse **Suas integrações** na conta real do Mercado Pago.
2. Abra a aplicação do Resibook.
3. Entre em **Contas de teste** e selecione **Criar conta de teste**.
4. Crie uma conta do tipo **Vendedor** e outra do tipo **Comprador**.
5. Use Brasil e o mesmo país para as duas contas.
6. Guarde usuário, senha, User ID e código de validação de 6 dígitos.

Para obter o token de teste, entre no painel como o **vendedor de teste**, abra
a aplicação/credenciais correspondente e copie o Access Token desse vendedor.
Não use o Access Token da conta vendedora real. O
`MERCADO_PAGO_TEST_PAYER_EMAIL` deve ser o e-mail/usuário do **comprador de
teste**, nunca o e-mail de um cliente real.

## 4. Variáveis do modo de teste

No deployment usado para abrir o checkout de teste, configure:

```text
MERCADO_PAGO_TEST_ACCESS_TOKEN=token-do-vendedor-de-teste
MERCADO_PAGO_TEST_WEBHOOK_SECRET=secret-da-integracao-de-teste
MERCADO_PAGO_TEST_PAYER_EMAIL=email-do-comprador-de-teste
RESIBOOK_BILLING_TEST_MODE=true
RESIBOOK_ENFORCE_SUBSCRIPTIONS=false
```

Use preferencialmente um deployment **Preview** da Vercel. Como a
`notification_url` aponta obrigatoriamente para `www.resibook.com.br`, o
deployment **Production** que recebe o webhook também precisa ter as três
variáveis `MERCADO_PAGO_TEST_*`; mantenha nele
`RESIBOOK_BILLING_TEST_MODE=false`. Assim, produção continua criando apenas
checkout real, mas consegue validar e sincronizar notificações de teste na
coluna `environment=test`.

Se Preview e Production usarem bancos Supabase diferentes, o webhook fixo
atualizará o banco configurado em Production. Para este teste, use o mesmo banco
ou confira o registro no projeto que atende `www.resibook.com.br`.

## 5. Testar checkout sem cobrança real

1. Confirme visualmente a faixa amarela **Modo de teste do Mercado Pago** em
   `/assinar`. Se ela não aparecer, não prossiga.
2. Entre no checkout com o comprador de teste; não use uma conta Mercado Pago
   real no mesmo navegador. Uma janela anônima evita sessão real reaproveitada.
3. Use um [cartão oficial de teste para Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/test/cards), por exemplo:
   - Mastercard `5031 4332 1540 6351`;
   - validade `11/30` e CVV `123`;
   - titular `APRO` para aprovação;
   - CPF de teste `12345678909`.
4. Confira `/minha-assinatura`: deve aparecer **Ambiente de teste**.
5. Confira no Supabase que `billing_subscriptions.environment = 'test'`.
6. Confirme que um registro `test` não libera recurso do plano quando o bloqueio
   comercial estiver futuramente ativo.

Nunca informe cartão, CPF, conta de comprador ou conta de vendedor reais nesse
fluxo. O guia oficial de [aprovação de pagamento de teste](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-test/payment-approval)
descreve o fluxo hospedado.

## 6. Testar webhook

O endpoint público é:

```text
POST https://www.resibook.com.br/api/mercado-pago/webhook
```

O teste ponta a ponta recomendado é concluir uma assinatura com comprador e
cartão de teste e verificar a atualização do registro. Uma chamada manual sem
`x-signature` e `x-request-id` válidos deve retornar HTTP `401`; não invente nem
compartilhe o secret para simular HMAC fora de um ambiente controlado.

O endpoint tenta o secret que validou a notificação e consulta a `preapproval`
com o token do mesmo ambiente. O corpo do webhook sozinho nunca ativa acesso.
São aceitos `payment`, `subscription_preapproval`,
`subscription_authorized_payment` e `subscription_preapproval_plan`. Eventos de
pagamento/fatura são resolvidos até a assinatura antes de atualizar o Supabase.

## 7. Voltar ao modo de produção

No deployment comercial:

```text
RESIBOOK_BILLING_TEST_MODE=false
RESIBOOK_ENFORCE_SUBSCRIPTIONS=false
```

Faça novo deploy e confirme que a faixa de teste desapareceu. Valide que as
credenciais reais continuam presentes, mas não faça compra real apenas para
testar configuração. Registros `test` podem permanecer para auditoria porque
estão isolados; não são considerados pelo controle de acesso.

## 8. Quando ativar o bloqueio por assinatura

Mude `RESIBOOK_ENFORCE_SUBSCRIPTIONS=true` somente depois de:

1. migrations aplicadas em produção;
2. checkout e webhook testados ponta a ponta;
3. fluxo de cancelamento testado;
4. logs e alertas operacionais revisados;
5. uma janela de suporte definida para falhas do provedor;
6. confirmação de que `RESIBOOK_BILLING_TEST_MODE=false`.

Se token, secret, Supabase URL ou service role estiverem ausentes, o enforcement
não entra em vigor. As APIs de billing retornam
`billing_configuration_invalid` com os nomes das variáveis ausentes, sem seus
valores.

## 9. Cancelar assinatura criada por engano

- Pelo Resibook: abra `/minha-assinatura` no mesmo ambiente e selecione
  **Cancelar assinatura**.
- Pelo Mercado Pago: entre na conta vendedora correspondente, localize a
  assinatura/preapproval e cancele-a no painel.
- Confirme depois que o status local virou `cancelled` usando **Atualizar
  pagamento** ou aguardando o webhook.

Se uma assinatura real tiver sido criada, cancele-a imediatamente na conta
vendedora real e confirme no painel do Mercado Pago que não há próxima cobrança.
No cancelamento normal, a renovação é interrompida e o acesso permanece liberado
até `current_period_end`, correspondente ao fim do período já pago. Depois dessa
data, o controle de acesso deixa de considerar a assinatura válida.

## Checklist de variáveis na Vercel

| Variável | Production | Preview de teste |
|---|---:|---:|
| `MERCADO_PAGO_ACCESS_TOKEN` | sim | não é usado em test mode |
| `MERCADO_PAGO_WEBHOOK_SECRET` | sim | opcional para criar teste |
| `MERCADO_PAGO_TEST_ACCESS_TOKEN` | sim, para receber webhook de teste | sim |
| `MERCADO_PAGO_TEST_WEBHOOK_SECRET` | sim, para receber webhook de teste | sim |
| `MERCADO_PAGO_TEST_PAYER_EMAIL` | sim, para validar webhook de teste | sim |
| `RESIBOOK_BILLING_TEST_MODE` | `false` | `true` |
| `RESIBOOK_ENFORCE_SUBSCRIPTIONS` | `false` até validação completa | sempre `false` |
| `NEXT_PUBLIC_SUPABASE_URL` | sim | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | sim |
