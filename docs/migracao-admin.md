# Migração do admin para fora do domínio resibook.com

O domínio `resibook.com` (sem `.br`) não pertence ao projeto e está à venda.
Quem o comprar pode receber e-mails de "esqueci a senha" de qualquer conta
`@resibook.com`. Por isso:

- O app e o banco reconhecem admin **só** por `app_metadata.role = 'admin'`.
  E-mail não dá mais permissão (código e migration `20261028120000_admin_by_role_only.sql`).
- A conta admin sai do domínio `resibook.com`.

## Ordem

1. Fazer o merge do PR. A partir daí ninguém é admin até o passo 2.
2. Rodar o script abaixo no Supabase: **SQL Editor → New query → colar → Run**.
3. Sair da conta e entrar de novo. A marcação de admin só chega à sessão depois de um novo login.

O script não apaga nada. Ele faz:

- Se não existe conta com `igormouralopes@hotmail.com`: a conta admin atual
  passa a usar esse e-mail (mesma senha, mesmos dados) e recebe a marcação de admin.
- Se já existe: as duas contas recebem a marcação de admin, e a conta antiga
  passa a entrar com `igormoura.antigo@resibook.invalid` (mesma senha). O
  domínio `.invalid` é reservado e nunca pode ser registrado, então ninguém
  consegue pedir troca de senha dessa conta.

```sql
do $$
declare
  antigo uuid;
  novo uuid;
begin
  select id into antigo from auth.users where lower(email) = 'igormoura@resibook.com';
  select id into novo from auth.users where lower(email) = 'igormouralopes@hotmail.com';

  if antigo is null and novo is null then
    raise exception 'Nenhuma das contas foi encontrada. Nada foi alterado.';
  end if;

  if novo is null then
    update auth.users
       set email = 'igormouralopes@hotmail.com',
           raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
           updated_at = now()
     where id = antigo;
    update auth.identities
       set identity_data = identity_data || jsonb_build_object('email', 'igormouralopes@hotmail.com'),
           updated_at = now()
     where user_id = antigo and provider = 'email';
  else
    update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
           updated_at = now()
     where id = novo;
    if antigo is not null then
      update auth.users
         set email = 'igormoura.antigo@resibook.invalid',
             raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb,
             updated_at = now()
       where id = antigo;
      update auth.identities
         set identity_data = identity_data || jsonb_build_object('email', 'igormoura.antigo@resibook.invalid'),
             updated_at = now()
       where user_id = antigo and provider = 'email';
    end if;
  end if;
end
$$;

create or replace function public.is_resibook_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;
revoke all on function public.is_resibook_admin() from public;
grant execute on function public.is_resibook_admin() to authenticated;

select email, raw_app_meta_data ->> 'role' as role
  from auth.users
 where lower(email) in (
   'igormouralopes@hotmail.com',
   'igormoura@resibook.com',
   'igormoura.antigo@resibook.invalid'
 );
```

O resultado esperado é nenhuma linha com `igormoura@resibook.com` e `admin`
na coluna `role` de cada conta listada.

## Contas da equipe

Lívia, Thiago e Isabella: ver `docs/contas-equipe.md`. `convidado` e
`programador` continuam em `@resibook.com`; nenhuma é admin.
