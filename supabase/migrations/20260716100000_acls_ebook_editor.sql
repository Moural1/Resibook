-- Editor estruturado do eBook ACLS: rascunho privado, publicação e histórico imutável.
begin;

create table if not exists public.acls_ebook_drafts (
  document_key text primary key check (document_key = 'acls'),
  content jsonb not null,
  revision integer not null default 1 check (revision > 0),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acls_ebook_publications (
  document_key text primary key check (document_key = 'acls'),
  content jsonb not null,
  revision integer not null check (revision > 0),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now()
);

create table if not exists public.acls_ebook_revisions (
  id uuid primary key default gen_random_uuid(),
  document_key text not null check (document_key = 'acls'),
  revision integer not null check (revision > 0),
  content jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_key, revision)
);

drop trigger if exists acls_ebook_drafts_set_updated_at on public.acls_ebook_drafts;
create trigger acls_ebook_drafts_set_updated_at
before update on public.acls_ebook_drafts
for each row execute function public.set_resibook_updated_at();

alter table public.acls_ebook_drafts enable row level security;
alter table public.acls_ebook_drafts force row level security;
alter table public.acls_ebook_publications enable row level security;
alter table public.acls_ebook_publications force row level security;
alter table public.acls_ebook_revisions enable row level security;
alter table public.acls_ebook_revisions force row level security;

create policy acls_ebook_drafts_admin_all on public.acls_ebook_drafts
  for all to authenticated
  using (public.is_resibook_admin())
  with check (public.is_resibook_admin());

create policy acls_ebook_publications_authenticated_read on public.acls_ebook_publications
  for select to authenticated using (true);

create policy acls_ebook_revisions_admin_read on public.acls_ebook_revisions
  for select to authenticated using (public.is_resibook_admin());

create or replace function public.publish_acls_ebook(p_expected_revision integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  draft public.acls_ebook_drafts%rowtype;
begin
  if not public.is_resibook_admin() then
    raise exception 'Ação permitida apenas ao administrador.' using errcode = '42501';
  end if;

  select * into draft
  from public.acls_ebook_drafts
  where document_key = 'acls'
  for update;

  if not found then
    raise exception 'Rascunho ACLS não encontrado.' using errcode = 'P0002';
  end if;
  if draft.revision <> p_expected_revision then
    raise exception 'O rascunho foi atualizado em outra sessão.' using errcode = '40001';
  end if;

  insert into public.acls_ebook_revisions (document_key, revision, content, created_by)
  values ('acls', draft.revision, draft.content, auth.uid())
  on conflict (document_key, revision) do nothing;

  insert into public.acls_ebook_publications (document_key, content, revision, published_by, published_at)
  values ('acls', draft.content, draft.revision, auth.uid(), now())
  on conflict (document_key) do update set
    content = excluded.content,
    revision = excluded.revision,
    published_by = excluded.published_by,
    published_at = excluded.published_at;

  return jsonb_build_object('revision', draft.revision, 'publishedAt', now());
end;
$$;

revoke all on function public.publish_acls_ebook(integer) from public;
grant execute on function public.publish_acls_ebook(integer) to authenticated;

commit;
