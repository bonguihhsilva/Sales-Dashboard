import { NextResponse } from 'next/server'
import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  // getTenantContext resolve o tenant respeitando masquerade do super_admin (cookie active_tenant_id)
  const { profile } = await getTenantContext()
  if (!profile?.tenant_id) {
    return NextResponse.json({ error: 'Organização não associada ao usuário' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: periods } = await admin
    .from('periods')
    .select('id, label, year, month')
    .eq('tenant_id', profile.tenant_id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return NextResponse.json(periods ?? [])
}

