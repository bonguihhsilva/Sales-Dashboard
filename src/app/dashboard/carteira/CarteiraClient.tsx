'use client'

import { useState, useMemo, useEffect } from 'react'
import { fmtCurrency, recencyColor, recencyLabel } from '@/lib/utils'
import { analyzeCarteira, paretoTop20Share, segmentCounts } from '@/lib/carteira/segmentation'
import { SEGMENT_LABELS, SEGMENT_COLORS, type CarteiraClient as Client, type Segment, type AnalyzedClient } from '@/lib/carteira/types'
import { fetchClientCategoryMix } from './carteiraActions'
import ClientHistoryModal from './ClientHistoryModal'
import { findCategoryGaps, CATEGORY_UNIVERSE, type CategoryMix } from '@/lib/carteira/categories'

type Filter = 'all' | Segment

const CAT_COLORS = ['#c9a24b', '#10b981', '#2e4fe3', '#8b5cf6', '#06b6d4', '#f43f5e']

// ── Shared UI primitives (mirrors app/vendedor/meu-resultado/MeuRHTab.tsx) ──
const TH_STYLE = 'font-mono text-[0.65rem] uppercase tracking-wider py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap border-b border-white/5'
const TD_STYLE = 'py-3 px-4 text-sm border-b border-white/5'
const SEG_BADGE = 'px-2.5 py-0.5 rounded-full text-[11px] font-mono inline-block whitespace-nowrap'
const BTN_PRIMARY = 'bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-3.5 py-2 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer font-display-lg flex items-center justify-center gap-1.5'
const BTN_GHOST = 'bg-transparent hover:bg-white/5 text-muted-foreground border border-white/10 rounded-lg px-3.5 py-2 font-bold text-xs transition-colors cursor-pointer font-display-lg flex items-center justify-center gap-1.5'

function MetricTile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl px-5 py-3 min-w-[130px] text-center bg-surface-container-highest/40">
      <div className="text-xl font-bold font-mono" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[0.62rem] font-mono uppercase tracking-wider mt-0.5 opacity-80 text-muted-foreground">{label}</div>
    </div>
  )
}

