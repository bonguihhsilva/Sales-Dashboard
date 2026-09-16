-- Adiciona colunas escopo e vendor_id em regras_comissao
-- Separa a definição de escopo (coletiva vs individual) do bloco de condições
ALTER TABLE public.regras_comissao
  ADD COLUMN IF NOT EXISTS escopo text NOT NULL DEFAULT 'coletivo',
  ADD COLUMN IF NOT EXISTS vendor_id text;

-- Index para consultas filtradas por tenant e escopo
CREATE INDEX IF NOT EXISTS idx_regras_comissao_escopo
  ON public.regras_comissao(tenant_id, escopo, vendor_id);
