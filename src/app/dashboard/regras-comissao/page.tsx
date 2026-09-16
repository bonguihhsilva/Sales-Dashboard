import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import RegrasClient from './RegrasClient'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function RegrasComissaoPage() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const effectiveRole = profile.role
  if (!['adm', 'gerente', 'super_admin'].includes(effectiveRole)) {
    redirect('/dashboard')
  }

  const adminDb = createAdminClient()
  let { data: regras } = await adminDb
    .from('regras_comissao')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('prioridade', { ascending: true })
    .order('criado_em', { ascending: false })

  // Se o tenant ainda não possui nenhuma regra cadastrada, inicializa com as regras pré-programadas (Metas 1, 2 e 3)
  if (!regras || regras.length === 0) {
    const defaultRules = [
      {
        tenant_id: profile.tenant_id,
        nome: 'Bônus 1ª Meta',
        descricao: 'Bônus fixo concedido aos vendedores que atingirem a 1ª Meta do período.',
        prioridade: 3,
        ativo: true,
        escopo: 'coletivo',
        vendor_id: null,
        condicoes: [{ tipo: 'atingimento_meta', meta: 'meta1', comparador: '>=' }],
        acao: { tipo: 'bonus_fixo', valor: 100 },
      },
      {
        tenant_id: profile.tenant_id,
        nome: 'Bônus 2ª Meta',
        descricao: 'Bônus fixo concedido aos vendedores que atingirem a 2ª Meta do período (substitui a 1ª Meta).',
        prioridade: 2,
        ativo: true,
        escopo: 'coletivo',
        vendor_id: null,
        condicoes: [{ tipo: 'atingimento_meta', meta: 'meta2', comparador: '>=' }],
        acao: { tipo: 'bonus_fixo', valor: 150 },
      },
      {
        tenant_id: profile.tenant_id,
        nome: 'Bônus 3ª Meta (Super Meta)',
        descricao: 'Bônus fixo máximo concedido aos vendedores que superarem a 3ª Meta do período (substitui as anteriores).',
        prioridade: 1,
        ativo: true,
        escopo: 'coletivo',
        vendor_id: null,
        condicoes: [{ tipo: 'atingimento_meta', meta: 'meta3', comparador: '>=' }],
        acao: { tipo: 'bonus_fixo', valor: 200 },
      },
    ]

    const { data: seeded, error: seedError } = await adminDb
      .from('regras_comissao')
      .insert(defaultRules)
      .select('*')

    if (!seedError && seeded) {
      regras = seeded
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col p-margin-page">
      {/* Hero Header */}
      <div className="mb-8">
        <PageHeader
          title="Regras de Comissão e Metas"
          subtitle="Gerencie regras coletivas e individuais, bônus por cliente, metas por marca e ative/desative as metas 1, 2 e 3 pré-programadas."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Regras de Comissão' }]}
        />
      </div>

      <div className="flex-1 glass-card rounded-2xl p-6 border border-white/5">
        <RegrasClient regras={regras || []} tenantId={profile.tenant_id} />
      </div>
    </div>
  )
}
