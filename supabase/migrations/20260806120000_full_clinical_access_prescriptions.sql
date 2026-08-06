-- Contas internas podem consultar todo o banco clínico sem receber permissões administrativas.
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
      'liviarosa@resibook.com',
      'convidado@resibook.com',
      'thiagoyan@resibook.com',
      'isabellaestevo@resibook.com'
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
        or public.has_resibook_full_clinical_access()
      );
  end if;
end
$$;

-- As políticas de INSERT, UPDATE e DELETE continuam exigindo is_resibook_admin().
commit;
