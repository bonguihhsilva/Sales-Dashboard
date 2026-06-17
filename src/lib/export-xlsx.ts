// IMPORTANT: importar de 'xlsx-js-style', NUNCA de 'xlsx' neste arquivo
// xlsx (community 0.18.5) não persiste cell styles — xlsx-js-style é o fork correto
import XLSXStyle from 'xlsx-js-style'

export interface VendorReport {
  nome: string
  loja: string
  total_vendido: number
  comissao_pct: number
  comissao: number
  meta_atingida: string
  bonus: number
  total_ganhos: number
  status_aprovacao: string
}

const HEADER_STYLE = {
  font: { bold: true },
  fill: { fgColor: { rgb: 'F5F5F5' } },
}

const HEADERS = [
  'Vendedor', 'Loja', 'Total Vendido ($)', 'Meta Atingida',
  'Comissão %', 'Comissão ($)', 'Bônus ($)', 'Total Ganhos ($)', 'Status',
]

const COL_WIDTHS = [
  { wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
  { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
]

function fmtPct(n: number): string {
  return (n * 100).toFixed(1).replace('.', ',') + '%'
}

function vendorToRow(v: VendorReport): (string | number)[] {
  return [
    v.nome, v.loja,
    v.total_vendido,
    v.meta_atingida,
    fmtPct(v.comissao_pct),
    v.comissao,
    v.bonus,
    v.total_ganhos,
    v.status_aprovacao,
  ]
}

export function generateCommissionXlsx(vendors: VendorReport[], periodLabel: string): Buffer {
  const rows: (string | number)[][] = [HEADERS, ...vendors.map(vendorToRow)]
  const ws = XLSXStyle.utils.aoa_to_sheet(rows)

  HEADERS.forEach((_, i) => {
    const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c: i })
    if (ws[cellRef]) ws[cellRef].s = HEADER_STYLE
  })

  ws['!cols'] = COL_WIDTHS

  const totalRow = [
    'TOTAL', '',
    vendors.reduce((s, v) => s + v.total_vendido, 0),
    '', '',
    vendors.reduce((s, v) => s + v.comissao, 0),
    vendors.reduce((s, v) => s + v.bonus, 0),
    vendors.reduce((s, v) => s + v.total_ganhos, 0),
    '',
  ]
  XLSXStyle.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 })

  const wb = XLSXStyle.utils.book_new()
  const sheetName = periodLabel.slice(0, 31)
  XLSXStyle.utils.book_append_sheet(wb, ws, sheetName)

  return XLSXStyle.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
