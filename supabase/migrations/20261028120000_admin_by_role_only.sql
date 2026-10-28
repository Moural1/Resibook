-- Admin passa a depender só de app_metadata.role = 'admin'.
-- O e-mail histórico igormoura@resibook.com deixa de dar permissão: o domínio
-- resibook.com não pertence ao projeto e pode mudar de dono.
-- Aplicar DEPOIS de marcar a conta administradora com a role (ver
-- docs/migracao-admin.md), senão o painel admin fica indisponível até lá.

create or replace function public.is_resibook_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;
revoke all on function public.is_resibook_admin() from public;
grant execute on function public.is_resibook_admin() to authenticated;
