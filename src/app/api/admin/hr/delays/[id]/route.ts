import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const caller = await createServerClient()
    const { data: { user } } = await caller.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: profile } = await caller.from('profiles').select('role, tenant_id').eq('id', user.id).single()
    if (!profile || !['adm', 'gerente', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()

    // Validar se o atraso pertence ao tenant do administrador logado
    const { data: delay } = await caller
      .from('hr_delays')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!delay) {
      return NextResponse.json({ error: 'Atraso não encontrado' }, { status: 404 })
    }

    const { data: employeeProfile } = await caller
      .from('profiles')
      .select('tenant_id')
      .eq('id', delay.user_id)
      .single()

    if (!employeeProfile || employeeProfile.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: 'Atraso não pertence à sua organização' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('hr_delays')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

