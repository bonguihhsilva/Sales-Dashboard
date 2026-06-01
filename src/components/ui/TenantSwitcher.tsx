'use client'

import { useRouter } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { switchTenantAction } from '@/app/dashboard/super-admin/tenant-actions'

export function TenantSwitcher({
  tenants,
  activeTenantId,
}: {
  tenants: { id: string; nome: string }[]
  activeTenantId?: string | null
}) {
  const router = useRouter()

  const handleSwitch = async (val: string | null) => {
    if (!val) return
    await switchTenantAction(val === 'reset' ? null : val)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-primary/70 uppercase tracking-widest hidden md:inline">Empresa:</span>
      <Select value={activeTenantId || 'reset'} onValueChange={handleSwitch}>
        <SelectTrigger className="w-[180px] h-8 text-xs bg-surface-variant border-none focus:ring-0">
          <SelectValue placeholder="Selecione a Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reset" className="font-bold text-primary">Modo Global (Nativo)</SelectItem>
          {tenants.map(t => (
            <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
