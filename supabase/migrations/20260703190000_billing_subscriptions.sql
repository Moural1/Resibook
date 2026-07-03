-- Assinaturas comerciais do Resibook. Escrita exclusiva do servidor.
begin;

create extension if not exists pgcrypto;

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mercado_pago' check (provider = 'mercado_pago'),
  provider_subscription_id text not null unique,
  plan_id text not null check (plan_id in ('basic', 'complete')),
  status text not null,
  payer_email text,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  checkout_url text,
  next_payment_at timestamptz,
  provider_created_at timestamptz,
  provider_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_status_idx
  on public.billing_subscriptions (user_id, status, amount desc);

alter table public.billing_subscriptions enable row level security;
alter table public.billing_subscriptions force row level security;

drop policy if exists own_billing_subscription_select on public.billing_subscriptions;
create policy own_billing_subscription_select
  on public.billing_subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Não existem policies de insert/update/delete para o cliente. O webhook usa
-- a service role somente no servidor e sincroniza o estado do provedor.

commit;
