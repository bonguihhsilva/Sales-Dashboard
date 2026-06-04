# Motor de Comissão Flexível — Design

**Data:** 2026-06-04
**Status:** Design aprovado em brainstorming — pendente revisão do spec
**Escopo:** Pós-go-live (go-live de segunda 2026-06-08 sai com o motor atual; UI standalone `/dashboard/regras-comissao` fica como está)

---

## 1. Contexto e problema

### Motor atual (funciona)
`config/comissao` (por loja) → grava `regras_comissao` com `condicoes:{loja}` + `acao:{commission_pct, meta1/2/3, bonus1/2/3, tipo_calculo}` → `calculate_vendor_goals()` (no upload/criação de período) → `goals` → view `vendor_summary` → `POST /api/admin/calcular-comissao` → `comissoes_calculadas` → aprovação.

### A confusão
`/dashboard/regras-comissao` (`RegraFormClient`) grava um shape **incompatível**: `condicoes` como **array** (`[{tipo:'atingimento_meta',meta,comparador}]`) e `acao:{tipo,valor}`. Como `calculate_vendor_goals` lê `condicoes->>'loja'` (espera objeto `{loja}`), a regra nunca casa → **silenciosamente ignorada**. Admin pode criar "regras" que não fazem nada.

### Objetivo
Motor de regras **flexível** que computa 8 tipos de comissão, substituindo o modelo `goals` fixo (commission_pct + 3 metas).

### Limitação de dados descoberta
`sales_records` (CEC import) é **por pedido**, sem produto: `order_ref, valor, quantity, vendor, client, data`. O export CEC **tem** produto por linha (confirmado), mas o `parseSalesHtml` não extrai. → comissão por produto/categoria exige expandir o pipeline (Fase 1).

---

## 2. Os 8 tipos de comissão

| # | Tipo | Componente | Valor | Resolução |
|---|------|-----------|-------|-----------|
| 1 | % do total de vendas | `base_pct` | % | substitui |
| 2 | por categoria de produto | `category_rate` | $ ou % | soma |
| 3 | por produto específico | `per_product` | $ × qtd | soma |
| 4 | bônus de metas 1/2/3 | `meta_bonus` | $ | substitui (maior meta atingida) |
| 5 | meta grupal | `group_meta_bonus` | $ por membro | soma |
| 6 | por período (ex: blackfriday) | `base_pct` com janela de data | % | **substitui** base no período |
| 7 | especial p/ pessoa | qualquer componente + `scope` | — | mais específico vence |
| 8 | externos (guia/influencer/freteiro) | `external_commission` | $ ou % sobre nota | track separado |

---

## 3. Modelo de componentes (núcleo do motor)

- Cada regra produz **1 componente tipado**.
- **Dentro do tipo:** vence o mais específico. Ordem de especificidade:
  `pessoa+data > pessoa > data > loja > global`
- **Entre tipos:** soma.
- **Comissão do vendedor = Σ componentes vencedores.**

Exemplo: vendedor da Jebai, blackfriday, vendeu iPhone (Telefonia):
- `base_pct`: regra blackfriday (data) substitui a da loja → 5%
- `category_rate` Telefonia: +2% (soma)
- `per_product` iPhone: +$10/peça (soma)
- `meta_bonus`: bateu meta2 → +$150 (substitui meta1)
- Total = 5%·total + 2%·telefonia + $10·qtd_iphone + $150

---

## 4. Granularidade de avaliação

| Granularidade | Componentes |
|---|---|
| Por item de venda (`itens_venda`) | `category_rate`, `per_product` |
| Por agregado vendedor/período | `base_pct`, `meta_bonus`, `group_meta_bonus` |
| Por janela de data | `base_pct` período (blackfriday) |
| Por nota (`order_ref`) | `external_commission` |

---

## 5. Modelo de dados

### 5.1 Pipeline product-level (Fase 1)
- Expandir `parseSalesHtml` p/ extrair produto/SKU/descrição das colunas CEC. **Precisa amostra real do CEC** p/ mapear índices de coluna.
- Nova storage de item:
  ```
  itens_venda(id, tenant_id, order_ref, produto_id?, descricao, sku?, qtd, valor_unit, valor_total, period_id)
  ```
  ligado a `produtos(categoria_id)`. Match produto por SKU/nome → `produto_id`; sem match, guarda `descricao` cru.
- `sales_records` mantido p/ totais e compatibilidade. **Reconciliação:** Σ `itens_venda.valor_total` por `order_ref` ≈ `sales_records.valor` (tolerância p/ descontos).

