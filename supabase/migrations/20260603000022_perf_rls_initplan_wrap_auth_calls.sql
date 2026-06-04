-- Perf advisor (auth_rls_initplan): envolve auth.*()/current_setting() em (select ...)
-- p/ avaliacao unica (InitPlan) em vez de por-linha. Semantica identica.
-- ALTER POLICY (nao DROP) preserva cmd/roles e evita janela sem policy.
-- Idempotente: re-rodar so re-aplica a mesma transformacao (sem double-wrap).
do $$
declare r record; nq text; nc text; stmt text;
begin
  for r in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
    and (coalesce(qual,'') ~ 'auth\.(uid|jwt|role)\(\)' or coalesce(with_check,'') ~ 'auth\.(uid|jwt|role)\(\)'
         or coalesce(qual,'') ~ 'current_setting' or coalesce(with_check,'') ~ 'current_setting')
  loop
    nq := r.qual; nc := r.with_check;
    if nq is not null then
      nq := regexp_replace(nq,'auth\.uid\(\)','(select auth.uid())','g');
      nq := regexp_replace(nq,'auth\.role\(\)','(select auth.role())','g');
      nq := regexp_replace(nq,'auth\.jwt\(\)','(select auth.jwt())','g');
      nq := regexp_replace(nq,'current_setting\(''request\.jwt\.claims''::text, true\)','(select current_setting(''request.jwt.claims''::text, true))','g');
    end if;
    if nc is not null then
      nc := regexp_replace(nc,'auth\.uid\(\)','(select auth.uid())','g');
      nc := regexp_replace(nc,'auth\.role\(\)','(select auth.role())','g');
      nc := regexp_replace(nc,'auth\.jwt\(\)','(select auth.jwt())','g');
      nc := regexp_replace(nc,'current_setting\(''request\.jwt\.claims''::text, true\)','(select current_setting(''request.jwt.claims''::text, true))','g');
    end if;
    stmt := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
    if nq is not null then stmt := stmt || format(' USING (%s)', nq); end if;
    if nc is not null then stmt := stmt || format(' WITH CHECK (%s)', nc); end if;
    execute stmt;
  end loop;
end $$;
