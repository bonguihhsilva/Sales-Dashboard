export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RHClient from './RHClient'

export default async function RHPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (profile?.role !== 'adm' && profile?.role !== 'gerente') redirect('/meu-resultado')

  const admin = createAdminClient()

  const { data: profiles } = await admin.from('profiles')
    .select('id, name, role, ativo')
    .eq('tenant_id', profile.tenant_id)
    .order('name')
    
  const userIds = profiles ? profiles.map(p => p.id) : []

  const [
    { data: freeDaysRaw },
    { data: absencesRaw },
    { data: vacationsRaw },
    { data: permissionsRaw },
  ] = await Promise.all([
    admin.from('hr_free_days').select('*, profiles!user_id(name)').in('user_id', userIds).order('created_at', { ascending: false }),
    admin.from('hr_absences').select('*, profiles!user_id(name)').in('user_id', userIds).order('absence_date', { ascending: false }),
    admin.from('hr_vacations').select('*, profiles!user_id(name)').in('user_id', userIds).order('start_date', { ascending: false }),
    admin.from('hr_permissions').select('*, profiles!user_id(name)').in('user_id', userIds).order('created_at', { ascending: false }),
  ])

  function mapName<T extends Record<string, unknown>>(rows: T[] | null) {
    return (rows ?? []).map(r => ({
      ...r,
      user_name: (r.profiles as { name?: string } | null)?.name ?? '',
      profiles: undefined,
    }))
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      {/* Top App Bar (Google Style) */}
      <div style={{
        padding: '1rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', zIndex: 10, position: 'sticky', top: 0
      }}>
        <div className="flex items-center gap-4">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Recursos Humanos
          </h1>
        </div>
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <RHClient
          profiles={(profiles ?? []).map((p: any) => ({ ...p, active: p.ativo }))}
          freeDays={mapName(freeDaysRaw) as Parameters<typeof RHClient>[0]['freeDays']}
          absences={mapName(absencesRaw) as Parameters<typeof RHClient>[0]['absences']}
          vacations={mapName(vacationsRaw) as Parameters<typeof RHClient>[0]['vacations']}
          permissions={mapName(permissionsRaw) as Parameters<typeof RHClient>[0]['permissions']}
        />
      </div>
    </div>
  )
}
