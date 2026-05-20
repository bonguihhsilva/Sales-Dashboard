import { createClient } from '@/lib/supabase/server'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'

export default async function ClientsTab({
  periodId,
  vendorId,
}: {
  periodId: number
  vendorId: string | null
}) {
  const supabase = await createClient()

  let query = supabase
    .from('client_portfolio')
    .select('*')
    .eq('period_id', periodId)
    .order('total_spent', { ascending: false })
    .limit(500)

  if (vendorId) {
    query = query.eq('vendor_id', vendorId) as typeof query
  }

  const { data: clients } = await query

  const total      = (clients ?? []).reduce((s, c) => s + Number(c.total_spent), 0)
  const active7    = (clients ?? []).filter(c => Number(c.days_since_last) <= 7).length
  const avgTicket  = clients?.length ? total / clients.length : 0

  return (
    <div>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Clientes únicos', value: (clients?.length ?? 0).toLocaleString() },
          { label: 'Volume total',    value: fmtCurrency(total), color: 'var(--accent)' },
          { label: 'Ativos (7d)',     value: active7.toLocaleString(), color: 'var(--mkt)' },
          { label: 'Ticket médio',    value: fmtCurrency(avgTicket) },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{k.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color || 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Cliente', 'Total', 'Visitas', 'Itens Total', 'Itens/Nota', 'Freq.', 'Última Compra'].map((h, i) => (
                <th key={h} style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px',
                  textAlign: i >= 2 ? 'right' : 'left', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(clients ?? []).map((c, i) => {
              const daysAgo = Number(c.days_since_last)
              const recColor = recencyColor(daysAgo)
              return (
                <tr key={`${c.client_id}-${c.vendor_id}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '7px 10px', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: '0.78rem' }}>{c.client_name}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--accent)' }}>{fmtCurrency(Number(c.total_spent))}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{c.visit_days}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{Number(c.total_items).toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{c.avg_items_per_order}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem' }}>{c.total_orders}x</td>
                  <td style={{ padding: '7px 10px' }}>
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: recColor, marginRight: '6px', verticalAlign: 'middle' }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem' }}>{c.last_purchase}</span>
                    {c.last_purchase_time && (
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', color: 'var(--muted)', marginLeft: '4px' }}>{String(c.last_purchase_time).slice(0,5)}</span>
                    )}
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', color: 'var(--muted)', marginLeft: '4px' }}>({recencyLabel(daysAgo)})</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
