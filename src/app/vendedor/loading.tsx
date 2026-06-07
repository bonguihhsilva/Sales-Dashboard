import { Skeleton } from '@/components/ui/skeleton'

export default function VendedorLoading() {
  return (
    <div className="p-margin-page space-y-8">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Progress bar */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Chart */}
      <Skeleton className="h-64 w-full rounded-xl" />

      {/* Client table */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
