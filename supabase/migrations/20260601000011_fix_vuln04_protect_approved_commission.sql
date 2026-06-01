-- VULN-04: race condition em recálculo de comissão apagava aprovado=true.
-- Dois admins calculando simultaneamente: o segundo sobrescrevia aprovação do primeiro.
-- Fix: trigger BEFORE UPDATE — se aprovado=true, ignora qualquer tentativa de setar false.
-- Proteção na camada do banco, sem mudança de código na API.

CREATE OR REPLACE FUNCTION public.protect_approved_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.aprovado = true AND NEW.aprovado = false THEN
    NEW.aprovado     := true;
    NEW.aprovado_por := OLD.aprovado_por;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.protect_approved_commission() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS protect_approved_commission_trg ON public.comissoes_calculadas;
CREATE TRIGGER protect_approved_commission_trg
  BEFORE UPDATE ON public.comissoes_calculadas
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_approved_commission();
