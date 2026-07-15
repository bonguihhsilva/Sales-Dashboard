# Phase 07: API pública de ingest — Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Plataformas de venda externas **empurram** dados para o dashboard via HTTP: `POST /api/v1/sales` (vendas com itens) e `POST /api/v1/stock` (snapshots de estoque), autenticadas por API key por tenant. Inclui schema/gestão de `api_keys`, middleware de autenticação por key, os dois endpoints de ingest e a UI de gestão de keys no painel super-admin.

É o inverso do conector pull da Fase 06 (que já registrou "webhooks/push" como ideia deferida). Não substitui upload manual (CEC HTML) nem conectores pull — é um terceiro canal de entrada.

**Fora do escopo:** endpoints de leitura (GET), cálculo de métricas de estoque (Fase 08), telas de compras (Fase 09), self-service de keys pelo tenant.

</domain>

<decisions>
## Implementation Decisions

### Autenticação e keys
- **D-01:** Key formato `gds_live_<random>`, exibida UMA única vez na criação. Banco armazena somente hash SHA-256 + prefixo público para lookup. Nunca a key crua.
- **D-02:** Keys são **full-access por tenant** (sem escopos no MVP). Schema deve incluir coluna `scopes` default `['*']` para extensão futura sem migration.
- **D-03:** Somente **super_admin** cria e revoga keys. Self-service pelo adm do tenant fica para fase futura.
- **D-04:** Sem expiração automática — revogação manual. `last_used_at` registrado e visível no painel.

### Payload de vendas (`POST /api/v1/sales`)
- **D-05:** Granularidade: **venda com line items** (produto, qtd, preço; custo vem do catálogo). Itens são opcionais — venda só com total do pedido também é aceita.
- **D-06:** **Batch**: endpoint aceita array de vendas, limite ~500 por request.
- **D-07:** Idempotência via **`order_id` como chave natural** — upsert por `tenant_id + order_id`; reenvio atualiza em vez de duplicar (UNIQUE constraint já existe em `sale_items`).
- **D-08:** Período resolvido pela **`sale_date` do payload** — servidor encontra (ou cria automaticamente) o period do mês correspondente. Integrador não conhece o conceito de período.

### Payload de estoque (`POST /api/v1/stock`)
- **D-09:** Modelo: **snapshot de posição** (produto + quantidade atual), não movimentações.
- **D-10:** Nível: **agregado por tenant** — sem granularidade de loja no MVP (granularidade por loja anotada como ideia deferida).
- **D-11:** Frequência: **1 snapshot por dia por produto** — upsert no mesmo dia (último POST do dia vence). Histórico diário retido integralmente (série alimenta DoS/WoS na Fase 08).
- **D-12:** **Sem custo no payload** — custo unitário vem exclusivamente do catálogo de produtos (`products.cost_price` / rota `upload-catalog` existente).

### Erros, respostas e comportamento
- **D-13:** **Validação parcial** em batch: itens válidos são gravados; resposta reporta `accepted`/`rejected` com motivo por item rejeitado.
- **D-14:** **Envelope consistente** em todas as respostas: `{ success, data, error }` + contadores (`accepted`, `rejected`, `errors[]`).
- **D-15:** Vendedor/produto desconhecido: **aceitar com namespace** — ID prefixado registrado em `connector_id_mappings` (consistente com D-08/D-09 da Fase 06; estender `source_system` para aceitar `'api'`). Dado nunca se perde; mapeamento manual depois.

### UI de gestão de keys
- **D-16:** Seção no painel **super-admin** (`/dashboard/super-admin`): criar key (exibida uma vez com aviso), revogar, ver `last_used_at` e tenant associado.

