export interface SaleTransaction {
  vendor_id: string
  client_id: string
  client_name: string
  sale_date: string   // DD/MM/YY
  sale_time: string   // HH:MM:SS
  order_ref: string
  valor: number
  quantity: number
}

export function parseSalesHtml(html: string): SaleTransaction[] {
  const transactions: SaleTransaction[] = []

  // Extract table rows via regex (runs in browser & Node)
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi

  let rowMatch
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1]
    const cells: string[] = []
    let cellMatch
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      // Strip HTML tags and decode entities
      const text = cellMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      cells.push(text)
    }

    // Data rows: col[0] = numeric client code, col[18] = vendor id
    if (cells.length >= 19 && /^\d+$/.test(cells[0])) {
      const valor = parseFloat(cells[15].replace(/,/g, '')) || 0
      const qty   = parseFloat(cells[9].replace(/,/g, ''))  || 0
      if (valor <= 0) continue

      transactions.push({
        vendor_id:   cells[18],
        client_id:   cells[0],
        client_name: cells[1].replace(/\/$/, '').trim(),
        sale_date:   cells[2],   // DD/MM/YY
        sale_time:   cells[5],   // HH:MM:SS
        order_ref:   cells[4],
        valor,
        quantity:    qty,
      })
    }
  }

  return transactions
}

export function toIsoDate(ddmmyy: string): string {
  // '27/03/26' → '2026-03-27'
  const parts = ddmmyy.split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `20${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}
