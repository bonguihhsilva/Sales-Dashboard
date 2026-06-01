import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await createServerClient()
  const { data: { user } } = await caller.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { data: profile } = await caller.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params

  // Validar se a permissão pertence ao tenant do administrador logado
  const { data: permissionCheck } = await caller
    .from('hr_permissions')
    .select('id, user_id')
    .eq('id', id)
    .single()
  
  if (!permissionCheck) {
    return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 })
  }

  const { data: employeeProfile } = await caller
    .from('profiles')
    .select('tenant_id')
    .eq('id', permissionCheck.user_id)
    .single()

  if (!employeeProfile || employeeProfile.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Permissão não pertence à sua organização' }, { status: 403 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const body: { status: 'approved' | 'denied' } = await req.json()

  const { data: permission, error } = await admin
    .from('hr_permissions')
    .update({
      status: body.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !permission) {
    return NextResponse.json(
      { error: 'Permission not found or not in pending status' },
      { status: 404 }
    )
  }

  return NextResponse.json(permission)
}

