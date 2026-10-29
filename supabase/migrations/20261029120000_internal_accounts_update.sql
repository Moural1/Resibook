-- Contas internas com acesso completo, sem assinatura: admin, Lívia (agora com
-- e-mail próprio) e a conta de convidado. Thiago e Isabella saíram da equipe.
-- Mesma regra de src/lib/auth-role.ts (SUBSCRIPTION_EXEMPT_EMAILS).
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
