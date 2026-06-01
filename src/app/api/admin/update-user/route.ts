import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { canInvite, isValidRole, setUserRole, ASSIGNABLE_ROLES } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'

import { sanitizeString } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()
  
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  const callerRole = profile.role
  if (!canInvite(callerRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const userId = body.userId
  const name = body.name ? sanitizeString(body.name) : undefined
  const role = body.role ? sanitizeString(body.role) : undefined
  const store = body.store ? sanitizeString(body.store) : undefined
  const ativo = body.ativo

  if (!userId) {
    return NextResponse.json({ error: 'userId obrigatorio' }, { status: 400 })
  }
  if (role !== undefined) {
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
    }
    // Apenas super_admin pode atribuir a role super_admin
    if (role === 'super_admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acesso negado: Apenas super administradores podem atribuir esta role.' }, { status: 403 })
    }
    // Usuários normais só podem gerenciar papéis atribuíveis
    if (profile.role !== 'super_admin' && !ASSIGNABLE_ROLES.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Acesso negado: Esta role não é atribuível via interface.' }, { status: 403 })
    }
  }

  const admin = createAdminClient()

  // Prevent updating users outside caller's tenant
  if (profile.role !== 'super_admin') {
    const { data: targetUser } = await admin.from('profiles').select('tenant_id').eq('id', userId).single()
    if (!targetUser || targetUser.tenant_id !== profile.tenant_id) {
       return NextResponse.json({ error: 'Usuario nao pertence a esta empresa' }, { status: 403 })
    }
  }

  // Se o role mudou, usar setUserRole (atualiza app_metadata + profiles juntos)
  if (role !== undefined) {
    const roleResult = await setUserRole(admin, userId, role as UserRole)
    if (roleResult.error) {
      return NextResponse.json({ error: roleResult.error }, { status: 400 })
    }
    // Força invalidação dos JWTs e refresh tokens antigos para o middleware pegar a nova role
    await admin.auth.admin.signOut(userId, 'others')
  }

  // Demais campos (name, store, ativo) — update direto no profile
  const patch: Record<string, unknown> = {}
  if (name !== undefined) patch.name = name
  if (store !== undefined) patch.store = store
  if (ativo !== undefined) patch.ativo = ativo
  if (Object.keys(patch).length > 0) {
    const { error: profError } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', userId)
    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
}
