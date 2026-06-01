import mammoth from 'mammoth'
// Use require for pdf-parse because it has no default export
const pdfParse = require('pdf-parse')
import * as XLSX from 'xlsx'
import { parseSalesHtml, SaleTransaction } from './parser'
import { sanitizeString } from './sanitize'

export async function parseUploadBuffer(buffer: Buffer, filename: string): Promise<SaleTransaction[]> {
  const ext = filename.split('.').pop()?.toLowerCase()
  let results: SaleTransaction[] = []

  if (ext === 'html' || ext === 'htm') {
    const text = buffer.toString('utf-8')
    results = parseSalesHtml(text)
  } else if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Arquivo de planilha muito grande para processamento seguro (limite de 5MB).')
    }
    results = parseSalesXlsx(buffer)
  } else if (ext === 'docx') {
    results = await parseSalesDocx(buffer)
  } else if (ext === 'pdf') {
    results = await parseSalesPdf(buffer)
  } else {
    throw new Error(`Formato não suportado: ${ext}`)
  }

  // Sanitiza contra Stored XSS nos campos de texto
  return results.map(t => ({
    ...t,
    vendor_id: sanitizeString(t.vendor_id),
    client_id: sanitizeString(t.client_id),
    client_name: sanitizeString(t.client_name),
    order_ref: sanitizeString(t.order_ref),
  }))
}

function parseSalesXlsx(buffer: Buffer): SaleTransaction[] {
  const wb = XLSX.read(buffer, { type: 'buffer', dense: true, sheetRows: 20000 })
  const ws = wb.Sheets[wb.SheetNames[0]]
  // Read as array of arrays
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
  
  const transactions: SaleTransaction[] = []

  // Try to find headers
  // Expected headers: Vendedor, Cliente, Data, Valor, Referência, etc.
  // For simplicity, we assume the same format or we can do a heuristic column search
  let headerRowIdx = -1
  let colMap = { vendor_id: -1, client_id: -1, client_name: -1, sale_date: -1, valor: -1, order_ref: -1, quantity: -1 }

  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i]
    if (!row) continue
    const rowStr = row.map(c => String(c).toLowerCase()).join(' ')
    if (rowStr.includes('vendedor') || rowStr.includes('valor')) {
      headerRowIdx = i
      // Map columns
      row.forEach((cell, idx) => {
        const c = String(cell).toLowerCase().trim()
        if (c.includes('vendedor') || c.includes('vendor')) colMap.vendor_id = idx
        else if (c.includes('cliente') && !c.includes('nome')) colMap.client_id = idx
        else if (c.includes('cliente') && c.includes('nome')) colMap.client_name = idx
        else if (c.includes('data')) colMap.sale_date = idx
        else if (c.includes('valor') || c.includes('total')) colMap.valor = idx
        else if (c.includes('ref') || c.includes('pedido')) colMap.order_ref = idx
        else if (c.includes('qtd') || c.includes('quantidade')) colMap.quantity = idx
      })
      break
    }
  }

  // If we couldn't find headers, try a fallback column layout (similar to HTML)
  if (headerRowIdx === -1 || colMap.vendor_id === -1 || colMap.valor === -1) {
    // Fallback: assume column 0 is client_id, 1 is client_name, 2 is date, 4 is order_ref, 9 is qty, 15 is valor, 18 is vendor
    colMap = { vendor_id: 18, client_id: 0, client_name: 1, sale_date: 2, valor: 15, order_ref: 4, quantity: 9 }
    headerRowIdx = 0 // start reading immediately
  }

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length === 0) continue

    const vendor_id = String(row[colMap.vendor_id] || '')
    const valorStr = String(row[colMap.valor] || '0').replace(/[^0-9,-]/g, '').replace(',', '.')
    const valor = parseFloat(valorStr)

    if (!vendor_id || isNaN(valor) || valor <= 0) continue

    // Handle Excel dates (numeric serial) vs string dates
    let sale_date = ''
    const dateCell = row[colMap.sale_date]
    if (typeof dateCell === 'number') {
      const date = new Date(Math.round((dateCell - 25569) * 86400 * 1000))
      sale_date = `${String(date.getUTCDate()).padStart(2,'0')}/${String(date.getUTCMonth()+1).padStart(2,'0')}/${String(date.getUTCFullYear()).slice(2)}`
    } else {
      sale_date = String(dateCell || '').split(' ')[0]
    }

    transactions.push({
      vendor_id,
      client_id: String(row[colMap.client_id] || ''),
      client_name: String(row[colMap.client_name] || ''),
      sale_date,
      sale_time: '',
      order_ref: String(row[colMap.order_ref] || ''),
      valor,
      quantity: parseFloat(String(row[colMap.quantity] || '1').replace(',', '.')) || 1
    })
  }

  return transactions
}

async function parseSalesDocx(buffer: Buffer): Promise<SaleTransaction[]> {
  const result = await mammoth.convertToHtml({ buffer }, {
    styleMap: [],
    includeDefaultStyleMap: false,
  })
  const html = result.value
  if (html.length > 2 * 1024 * 1024) {
    throw new Error('Conteúdo do DOCX excede 2MB após expansão. Reduza o arquivo.')
  }
  return parseSalesHtml(html)
}

async function parseSalesPdf(buffer: Buffer): Promise<SaleTransaction[]> {
  const data = await pdfParse(buffer, { max: 200 })
  const text = data.text
  if (text.length > 1 * 1024 * 1024) {
    throw new Error('Conteúdo do PDF excede 1MB de texto. Reduza o arquivo.')
  }

  const transactions: SaleTransaction[] = []
  const lines = text.split('\n')

  // Heuristic regex: look for patterns that look like a transaction
  // E.g. "12345 Cliente Teste 10/10/24 ... 1500,00 ... VendedorA"
  for (const line of lines) {
    if (!line.trim()) continue
    
    // Very naive heuristic for testing: if it has a date DD/MM/YYYY or DD/MM/YY and a currency-like value
    const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/)
    if (!dateMatch) continue

    // Try to find a currency value (e.g. 1.500,00 or 1500,00 or 1500.00)
    const valMatch = line.match(/(?:R\$)?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2})/)
    if (!valMatch) continue

    // Assume the last word/number might be the vendor ID if it matches an expected pattern,
    // or just capture the raw line and try to split by spaces/tabs.
    const parts = line.trim().split(/\s+/)
    
    // Fallback naive extraction (this needs to be adjusted based on actual PDF layouts)
    // We just extract what we can to demonstrate the capability.
    transactions.push({
      vendor_id: parts[parts.length - 1], // Last token as vendor
      client_id: parts[0],               // First token as client
      client_name: 'Cliente Extraído PDF',
      sale_date: dateMatch[1],
      sale_time: '',
      order_ref: 'PDF-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      valor: parseFloat(valMatch[1].replace(/\./g, '').replace(',', '.')),
      quantity: 1
    })
  }

  return transactions
}
