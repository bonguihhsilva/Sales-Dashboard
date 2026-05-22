import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { canInvite } from '@/lib/auth/roles'

export async function POST(req: NextRequest) {
  // Caller: mesmos roles que podem gerir usuarios (adm|gerente|super_admin)
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  const callerRole = user.app_metadata?.role as string | undefined
  if (!canInvite(callerRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { userId, ativo } = await req.json()
  if (!userId || typeof ativo !== 'boolean') {
    return NextResponse.json({ error: 'userId e ativo (boolean) obrigatorios' }, { status: 400 })
  }

  // Caller nao pode desativar a si mesmo
  if (userId === user.id) {
    return NextResponse.json({ error: 'Voce nao pode desativar a si mesmo' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ativo=false -> banir (invalida refresh tokens). ativo=true -> remover ban.
  // O parametro correto do SDK JS e ban_duration string (D-09 / RESEARCH).
  const banDuration = ativo ? 'none' : '876600h' // 'none' remove o ban; 876600h ~= 100 anos
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  })
  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 400 })
  }

  // Sincronizar profiles.ativo
  const { error: profError } = await admin
    .from('profiles')
    .update({ ativo })
    .eq('id', userId)
  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, ativo })
}
