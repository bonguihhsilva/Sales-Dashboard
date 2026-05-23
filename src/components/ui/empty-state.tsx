import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-3">
      <div className="text-muted-foreground">
        {icon ?? <Inbox className="h-10 w-10" />}
      </div>
      <h3 className="font-sans text-base text-foreground">{title}</h3>
      {description && (
        <p className="font-sans text-base text-muted-foreground max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
