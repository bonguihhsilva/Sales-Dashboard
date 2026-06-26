---
phase: quick
plan: 260626-jnc
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/YYYYMMDDHHMMSS_profit_commission.sql
  - src/types/index.ts
  - src/lib/parser.ts
  - src/lib/server-parser.ts
  - src/app/api/admin/parse-upload/route.ts
  - src/app/api/admin/upload-catalog/route.ts
  - src/app/api/admin/calcular-comissao/route.ts
  - src/app/dashboard/UploadModal.tsx
autonomous: true
requirements: [PROFIT-COMMISSION]
must_haves:
  truths:
    - "Migration cria products, sale_items e adiciona commission_type em goals sem quebrar dados existentes"
    - "Parser HTML extrai product_code, qty, unit_price por item e persiste em sale_items"
    - "Upload de catálogo (HTML ou XLSX) popula products versionado por period_id"
    - "vendor_summary expõe total_profit calculado de sale_items"
    - "Engine de comissão usa total_profit quando commission_type='profit'"
  artifacts:
    - path: supabase/migrations/YYYYMMDDHHMMSS_profit_commission.sql
      provides: "DDL completo: products, sale_items, goals.commission_type, vendor_summary.total_profit"
    - path: src/lib/parser.ts
      provides: "SaleTransaction com campos opcionais product_code, unit_cost, margin_pct"
    - path: src/app/api/admin/upload-catalog/route.ts
      provides: "Endpoint POST para upload de catálogo de produtos"
    - path: src/app/api/admin/calcular-comissao/route.ts
      provides: "Engine usando commission_type para escolher base (revenue vs profit)"
  key_links:
    - from: "sale_items"
      to: "products"
      via: "JOIN em product_code + period_id + tenant_id para enriquecimento de custo"
    - from: "calcular-comissao/route.ts"
      to: "vendor_summary.total_profit"
      via: "base = commission_type === 'profit' ? total_profit : total_sold"
---

<objective>
Implementar suporte completo a comissão sobre lucro: migration de schema, parser de catálogo de produtos, extensão do parser de vendas para capturar itens individuais, cálculo de total_profit em vendor_summary e engine de comissão ciente de commission_type.

Purpose: Gerentes podem configurar comissão sobre lucro (margem real) em vez de receita bruta, o que reflete melhor a rentabilidade por vendedor.
Output: Tabelas products + sale_items no banco, upload de catálogo na UI, commission_type em goals, engine atualizada.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/index.ts
@src/lib/parser.ts
@src/lib/server-parser.ts
@src/app/api/admin/parse-upload/route.ts
@src/app/api/admin/calcular-comissao/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migration — products, sale_items, goals.commission_type, vendor_summary</name>
  <files>supabase/migrations/YYYYMMDDHHMMSS_profit_commission.sql</files>
  <action>
Criar migration com o seguinte DDL (substituir YYYYMMDDHHMMSS pelo timestamp real):

**1. Tabela `products`** — catálogo versionado por período:
```sql
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_id       integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  product_code    text NOT NULL,
  name            text,
  cost_price      numeric(12,2),
  sale_price      numeric(12,2),
  margin_pct      numeric(6,4),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_id, product_code)
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON products
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));
```

**2. Tabela `sale_items`** — itens individuais por venda:
```sql
CREATE TABLE IF NOT EXISTS sale_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period_id     integer NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  vendor_id     text NOT NULL,
  order_id      text NOT NULL,
  product_code  text NOT NULL,
  qty           numeric(10,2) NOT NULL DEFAULT 1,
  unit_price    numeric(12,2) NOT NULL,
  total_price   numeric(12,2) NOT NULL,
  unit_cost     numeric(12,2),
  total_profit  numeric(12,2),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sale_items_period_vendor
  ON sale_items (tenant_id, period_id, vendor_id);
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON sale_items
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));
```

