-- C-04: protect_approved_commission (20260601000011) só preservava o flag
-- `aprovado` em si — não os valores monetários (comissao_base, bonus_total,
-- total, detalhamento). Recalcular um período reescrevia esses valores numa
-- comissão já aprovada mantendo o selo de aprovação de um gerente sobre um
-- número que ele nunca aprovou de fato.
-- Fix: rejeita com exceção qualquer UPDATE que altere os valores monetários
-- de uma linha já aprovada. Rejeição explícita — não reversão silenciosa —
-- para que o caller (rota calcular-comissao) saiba que a escrita falhou e
-- possa reagir (na prática, a rota já filtra essas linhas antes do upsert
-- via filterUnapproved; este trigger é a garantia de último recurso).
--
-- Correção sobre a versão original (20260601000011): removida a cláusula
-- que forçava `NEW.aprovado` de volta a `true` sempre que um UPDATE tentava
-- setá-lo `false`. Essa cláusula existia para blindar contra uma corrida em
-- que dois admins recalculando o mesmo período concorrentemente poderiam
-- reverter a aprovação um do outro — mas essa corrida já foi eliminada no
-- nível da rota: calcular-comissao filtra linhas aprovadas (filterUnapproved)
-- antes do upsert, então o recálculo nunca mais escreve `aprovado: false`
-- sobre uma linha aprovada. A única chamadora restante que grava
-- `aprovado: false` é a rota /aprovar (PATCH) — uma ação deliberada de
-- admin/gerente para reprovar uma comissão, não uma corrida automática.
-- Forçar o valor de volta a `true` ali quebrava a única forma de reverter
-- uma aprovação: o UPDATE "sucedia" (sem erro) mas nada mudava.

CREATE OR REPLACE FUNCTION public.protect_approved_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Interação entre as duas checagens: a rota /aprovar só altera
  -- aprovado/aprovado_por (nunca comissao_base/bonus_total/total/
  -- detalhamento), então quando ela reprova uma comissão (OLD.aprovado=true,
  -- NEW.aprovado=false) todos os IS DISTINCT FROM abaixo avaliam false e a
  -- exceção não dispara — o UPDATE de reprovação passa livre, como deve ser.
  IF OLD.aprovado = true AND (
    NEW.comissao_base IS DISTINCT FROM OLD.comissao_base OR
    NEW.bonus_total    IS DISTINCT FROM OLD.bonus_total OR
    NEW.total          IS DISTINCT FROM OLD.total OR
    NEW.detalhamento   IS DISTINCT FROM OLD.detalhamento
  ) THEN
    RAISE EXCEPTION 'Comissão aprovada é imutável — reprove a comissão antes de recalcular';
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
