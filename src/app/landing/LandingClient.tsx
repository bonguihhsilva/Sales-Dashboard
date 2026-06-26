'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  abyss:    '#0C0C0E',
  deep:     '#141418',
  elevated: '#1C1C22',
  border:   'rgba(255,255,255,0.06)',
  text:     '#F0F0F3',
  muted:    '#6B6B78',
  gold:     '#C9933A',
  blue:     '#3B82F6',
  green:    '#16A34A',
  amber:    '#D97706',
} as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCounter(target: number, inView: boolean, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setVal(Math.round((1 - (1 - p) ** 3) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return val
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return reduced
}

// ── Shared ────────────────────────────────────────────────────────────────────

const container: React.CSSProperties = {
  maxWidth: 1400, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 4rem)',
}

const sectionPad: React.CSSProperties = {
  padding: 'clamp(5rem, 10vw, 9rem) 0',
}

function GoldButton({ href, children, large, block }: { href: string; children: React.ReactNode; large?: boolean; block?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href} style={{
      display: block ? 'block' : 'inline-block',
      textAlign: block ? 'center' : undefined,
      fontFamily: 'var(--font-hanken)', fontWeight: 600,
      fontSize: large ? '1.0625rem' : '0.9375rem',
      color: C.abyss, background: C.gold,
      padding: large ? '1rem 2.5rem' : '0.875rem 2rem',
      borderRadius: '0.5rem', textDecoration: 'none',
      transition: 'filter 200ms, box-shadow 200ms, transform 100ms',
      filter: hov ? 'brightness(1.08)' : 'brightness(1)',
      boxShadow: hov ? '0 0 24px rgba(201,147,58,0.3)' : 'none',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    }}
    onMouseEnter={() => setHov(true)}
    onMouseLeave={() => setHov(false)}
    >{children}</Link>
  )
}

// ── Tour Modal ────────────────────────────────────────────────────────────────

type TourRole = 'admin' | 'gerente' | 'vendedor'

const TOUR_ROLES = [
  {
    id: 'admin' as TourRole,
    title: 'Administrador',
    subtitle: 'Visão completa do negócio',
    desc: 'Todas as lojas, todos os vendedores, controle de comissões e importação CEC.',
    features: ['Dashboard multi-loja', 'Ranking global', 'Motor de comissão', 'Gestão de usuários'],
    icon: '◈',
    color: C.gold,
  },
  {
    id: 'gerente' as TourRole,
    title: 'Gerente',
    subtitle: 'Gestão da sua equipe',
    desc: 'Ranking da sua loja, metas individuais e relatórios de desempenho da equipe.',
    features: ['Ranking da loja', 'Metas por vendedor', 'Relatórios de período', 'Upload de dados'],
    icon: '◉',
    color: C.blue,
  },
  {
    id: 'vendedor' as TourRole,
    title: 'Vendedor',
    subtitle: 'Seu desempenho, sua evolução',
    desc: 'Sua posição no ranking, sua comissão e sua carteira de clientes — só seus dados.',
    features: ['Minha posição no ranking', 'Minhas metas', 'Minha comissão', 'Meus clientes'],
    icon: '○',
    color: '#A78BFA',
  },
]

const TOUR_CALLOUTS: Record<TourRole, { title: string; desc: string }[]> = {
  admin: [
    { title: 'KPIs consolidados', desc: 'Faturamento total das 3 lojas, ticket médio e comissão calculada automaticamente — sem planilha.' },
    { title: 'Ranking global', desc: 'Performance de cada vendedor ordenada por resultado, com nível de meta e progresso visual.' },
    { title: 'Gestão completa', desc: 'Usuários, metas por loja, importação CEC e treinamentos LMS — tudo no mesmo painel.' },
  ],
  gerente: [
    { title: 'KPIs da sua loja', desc: 'Totais da Jebai separados das outras lojas — faturamento, ticket e comissão do seu time.' },
    { title: 'Ranking da equipe', desc: 'Seus vendedores ordenados por resultado. Identifique quem performa e quem precisa de apoio.' },
    { title: 'Gestão operacional', desc: 'Upload do CEC, relatórios por período e acompanhamento de metas da equipe.' },
  ],
  vendedor: [
    { title: 'Seu desempenho', desc: 'Seu total vendido, posição no ranking e o valor exato da comissão — sem depender do gerente.' },
    { title: 'Privacidade garantida', desc: 'Você enxerga só o seu resultado. Nenhum colega vê o dado do outro.' },
    { title: 'Sua carteira', desc: 'Histórico de clientes, frequência de compra e evolução dos últimos meses.' },
  ],
}

