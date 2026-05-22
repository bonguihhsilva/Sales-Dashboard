import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { canInvite, isValidRole, setUserRole } from '@/lib/auth/roles'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  const callerRole = user.app_metadata?.role as string | undefined
  if (!canInvite(callerRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { userId, name, role, store, ativo } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId obrigatorio' }, { status: 400 })
  }
  if (role !== undefined && !isValidRole(role)) {
    return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Se o role mudou, usar setUserRole (atualiza app_metadata + profiles juntos)
  if (role !== undefined) {
    const roleResult = await setUserRole(admin, userId, role as UserRole)
    if (roleResult.error) {
      return NextResponse.json({ error: roleResult.error }, { status: 400 })
    }
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
