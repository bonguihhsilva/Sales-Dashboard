export const dynamic = 'force-dynamic'

import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RHClient from './RHClient'
import { PageHeader } from '@/components/ui'

export default async function RHPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')
  
  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) redirect('/vendedor/meu-resultado')

  const admin = createAdminClient()

  let query = admin.from('profiles')
    .select('id, name, role, ativo')
    .order('name')

  if (profile.tenant_id) {
    query = query.eq('tenant_id', profile.tenant_id)
  }

  const { data: profiles } = await query
    
  const userIds = profiles ? profiles.map(p => p.id) : []

  const [
    { data: freeDaysRaw },
    { data: absencesRaw },
    { data: vacationsRaw },
    { data: permissionsRaw },
    { data: delaysRaw },
  ] = await Promise.all([
    admin.from('hr_free_days').select('*, profiles!user_id(name)').in('user_id', userIds).order('created_at', { ascending: false }),
    admin.from('hr_absences').select('*, profiles!user_id(name)').in('user_id', userIds).order('absence_date', { ascending: false }),
    admin.from('hr_vacations').select('*, profiles!user_id(name)').in('user_id', userIds).order('start_date', { ascending: false }),
    admin.from('hr_permissions').select('*, profiles!user_id(name)').in('user_id', userIds).order('created_at', { ascending: false }),
    admin.from('hr_delays').select('*, profiles!user_id(name)').in('user_id', userIds).order('delay_date', { ascending: false }),
  ])

  function mapName<T extends Record<string, unknown>>(rows: T[] | null) {
    return (rows ?? []).map(r => ({
      ...r,
      user_name: (r.profiles as { name?: string } | null)?.name ?? '',
      profiles: undefined,
    }))
  }

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-10">
        <PageHeader
          title="Recursos Humanos"
          subtitle="Gerencie férias, folgas, ausências e permissões da equipe de vendas."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'RH' }]}
        />
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5">
        <RHClient
          profiles={(profiles ?? []).map((p: any) => ({ ...p, active: p.ativo }))}
          freeDays={mapName(freeDaysRaw) as Parameters<typeof RHClient>[0]['freeDays']}
          absences={mapName(absencesRaw) as Parameters<typeof RHClient>[0]['absences']}
          vacations={mapName(vacationsRaw) as Parameters<typeof RHClient>[0]['vacations']}
          permissions={mapName(permissionsRaw) as Parameters<typeof RHClient>[0]['permissions']}
          delays={mapName(delaysRaw) as any}
        />
      </div>
    </div>
  )
}

