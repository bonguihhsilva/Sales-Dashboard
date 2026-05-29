import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const mockFreeDays = hrFreeDays?.length ? hrFreeDays : [
    { id: '1', user_id: userId, issued_at: '2026-05-10', expires_at: '2026-11-10', status: 'available', used_at: null, notes: 'Bônus de meta batida' },
    { id: '2', user_id: userId, issued_at: '2026-03-01', expires_at: '2026-09-01', status: 'used', used_at: '2026-04-15', notes: 'Folga compensatória' },
  ]
  
  const mockAbsences = hrAbsences?.length ? hrAbsences : [
    { id: '1', user_id: userId, absence_date: '2026-04-15', type: 'deduct_free_day', free_day_id: '2', notes: 'Desconto por folga' }
  ]
  
  const mockVacations = hrVacations?.length ? hrVacations : [
    { id: '1', user_id: userId, start_date: '2026-12-20', end_date: '2027-01-10', notes: 'Férias de fim de ano' }
  ]

  const mockPermissions = hrPermissions?.length ? hrPermissions : [
    { id: '1', user_id: userId, type: 'medical_certificate', requested_date: '2026-05-20', status: 'approved', notes: 'Atestado de 2 dias' },
    { id: '2', user_id: userId, type: 'appointment', requested_date: '2026-06-05', status: 'pending', notes: 'Consulta oftalmologista' },
  ]

  const mockDelays = hrDelays?.length ? hrDelays : [
    { id: '1', user_id: userId, delay_date: '2026-05-18', delay_minutes: 45, status: 'pending' },
    { id: '2', user_id: userId, delay_date: '2026-04-10', delay_minutes: 20, status: 'justified', justification: 'Trânsito' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', background: '#2563eb', borderRadius: '6px', padding: '3px 10px', marginBottom: '6px' }}>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>GDS - RH</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recursos Humanos</h1>
        <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', marginTop: '4px' }}>
          Acompanhe suas solicitações, atestados e férias.
        </p>
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
