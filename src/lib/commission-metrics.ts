import type { VendorMetrics } from './commission-rules'

/**
 * Helper puro de montagem das métricas de comissão v0-2.
 *
 * Centraliza o mapeamento entre as linhas brutas do banco (vendor_summary,
 * vendor_brand_metrics, goals_brand, carteira_reativados) e o shape VendorMetrics
 * consumido pelo motor evaluateRules. Mantém a rota calcular-comissao enxuta e
 * testável (mesma filosofia de commission-approval.ts).
 *
 * Neutralidade: tudo que não existir entra como 0/vazio — o motor já trata
 * marca/meta 0 como "não casa".
 */

// Linha de vendor_summary (subset que o helper usa)
export interface VendorRow {
  vendor_id: string
  total_sold: number
  total_profit: number
  unique_clients: number
}

// Linha de vendor_brand_metrics
export interface BrandRow {
  vendor_id: string
  brand: string
  valor_vendido: number
  clientes_ativos: number
}

// Linha de goals_brand
export interface BrandGoalRow {
  vendor_id: string
  brand: string
  meta_valor: number
}

// Linha do RPC carteira_reativados
export interface ReativadoRow {
  vendor_id: string
  client_id: string
}

/**
 * Monta as métricas de um vendedor.
 *
 * @param summary   linha de vendor_summary (total_sold, unique_clients, ...)
 * @param marcas    vendas por marca do vendor_brand_metrics (já filtrado ao vendor)
 * @param metas     metas por marca do goals_brand (já filtrado ao vendor)
 * @param reativados client_ids do carteira_reativados para este vendor (ou todos; set global)
 */
export function montarVendorMetrics(
  summary: VendorRow,
  marcas: Record<string, number>,
  metas: Record<string, number>,
  reativados: Set<string>,
): VendorMetrics {
  return {
    vendor_id: summary.vendor_id,
    total_sold: Number(summary.total_sold ?? 0),
    total_profit: Number(summary.total_profit ?? 0),
    meta1: 0,
    meta2: 0,
    meta3: 0,
    vendas_por_marca: marcas,
    metas_por_marca: metas,
    clientes_ativos: Number(summary.unique_clients ?? 0),
    clientes_reativados: reativados.size,
  }
}

/**
 * Agrupa linhas de vendor_brand_metrics por vendedor: vendor_id -> marca -> valor.
 */
export function agruparMarcasPorVendedor(rows: BrandRow[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const r of rows) {
    if (!out[r.vendor_id]) out[r.vendor_id] = {}
    out[r.vendor_id][r.brand] = Number(r.valor_vendido ?? 0)
  }
  return out
}

/**
 * Agrupa linhas de goals_brand por vendedor: vendor_id -> marca -> meta.
 */
export function agruparMetasPorVendedor(rows: BrandGoalRow[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const r of rows) {
    if (!out[r.vendor_id]) out[r.vendor_id] = {}
    out[r.vendor_id][r.brand] = Number(r.meta_valor ?? 0)
  }
  return out
}

/**
 * Extrai os client_ids de reativados por vendedor: vendor_id -> Set<client_id>.
 */
export function agruparReativadosPorVendedor(rows: ReativadoRow[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  for (const r of rows) {
    if (!out.has(r.vendor_id)) out.set(r.vendor_id, new Set())
    out.get(r.vendor_id)!.add(r.client_id)
  }
  return out
}