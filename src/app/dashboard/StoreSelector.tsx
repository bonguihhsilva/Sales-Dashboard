'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function StoreSelector({ stores, activeStore }: { stores: { key: string, label: string }[], activeStore: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val === 'all') {
      params.delete('store')
    } else {
      params.set('store', val)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="relative h-full">
      <select
        value={activeStore}
        onChange={handleChange}
        className="appearance-none h-full bg-surface-container-high hover:bg-surface-container-highest border border-white/5 text-on-surface text-sm font-bold rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
      >
        <option value="all">Todos os Canais</option>
        {stores.map(s => (
          <option key={s.key} value={s.label}>{s.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </div>
    </div>
  )
}
