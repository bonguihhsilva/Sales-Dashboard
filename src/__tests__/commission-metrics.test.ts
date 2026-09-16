import { describe, it, expect } from 'vitest'
import {
  montarVendorMetrics,
  agruparMarcasPorVendedor,
  agruparMetasPorVendedor,
  agruparReativadosPorVendedor,
  type VendorRow,
} from '@/lib/commission-metrics'

const summary: VendorRow = {
  vendor_id: 'v',
  total_sold: 12000,
  total_profit: 4800,
  unique_clients: 5,
}

describe('montarVendorMetrics', () => {
  it('monta métricas do vendedor com marcas, metas e reativação', () => {
    const m = montarVendorMetrics(
      summary,
      { Nike: 6000, Adidas: 1000 },
      { Nike: 5000 },
      new Set(['c1', 'c2']),
    )
    expect(m).toMatchObject({
      vendor_id: 'v',
      total_sold: 12000,
      total_profit: 4800,
      vendas_por_marca: { Nike: 6000, Adidas: 1000 },
      metas_por_marca: { Nike: 5000 },
      clientes_ativos: 5,
      clientes_reativados: 2,
    })
  })

  it('trata dados ausentes como neutro (0/vazio)', () => {
    const m = montarVendorMetrics(
      { vendor_id: 'v', total_sold: 0, total_profit: 0, unique_clients: 0 },
      {},
      {},
      new Set(),
    )
    expect(m.clientes_ativos).toBe(0)
    expect(m.clientes_reativados).toBe(0)
    expect(m.vendas_por_marca).toEqual({})
  })
})

describe('agruparMarcasPorVendedor', () => {
  it('agrupa por vendedor e marca', () => {
    const out = agruparMarcasPorVendedor([
      { vendor_id: 'v1', brand: 'Nike', valor_vendido: 1000, clientes_ativos: 2 },
      { vendor_id: 'v1', brand: 'Adidas', valor_vendido: 500, clientes_ativos: 1 },
      { vendor_id: 'v2', brand: 'Nike', valor_vendido: 400, clientes_ativos: 1 },
    ])
    expect(out).toEqual({
      v1: { Nike: 1000, Adidas: 500 },
      v2: { Nike: 400 },
    })
  })
})

describe('agruparMetasPorVendedor', () => {
  it('agrupa metas por vendedor e marca', () => {
    const out = agruparMetasPorVendedor([
      { vendor_id: 'v1', brand: 'Nike', meta_valor: 5000 },
      { vendor_id: 'v2', brand: 'Nike', meta_valor: 3000 },
    ])
    expect(out).toEqual({
      v1: { Nike: 5000 },
      v2: { Nike: 3000 },
    })
  })
})

describe('agruparReativadosPorVendedor', () => {
  it('agrupa client_ids por vendedor', () => {
    const out = agruparReativadosPorVendedor([
      { vendor_id: 'v1', client_id: 'c1' },
      { vendor_id: 'v1', client_id: 'c2' },
      { vendor_id: 'v2', client_id: 'c3' },
    ])
    expect(out.get('v1')).toEqual(new Set(['c1', 'c2']))
    expect(out.get('v2')).toEqual(new Set(['c3']))
  })
})