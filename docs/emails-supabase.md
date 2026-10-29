# E-mails de acesso do Supabase (em português)

Onde colar: Supabase → **Authentication → Emails → Templates**. Para cada
modelo abaixo, troque o **Subject** e o **Body** (aba *Source*) e clique em
**Save**.

Os links apontam para `/auth/confirm` com `token_hash`. A verificação é feita
no servidor, então o link funciona mesmo aberto em outro aparelho ou
navegador. Recuperação e convite seguem para `/redefinir-senha`; confirmação
de cadastro segue para o aceite dos Termos.

Pré-requisitos: Site URL `https://www.resibook.com.br` em
**Authentication → URL Configuration**, e o código com `/auth/confirm`
aceitando esses tipos já publicado.

## Confirm signup

**Subject:**

```
Confirme seu e-mail no ResiBook
```

**Body:**

```html
<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:bold;letter-spacing:1px;color:#091a38">RESI<span style="color:#0891b2">BOOK</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">Confirme seu e-mail</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569">Falta pouco. Clique no botão abaixo para confirmar seu e-mail e ativar sua conta no ResiBook.</p>
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 24px;border-radius:12px">Confirmar e-mail</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b">Se você não criou uma conta no ResiBook, pode ignorar este e-mail.</p>
  </div>
  <p style="max-width:480px;margin:16px auto 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center">ResiBook · Ferramenta de apoio à rotina médica<br>Dúvidas: contato@resibook.com.br</p>
</div>
```

## Reset Password

**Subject:**

```
Redefinir sua senha do ResiBook
```

**Body:**

```html
<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:bold;letter-spacing:1px;color:#091a38">RESI<span style="color:#0891b2">BOOK</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">Redefinir senha</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569">Recebemos um pedido para trocar a senha da sua conta. Clique no botão abaixo para escolher uma nova senha.</p>
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 24px;border-radius:12px">Escolher nova senha</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b">O link vale por 1 hora e só pode ser usado uma vez. Se você não pediu a troca, ignore este e-mail: sua senha continua a mesma.</p>
  </div>
  <p style="max-width:480px;margin:16px auto 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center">ResiBook · Ferramenta de apoio à rotina médica<br>Dúvidas: contato@resibook.com.br</p>
</div>
```

## Invite user

**Subject:**

```
Seu acesso ao ResiBook
```

**Body:**

```html
<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:bold;letter-spacing:1px;color:#091a38">RESI<span style="color:#0891b2">BOOK</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">Você foi convidado para o ResiBook</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569">Sua conta já está criada. Clique no botão abaixo para definir sua senha e começar a usar.</p>
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 24px;border-radius:12px">Definir minha senha</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b">Se você não esperava este convite, pode ignorar este e-mail.</p>
  </div>
  <p style="max-width:480px;margin:16px auto 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center">ResiBook · Ferramenta de apoio à rotina médica<br>Dúvidas: contato@resibook.com.br</p>
</div>
```

## Change Email Address

**Subject:**

```
Confirme seu novo e-mail no ResiBook
```

**Body:**

```html
<div style="background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:bold;letter-spacing:1px;color:#091a38">RESI<span style="color:#0891b2">BOOK</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">Confirme o novo e-mail</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569">Recebemos um pedido para trocar o e-mail da sua conta de {{ .Email }} para {{ .NewEmail }}. Clique no botão abaixo para confirmar.</p>
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 24px;border-radius:12px">Confirmar novo e-mail</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b">Se você não pediu essa troca, ignore este e-mail e avise contato@resibook.com.br.</p>
  </div>
  <p style="max-width:480px;margin:16px auto 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center">ResiBook · Ferramenta de apoio à rotina médica<br>Dúvidas: contato@resibook.com.br</p>
</div>
```
