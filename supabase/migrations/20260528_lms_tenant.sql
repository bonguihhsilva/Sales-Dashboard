-- supabase/migrations/20260528_lms_tenant.sql

DO $$
DECLARE
    v_star_company_id UUID;
BEGIN
    -- Obter o ID do tenant "Star Company"
    SELECT id INTO v_star_company_id FROM tenants WHERE slug = 'star-company' LIMIT 1;

    -- Se não encontrar o tenant, não faz nada
    IF v_star_company_id IS NULL THEN
        RAISE NOTICE 'Tenant Star Company não encontrado.';
        RETURN;
    END IF;

    -- Adicionar tenant_id na tabela de trilhas (lms) se não existir
    BEGIN
        ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        UPDATE trilhas SET tenant_id = v_star_company_id WHERE tenant_id IS NULL;
        ALTER TABLE trilhas ALTER COLUMN tenant_id SET NOT NULL;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela trilhas não existe.';
    END;

END $$;
