import type { SaleTransaction } from '@/lib/parser'

export type ConnectorSystem = 'pegasus' | 'isrp'

export interface ConnectorConfig {
  id: string
  tenant_id: string
  system: ConnectorSystem
  base_url: string
  // UUID do vault.secrets -- nunca o valor bruto (D-04)
  credential_secret_id: string
  settings: Record<string, unknown>
  enabled: boolean
}

export interface SyncResult {
  transactions: SaleTransaction[]
  source_system: ConnectorSystem
  fetched_at: string   // ISO 8601
  raw_count: number
  error?: string
}

export interface BaseConnector {
  readonly system: ConnectorSystem
  fetchTransactions(
    config: ConnectorConfig,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SyncResult>
}

// Prefixos de namespace por sistema (D-08/D-09)
export const SYSTEM_PREFIXES: Record<string, string> = {
  cec:     'CEC_',
  pegasus: 'PEG_',
  isrp:    'ISRP_',
}

// Aplica prefixo de sistema a um ID externo
// Ex: applySystemPrefix('456', 'pegasus') => 'PEG_456'
export function applySystemPrefix(id: string, system: string): string {
  const prefix = SYSTEM_PREFIXES[system] ?? `${system.toUpperCase()}_`
  if (id.startsWith(prefix)) return id   // idempotente -- nao duplicar prefixo
  return prefix + id
}
