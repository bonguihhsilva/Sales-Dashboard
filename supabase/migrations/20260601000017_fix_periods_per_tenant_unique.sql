-- Periods era UNIQUE(year, month) global → só um tenant podia possuir cada mês.
-- Sintomas: create-period/ensure-period falhavam (NOT NULL tenant_id) e onboarding
-- de 2º tenant no mesmo mês colidia. Corrige para isolamento per-tenant.
-- FKs (goals, sales_records, comissoes_calculadas, vendas) usam periods(id) (PK) — intactas.

ALTER TABLE public.periods DROP CONSTRAINT IF EXISTS periods_year_month_key;
ALTER TABLE public.periods
  ADD CONSTRAINT periods_tenant_year_month_key UNIQUE (tenant_id, year, month);

-- Remove versão stale de calculate_vendor_goals (1-arg, pré-tenant).
-- Rotas agora chamam a 2-arg (p_period_id, p_tenant_id).
DROP FUNCTION IF EXISTS public.calculate_vendor_goals(bigint);
