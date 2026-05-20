import type { ReactNode } from 'react'
import Link from 'next/link'

interface Crumb { label: string; href?: string }

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Crumb[]
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-border md:flex-row md:items-baseline md:justify-between">
      <div className="flex flex-col gap-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {c.href ? <Link href={c.href} className="hover:text-foreground">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-sans text-xl font-bold text-foreground md:text-[28px] md:leading-[1.2]">
          {title}
        </h1>
        {subtitle && <p className="font-sans text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
