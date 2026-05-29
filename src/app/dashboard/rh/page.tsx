export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RHClient from './RHClient'

export default async function RHPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // if (!user) redirect('/login')
  
  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  
  let currentProfile = profile
  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (!currentProfile) {
    currentProfile = { role: jwtRole, tenant_id: user.id }
  }

  const effectiveRole = currentProfile.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) redirect('/vendedor/meu-resultado')

  const admin = createAdminClient()

  const { data: profiles } = await admin.from('profiles')
    .select('id, name, role, ativo')
    .eq('tenant_id', currentProfile.tenant_id!)
    .order('name')
    
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
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
            Recursos Humanos
          </h1>
          <p className="text-on-surface-variant max-w-2xl">Gerencie férias, folgas, ausências e permissões da equipe de vendas.</p>
        </div>
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

