export type DetectedSystem = 'cec' | 'pegasus' | 'isrp' | 'generic' | null

export function detectFileSystem(buffer: Buffer, filename: string): DetectedSystem {
  const ext = filename.split('.').pop()?.toLowerCase()

  // Magic bytes: XLSX/ZIP começa com PK (0x50 0x4B 0x03 0x04)
  const isZip = buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B

  // HTML check via primeiros 512 bytes
  const head = buffer.slice(0, 512).toString('utf-8').trimStart().toLowerCase()
  const isHtml = head.startsWith('<!doctype') || head.startsWith('<html') || head.includes('<table')

  if (isHtml || ext === 'html' || ext === 'htm') {
    const html = buffer.toString('utf-8')
    if (looksLikeCecHtml(html)) return 'cec'
    return null
  }

  if (isZip || ext === 'xlsx' || ext === 'xls') {
    // TODO: quando docs Pegasus chegarem, verificar headers XLSX da planilha
    // Assinatura Pegasus: primeira linha com colunas 'COD_VENDEDOR', 'COD_CLIENTE', 'VALOR' (a confirmar)
    // Por ora retorna null para forçar fallback dropdown (D-06)
    return null
  }

  if (ext === 'csv') {
    // TODO: quando docs Pegasus/ISRP chegarem, verificar headers CSV
    // Assinatura Pegasus CSV: header linha 1 com 'vendor_code', 'client_code', 'amount' (a confirmar)
    // Por ora retorna null para forçar fallback dropdown (D-06)
    return null
  }

  return null
}

function looksLikeCecHtml(html: string): boolean {
  // CEC: tabela HTML com 19+ colunas por linha, col[0] = código numérico de 4-6 dígitos
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let dataRowsFound = 0
  let match
  while ((match = rowRegex.exec(html)) !== null) {
    const cells = match[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
    if (cells && cells.length >= 19) {
      const firstCell = cells[0].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
      if (/^\d{4,6}$/.test(firstCell)) {
        dataRowsFound++
        if (dataRowsFound >= 3) return true
      }
    }
  }
  return false
}
