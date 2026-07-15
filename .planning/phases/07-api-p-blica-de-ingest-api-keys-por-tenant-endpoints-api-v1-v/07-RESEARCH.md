# Phase 7: API pública de ingest — Research

**Researched:** 2026-07-14
**Domain:** API key authentication (public ingest API) + Next.js 15 App Router Route Handlers + multi-tenant Postgres/Supabase
**Confidence:** HIGH (arquitetura e padrões verificados no próprio código do projeto) / MEDIUM (práticas de hashing de key validadas via fontes externas)

## Summary

Esta fase adiciona um terceiro canal de entrada de dados (além do upload manual e dos conectores pull da Fase 06): uma API HTTP pública (`POST /api/v1/sales`, `POST /api/v1/stock`) autenticada por API key por tenant, gerida por super_admin. O desafio técnico central não é a lógica de negócio (que já existe em grande parte — `sale_items`, upsert, catálogo de custo) mas a **introdução de um modelo de autenticação novo**: hoje toda rota do projeto assume uma sessão Supabase (cookie) resolvida por `getTenantContext()`/middleware; a API pública precisa resolver `tenant_id` a partir de um header `Authorization` sem sessão, e o `src/middleware.ts` atual **redireciona qualquer requisição sem sessão para `/login`** — isso vai quebrar a API pública se `/api/v1` não for adicionado a `PUBLIC_PREFIXES` explicitamente.

O projeto já tem quase toda a infraestrutura de suporte pronta e madura: rate limiter Postgres-backed (`makeLimiter`/`check_rate_limit`), padrão de resposta de rota (`NextResponse.json`), `createAdminClient()` (service-role, bypassa RLS), `connector_id_mappings` para IDs externos desconhecidos, e `sale_items` com `UNIQUE(tenant_id, period_id, order_id, product_code)` que já implementa idempotência via upsert. O trabalho novo real é: (1) tabela `api_keys` + hashing SHA-256 + verificação por prefixo, (2) middleware/helper de autenticação por key equivalente a `getTenantContext()`, (3) tabela de snapshot de estoque (nova), (4) validação Zod dos payloads batch com resposta parcial (accepted/rejected), (5) resolução automática de period a partir de `sale_date`, e (6) UI de gestão de keys no super-admin.

**Primary recommendation:** Reusar ao máximo os padrões existentes (rate limiter, `createAdminClient`, envelope de resposta, upsert com `onConflict`) e tratar a autenticação por API key como uma função `getApiKeyContext(req)` paralela a `getTenantContext()`, chamada explicitamente em cada rota `/api/v1/*` — não depender do middleware de sessão para proteger essas rotas, apenas para deixá-las passar (`PUBLIC_PREFIXES`).

## User Constraints

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Autenticação e keys**
- D-01: Key formato `gds_live_<random>`, exibida UMA única vez na criação. Banco armazena somente hash SHA-256 + prefixo público para lookup. Nunca a key crua.
- D-02: Keys são **full-access por tenant** (sem escopos no MVP). Schema deve incluir coluna `scopes` default `['*']` para extensão futura sem migration.
- D-03: Somente **super_admin** cria e revoga keys. Self-service pelo adm do tenant fica para fase futura.
- D-04: Sem expiração automática — revogação manual. `last_used_at` registrado e visível no painel.

**Payload de vendas (`POST /api/v1/sales`)**
- D-05: Granularidade: **venda com line items** (produto, qtd, preço; custo vem do catálogo). Itens são opcionais — venda só com total do pedido também é aceita.
- D-06: **Batch**: endpoint aceita array de vendas, limite ~500 por request.
- D-07: Idempotência via **`order_id` como chave natural** — upsert por `tenant_id + order_id`; reenvio atualiza em vez de duplicar (UNIQUE constraint já existe em `sale_items`).
- D-08: Período resolvido pela **`sale_date` do payload** — servidor encontra (ou cria automaticamente) o period do mês correspondente. Integrador não conhece o conceito de período.

**Payload de estoque (`POST /api/v1/stock`)**
- D-09: Modelo: **snapshot de posição** (produto + quantidade atual), não movimentações.
- D-10: Nível: **agregado por tenant** — sem granularidade de loja no MVP (granularidade por loja anotada como ideia deferida).
- D-11: Frequência: **1 snapshot por dia por produto** — upsert no mesmo dia (último POST do dia vence). Histórico diário retido integralmente (série alimenta DoS/WoS na Fase 08).
- D-12: **Sem custo no payload** — custo unitário vem exclusivamente do catálogo de produtos (`products.cost_price` / rota `upload-catalog` existente).

**Erros, respostas e comportamento**
- D-13: **Validação parcial** em batch: itens válidos são gravados; resposta reporta `accepted`/`rejected` com motivo por item rejeitado.
- D-14: **Envelope consistente** em todas as respostas: `{ success, data, error }` + contadores (`accepted`, `rejected`, `errors[]`).
- D-15: Vendedor/produto desconhecido: **aceitar com namespace** — ID prefixado registrado em `connector_id_mappings` (consistente com D-08/D-09 da Fase 06; estender `source_system` para aceitar `'api'`). Dado nunca se perde; mapeamento manual depois.

