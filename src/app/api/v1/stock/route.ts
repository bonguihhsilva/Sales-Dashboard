import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyContext, hasScope } from '@/lib/auth/apiKey'
import { stockItemSchema, type StockItemInput } from '@/lib/validation/ingest'
import { apiV1RateLimiter } from '@/lib/ratelimit'
import { createAdminClient } from '@/lib/supabase/admin'

// Mesmo teto do Plan 03 (/api/v1/sales) — abaixo do limite de 4.5MB das
// Serverless Functions da Vercel (Open Question 3 do research).
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Task 2: POST /api/v1/stock ──────────────────────────────────────────────
// Ingest de snapshot diário de posição de estoque, agregado por tenant
// (D-09..D-12), autenticado por API key. Upsert por (tenant, produto, dia):
// último POST do dia vence (D-11). Sem custo (D-12) e sem loja (D-10) no write.
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

  if (!hasScope(ctx, 'stock:write')) {
    return NextResponse.json(
      envelope(null, 'API key sem permissão para o escopo stock:write.', 0, 0, []),
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

  const items = (body as { items?: unknown } | null)?.items
  if (!Array.isArray(items)) {
    return NextResponse.json(
      envelope(null, 'Campo "items" deve ser um array de itens de estoque.', 0, 0, []),
      { status: 400 }
    )
  }
  if (items.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      envelope(null, `Batch excede ${MAX_BATCH_SIZE} itens.`, 0, 0, []),
      { status: 400 }
    )
  }

  // Validação parcial (D-13): itens válidos seguem, inválidos são reportados.
  const errors: IngestError[] = []
  const accepted: Array<{ index: number; data: StockItemInput }> = []

  items.forEach((rawItem, index) => {
    const parsed = stockItemSchema.safeParse(rawItem)
    if (!parsed.success) {
      errors.push({ index, reason: parsed.error.issues[0]?.message ?? 'Item inválido' })
    } else {
      accepted.push({ index, data: parsed.data })
    }
  })

  const snapshotDate = todayISO()

  if (accepted.length === 0) {
    return NextResponse.json(
      envelope({ snapshot_date: snapshotDate }, null, 0, errors.length, errors),
      { status: 200 }
    )
  }

  const admin = createAdminClient()

  // Rows de stock_snapshots — tenant_id SEMPRE de ctx (T-7-02).
  // NUNCA incluir custo (D-12) nem loja (D-10).
  const rows = accepted.map(({ data }) => ({
    tenant_id: ctx.tenantId,
    product_code: data.product_code,
    snapshot_date: data.snapshot_date ?? snapshotDate,
    quantity: data.quantity,
    source: 'api',
  }))

  const { error: upsertError } = await admin
    .from('stock_snapshots')
    .upsert(rows, { onConflict: 'tenant_id,product_code,snapshot_date' })

  if (upsertError) {
    console.error('stock_snapshots upsert error:', upsertError.message)
    return NextResponse.json(envelope(null, 'Erro ao gravar snapshot de estoque.', 0, 0, []), {
      status: 500,
    })
  }

  // Namespacing de produtos (D-15) — best-effort, nunca falha o request.
  // ignoreDuplicates: true torna o upsert idempotente para produtos já conhecidos.
  try {
    const seenProducts = new Set<string>()
    const mappingRows: Array<Record<string, unknown>> = []

    for (const { data } of accepted) {
      if (seenProducts.has(data.product_code)) continue
      seenProducts.add(data.product_code)
      mappingRows.push({
        tenant_id: ctx.tenantId,
        source_system: 'api',
        source_id: data.product_code,
        entity_type: 'product',
        canonical_id: null,
      })
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
    envelope({ snapshot_date: snapshotDate }, null, accepted.length, errors.length, errors),
    { status: 200 }
  )
}
