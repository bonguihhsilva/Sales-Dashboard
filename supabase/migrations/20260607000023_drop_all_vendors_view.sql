-- Drop unused all_vendors view (2026-06-07).
--
-- all_vendors agrupa por vendor_id SEM tenant_id → definição cross-tenant.
-- Nunca foi usada em nenhuma página ou rota do app (só existia em supabase.ts tipos).
-- SELECT já revogado de anon/authenticated (migration 20260601000019_p0_security_closeout).
-- Removida para eliminar dead code e evitar grants acidentais futuros.
--
-- vendor_summary e client_portfolio permanecem (lidas exclusivamente via service_role
-- + .eq('tenant_id') em server components — SELECT de authenticated/anon revogado).

DROP VIEW IF EXISTS public.all_vendors;
