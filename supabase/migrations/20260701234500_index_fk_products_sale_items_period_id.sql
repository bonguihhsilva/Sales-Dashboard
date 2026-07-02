-- Advisor unindexed_foreign_keys: FKs de period_id sem índice de cobertura
create index if not exists idx_products_period_id on public.products (period_id);
create index if not exists idx_sale_items_period_id on public.sale_items (period_id);
