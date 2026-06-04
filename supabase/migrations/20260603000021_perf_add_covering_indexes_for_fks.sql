-- Perf advisor (unindexed_foreign_keys): cria indice de cobertura p/ toda FK sem indice.
-- Idempotente (IF NOT EXISTS). Indices nunca alteram resultado de query.
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass as tbl,
           cl.relname as tname,
           (select string_agg(quote_ident(a.attname), ', ' order by k.ord)
            from unnest(c.conkey) with ordinality k(attnum,ord)
            join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.attnum) as cols,
           (select string_agg(a.attname, '_' order by k.ord)
            from unnest(c.conkey) with ordinality k(attnum,ord)
            join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.attnum) as colnames
    from pg_constraint c
    join pg_class cl on cl.oid=c.conrelid
    where c.contype='f' and c.connamespace='public'::regnamespace
    and not exists (
      select 1 from pg_index i
      where i.indrelid=c.conrelid
      and (string_to_array(i.indkey::text,' ')::int[])[1:cardinality(c.conkey)] = c.conkey::int[]
    )
  loop
    execute format('create index if not exists %I on %s (%s)',
      left('idx_'||r.tname||'_'||r.colnames||'_fk', 63), r.tbl, r.cols);
  end loop;
end $$;
