import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { canInvite } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  const callerRole = profile.role
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

  const admin = createAdminClient()

  // Prevent disabling users outside caller's tenant
  if (profile.role !== 'super_admin') {
    const { data: targetUser } = await admin.from('profiles').select('tenant_id').eq('id', userId).single()
    if (!targetUser || targetUser.tenant_id !== profile.tenant_id) {
       return NextResponse.json({ error: 'Usuario nao pertence a esta empresa' }, { status: 403 })
    }
  }

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