export default function CarteiraClient({ clients, color, periodId }: { clients: Client[]; color: string; periodId: number }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<AnalyzedClient | null>(null)
  const [mix, setMix] = useState<CategoryMix[]>([])
  const [loadingMix, setLoadingMix] = useState(false)
  const [historyTab, setHistoryTab] = useState<null | 'ultima' | 'todas'>(null)

  const analyzed = useMemo(() => analyzeCarteira(clients), [clients])
  const counts   = useMemo(() => segmentCounts(analyzed), [analyzed])
  const pareto   = useMemo(() => paretoTop20Share(clients), [clients])

  const total   = clients.reduce((s, c) => s + Number(c.total_spent), 0)
  const novos   = counts.novo
  const emRisco = counts.em_risco

  const filtered = useMemo(() => {
    let list = analyzed
    if (filter !== 'all') list = list.filter(c => c.segment === filter)
    if (search) list = list.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()))
    return [...list].sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
  }, [analyzed, filter, search])

  useEffect(() => {
    if (!selected) return
    let alive = true
    setLoadingMix(true); setMix([])
    fetchClientCategoryMix(selected.client_id, periodId, selected.vendor_id)
      .then(m => { if (alive) setMix(m) })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingMix(false) })
    return () => { alive = false }
  }, [selected, periodId])

  const kpis = [
    { label: 'Clientes', value: clients.length.toLocaleString() },
    { label: 'Volume', value: fmtCurrency(total), color },
    { label: 'Em risco', value: emRisco.toLocaleString(), color: SEGMENT_COLORS.em_risco },
    { label: 'Novos', value: novos.toLocaleString(), color: SEGMENT_COLORS.novo },
    { label: 'Top 20% receita', value: `${Math.round(pareto * 100)}%` },
  ]

  const pills: { key: Filter; label: string; count: number }[] = [
    { key: 'all',        label: 'Todos',                   count: clients.length },
    { key: 'vip',        label: SEGMENT_LABELS.vip,        count: counts.vip },
    { key: 'recorrente', label: SEGMENT_LABELS.recorrente, count: counts.recorrente },
    { key: 'novo',       label: SEGMENT_LABELS.novo,       count: counts.novo },
    { key: 'em_risco',   label: SEGMENT_LABELS.em_risco,   count: counts.em_risco },
    { key: 'perdido',    label: SEGMENT_LABELS.perdido,    count: counts.perdido },
  ]

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-base font-bold font-display-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">diversity_3</span>
          Carteira de Clientes
        </h2>
      </div>

      {/* KPIs macro */}
      <div className="flex gap-2.5 flex-wrap mb-4">
        {kpis.map(k => (
          <MetricTile key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </div>

      {/* Pills de segmento + busca */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {pills.map(p => {
          const on  = filter === p.key
          const col = p.key === 'all' ? '#c9a24b' : SEGMENT_COLORS[p.key as Segment]
          return (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${on ? '' : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}
              style={on ? { borderColor: col, background: `${col}22`, color: col } : undefined}
            >
              {p.label} · {p.count}
            </button>
          )
        })}
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto bg-surface border border-white/10 rounded-lg text-sm font-mono text-on-surface placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors px-3 py-2 w-[200px]"
        />
      </div>

      {/* Lista */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-high/20">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-surface-container-high/50 border-b border-white/5">
            <tr>
              {['#', 'Cliente', 'Segmento', 'Total', 'Ticket méd.', 'Tend.', 'Última compra'].map((h, i) => (
                <th key={h} className={`${TH_STYLE} ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c, i) => {
              const daysAgo = Number(c.days_since_last)
              const trendClass = c.trendPct == null ? 'text-muted-foreground' : c.trendPct > 2 ? 'text-emerald-500' : c.trendPct < -2 ? 'text-rose-500' : 'text-muted-foreground'
              return (
                <tr
                  key={`${c.client_id}-${c.vendor_id}`}
                  onClick={() => setSelected(c)}
                  className="hover:bg-secondary/10 transition-colors cursor-pointer"
                >
                  <td className={`${TD_STYLE} font-mono text-xs text-muted-foreground`}>{i + 1}</td>
                  <td className={`${TD_STYLE} font-medium`}>{c.client_name}</td>
                  <td className={TD_STYLE}>
                    <span className={SEG_BADGE} style={{ background: `${SEGMENT_COLORS[c.segment]}22`, color: SEGMENT_COLORS[c.segment] }}>{SEGMENT_LABELS[c.segment]}</span>
                  </td>
                  <td className={`${TD_STYLE} text-right font-mono font-semibold`}>{fmtCurrency(Number(c.total_spent))}</td>
                  <td className={`${TD_STYLE} text-right font-mono text-sm`}>{fmtCurrency(Number(c.avg_ticket))}</td>
                  <td className={`${TD_STYLE} text-right font-mono text-sm ${trendClass}`}>
                    {c.trendPct == null ? (c.segment === 'novo' ? 'novo' : '—')
                      : `${c.trendPct > 0 ? '▲' : c.trendPct < 0 ? '▼' : ''} ${Math.abs(Math.round(c.trendPct))}%`}
                  </td>
                  <td className={TD_STYLE}>
                    <span className="inline-block w-[7px] h-[7px] rounded-full mr-1.5 align-middle" style={{ background: recencyColor(daysAgo) }} />
                    <span className="font-mono text-xs">{c.last_purchase}</span>
                    <span className="font-mono text-[11px] text-muted-foreground ml-1">({recencyLabel(daysAgo)})</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 px-4 text-center text-muted-foreground font-mono text-sm">Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && historyTab && (
        <ClientHistoryModal
          clientId={selected.client_id}
          clientName={selected.client_name}
          initialTab={historyTab}
          onClose={() => setHistoryTab(null)}
          vendorId={selected.vendor_id}
        />
      )}

      {selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 bg-black/50 z-[9998]">
          <div onClick={e => e.stopPropagation()} className="fixed top-0 right-0 bottom-0 w-[360px] bg-background border-l border-white/10 overflow-y-auto z-[9999]">
            <div className="p-4 border-b border-white/5">
              <div className="text-base font-bold font-display-lg">{selected.client_name}</div>
              <div className="font-mono text-[11px] text-muted-foreground mt-1">
                {selected.vendor_name ?? selected.vendor_id} · {selected.total_orders} compras
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className={SEG_BADGE} style={{ background: `${SEGMENT_COLORS[selected.segment]}22`, color: SEGMENT_COLORS[selected.segment] }}>{SEGMENT_LABELS[selected.segment]}</span>
                <span className={`${SEG_BADGE} bg-primary/20 text-primary`}>R{selected.rfm.r} F{selected.rfm.f} M{selected.rfm.m}</span>
              </div>
            </div>
            <div className="p-4 border-b border-white/5 flex flex-col gap-2">
              <button onClick={() => setHistoryTab('ultima')} className={BTN_PRIMARY}>
                <span className="material-symbols-outlined text-[16px]">receipt_long</span> Abrir última nota
              </button>
              <button onClick={() => setHistoryTab('todas')} className={BTN_GHOST}>
                <span className="material-symbols-outlined text-[16px]">history</span> Abrir histórico do cliente
              </button>
            </div>
            <div className="p-4 border-b border-white/5">
              <div className="font-mono text-[11px] text-muted-foreground uppercase mb-2.5">Mix por categoria</div>
              {loadingMix ? <div className="font-mono text-xs text-muted-foreground">Carregando…</div>
              : mix.length === 0 ? <div className="font-mono text-xs text-muted-foreground">Nenhum item registrado neste período.</div>
              : (<>
                <div className="flex h-3.5 rounded overflow-hidden mb-2.5">
                  {mix.map((m, i) => <div key={m.category} style={{ width: `${m.pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }} />)}
                </div>
                {mix.map((m, i) => (
                  <div key={m.category} className="flex justify-between text-xs mb-1.5">
                    <span><span className="inline-block w-[7px] h-[7px] rounded-full mr-1.5" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />{m.category}</span>
                    <span className="font-mono">{m.pct}%</span>
                  </div>
                ))}
              </>)}
            </div>
            <div className="p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase mb-2.5">Oportunidades (lacunas)</div>
              {findCategoryGaps(mix.map(m => m.category), CATEGORY_UNIVERSE).map(g => (
                <div key={g} className="text-xs px-2.5 py-1.5 bg-surface border border-white/5 rounded-lg mb-1.5">{g} — nunca comprou</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
