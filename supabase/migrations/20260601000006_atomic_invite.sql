-- supabase/migrations/20260601000006_atomic_invite.sql
-- Redefinição da trigger handle_new_user para associar e marcar convites como usados atomicamente no banco de dados.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_invite_token text;
  v_convite record;
  v_role public.user_role := 'vendedor'::public.user_role;
  v_tenant_id uuid := null;
  v_store text := null;
BEGIN
  -- Verificar se existe token de convite no metadata do usuário
  v_invite_token := NEW.raw_user_meta_data->>'invite_token';

  IF v_invite_token IS NOT NULL THEN
    -- Buscar e travar o convite para evitar concorrência (SELECT FOR UPDATE)
    SELECT * INTO v_convite
    FROM public.convites
    WHERE token = v_invite_token AND usado = false AND expira_em > now()
    FOR UPDATE;

    IF v_convite.id IS NOT NULL THEN
      -- Marcar convite como usado
      UPDATE public.convites
      SET usado = true
      WHERE id = v_convite.id;

      -- Capturar dados do convite para o perfil
      v_role := v_convite.role::public.user_role;
      v_tenant_id := v_convite.tenant_id;
      v_store := v_convite.loja;
    ELSE
      -- Se o token foi enviado mas não é válido/ativo, cancela a transação de criação
      RAISE EXCEPTION 'Convite inválido, já utilizado ou expirado.';
    END IF;
  END IF;

  -- Inserir perfil associado
  INSERT INTO public.profiles (id, name, role, tenant_id, store)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, ''),
    v_role,
    v_tenant_id,
    v_store
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      role = CASE WHEN v_invite_token IS NOT NULL THEN EXCLUDED.role ELSE public.profiles.role END,
      tenant_id = CASE WHEN v_invite_token IS NOT NULL THEN EXCLUDED.tenant_id ELSE public.profiles.tenant_id END,
      store = CASE WHEN v_invite_token IS NOT NULL THEN EXCLUDED.store ELSE public.profiles.store END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Sincronização do Histórico de Migrações (SOC2 Compliance)
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('20260601000006')
ON CONFLICT (version) DO NOTHING;
