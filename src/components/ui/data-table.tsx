'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyTitle = 'Nenhum dado encontrado',
  emptyDescription = 'Ajuste os filtros ou importe dados para este período.',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey as keyof T]
        const bv = b[sortKey as keyof T]
        if (av === bv) return 0
        const cmp = (av as never) > (bv as never) ? 1 : -1
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.align === 'left' && 'text-left',
                  !col.align && 'text-left',
                  col.sortable && 'cursor-pointer select-none',
                )}
                onClick={() => {
                  if (!col.sortable) return
                  const k = String(col.key)
                  if (sortKey === k) {
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortKey(k); setSortDir('asc')
                  }
                }}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === String(col.key) && (
                    sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 font-mono text-[12px] text-foreground h-12',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
