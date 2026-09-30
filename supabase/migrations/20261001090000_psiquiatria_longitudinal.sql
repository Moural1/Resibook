-- Acompanhamento psiquiátrico longitudinal (módulo /psiquiatria).
--
-- Dado de saúde mental é dado pessoal sensível (LGPD, art. 5º, II e art. 11).
-- Minimização e pseudonimização ficam garantidas também no banco:
-- - o paciente é identificado só por código (PAC-001), nunca por nome;
-- - o documento clínico (jsonb) não pode ter campos de identificação direta;
-- - cada médico só enxerga e altera os próprios registros (RLS);
-- - o anon não tem nenhum acesso; exclusão do usuário apaga tudo em cascata.
-- Tabela nova: não altera nenhuma tabela existente.

begin;

create table if not exists public.psiq_patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  code text not null,
  dados jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint psiq_patients_code_format check (code ~ '^PAC-[0-9]{3,6}$'),
  constraint psiq_patients_dados_object check (jsonb_typeof(dados) = 'object'),
  constraint psiq_patients_dados_size check (pg_column_size(dados) <= 1048576),
  constraint psiq_patients_sem_identificadores check (
    not (dados ?| array[
      'nome', 'name', 'nome_completo', 'cpf', 'cns', 'rg', 'cartao_sus',
      'telefone', 'celular', 'phone', 'email', 'endereco', 'address',
      'data_nascimento', 'nascimento', 'birth_date', 'prontuario'
    ])
  ),
  constraint psiq_patients_user_code_unique unique (user_id, code)
);

comment on table public.psiq_patients is
  'Acompanhamento psiquiátrico pseudonimizado: código PAC-###, meses de seguimento e parentesco. Sem nome, datas reais ou documentos.';

create index if not exists psiq_patients_user_updated_idx
  on public.psiq_patients (user_id, updated_at desc);

drop trigger if exists psiq_patients_set_updated_at on public.psiq_patients;
create trigger psiq_patients_set_updated_at
  before update on public.psiq_patients
  for each row execute function public.set_resibook_updated_at();

alter table public.psiq_patients enable row level security;

drop policy if exists psiq_patients_own_select on public.psiq_patients;
drop policy if exists psiq_patients_own_insert on public.psiq_patients;
drop policy if exists psiq_patients_own_update on public.psiq_patients;
drop policy if exists psiq_patients_own_delete on public.psiq_patients;

create policy psiq_patients_own_select on public.psiq_patients
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy psiq_patients_own_insert on public.psiq_patients
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy psiq_patients_own_update on public.psiq_patients
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy psiq_patients_own_delete on public.psiq_patients
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.psiq_patients from anon;
revoke all on table public.psiq_patients from public;
grant select, insert, update, delete on table public.psiq_patients to authenticated;

commit;
