import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import MetasClient from './MetasClient'

export const dynamic = 'force-dynamic'

export default async function MetasPage() {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  let currentProfile = profile
  const jwtRole = (user.app_metadata?.role as string | undefined) ?? 'vendedor'
  if (!currentProfile) {
    currentProfile = { role: jwtRole }
  }

  const effectiveRole = currentProfile.role || jwtRole
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/vendedor/meu-resultado')
  }

  const { data: periods } = await supabase.from('periods').select('*').order('id', { ascending: false })
  const { data: goals }   = await supabase.from('goals').select('*').order('vendor_name')

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page gap-6">
      <PageHeader
        title="Gestão de Períodos e Metas"
        subtitle="Configure os objetivos de venda de cada vendedor por período"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Metas' }
        ]}
      />
      <div>
        <MetasClient periods={periods ?? []} goals={goals ?? []} />
      </div>
    </div>
  )
}


