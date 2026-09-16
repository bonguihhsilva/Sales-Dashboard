import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'

export const dynamic = 'force-dynamic'

type Acao =
  | { tipo: 'comissao_percentual' | 'bonus_fixo'; valor?: number }
  | { tipo: 'comissao_percentual_marca'; marca?: string; valor?: number }
  | { tipo: 'bonus_por_unidade'; unidade?: 'cliente_ativo' | 'cliente_reativado'; valor_por_unidade?: number }

type Regra = {
  id: string
  nome: string
  descricao: string
  escopo?: string | null
  vendor_id?: string | null
  acao: Acao
  prioridade: number
}

export default async function VendedorRegrasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let vendorId: string | null = null
  let tenantId: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, vendor_id')
      .eq('id', user.id)
      .single()
    vendorId = profile?.vendor_id || null
    tenantId = profile?.tenant_id || null
  }

  let query = supabase
    .from('regras_comissao')
    .select('*')
    .eq('ativo', true)
    .order('prioridade', { ascending: true })

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  const { data: rawRegras } = await query

  // Filtra apenas regras coletivas OU individuais direcionadas ao vendedor logado
  const filteredRegras = (rawRegras ?? []).filter(r => {
    const isIndividual = r.escopo === 'individual' || (r.vendor_id != null && r.vendor_id.trim() !== '')
    if (!isIndividual) return true
    return vendorId ? r.vendor_id === vendorId : true
  })

  const regras = filteredRegras.length ? filteredRegras : [
    {
      id: '1',
      nome: 'Comissão Base sobre Vendas',
      descricao: 'Percentual aplicado sobre o total bruto vendido no período, calculado ao final do mês.',
      acao: { tipo: 'comissao_percentual', valor: 3.5 },
      prioridade: 1,
      escopo: 'coletivo',
    },
    {
      id: '2',
      nome: 'Bônus 1ª Meta',
      descricao: 'Bônus fixo concedido ao atingir a primeira meta do mês. Acumulável com a comissão base.',
      acao: { tipo: 'bonus_fixo', valor: 300 },
      prioridade: 2,
      escopo: 'coletivo',
    },
    {
      id: '3',
      nome: 'Bônus 2ª Meta',
      descricao: 'Bônus adicional ao superar a segunda meta. Substitui o bônus da 1ª meta.',
      acao: { tipo: 'bonus_fixo', valor: 600 },
      prioridade: 3,
      escopo: 'coletivo',
    },
    {
      id: '4',
      nome: 'Bônus 3ª Meta (Super Meta)',
      descricao: 'Bônus máximo ao atingir a terceira meta do período. Exige consistência de alto desempenho.',
      acao: { tipo: 'bonus_fixo', valor: 1000 },
      prioridade: 4,
      escopo: 'coletivo',
    },
  ]

  const ICONS: Record<string, string> = {
    comissao_percentual: '📈',
    bonus_fixo: '🏆',
    comissao_percentual_marca: '🏷️',
    bonus_por_unidade: '👥',
  }

  const COLORS: Record<string, { bg: string; text: string; border: string }> = {
    comissao_percentual: { bg: '#2563eb22', text: '#2563eb', border: 'rgba(37,99,235,0.3)' },
    bonus_fixo: { bg: '#f5a74222', text: '#f5a742', border: 'rgba(245,167,66,0.3)' },
    comissao_percentual_marca: { bg: '#10b98122', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
    bonus_por_unidade: { bg: '#8b5cf622', text: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  }

  function formatarValorAcao(a: Acao): string {
    if (!a?.tipo) return 'Personalizada'
    switch (a.tipo) {
      case 'comissao_percentual':
        return `${a.valor}% sobre vendas`
      case 'bonus_fixo':
        return `R$ ${Number(a.valor || 0).toLocaleString('pt-BR')} de bônus`
      case 'comissao_percentual_marca':
        return `${a.valor}% na marca ${a.marca || '—'}`
      case 'bonus_por_unidade':
        return `R$ ${Number(a.valor_por_unidade || 0).toLocaleString('pt-BR')} / ${a.unidade === 'cliente_reativado' ? 'cliente reativado' : 'cliente ativo'}`
      default:
        return 'Personalizada'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 2.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <PageHeader
            title="Regras de Comissão"
            subtitle="Entenda como suas comissões e bônus são calculados neste mês."
            breadcrumbs={[
              { label: 'Meu Resultado', href: '/vendedor/meu-resultado' },
              { label: 'Regras' },
            ]}
          />
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(regras as Regra[]).map((regra, i) => {
            const tipo = regra.acao?.tipo || 'bonus_fixo'
            const col = COLORS[tipo] || COLORS['bonus_fixo']
            const icon = ICONS[tipo] || '⭐'
            const valorFormatado = formatarValorAcao(regra.acao)
            const isIndividual = regra.escopo === 'individual' || Boolean(regra.vendor_id)

            return (
              <div key={regra.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${col.border}`,
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
              }}>
                {/* Ícone + número */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '44px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: col.bg, border: `1px solid ${col.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    #{i + 1}
                  </span>
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{regra.nome}</h3>
                      {isIndividual && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-jetbrains), monospace',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          fontWeight: 700,
                        }}>
                          Individual
                        </span>
                      )}
                    </div>
                    <span style={{
                      background: col.bg, color: col.text, border: `1px solid ${col.border}`,
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '0.75rem', fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 700,
                    }}>
                      {valorFormatado}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                    {regra.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota de rodapé */}
        <div style={{
          marginTop: '2rem', padding: '1rem 1.5rem', borderRadius: '10px',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          fontSize: '0.75rem', fontFamily: 'var(--font-jetbrains), monospace', color: 'var(--muted)', lineHeight: 1.6,
        }}>
          ℹ️ As regras acima são definidas pela gestão e podem variar conforme o período. Em caso de dúvidas, consulte seu gerente.
        </div>

      </div>
    </div>
  )
}
