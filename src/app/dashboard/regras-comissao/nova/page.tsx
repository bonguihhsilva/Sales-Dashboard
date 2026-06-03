import { getTenantContext } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { LogoutButton, PageHeader } from '@/components/ui'
import RegraFormClient from '../RegraFormClient'

export const dynamic = 'force-dynamic'

export default async function NovaRegraPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  let finalTenant = profile.tenant_id

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <PageHeader
          title="Nova Regra de Comissão"
          subtitle="Crie uma nova regra de comissão ou bônus."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Regras de Comissão', href: '/dashboard/regras-comissao' },
            { label: 'Nova' },
          ]}
          actions={<LogoutButton />}
        />
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <RegraFormClient tenantId={finalTenant} />
      </div>
    </div>
  )
}


