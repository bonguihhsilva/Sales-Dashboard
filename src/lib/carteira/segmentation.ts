import type { CarteiraClient, AnalyzedClient, RfmScore, Segment } from './types'

const EM_RISCO_DAYS = 14
const VIP_RFM_SUM = 12

/** Score de quintil 1..5; maior `value` → maior score (a menos que invert=true). */
function quintile(value: number, sortedAsc: number[], invert: boolean): number {
  if (sortedAsc.length <= 1) return 3
  let rank = sortedAsc.findIndex(v => v >= value)
  if (rank < 0) rank = sortedAsc.length - 1
  const pct = rank / (sortedAsc.length - 1)
  const score = Math.min(5, Math.max(1, Math.round(pct * 4) + 1))
  return invert ? 6 - score : score
}

export function analyzeCarteira(clients: CarteiraClient[]): AnalyzedClient[] {
  const recency  = [...clients].map(c => Number(c.days_since_last)).sort((a, b) => a - b)
  const freq     = [...clients].map(c => Number(c.total_orders)).sort((a, b) => a - b)
  const monetary = [...clients].map(c => Number(c.total_spent)).sort((a, b) => a - b)

  return clients.map(c => {
    const rfm: RfmScore = {
      r: quintile(Number(c.days_since_last), recency, true),
      f: quintile(Number(c.total_orders), freq, false),
      m: quintile(Number(c.total_spent), monetary, false),
    }
    const rfmSum = rfm.r + rfm.f + rfm.m

    const prev = c.prev_total_spent
    const trendPct = (prev != null && prev > 0) ? ((Number(c.total_spent) - prev) / prev) * 100 : null

    let segment: Segment
    if (Number(c.total_spent) === 0 && prev != null && prev > 0) segment = 'perdido'
    else if (Number(c.total_orders) === 1) segment = 'novo'
    else if (Number(c.days_since_last) > EM_RISCO_DAYS) segment = 'em_risco'
    else if (rfmSum >= VIP_RFM_SUM) segment = 'vip'
    else segment = 'recorrente'

    return { ...c, rfm, rfmSum, segment, trendPct }
  })
}

export function paretoTop20Share(clients: CarteiraClient[]): number {
  if (clients.length === 0) return 0
  const sorted = [...clients].sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
  const total = sorted.reduce((s, c) => s + Number(c.total_spent), 0)
  if (total === 0) return 0
  const topN = Math.max(1, Math.ceil(sorted.length * 0.2))
  const topSum = sorted.slice(0, topN).reduce((s, c) => s + Number(c.total_spent), 0)
  return topSum / total
}

export function segmentCounts(clients: AnalyzedClient[]): Record<Segment, number> {
  const acc: Record<Segment, number> = { vip: 0, recorrente: 0, novo: 0, em_risco: 0, perdido: 0 }
  for (const c of clients) acc[c.segment]++
  return acc
}
