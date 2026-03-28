'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Period } from '@/types'

export default function PeriodSelector({ periods, activePeriod }: { periods: Period[]; activePeriod: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', e.target.value)
    router.push(`?${params.toString()}`)
  }

  return (
    <select
      value={activePeriod}
      onChange={handleChange}
      style={{
        background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px',
        color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
        padding: '6px 10px', cursor: 'pointer', outline: 'none',
      }}
    >
      {periods.map(p => (
        <option key={p.id} value={p.id}>{p.label}</option>
      ))}
    </select>
  )
}
