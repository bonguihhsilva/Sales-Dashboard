import { describe, it, expect } from 'vitest'
import { filterUnapproved } from './commission-approval'

interface Row {
  vendedor_id: string
  total: number
}

describe('filterUnapproved', () => {
  it('remove linhas cujo vendedor_id está no approvedMap', () => {
    const rows: Row[] = [
      { vendedor_id: 'v1', total: 100 },
      { vendedor_id: 'v2', total: 200 },
    ]
    const approvedMap = new Map([['v1', { aprovado: true, aprovado_por: 'admin1' }]])

    const result = filterUnapproved(rows, approvedMap)

    expect(result).toEqual([{ vendedor_id: 'v2', total: 200 }])
  })

  it('retorna todas as linhas quando approvedMap está vazio', () => {
    const rows: Row[] = [
      { vendedor_id: 'v1', total: 100 },
      { vendedor_id: 'v2', total: 200 },
    ]

    const result = filterUnapproved(rows, new Map())

    expect(result).toEqual(rows)
  })

  it('retorna [] quando todos os vendedores estão aprovados', () => {
    const rows: Row[] = [{ vendedor_id: 'v1', total: 100 }]
    const approvedMap = new Map([['v1', { aprovado: true, aprovado_por: null }]])

    expect(filterUnapproved(rows, approvedMap)).toEqual([])
  })

  it('retorna [] para rows vazio', () => {
    expect(filterUnapproved([], new Map([['v1', {}]]))).toEqual([])
  })

  it('não muta o array original', () => {
    const rows: Row[] = [{ vendedor_id: 'v1', total: 100 }]
    const approvedMap = new Map([['v1', {}]])

    const result = filterUnapproved(rows, approvedMap)

    expect(result).not.toBe(rows)
    expect(rows).toHaveLength(1)
  })
})
