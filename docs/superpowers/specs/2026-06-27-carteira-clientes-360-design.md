# Carteira de Clientes 360 — Design

> Data: 2026-06-27
> Projeto: GDS Frame Dashboard (da-silva-dashboard)
> Status: aprovado para planejamento

## Objetivo

Transformar a Carteira de Clientes de uma tabela plana num painel de inteligência comercial que permita:

1. **Reter quem some** — detectar clientes em risco/perdidos e listar quem abordar.
2. **Vender mais pra quem já compra** — upsell/cross-sell via lacunas de categoria.
3. **Conhecer o cliente a fundo** — ficha com mix de categoria, cadência, histórico.
4. **Ler a carteira como um todo** — RFM, curva ABC/Pareto, mix de categoria do book.

Prioridade na ordem acima.

## Realidade dos dados (constraint central)

A única tabela populada hoje é `sales_records` (~59.483 linhas), nível **nota** — não tem produto, SKU nem categoria. Colunas: `period_id, vendor_id, vendor_name, store, client_id, client_name, sale_date, sale_time, order_ref, valor, quantity, tenant_id`.

As views `client_portfolio` e `vendor_summary` derivam dela. `sale_items`, `products`, `vendas`, `itens_venda` estão **vazias**. `produtos` (19) e `categorias` (6) têm só seeds (eletrônicos/perfumaria — coerente com loja de CDE).

**Consequência:** análise de categoria por cliente exige dado item-level (produto + categoria por linha de venda), que não existe. Os relatórios de venda do cliente conseguem exportar isso (código de produto, preço unitário, desconto), mas esse relatório ainda não foi gerado. **Decisão: construir contra mock data item-level agora; o pipeline real entra quando o relatório existir.**

## Abordagem

### Camada de dados item-level

Introduzir um modelo item-level coerente reutilizando o que já existe:

- **`products`** (fonte de verdade da categoria): adicionar coluna `category` (texto). Mapa `product_code → category` por tenant/período. **Preferido** — categoria mora aqui, não duplicada em `sale_items`.
- **`sale_items`** (tabela já existente, hoje vazia): `tenant_id, period_id, vendor_id, order_id, product_code, qty, unit_price, total_price, unit_cost, total_profit`. O endpoint `api/admin/parse-upload` já faz upsert nela quando o import traz `product_code`. Categoria vem por join com `products`, não em coluna própria.
- **Mock generator** (`src/lib/mock/carteira.ts`): determinístico, keyed por `client_id`/`order_ref`, explode cada nota real de `sales_records` em 1–3 linhas de produto fake cujo somatório ≈ `valor`, atribuindo produtos/categorias dos seeds. Resultado: dados de categoria realistas amarrados a clientes/vendedores/períodos **reais**. Usado como fallback quando `sale_items` está vazio — mesmo padrão do `AnaliseTab` atual.

> Sem escrita de mock no banco de produção. Mock é gerado em código (server-side), no momento da query, quando não há item-level real. Mantém prod limpo (regra do projeto: mudança só via migration).

### Migrations necessárias

- `sale_items.category` (text, nullable) — ou tabela de mapa `product_categories`.
- `products.category` (text, nullable).
- View/RPC `client_categories` — agrega item-level por (período, vendor, client, categoria). Quando `sale_items` vazia, a camada de app usa o mock generator.
- RPC `client_history` — todas as notas de um cliente + itens (para a modal).

### Segmentação (RFM + ciclo de vida)

Computada a partir de `client_portfolio` (já tem recência, frequência, monetário) — **funciona hoje, sem item-level**:

- **R/F/M score 1–5** por quintis dentro da carteira do vendedor (ou global, p/ admin).
- **Segmentos**: `VIP` (R/F/M alto), `Recorrente` (≥2 compras), `Novo` (1 compra no período), `Em risco` (dias desde última > 2× cadência mediana do cliente), `Perdido` (sem compra no período vs período anterior).
- **Tendência**: Δ% do total do cliente vs período anterior (▲/▼/—).
- **Curva ABC/Pareto**: % da receita concentrada no top 20%.

