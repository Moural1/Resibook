-- Banco Resibook + Meu Resibook: acervo privado, favoritos, recentes e notas.
begin;

create extension if not exists pgcrypto;

create or replace function public.is_resibook_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'igormoura@resibook.com';
$$;

revoke all on function public.is_resibook_admin() from public;
grant execute on function public.is_resibook_admin() to authenticated;

create table if not exists public.personal_content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in (
    'prescription', 'flashcard', 'evolution_model', 'topic_note',
    'conduct_note', 'exam_model', 'orientation'
  )),
  title text not null check (length(btrim(title)) > 0),
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  source_global_id text,
  is_favorite boolean not null default false,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_content_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  source text not null check (source in ('global', 'personal')),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id, source)
);

create table if not exists public.user_content_recents (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  source text not null check (source in ('global', 'personal')),
  accessed_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id, source)
);

create table if not exists public.user_content_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  source text not null check (source in ('global', 'personal')),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_type, item_id, source)
);

create or replace function public.set_resibook_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists personal_content_items_set_updated_at on public.personal_content_items;
create trigger personal_content_items_set_updated_at
before update on public.personal_content_items
for each row execute function public.set_resibook_updated_at();

drop trigger if exists user_content_notes_set_updated_at on public.user_content_notes;
create trigger user_content_notes_set_updated_at
before update on public.user_content_notes
for each row execute function public.set_resibook_updated_at();

create index if not exists personal_content_items_user_type_idx
  on public.personal_content_items (user_id, item_type);
create index if not exists personal_content_items_user_updated_idx
  on public.personal_content_items (user_id, updated_at desc);
create index if not exists personal_content_items_user_favorite_idx
  on public.personal_content_items (user_id, is_favorite) where is_favorite;
create unique index if not exists personal_content_items_one_primary_idx
  on public.personal_content_items (user_id, item_type) where is_primary;
create index if not exists user_content_favorites_user_created_idx
  on public.user_content_favorites (user_id, created_at desc);
create index if not exists user_content_recents_user_accessed_idx
  on public.user_content_recents (user_id, accessed_at desc);
create index if not exists user_content_notes_user_updated_idx
  on public.user_content_notes (user_id, updated_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'personal_content_items',
    'user_content_favorites',
    'user_content_recents',
    'user_content_notes'
  ] loop
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
  end loop;
end
$$;

-- Modelos de prescrição: médicos veem somente revisados; admins administram todos.
do $$
declare
  policy_name text;
begin
  if to_regclass('public.prescription_templates') is not null then
    alter table public.prescription_templates enable row level security;

    for policy_name in
      select policyname from pg_policies
      where schemaname = 'public'
        and tablename = 'prescription_templates'
        and cmd = 'SELECT'
    loop
      execute format(
        'drop policy if exists %I on public.prescription_templates',
        policy_name
      );
    end loop;

    create policy prescription_templates_reviewed_or_admin
      on public.prescription_templates
      for select to authenticated
      using (review_status = 'revisado' or public.is_resibook_admin());
  end if;
end
$$;

commit;
