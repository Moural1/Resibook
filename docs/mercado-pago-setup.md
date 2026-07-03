# Ativação das assinaturas do Resibook

O checkout já está integrado. Nenhum dado de cartão passa pelo Resibook.

## 1. Criar a integração

1. Entre na conta de vendedor do Mercado Pago.
2. Abra **Suas integrações** e crie uma aplicação chamada `Resibook`.
3. Selecione o produto **Assinaturas**.
4. Copie o Access Token de produção.
5. Em Webhooks, revele ou gere a assinatura secreta.

Nunca envie essas duas credenciais por WhatsApp, e-mail ou commit no GitHub.

## 2. Configurar a Vercel

Adicione as variáveis somente no ambiente do servidor:

```text
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_WEBHOOK_SECRET=...
RESIBOOK_ENFORCE_SUBSCRIPTIONS=false
```

Confirme também que `NEXT_PUBLIC_SITE_URL` aponta para o domínio definitivo com
HTTPS. Não use o prefixo `NEXT_PUBLIC_` nas credenciais do Mercado Pago.

## 3. Preparar o banco

Execute no Supabase, primeiro em staging:

```text
supabase/migrations/20260703190000_billing_subscriptions.sql
```

Essa migration permite ao médico ler somente a própria assinatura. Criação e
alteração ficam restritas ao servidor por meio da service role.

No Supabase Auth:

1. habilite novos cadastros por e-mail;
2. defina o domínio definitivo como **Site URL**;
3. adicione `https://SEU-DOMINIO/auth/callback` às URLs de redirecionamento;
4. configure um SMTP próprio antes da abertura comercial para garantir a
   entrega dos e-mails de confirmação e recuperação.

## 4. Testar antes de bloquear acessos

Com `RESIBOOK_ENFORCE_SUBSCRIPTIONS=false`:

1. Crie uma conta nova em `/cadastro`.
2. Aceite os documentos legais.
3. Escolha o plano Básico de R$ 30.
4. Conclua o checkout hospedado.
5. Confira em `/minha-assinatura` se o status ficou **Ativa**.
6. Repita com o plano Completo de R$ 50.
7. Teste atualização do Básico para o Completo e cancelamento.

O webhook utilizado é:

```text
https://SEU-DOMINIO/api/billing/webhook?source_news=webhooks
```

As notificações aceitas são validadas por HMAC e sincronizadas consultando a API
do Mercado Pago; o conteúdo recebido no webhook não libera acesso sozinho.

## 5. Ativar a cobrança como regra de acesso

Somente após o teste ponta a ponta, altere na Vercel:

```text
RESIBOOK_ENFORCE_SUBSCRIPTIONS=true
```

Administradores e a conta de demonstração permanecem fora da exigência de
assinatura. Usuários sem pagamento ativo são enviados para `/assinar`.
