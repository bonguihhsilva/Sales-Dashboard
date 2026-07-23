-- C-04: protect_approved_commission (20260601000011) só preservava o flag
-- `aprovado` em si — não os valores monetários (comissao_base, bonus_total,
-- total, detalhamento). Recalcular um período reescrevia esses valores numa
-- comissão já aprovada mantendo o selo de aprovação de um gerente sobre um
-- número que ele nunca aprovou de fato.
-- Fix: além de preservar aprovado/aprovado_por (comportamento existente,
-- inalterado), rejeita com exceção qualquer UPDATE que altere os valores
-- monetários de uma linha já aprovada. Rejeição explícita — não reversão
-- silenciosa — para que o caller (rota calcular-comissao) saiba que a
-- escrita falhou e possa reagir (na prática, a rota já filtra essas linhas
-- antes do upsert; este trigger é a garantia de último recurso).

CREATE OR REPLACE FUNCTION public.protect_approved_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.aprovado = true AND NEW.aprovado = false THEN
    NEW.aprovado     := true;
    NEW.aprovado_por := OLD.aprovado_por;
  END IF;

  IF OLD.aprovado = true AND (
    NEW.comissao_base IS DISTINCT FROM OLD.comissao_base OR
    NEW.bonus_total    IS DISTINCT FROM OLD.bonus_total OR
    NEW.total          IS DISTINCT FROM OLD.total OR
    NEW.detalhamento   IS DISTINCT FROM OLD.detalhamento
  ) THEN
    RAISE EXCEPTION 'Comissão aprovada é imutável — crie um ajuste em vez de recalcular';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.protect_approved_commission() FROM public, anon, authenticated;

-- Trigger já existe e aponta para esta função (CREATE OR REPLACE acima
-- já é suficiente para aplicar o novo comportamento) — recriada aqui
-- apenas para manter o arquivo de migration idempotente e auto-contido.
DROP TRIGGER IF EXISTS protect_approved_commission_trg ON public.comissoes_calculadas;
CREATE TRIGGER protect_approved_commission_trg
  BEFORE UPDATE ON public.comissoes_calculadas
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_approved_commission();
