import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import MeuRHTab from '../meu-resultado/MeuRHTab'
import type { HRFreeDay, HRAbsence, HRVacation, HRPermission } from '@/types'

export const dynamic = 'force-dynamic'

export default async function VendedorRHPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')
  const userId = user?.id
  if (!userId) redirect('/login')

  const [
    { data: hrFreeDays },
    { data: hrAbsences },
    { data: hrVacations },
    { data: hrPermissions },
    { data: hrDelays },
  ] = await Promise.all([
    supabase.from('hr_free_days').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('hr_absences').select('*').eq('user_id', userId).order('absence_date', { ascending: false }),
    supabase.from('hr_vacations').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    supabase.from('hr_permissions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('hr_delays').select('*').eq('user_id', userId).order('delay_date', { ascending: false }),
  ])

  const mockFreeDays = hrFreeDays ?? []
  
  const mockAbsences = hrAbsences ?? []
  
  const mockVacations = hrVacations ?? []

  const mockPermissions = hrPermissions ?? []

  const mockDelays = hrDelays ?? []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <PageHeader
          title="Recursos Humanos"
          subtitle="Acompanhe suas solicitações, atestados e férias."
          breadcrumbs={[
            { label: 'Meu Resultado', href: '/vendedor/meu-resultado' },
            { label: 'RH' },
          ]}
        />
      </div>

      <MeuRHTab
        freeDays={mockFreeDays as HRFreeDay[]}
        absences={mockAbsences as HRAbsence[]}
        vacations={mockVacations as HRVacation[]}
        permissions={mockPermissions as HRPermission[]}
        delays={mockDelays as any[]}
      />
    </div>
  )
}