**UI de gestão de keys**
- D-16: Seção no painel **super-admin** (`/dashboard/super-admin`): criar key (exibida uma vez com aviso), revogar, ver `last_used_at` e tenant associado.

### Claude's Discretion
- Schema exato da tabela `api_keys` (colunas além de: tenant_id, key_hash, key_prefix, scopes, last_used_at, revoked_at)
- Rate limit específico para rotas `/api/v1/*` (reusar `makeLimiter` de `src/lib/ratelimit.ts`; calibrar limites)
- Estrutura exata do payload JSON (nomes de campos, validação Zod ou manual)
- Como resolver/criar period automaticamente a partir de sale_date (reusar lógica de `ensure-period` se aplicável)
- Versionamento: prefixo `/api/v1/` fixo; estratégia de v2 não precisa ser projetada agora

### Deferred Ideas (OUT OF SCOPE)
- Escopos por key (`write:sales`, `write:stock`, `read:*`) — coluna `scopes` já prevista; ativação futura
- Self-service de keys pelo adm do tenant — quando o produto virar SaaS aberto
- Estoque por loja (store no payload de stock) — MVP é agregado por tenant; granularidade por loja quando houver demanda
- Custo unitário no payload de estoque — decidido catálogo-only; revisitar se catálogo ficar defasado
- Endpoints GET (leitura de resumos via API) — fase própria se integradores pedirem
- Expiração/rotação automática de keys — revogação manual basta no MVP
</user_constraints>

## Project Constraints (from CLAUDE.md)

- Stack fixa: Next.js 15.2.4+ (projeto está em 15.5.18), React 19, TypeScript strict, Supabase — não alterar sem aprovação
- Banco Supabase `zsczxblhtdhpdqvkpuwz` — toda mudança de schema via migration (`supabase/migrations/*.sql`), nunca `execute_sql`/`apply_migration` direto (falham frequentemente neste projeto)
- Moeda configurável por tenant (USD/BRL/PYG) — nunca hardcodar símbolo/formato
- RLS ativo em TODAS as tabelas, incluindo `api_keys` e a nova tabela de snapshots de estoque — nunca desabilitar
- Multi-tenant obrigatório — `tenant_id` em toda tabela nova e todo write
- `npm run build` deve passar antes de qualquer commit de fase
- Nunca commitar credenciais reais (keys de exemplo em docs devem usar placeholder, ex: `gds_live_<hidden>`)
- Banco compartilhado com PetHub no mesmo projeto Supabase — cuidado ao nomear objetos globais (funções, triggers) para não colidir

<phase_requirements>
## Phase Requirements

Nenhum ID de requirement formal foi mapeado ainda para esta fase (ROADMAP.md lista "Requirements: TBD"). O escopo funcional é definido inteiramente pelas decisões D-01 a D-16 acima, extraídas de `07-CONTEXT.md`. O planner deve tratar D-01..D-16 como os requirements desta fase.
</phase_requirements>

## Standard Stack

### Core (já no projeto — reusar, não adicionar)
| Lib/Módulo | Versão | Propósito | Por que usar |
|---|---|---|---|
| `node:crypto` (built-in) | Node runtime do Next.js | `createHash('sha256')`, `randomBytes`, `timingSafeEqual` | Nativo, sem dependência nova; Route Handlers rodam em Node runtime por padrão (não Edge) — `crypto` completo disponível |
| `zod` | 4.4.3 (instalado, ainda não usado no código) [VERIFIED: npm view zod version + package.json] | Validação de payload dos endpoints `/api/v1/*` | Já é dependência do projeto (via `@hookform/resolvers`), mas nenhuma rota API usa Zod hoje — esta fase seria a primeira a validar payload de rede com schema declarativo. Alinha com `rules/typescript/coding-style.md` (Zod para validação de entrada) |
| `@supabase/supabase-js` | 2.47.0 [VERIFIED: package.json] | `createAdminClient()` para todos os writes do endpoint (service role, bypassa RLS) | Padrão já estabelecido em `parse-upload`, `upload-catalog`, `ensure-period` |
| Postgres rate limiter (`check_rate_limit` RPC) | já em produção via migration `20260601000018` | Rate limit por IP/key nas rotas `/api/v1/*` | Serverless-safe (funciona em Vercel, sem estado em memória); fail-open documentado |

### Supporting
| Lib | Propósito | Quando usar |
|---|---|---|
| `sale_items` (tabela existente) | Destino dos line items de vendas | Reusar diretamente — já tem `UNIQUE(tenant_id, period_id, order_id, product_code)` que implementa D-07 |
| `connector_id_mappings` (tabela existente, Fase 06) | Registrar vendor_id/product_code desconhecidos com namespace | Estender `source_system` CHECK para incluir `'api'` (migration ALTER) |
| `products` (tabela existente) | Fonte de `cost_price` para enriquecer sale_items e resolver custo do estoque | Já usado em `parse-upload/route.ts` como referência de padrão de lookup |

