import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
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
