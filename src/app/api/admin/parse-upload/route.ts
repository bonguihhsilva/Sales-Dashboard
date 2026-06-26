import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseUploadBuffer } from '@/lib/server-parser'
import { detectPeriodFromTransactions } from '@/lib/parser'
import { strictRateLimiter } from '@/lib/ratelimit'
import { detectFileSystem } from '@/lib/fingerprint'

export async function POST(req: NextRequest) {
  // Rate limiter
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await strictRateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  // Auth check
  const { user, profile } = await getTenantContext()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  
  if (!['adm', 'gerente', 'super_admin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // Limite de 10MB
      return NextResponse.json({ error: 'Arquivo excede o limite de segurança de 10MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse
    const transactions = await parseUploadBuffer(buffer, file.name)

    // Detect period
    const detected = detectPeriodFromTransactions(transactions)

    // Detect source system by fingerprint (null → UploadModal mostra dropdown D-06)
    const detectedSystem = detectFileSystem(buffer, file.name)

    // Enrich with sale_items when product_codes are available and period exists in DB
    if (
      profile?.tenant_id &&
      detected &&
      transactions.some(t => t.product_code)
    ) {
      try {
        const adminDb = createAdminClient()

        // Find the period_id in DB for the detected period
        const { data: periodRow } = await adminDb
          .from('periods')
          .select('id')
          .eq('tenant_id', profile.tenant_id)
          .eq('year', detected.year)
          .eq('month', detected.month)
          .single()

        if (periodRow?.id) {
          const { data: products } = await adminDb
            .from('products')
            .select('product_code, cost_price, margin_pct')
            .eq('tenant_id', profile.tenant_id)
            .eq('period_id', periodRow.id)

          const costMap = new Map((products ?? []).map(p => [p.product_code as string, p]))

          const saleItems = transactions
            .filter(t => t.product_code && t.order_ref)
            .map(t => {
              const prod = costMap.get(t.product_code!)
              const total_price = t.valor
              const unit_cost = prod?.cost_price ?? t.unit_cost ?? null
              const unit_price_val = t.unit_price ?? t.valor

              let total_profit: number | null = null
              if (prod?.margin_pct != null) {
                total_profit = total_price * Number(prod.margin_pct)
              } else if (unit_cost !== null) {
                total_profit = (unit_price_val - Number(unit_cost)) * t.quantity
              } else if (t.margin_pct != null) {
                total_profit = total_price * t.margin_pct
              }

              return {
                tenant_id:    profile.tenant_id!,
                period_id:    periodRow.id as number,
                vendor_id:    t.vendor_id,
                order_id:     t.order_ref,
                product_code: t.product_code!,
                qty:          t.quantity,
                unit_price:   unit_price_val,
                total_price,
                unit_cost,
                total_profit,
              }
            })
            .filter(i => i.total_price > 0)

          if (saleItems.length) {
            await adminDb
              .from('sale_items')
              .upsert(saleItems, { onConflict: 'tenant_id,period_id,order_id,product_code' })
          }
        }
      } catch {
        // sale_items enrichment is best-effort — don't fail the parse response
      }
    }

    return NextResponse.json({
      transactions,
      detected,
      detected_system: detectedSystem,
    })
  } catch (error: any) {
    console.error('Parse upload error:', error)
    return NextResponse.json({ error: error.message || 'Falha ao processar arquivo' }, { status: 500 })
  }
}
