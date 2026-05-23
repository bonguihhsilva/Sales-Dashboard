import { cn } from '@/lib/utils'

export type LojaName = 'Jebai' | 'Pajé 1' | 'Pajé 2'

interface LojaBadgeProps { loja: LojaName; className?: string }

const STYLES: Record<LojaName, { bg: string; dot: string; text: string }> = {
  'Jebai':  { bg: 'bg-jebai/15', dot: 'bg-jebai', text: 'text-jebai' },
  'Pajé 1': { bg: 'bg-paje1/15', dot: 'bg-paje1', text: 'text-paje1' },
  'Pajé 2': { bg: 'bg-paje2/15', dot: 'bg-paje2', text: 'text-paje2' },
}

export function LojaBadge({ loja, className }: LojaBadgeProps) {
  const s = STYLES[loja]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] uppercase',
      s.bg, s.text, className,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {loja}
    </span>
  )
}
