export const TENANT_MODULES = ['comissao', 'rh', 'treinamentos', 'compras', 'relatorios'] as const

export type TenantModule = typeof TENANT_MODULES[number]

export type TenantModules = Record<TenantModule, boolean>

export const MODULE_LABELS: Record<TenantModule, string> = {
  comissao: 'Comissões',
  rh: 'Recursos Humanos',
  treinamentos: 'Treinamentos',
  compras: 'Compras',
  relatorios: 'Relatórios',
}

export const DEFAULT_MODULES: TenantModules = {
  comissao: true,
  rh: true,
  treinamentos: true,
  compras: true,
  relatorios: true,
}

export function hasModule(modules: Partial<TenantModules> | null | undefined, mod: TenantModule): boolean {
  if (!modules) return true // tenant antigo sem coluna preenchida ainda -> não bloqueia
  return modules[mod] !== false
}
