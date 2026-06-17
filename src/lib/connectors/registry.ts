import type { BaseConnector, ConnectorSystem } from './base'
import { PegasusConnector } from './pegasus'
import { ISRPConnector } from './isrp'

const REGISTRY: Record<ConnectorSystem, BaseConnector> = {
  pegasus: new PegasusConnector(),
  isrp:    new ISRPConnector(),
}

export function getConnector(system: ConnectorSystem): BaseConnector {
  const connector = REGISTRY[system]
  if (!connector) {
    throw new Error(`Conector desconhecido: '${system}'. Sistemas suportados: pegasus, isrp`)
  }
  return connector
}
