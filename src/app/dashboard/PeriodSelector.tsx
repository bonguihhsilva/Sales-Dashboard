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
    <div className="relative h-full">
      <select
        value={activePeriod}
        onChange={handleChange}
        className="appearance-none h-full bg-surface-container-high border border-white/5 rounded-xl text-on-surface font-mono text-xs pl-4 pr-10 py-[0.6rem] cursor-pointer outline-none hover:bg-surface-container-highest transition-colors"
      >
        {periods.map(p => (
          <option key={p.id} value={p.id} className="bg-surface-container text-on-surface">{p.label}</option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm">
        expand_more
      </span>
    </div>
  )
}
