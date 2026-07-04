-- Isola assinaturas de teste das assinaturas comerciais existentes.
begin;

alter table public.billing_subscriptions
  add column if not exists environment text not null default 'production';

alter table public.billing_subscriptions
  add column if not exists mercado_pago_payment_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at timestamptz,
  add column if not exists canceled_at timestamptz;

create index if not exists billing_subscriptions_payment_idx
  on public.billing_subscriptions (mercado_pago_payment_id)
  where mercado_pago_payment_id is not null;

alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_environment_check;

alter table public.billing_subscriptions
  add constraint billing_subscriptions_environment_check
  check (environment in ('test', 'production'));

drop index if exists public.billing_subscriptions_user_status_idx;
create index if not exists billing_subscriptions_user_environment_status_idx
  on public.billing_subscriptions (user_id, environment, status, amount desc);

comment on column public.billing_subscriptions.environment is
  'Ambiente de origem no Mercado Pago. Registros test nunca liberam acesso de produção.';

commit;
