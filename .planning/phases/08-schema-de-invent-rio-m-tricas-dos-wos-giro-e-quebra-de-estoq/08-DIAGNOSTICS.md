# Fase 08 — Diagnósticos de produção (Plano 08-00)

**Status geral: PENDENTE DE EXECUÇÃO MANUAL** — ver "Nota de execução" abaixo antes de qualquer leitura dos números.

## Nota de execução

Este agente executor (sub-agente `gsd-execute-phase`) **não tem acesso a nenhuma ferramenta MCP do Supabase** (`mcp__supabase__execute_sql` ou equivalente) nem a um mecanismo `ToolSearch` para carregá-la sob demanda — a lista de ferramentas disponível nesta execução continha apenas `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`. Também não há conexão Postgres direta configurável: `.env.local` só expõe `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (credenciais REST/PostgREST, não host/porta/senha de `psql`), e não há `supabase/config.toml` de stack local.

Seguindo a instrução explícita do orquestrador para este plano ("se a ferramenta MCP não estiver acessível, registre como PENDENTE e NÃO invente números"), as queries abaixo **não foram executadas contra o banco de produção** (`zsczxblhtdhpdqvkpuwz`). Nenhum número nesta seção é real — são placeholders explícitos. Nenhuma escrita ocorreu no banco (consistente com o objetivo do plano, que é 100% read-only mesmo quando executado).

**Como resolver o PENDENTE:** rodar as queries abaixo via Supabase MCP `execute_sql` (somente leitura) em uma sessão com a ferramenta disponível, ou via SQL Editor do Supabase Studio no projeto `zsczxblhtdhpdqvkpuwz`, e substituir a seção de resultados por valores reais + a linha `DECISÃO:` correspondente antes de iniciar o Plano 08-02 (`product_daily_sales`), que depende do resultado de R-01.

---

## R-01 — Taxa de órfãos `order_ref` (sale_items sem sales_records correspondente)

### Query 1 — taxa de órfãos por tenant

```sql
SELECT
  si.tenant_id,
  count(*) AS total_sale_items,
  count(*) FILTER (WHERE sr.order_ref IS NULL) AS orphan_items,
  round(
    100.0 * count(*) FILTER (WHERE sr.order_ref IS NULL) / NULLIF(count(*), 0),
    2
  ) AS orphan_pct
FROM sale_items si
LEFT JOIN sales_records sr
  ON sr.tenant_id = si.tenant_id
 AND sr.order_ref  = si.order_id
GROUP BY si.tenant_id
ORDER BY orphan_pct DESC;
```

**Resultado:** PENDENTE — não executado. `orphan_pct` não medido.

### Query 2 — fan-out de `order_ref` (order_ref duplicado com datas de venda diferentes)

```sql
SELECT tenant_id, count(*) AS dup_order_refs
FROM (
  SELECT tenant_id, order_ref, count(DISTINCT sale_date) AS n
  FROM sales_records
  GROUP BY tenant_id, order_ref
  HAVING count(DISTINCT sale_date) > 1
) x
GROUP BY tenant_id;
```

**Resultado:** PENDENTE — não executado.

### DECISÃO: PENDENTE — bloqueante para o Plano 08-02

Não é possível decidir entre "excluir órfãos (D-08 como está)" e "implementar fallback" sem a medição real de `orphan_pct`. **Critério já definido no 08-RESEARCH.md (Open Questions #1):**
- Se `orphan_pct < 1%` em todos os tenants → seguir D-08 como está (INNER/LEFT JOIN exclui órfãos silenciosamente na view `product_daily_sales`; Plano 08-02 usa `DISTINCT ON` em `sales_records` para eliminar fan-out).
- Se `orphan_pct >= 1%` em qualquer tenant → **PARAR e escalar para o dono do produto** (não decidir automaticamente): propor uma das opções do R-01 do `08-CONTEXT.md` — (a) fallback de data via `periods` do item, ou (b) aceitar e expor a lacuna como métrica de saúde visível.

**Ação requerida antes do Plano 08-02:** rodar Query 1 e Query 2 acima, atualizar esta seção com os números reais, e só então preencher esta linha de decisão.

---

## R-04 — Cobertura do seed de `product_costs`

### Query 1 — SKUs no período mais recente vs. histórico total, e SKUs sem custo no período recente

```sql
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods
  ORDER BY tenant_id, year DESC, month DESC
)
SELECT
  p.tenant_id,
  count(DISTINCT p.product_code) FILTER (WHERE p.period_id = lp.period_id) AS skus_periodo_recente,
  count(DISTINCT p.product_code)                                            AS skus_historico_total,
  count(DISTINCT p.product_code) FILTER (WHERE p.cost_price IS NULL AND p.period_id = lp.period_id) AS skus_recente_sem_custo
FROM products p
JOIN latest_period lp ON lp.tenant_id = p.tenant_id
GROUP BY p.tenant_id;
```

**Resultado:** PENDENTE — não executado. `skus_periodo_recente` não medido.

### Query 2 — produtos vendidos historicamente mas ausentes do catálogo mais recente (ficariam sem custo no dia 1)

```sql
WITH latest_period AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, id AS period_id
  FROM periods ORDER BY tenant_id, year DESC, month DESC
)
SELECT si.tenant_id, count(DISTINCT si.product_code) AS vendidos_sem_catalogo_recente
FROM sale_items si
LEFT JOIN products p
  ON p.tenant_id = si.tenant_id
 AND p.product_code = si.product_code
 AND p.period_id = (SELECT period_id FROM latest_period lp WHERE lp.tenant_id = si.tenant_id)
WHERE p.product_code IS NULL
GROUP BY si.tenant_id;
```

**Resultado:** PENDENTE — não executado.

### Conclusão R-04: PENDENTE

Sem os números de `skus_periodo_recente`, `skus_historico_total`, `skus_recente_sem_custo` e `vendidos_sem_catalogo_recente`, não é possível concluir se o seed do período mais recente (D-03, `08-RESEARCH.md` "Seed inicial de product_costs") é suficiente para o MVP ou se o dono precisa subir um catálogo atualizado antes de confiar em `stock_value`/`turnover`. **Ação requerida:** rodar as duas queries acima e preencher esta seção com a conclusão antes de aceitar o seed simples do Plano 08-01 (ou equivalente) como definitivo.

---

## Resumo para o orquestrador / próximo executor

| Item | Status |
|---|---|
| R-01 — taxa de órfãos `order_ref` | PENDENTE — requer sessão com Supabase MCP `execute_sql` ou SQL Editor do Studio |
| R-01 — fan-out de `order_ref` | PENDENTE |
| R-01 — decisão D-08 (excluir órfãos vs. fallback) | PENDENTE — bloqueante para Plano 08-02 |
| R-04 — cobertura do seed | PENDENTE — requer as mesmas ferramentas |
| Nenhuma escrita no banco | Confirmado — nenhuma query de mutação foi sequer preparada, apenas SELECT |

**Recomendação:** antes de iniciar o Plano 08-02 (`product_daily_sales`), rodar este plano novamente (ou apenas as 4 queries acima) em uma sessão que tenha a ferramenta MCP Supabase `execute_sql` carregada, e atualizar este arquivo com os resultados reais + as duas linhas de `DECISÃO:`/conclusão antes de prosseguir.