Thresholds com defaults sensatos, configuráveis depois (não nesta fase).

## Telas / Componentes

### 1. Carteira (lista + macro) — `ClientsTab` reescrito

Topo macro (KPIs): Clientes, Volume, Em risco, Novos (mês), Concentração Pareto (top-20% = X% receita).
Filtros de segmento (pills): Todos / VIP / Recorrentes / Novos / Em risco / Perdidos / Oportunidade upsell — com contagem.
Lista (tabela): Cliente · Segmento · Categoria principal · Total · **Ticket médio** · Tendência (▲▼) · Última compra (dot de recência). Clique na linha abre a ficha.

### 2. Ficha do cliente (drawer à direita) — novo `ClientFicha`

Enxuta, sem detalhe pesado:
- Header: nome, código, vendedor, tempo de cliente, tags (segmento, R/F/M, cadência).
- **Ações**: botão primário `🧾 Abrir última nota` · secundário `📜 Abrir histórico do cliente`.
- Mix por categoria (barra empilhada + lista %).
- Compras por mês (sparkline).
- Oportunidades (lacunas de categoria): "nunca comprou X" + estimativa de próxima reposição por cadência de produto.

### 3. Modal histórico/nota — novo `ClientHistoryModal`

Sobreposta, isolada do dashboard. Abas:
- **Última nota**: cabeçalho (nº, data, nº itens, total) + linhas de produto (qtd, preço unit, total).
- **Todas as notas**: lista de notas do cliente, expansível.
- **Produtos comprados**: agregado de todos os produtos que o cliente já comprou (qtd total, freq, última vez).

## Superfícies

Mesmo conjunto de componentes em duas rotas:
- **Admin** (`/dashboard`, aba Carteira) — `ClientsTab`, todos os vendedores ou filtrado por vendedor.
- **Vendedor** (`/vendedor/meu-resultado`, aba "Minha Carteira") — `ClientsTabClient`, escopado ao próprio `vendor_id`. A modal/ficha são as mesmas; o "histórico/última nota" abre em modal (não inline no dashboard do vendedor).

RLS/escopo: leitura via service_role escopada a tenant + vendor_id (padrão já em uso em `meu-resultado`).

## Fora de escopo (ganchos futuros)

- **Cruzamento com oferta/estoque** ("produto X em oferta / em stock"). Exige fonte de ofertas/estoque inexistente. A ficha entrega **lacunas de categoria + reposição por cadência**; o selo "em oferta/em stock" fica para fase futura.
- Configuração de thresholds de segmento por tenant.
- Pipeline real de import item-level (entra quando o relatório de produtos existir; o endpoint já está preparado).

## Error handling

- Sem item-level real e sem mock → seções de categoria mostram empty state ("Nenhum item registrado neste período"), resto da ficha (RFM/segmento/recência) funciona normalmente (vem de `client_portfolio`).
- Cliente sem histórico → modal mostra empty state por aba.
- Queries seguem o padrão do projeto: `NextResponse.json({ error }, { status })` nas rotas; early-return com fallback JSX nas páginas server.

## Testing

- Mock generator: determinístico (mesmo input → mesmo output), somatório de itens ≈ valor da nota (tolerância de arredondamento), categorias só dos seeds.
- Segmentação: testes unitários dos cortes RFM e regras de Em risco/Perdido com fixtures.
- Render: ficha e modal renderizam com dados mock e com empty state.
- `npm run build` deve passar antes do commit de fase (regra do projeto).

## Faseamento sugerido (para o plano)

1. **Segmentação + lista + macro** (só `client_portfolio`, sem item-level) — entrega reter + macro.
2. **Item-level + mock + mix de categoria na ficha** — entrega conhecer + upsell (lacunas).
3. **Modal histórico/nota** (última nota, todas as notas, produtos comprados).
4. **Paridade vendedor** (mesma experiência escopada em `meu-resultado`).
