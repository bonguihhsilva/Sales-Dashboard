'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface Period { id: string | number; label: string }

interface PeriodSelectorProps {
  periods: Period[]
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}

export function PeriodSelector({ periods, value, onChange, className, placeholder = 'Selecione' }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
      <SelectTrigger className={cn('w-[160px] font-mono text-[12px]', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {periods.map(p => (
          <SelectItem key={String(p.id)} value={String(p.id)} className="font-mono text-[12px]">
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
