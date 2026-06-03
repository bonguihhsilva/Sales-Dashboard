'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui'

type Tenant = {
  id: string
  nome: string
  slug: string
  plano: string
  cor_primaria: string | null
  moeda_padrao: string
  locale: string
  commission_pct_default: number
}

interface Props {
  tenant: Tenant | null
  storesCount: number
  gerentesCount: number
}

const NAV_CARDS = [
  { href: '/dashboard/config/lojas', label: 'Lojas', icon: '🏪', desc: 'Criar e gerenciar canais de venda' },
  { href: '/dashboard/config/comissao', label: 'Comissão', icon: '💰', desc: 'Regras de comissão e metas por loja' },
  { href: '/dashboard/config/permissoes', label: 'Permissões', icon: '🔐', desc: 'Controle de acesso de gerentes' },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: '👥', desc: 'Convidar e gerenciar membros da equipe' },
]

const MOEDA_LABELS: Record<string, string> = { USD: 'Dólar (USD)', BRL: 'Real (BRL)', PYG: 'Guaraní (PYG)' }
const LOCALE_LABELS: Record<string, string> = { 'es-PY': 'Paraguai (es-PY)', 'pt-BR': 'Brasil (pt-BR)', 'en-US': 'EUA (en-US)' }

export default function ConfigIndexClient({ tenant, storesCount, gerentesCount }: Props) {
  const [editing, setEditing] = useState(false)
  const [moeda, setMoeda] = useState(tenant?.moeda_padrao ?? 'USD')
  const [locale, setLocale] = useState(tenant?.locale ?? 'es-PY')
  const [cor, setCor] = useState(tenant?.cor_primaria ?? '#c8f542')
  const [pct, setPct] = useState(String((tenant?.commission_pct_default ?? 0.003) * 100))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/admin/tenant-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cor_primaria: cor,
        moeda_padrao: moeda,
        locale,
        commission_pct_default: parseFloat(pct) / 100,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(json.error); return }
    setMsg('Salvo!')
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <PageHeader
        title="Configurações"
        subtitle={`${tenant?.nome ?? ''} · Plano ${tenant?.plano ?? ''}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Configurações' }]}
      />

      {/* Nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {NAV_CARDS.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '20px 16px', cursor: 'pointer', transition: 'border-color .15s',
              display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{c.label}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{c.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Lojas ativas', value: storesCount },
          { label: 'Gerentes', value: gerentesCount },
          { label: 'Comissão padrão', value: `${((tenant?.commission_pct_default ?? 0.003) * 100).toFixed(2)}%` },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 22, color: 'var(--accent)', marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tenant config form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: 0, color: 'var(--text)' }}>
            Configurações Gerais
          </h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            style={{
              background: editing ? 'var(--accent)' : 'var(--surface2)', color: editing ? '#000' : 'var(--text)',
              border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13
            }}
          >
            {saving ? 'Salvando…' : editing ? 'Salvar' : 'Editar'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Moeda */}
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 12, display: 'block', marginBottom: 6 }}>Moeda padrão</label>
            {editing ? (
              <select value={moeda} onChange={e => setMoeda(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
                {Object.entries(MOEDA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : (
              <span style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{MOEDA_LABELS[moeda] ?? moeda}</span>
            )}
          </div>

          {/* Locale */}
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 12, display: 'block', marginBottom: 6 }}>Locale</label>
            {editing ? (
              <select value={locale} onChange={e => setLocale(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
                {Object.entries(LOCALE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : (
              <span style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{LOCALE_LABELS[locale] ?? locale}</span>
            )}
          </div>

          {/* Comissão padrão */}
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 12, display: 'block', marginBottom: 6 }}>Comissão padrão (%)</label>
            {editing ? (
              <input type="number" step="0.01" min="0" max="100" value={pct} onChange={e => setPct(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }} />
            ) : (
              <span style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{parseFloat(pct).toFixed(2)}%</span>
            )}
          </div>

          {/* Cor primária */}
          <div>
            <label style={{ color: 'var(--muted)', fontSize: 12, display: 'block', marginBottom: 6 }}>Cor primária</label>
            {editing ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={cor} onChange={e => setCor(e.target.value)}
                  style={{ width: 36, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer' }} />
                <span style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{cor}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: cor }} />
                <span style={{ color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{cor}</span>
              </div>
            )}
          </div>
        </div>

        {msg && (
          <p style={{ marginTop: 16, fontSize: 13, color: msg === 'Salvo!' ? '#4ade80' : '#f87171' }}>{msg}</p>
        )}
      </div>
    </div>
  )
}
