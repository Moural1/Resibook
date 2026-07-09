create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (
    category in (
      'Não entendi como usar',
      'Não achei o que procurei',
      'Conteúdo incompleto',
      'Visual confuso',
      'Sugestão de melhoria'
    )
  ),
  message text not null check (char_length(message) between 5 and 1200),
  page_path text,
  created_at timestamptz not null default now()
);

create index if not exists user_feedback_user_created_idx
  on public.user_feedback (user_id, created_at desc);

create index if not exists user_feedback_created_idx
  on public.user_feedback (created_at desc);

alter table public.user_feedback enable row level security;
alter table public.user_feedback force row level security;

drop policy if exists own_feedback_select on public.user_feedback;
create policy own_feedback_select
  on public.user_feedback
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists own_feedback_insert on public.user_feedback;
create policy own_feedback_insert
  on public.user_feedback
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));
