-- Rate limiter Postgres-backed (substitui bypass silencioso quando sem Upstash).
-- Janela fixa, atômico via upsert. Acessado só por service_role (app admin client).
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text PRIMARY KEY,
  count        int NOT NULL,
  window_start timestamptz NOT NULL
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- Sem policies: só service_role (bypassa RLS). anon/authenticated negados.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.rate_limits (key, count, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      THEN 1
      ELSE public.rate_limits.count + 1
    END,
    window_start = CASE
      WHEN public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
      THEN now()
      ELSE public.rate_limits.window_start
    END
  RETURNING count INTO v_count;

  RETURN v_count <= p_max;  -- true = permitido, false = limitado
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text,int,int) FROM public, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.check_rate_limit(text,int,int) TO service_role;
