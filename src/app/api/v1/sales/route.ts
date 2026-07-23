import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyContext, hasScope } from '@/lib/auth/apiKey'
import { ensurePeriodForDate } from '@/lib/periods/ensurePeriod'
import { saleSchema, type SaleInput } from '@/lib/validation/ingest'
import { apiV1RateLimiter } from '@/lib/ratelimit'
import { createAdminClient } from '@/lib/supabase/admin'

// Payload/body de integrador externo — abaixo do teto de 4.5MB das Serverless
// Functions da Vercel (Open Question 3 do research).
const MAX_BODY_BYTES = 4 * 1024 * 1024
const MAX_BATCH_SIZE = 500

interface IngestError {
  index: number
  reason: string
}

interface IngestEnvelope<T> {
  success: boolean
  data: T | null
  error: string | null
  accepted: number
  rejected: number
  errors: IngestError[]
}

function envelope<T>(
  data: T | null,
  error: string | null,
  accepted: number,
  rejected: number,
  errors: IngestError[]
): IngestEnvelope<T> {
  return { success: error === null, data, error, accepted, rejected, errors }
}

// ── Task 2: POST /api/v1/sales ──────────────────────────────────────────────
// Ingest em batch de vendas autenticado por API key (D-05..D-08, D-13..D-15).
// Idempotência de sales_records via RPC transacional ingest_sales_records
// (delete+insert atômico) — nunca delete+insert manual no handler (T-7-14).
export async function POST(req: NextRequest) {
  const ctx = await getApiKeyContext(req)
  if (!ctx) {
    return NextResponse.json(
      envelope(
        null,
        'API key inválida ou ausente. Envie Authorization: Bearer gds_live_...',
        0,
        0,
        []
      ),
      { status: 401 }
    )
  }

  if (!hasScope(ctx, 'sales:write')) {
    return NextResponse.json(
      envelope(null, 'API key sem permissão para o escopo sales:write.', 0, 0, []),
      { status: 403 }
    )
  }

  const { success: rateOk } = await apiV1RateLimiter.limit(ctx.apiKeyId)
  if (!rateOk) {
    return NextResponse.json(
      envelope(null, 'Muitas requisições. Tente novamente em instantes.', 0, 0, []),
      { status: 429 }
    )
  }

  // Limite de tamanho de body (413) — fast-path pelo header antes de ler o corpo.
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      envelope(null, 'Payload excede o limite de 4MB. Envie o batch em partes menores.', 0, 0, []),
      { status: 413 }
    )
  }

  const raw = await req.text()
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json(
      envelope(null, 'Payload excede o limite de 4MB. Envie o batch em partes menores.', 0, 0, []),
      { status: 413 }
    )
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json(envelope(null, 'JSON inválido no corpo da requisição.', 0, 0, []), {
      status: 400,
    })
  }

  const sales = (body as { sales?: unknown } | null)?.sales
  if (!Array.isArray(sales)) {
    return NextResponse.json(
      envelope(null, 'Campo "sales" deve ser um array de vendas.', 0, 0, []),
      { status: 400 }
    )
  }
  if (sales.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      envelope(null, `Batch excede ${MAX_BATCH_SIZE} vendas.`, 0, 0, []),
      { status: 400 }
    )
  }

  // Validação parcial (D-13): itens válidos seguem, inválidos são reportados.
  const errors: IngestError[] = []
  const accepted: Array<{ index: number; data: SaleInput }> = []

  sales.forEach((rawSale, index) => {
    const parsed = saleSchema.safeParse(rawSale)
    if (!parsed.success) {
      errors.push({ index, reason: parsed.error.issues[0]?.message ?? 'Venda inválida' })
    } else {
      accepted.push({ index, data: parsed.data })
    }
  })

  if (accepted.length === 0) {
    return NextResponse.json(
      envelope({ period_ids: [] }, null, 0, errors.length, errors),
      { status: 200 }
    )
  }

  const admin = createAdminClient()

  // Period por mês (D-08 / Pitfall 4): resolvido UMA vez por mês do batch, nunca por item.
  const periodMap = new Map<string, number>()
  const months = Array.from(new Set(accepted.map(a => a.data.sale_date.slice(0, 7))))
  for (const month of months) {
    const [year, mm] = month.split('-').map(Number)
    const periodId = await ensurePeriodForDate(admin, ctx.tenantId, new Date(Date.UTC(year, mm - 1, 1)))
    periodMap.set(month, periodId)
  }

  // sales_records via RPC transacional (D-07, T-7-14) — p_tenant_id SEMPRE de ctx (T-7-02).
  const rows = accepted.map(({ data }) => {
    const month = data.sale_date.slice(0, 7)
    const quantity = data.items?.length
      ? data.items.reduce((sum, item) => sum + (item.qty ?? 1), 0)
      : 1
    return {
      period_id: periodMap.get(month),
      vendor_id: data.vendor_id,
      vendor_name: data.vendor_name ?? '',
      store: data.store ?? '',
      client_id: data.client_id ?? data.order_id,
      client_name: data.client_name ?? '',
      sale_date: data.sale_date,
      valor: data.total,
      quantity,
      order_ref: data.order_id,
    }
  })

  const { error: rpcError } = await admin.rpc('ingest_sales_records', {
    p_tenant_id: ctx.tenantId,
    p_rows: rows,
  })

  if (rpcError) {
    console.error('ingest_sales_records error:', rpcError.message)
    return NextResponse.json(envelope(null, 'Erro ao gravar vendas.', 0, 0, []), { status: 500 })
  }

  const periodIds = Array.from(new Set(periodMap.values()))

  // Custo do catálogo (D-12) — nunca do payload.
  const costMap = new Map<string, { cost_price: number | null; margin_pct: number | null }>()
  const { data: products } = await admin
    .from('products')
    .select('product_code, cost_price, margin_pct')
    .eq('tenant_id', ctx.tenantId)
    .in('period_id', periodIds)

  for (const p of products ?? []) {
    costMap.set(p.product_code as string, {
      cost_price: (p.cost_price as number | null) ?? null,
      margin_pct: (p.margin_pct as number | null) ?? null,
    })
  }

  // sale_items — idempotência nativa via UNIQUE(tenant_id, period_id, order_id, product_code).
  const saleItemRows: Array<Record<string, unknown>> = []
  for (const { data } of accepted) {
    if (!data.items?.length) continue
    const periodId = periodMap.get(data.sale_date.slice(0, 7))!
    for (const item of data.items) {
      if (!item.product_code) continue
      const qty = item.qty ?? 1
      const unitPrice = item.unit_price ?? data.total
      const totalPrice = qty * unitPrice
      const prod = costMap.get(item.product_code)
      const unitCost = prod?.cost_price ?? null

      let totalProfit: number | null = null
      if (prod?.margin_pct != null) {
        totalProfit = totalPrice * Number(prod.margin_pct)
      } else if (unitCost !== null) {
        totalProfit = (unitPrice - Number(unitCost)) * qty
      }

      saleItemRows.push({
        tenant_id: ctx.tenantId,
        period_id: periodId,
        vendor_id: data.vendor_id,
        order_id: data.order_id,
        product_code: item.product_code,
        qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        unit_cost: unitCost,
        total_profit: totalProfit,
      })
    }
  }

  if (saleItemRows.length) {
    const { error: itemsError } = await admin
      .from('sale_items')
      .upsert(saleItemRows, { onConflict: 'tenant_id,period_id,order_id,product_code' })
    if (itemsError) console.error('sale_items upsert error:', itemsError.message)
  }

  // Namespacing de desconhecidos (D-15) — best-effort, nunca falha o request.
  try {
    const { data: knownVendors } = await admin
      .from('goals')
      .select('vendor_id')
      .eq('tenant_id', ctx.tenantId)
      .in('period_id', periodIds)
    const knownVendorSet = new Set((knownVendors ?? []).map(v => v.vendor_id as string))

    const mappingRows: Array<Record<string, unknown>> = []
    const seenVendors = new Set<string>()
    const seenProducts = new Set<string>()

    for (const { data } of accepted) {
      if (!knownVendorSet.has(data.vendor_id) && !seenVendors.has(data.vendor_id)) {
        seenVendors.add(data.vendor_id)
        mappingRows.push({
          tenant_id: ctx.tenantId,
          source_system: 'api',
          source_id: data.vendor_id,
          entity_type: 'vendor',
          canonical_id: null,
        })
      }
      for (const item of data.items ?? []) {
        if (item.product_code && !costMap.has(item.product_code) && !seenProducts.has(item.product_code)) {
          seenProducts.add(item.product_code)
          mappingRows.push({
            tenant_id: ctx.tenantId,
            source_system: 'api',
            source_id: item.product_code,
            entity_type: 'product',
            canonical_id: null,
          })
        }
      }
    }

    if (mappingRows.length) {
      await admin.from('connector_id_mappings').upsert(mappingRows, {
        onConflict: 'tenant_id,source_system,entity_type,source_id',
        ignoreDuplicates: true,
      })
    }
  } catch (err: unknown) {
    console.error('connector_id_mappings mapping error (best-effort):', err)
  }

  return NextResponse.json(
    envelope({ period_ids: periodIds }, null, accepted.length, errors.length, errors),
    { status: 200 }
  )
}
