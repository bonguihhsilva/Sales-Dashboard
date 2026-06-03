import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { LogoutButton, PageHeader } from '@/components/ui'
import RegraFormClient from '../RegraFormClient'

export const dynamic = 'force-dynamic'

export default async function EditarRegraPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  let finalTenant = profile.tenant_id

  const { id } = await params
  const adminDb = createAdminClient()
  const { data: regra } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('id', id)
    .single()

  if (!regra) {
    redirect('/dashboard/regras-comissao')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title={`Editar Regra: ${regra.nome}`}
          subtitle="Edite os parâmetros desta regra de comissão."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Regras de Comissão', href: '/dashboard/regras-comissao' },
            { label: 'Editar' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <RegraFormClient regraInicial={regra} tenantId={finalTenant} />
      </div>
    </div>
  )
}
