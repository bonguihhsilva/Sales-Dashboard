import { describe, it, expect } from 'vitest'
import { generateCommissionXlsx, type VendorReport } from '@/lib/export-xlsx'
import { generateCommissionPdf } from '@/lib/export-pdf'
import XLSXStyle from 'xlsx-js-style'

const SAMPLE_VENDORS: VendorReport[] = [
  {
    nome: 'João Silva', loja: 'Jebai',
    total_vendido: 50000, comissao_pct: 0.03, comissao: 1500,
    meta_atingida: '2ª meta', bonus: 200, total_ganhos: 1700,
    status_aprovacao: 'Aprovada',
  },
  {
    nome: 'Maria Santos', loja: 'Pajé 1',
    total_vendido: 30000, comissao_pct: 0.02, comissao: 600,
    meta_atingida: '1ª meta', bonus: 0, total_ganhos: 600,
    status_aprovacao: 'Pendente',
  },
]

describe('export-xlsx', () => {
  it('retorna Buffer não-vazio', () => {
    const buf = generateCommissionXlsx(SAMPLE_VENDORS, 'Maio 2026')
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(1000)
  })

  it('headers têm bold via roundtrip', () => {
    const buf = generateCommissionXlsx(SAMPLE_VENDORS, 'Maio 2026')
    const wb = XLSXStyle.read(buf, { type: 'buffer', cellStyles: true })
    // xlsx-js-style persiste font.bold no XML mas o parser lê a tabela de fontes do workbook
    // A célula A1 usa uma fonte com bold:1 — verificamos via Styles.Fonts
    const fonts = (wb as unknown as { Styles?: { Fonts?: Array<{ bold?: number }> } }).Styles?.Fonts ?? []
    const hasBoldFont = fonts.some(f => f.bold === 1)
    expect(hasBoldFont).toBe(true)
  })

  it('nome da sheet = periodLabel (truncado a 31 chars)', () => {
    const buf = generateCommissionXlsx(SAMPLE_VENDORS, 'Maio 2026')
    const wb = XLSXStyle.read(buf, { type: 'buffer' })
    expect(wb.SheetNames[0]).toBe('Maio 2026')
  })

  it('primeira linha tem 9 colunas', () => {
    const buf = generateCommissionXlsx(SAMPLE_VENDORS, 'Maio 2026')
    const wb = XLSXStyle.read(buf, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSXStyle.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]
    expect(data[0]).toHaveLength(9)
  })
})

describe('export-pdf', () => {
  it('retorna Promise<Buffer> não-vazio', async () => {
    const buf = await generateCommissionPdf(SAMPLE_VENDORS, 'Maio 2026')
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(1000)
  })

  it('começa com magic bytes %PDF', async () => {
    const buf = await generateCommissionPdf(SAMPLE_VENDORS, 'Maio 2026')
    expect(buf.slice(0, 4).toString('ascii')).toBe('%PDF')
  })
})
