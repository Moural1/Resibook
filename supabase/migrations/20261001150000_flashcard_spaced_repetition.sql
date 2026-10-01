-- Revisão espaçada dos flashcards.
-- - flashcard_schedule: quando cada cartão volta para cada usuário.
-- - flashcard_study_days: quantas revisões o usuário fez em cada dia (sequência).
-- Só dados de estudo, sem dado clínico. RLS por usuário, sem acesso anon,
-- e exclusão do usuário apaga tudo em cascata.
-- Tabelas novas: não altera nenhuma tabela existente.

begin;

create table if not exists public.flashcard_schedule (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  flashcard_id text not null,
  ease numeric(4, 2) not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  due_on date not null,
  last_reviewed_at timestamptz not null default now(),
  primary key (user_id, flashcard_id),
  constraint flashcard_schedule_ease_range check (ease between 1.3 and 5),
  constraint flashcard_schedule_interval_range check (interval_days between 0 and 3650),
  constraint flashcard_schedule_counts check (repetitions >= 0 and lapses >= 0)
);

create index if not exists flashcard_schedule_user_due_idx
  on public.flashcard_schedule (user_id, due_on);

create table if not exists public.flashcard_study_days (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null,
  reviews integer not null default 0,
  new_cards integer not null default 0,
  primary key (user_id, day),
  constraint flashcard_study_days_counts check (reviews >= 0 and new_cards >= 0)
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['flashcard_schedule', 'flashcard_study_days'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_select', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_insert', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_update', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_delete', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',
      table_name || '_own_select', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',
      table_name || '_own_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      table_name || '_own_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))',
      table_name || '_own_delete', table_name
    );
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('revoke all on table public.%I from public', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
  end loop;
end
$$;

commit;