### Alternativas consideradas
| Ao invés de | Poderia usar | Tradeoff |
|---|---|---|
| SHA-256 simples para hash de key | bcrypt/argon2 (hash lento) | Hashes lentos são para senhas de baixa entropia (usuário escolhe). API keys geradas por `crypto.randomBytes` têm entropia alta — SHA-256 simples + comparação constant-time é o padrão da indústria (Stripe, GitHub) e não penaliza throughput de validação [MEDIUM confidence — WebSearch, consistente com D-01 já decidido pelo usuário] |
| Postgres rate limiter (existente) | `@upstash/ratelimit` (já está no `package.json` mas não é usado) | Upstash está instalado mas o projeto migrou para rate limiter Postgres-backed (ver comentário em `ratelimit.ts`: "substitui bypass silencioso quando sem Upstash"). Não reintroduzir Upstash — manter consistência com o padrão atual |
| Validação manual (`if/else`) | Zod schemas | Zod já está instalado; payload de batch com validação parcial por item (D-13) fica mais legível com `z.array(itemSchema).safeParse` item a item do que validação manual repetida |

**Instalação:** nenhuma dependência nova é necessária — `zod`, `@supabase/supabase-js` já estão no `package.json`.

**Verificação de versão:**
```
npm view zod version                  → 4.4.3 (confere com package.json)
npm view @upstash/ratelimit version   → 2.0.8 (instalado mas não usado no projeto — não usar nesta fase)
```

## Architecture Patterns

### Estrutura de arquivos recomendada
```
src/
├── app/
│   └── api/
│       └── v1/
│           ├── sales/
│           │   └── route.ts        # POST — batch de vendas com line items
│           └── stock/
│               └── route.ts        # POST — snapshot diário de estoque
├── lib/
│   ├── auth/
│   │   ├── tenant.ts                # getTenantContext() — existente, sessão
│   │   └── apiKey.ts                 # NOVO: getApiKeyContext(req) — key → tenant_id
│   ├── ratelimit.ts                  # existente — adicionar limiter dedicado p/ /api/v1
│   └── validation/
│       └── ingest.ts                 # NOVO: schemas Zod de sales/stock payload
supabase/
└── migrations/
    └── 2026XXXXXXXXXX_api_keys_and_stock_snapshots.sql
```

### Pattern 1: Autenticação por API key (paralelo a `getTenantContext`)

**O quê:** Um helper que extrai `Authorization: Bearer gds_live_...` (ou header customizado), calcula o hash SHA-256, busca por `key_prefix` (índice curto) e depois compara o hash completo com `timingSafeEqual`, retornando `{ tenant_id, api_key_id, scopes }` ou `null`.

**Quando usar:** No topo de cada handler `/api/v1/*`, substituindo `getTenantContext()`.

**Exemplo (padrão a implementar, baseado em prática documentada para APIs públicas — MEDIUM confidence):**
```typescript
// src/lib/auth/apiKey.ts
import { createHash, timingSafeEqual, randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const KEY_PREFIX = 'gds_live_'

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = KEY_PREFIX + randomBytes(24).toString('base64url')
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, KEY_PREFIX.length + 8) // prefixo público p/ exibição/lookup
  return { rawKey, keyHash, keyPrefix }
}

export async function getApiKeyContext(req: Request) {
  const authHeader = req.headers.get('authorization') ?? ''
  const rawKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) return null

  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const admin = createAdminClient()

  const { data: row } = await admin
    .from('api_keys')
    .select('id, tenant_id, key_hash, scopes, revoked_at')
    .eq('key_prefix', rawKey.slice(0, KEY_PREFIX.length + 8))
    .maybeSingle()

  if (!row || row.revoked_at) return null

  const stored = Buffer.from(row.key_hash, 'hex')
  const provided = Buffer.from(keyHash, 'hex')
  if (stored.length !== provided.length || !timingSafeEqual(stored, provided)) return null

  // Best-effort — não bloquear a resposta por causa disso
  admin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id).then(() => {})

  return { tenantId: row.tenant_id as string, apiKeyId: row.id as string, scopes: row.scopes as string[] }
}
```

**Anti-padrão a evitar:** comparar `keyHash === row.key_hash` com `===` de string — vulnerável a timing attack teórico. Usar `timingSafeEqual` sobre buffers de tamanho igual.

### Pattern 2: Middleware — deixar `/api/v1/*` passar sem sessão

**Descoberta crítica no código atual:** `src/middleware.ts` redireciona para `/login` qualquer requisição sem `user` da sessão Supabase, ANTES de checar `ROLE_RULES`. `/api/v1/sales` não está em `PUBLIC_PREFIXES` hoje — sem alteração, toda chamada de integrador externo (sem cookie) receberia `redirect` 307 para `/login`, quebrando a API por completo.

```typescript
// src/middleware.ts — adicionar:
const PUBLIC_PREFIXES = ['/login', '/convite', '/api/admin/accept-invite', '/landing', '/api/v1']
```

**Importante:** isso faz o middleware "deixar passar" a rota — a autenticação real continua sendo feita dentro do route handler via `getApiKeyContext()`. Isso é consistente com o padrão de defesa em profundidade recomendado para Route Handlers do Next.js App Router (ver Pitfall 1 abaixo sobre CVE-2025-29927).

### Pattern 3: Envelope de resposta consistente (D-14) — NOVO padrão para o projeto

