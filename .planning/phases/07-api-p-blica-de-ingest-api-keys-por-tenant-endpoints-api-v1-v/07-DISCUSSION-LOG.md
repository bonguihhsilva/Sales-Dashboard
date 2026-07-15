# Phase 07: API pública de ingest - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-14
**Phase:** 07-api-publica-de-ingest
**Areas discussed:** Autenticação e escopos das keys, Contrato do payload de vendas, Contrato do payload de estoque, Erros/respostas e gestão de keys na UI

---

## Autenticação e escopos das keys

| Option | Description | Selected |
|--------|-------------|----------|
| Hash SHA-256 no banco | Key exibida uma vez; banco guarda hash + prefixo | ✓ |
| Supabase Vault | Key criptografada, reexibível | |

| Option | Description | Selected |
|--------|-------------|----------|
| Escopos por key | write:sales / write:stock configuráveis | |
| Key full-access por tenant | Sem escopos no MVP, coluna scopes p/ futuro | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| adm do tenant | Self-service no painel | |
| Só super_admin | Controle centralizado | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Sem expiração + revogação manual | last_used_at visível | ✓ |
| Expiração configurável | Default 90 dias | |

---

## Contrato do payload de vendas

| Option | Description | Selected |
|--------|-------------|----------|
| Venda com itens de produto | Order + line items; itens opcionais | ✓ |
| Venda agregada por vendedor | Só totais | |

| Option | Description | Selected |
|--------|-------------|----------|
| Batch — array de vendas | Limite ~500/request | ✓ |
| Individual por request | Uma venda por POST | |

| Option | Description | Selected |
|--------|-------------|----------|
| order_id como chave natural | Upsert tenant+order_id | ✓ |
| Header Idempotency-Key | Dedupe por request UUID | |

| Option | Description | Selected |
|--------|-------------|----------|
| Resolver período pela sale_date | Servidor resolve/cria period | ✓ |
| Cliente informa period_id | Expõe conceito interno | |

---

## Contrato do payload de estoque

| Option | Description | Selected |
|--------|-------------|----------|
| Snapshot de posição | Posição atual datada | ✓ |
| Movimentações | Entradas/saídas | |

| Option | Description | Selected |
|--------|-------------|----------|
| Por loja | Payload com store | |
| Por tenant (agregado) | Quantidade total por produto | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| 1 por dia por produto | Upsert no dia; histórico retido | ✓ |
| Livre com timestamp | Todo POST gera registro | |

| Option | Description | Selected |
|--------|-------------|----------|
| unit_cost opcional no payload | Fonte mais fresca vence | |
| Custo só via catálogo | products.cost_price | ✓ |

---

## Erros, respostas e gestão de keys na UI

| Option | Description | Selected |
|--------|-------------|----------|
| Validação parcial | accepted/rejected por item | ✓ |
| All-or-nothing | 400 se qualquer item inválido | |

| Option | Description | Selected |
|--------|-------------|----------|
| Envelope consistente | { success, data, error } + contadores | ✓ |
| REST puro por status code | Corpo varia por endpoint | |

| Option | Description | Selected |
|--------|-------------|----------|
| Aceitar com namespace | Prefixo + connector_id_mappings | ✓ |
| Rejeitar linha | Só IDs cadastrados | |

| Option | Description | Selected |
|--------|-------------|----------|
| Painel super-admin completo | Criar/revogar/last_used | ✓ |
| Sem UI nesta fase | Keys via SQL manual | |

## Claude's Discretion

- Schema exato de `api_keys`; rate limit das rotas `/api/v1/*`; estrutura exata do payload JSON; reuso de `ensure-period`; estratégia de versionamento futuro

## Deferred Ideas

- Escopos por key; self-service pelo adm; estoque por loja; custo no payload de estoque; endpoints GET; expiração automática de keys
