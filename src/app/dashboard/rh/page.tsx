export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/ui'
import RHClient from './RHClient'

export default async function RHPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'adm') redirect('/meu-resultado')

  const admin = createAdminClient()

  const [
    { data: profiles },
    { data: freeDaysRaw },
    { data: absencesRaw },
    { data: vacationsRaw },
    { data: permissionsRaw },
  ] = await Promise.all([
    admin.from('profiles').select('id, name, role, active').order('name'),
    admin.from('hr_free_days').select('*, profiles!user_id(name)').order('created_at', { ascending: false }),
    admin.from('hr_absences').select('*, profiles!user_id(name)').order('absence_date', { ascending: false }),
    admin.from('hr_vacations').select('*, profiles!user_id(name)').order('start_date', { ascending: false }),
    admin.from('hr_permissions').select('*, profiles!user_id(name)').order('created_at', { ascending: false }),
  ])

  function mapName<T extends Record<string, unknown>>(rows: T[] | null) {
    return (rows ?? []).map(r => ({
      ...r,
      user_name: (r.profiles as { name?: string } | null)?.name ?? '',
      profiles: undefined,
    }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <a href="/dashboard" style={{
            fontSize: '0.72rem', fontFamily: 'DM Mono, monospace',
            color: 'var(--muted)', textDecoration: 'none',
          }}>
            ← Voltar ao dashboard
          </a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            RH <span style={{ color: 'var(--accent)' }}>// Recursos Humanos</span>
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div style={{ padding: '1.5rem 2.5rem' }}>
        <RHClient
          profiles={profiles ?? []}
          freeDays={mapName(freeDaysRaw) as Parameters<typeof RHClient>[0]['freeDays']}
          absences={mapName(absencesRaw) as Parameters<typeof RHClient>[0]['absences']}
          vacations={mapName(vacationsRaw) as Parameters<typeof RHClient>[0]['vacations']}
          permissions={mapName(permissionsRaw) as Parameters<typeof RHClient>[0]['permissions']}
        />
      </div>
    </div>
  )
}
