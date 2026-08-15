-- Módulos habilitados por tenant (feature flags no nível da empresa).
-- Reusa o padrão jsonb já usado em gerente_permissions.permissions.
alter table tenants
  add column if not exists modules jsonb not null default '{
    "comissao": true,
    "rh": true,
    "treinamentos": true,
    "compras": true,
    "relatorios": true
  }'::jsonb;

comment on column tenants.modules is 'Feature flags por tenant: quais módulos a empresa contratou. Chaves: comissao, rh, treinamentos, compras, relatorios. dashboard/metas/usuarios são core, sempre visíveis.';
