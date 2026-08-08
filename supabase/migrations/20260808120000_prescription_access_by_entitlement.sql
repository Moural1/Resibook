-- Catálogo completo para contas internas e assinantes do plano Completo.
-- A função é SECURITY INVOKER: a consulta de assinatura continua sujeita ao RLS
-- de billing_subscriptions e só enxerga os registros do próprio usuário.
begin;

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
      'liviarosa@resibook.com',
      'convidado@resibook.com',
      'thiagoyan@resibook.com',
      'isabellaestevo@resibook.com'
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

do $$
begin
  if to_regclass('public.prescription_templates') is not null then
    alter table public.prescription_templates enable row level security;

    drop policy if exists prescription_templates_reviewed_or_admin
      on public.prescription_templates;
    drop policy if exists prescription_templates_clinical_read
      on public.prescription_templates;

    create policy prescription_templates_clinical_read
      on public.prescription_templates
      for select to authenticated
      using (
        review_status = 'revisado'
        or (select public.has_resibook_full_clinical_access())
      );
  end if;
end
$$;

-- INSERT, UPDATE e DELETE permanecem protegidos pelas policies administrativas.
commit;
