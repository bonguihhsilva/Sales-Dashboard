import type { BaseConnector, ConnectorConfig, SyncResult } from './base'

export class ISRPConnector implements BaseConnector {
  readonly system = 'isrp' as const

  async fetchTransactions(
    config: ConnectorConfig,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SyncResult> {
    // TODO: implementar quando credenciais e documentacao da API ISRP chegarem (D-03)
    //
    // Perguntas a responder antes de implementar:
    //   1. Endpoint: provavelmente GET ${config.base_url}/relatorio?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
    //   2. Auth: Bearer token? API key no header? Certificado cliente?
    //   3. Formato da resposta: JSON? XML? CSV fixo?
    //   4. Estrutura de campo vendedor_id e cliente_id no retorno?
    //   5. Paginacao ou retorno completo por periodo?
    //
    // Quando implementado, aplicar applySystemPrefix(id, 'isrp') nos IDs retornados (D-08/D-09)

    throw new Error(
      `ISRPConnector: nao implementado -- aguardando documentacao da API ISRP (D-03). ` +
      `Config recebida: base_url=${config.base_url || '(vazio)'}, ` +
      `periodo=${periodStart.toISOString().slice(0,10)} a ${periodEnd.toISOString().slice(0,10)}`
    )
  }
}
