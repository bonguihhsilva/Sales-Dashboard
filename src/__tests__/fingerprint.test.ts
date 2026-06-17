import { describe, it, expect } from 'vitest'
import { detectFileSystem } from '@/lib/fingerprint'

// Helper: gera HTML CEC com N linhas de dado (19 cols, col[0] = código 5 dígitos)
function makeCecHtml(rows: number): string {
  const cells = Array.from({ length: 19 }, (_, i) =>
    i === 0 ? '<td>12345</td>' : '<td>dado</td>'
  ).join('')
  const trs = Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('\n')
  return `<html><body><table>${trs}</table></body></html>`
}

// Helper: HTML com menos colunas (não-CEC)
function makeShortHtml(rows: number): string {
  const cells = Array.from({ length: 5 }, (_, i) =>
    i === 0 ? '<td>12345</td>' : '<td>dado</td>'
  ).join('')
  const trs = Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('\n')
  return `<html><body><table>${trs}</table></body></html>`
}

// Helper: HTML com 19 cols mas col[0] não-numérica
function makeNonNumericHtml(rows: number): string {
  const cells = Array.from({ length: 19 }, (_, i) =>
    i === 0 ? '<td>VENDEDOR</td>' : '<td>dado</td>'
  ).join('')
  const trs = Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('\n')
  return `<html><body><table>${trs}</table></body></html>`
}

describe('detectFileSystem — fingerprint CEC', () => {
  it('fingerprint-CEC: HTML com 3+ linhas de 19 cols e col[0] numérico retorna "cec"', () => {
    const buf = Buffer.from(makeCecHtml(5))
    expect(detectFileSystem(buf, 'relatorio.html')).toBe('cec')
  })

  it('fingerprint-not-cec-html: HTML com menos de 19 colunas retorna null', () => {
    const buf = Buffer.from(makeShortHtml(5))
    expect(detectFileSystem(buf, 'relatorio.html')).toBeNull()
  })

  it('fingerprint-not-cec-html: HTML com 19 cols mas col[0] não-numérica retorna null', () => {
    const buf = Buffer.from(makeNonNumericHtml(5))
    expect(detectFileSystem(buf, 'relatorio.html')).toBeNull()
  })

  it('fingerprint-csv-fallback: CSV genérico retorna null', () => {
    const csv = 'vendedor;cliente;valor\nA;B;100\nC;D;200'
    const buf = Buffer.from(csv, 'utf-8')
    expect(detectFileSystem(buf, 'dados.csv')).toBeNull()
  })

  it('fingerprint-xlsx-magic: buffer com bytes PK (ZIP/XLSX) retorna null', () => {
    const buf = Buffer.alloc(32, 0)
    buf[0] = 0x50 // P
    buf[1] = 0x4B // K
    buf[2] = 0x03
    buf[3] = 0x04
    expect(detectFileSystem(buf, 'planilha.xlsx')).toBeNull()
  })

  it('fingerprint-html-extension: arquivo .html com conteúdo CEC retorna "cec"', () => {
    const buf = Buffer.from(makeCecHtml(4))
    expect(detectFileSystem(buf, 'export.html')).toBe('cec')
  })

  it('fingerprint-unknown: buffer aleatório retorna null', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe])
    expect(detectFileSystem(buf, 'arquivo.bin')).toBeNull()
  })
})
