import type { BaseConnector, ConnectorConfig, SyncResult } from './base'

export class PegasusConnector implements BaseConnector {
  readonly system = 'pegasus' as const

  async fetchTransactions(
    config: ConnectorConfig,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SyncResult> {
    // TODO: implementar quando credenciais e documentacao da API Pegasus chegarem (D-03)
    //
    // Perguntas a responder antes de implementar:
    //   1. Endpoint: provavelmente GET ${config.base_url}/vendas?de=YYYY-MM-DD&ate=YYYY-MM-DD
    //   2. Auth: Bearer token? Basic auth? OAuth2?
    //   3. Formato da resposta: JSON array? XML? CSV?
    //   4. Estrutura de campo vendor_id e client_id no retorno?
    //   5. Paginacao: existe? qual parametro?
    //
    // Quando implementado, aplicar applySystemPrefix(id, 'pegasus') nos IDs retornados (D-08/D-09)
    //
    // Para acessar a credencial do Vault:
    //   import { createAdminClient } from '@/lib/supabase/admin'
    //   const admin = createAdminClient()
    //   const { data } = await admin
    //     .from('vault.decrypted_secrets')  -- requer service_role
    //     .select('decrypted_secret')
    //     .eq('name', `pegasus_${config.tenant_id}`)
    //     .single()
    //   const apiKey = data?.decrypted_secret

    throw new Error(
      `PegasusConnector: nao implementado -- aguardando documentacao da API Pegasus (D-03). ` +
      `Config recebida: base_url=${config.base_url || '(vazio)'}, ` +
      `periodo=${periodStart.toISOString().slice(0,10)} a ${periodEnd.toISOString().slice(0,10)}`
    )
  }
}
