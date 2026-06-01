-- Atualiza a função calculate_vendor_goals para considerar as regras de comissão da loja
CREATE OR REPLACE FUNCTION public.calculate_vendor_goals(p_period_id bigint, p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year  int;
  v_month int;
  v_vendor RECORD;
  v_count  int;
  v_avg    numeric;
  v_meta1  numeric;
  v_meta2  numeric;
  v_meta3  numeric;
  
  v_regra RECORD;
  v_bonus1 numeric;
  v_bonus2 numeric;
  v_bonus3 numeric;
  v_commission_pct numeric;
  v_tipo_calculo text;
BEGIN
  SELECT year, month INTO v_year, v_month
  FROM periods WHERE id = p_period_id AND tenant_id = p_tenant_id;

  FOR v_vendor IN (
    SELECT DISTINCT vs.vendor_id, vs.vendor_name, vs.store
    FROM vendor_summary vs
    JOIN periods p ON p.id = vs.period_id
    WHERE (p.year * 12 + p.month) < (v_year * 12 + v_month)
      AND vs.tenant_id = p_tenant_id
  ) LOOP

    -- Tenta encontrar uma regra ativa para a loja específica do vendedor
    v_regra := NULL;
    SELECT * INTO v_regra
    FROM regras_comissao
    WHERE tenant_id = p_tenant_id
      AND ativo = true
      AND (condicoes->>'loja' = v_vendor.store)
    ORDER BY prioridade ASC, criado_em DESC
    LIMIT 1;

    -- Inicializa valores padrão caso não exista regra cadastrada
    IF v_regra.id IS NOT NULL THEN
      -- Se a regra for do tipo comissao_percentual (UI antiga), o valor de comissão está em acao->>'valor'
      IF v_regra.acao->>'tipo' = 'comissao_percentual' THEN
        v_commission_pct := COALESCE((v_regra.acao->>'valor')::numeric, 0.003);
      ELSE
        v_commission_pct := COALESCE((v_regra.acao->>'commission_pct')::numeric, 0.003);
      END IF;
      
      -- Garante fração decimal (se salvou ex: 0.5 para 0.5% ou se salvou 0.005)
      IF v_commission_pct >= 1 THEN
        v_commission_pct := v_commission_pct / 100.0;
      END IF;

      v_bonus1 := COALESCE((v_regra.acao->>'bonus1')::numeric, 100);
      v_bonus2 := COALESCE((v_regra.acao->>'bonus2')::numeric, 150);
      v_bonus3 := COALESCE((v_regra.acao->>'bonus3')::numeric, 200);
      v_tipo_calculo := COALESCE(v_regra.acao->>'tipo_calculo', 'auto');
    ELSE
      -- Fallback padrão
      SELECT commission_pct_default INTO v_commission_pct FROM tenants WHERE id = p_tenant_id;
      v_commission_pct := COALESCE(v_commission_pct, 0.003);
      v_bonus1 := 100;
      v_bonus2 := 150;
      v_bonus3 := 200;
      v_tipo_calculo := 'auto';
    END IF;

    -- Determina as metas
    IF v_tipo_calculo = 'manual' AND v_regra.id IS NOT NULL THEN
      v_meta1 := COALESCE((v_regra.acao->>'meta1')::numeric, 0);
      v_meta2 := COALESCE((v_regra.acao->>'meta2')::numeric, 0);
      v_meta3 := COALESCE((v_regra.acao->>'meta3')::numeric, 0);
      v_count := 0; -- sem histórico considerado se for manual
    ELSE
      -- Cálculo automático baseado em média móvel (últimos 3 meses)
      SELECT COUNT(*) INTO v_count
      FROM vendor_summary vs
      WHERE vs.vendor_id = v_vendor.vendor_id
        AND vs.tenant_id = p_tenant_id
        AND vs.period_id IN (
          SELECT id FROM periods
          WHERE (year * 12 + month) < (v_year * 12 + v_month) AND tenant_id = p_tenant_id
          ORDER BY (year * 12 + month) DESC
          LIMIT 3
        );

      IF v_count >= 3 THEN
        SELECT ROUND(AVG(vs.total_sold)) INTO v_avg
        FROM vendor_summary vs
        WHERE vs.vendor_id = v_vendor.vendor_id
          AND vs.tenant_id = p_tenant_id
          AND vs.period_id IN (
            SELECT id FROM periods
            WHERE (year * 12 + month) < (v_year * 12 + v_month) AND tenant_id = p_tenant_id
            ORDER BY (year * 12 + month) DESC
            LIMIT 3
          );
        v_meta1 := ROUND(v_avg * 1.20);
        v_meta2 := ROUND(v_meta1 * 1.20);
        v_meta3 := ROUND(v_meta2 * 1.20);
      ELSE
        v_meta1 := 0;
        v_meta2 := 0;
        v_meta3 := 0;
      END IF;
    END IF;

    INSERT INTO goals (
      period_id, tenant_id, vendor_id, vendor_name, store,
      meta1, meta2, meta3, bonus1, bonus2, bonus3,
      commission_pct, history_months
    )
    VALUES (
      p_period_id, p_tenant_id, v_vendor.vendor_id, v_vendor.vendor_name, v_vendor.store,
      v_meta1, v_meta2, v_meta3, v_bonus1, v_bonus2, v_bonus3,
      v_commission_pct, v_count
    )
    ON CONFLICT (period_id, vendor_id, tenant_id) DO UPDATE
    SET
      meta1 = EXCLUDED.meta1,
      meta2 = EXCLUDED.meta2,
      meta3 = EXCLUDED.meta3,
      bonus1 = EXCLUDED.bonus1,
      bonus2 = EXCLUDED.bonus2,
      bonus3 = EXCLUDED.bonus3,
      commission_pct = EXCLUDED.commission_pct,
      history_months = EXCLUDED.history_months;

  END LOOP;
END;
$$;
