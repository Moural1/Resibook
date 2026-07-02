-- ResiBook: isolamento multiusuário e biblioteca global compartilhada.
-- Execute primeiro em staging e valide com docs/multi-user-test-checklist.md.

begin;

create or replace function public.is_resibook_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'igormoura@resibook.com';
$$;

revoke all on function public.is_resibook_admin() from public;
grant execute on function public.is_resibook_admin() to authenticated;

alter table if exists public.user_profiles
  add column if not exists crm_state text,
  add column if not exists signature text,
  add column if not exists preferences jsonb not null default '{}'::jsonb;

alter table if exists public.ai_cases
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

do $$
begin
  if to_regclass('public.user_profiles') is not null
     and not exists (
       select 1
       from pg_constraint
       where conname = 'user_profiles_crm_state_check'
         and conrelid = 'public.user_profiles'::regclass
     ) then
    alter table public.user_profiles
      add constraint user_profiles_crm_state_check
      check (
        crm_state is null
        or crm_state in (
          'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
          'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
        )
      );
  end if;
end
$$;

-- Remove policies antigas para impedir que uma regra permissiva sobreviva à auditoria.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'prescription_templates', 'flashcards', 'cids', 'topicos_medicos',
    'exam_templates', 'user_profiles', 'user_legal_acceptances',
    'flashcard_user_marks', 'high_risk_confirmation_logs', 'activity_logs',
    'consultas', 'ai_cases', 'patients', 'prescriptions', 'patient_notes',
    'patient_problem_list', 'patient_followups', 'patient_exam_requests',
    'patient_consultations', 'login_logs', 'blocked_users', 'flashcard_reviews'
  ] loop
    if to_regclass('public.' || table_name) is null then
      continue;
    end if;

    for policy_name in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = table_name
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        policy_name,
        table_name
      );
    end loop;
  end loop;
end
$$;

-- Conteúdo global: leitura autenticada, escrita somente administrativa.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'prescription_templates',
    'flashcards',
    'cids',
    'topicos_medicos',
    'exam_templates'
  ] loop
    if to_regclass('public.' || table_name) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists global_read_authenticated on public.%I', table_name);
    execute format('drop policy if exists global_insert_admin on public.%I', table_name);
    execute format('drop policy if exists global_update_admin on public.%I', table_name);
    execute format('drop policy if exists global_delete_admin on public.%I', table_name);

    execute format(
      'create policy global_read_authenticated on public.%I for select to authenticated using (true)',
      table_name
    );
    execute format(
      'create policy global_insert_admin on public.%I for insert to authenticated with check (public.is_resibook_admin())',
      table_name
    );
    execute format(
      'create policy global_update_admin on public.%I for update to authenticated using (public.is_resibook_admin()) with check (public.is_resibook_admin())',
      table_name
    );
    execute format(
      'create policy global_delete_admin on public.%I for delete to authenticated using (public.is_resibook_admin())',
      table_name
    );
  end loop;
end
$$;

-- Dados privados com ownership direto por user_id.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles',
    'user_legal_acceptances',
    'flashcard_user_marks',
    'high_risk_confirmation_logs',
    'activity_logs',
    'consultas',
    'ai_cases',
    'patients'
  ] loop
    if to_regclass('public.' || table_name) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('drop policy if exists own_select on public.%I', table_name);
    execute format('drop policy if exists own_insert on public.%I', table_name);
    execute format('drop policy if exists own_update on public.%I', table_name);
    execute format('drop policy if exists own_delete on public.%I', table_name);

    execute format(
      'create policy own_select on public.%I for select to authenticated using (user_id = (select auth.uid()))',
      table_name
    );
    execute format(
      'create policy own_insert on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',
      table_name
    );
    execute format(
      'create policy own_update on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      table_name
    );
    execute format(
      'create policy own_delete on public.%I for delete to authenticated using (user_id = (select auth.uid()))',
      table_name
    );

    execute format(
      'create index if not exists %I on public.%I (user_id)',
      table_name || '_user_id_idx',
      table_name
    );
  end loop;
end
$$;