function TourDemoMockup({ role }: { role: TourRole }) {
  const isVendedor = role === 'vendedor'
  const isAdmin = role === 'admin'

  const kpis = isVendedor
    ? [
        { l: 'Meu Total', v: 'G$128.400', d: '+8%', dc: C.green },
        { l: 'Posição', v: '#2 ranking', d: 'Meta 2 atingida', dc: C.gold },
        { l: 'Minha Comissão', v: 'G$8.420', d: 'calculada', dc: C.gold },
      ]
    : isAdmin
    ? [
        { l: 'Total Vendido', v: 'G$847.200', d: '+12%', dc: C.green },
        { l: 'Ticket Médio', v: 'G$7.060', d: '+3%', dc: C.green },
        { l: 'Comissão Total', v: 'G$74.390', d: 'calculada', dc: C.gold },
        { l: 'Clientes Ativos', v: '312', d: '+18 novos', dc: C.blue },
      ]
    : [
        { l: 'Total Jebai', v: 'G$314.200', d: '+9%', dc: C.green },
        { l: 'Ticket Médio', v: 'G$6.900', d: '+2%', dc: C.green },
        { l: 'Comissão Equipe', v: 'G$28.150', d: 'calculada', dc: C.gold },
      ]

  const sidebarItems = isVendedor
    ? ['Meu Resultado', 'Meus Clientes', 'Treinamentos']
    : isAdmin
    ? ['Dashboard', 'Vendedores', 'Usuários', 'Treinamentos', 'Configurações']
    : ['Dashboard', 'Minha Equipe', 'Importar CEC', 'Relatórios']

  const purple = '#A78BFA'
  const vendors = isVendedor
    ? [{ n: 'Ana Rodríguez', s: 'Você', v: 'G$128.400', m: 'Meta 2', pct: 79, gold: false, self: true }]
    : [
        { n: 'Carlos Martínez', s: isAdmin ? 'Jebai' : 'equipe', v: 'G$142.800', m: 'Meta 3', pct: 94, gold: true, self: false },
        { n: 'Ana Rodríguez', s: isAdmin ? 'Pajé 1' : 'equipe', v: 'G$128.400', m: 'Meta 2', pct: 79, gold: false, self: false },
        { n: 'Diego Pérez', s: isAdmin ? 'Pajé 2' : 'equipe', v: 'G$117.200', m: 'Meta 2', pct: 68, gold: false, self: false },
        { n: 'Maria Santos', s: isAdmin ? 'Jebai' : 'equipe', v: 'G$98.600', m: 'Meta 1', pct: 55, gold: false, self: false },
      ]

  return (
    <div style={{
      background: C.elevated, borderRadius: '1rem',
      border: `1px solid rgba(255,255,255,0.08)`,
      overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: 'var(--font-jetbrains)',
    }}>
      <div style={{
        background: C.abyss, padding: '0.5625rem 0.875rem',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map(c => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
        ))}
        <div style={{
          flex: 1, height: 18, background: C.deep, borderRadius: '0.25rem',
          margin: '0 0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.5rem', color: C.muted,
        }}>
          gds-frame.com/{isVendedor ? 'meu-resultado' : 'dashboard'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
        <div style={{ background: C.deep, borderRight: `1px solid ${C.border}`, padding: '0.875rem 0.625rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '1rem', padding: '0 0.2rem' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '0.3rem',
              background: 'rgba(201,147,58,0.15)', border: `1px solid rgba(201,147,58,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.5rem', fontWeight: 700, color: C.gold,
            }}>G</div>
            <div>
              <div style={{ fontSize: '0.5rem', fontWeight: 600, color: C.text }}>GDS Frame</div>
              <div style={{ fontSize: '0.4rem', color: C.muted }}>{isVendedor ? 'Ana Rodríguez' : isAdmin ? '3 lojas' : 'Jebai'}</div>
            </div>
          </div>
          {sidebarItems.map((item, i) => (
            <div key={item} style={{
              padding: '0.3125rem 0.4375rem', borderRadius: '0.3rem', marginBottom: 2,
              background: i === 0 ? 'rgba(201,147,58,0.1)' : 'transparent',
              border: i === 0 ? `1px solid rgba(201,147,58,0.2)` : '1px solid transparent',
              fontSize: '0.5rem', color: i === 0 ? C.gold : C.muted,
            }}>{item}</div>
          ))}
        </div>

        <div style={{ padding: '0.875rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`,
            gap: '0.4375rem', marginBottom: '0.875rem',
          }}>
            {kpis.map(k => (
              <div key={k.l} style={{
                background: C.elevated, borderRadius: '0.4375rem',
                border: `1px solid ${C.border}`, padding: '0.5rem 0.625rem',
              }}>
                <div style={{ fontSize: '0.4rem', color: C.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.l}</div>
                <div style={{ fontSize: '0.6875rem', color: C.text, fontWeight: 700 }}>{k.v}</div>
                <div style={{ fontSize: '0.4rem', color: k.dc, marginTop: 2 }}>{k.d}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.elevated, borderRadius: '0.5rem', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{
              padding: '0.4375rem 0.625rem', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.5rem', fontWeight: 600, color: C.text }}>
                {isVendedor ? 'Meu Resultado' : 'Ranking de Vendedores'}
              </span>
              <span style={{ fontSize: '0.375rem', color: C.gold, background: 'rgba(201,147,58,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>Jun 2025</span>
            </div>
            {vendors.map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '16px 1fr auto auto',
                alignItems: 'center', gap: '0.4375rem', padding: '0.3125rem 0.625rem',
                background: r.self ? 'rgba(167,139,250,0.08)' : r.gold ? 'rgba(201,147,58,0.03)' : 'transparent',
                borderBottom: i < vendors.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
              }}>
                <span style={{ fontSize: '0.4rem', color: r.self ? purple : r.gold ? C.gold : C.muted, fontWeight: 700 }}>#{i + 1}</span>
                <div>
                  <div style={{ fontSize: '0.45rem', color: r.self ? purple : r.gold ? C.text : C.muted }}>
                    {r.n} <span style={{ color: C.muted, fontSize: '0.4rem' }}>{r.s}</span>
                  </div>
                  <div style={{ height: 2, background: C.deep, borderRadius: 1, marginTop: 2 }}>
                    <div style={{ height: 2, width: `${r.pct}%`, background: r.self ? purple : r.gold ? C.gold : C.blue, borderRadius: 1 }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.4rem', color: r.self ? purple : r.gold ? C.gold : C.text, fontWeight: 600 }}>{r.v}</span>
                <span style={{ fontSize: '0.35rem', color: C.gold, background: 'rgba(201,147,58,0.1)', padding: '0.1rem 0.25rem', borderRadius: '0.2rem' }}>{r.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TourModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'pick' | TourRole>('pick')
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 180)
  }

  const selectedRole = step !== 'pick' ? TOUR_ROLES.find(r => r.id === step) ?? null : null
  const callouts = step !== 'pick' ? TOUR_CALLOUTS[step] : []

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        opacity: closing ? 0 : 1,
        transition: 'opacity 180ms',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.deep, borderRadius: '1.5rem',
          border: `1px solid rgba(255,255,255,0.1)`,
          boxShadow: '0 40px 100px rgba(0,0,0,0.65)',
          width: '100%', maxWidth: step === 'pick' ? 800 : 1060,
          maxHeight: '90dvh', overflowY: 'auto',
          transition: 'max-width 380ms cubic-bezier(0.23,1,0.32,1)',
        }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div>
            {step !== 'pick' && (
              <button
                onClick={() => setStep('pick')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.5rem',
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: C.muted, fontSize: '0.75rem', fontFamily: 'var(--font-manrope)',
                }}>← Voltar</button>
            )}
            <div style={{ fontFamily: 'var(--font-hanken)', fontWeight: 700, fontSize: '1.25rem', color: C.text }}>
              {step === 'pick' ? 'Escolha seu perfil' : `Visão de ${selectedRole?.title}`}
            </div>
            <div style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: C.muted, marginTop: '0.25rem' }}>
              {step === 'pick'
                ? 'Explore o dashboard pela perspectiva do seu papel'
                : selectedRole?.subtitle}
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.muted, fontSize: '1.125rem', lineHeight: 1,
            }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          {step === 'pick' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {TOUR_ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => setStep(role.id)}
                  style={{
                    background: C.elevated, border: `1px solid ${C.border}`,
                    borderRadius: '1.25rem', padding: '1.625rem',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 200ms, transform 150ms, box-shadow 200ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = role.color + '55'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 8px 32px ${role.color}22`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '0.875rem',
                    background: role.color + '18', border: `1.5px solid ${role.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: role.color, marginBottom: '1.125rem',
                  }}>{role.icon}</div>
                  <div style={{ fontFamily: 'var(--font-hanken)', fontWeight: 700, fontSize: '1.0625rem', color: C.text, marginBottom: '0.2rem' }}>{role.title}</div>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: role.color, marginBottom: '0.875rem' }}>{role.subtitle}</div>
                  <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.8125rem', color: C.muted, lineHeight: 1.55, margin: '0 0 1.125rem' }}>{role.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {role.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: C.muted }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.8125rem', fontFamily: 'var(--font-manrope)', fontWeight: 600, color: role.color,
                  }}>Ver como {role.title} <span style={{ fontSize: '0.75rem' }}>→</span></div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <TourDemoMockup role={step} />

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem', marginTop: '1.5rem',
              }}>
                {callouts.map((c, i) => (
                  <div key={i} style={{
                    background: C.elevated, borderRadius: '0.875rem',
                    border: `1px solid ${C.border}`, padding: '1rem',
                    display: 'flex', gap: '0.75rem',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(201,147,58,0.15)', border: `1.5px solid ${C.gold}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.625rem', color: C.gold, fontWeight: 700,
                      fontFamily: 'var(--font-jetbrains)',
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 600, fontSize: '0.8125rem', color: C.text, marginBottom: '0.25rem' }}>{c.title}</div>
                      <div style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.75rem', color: C.muted, lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '1.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', flexWrap: 'wrap',
              }}>
                <Link href="/login" style={{
                  fontFamily: 'var(--font-hanken)', fontWeight: 600, fontSize: '0.9375rem',
                  color: C.abyss, background: C.gold,
                  padding: '0.875rem 2.5rem', borderRadius: '0.5rem',
                  textDecoration: 'none', transition: 'filter 200ms',
                }}>Entrar no sistema</Link>
                <button
                  onClick={() => setStep('pick')}
                  style={{
                    background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer',
                    fontFamily: 'var(--font-manrope)', fontWeight: 500, fontSize: '0.9rem',
                    color: C.muted, padding: '0.875rem 1.5rem', borderRadius: '0.5rem',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                >Ver outro perfil</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard Mockup ──────────────────────────────────────────────────────────

function DashboardMockup({ reduced }: { reduced: boolean }) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (reduced) return
    let raf: number
    const tick = () => {
      setOffset(Math.sin((Date.now() / 4000) * Math.PI * 2) * 8)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <div style={{ transform: `translateY(${offset}px)`, position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -60, zIndex: -1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(201,147,58,0.12) 0%, transparent 65%)',
      }} />
      <div style={{
        background: C.deep, borderRadius: '1.25rem',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        fontFamily: 'var(--font-jetbrains)',
      }}>
        {/* Window chrome */}
        <div style={{
          background: C.abyss, borderBottom: `1px solid ${C.border}`,
          padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: C.muted }}>GDS Frame · Jebai</span>
        </div>

        {/* KPIs */}
        <div style={{ padding: '1rem 1rem 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
          {[
            { label: 'Faturamento', value: 'G$847.200', delta: '+12%', dc: C.green },
            { label: 'Vendedores', value: '18', delta: '+2 ativos', dc: C.blue },
            { label: 'Comissão', value: 'G$74.390', delta: 'automática', dc: C.gold },
          ].map(k => (
            <div key={k.label} style={{
              background: C.elevated, borderRadius: '0.625rem',
              border: `1px solid ${C.border}`, padding: '0.625rem 0.75rem',
            }}>
              <div style={{ fontSize: '0.5rem', color: C.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
              <div style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 600 }}>{k.value}</div>
              <div style={{ fontSize: '0.5rem', color: k.dc, marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Ranking */}
        <div style={{ padding: '0.875rem 1rem' }}>
          <div style={{ fontSize: '0.5rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Ranking · Jun 2025
          </div>
          {[
            { pos: 1, name: 'Carlos M.', store: 'Jebai', pct: 94, val: 'G$142.800' },
            { pos: 2, name: 'Ana R.', store: 'Pajé 1', pct: 79, val: 'G$128.400' },
            { pos: 3, name: 'Diego P.', store: 'Pajé 2', pct: 68, val: 'G$117.200' },
            { pos: 4, name: 'Maria S.', store: 'Jebai', pct: 55, val: 'G$98.600' },
          ].map(r => (
            <div key={r.pos} style={{
              display: 'grid', gridTemplateColumns: '18px 1fr auto',
              alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0',
              borderBottom: r.pos < 4 ? `1px solid rgba(255,255,255,0.04)` : 'none',
            }}>
              <span style={{ fontSize: '0.5625rem', color: r.pos === 1 ? C.gold : C.muted, fontWeight: 700 }}>#{r.pos}</span>
              <div>
                <div style={{ fontSize: '0.625rem', color: r.pos <= 2 ? C.text : C.muted }}>
                  {r.name} <span style={{ color: C.muted, fontSize: '0.5rem' }}>{r.store}</span>
                </div>
                <div style={{ height: 2, background: C.elevated, borderRadius: 1, marginTop: 3 }}>
                  <div style={{ height: 2, width: `${r.pct}%`, borderRadius: 1, background: r.pos === 1 ? C.gold : C.blue }} />
                </div>
              </div>
              <span style={{ fontSize: '0.5625rem', color: r.pos === 1 ? C.gold : C.text, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          background: C.abyss, borderTop: `1px solid ${C.border}`,
          padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.5rem', color: C.muted }}>Período: Junho 2025 · 3 lojas</span>
          <span style={{
            fontSize: '0.5rem', color: C.gold,
            background: 'rgba(201,147,58,0.12)', padding: '0.2rem 0.5rem',
            borderRadius: '0.25rem', border: `1px solid rgba(201,147,58,0.3)`,
          }}>Importar CEC</span>
        </div>
      </div>
    </div>
  )
}

// ── NavBar ────────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} style={{
      fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem',
      color: hov ? C.text : C.muted, textDecoration: 'none', transition: 'color 200ms',
    }}
    onMouseEnter={() => setHov(true)}
    onMouseLeave={() => setHov(false)}
    >{children}</a>
  )
}

function NavBar({ onTourOpen }: { onTourOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(12,12,14,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
      transition: 'background 300ms, backdrop-filter 300ms, border-color 300ms',
    }}>
      <div style={{ ...container, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-hanken)', fontWeight: 800, fontSize: '1.25rem', color: C.gold, letterSpacing: '-0.01em' }}>GDS</span>
          <span style={{ fontFamily: 'var(--font-hanken)', fontWeight: 700, fontSize: '1.25rem', color: C.text, letterSpacing: '-0.01em' }}> Frame</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }} className="lp-desktop">
          <NavLink href="#funcionalidades">Funcionalidades</NavLink>
          <NavLink href="#precos">Preços</NavLink>
          <NavLink href="#demo">Demo</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{
            fontFamily: 'var(--font-manrope)', fontSize: '0.9rem', fontWeight: 500,
            color: C.gold, padding: '0.5rem 1.125rem',
            border: `1px solid rgba(201,147,58,0.35)`, borderRadius: '0.5rem',
            textDecoration: 'none', transition: 'background 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,147,58,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >Entrar</Link>
          <button
            onClick={onTourOpen}
            style={{
              fontFamily: 'var(--font-manrope)', fontSize: '0.9rem', fontWeight: 600,
              color: C.abyss, background: C.gold, padding: '0.5625rem 1.375rem',
              borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              transition: 'filter 200ms, box-shadow 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(201,147,58,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '' }}
          >Começar agora</button>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ reduced, onTourOpen }: { reduced: boolean; onTourOpen: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const anim = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(28px)',
    transition: reduced ? 'none' : `opacity 650ms ${delay}ms, transform 650ms ${delay}ms cubic-bezier(0.23,1,0.32,1)`,
  })

  return (
    <section style={{
      minHeight: '100dvh', background: C.abyss,
      display: 'flex', alignItems: 'center',
      padding: 'clamp(5rem, 10vw, 7rem) 0 4rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '2%', width: '55vw', height: '60vh',
        background: 'radial-gradient(ellipse, rgba(201,147,58,0.055) 0%, transparent 60%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ ...container, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 55fr) minmax(0, 45fr)',
          gap: 'clamp(2rem, 5vw, 5rem)',
          alignItems: 'center',
        }} className="lp-hero-grid">

          {/* Left */}
          <div>
            <div style={anim(80)}>
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--font-jetbrains)', fontSize: '0.6875rem',
                color: C.gold, letterSpacing: '0.09em', textTransform: 'uppercase',
                background: 'rgba(201,147,58,0.1)', padding: '0.375rem 0.875rem',
                borderRadius: '0.375rem', border: `1px solid rgba(201,147,58,0.25)`,
                marginBottom: '1.5rem',
              }}>
                Gestão Comercial · Multi-loja · Ciudad del Este
              </span>
            </div>

            <h1 style={{
              ...anim(160),
              fontFamily: 'var(--font-hanken)', fontWeight: 800,
              fontSize: 'clamp(2.125rem, 5vw, 4rem)',
              color: C.text, letterSpacing: '-0.03em', lineHeight: 1.08,
              margin: '0 0 1.5rem',
            }}>
              Seus vendedores têm número.{' '}
              <span style={{ color: C.gold }}>Agora você também tem.</span>
            </h1>

            <p style={{
              ...anim(260),
              fontFamily: 'var(--font-manrope)', fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
              color: C.muted, lineHeight: 1.7, maxWidth: '52ch', margin: '0 0 2.5rem',
            }}>
              Ranking em tempo real, motor de comissão configurável e importação direta do CEC.
              Um painel para as três lojas, zero planilha.
            </p>

            <div style={{ ...anim(360), display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onTourOpen}
                style={{
                  fontFamily: 'var(--font-hanken)', fontWeight: 600, fontSize: '1.0625rem',
                  color: C.abyss, background: C.gold,
                  padding: '1rem 2.5rem', borderRadius: '0.5rem',
                  border: 'none', cursor: 'pointer',
                  transition: 'filter 200ms, box-shadow 200ms, transform 100ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(201,147,58,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
              >Fazer tour guiado</button>
              <Link href="/login" style={{
                fontFamily: 'var(--font-manrope)', fontWeight: 500, fontSize: '0.9375rem',
                color: C.muted, textDecoration: 'none', transition: 'color 200ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >Já tenho conta →</Link>
            </div>

            {/* Social proof strip */}
            <div style={{ ...anim(460), display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {[
                { num: '3', label: 'lojas ativas' },
                { num: '120+', label: 'vendas analisadas' },
                { num: '100%', label: 'comissão automática' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '0.9375rem', color: C.gold }}>{s.num}</span>
                  <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.8125rem', color: C.muted }}>{s.label}</span>
                  {i < 2 && <span style={{ color: C.muted, marginLeft: '0.75rem', fontSize: '0.75rem' }}>·</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right — mockup */}
          <div style={{ ...anim(300) }} className="lp-hero-mockup">
            <DashboardMockup reduced={reduced} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Stats Band ─────────────────────────────────────────────────────────────────

function StatChip({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) {
  const count = useCounter(value, inView)
  return (
    <div style={{
      background: C.elevated, border: `1px solid ${C.border}`,
      borderRadius: '1rem', padding: 'clamp(1.25rem, 2vw, 2rem)',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-jetbrains)', fontWeight: 700,
        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: C.gold, lineHeight: 1,
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: 'var(--font-manrope)', fontSize: '0.9rem',
        color: C.muted, marginTop: '0.625rem', lineHeight: 1.45,
        maxWidth: '20ch', margin: '0.625rem auto 0',
      }}>{label}</div>
    </div>
  )
}

function StatsBand() {
  const { ref, inView } = useInView(0.3)
  return (
    <section ref={ref} style={{
      background: C.deep,
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: 'clamp(3rem, 5vw, 5rem) 0',
    }}>
      <div style={container}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <StatChip value={38} suffix="%" label="aumento médio no registro de vendas no 1º mês" inView={inView} />
          <StatChip value={3} suffix="" label="lojas gerenciadas em um único painel multi-tenant" inView={inView} />
          <StatChip value={100} suffix="%" label="cálculo de comissão automatizado, sem planilha" inView={inView} />
        </div>
      </div>
    </section>
  )
}

// ── Feature Visuals ────────────────────────────────────────────────────────────

function RankingVisual() {
  return (
    <div style={{
      background: C.deep, borderRadius: '1.25rem',
      border: `1px solid ${C.border}`, padding: '1.5rem',
      fontFamily: 'var(--font-jetbrains)',
    }}>
      <div style={{ fontSize: '0.625rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.125rem' }}>
        Ranking · Jebai · Jun 2025
      </div>
      {[
        { medal: '1', name: 'Carlos Martínez', meta: 'Meta 3', val: 'G$142.800', pct: 94, color: C.gold },
        { medal: '2', name: 'Ana Rodríguez', meta: 'Meta 2', val: 'G$128.400', pct: 79, color: C.blue },
        { medal: '3', name: 'Diego Pérez', meta: 'Meta 2', val: 'G$117.200', pct: 68, color: '#B45309' },
      ].map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '2rem 1fr auto',
          gap: '0.75rem', alignItems: 'center',
          padding: '0.75rem 0',
          borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.04)` : 'none',
        }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: i === 0 ? 'rgba(201,147,58,0.15)' : i === 1 ? 'rgba(59,130,246,0.12)' : 'rgba(180,83,9,0.12)',
            border: `1.5px solid ${r.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.625rem', color: r.color, fontWeight: 700,
          }}>{r.medal}</div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 500, marginBottom: 5 }}>{r.name}</div>
            <div style={{ height: 4, background: C.elevated, borderRadius: 2 }}>
              <div style={{ height: 4, width: `${r.pct}%`, background: r.color, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', color: r.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.val}</div>
            <div style={{ fontSize: '0.5625rem', color: C.muted, marginTop: 2 }}>{r.meta}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommissionVisual() {
  return (
    <div style={{
      background: C.deep, borderRadius: '1.25rem',
      border: `1px solid ${C.border}`, padding: '1.5rem',
      fontFamily: 'var(--font-jetbrains)',
    }}>
      <div style={{ fontSize: '0.625rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.125rem' }}>
        Motor de Comissão · Carlos M.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {[
          { label: 'Meta 1 — G$80.000', pct: 2, bonus: 'G$1.600', hit: true },
          { label: 'Meta 2 — G$110.000', pct: 3, bonus: 'G$3.300', hit: true },
          { label: 'Meta 3 — G$140.000', pct: 4, bonus: 'G$5.600', hit: true },
        ].map((m, i) => (
          <div key={i} style={{
            background: C.elevated, borderRadius: '0.75rem',
            border: `1px solid rgba(22,163,74,0.25)`,
            padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(22,163,74,0.15)', border: `1.5px solid ${C.green}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: C.text }}>{m.label}</div>
                <div style={{ fontSize: '0.5625rem', color: C.muted, marginTop: 2 }}>comissão {m.pct}%</div>
              </div>
            </div>
            <span style={{ fontSize: '0.9375rem', color: C.gold, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.bonus}</span>
          </div>
        ))}
        <div style={{
          borderTop: `1px solid rgba(201,147,58,0.2)`, paddingTop: '0.875rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.75rem', color: C.muted }}>Total calculado automaticamente</span>
          <span style={{ fontSize: '1.25rem', color: C.gold, fontWeight: 700 }}>G$10.500</span>
        </div>
      </div>
    </div>
  )
}

function ImportVisual() {
  return (
    <div style={{
      background: C.deep, borderRadius: '1.25rem',
      border: `1px solid ${C.border}`, padding: '1.5rem',
      fontFamily: 'var(--font-jetbrains)',
    }}>
      <div style={{ fontSize: '0.625rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.125rem' }}>
        Importação CEC · Jebai · Jun 2025
      </div>
      {[
        { num: '01', label: 'Upload do arquivo HTML exportado do CEC', status: 'done' },
        { num: '02', label: 'Parse automático — 847 registros identificados', status: 'done' },
        { num: '03', label: 'Vinculação aos vendedores cadastrados', status: 'done' },
        { num: '04', label: 'Cálculo automático de comissões e metas', status: 'active' },
        { num: '05', label: 'Ranking e relatórios disponíveis no painel', status: 'pending' },
      ].map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.5625rem 0',
          borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.04)` : 'none',
          opacity: s.status === 'pending' ? 0.4 : 1,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: s.status === 'done' ? 'rgba(22,163,74,0.12)' : s.status === 'active' ? 'rgba(201,147,58,0.12)' : 'rgba(107,107,120,0.08)',
            border: `1.5px solid ${s.status === 'done' ? C.green : s.status === 'active' ? C.gold : C.muted}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.5rem', color: s.status === 'done' ? C.green : s.status === 'active' ? C.gold : C.muted,
            fontWeight: 700,
          }}>
            {s.status === 'done' ? '✓' : s.num}
          </div>
          <span style={{ fontSize: '0.75rem', color: s.status === 'active' ? C.gold : C.text, flex: 1, lineHeight: 1.4 }}>{s.label}</span>
          {s.status === 'active' && (
            <span style={{
              fontSize: '0.5rem', color: C.gold,
              background: 'rgba(201,147,58,0.1)', padding: '0.15rem 0.4rem',
              borderRadius: '0.25rem', whiteSpace: 'nowrap',
            }}>em curso</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Features Section ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'ranking',
    tag: 'Visibilidade',
    title: 'Ranking que todo gerente sempre quis ter.',
    body: 'Performance de cada vendedor em tempo real: total vendido, posição no ranking, nível de meta e evolução histórica — em uma única tela, para as três lojas.',
    Visual: RankingVisual,
    flip: false,
  },
  {
    id: 'comissao',
    tag: 'Motor de Comissão',
    title: 'Regras configuráveis. Cálculo sem erro humano.',
    body: 'Defina metas e percentuais por loja. O sistema aplica automaticamente na importação — sem fórmula de Excel, sem discussão no fechamento do mês.',
    Visual: CommissionVisual,
    flip: true,
  },
  {
    id: 'importacao',
    tag: 'Importação CEC',
    title: 'Do relatório legado ao dashboard em minutos.',
    body: 'Faça upload do HTML exportado pelo CEC. O parser identifica clientes, vendedores e valores automaticamente. Nenhuma coluna mapeada manualmente.',
    Visual: ImportVisual,
    flip: false,
  },
]

function FeatureBlock({ feature }: { feature: typeof FEATURES[0] }) {
  const { ref, inView } = useInView()
  const { Visual } = feature
  return (
    <div ref={ref} style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(2rem, 4vw, 5rem)',
      alignItems: 'center',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: 'opacity 650ms, transform 650ms cubic-bezier(0.23,1,0.32,1)',
    }} className="lp-feature-grid">
      <div style={{ order: feature.flip ? 1 : 0 }} className="lp-feature-text">
        <span style={{
          display: 'inline-block',
          fontFamily: 'var(--font-jetbrains)', fontSize: '0.625rem',
          color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'rgba(201,147,58,0.1)', padding: '0.3rem 0.625rem',
          borderRadius: '0.375rem', border: `1px solid rgba(201,147,58,0.2)`,
          marginBottom: '1.25rem',
        }}>{feature.tag}</span>
        <h3 style={{
          fontFamily: 'var(--font-hanken)', fontWeight: 700,
          fontSize: 'clamp(1.375rem, 2.5vw, 2rem)',
          color: C.text, letterSpacing: '-0.02em', lineHeight: 1.2,
          margin: '0 0 1rem',
        }}>{feature.title}</h3>
        <p style={{
          fontFamily: 'var(--font-manrope)', fontSize: '1rem',
          color: C.muted, lineHeight: 1.7, maxWidth: '48ch', margin: 0,
        }}>{feature.body}</p>
      </div>
      <div style={{ order: feature.flip ? 0 : 1 }} className="lp-feature-visual">
        <Visual />
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" style={{ ...sectionPad, background: C.abyss }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5.5rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-hanken)', fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: C.text, letterSpacing: '-0.025em', margin: '0 0 1rem',
          }}>Tudo que o gerente precisa. Nada que atrapalha.</h2>
          <p style={{
            fontFamily: 'var(--font-manrope)', fontSize: '1.0625rem',
            color: C.muted, lineHeight: 1.6, maxWidth: '54ch', margin: '0 auto',
          }}>
            Cada funcionalidade foi construída a partir de dores reais das lojas de Ciudad del Este.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4rem, 7vw, 7rem)' }}>
          {FEATURES.map(f => <FeatureBlock key={f.id} feature={f} />)}
        </div>
      </div>
    </section>
  )
}

// ── Product Preview ────────────────────────────────────────────────────────────

function ProductPreview() {
  const { ref, inView } = useInView(0.1)
  return (
    <section id="demo" style={{
      ...sectionPad, background: C.deep,
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 4vw, 4rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-hanken)', fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: C.text, letterSpacing: '-0.025em', margin: '0 0 1rem',
          }}>O produto em ação.</h2>
          <p style={{
            fontFamily: 'var(--font-manrope)', fontSize: '1.0625rem',
            color: C.muted, maxWidth: '50ch', margin: '0 auto',
          }}>
            Dados reais de vendas, comissão calculada automaticamente, ranking atualizado na importação.
          </p>
        </div>

        <div ref={ref} style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 700ms, transform 700ms cubic-bezier(0.23,1,0.32,1)',
        }}>
          <div style={{
            background: C.elevated, borderRadius: '1.5rem',
            border: `1px solid rgba(255,255,255,0.08)`,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.55)',
          }}>
            {/* Window chrome */}
            <div style={{
              background: C.abyss, padding: '0.875rem 1.25rem',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
              <div style={{
                flex: 1, height: 24, background: C.deep, borderRadius: '0.375rem',
                margin: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontFamily: 'var(--font-jetbrains)', color: C.muted,
              }}>
                gds-frame.com/dashboard
              </div>
            </div>

            {/* App layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }} className="lp-app-layout">
              {/* Sidebar */}
              <div style={{ background: C.deep, borderRight: `1px solid ${C.border}`, padding: '1.25rem 0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', padding: '0 0.25rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '0.375rem',
                    background: 'rgba(201,147,58,0.15)', border: `1px solid rgba(201,147,58,0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontFamily: 'var(--font-hanken)', fontWeight: 700, color: C.gold,
                  }}>G</div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-hanken)', fontWeight: 600, color: C.text }}>GDS Frame</div>
                    <div style={{ fontSize: '0.5rem', color: C.muted }}>3 lojas</div>
                  </div>
                </div>
                {['Dashboard', 'Vendedores', 'Usuários', 'Treinamentos', 'Configurações'].map((item, i) => (
                  <div key={item} style={{
                    padding: '0.4375rem 0.625rem', borderRadius: '0.375rem', marginBottom: 2,
                    background: i === 0 ? 'rgba(201,147,58,0.1)' : 'transparent',
                    border: i === 0 ? `1px solid rgba(201,147,58,0.2)` : '1px solid transparent',
                    fontSize: '0.6875rem', fontFamily: 'var(--font-manrope)',
                    color: i === 0 ? C.gold : C.muted, cursor: 'default',
                  }}>{item}</div>
                ))}
              </div>

              {/* Main */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  {[
                    { l: 'Total Vendido', v: 'G$847.200', d: '+12%', dc: C.green },
                    { l: 'Ticket Médio', v: 'G$7.060', d: '+3%', dc: C.green },
                    { l: 'Comissão Total', v: 'G$74.390', d: 'calculada', dc: C.gold },
                    { l: 'Clientes Ativos', v: '312', d: '+18 novos', dc: C.blue },
                  ].map(k => (
                    <div key={k.l} style={{
                      background: C.elevated, borderRadius: '0.625rem',
                      border: `1px solid ${C.border}`, padding: '0.75rem 0.875rem',
                    }}>
                      <div style={{ fontSize: '0.5rem', color: C.muted, marginBottom: 3, fontFamily: 'var(--font-jetbrains)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.l}</div>
                      <div style={{ fontSize: '0.875rem', color: C.text, fontWeight: 700, fontFamily: 'var(--font-jetbrains)' }}>{k.v}</div>
                      <div style={{ fontSize: '0.5rem', color: k.dc, marginTop: 3 }}>{k.d}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: C.elevated, borderRadius: '0.75rem', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  <div style={{
                    padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-hanken)', fontWeight: 600, color: C.text }}>Ranking de Vendedores</span>
                    <span style={{ fontSize: '0.5rem', fontFamily: 'var(--font-jetbrains)', color: C.gold, background: 'rgba(201,147,58,0.1)', padding: '0.175rem 0.45rem', borderRadius: '0.25rem' }}>Jun 2025</span>
                  </div>
                  <div>
                    {[
                      { n: 'Carlos Martínez', s: 'Jebai', v: 'G$142.800', m: 'Meta 3', pct: 94, top: true },
                      { n: 'Ana Rodríguez', s: 'Pajé 1', v: 'G$128.400', m: 'Meta 2', pct: 79, top: false },
                      { n: 'Diego Pérez', s: 'Pajé 2', v: 'G$117.200', m: 'Meta 2', pct: 68, top: false },
                      { n: 'Maria Santos', s: 'Jebai', v: 'G$98.600', m: 'Meta 1', pct: 55, top: false },
                      { n: 'Roberto Aquino', s: 'Pajé 1', v: 'G$87.400', m: 'Meta 1', pct: 47, top: false },
                    ].map((r, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '24px 1fr 76px 56px',
                        alignItems: 'center', gap: '0.625rem', padding: '0.4rem 1rem',
                        background: r.top ? 'rgba(201,147,58,0.03)' : 'transparent',
                        borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                      }}>
                        <span style={{ fontSize: '0.5625rem', color: r.top ? C.gold : C.muted, fontFamily: 'var(--font-jetbrains)', fontWeight: 700 }}>#{i + 1}</span>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: r.top ? C.text : C.muted, fontFamily: 'var(--font-manrope)' }}>
                            {r.n} <span style={{ color: C.muted, fontSize: '0.5rem' }}>{r.s}</span>
                          </div>
                          <div style={{ height: 2, background: C.deep, borderRadius: 1, marginTop: 3 }}>
                            <div style={{ height: 2, width: `${r.pct}%`, background: r.top ? C.gold : C.blue, borderRadius: 1 }} />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.5625rem', color: r.top ? C.gold : C.text, fontFamily: 'var(--font-jetbrains)', fontWeight: 600, textAlign: 'right' }}>{r.v}</span>
                        <span style={{ fontSize: '0.5rem', color: C.gold, fontFamily: 'var(--font-jetbrains)', background: 'rgba(201,147,58,0.1)', padding: '0.125rem 0.35rem', borderRadius: '0.25rem', textAlign: 'center' }}>{r.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter',
    price: '97',
    desc: 'Para uma loja que quer sair das planilhas.',
    features: ['1 loja ativa', 'Importação CEC ilimitada', 'Ranking de vendedores', 'Motor de comissão básico', 'Até 30 vendedores', 'Suporte por e-mail'],
    cta: 'Começar no Starter',
    featured: false,
  },
  {
    name: 'Profissional',
    price: '197',
    desc: 'Multi-loja com comissão configurável e LMS.',
    features: ['Até 3 lojas ativas', 'Importação CEC ilimitada', 'Ranking unificado multi-loja', 'Motor de comissão avançado', 'Treinamentos LMS + quiz', 'Relatório por período', 'Suporte prioritário'],
    cta: 'Começar agora',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: null,
    desc: 'Para redes com necessidades específicas.',
    features: ['Lojas ilimitadas', 'Integração com sistemas ERP', 'Customização do motor', 'Onboarding dedicado', 'SLA garantido', 'Acesso à API'],
    cta: 'Falar com a equipe',
    featured: false,
  },
]

function PricingCard({ plan }: { plan: typeof PLANS[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: plan.featured ? C.elevated : C.deep,
        border: `1px solid ${plan.featured ? 'rgba(201,147,58,0.4)' : C.border}`,
        borderRadius: '1.5rem', padding: '2rem',
        boxShadow: plan.featured ? '0 8px 40px rgba(201,147,58,0.12)' : 'none',
        transform: plan.featured ? 'scale(1.03)' : hov ? 'translateY(-4px)' : 'none',
        transition: 'transform 250ms, box-shadow 250ms',
        position: 'relative', overflow: 'hidden',
      }}>
      {plan.featured && (
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          background: C.gold, color: C.abyss,
          fontSize: '0.5625rem', fontFamily: 'var(--font-jetbrains)', fontWeight: 700,
          letterSpacing: '0.09em', textTransform: 'uppercase',
          padding: '0.3rem 1.125rem', borderRadius: '0 0 0.625rem 0.625rem',
        }}>Recomendado</div>
      )}

      <div style={{ marginTop: plan.featured ? '0.75rem' : 0 }}>
        <div style={{ fontFamily: 'var(--font-hanken)', fontWeight: 700, fontSize: '1.125rem', color: C.text, marginBottom: '0.375rem' }}>{plan.name}</div>
        <div style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: C.muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>{plan.desc}</div>

        <div style={{ marginBottom: '1.75rem' }}>
          {plan.price ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.875rem', color: C.muted }}>R$</span>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: '2.5rem', color: C.text, lineHeight: 1 }}>{plan.price}</span>
              <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: C.muted }}>/mês</span>
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '1.25rem', fontWeight: 600, color: C.text }}>Sob consulta</span>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {plan.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.625rem' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="8" cy="8" r="7.5" stroke={C.gold} strokeOpacity="0.35" />
                <path d="M5 8l2 2 4-4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: C.muted, lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        {plan.featured ? (
          <GoldButton href="/login" block>{plan.cta}</GoldButton>
        ) : (
          <Link href="/login" style={{
            display: 'block', textAlign: 'center',
            fontFamily: 'var(--font-hanken)', fontWeight: 600, fontSize: '0.9375rem',
            color: C.gold, padding: '0.875rem 2rem',
            border: `1px solid rgba(201,147,58,0.3)`, borderRadius: '0.5rem',
            textDecoration: 'none', transition: 'background 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,147,58,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >{plan.cta}</Link>
        )}
      </div>
    </div>
  )
}

function PricingSection() {
  return (
    <section id="precos" style={{ ...sectionPad, background: C.abyss }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 5vw, 5rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-hanken)', fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: C.text, letterSpacing: '-0.025em', margin: '0 0 1rem',
          }}>Preços diretos. Sem surpresa no boleto.</h2>
          <p style={{
            fontFamily: 'var(--font-manrope)', fontSize: '1.0625rem',
            color: C.muted, maxWidth: '46ch', margin: '0 auto',
          }}>
            Cancele quando quiser. Sem taxa de setup. Sem fidelidade mínima.
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem', alignItems: 'center',
        }}>
          {PLANS.map(p => <PricingCard key={p.name} plan={p} />)}
        </div>
      </div>
    </section>
  )
}

// ── Social Proof ───────────────────────────────────────────────────────────────

const PROOFS = [
  { metric: '+38%', label: 'de aumento no registro de vendas no primeiro mês de uso' },
  { metric: '3 lojas', label: 'gerenciadas em um único painel, com visões separadas por loja e ranking unificado' },
  { metric: 'Zero', label: 'discussões sobre comissão no fechamento do mês — o sistema calcula e todos veem o mesmo número' },
]

function SocialProofSection() {
  const { ref, inView } = useInView(0.2)
  return (
    <section ref={ref} style={{
      ...sectionPad, background: C.deep,
      borderTop: `1px solid ${C.border}`,
    }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 4vw, 4.5rem)' }}>
          <h2 style={{
            fontFamily: 'var(--font-hanken)', fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: C.text, letterSpacing: '-0.025em', margin: '0 0 1rem',
          }}>Números reais. Das lojas reais.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {PROOFS.map((p, i) => (
            <div key={i} style={{
              background: C.elevated, borderRadius: '1.25rem',
              border: `1px solid ${C.border}`, padding: '2rem',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 600ms ${i * 120}ms, transform 600ms ${i * 120}ms cubic-bezier(0.23,1,0.32,1)`,
            }}>
              <div style={{
                fontFamily: 'var(--font-jetbrains)', fontWeight: 700,
                fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', color: C.gold,
                lineHeight: 1, marginBottom: '1rem',
              }}>{p.metric}</div>
              <p style={{
                fontFamily: 'var(--font-manrope)', fontSize: '1rem',
                color: C.text, lineHeight: 1.6, margin: '0 0 1.25rem',
              }}>{p.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Preciso mudar o sistema das lojas para usar o GDS Frame?',
    a: 'Não. O GDS Frame funciona como uma camada acima do sistema atual. Você exporta o relatório HTML do CEC e faz upload — o resto é automático.',
  },
  {
    q: 'Como funciona a importação do CEC?',
    a: 'O sistema faz parse automático do HTML exportado pelo seu sistema de vendas. Identifica clientes, vincula aos vendedores cadastrados e calcula métricas em segundos. Nenhuma coluna mapeada manualmente.',
  },
  {
    q: 'Posso configurar as regras de comissão para cada loja separadamente?',
    a: 'Sim. Cada loja tem metas e percentuais de comissão independentes. O motor aplica as regras automaticamente na importação, sem intervenção manual.',
  },
  {
    q: 'Os vendedores conseguem ver o próprio desempenho?',
    a: 'Sim. Cada vendedor acessa uma visão pessoal com seu ranking, metas, histórico e evolução — sem ver dados dos colegas.',
  },
  {
    q: 'O sistema funciona para redes com mais de 3 lojas?',
    a: 'O plano Profissional suporta até 3 lojas. Para redes maiores, oferecemos o plano Enterprise com configuração personalizada.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ ...sectionPad, background: C.abyss }}>
      <div style={{ ...container, maxWidth: 780 }}>
        <h2 style={{
          fontFamily: 'var(--font-hanken)', fontWeight: 700,
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          color: C.text, letterSpacing: '-0.025em', margin: '0 0 3rem', textAlign: 'center',
        }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: C.deep, borderRadius: '1rem',
              border: `1px solid ${open === i ? 'rgba(201,147,58,0.3)' : C.border}`,
              overflow: 'hidden', transition: 'border-color 200ms',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  textAlign: 'left',
                }}>
                <span style={{
                  fontFamily: 'var(--font-manrope)', fontWeight: 600, fontSize: '1rem', color: C.text,
                }}>{faq.q}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 250ms' }}>
                  <path d="M10 4v12M4 10h12" stroke={open === i ? C.gold : C.muted} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.375rem' }}>
                  <p style={{
                    fontFamily: 'var(--font-manrope)', fontSize: '0.9375rem',
                    color: C.muted, lineHeight: 1.7, margin: 0,
                  }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────────────────────

function FinalCTA({ onTourOpen }: { onTourOpen: () => void }) {
  return (
    <section style={{
      ...sectionPad, background: C.deep,
      borderTop: `1px solid ${C.border}`, textAlign: 'center',
    }}>
      <div style={{ ...container, maxWidth: 720 }}>
        <h2 style={{
          fontFamily: 'var(--font-hanken)', fontWeight: 800,
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: '0 0 1.25rem',
        }}>
          Pronto para ver os números<br />
          <span style={{ color: C.gold }}>de verdade?</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-manrope)', fontSize: '1.0625rem',
          color: C.muted, lineHeight: 1.6, margin: '0 auto 2.5rem', maxWidth: '48ch',
        }}>
          Sem período de teste limitado. Sem cartão de crédito para começar.
          Explore o dashboard agora pelo perfil que faz sentido pra você.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onTourOpen}
            style={{
              fontFamily: 'var(--font-hanken)', fontWeight: 600, fontSize: '1.0625rem',
              color: C.abyss, background: C.gold,
              padding: '1rem 2.5rem', borderRadius: '0.5rem',
              border: 'none', cursor: 'pointer',
              transition: 'filter 200ms, box-shadow 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(201,147,58,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.boxShadow = '' }}
          >Começar agora</button>
          <a href="mailto:contato@gds-frame.com" style={{
            fontFamily: 'var(--font-manrope)', fontWeight: 500, fontSize: '1rem',
            color: C.muted, textDecoration: 'none', padding: '0.875rem 1.25rem',
            transition: 'color 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >Ou fale com a gente</a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: C.abyss, borderTop: `1px solid ${C.border}`, padding: '3.5rem 0 2rem' }}>
      <div style={container}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: '3rem', alignItems: 'start', marginBottom: '2.5rem',
        }} className="lp-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ fontFamily: 'var(--font-hanken)', fontWeight: 800, fontSize: '1.125rem', color: C.gold }}>GDS</span>
              <span style={{ fontFamily: 'var(--font-hanken)', fontWeight: 700, fontSize: '1.125rem', color: C.text }}> Frame</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-manrope)', fontSize: '0.875rem',
              color: C.muted, lineHeight: 1.65, maxWidth: '38ch', margin: 0,
            }}>
              Sistema de gestão comercial para lojas de Ciudad del Este. Ranking, comissão e importação CEC em um painel.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem' }}>
            {[
              { title: 'Produto', links: ['Funcionalidades', 'Preços', 'Demo'] },
              { title: 'Empresa', links: ['Sobre', 'Contato', 'Privacidade'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 600, fontSize: '0.8125rem', color: C.text, marginBottom: '1rem' }}>{col.title}</div>
                {col.links.map(l => (
                  <a key={l} href="#" style={{
                    display: 'block', fontFamily: 'var(--font-manrope)', fontSize: '0.875rem',
                    color: C.muted, textDecoration: 'none', marginBottom: '0.5625rem',
                    transition: 'color 200ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                  >{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.6875rem', color: C.muted }}>
            © 2025 GDS Frame · Ciudad del Este
          </span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.6875rem', color: C.muted }}>
            Desenvolvido com GDS Frame
          </span>
        </div>
      </div>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function LandingClient() {
  const reduced = useReducedMotion()
  const [tourOpen, setTourOpen] = useState(false)

  return (
    <div style={{ background: C.abyss, color: C.text, minHeight: '100dvh' }}>
      <style>{`
        .lp-hero-grid { }
        .lp-app-layout { }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-hero-mockup { display: none; }
          .lp-feature-grid { grid-template-columns: 1fr !important; }
          .lp-feature-text, .lp-feature-visual { order: unset !important; }
          .lp-footer-grid { grid-template-columns: 1fr !important; }
          .lp-desktop { display: none !important; }
        }
        @media (max-width: 640px) {
          .lp-app-layout { grid-template-columns: 1fr !important; }
          .lp-app-layout > *:first-child { display: none; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>

      {tourOpen && <TourModal onClose={() => setTourOpen(false)} />}

      <NavBar onTourOpen={() => setTourOpen(true)} />
      <HeroSection reduced={reduced} onTourOpen={() => setTourOpen(true)} />
      <StatsBand />
      <FeaturesSection />
      <ProductPreview />
      <PricingSection />
      <SocialProofSection />
      <FAQSection />
      <FinalCTA onTourOpen={() => setTourOpen(true)} />
      <Footer />
    </div>
  )
}