**3. Coluna `goals.commission_type`**:
```sql
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'revenue'
  CHECK (commission_type IN ('revenue', 'profit'));
```

**4. Coluna `vendor_summary.total_profit`** — se vendor_summary for VIEW, alterar a query; se for tabela materializada ou coluna, adicionar:
```sql
-- Se vendor_summary é tabela:
ALTER TABLE vendor_summary
  ADD COLUMN IF NOT EXISTS total_profit numeric(12,2) NOT NULL DEFAULT 0;
-- Se for VIEW, incluir:
--   COALESCE(SUM(si.total_profit) FILTER (WHERE si.vendor_id = vs.vendor_id AND si.period_id = vs.period_id), 0) AS total_profit
-- na SELECT da view.
```

IMPORTANTE: Antes de executar, verificar se `vendor_summary` é TABLE ou VIEW:
```sql
SELECT table_type FROM information_schema.tables WHERE table_name = 'vendor_summary';
```
Se for VIEW: recriar a view adicionando `total_profit` calculado de `sale_items`. Se for TABLE: usar ALTER TABLE acima.

Aplicar com `supabase db push` ou via MCP `apply_migration`.
  </action>
  <verify>
    <automated>
Verificar via Supabase MCP list_tables que products, sale_items existem.
Verificar que goals tem coluna commission_type com default 'revenue'.
Verificar que vendor_summary tem campo total_profit.
    </automated>
  </verify>
  <done>
Migration aplicada sem erros. products, sale_items criadas com RLS. goals.commission_type existe com default 'revenue'. vendor_summary expõe total_profit. Dados existentes intactos (commission_type = 'revenue' em todos os goals anteriores).
  </done>
</task>

<task type="auto">
  <name>Task 2: Parser extensão — SaleTransaction com itens + upload de catálogo</name>
  <files>
    src/lib/parser.ts,
    src/lib/server-parser.ts,
    src/app/api/admin/upload-catalog/route.ts,
    src/types/index.ts
  </files>
  <action>
**A. Estender `SaleTransaction` em `src/lib/parser.ts`:**

Adicionar campos opcionais ao interface (não quebra parsers existentes):
```ts
export interface SaleTransaction {
  vendor_id:    string
  client_id:    string
  client_name:  string
  sale_date:    string
  sale_time:    string
  order_ref:    string
  valor:        number
  quantity:     number
  // Novos campos para suporte a lucro:
  product_code?: string
  unit_price?:   number
  unit_cost?:    number
  margin_pct?:   number
}
```

Em `parseSalesHtml`: o HTML já tem product_code por item (confirmado). O parser atual agrega por ordem. Verificar quais colunas no HTML correspondem a product_code — usar parseamento flexível. Se cells.length >= 19, tentar extrair product_code de cells[alguma_coluna] onde o valor parece um código de produto (numérico/alfanumérico). Adicionar ao objeto push:
```ts
product_code: cells[COLUNA_PRODUTO] || undefined,
unit_price:   parseFloat(cells[COLUNA_UNIT_PRICE].replace(/,/g, '')) || undefined,
```
Se a coluna exata não for determinável a partir da estrutura atual, adicionar comentário TODO e preencher com `undefined` — o enriquecimento via join com `products` na Task 3 é o fallback.

**B. Novo endpoint `src/app/api/admin/upload-catalog/route.ts`:**

POST multipart/form-data com `file` (HTML ou XLSX) + `period_id` (number) + `tenant_id` implícito via auth.

Lógica:
1. Auth check — role adm/gerente/super_admin via `getTenantContext()`
2. Parse do arquivo:
   - `.html`/`.htm`: regex para extrair linhas de tabela, cada linha tem product_code, name, cost_price, sale_price, margin_pct
   - `.xlsx`/`.xls`: XLSX.read + sheet_to_json header:1, buscar colunas por nome (case-insensitive: "codigo", "nome", "custo", "preco", "margem")
