import { describe, it, expect } from 'vitest'
import { applySystemPrefix, SYSTEM_PREFIXES } from '@/lib/connectors/base'
import { PegasusConnector } from '@/lib/connectors/pegasus'
import { ISRPConnector } from '@/lib/connectors/isrp'
import { getConnector } from '@/lib/connectors/registry'
import type { ConnectorConfig } from '@/lib/connectors/base'

const DUMMY_CONFIG: ConnectorConfig = {
  id: 'test-id', tenant_id: 'tenant-1',
  system: 'pegasus', base_url: '', credential_secret_id: '',
  settings: {}, enabled: true,
}
const START = new Date('2026-05-01')
const END   = new Date('2026-05-31')

describe('applySystemPrefix', () => {
  it('aplica prefixo PEG_ para pegasus', () => {
    expect(applySystemPrefix('456', 'pegasus')).toBe('PEG_456')
  })
  it('aplica prefixo ISRP_ para isrp', () => {
    expect(applySystemPrefix('789', 'isrp')).toBe('ISRP_789')
  })
  it('aplica prefixo CEC_ para cec', () => {
    expect(applySystemPrefix('123', 'cec')).toBe('CEC_123')
  })
  it('e idempotente -- nao duplica prefixo existente', () => {
    expect(applySystemPrefix('PEG_456', 'pegasus')).toBe('PEG_456')
  })
})

describe('PegasusConnector stub', () => {
  it('lanca Error com mensagem contendo PegasusConnector', async () => {
    const connector = new PegasusConnector()
    await expect(connector.fetchTransactions(DUMMY_CONFIG, START, END))
      .rejects.toThrow('PegasusConnector')
  })
  it('tem system === pegasus', () => {
    expect(new PegasusConnector().system).toBe('pegasus')
  })
})

describe('ISRPConnector stub', () => {
  it('lanca Error com mensagem contendo ISRPConnector', async () => {
    const connector = new ISRPConnector()
    await expect(connector.fetchTransactions(
      { ...DUMMY_CONFIG, system: 'isrp' }, START, END
    )).rejects.toThrow('ISRPConnector')
  })
  it('tem system === isrp', () => {
    expect(new ISRPConnector().system).toBe('isrp')
  })
})

describe('getConnector registry', () => {
  it('retorna PegasusConnector para pegasus', () => {
    expect(getConnector('pegasus').system).toBe('pegasus')
  })
  it('retorna ISRPConnector para isrp', () => {
    expect(getConnector('isrp').system).toBe('isrp')
  })
  it('lanca Error para sistema desconhecido', () => {
    expect(() => getConnector('unknown' as 'pegasus')).toThrow()
  })
})
