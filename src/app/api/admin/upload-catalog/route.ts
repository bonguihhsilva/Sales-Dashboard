import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { strictRateLimiter } from '@/lib/ratelimit'
import * as XLSX from 'xlsx'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB — mirrors parse-upload limit

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Perfil sem tenant' }, { status: 400 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const periodIdRaw = formData.get('period_id')

    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    if (!periodIdRaw) return NextResponse.json({ error: 'period_id obrigatório' }, { status: 400 })

    const period_id = parseInt(String(periodIdRaw), 10)
    if (isNaN(period_id)) return NextResponse.json({ error: 'period_id inválido' }, { status: 400 })

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo excede o limite de 10MB' }, { status: 400 })
    }

    const adminDb = createAdminClient()

    // Validate period belongs to tenant
    const { data: period } = await adminDb
      .from('periods')
      .select('tenant_id')
      .eq('id', period_id)
      .single()

    if (!period || period.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: 'Período não pertence à sua organização' }, { status: 403 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()?.toLowerCase()

    interface ProductRow {
      tenant_id: string
      period_id: number
      product_code: string
      name: string | null
      cost_price: number | null
      sale_price: number | null
      margin_pct: number | null
    }

    let rows: ProductRow[] = []

    if (ext === 'html' || ext === 'htm') {
      rows = parseCatalogHtml(buffer.toString('utf-8'), profile.tenant_id, period_id)
    } else if (ext === 'xlsx' || ext === 'xls') {
      rows = parseCatalogXlsx(buffer, profile.tenant_id, period_id)
    } else {
      return NextResponse.json({ error: `Formato não suportado: ${ext}. Use HTML ou XLSX.` }, { status: 400 })
    }

    if (!rows.length) {
      return NextResponse.json({ error: 'Nenhum produto encontrado no arquivo' }, { status: 400 })
    }

    const { error } = await adminDb
      .from('products')
      .upsert(rows, { onConflict: 'tenant_id,period_id,product_code' })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ imported: rows.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao processar catálogo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ── HTML catalog parser ───────────────────────────────────────────────────
type CatalogRow = { tenant_id: string; period_id: number; product_code: string; name: string | null; cost_price: number | null; sale_price: number | null; margin_pct: number | null }

function parseCatalogHtml(html: string, tenant_id: string, period_id: number): CatalogRow[] {
  const rows: CatalogRow[] = []

  // Find header row to detect column positions
  const headerRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/i
  const allRowsRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi

  function extractCells(rowHtml: string): string[] {
    const cells: string[] = []
    let m
    const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    while ((m = re.exec(rowHtml)) !== null) {
      cells.push(m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim())
    }
    return cells
  }

  // Detect header row
  let colCode = -1, colName = -1, colCost = -1, colSale = -1, colMargin = -1
  let headerFound = false

  let rowMatch
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const cells = extractCells(rowMatch[1])
    if (!headerFound) {
      const lower = cells.map(c => c.toLowerCase())
      const hasHeader = lower.some(c =>
        c.includes('codigo') || c.includes('código') || c.includes('code') ||
        c.includes('custo') || c.includes('cost') || c.includes('preco') || c.includes('preço')
      )
      if (hasHeader) {
        lower.forEach((c, i) => {
          if ((c.includes('codigo') || c.includes('código') || c.includes('code')) && colCode === -1) colCode = i
          else if (c.includes('nome') || c.includes('descri') || c.includes('name')) colName = i
          else if (c.includes('custo') || c.includes('cost')) colCost = i
          else if (c.includes('preco') || c.includes('preço') || c.includes('venda') || c.includes('sale') || c.includes('price')) colSale = i
          else if (c.includes('margem') || c.includes('margin') || c.includes('%')) colMargin = i
        })
        headerFound = true
        continue
      }
    }

    if (!headerFound || colCode === -1 || cells.length <= colCode) continue

    const product_code = cells[colCode]?.trim()
    if (!product_code) continue

    const parseNum = (s?: string) => {
      if (!s) return null
      const n = parseFloat(s.replace(/[^0-9,.-]/g, '').replace(',', '.'))
      return isNaN(n) ? null : n
    }

    rows.push({
      tenant_id,
      period_id,
      product_code,
      name:       colName   >= 0 ? (cells[colName] || null)   : null,
      cost_price: colCost   >= 0 ? parseNum(cells[colCost])   : null,
      sale_price: colSale   >= 0 ? parseNum(cells[colSale])   : null,
      margin_pct: colMargin >= 0 ? parseNum(cells[colMargin]) : null,
    })
  }

  // Suppress unused regex vars
  void headerRegex; void cellRegex; void allRowsRegex

  return rows
}

// ── XLSX catalog parser ───────────────────────────────────────────────────
function parseCatalogXlsx(buffer: Buffer, tenant_id: string, period_id: number): CatalogRow[] {
  const rows: CatalogRow[] = []

  const wb = XLSX.read(buffer, { type: 'buffer', dense: true, sheetRows: 50000 })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]

  let colCode = -1, colName = -1, colCost = -1, colSale = -1, colMargin = -1
  let headerRowIdx = -1

  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i]
    if (!row) continue
    const lower = row.map(c => String(c ?? '').toLowerCase().trim())
    const hasHeader = lower.some(c =>
      c.includes('codigo') || c.includes('código') || c.includes('custo') || c.includes('cost')
    )
    if (hasHeader) {
      lower.forEach((c, idx) => {
        if ((c.includes('codigo') || c.includes('código') || c.includes('code')) && colCode === -1) colCode = idx
        else if (c.includes('nome') || c.includes('descri') || c.includes('name')) colName = idx
        else if (c.includes('custo') || (c.includes('cost') && !c.includes('price'))) colCost = idx
        else if (c.includes('preco') || c.includes('preço') || c.includes('venda') || c.includes('sale')) colSale = idx
        else if (c.includes('margem') || c.includes('margin')) colMargin = idx
      })
      headerRowIdx = i
      break
    }
  }

  // Fallback column positions if header not detected
  if (headerRowIdx === -1) {
    colCode = 0; colName = 1; colCost = 2; colSale = 3; colMargin = 4
    headerRowIdx = 0
  }

  const parseNum = (val: unknown): number | null => {
    if (val === null || val === undefined || val === '') return null
    const n = parseFloat(String(val).replace(/[^0-9,.-]/g, '').replace(',', '.'))
    return isNaN(n) ? null : n
  }

  for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length === 0) continue

    const product_code = String(row[colCode] ?? '').trim()
    if (!product_code) continue

    rows.push({
      tenant_id,
      period_id,
      product_code,
      name:       colName   >= 0 ? (String(row[colName] ?? '').trim() || null) : null,
      cost_price: colCost   >= 0 ? parseNum(row[colCost])                      : null,
      sale_price: colSale   >= 0 ? parseNum(row[colSale])                      : null,
      margin_pct: colMargin >= 0 ? parseNum(row[colMargin])                    : null,
    })
  }

  return rows
}
