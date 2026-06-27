-- Carteira de Clientes 360 — dimensão categoria
alter table public.products  add column if not exists category text;
alter table public.sale_items add column if not exists category text; -- denormalizado p/ leitura rápida; preenchido via join no app

-- View: mix de categoria por (period, vendor, client)
create or replace view public.client_category_mix as
select
  si.tenant_id,
  si.period_id,
  si.vendor_id,
  sr.client_id,
  coalesce(p.category, si.category, 'Sem categoria') as category,
  sum(si.total_price) as total,
  sum(si.qty)         as qty
from public.sale_items si
join public.sales_records sr
  on sr.tenant_id = si.tenant_id and sr.period_id = si.period_id and sr.order_ref = si.order_id
left join public.products p
  on p.tenant_id = si.tenant_id and p.period_id = si.period_id and p.product_code = si.product_code
group by si.tenant_id, si.period_id, si.vendor_id, sr.client_id, coalesce(p.category, si.category, 'Sem categoria');