**Descoberta:** as rotas `/api/admin/*` existentes (`parse-upload`, `upload-catalog`, `ensure-period`) **não** usam envelope `{success, data, error}` — retornam campos soltos (`{ error }`, `{ imported }`, `{ id, label, created }`). D-14 pede um envelope explícito para a API pública, o que é uma convenção NOVA introduzida por esta fase, não uma continuação do padrão admin existente. O planner deve tratar isso como uma decisão de design isolada da API pública, não propagar para as rotas admin.

```typescript
interface IngestResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  accepted: number
  rejected: number
  errors: Array<{ index: number; reason: string }>
}
```

### Pattern 4: Resolução automática de period a partir de `sale_date` (D-08)

Reusar a lógica de `src/app/api/admin/ensure-period/route.ts` (busca `periods` por `tenant_id + year + month`, cria se não existir, roda `calculate_vendor_goals`), mas extraída para uma função compartilhada chamável tanto pela rota admin quanto pelo endpoint público:

```typescript
// src/lib/periods/ensurePeriod.ts (extrair de ensure-period/route.ts)
export async function ensurePeriodForDate(admin: SupabaseClient, tenantId: string, saleDate: Date) {
  const year = saleDate.getFullYear()
  const month = saleDate.getMonth() + 1
  // ... mesma lógica de busca/criação de ensure-period/route.ts
}
```

**Cuidado:** criar um period automaticamente por request de batch pode gerar 500 chamadas RPC `calculate_vendor_goals` se não for cacheado por request — resolver o period UMA VEZ por batch (todas as vendas de um POST provavelmente caem no mesmo mês), não por item.

### Pattern 5: Validação parcial em batch (D-13) com Zod `safeParse` item a item

```typescript
const saleItemSchema = z.object({
  product_code: z.string().optional(),
  qty: z.number().positive().optional(),
  unit_price: z.number().nonnegative().optional(),
})

const saleSchema = z.object({
  order_id: z.string().min(1),
  vendor_id: z.string().min(1),
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total: z.number().nonnegative(),
  items: z.array(saleItemSchema).optional(),
})

const results = payload.sales.map((raw, index) => {
  const parsed = saleSchema.safeParse(raw)
  if (!parsed.success) return { index, ok: false, reason: parsed.error.issues[0]?.message }
  return { index, ok: true, data: parsed.data }
})

const accepted = results.filter(r => r.ok)
const rejected = results.filter(r => !r.ok)
```

### Anti-patterns a evitar
- **Confiar apenas no middleware para bloquear `/api/v1/*` sem key:** o middleware deve só permitir passagem; a validação de key é responsabilidade do route handler (defesa em profundidade — ver CVE-2025-29927 abaixo).
- **Resolver/criar period por item do batch:** resolver uma vez por request (ou agrupar por mês) para não multiplicar chamadas RPC.
- **Aplicar `sanitizeString()` (HTML-escape) em campos armazenados como texto puro:** ver Pitfall 3 — a função existente faz *HTML entity encoding*, não sanitização neutra; usá-la sem cuidado corrompe nomes de produto/vendor com `&`, `'`, etc.
- **Rejeitar o batch inteiro por um item inválido:** D-13 exige validação parcial — usar `safeParse` por item, nunca `parse` (que lança) no array inteiro.

## Don't Hand-Roll

| Problema | Não construa | Use em vez disso | Por quê |
|---|---|---|---|
| Rate limiting em rota serverless (Vercel) | Rate limiter em memória (`Map` global) | `makeLimiter()` de `src/lib/ratelimit.ts` (Postgres-backed via `check_rate_limit` RPC) | Instâncias serverless da Vercel não compartilham memória entre invocações — um limiter em `Map` não funciona em produção. O projeto já resolveu isso; reusar |
| Idempotência de upsert de vendas | Lógica de "buscar antes de inserir" manual | `UNIQUE(tenant_id, period_id, order_id, product_code)` + `.upsert(..., { onConflict: '...' })` | Constraint já existe em `sale_items` (migration `20260626171308`); condição de corrida é evitada pelo upsert atômico do Postgres, não por lógica de aplicação |
| Comparação de hash de API key | `hash1 === hash2` (string) | `crypto.timingSafeEqual(buffer1, buffer2)` | Comparação de string com `===` do V8 faz short-circuit no primeiro byte diferente — vaza informação de timing sobre quantos caracteres do hash acertaram (teórico, mas é o padrão da indústria evitar) |
| Geração de ID de key aleatório | `Math.random()` | `crypto.randomBytes()` | `Math.random()` não é criptograficamente seguro — previsível o suficiente para ataques de força bruta reduzida em contextos de alta exposição |

**Key insight:** a maior parte da complexidade "nova" desta fase é **orquestração** (autenticação por key, resolução de period, validação parcial em batch) — não é criação de infraestrutura nova. O projeto já tem 90% das peças (rate limiter, upsert idempotente, admin client, id mapping de entidades desconhecidas). O risco real está em integrar essas peças corretamente, não em inventar algoritmos.

## Common Pitfalls

