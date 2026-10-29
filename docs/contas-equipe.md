# Contas da equipe fora do domínio resibook.com

Pedido do dono do projeto (29/10/2026):

- Lívia: a conta `liviarosa@resibook.com` passa a entrar com
  `liviaarosa05@gmail.com`. Mesma senha e mesmos dados.
- Thiago (`thiagoyan@resibook.com`) e Isabella (`isabellaestevo@resibook.com`)
  não usam o app: as contas são apagadas, junto com os dados delas.
- `convidado@resibook.com` continua como está.

## Ordem

1. Fazer o merge do PR (o app passa a reconhecer o e-mail novo da Lívia).
2. Rodar o script abaixo no Supabase: **SQL Editor → New query → colar → Run**.
3. Avisar a Lívia para entrar com o Gmail e a senha de sempre.

Se o Gmail da Lívia já tiver uma conta no Resibook, o script para sem mudar
nada, para não misturar as duas.

```sql
do $$
declare
  livia uuid;
  removidas int;
begin
  if exists (select 1 from auth.users where lower(email) = 'liviaarosa05@gmail.com') then
    raise exception 'Já existe uma conta com liviaarosa05@gmail.com. Nada foi alterado.';
  end if;

  select id into livia from auth.users where lower(email) = 'liviarosa@resibook.com';
  if livia is null then
    raise exception 'Conta liviarosa@resibook.com não encontrada. Nada foi alterado.';
  end if;

  update auth.users
     set email = 'liviaarosa05@gmail.com',
         email_change = '',
         email_change_token_new = '',
         email_change_token_current = '',
         updated_at = now()
   where id = livia;
  update auth.identities
     set identity_data = identity_data || jsonb_build_object('email', 'liviaarosa05@gmail.com'),
         updated_at = now()
   where user_id = livia and provider = 'email';

  delete from auth.users
   where lower(email) in ('thiagoyan@resibook.com', 'isabellaestevo@resibook.com');
  get diagnostics removidas = row_count;
  raise notice 'Contas apagadas: %', removidas;
end
$$;

create or replace function public.has_resibook_full_clinical_access()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    public.is_resibook_admin()
    or lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'igormouralopes@hotmail.com',
      'liviaarosa05@gmail.com',
      'convidado@resibook.com'
    )
    or exists (
      select 1
      from public.billing_subscriptions as subscription
      where subscription.user_id = (select auth.uid())
        and subscription.environment = 'production'
        and subscription.plan_id = 'complete'
        and (
          subscription.status = 'authorized'
          or (
            subscription.status in ('active', 'cancelled')
            and subscription.current_period_end is not null
            and subscription.current_period_end > now()
          )
        )
    );
$$;
revoke all on function public.has_resibook_full_clinical_access() from public;
grant execute on function public.has_resibook_full_clinical_access() to authenticated;

select email
  from auth.users
 where lower(email) like '%@resibook.com'
    or lower(email) = 'liviaarosa05@gmail.com'
 order by email;
```

O resultado esperado é a lista de contas que ainda usam `@resibook.com`
(`convidado` e `programador`) mais `liviaarosa05@gmail.com`, sem `liviarosa`,
`thiagoyan` e `isabellaestevo`.
