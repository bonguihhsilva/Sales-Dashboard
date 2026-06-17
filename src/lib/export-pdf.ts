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
    const logoExists = fs.existsSync(LOGO_PATH)
    if (logoExists) {
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
    let x = PAGE_MARGIN
    const tableTop = doc.y

    doc.fontSize(9).font('Helvetica-Bold')
    doc.rect(x, tableTop, COLS.reduce((s, c) => s + c.width, 0), HEADER_HEIGHT).fill('#E8E8E8')
    doc.fillColor('black')

    COLS.forEach(col => {
      doc.text(col.label, x + 3, tableTop + 5, {
        width: col.width - 6,
        align: col.align,
        lineBreak: false,
      })
      x += col.width
    })

    // ── Linhas de dados ────
    doc.font('Helvetica').fontSize(8)
    vendors.forEach((vendor, idx) => {
      const rowY = tableTop + HEADER_HEIGHT + idx * ROW_HEIGHT
      if (idx % 2 === 0) {
        doc.rect(PAGE_MARGIN, rowY, COLS.reduce((s, c) => s + c.width, 0), ROW_HEIGHT).fill('#F9F9F9')
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
    })

    // ── Rodapé ────
    const footerY = tableTop + HEADER_HEIGHT + vendors.length * ROW_HEIGHT + 10
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#888888')
      .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} — GDS Frame Dashboard`, PAGE_MARGIN, footerY)

    doc.end()
  })
}
