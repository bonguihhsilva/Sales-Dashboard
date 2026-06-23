'use client'

import Link from 'next/link'

export function TrilhaCard({ trilha }: { trilha: { id: string; titulo: string; descricao: string | null } }) {
  return (
    <Link href={`/vendedor/treinamentos/${trilha.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{trilha.titulo}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', minHeight: '40px' }}>
          {trilha.descricao || 'Sem descrição.'}
        </p>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent)22', padding: '4px 10px', borderRadius: '4px' }}>
            Acessar Trilha →
          </span>
        </div>
      </div>
    </Link>
  )
}