3. Upsert em `products` com `{ onConflict: 'tenant_id,period_id,product_code' }` — idempotente
4. Retornar `{ imported: N }`

Formato esperado de HTML de catálogo: tabela com colunas que incluem produto/código + preço de custo. Usar parseamento flexível — detectar colunas por header text, não posição fixa.

Auth: usar `getTenantContext()` e `createAdminClient()` exatamente como os outros endpoints admin.

**C. Tipos em `src/types/index.ts`:**

Adicionar:
```ts
export interface Product {
  id: string
  tenant_id: string
  period_id: number
  product_code: string
  name: string | null
  cost_price: number | null
  sale_price: number | null
  margin_pct: number | null
  updated_at: string
}
```

Adicionar `commission_type: 'revenue' | 'profit'` ao interface `Goal` existente.
Adicionar `total_profit: number` ao interface `VendorSummary` existente.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
Build passa sem erros TypeScript. SaleTransaction tem campos opcionais novos. Endpoint /api/admin/upload-catalog existe. Goal tem commission_type. VendorSummary tem total_profit.
  </done>
</task>

<task type="auto">
  <name>Task 3: Enriquecimento sale_items + engine comissão + UI upload catálogo</name>
  <files>
    src/app/api/admin/parse-upload/route.ts,
    src/app/api/admin/calcular-comissao/route.ts,
    src/app/dashboard/UploadModal.tsx
  </files>
  <action>
**A. Enriquecimento em `parse-upload/route.ts`:**

Após `parseUploadBuffer`, se transactions têm `product_code`, buscar costs de `products` para o period_id detectado:
```ts
// Se há product_codes e period foi detectado:
if (transactions.some(t => t.product_code) && detected?.period_id) {
  const { data: products } = await adminDb
    .from('products')
    .select('product_code, cost_price, margin_pct')
    .eq('tenant_id', profile.tenant_id)
    .eq('period_id', detected.period_id)

  const costMap = new Map(products?.map(p => [p.product_code, p]) ?? [])

  // Calcular total_profit por transaction e inserir em sale_items
  // NOTA: a inserção em sale_items é feita aqui, antes do upsert das sales_records
  const saleItems = transactions
    .filter(t => t.product_code && t.order_ref)
    .map(t => {
      const prod = costMap.get(t.product_code!)
      const total_price = t.valor
      const unit_cost = prod?.cost_price ?? t.unit_cost ?? null
      const total_profit = prod
        ? (prod.margin_pct
            ? total_price * prod.margin_pct
            : unit_cost !== null ? (t.unit_price! - unit_cost) * t.quantity : null)
        : (t.margin_pct ? total_price * t.margin_pct : null)

      return {
        tenant_id: profile.tenant_id,
        period_id: detected.period_id,
        vendor_id: t.vendor_id,
        order_id: t.order_ref,
        product_code: t.product_code!,
        qty: t.quantity,
        unit_price: t.unit_price ?? t.valor,
        total_price,
        unit_cost,
        total_profit,
      }
    })
    .filter(i => i.total_price > 0)

  if (saleItems.length) {
    await adminDb
      .from('sale_items')
      .upsert(saleItems, { onConflict: 'tenant_id,period_id,order_id,product_code' })
      // NOTA: adicionar UNIQUE constraint em (tenant_id, period_id, order_id, product_code) na migration se não existir
  }
}
```

Se `vendor_summary` for tabela (não view), atualizar `total_profit` após o upsert:
```sql
UPDATE vendor_summary vs
SET total_profit = (
  SELECT COALESCE(SUM(total_profit), 0)
  FROM sale_items si
  WHERE si.tenant_id = vs.tenant_id
    AND si.period_id = vs.period_id
    AND si.vendor_id = vs.vendor_id
)
WHERE vs.period_id = :detected_period_id AND vs.tenant_id = :tenant_id
```
Executar via `adminDb.rpc('update_vendor_profit', {...})` ou `adminDb.from('vendor_summary').update(...)` por vendor_id em loop.

