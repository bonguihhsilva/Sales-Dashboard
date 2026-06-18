import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import type { VendorReport } from './export-xlsx'

export type { VendorReport }

interface ColDef {
  label: string
  width: number
  align: 'left' | 'right'
  value: (v: VendorReport) => string
}

const fmt = (n: number) => n.toFixed(2).replace('.', ',')
const fmtPct = (n: number) => (n * 100).toFixed(1) + '%'

const COLS: ColDef[] = [
  { label: 'Vendedor',     width: 130, align: 'left',  value: v => v.nome },
  { label: 'Loja',         width: 80,  align: 'left',  value: v => v.loja },
  { label: 'Total ($)',    width: 80,  align: 'right', value: v => fmt(v.total_vendido) },
  { label: 'Meta',         width: 80,  align: 'left',  value: v => v.meta_atingida },
  { label: 'Com. %',       width: 55,  align: 'right', value: v => fmtPct(v.comissao_pct) },
  { label: 'Comissão ($)', width: 80,  align: 'right', value: v => fmt(v.comissao) },
  { label: 'Bônus ($)',    width: 70,  align: 'right', value: v => fmt(v.bonus) },
  { label: 'Total ($)',    width: 80,  align: 'right', value: v => fmt(v.total_ganhos) },
  { label: 'Status',       width: 70,  align: 'left',  value: v => v.status_aprovacao },
]

const PAGE_MARGIN = 40
const ROW_HEIGHT = 18
const HEADER_HEIGHT = 22
const LOGO_PATH = path.join(process.cwd(), 'public', 'logo.png')

// Cache result per cold start — avoids blocking fs.existsSync on every PDF generation
let _logoExists: boolean | null = null
function logoExists(): boolean {
  if (_logoExists === null) _logoExists = fs.existsSync(LOGO_PATH)
  return _logoExists
}

export async function generateCommissionPdf(
  vendors: VendorReport[],
  periodLabel: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4', layout: 'landscape' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Header (D-12: logo GDS + título + período) ────
    // Logo: incluído se public/logo.png existir — fallback gracioso se ausente
    if (logoExists()) {
      doc.image(LOGO_PATH, PAGE_MARGIN, PAGE_MARGIN, { height: 36 })
      doc.moveDown(0.5)
    }
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('GDS Frame — Relatório de Comissões', { align: 'center' })
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(periodLabel, { align: 'center' })
    doc.moveDown(1.2)

    // ── Cabeçalho da tabela ────
    const tableWidth = COLS.reduce((s, c) => s + c.width, 0)
    const PAGE_USABLE_HEIGHT = doc.page.height - PAGE_MARGIN * 2

    const drawTableHeader = (y: number) => {
      doc.fontSize(9).font('Helvetica-Bold')
      doc.rect(PAGE_MARGIN, y, tableWidth, HEADER_HEIGHT).fill('#E8E8E8')
      doc.fillColor('black')
      let hx = PAGE_MARGIN
      COLS.forEach(col => {
        doc.text(col.label, hx + 3, y + 5, {
          width: col.width - 6,
          align: col.align,
          lineBreak: false,
        })
        hx += col.width
      })
      doc.font('Helvetica').fontSize(8)
    }

    let currentTableTop = doc.y
    drawTableHeader(currentTableTop)
    let rowsOnPage = 0

    // ── Linhas de dados ────
    vendors.forEach((vendor) => {
      const maxRowsPerPage = Math.floor((PAGE_USABLE_HEIGHT - HEADER_HEIGHT) / ROW_HEIGHT)
      if (rowsOnPage >= maxRowsPerPage) {
        doc.addPage()
        currentTableTop = PAGE_MARGIN
        drawTableHeader(currentTableTop)
        rowsOnPage = 0
      }

      const rowY = currentTableTop + HEADER_HEIGHT + rowsOnPage * ROW_HEIGHT
      if (rowsOnPage % 2 === 0) {
        doc.rect(PAGE_MARGIN, rowY, tableWidth, ROW_HEIGHT).fill('#F9F9F9')
        doc.fillColor('black')
      }

      let cx = PAGE_MARGIN
      COLS.forEach(col => {
        doc.text(col.value(vendor), cx + 3, rowY + 4, {
          width: col.width - 6,
          align: col.align,
          lineBreak: false,
        })
        cx += col.width
      })
      rowsOnPage++
    })

    // ── Rodapé ────
    const footerY = currentTableTop + HEADER_HEIGHT + rowsOnPage * ROW_HEIGHT + 10
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#888888')
      .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} — GDS Frame Dashboard`, PAGE_MARGIN, footerY)

    doc.end()
  })
}