-- Prescrições podem ser avulsas ou ligadas somente a paciente do mesmo médico.
alter table if exists public.prescriptions enable row level security;
alter table if exists public.prescriptions force row level security;
drop policy if exists own_select on public.prescriptions;
drop policy if exists own_insert on public.prescriptions;
drop policy if exists own_update on public.prescriptions;
drop policy if exists own_delete on public.prescriptions;
create policy own_select on public.prescriptions
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy own_insert on public.prescriptions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      patient_id is null
      or exists (
        select 1 from public.patients patient
        where patient.id = patient_id
          and patient.user_id = (select auth.uid())
      )
    )
  );
create policy own_update on public.prescriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      patient_id is null
      or exists (
        select 1 from public.patients patient
        where patient.id = patient_id
          and patient.user_id = (select auth.uid())
      )
    )
  );
create policy own_delete on public.prescriptions
  for delete to authenticated
  using (user_id = (select auth.uid()));
create index if not exists prescriptions_user_id_idx
  on public.prescriptions (user_id);
create index if not exists prescriptions_patient_id_idx
  on public.prescriptions (patient_id);

-- Filhos do prontuário exigem ownership da linha e do paciente relacionado.
do $$
declare
  table_name text;
  ownership_check text :=
    'user_id = (select auth.uid()) and exists (' ||
    'select 1 from public.patients patient ' ||
    'where patient.id = patient_id and patient.user_id = (select auth.uid()))';
begin
  foreach table_name in array array[
    'patient_notes',
    'patient_problem_list',
    'patient_followups',
    'patient_exam_requests',
    'patient_consultations'
  ] loop
    if to_regclass('public.' || table_name) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('drop policy if exists own_patient_select on public.%I', table_name);
    execute format('drop policy if exists own_patient_insert on public.%I', table_name);
    execute format('drop policy if exists own_patient_update on public.%I', table_name);
    execute format('drop policy if exists own_patient_delete on public.%I', table_name);

    execute format(
      'create policy own_patient_select on public.%I for select to authenticated using (%s)',
      table_name,
      ownership_check
    );
    execute format(
      'create policy own_patient_insert on public.%I for insert to authenticated with check (%s)',
      table_name,
      ownership_check
    );
    execute format(
      'create policy own_patient_update on public.%I for update to authenticated using (%s) with check (%s)',
      table_name,
      ownership_check,
      ownership_check
    );
    execute format(
      'create policy own_patient_delete on public.%I for delete to authenticated using (%s)',
      table_name,
      ownership_check
    );

    execute format(
      'create index if not exists %I on public.%I (user_id)',
      table_name || '_user_id_idx',
      table_name
    );
    execute format(
      'create index if not exists %I on public.%I (patient_id)',
      table_name || '_patient_id_idx',
      table_name
    );
  end loop;
end
$$;

-- Auditoria de login: cada usuário apenas registra o próprio acesso; só admin lê.
alter table if exists public.login_logs enable row level security;
drop policy if exists own_login_insert on public.login_logs;
drop policy if exists admin_login_select on public.login_logs;
drop policy if exists admin_login_delete on public.login_logs;
create policy own_login_insert on public.login_logs
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
create policy admin_login_select on public.login_logs
  for select to authenticated
  using (public.is_resibook_admin());
create policy admin_login_delete on public.login_logs
  for delete to authenticated
  using (public.is_resibook_admin());

-- Bloqueios: usuário lê somente o próprio status; administração gerencia a lista.
alter table if exists public.blocked_users enable row level security;
drop policy if exists own_block_status_select on public.blocked_users;
drop policy if exists admin_block_insert on public.blocked_users;
drop policy if exists admin_block_update on public.blocked_users;
drop policy if exists admin_block_delete on public.blocked_users;
create policy own_block_status_select on public.blocked_users
  for select to authenticated
  using (
    public.is_resibook_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
create policy admin_block_insert on public.blocked_users
  for insert to authenticated
  with check (public.is_resibook_admin());
create policy admin_block_update on public.blocked_users
  for update to authenticated
  using (public.is_resibook_admin())
  with check (public.is_resibook_admin());
create policy admin_block_delete on public.blocked_users
  for delete to authenticated
  using (public.is_resibook_admin());

-- Tabela legada sem ownership confiável: permanece inacessível pelo cliente.
do $$
begin
  if to_regclass('public.flashcard_reviews') is not null then
    alter table public.flashcard_reviews enable row level security;
    alter table public.flashcard_reviews force row level security;
  end if;
end
$$;

commit;