**B. Engine de comissão em `calcular-comissao/route.ts`:**

Substituir o trecho de cálculo:
```ts
// ANTES:
const totalSoldCents = Math.round(Number(s.total_sold) * 100)
const commissionPct = Number(s.commission_pct)
const comissaoBaseCents = Math.round(totalSoldCents * commissionPct)

// DEPOIS (per design decision — commission_type):
const commissionType = s.commission_type ?? 'revenue'  // VendorSummary vem de JOIN com goals
const baseValue = commissionType === 'profit'
  ? Number(s.total_profit ?? 0)
  : Number(s.total_sold)
const baseCents = Math.round(baseValue * 100)
const commissionPct = Number(s.commission_pct)
const comissaoBaseCents = Math.round(baseCents * commissionPct)
```

Adicionar `commission_type` e `total_profit` ao SELECT de vendor_summary no início da função.
Adicionar ao `detalhamento` do JSON:
```ts
commission_type: commissionType,
total_profit: Math.round(Number(s.total_profit ?? 0) * 100) / 100,
base_value: Math.round(baseValue * 100) / 100,
```

**C. UI — UploadModal.tsx:**

Adicionar botão/tab "Catálogo de Produtos" na interface existente de upload. Ao selecionar o arquivo de catálogo:
1. Campo adicional: `period_id` (usar o período ativo passado via prop ou seletor local)
2. POST para `/api/admin/upload-catalog` com FormData { file, period_id }
3. Exibir resultado: "X produtos importados para o período Y"

Manter interface atual de upload de vendas inalterada — apenas adicionar uma segunda seção/aba no modal.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
Build passa. Upload de catálogo importa produtos em `products`. Parse de vendas cria entradas em `sale_items` com total_profit quando catálogo está disponível. calcular-comissao usa total_profit quando commission_type='profit'. UploadModal tem UI para catálogo.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→/api/admin/upload-catalog | Arquivo de catálogo não-autenticado poderia injetar custos falsos |
| sale_items.total_profit | Valor calculado server-side a partir de dados do catálogo — não aceito do cliente |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-jnc-01 | Tampering | products upsert | mitigate | Auth check role adm/gerente/super_admin antes de qualquer escrita; tenant_id sempre do JWT, nunca do body |
| T-jnc-02 | Tampering | total_profit calculado | mitigate | Cálculo feito server-side com dados de `products` do banco; cliente só envia o arquivo |
| T-jnc-03 | Elevation | upload-catalog sem RLS direto | mitigate | Usa adminClient com tenant_id do profile autenticado; RLS em products filtra leitura |
| T-jnc-04 | DoS | arquivo catálogo grande | mitigate | Reutilizar limite 10MB de parse-upload; validar antes de processar |
</threat_model>

<verification>
1. `npm run build` passa sem erros TypeScript
2. Supabase: tabelas products e sale_items existem com RLS habilitado
3. goals existentes têm commission_type = 'revenue' (default aplicado)
4. POST /api/admin/upload-catalog com arquivo XLSX de catálogo retorna { imported: N }
5. Parse de venda HTML cria registros em sale_items
6. POST /api/admin/calcular-comissao com period que tem commission_type='profit' usa total_profit como base
</verification>

<success_criteria>
- Migration aplicada sem quebrar dados existentes
- Upload de catálogo de produtos funcional (HTML e XLSX)
- sale_items populado após upload de vendas quando product_code disponível
- Engine de comissão ciente de commission_type com cálculo correto para ambos os modos
- Build TypeScript passa sem erros
</success_criteria>

<output>
Após conclusão, criar `.planning/quick/260626-jnc-implementar-suporte-a-comiss-o-sobre-luc/260626-jnc-SUMMARY.md`
</output>
