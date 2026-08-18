import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { rateLimiter, getClientIp } from '@/lib/ratelimit'

// Rota de auto-servico: usuario edita apenas os proprios dados pessoais
// (telefones, data de nascimento). Nunca aceita role/store/vendor_id/ativo —
// esses continuam exclusivos de /api/admin/update-user (C-05).
const phoneSchema = z.string().trim().max(30).nullable()
const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida (formato AAAA-MM-DD)')
  .nullable()

const bodySchema = z.object({
  telefone_corporativo: phoneSchema.optional(),
  telefone_pessoal: phoneSchema.optional(),
  data_nascimento: dateSchema.optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { success } = await rateLimiter.limit(ip)
  if (!success) return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const rawBody = await req.json()
  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  const { telefone_corporativo, telefone_pessoal, data_nascimento } = parsed.data
  if (telefone_corporativo !== undefined) patch.telefone_corporativo = telefone_corporativo || null
  if (telefone_pessoal !== undefined) patch.telefone_pessoal = telefone_pessoal || null
  if (data_nascimento !== undefined) patch.data_nascimento = data_nascimento || null

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: true })
  }

  // RLS garante que o update so afeta a propria linha (id = auth.uid()) —
  // sem client admin, sem risco de editar outro usuario.
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
