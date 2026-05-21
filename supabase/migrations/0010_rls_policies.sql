-- =============================================================
-- Migration 0010 — RLS Policies (isolamento multi-tenant)
-- Phase 2 — Schema v2
-- Padrão: tenant_id via profiles para evitar dependência de JWT custom claim
-- (auth.jwt() ->> 'tenant_id' não está disponível sem Auth Hook configurado)
-- =============================================================

-- ── tenants ────────────────────────────────────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select_own" ON tenants
  FOR SELECT USING (
    id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── profiles (adicionar policy de tenant ao RLS já ativo da 0001) ──────────
DO $$ BEGIN
  CREATE POLICY "profiles_tenant_select" ON profiles
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM profiles p2 WHERE p2.id = auth.uid())
      OR id = auth.uid()
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── categorias ──────────────────────────────────────────────────────────────
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_tenant" ON categorias
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR tenant_id IS NULL -- categorias globais
  );

-- ── produtos ────────────────────────────────────────────────────────────────
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produtos_tenant" ON produtos
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── vendas ──────────────────────────────────────────────────────────────────
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendas_tenant" ON vendas
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── itens_venda ─────────────────────────────────────────────────────────────
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "itens_venda_via_vendas" ON itens_venda
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendas v
      WHERE v.id = itens_venda.venda_id
        AND v.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── regras_comissao ─────────────────────────────────────────────────────────
ALTER TABLE regras_comissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regras_comissao_tenant" ON regras_comissao
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── comissoes_calculadas ────────────────────────────────────────────────────
ALTER TABLE comissoes_calculadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comissoes_tenant" ON comissoes_calculadas
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── widget_types ────────────────────────────────────────────────────────────
-- widget_types é global: qualquer autenticado pode ler
ALTER TABLE widget_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "widget_types_authenticated" ON widget_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── dashboard_layouts ───────────────────────────────────────────────────────
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_layouts_own" ON dashboard_layouts
  FOR ALL USING (usuario_id = auth.uid());

-- ── convites ────────────────────────────────────────────────────────────────
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "convites_tenant" ON convites
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Token de convite é público para validação (token é o segredo em si)
CREATE POLICY "convites_token_select" ON convites
  FOR SELECT USING (true);

-- ── trilhas ─────────────────────────────────────────────────────────────────
ALTER TABLE trilhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trilhas_tenant_or_global" ON trilhas
  FOR SELECT USING (
    tenant_id IS NULL
    OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "trilhas_tenant_insert" ON trilhas
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ── modulos ──────────────────────────────────────────────────────────────────
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modulos_via_trilha" ON modulos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trilhas t WHERE t.id = modulos.trilha_id
        AND (t.tenant_id IS NULL
             OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

-- ── licoes ───────────────────────────────────────────────────────────────────
ALTER TABLE licoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "licoes_via_modulo" ON licoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modulos m
      JOIN trilhas t ON t.id = m.trilha_id
      WHERE m.id = licoes.modulo_id
        AND (t.tenant_id IS NULL
             OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

-- ── quiz_questoes ────────────────────────────────────────────────────────────
ALTER TABLE quiz_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questoes_via_modulo" ON quiz_questoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modulos m
      JOIN trilhas t ON t.id = m.trilha_id
      WHERE m.id = quiz_questoes.modulo_id
        AND (t.tenant_id IS NULL
             OR t.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    )
  );

-- ── progresso_usuario ────────────────────────────────────────────────────────
ALTER TABLE progresso_usuario ENABLE ROW LEVEL SECURITY;

-- Vendedor lê/escreve apenas seu próprio progresso
CREATE POLICY "progresso_proprio" ON progresso_usuario
  FOR ALL USING (usuario_id = auth.uid());

-- Gerente/adm lê progresso do tenant
CREATE POLICY "progresso_tenant_read" ON progresso_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'adm'
        AND (SELECT tenant_id FROM profiles WHERE id = progresso_usuario.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── quiz_resultados ──────────────────────────────────────────────────────────
ALTER TABLE quiz_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_resultados_proprio" ON quiz_resultados
  FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "quiz_resultados_tenant_read" ON quiz_resultados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'adm'
        AND (SELECT tenant_id FROM profiles WHERE id = quiz_resultados.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── gamificacao ──────────────────────────────────────────────────────────────
ALTER TABLE gamificacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamificacao_proprio" ON gamificacao
  FOR ALL USING (usuario_id = auth.uid());

CREATE POLICY "gamificacao_tenant_read" ON gamificacao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'adm'
        AND (SELECT tenant_id FROM profiles WHERE id = gamificacao.usuario_id)
            = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ── Atualizar trigger handle_new_user ────────────────────────────────────────
-- Agora também cria entrada em gamificacao para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Inicializar gamificação para o novo usuário
  INSERT INTO gamificacao (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;

  RETURN NEW;
END;
$$;