### Pitfall 1: Middleware bloqueia a API pública silenciosamente
**O que dá errado:** Toda chamada de integrador externo (sem cookie de sessão Supabase) recebe redirect 307 para `/login` em vez de uma resposta JSON — quebrando totalmente a integração e sendo confuso de debugar (curl vai seguir o redirect ou retornar 307 com Location header, não um JSON de erro claro).
**Por que acontece:** `src/middleware.ts` roda em TODAS as rotas não-estáticas e checa `user` antes de checar prefixos de rota; `/api/v1` não está em `PUBLIC_PREFIXES`.
**Como evitar:** Adicionar `/api/v1` a `PUBLIC_PREFIXES` no `middleware.ts`. Validar com um teste manual: `curl -i https://.../api/v1/sales` sem header de auth deve retornar `401 {"error": "..."}` JSON, não `307` para `/login`.
**Sinais de alerta:** Se testes de integração (Wave 0) fizerem fetch para `/api/v1/sales` e receberem redirect ao invés de 401, é este bug.

### Pitfall 2: CVE-2025-29927 — não confiar só no middleware para autorização
**O que dá errado:** Uma vulnerabilidade conhecida (corrigida em 14.2.25/15.2.3) permitia bypass de checagens feitas exclusivamente no middleware via manipulação de header interno do Next.js.
**Por que acontece:** Arquiteturas que colocam TODA a lógica de autorização no middleware e nada no route handler ficam vulneráveis a esse tipo de bypass.
**Como evitar:** O projeto já está em Next.js 15.5.18 (patched). Mesmo assim, a prática recomendada é reforçar: o middleware só deve *permitir passagem*; `getApiKeyContext()` dentro do próprio route handler é a fonte de verdade de autenticação. Isso já é o padrão de design proposto acima — não depender do middleware para proteger `/api/v1/*`, e sim para desativar a proteção de sessão que não se aplica a ela. [CITED via WebSearch — GitHub Discussion vercel/next.js #93477, WorkOS 2026 auth guide]
**Sinais de alerta:** Nenhuma checagem de tenant/key dentro do próprio `route.ts` — se toda a segurança depende do middleware, é um sinal de arquitetura frágil.

### Pitfall 3: `sanitizeString()` existente faz HTML-encode, não sanitização neutra
**O que dá errado:** A função `sanitizeString()` em `src/lib/sanitize.ts` substitui `&`, `<`, `>`, `"`, `'`, `/` por entidades HTML (`&amp;`, `&lt;`, etc). Se aplicada ingenuamente a `vendor_name`, `product_code` ou outros campos de texto do payload de ingest antes de gravar no banco, os dados ficam HTML-encoded permanentemente no banco (ex: nome "D'Angelo" vira "D&#x27;Angelo" armazenado).
**Por que acontece:** A função foi desenhada para uso em contexto de output HTML (ex: `update-user`), não para sanitização de dados de entrada armazenados.
**Como evitar:** Para o payload da API pública, usar apenas *validação de tipo/formato* (Zod: `z.string().max(N)`) e, se necessário, uma sanitização mais neutra (trim, remoção de caracteres de controle) — não reusar `sanitizeString()` cegamente só porque "é o padrão do projeto". Se character encoding for necessário na exibição, fazer no client/view layer, não na gravação.
**Sinais de alerta:** Nomes de produto ou vendedor aparecendo com `&amp;` ou `&#x27;` no dashboard depois de ingestão via API.

### Pitfall 4: Resolver period por item, não por batch
**O que dá errado:** Um batch de 500 vendas do mesmo mês dispara até 500 chamadas a `ensure-period` (incluindo RPC `calculate_vendor_goals`), criando lentidão e possível race condition ao criar o mesmo period 500 vezes em paralelo (mitigado pelo `UNIQUE(tenant_id, year, month)`, mas ainda desperdiça round-trips).
**Por que acontece:** É natural implementar "para cada venda: resolve period" copiando a lógica de `ensure-period` sem agrupar.
**Como evitar:** Agrupar as vendas do payload por `(year, month)` primeiro, resolver/criar o period uma vez por grupo, e só então processar os itens.
**Sinais de alerta:** Latência alta em batches grandes; múltiplos INSERTs conflitantes em `periods` no log do Postgres.

### Pitfall 5: Rate limit único demais ou fail-open mal calibrado para tráfego de integração
**O que dá errado:** O rate limiter existente é fail-open (permite requisição se a RPC falhar) — adequado para rotas internas, mas para uma API pública de ingest, um ataque de volume durante uma falha de infraestrutura do rate limiter passa sem controle.
**Por que acontece:** Fail-open prioriza disponibilidade; é a escolha certa quando o rate limit é secundário, mas numa API pública de terceiros o cálculo de risco muda.
**Como evitar:** Manter fail-open (consistente com o resto do projeto — não introduzir inconsistência), mas calibrar o limite por tenant/key (não por IP, já que integradores podem estar atrás de IPs compartilhados/rotativos de cloud) e documentar a decisão. Sugestão de baseline: 60 req/min por `api_key_id` para escrita em batch (ajustável), maior do que o `strictRateLimiter` atual (5/min, pensado para rotas de sessão sensíveis como convite).
**Sinais de alerta:** Um único tenant conseguindo saturar `/api/v1/*` e degradar outros tenants (rate limit por IP compartilhado, não por key).

## Runtime State Inventory

Não aplicável — esta é uma fase greenfield (novas tabelas `api_keys` e snapshot de estoque; nenhuma rename/refactor/migração de dado existente). Nenhum dado, serviço externo, ou artefato de build precisa ser migrado.

## Code Examples

### Migration `api_keys` (schema, baseado em D-01/D-02/D-03/D-04)
```sql
-- Source: padrão observado em connectors.sql (Fase 06) + práticas de API key hashing (WebSearch, MEDIUM confidence)
CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',          -- rótulo livre p/ o super_admin identificar (ex: "ERP Loja Jebai")
  key_prefix    TEXT NOT NULL,                      -- primeiros chars da key crua, p/ lookup rápido + exibição parcial
  key_hash      TEXT NOT NULL,                      -- SHA-256 hex da key crua completa — nunca a key em si
  scopes        TEXT[] NOT NULL DEFAULT ARRAY['*'], -- D-02: full-access no MVP, extensível sem migration
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,                        -- NULL = ativa
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key_prefix)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Tenant não deve conseguir ler suas próprias keys via client-side (self-service é fase futura, D-03).
-- Apenas super_admin (via service-role no server component/action) gerencia — política nega tudo a authenticated/anon,
-- acesso real acontece via createAdminClient() nas server actions do painel.
CREATE POLICY api_keys_no_direct_access ON api_keys
  FOR ALL
  USING (false);
```

### Migration snapshot de estoque (D-09/D-10/D-11)
```sql
-- Snapshot diário agregado por tenant — upsert por dia (D-11)
CREATE TABLE IF NOT EXISTS stock_snapshots (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_code  TEXT NOT NULL,
  snapshot_date DATE NOT NULL,      -- dia do snapshot (não timestamp — D-11: 1/dia/produto)
  quantity      NUMERIC(12,2) NOT NULL,
  source        TEXT NOT NULL DEFAULT 'api',  -- rastreabilidade de origem
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, product_code, snapshot_date)
);

CREATE INDEX IF NOT EXISTS stock_snapshots_tenant_date
  ON stock_snapshots (tenant_id, snapshot_date);

ALTER TABLE stock_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON stock_snapshots
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
  ));
```

### Extensão de `connector_id_mappings` para `source_system = 'api'` (D-15)
```sql
ALTER TABLE connector_id_mappings DROP CONSTRAINT IF EXISTS connector_id_mappings_source_system_check;
ALTER TABLE connector_id_mappings
  ADD CONSTRAINT connector_id_mappings_source_system_check
  CHECK (source_system IN ('pegasus', 'isrp', 'cec', 'api'));
```

## State of the Art

| Abordagem antiga (não usar) | Abordagem atual | Quando mudou | Impacto |
|---|---|---|---|
| Rate limit em memória (`Map`/`lru-cache`) para serverless | Rate limit Postgres-backed (`check_rate_limit` RPC) | Já migrado neste projeto (comentário em `ratelimit.ts` confirma migração de Upstash) | Nova fase deve reusar o padrão existente, não reintroduzir Upstash (que está no `package.json` mas não é usado) |
| Autenticação só no middleware | Middleware permite passagem + autenticação real no route handler | Relevante desde CVE-2025-29927 (Next.js 14.2.25/15.2.3) | A API pública desta fase deve nascer já com autenticação no route handler, não delegar ao middleware |

**Deprecated/desatualizado:**
- `@upstash/ratelimit` no `package.json`: instalado mas não referenciado em `src/` — não usar nesta fase, mantém-se por legado ou uso futuro não relacionado.

## Assumptions Log

| # | Claim | Seção | Risco se errado |
|---|---|---|---|
| A1 | Baseline de rate limit sugerido (60 req/min por api_key_id) é um ponto de partida, não um valor validado pelo negócio | Pitfall 5 / Standard Stack | Se volume real de integração for maior, requests legítimos podem ser bloqueados — ajustar após primeiro integrador real |
| A2 | Formato de key `gds_live_<random>` com prefixo de 8 chars adicionais para lookup (`key_prefix`) é suficiente para evitar colisão | Code Examples (migration api_keys) | Prefixo curto demais poderia, em teoria, colidir entre tenants diferentes: mitigado por `UNIQUE(key_prefix)` — se colidir na geração, deve gerar novamente (retry loop) |
| A3 | `stock_snapshots` como nome de tabela nova (não especificado em CONTEXT.md, que menciona apenas "nova tabela de snapshots de estoque" sem nome) | Code Examples | Nome pode conflitar com convenção que a Fase 08 (métricas de estoque) espera — confirmar com o planner da Fase 08 antes de fixar o nome |
| A4 | Prática de hash SHA-256 simples (sem salt/pepper adicional) para API keys de alta entropia é aceitável — baseado em fontes de terceiros (Stripe/GitHub-style), não documentação oficial única | Standard Stack / Don't Hand-Roll | Já é decisão travada do usuário (D-01) — risco baixo, mas se auditoria de segurança formal for exigida depois, considerar pepper adicional via env var |

**Nenhuma outra claim além das acima carece de confirmação adicional** — o restante do documento é verificado diretamente no código do projeto.

## Open Questions

1. **Nome exato da tabela de snapshot de estoque**
   - O que sabemos: CONTEXT.md diz apenas "Nova tabela de snapshots de estoque (schema mínimo nesta fase; métricas na Fase 08)"
   - O que não está claro: se a Fase 08 já tem uma expectativa de nome/schema para consumir essa série temporal
   - Recomendação: o planner deve nomear como `stock_snapshots` (sugestão desta pesquisa) e documentar a decisão em STATE.md, já que a Fase 08 depende diretamente deste schema (ver `06-CONTEXT.md`/ROADMAP: "Fase 08 consome snapshots desta fase")

2. **Header de autenticação: `Authorization: Bearer` vs header customizado (`X-API-Key`)**
   - O que sabemos: D-01 fixa o formato da key (`gds_live_<random>`), mas não o header de transporte
   - O que não está claro: qual convenção o integrador (sistema de vendas externo do parceiro) vai esperar
   - Recomendação: usar `Authorization: Bearer gds_live_...` (padrão HTTP mais amplamente suportado por bibliotecas de cliente HTTP genéricas) — documentar claramente na resposta de erro 401 qual formato é esperado

3. **Limite de tamanho de payload/batch em bytes (Vercel)**
   - O que sabemos: D-06 fixa ~500 vendas por request; Vercel Route Handlers têm limite de body (4.5MB no plano padrão para Serverless Functions)
   - O que não está claro: se 500 vendas com line items completos podem se aproximar desse limite em payloads muito verbosos
   - Recomendação: validar tamanho do body recebido (similar ao `MAX_SIZE` de 10MB em `parse-upload`, mas ajustado — JSON de 500 vendas dificilmente passa de 1-2MB) e documentar o limite explicitamente na resposta de erro 413

## Environment Availability

Não aplicável — esta fase não introduz nenhuma dependência externa nova (nenhum novo serviço, CLI, runtime ou banco). Toda infraestrutura (Supabase, Next.js/Vercel, rate limiter Postgres) já está em produção e verificada no código.

## Validation Architecture

### Test Framework
| Propriedade | Valor |
|---|---|
| Framework | Vitest 4.1.9 [VERIFIED: package.json] |
| Config file | `C:/Projetos/da-silva-dashboard/vitest.config.ts` (environment: node, alias `@` → `src`) |
| Comando rápido | `npx vitest run src/__tests__/api-v1-*.test.ts` |
| Comando completo | `npm run test` (= `vitest run`) |

O projeto já tem testes unitários para lógica pura (`src/__tests__/connectors.test.ts`, `fingerprint.test.ts`, `commission-rules.test.ts`) mas **nenhum teste de integração de rota HTTP** (`route.ts`) até agora — Wave 0 desta fase provavelmente precisa estabelecer esse padrão pela primeira vez (mock de `createAdminClient`/Supabase, ou uso de `msw` já presente como dependência transitiva).

### Requisitos da fase → Mapa de testes
| Decisão | Comportamento | Tipo de teste | Comando | Arquivo existe? |
|---|---|---|---|---|
| D-01 | `generateApiKey()` produz key com prefixo correto, hash SHA-256 válido | unit | `vitest run src/lib/auth/apiKey.test.ts` | ❌ Wave 0 |
| D-01 | `getApiKeyContext()` rejeita key inválida/revogada com `timingSafeEqual` | unit (mock Supabase) | `vitest run src/lib/auth/apiKey.test.ts` | ❌ Wave 0 |
| D-07 | Reenvio do mesmo `order_id` atualiza em vez de duplicar `sale_items` | integration (precisa Supabase real ou mock de upsert) | `vitest run src/__tests__/api-v1-sales.test.ts` | ❌ Wave 0 |
| D-08 | Period é resolvido/criado automaticamente a partir de `sale_date` | unit (lógica extraída de `ensurePeriodForDate`) | `vitest run src/lib/periods/ensurePeriod.test.ts` | ❌ Wave 0 |
| D-11 | Segundo snapshot no mesmo dia sobrescreve o primeiro (upsert) | unit/integration | `vitest run src/__tests__/api-v1-stock.test.ts` | ❌ Wave 0 |
| D-13 | Batch com 1 item inválido retorna `accepted`/`rejected` parcial, não falha tudo | unit | `vitest run src/__tests__/api-v1-sales.test.ts` | ❌ Wave 0 |
| Pitfall 1 | `/api/v1/sales` sem auth retorna 401 JSON, não redirect | integration/manual | `curl -i` manual ou teste com `NextRequest` mockado | ❌ Wave 0 (manual aceitável se integração de middleware for difícil de testar em Vitest puro) |

### Sampling Rate
- **Por commit de task:** comando rápido (arquivo específico)
- **Por merge de wave:** `npm run test` completo
- **Gate de fase:** suite completa verde antes de `/gsd-verify-work`, mais `npm run build` (exigido por CLAUDE.md)

### Wave 0 Gaps
- [ ] `src/lib/auth/apiKey.test.ts` — cobre geração e verificação de key (D-01)
- [ ] `src/lib/periods/ensurePeriod.test.ts` — cobre resolução automática de period (D-08), após extrair lógica de `ensure-period/route.ts`
- [ ] `src/__tests__/api-v1-sales.test.ts` — cobre batch, idempotência, validação parcial (D-05, D-06, D-07, D-13)
- [ ] `src/__tests__/api-v1-stock.test.ts` — cobre upsert diário (D-11)
- [ ] Padrão de mock para `createAdminClient()`/Supabase em testes de rota — não existe ainda no projeto; decidir se usa `vi.mock('@/lib/supabase/admin')` com client fake em memória, ou testes de integração reais contra um projeto Supabase de teste

*(Nenhum framework precisa ser instalado — Vitest já cobre tudo; os gaps são apenas de arquivos de teste ainda não escritos.)*

## Security Domain

### Categorias ASVS aplicáveis

| Categoria ASVS | Aplica | Controle padrão |
|---|---|---|
| V2 Authentication | Sim | API key com hash SHA-256 + prefixo + `timingSafeEqual` (não senha/JWT, mas o princípio de "nunca comparar segredo com `==`" se aplica igualmente) |
| V3 Session Management | Não diretamente | API keys não são sessões — sem expiração automática (decisão consciente D-04), mas revogação manual deve invalidar imediatamente (checar `revoked_at` em toda request, sem cache) |
| V4 Access Control | Sim | `tenant_id` resolvido pela key nunca deve ser sobrescrito por valor do payload — todo write usa o `tenant_id` do contexto da key, ignorando qualquer `tenant_id` que venha no body |
| V5 Input Validation | Sim | Zod em todos os campos do payload; limite de batch (500) e de tamanho de body enforced antes de processar |
| V6 Cryptography | Sim | `crypto.createHash('sha256')` e `crypto.randomBytes()` nativos do Node — nunca implementar hash/RNG customizado |

### Padrões de ameaça conhecidos para esta stack

| Padrão | STRIDE | Mitigação padrão |
|---|---|---|
| Vazamento de key em log/erro | Information Disclosure | Nunca logar o `Authorization` header completo; logar apenas `key_prefix` em caso de erro |
| Reuso de key revogada (cache stale) | Elevation of Privilege | Sempre consultar `revoked_at` no banco a cada request — não cachear resultado de validação de key entre requests (ou, se cachear para performance futura, invalidar cache no momento da revogação) |
| Tenant confusion (payload tenta definir `tenant_id` próprio) | Tampering / Elevation of Privilege | `tenant_id` do write é SEMPRE derivado da key autenticada (`getApiKeyContext().tenantId`), nunca lido do body do request |
| Batch DoS (payload gigante ou aninhamento profundo) | Denial of Service | Limite de 500 itens (D-06) + limite de tamanho de body + rate limit por key |
| SQL injection via `product_code`/`vendor_id` livres | Tampering | `createAdminClient()` usa Supabase client (query builder parametrizado) — nunca concatenar string SQL manualmente para esses campos |

## Sources

### Primary (HIGH confidence — código do próprio projeto)
- `C:/Projetos/da-silva-dashboard/src/lib/ratelimit.ts` — rate limiter Postgres-backed
- `C:/Projetos/da-silva-dashboard/src/middleware.ts` — matcher e `PUBLIC_PREFIXES` atuais
- `C:/Projetos/da-silva-dashboard/src/app/api/admin/parse-upload/route.ts`, `upload-catalog/route.ts`, `ensure-period/route.ts` — padrões de rota admin
- `C:/Projetos/da-silva-dashboard/src/lib/auth/tenant.ts` — `getTenantContext()`
- `C:/Projetos/da-silva-dashboard/src/lib/connectors/base.ts`, `supabase/migrations/20260617000001_connectors.sql` — padrão de conector/namespace (Fase 06)
- `C:/Projetos/da-silva-dashboard/supabase/migrations/20260626171308_profit_commission.sql` — schema `products`/`sale_items`
- `C:/Projetos/da-silva-dashboard/supabase/migrations/20260601000018_postgres_rate_limiter.sql` — `check_rate_limit` RPC
- `C:/Projetos/da-silva-dashboard/src/lib/sanitize.ts` — comportamento real de `sanitizeString()`
- `npm view zod version`, `npm view @upstash/ratelimit version` — versões correntes verificadas via registry

### Secondary (MEDIUM confidence — WebSearch cross-referenciado)
- Práticas de hashing de API key (SHA-256 + prefixo + timing-safe compare): Zuplo "How to Implement API Key Authentication", OneUptime "API Key Management Best Practices" (2026)
- CVE-2025-29927 e recomendação de defesa em profundidade em Route Handlers: WorkOS "Building authentication in Next.js App Router: complete guide for 2026", GitHub Discussion vercel/next.js #93477

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — toda a stack já existe e está em uso verificado no repositório
- Arquitetura: HIGH para reuso de padrões existentes; MEDIUM para os componentes genuinamente novos (auth por API key, envelope de resposta) que seguem práticas de mercado mas não têm precedente no próprio código
- Pitfalls: HIGH para o Pitfall 1 (middleware) e Pitfall 3 (sanitizeString), ambos verificados lendo o código-fonte diretamente; MEDIUM para os demais (baseados em práticas gerais de API pública)

**Research date:** 2026-07-14
**Valid until:** 30 dias (stack estável; revisitar se houver upgrade de Next.js major ou mudança na estratégia de rate limiting)
