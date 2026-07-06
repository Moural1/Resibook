-- Pedidos Pix manuais com aprovação administrativa e entitlement de 30 dias.
begin;

alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_provider_check;

alter table public.billing_subscriptions
  add constraint billing_subscriptions_provider_check
  check (provider in ('mercado_pago', 'manual'));

alter table public.billing_subscriptions
  add column if not exists payment_method text not null default 'mercado_pago',
  add column if not exists last_payment_status text,
  add column if not exists last_payment_status_detail text;

alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_payment_method_check;

alter table public.billing_subscriptions
  add constraint billing_subscriptions_payment_method_check
  check (payment_method in ('mercado_pago', 'pix_manual', 'admin_manual', 'test'));

create table if not exists public.manual_pix_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('basic', 'complete')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'canceled')),
  payment_method text not null default 'pix_manual'
    check (payment_method = 'pix_manual'),
  amount numeric(10,2) not null check (
    (plan_id = 'basic' and amount = 30.00)
    or (plan_id = 'complete' and amount = 50.00)
  ),
  customer_email text not null,
  customer_name text,
  notes text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null
);

create unique index if not exists manual_pix_one_pending_per_user_idx
  on public.manual_pix_orders (user_id)
  where status = 'pending';

create index if not exists manual_pix_orders_status_created_idx
  on public.manual_pix_orders (status, created_at desc);

alter table public.manual_pix_orders enable row level security;
alter table public.manual_pix_orders force row level security;

drop policy if exists own_manual_pix_select on public.manual_pix_orders;
create policy own_manual_pix_select
  on public.manual_pix_orders
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_resibook_admin()
  );

drop policy if exists own_manual_pix_insert on public.manual_pix_orders;
create policy own_manual_pix_insert
  on public.manual_pix_orders
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and payment_method = 'pix_manual'
    and approved_at is null
    and approved_by is null
    and rejected_at is null
    and rejected_by is null
    and lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists admin_manual_pix_update on public.manual_pix_orders;
create policy admin_manual_pix_update
  on public.manual_pix_orders
  for update to authenticated
  using (public.is_resibook_admin())
  with check (public.is_resibook_admin());

create or replace function public.review_manual_pix_order(
  p_order_id uuid,
  p_decision text,
  p_notes text default null
)
returns public.manual_pix_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  reviewed public.manual_pix_orders;
begin
  if not public.is_resibook_admin() then
    raise exception 'Ação permitida apenas ao administrador.'
      using errcode = '42501';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decisão inválida.' using errcode = '22023';
  end if;

  select * into reviewed
  from public.manual_pix_orders
  where id = p_order_id
  for update;

  if reviewed.id is null then
    raise exception 'Pedido Pix não encontrado.' using errcode = 'P0002';
  end if;

  if reviewed.status <> 'pending' then
    raise exception 'Pedido Pix já foi revisado.' using errcode = 'P0001';
  end if;

  if p_decision = 'approved' then
    update public.manual_pix_orders
    set status = 'approved',
        notes = nullif(trim(p_notes), ''),
        approved_at = now(),
        approved_by = auth.uid(),
        rejected_at = null,
        rejected_by = null
    where id = p_order_id
    returning * into reviewed;

    insert into public.billing_subscriptions (
      user_id,
      provider,
      provider_subscription_id,
      environment,
      payment_method,
      plan_id,
      status,
      payer_email,
      amount,
      currency,
      current_period_start,
      current_period_end,
      provider_created_at,
      provider_updated_at,
      updated_at
    ) values (
      reviewed.user_id,
      'manual',
      'pix_manual:' || reviewed.id::text,
      'production',
      'pix_manual',
      reviewed.plan_id,
      'active',
      reviewed.customer_email,
      reviewed.amount,
      'BRL',
      now(),
      now() + interval '30 days',
      reviewed.created_at,
      now(),
      now()
    )
    on conflict (provider_subscription_id) do update
      set plan_id = excluded.plan_id,
          status = 'active',
          payer_email = excluded.payer_email,
          amount = excluded.amount,
          current_period_start = excluded.current_period_start,
          current_period_end = excluded.current_period_end,
          provider_updated_at = excluded.provider_updated_at,
          updated_at = excluded.updated_at;
  else
    update public.manual_pix_orders
    set status = 'rejected',
        notes = nullif(trim(p_notes), ''),
        rejected_at = now(),
        rejected_by = auth.uid(),
        approved_at = null,
        approved_by = null
    where id = p_order_id
    returning * into reviewed;
  end if;

  return reviewed;
end;
$$;

revoke all on function public.review_manual_pix_order(uuid, text, text) from public;
grant execute on function public.review_manual_pix_order(uuid, text, text)
  to authenticated;

commit;