### Claude's Discretion
- Schema exato da tabela `api_keys` (colunas além de: tenant_id, key_hash, key_prefix, scopes, last_used_at, revoked_at)
- Rate limit específico para rotas `/api/v1/*` (reusar `makeLimiter` de `src/lib/ratelimit.ts`; calibrar limites)
- Estrutura exata do payload JSON (nomes de campos, validação Zod ou manual)
- Como resolver/criar period automaticamente a partir de sale_date (reusar lógica de `ensure-period` se aplicável)
- Versionamento: prefixo `/api/v1/` fixo; estratégia de v2 não precisa ser projetada agora

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Infra existente a reusar
- `src/lib/ratelimit.ts` — rate limiter Postgres-backed (`makeLimiter`, `check_rate_limit` RPC) — aplicar nas rotas `/api/v1/*`
- `supabase/migrations/20260617000001_connectors.sql` — tabelas `connectors` e `connector_id_mappings` (estender `source_system` CHECK para incluir `'api'`)
- `supabase/migrations/20260626171308_profit_commission.sql` — schema de `products` e `sale_items` (destino dos line items; UNIQUE de idempotência)
- `src/lib/connectors/base.ts` — interface de conector da Fase 06 (padrão de normalização de dados)

### Padrões do projeto
- `src/app/api/admin/parse-upload/route.ts` — padrão de rota API com auth + rate limit + validação
- `src/app/api/admin/ensure-period/route.ts` — lógica existente de criação de período (candidata a reuso em D-08)
- `src/app/api/admin/upload-catalog/route.ts` — ingestão de catálogo de produtos (fonte de custo, D-12)
- `.planning/phases/06-formatos-de-upload-download-e-conectores-de-sistemas-de-vend/06-CONTEXT.md` — decisões D-01..D-13 da Fase 06 (Vault, prefixo de sistema, id mappings)

### Projeto
- `.planning/ROADMAP.md` — Fases 07/08/09 (dependência: 08 consome snapshots desta fase)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `makeLimiter()` / `check_rate_limit` RPC: rate limiting serverless-safe pronto — só criar limiter com política própria para API pública
- `connector_id_mappings`: tabela pronta para mapear IDs externos → canônicos (D-15)
- `sale_items` com `UNIQUE(tenant_id, period_id, order_id, product_code)`: idempotência por constraint já garantida
- `createAdminClient()`: client service-role para writes do endpoint (com `.eq('tenant_id')` obrigatório)
- `sanitizeString()`: sanitização de texto antes de insert — aplicar em todos os campos string do payload

### Established Patterns
- Auth em rotas: rotas atuais usam `getTenantContext()` (sessão) — API pública introduz padrão novo (key → tenant_id); middleware de key deve produzir contexto equivalente
- Multi-tenant: `tenant_id` obrigatório em toda tabela e todo write
- RLS em todas as tabelas — `api_keys` incluída
- Envelope `{ success, data, error }` nas rotas admin existentes

### Integration Points
- Novo grupo de rotas: `src/app/api/v1/{sales,stock}/route.ts` — fora do middleware de sessão Supabase (verificar matcher em `src/middleware.ts` para não redirecionar `/api/v1/*` a login)
- Nova tabela `api_keys` + migration
- Nova tabela de snapshots de estoque (schema mínimo nesta fase; métricas na Fase 08)
- Painel super-admin: nova seção de keys

</code_context>

<specifics>
## Specific Ideas

- Visão SaaS: API é o caminho para outras lojas de CDE conectarem seus sistemas sem conector dedicado
- Estoque ingerido aqui é o insumo direto das métricas DoS/WoS/giro/quebra da Fase 08 e das telas de compras da Fase 09

</specifics>

<deferred>
## Deferred Ideas

- **Escopos por key** (`write:sales`, `write:stock`, `read:*`) — coluna `scopes` já prevista; ativação futura
- **Self-service de keys pelo adm do tenant** — quando o produto virar SaaS aberto
- **Estoque por loja** (store no payload de stock) — MVP é agregado por tenant; granularidade por loja quando houver demanda
- **Custo unitário no payload de estoque** — decidido catálogo-only; revisitar se catálogo ficar defasado
- **Endpoints GET (leitura de resumos via API)** — fase própria se integradores pedirem
- **Expiração/rotação automática de keys** — revogação manual basta no MVP

</deferred>

---

*Phase: 07-api-p-blica-de-ingest*
*Context gathered: 2026-07-14*