### 5.2 Schema de regra (reforma `regras_comissao` — shape único)
```jsonc
condicoes: {
  scope_loja?: string,          // nome da loja
  scope_vendedor_id?: string,   // override por pessoa (#7)
  categoria_id?: uuid,          // #2
  produto_id?: uuid,            // #3
  meta?: 1 | 2 | 3,             // #4
  data_de?: date, data_ate?: date,  // #6 período
  volume_min?: number           // gatilho de meta grupal (#5)
}
acao: { componente: ComponentType, valor_tipo: 'pct' | 'fixo', valor: number }
prioridade, ativo, nome, tenant_id, criado_por
```
**Migração:** regras atuais de `config/comissao` (per-loja base+metas) → regras `base_pct` + `meta_bonus` equivalentes. Regras do UI standalone morto = descartadas (nunca funcionaram).

### 5.3 Externos (Fase 3)
```
external_partners(id, tenant_id, nome, tipo: freteiro|guia|influencer, contato, ativo)
nota_atribuicoes(id, tenant_id, order_ref, external_partner_id, atribuido_por, criado_em)  -- manual
```
Regra `external_commission`: % ou $ sobre `valor` da nota atribuída. Payout dos externos = **track separado**, fora do ranking de vendedores.

### 5.4 Meta grupal (#5)
Grupo = **loja**. `group_meta_bonus`: `condicoes:{scope_loja, volume_min}`, `acao:{fixo, valor=$X}`. Se soma da loja no período ≥ `volume_min` → cada vendedor ativo da loja ganha $X.

---

## 6. Engine de avaliação

- **Input:** vendas do período (itens + agregados por vendedor), regras ativas do tenant, atribuições externas.
- **Por vendedor:** resolve cada tipo de componente (filtra regras por scope/condições; escolhe a mais específica p/ tipos-substitui; soma p/ tipos-soma) → comissão total + breakdown.
- **Por externo:** soma `external_commission` das notas atribuídas.
- **Output:**
  - `comissoes_calculadas` (vendedor) — `detalhamento` vira array de componentes `{tipo, regra_origem, base, valor}`.
  - `comissoes_externos` (novo) — payout por parceiro externo.
- **Idempotente**; preserva comissões **aprovadas** (como hoje).

---

## 7. Display e cascata downstream

- `comissoes_calculadas.detalhamento` = breakdown por componente (não mais campos fixos).
- **Ranking / meu-resultado:** comissão total + breakdown expandível. Metas 1/2/3 seguem visíveis no display (são `meta_bonus`).
- **Tela de aprovação:** por vendedor + nova aba por externo.
- `vendor_summary` view e `calcular-comissao` reescritos p/ consumir o motor de componentes em vez de `goals.commission_pct`.

---

## 8. Migração e segurança

- **Parallel-run obrigatório:** novo motor calcula ao lado do atual por N períodos; comparar divergência antes de cortar o velho. **Não cortar lógica de dinheiro sem reconciliação.**
- Preservar `comissoes_calculadas` aprovadas.
- RLS (tenant + papel) em todas as tabelas novas (`itens_venda`, `external_partners`, `nota_atribuicoes`, `comissoes_externos`).
- Recompute on rule change, com guarda de aprovadas.
- Toda mudança de schema via migration versionada.

---

## 9. Fases (cada uma com spec + plano + build próprios)

1. **Pipeline product-level** — expandir parser + `itens_venda` + reconciliação. Entrega: vendas com produto. *Bloqueador: amostra real do CEC.*
2. **Engine core** — schema de regra único + avaliador + `base_pct`/`meta_bonus`/`category_rate`/`per_product`/período. Migra `config/comissao` atual. Parallel-run.
3. **Meta grupal + externos** — `external_partners` + atribuição manual + payout + `group_meta_bonus`.
4. **Migração de UI** — autoria unificada de regras (substitui os 2 UIs), display ranking/meu-resultado, tela de aprovação (vendedor + externo).

---

## 10. Riscos

- **Lógica de pagamento:** erro = vendedor pago errado. Parallel-run + reconciliação antes de cortar.
- **Impedance display:** ranking de 3 metas → breakdown flexível. Cuidar UX p/ não confundir vendedor.
- **Pipeline depende da fonte:** mapeamento de colunas de produto do CEC precisa de amostra real.
- **Externos:** nova superfície de RLS + payout fora do fluxo de vendedores.

---

## 11. Abertos (resolver nas specs de fase)

- Amostra real do CEC p/ mapear colunas de produto (Fase 1).
- Condições compostas: E/OU entre múltiplas condições numa regra (assumido: E entre dimensões; refinar na Fase 2).
- `group_meta_bonus`: `volume_min` é por loja fixo ou configurável por período? (assumido: configurável por loja+período).
- Reconciliação item↔pedido: tolerância p/ descontos/impostos (definir na Fase 1 com dado real).
