-- Security hardening (advisor 2026-05-29): close anon exposure on stores + SECURITY DEFINER functions.
-- Applied to prod via Supabase MCP on 2026-05-29; this file mirrors it for version control.
--
-- Verified call-sites before applying:
--   stores  : read tenant-scoped via user client (meu-resultado, mapeamento, usuarios, vendedor/[id],
--             mural); admin reads via service_role (dashboard, comissao). No writes via client.
--   RPCs    : vendor_evolution -> authenticated (vendor self-view + admin vendor detail);
--             calculate_vendor_goals / store_daily_evolution* -> service_role only (admin client);
--             handle_new_user -> trigger function (no REST caller).

-- 1. stores: enable RLS, allow authenticated SELECT (closes anon/public read+write exposure).
--    service_role bypasses RLS, so admin reads/writes are unaffected; anon is now denied.
alter table public.stores enable row level security;
drop policy if exists "authenticated can read stores" on public.stores;
create policy "authenticated can read stores"
  on public.stores for select to authenticated using (true);

-- 2. Restrict EXECUTE on SECURITY DEFINER functions.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.calculate_vendor_goals(bigint) from public, anon, authenticated;
revoke execute on function public.calculate_vendor_goals(bigint, uuid) from public, anon, authenticated;
revoke execute on function public.store_daily_evolution(integer) from public, anon, authenticated;
revoke execute on function public.store_daily_evolution_multi(integer[]) from public, anon, authenticated;
revoke execute on function public.store_daily_evolution_multi(bigint[], uuid) from public, anon, authenticated;
grant execute on function public.calculate_vendor_goals(bigint) to service_role;
grant execute on function public.calculate_vendor_goals(bigint, uuid) to service_role;
grant execute on function public.store_daily_evolution(integer) to service_role;
grant execute on function public.store_daily_evolution_multi(integer[]) to service_role;
grant execute on function public.store_daily_evolution_multi(bigint[], uuid) to service_role;

-- vendor_evolution: read fn used by authenticated self-view; drop anon/public only.
revoke execute on function public.vendor_evolution(text) from public, anon;
grant execute on function public.vendor_evolution(text) to authenticated, service_role;
