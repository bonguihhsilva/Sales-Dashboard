# LMS Fase 4 — Editor (montar AdminLmsClient) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montar `AdminLmsClient` (CRUD órfão) na rota `/dashboard/treinamentos`, com 2 abas (Conteúdo/Progresso), tema ouro/preto, campos faltantes (icon/cor/ordem/publico_alvo em trilha; xp_reward/aprovacao_minima em módulo; ordem em aula; explicação em questão), UI de edição para trilha/módulo/aula, toggle "Global" (só super_admin) e remoção do form morto de quiz por-aula (tabela `quizzes` aposentada).

**Architecture:** `page.tsx` vira Server Component que lê `?tab=conteudo|progresso` (default conteudo), busca trilhas/módulos/aulas/provas/questões (RLS client — tenant ∪ global) uma vez, e renderiza `AdminLmsClient` (aba Conteúdo) ou o painel de progresso existente (aba Progresso) reaproveitando os mesmos dados para os KPIs de XP. `actions.ts` ganha `is_global` em `createTrilhaAction` (validado por role), um helper `assertTrilhaAccess` para permitir super_admin editar/apagar trilhas globais (`tenant_id IS NULL`), `xp_reward`/`aprovacao_minima` em `updateModuloAction`/`createModuloAction`, e `explicacao` em `createQuestaoProvaAction`. As funções de quiz por-aula (`createQuizAction`/`deleteQuizAction`) são removidas (tabela retirada, 0 linhas, sem outro consumidor).

**Tech Stack:** Next.js 15 Server Actions, `createAdminClient()` (service-role) para escrita, `createClient()` (RLS) para leitura, LMS theme tokens.

**Spec:** `docs/superpowers/specs/2026-06-30-lms-db-migration-design.md` (seção 5).

**Decisões de escopo (YAGNI):**
- Edição de `prova` (titulo/nota_minima) e de `questão` não entram nesta fase — a spec só pede "campos faltantes" + edição para entidades cuja *update action já existe* (trilha/módulo/aula). Prova/questão continuam create+delete only.
- `is_global` é imutável após a criação (toggle só aparece no formulário de criar trilha).
- Editor visual de `slides` (jsonb) permanece fora de escopo (fase 2 do spec original, deferido).

---

### Task 1: `actions.ts` — campos novos, `is_global`, acesso a trilhas globais, remover quiz

**Files:**
- Modify: `src/app/dashboard/treinamentos/actions.ts`

- [ ] Substituir todo o conteúdo pelo seguinte:

```typescript
'use server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getTenantContext } from '@/lib/auth/tenant'

async function checkAuth() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  if (!['adm', 'gerente', 'super_admin'].includes(profile.role || '')) {
    throw new Error('Acesso negado')
  }

  let finalTenantId = profile.tenant_id ?? profile.original_tenant_id
  if (!finalTenantId) {
     throw new Error('Ação negada: Como Super Administrador, selecione uma organização (tenant) ativa no painel antes de gerenciar os treinamentos.')
  }

  return { user, profile: { ...profile, tenant_id: finalTenantId } }
}

type AuthedProfile = { tenant_id: string; role?: string | null }

// Garante que o usuário pode editar/apagar a trilha: dona do tenant, ou
// global (tenant_id IS NULL) e o usuário é super_admin.
async function assertTrilhaAccess(
  adminDb: ReturnType<typeof createAdminClient>,
  trilhaId: string,
  profile: AuthedProfile
) {
  const { data: trilha, error } = await adminDb
    .from('trilhas')
    .select('id, tenant_id')
    .eq('id', trilhaId)
    .single()

  if (error || !trilha) throw new Error('Trilha não encontrada')

  const isOwnTenant = trilha.tenant_id === profile.tenant_id
  const isGlobalAsSuperAdmin = trilha.tenant_id === null && profile.role === 'super_admin'

  if (!isOwnTenant && !isGlobalAsSuperAdmin) {
    throw new Error('Acesso negado a esta trilha')
  }
}

// --- TRILHAS ---
export async function createTrilhaAction(data: {
  titulo: string
  descricao: string
  ativa: boolean
  icon?: string
  cor?: string
  ordem?: number
  publico_alvo?: string
  is_global?: boolean
}) {
  try {
    const { profile } = await checkAuth()

    if (data.is_global && profile.role !== 'super_admin') {
      throw new Error('Apenas super administradores podem criar trilhas globais')
    }

    const adminDb = createAdminClient()
    const { is_global, ...rest } = data

    const { error } = await adminDb
      .from('trilhas')
      .insert({
        ...rest,
        is_global: !!is_global,
        tenant_id: is_global ? null : profile.tenant_id,
      })

    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/treinamentos')
    return { success: true }
  } catch (e: any) {
    console.error('Error in createTrilhaAction:', e)
    return { success: false, error: e.message }
  }
}

export async function updateTrilhaAction(id: string, data: {
  titulo?: string
  descricao?: string
  ativa?: boolean
  icon?: string
  cor?: string
  ordem?: number
  publico_alvo?: string
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  await assertTrilhaAccess(adminDb, id, profile)

  const { error } = await adminDb.from('trilhas').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteTrilhaAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  await assertTrilhaAccess(adminDb, id, profile)

  const { error } = await adminDb.from('trilhas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

// --- MÓDULOS ---
export async function createModuloAction(data: {
  trilha_id: string
  titulo: string
  descricao: string
  ordem: number
  xp_reward?: number
  aprovacao_minima?: number
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()

  const { error } = await adminDb
    .from('modulos')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function updateModuloAction(id: string, data: {
  titulo?: string
  descricao?: string
  ordem?: number
  xp_reward?: number
  aprovacao_minima?: number
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('modulos').update(data).eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteModuloAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('modulos').delete().eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

// --- AULAS ---
export async function createAulaAction(data: {
  modulo_id: string
  titulo: string
  tipo_conteudo: string
  url_midia: string
  conteudo_texto: string
  ordem: number
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()

  const { error } = await adminDb
    .from('aulas')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function updateAulaAction(id: string, data: {
  titulo?: string
  tipo_conteudo?: string
  url_midia?: string
  conteudo_texto?: string
  ordem?: number
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('aulas').update(data).eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteAulaAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('aulas').delete().eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

// --- PROVAS E QUESTÕES ---
export async function createProvaAction(data: { modulo_id: string; titulo: string; nota_minima: number }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('provas')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteProvaAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('provas').delete().eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function createQuestaoProvaAction(data: {
  prova_id: string
  pergunta: string
  opcoes: string[]
  indice_correta: number
  explicacao?: string
}) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('questoes_prova')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteQuestaoProvaAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('questoes_prova').delete().eq('id', id).eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}
```

- [ ] Commit:

```bash
git add src/app/dashboard/treinamentos/actions.ts
git commit -m "feat(lms): actions ganham is_global, campos novos e acesso a trilhas globais

- createTrilhaAction aceita icon/cor/ordem/publico_alvo/is_global (super_admin only)
- assertTrilhaAccess libera super_admin editar/apagar trilhas globais
- createModuloAction/updateModuloAction ganham xp_reward/aprovacao_minima
- createQuestaoProvaAction ganha explicacao
- Remove createQuizAction/deleteQuizAction (tabela quizzes aposentada, 0 linhas)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: `AdminLmsClient.tsx` — restyle ouro/preto, campos novos, edição, toggle global, remove quiz

**Files:**
- Modify: `src/app/dashboard/treinamentos/AdminLmsClient.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, ChevronRight, BookOpen, Video, FileText, AlignLeft, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { LMS as C } from '@/lib/lms/theme'
import {
  createTrilhaAction, updateTrilhaAction, deleteTrilhaAction,
  createModuloAction, updateModuloAction, deleteModuloAction,
  createAulaAction, updateAulaAction, deleteAulaAction,
  createProvaAction, deleteProvaAction,
  createQuestaoProvaAction, deleteQuestaoProvaAction
} from './actions'

interface Trilha {
  id: string; titulo: string; descricao: string | null; icon: string | null; cor: string | null
  ordem: number; publico_alvo: string | null; ativa: boolean; is_global: boolean; tenant_id: string | null
}
interface Modulo {
  id: string; trilha_id: string; titulo: string; descricao: string | null
  ordem: number; xp_reward: number; aprovacao_minima: number
}
interface Aula {
  id: string; modulo_id: string; titulo: string; tipo_conteudo: string
  url_midia: string | null; conteudo_texto: string | null; ordem: number
}
interface Prova { id: string; modulo_id: string; titulo: string; nota_minima: number }
interface QuestaoProva {
  id: string; prova_id: string; pergunta: string; opcoes: string[]
  indice_correta: number; explicacao: string | null
}

type ModalState = { isOpen: boolean; type: string; payload?: any }

const inputStyle: React.CSSProperties = {
  width: '100%', background: C.surface2, border: `1px solid ${C.border}`,
  borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem',
  color: C.text, fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.625rem', fontFamily: 'DM Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function AdminLmsClient({
  initialTrilhas, initialModulos, initialAulas, initialProvas, initialQuestoesProva, isSuperAdmin
}: {
  initialTrilhas: Trilha[]
  initialModulos: Modulo[]
  initialAulas: Aula[]
  initialProvas: Prova[]
  initialQuestoesProva: QuestaoProva[]
  isSuperAdmin: boolean
}) {
  const [activeTrilhaId, setActiveTrilhaId] = useState<string | null>(null)
  const [activeModulo, setActiveModulo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: '' })

  const activeTrilha = initialTrilhas.find(t => t.id === activeTrilhaId) ?? null

  const handleAction = async (actionFn: () => Promise<any>, successCallback?: () => void) => {
    setLoading(true)
    try {
      const res = await actionFn()
      if (res && res.error) throw new Error(res.error)
      if (successCallback) successCallback()
    } catch (e: any) {
      toast.error('Erro', { description: e.message || 'Ocorreu um erro' })
    }
    setLoading(false)
    setModal({ isOpen: false, type: '' })
  }

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '0.5rem 1rem', background: C.gold, color: C.bg, fontWeight: 800,
    borderRadius: '0.5rem', border: 'none', fontSize: '0.8125rem', cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
  }
  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '0.5rem 1rem', background: 'transparent', color: C.text, fontWeight: 700,
    borderRadius: '0.5rem', border: `1px solid ${C.border}`, fontSize: '0.8125rem', cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
  }
  const iconBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
    border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer',
  }
  const iconBtnDanger: React.CSSProperties = { ...iconBtn, color: C.red, borderColor: 'rgba(239,68,68,0.3)' }

  // ── Sidebar ──────────────────────────────────────────────
  const renderSidebar = () => (
    <div style={{
      width: '20rem', flexShrink: 0, background: C.elevated, borderRight: `1px solid ${C.border}`,
      minHeight: 'calc(100vh - 5rem)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: C.text }}>Trilhas</h2>
        <button style={iconBtn} onClick={() => setModal({ isOpen: true, type: 'createTrilha' })} aria-label="Nova trilha">
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[...initialTrilhas].sort((a, b) => a.ordem - b.ordem).map(t => {
          const selected = activeTrilhaId === t.id
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTrilhaId(t.id); setActiveModulo(null) }}
              style={{
                display: 'flex', flexDirection: 'column', gap: 4, padding: '0.875rem',
                borderRadius: '0.75rem', border: `1px solid ${selected ? C.goldBorder : C.border}`,
                background: selected ? C.goldBg : C.surface, textAlign: 'left', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.icon && <span>{t.icon}</span>}
                {t.titulo}
              </span>
              <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.ativa ? C.green : C.red }} />
                {t.ativa ? 'Ativa' : 'Inativa'}
                {t.is_global && <span style={{ color: C.blue }}>· Global</span>}
              </span>
            </button>
          )
        })}
        {initialTrilhas.length === 0 && (
          <div style={{ fontSize: '0.75rem', color: C.muted, textAlign: 'center', padding: '1rem' }}>
            Nenhuma trilha criada.
          </div>
        )}
      </div>
    </div>
  )

  // ── Conteúdo (trilha selecionada) ───────────────────────
  const renderContent = () => {
    if (!activeTrilha) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.text }}>Selecione uma trilha</h3>
          <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>Ou crie uma nova no menu lateral.</p>
        </div>
      )
    }

    const modulosDaTrilha = initialModulos.filter(m => m.trilha_id === activeTrilha.id).sort((a, b) => a.ordem - b.ordem)

    return (
      <div style={{ flex: 1, padding: '2rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeTrilha.icon && <span style={{ fontSize: '1.75rem' }}>{activeTrilha.icon}</span>}
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.375rem', color: C.text, margin: 0 }}>{activeTrilha.titulo}</h1>
              <p style={{ color: C.muted, fontSize: '0.8125rem', marginTop: 4 }}>{activeTrilha.descricao || 'Sem descrição'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button style={iconBtn} onClick={() => setModal({ isOpen: true, type: 'editTrilha', payload: activeTrilha })} aria-label="Editar trilha">
              <Pencil size={14} />
            </button>
            <button style={iconBtnDanger} onClick={() => {
              if (confirm('Tem certeza? Isso excluirá todos os módulos e aulas desta trilha!')) {
                handleAction(() => deleteTrilhaAction(activeTrilha.id), () => setActiveTrilhaId(null))
              }
            }} aria-label="Excluir trilha"><Trash2 size={14} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} color={C.gold} /> Módulos
          </h2>
          <button style={btnPrimary} onClick={() => setModal({ isOpen: true, type: 'createModulo', payload: { trilha_id: activeTrilha.id } })}>
            <Plus size={14} /> Novo Módulo
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {modulosDaTrilha.map(m => {
            const isExpanded = activeModulo === m.id
            const aulas = initialAulas.filter(a => a.modulo_id === m.id).sort((a, b) => a.ordem - b.ordem)
            const prova = initialProvas.find(p => p.modulo_id === m.id)

            return (
              <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
                <div
                  onClick={() => setActiveModulo(isExpanded ? null : m.id)}
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div>
                    <h3 style={{ fontWeight: 700, color: C.text, fontSize: '0.9375rem', margin: 0 }}>{m.titulo}</h3>
                    <p style={{ fontSize: '0.6875rem', color: C.muted, fontFamily: 'DM Mono, monospace', marginTop: 3 }}>
                      {aulas.length} aulas · +{m.xp_reward} XP · aprovação ≥{m.aprovacao_minima}% {prova ? '· tem prova' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button style={iconBtn} onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'editModulo', payload: m }) }} aria-label="Editar módulo">
                      <Pencil size={13} />
                    </button>
                    <button style={iconBtnDanger} onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Excluir módulo?')) handleAction(() => deleteModuloAction(m.id))
                    }} aria-label="Excluir módulo"><Trash2 size={13} /></button>
                    <ChevronRight size={18} color={C.muted} style={{ transform: isExpanded ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }} />
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.25rem', borderTop: `1px solid ${C.border}`, background: C.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <h4 style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, fontWeight: 700 }}>Aulas</h4>
                      <button style={{ ...btnGhost, padding: '0.3rem 0.625rem', fontSize: '0.6875rem' }} onClick={() => setModal({ isOpen: true, type: 'createAula', payload: { modulo_id: m.id } })}>
                        <Plus size={12} /> Adicionar aula
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {aulas.map(a => {
                        const icon = a.tipo_conteudo === 'video' ? <Video size={14} /> : a.tipo_conteudo === 'pdf' ? <FileText size={14} /> : <AlignLeft size={14} />
                        return (
                          <div key={a.id} style={{ padding: '0.75rem 1rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{ padding: 6, background: C.goldBg, color: C.gold, borderRadius: '0.375rem', display: 'flex' }}>{icon}</div>
                              <div>
                                <div style={{ fontWeight: 600, color: C.text, fontSize: '0.8125rem' }}>{a.titulo}</div>
                                <div style={{ fontSize: '0.625rem', color: C.muted, fontFamily: 'DM Mono, monospace' }}>
                                  #{a.ordem} · {a.tipo_conteudo.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button style={iconBtn} onClick={() => setModal({ isOpen: true, type: 'editAula', payload: a })} aria-label="Editar aula"><Pencil size={12} /></button>
                              <button style={iconBtnDanger} onClick={() => {
                                if (confirm('Excluir aula?')) handleAction(() => deleteAulaAction(a.id))
                              }} aria-label="Excluir aula"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        )
                      })}
                      {aulas.length === 0 && <div style={{ fontSize: '0.75rem', color: C.muted, fontStyle: 'italic', padding: '0.5rem 0' }}>Nenhuma aula neste módulo.</div>}
                    </div>

                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                        <h4 style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, fontWeight: 700 }}>Prova do módulo</h4>
                        {!prova && (
                          <button style={{ ...btnGhost, padding: '0.3rem 0.625rem', fontSize: '0.6875rem' }} onClick={() => setModal({ isOpen: true, type: 'createProva', payload: { modulo_id: m.id } })}>
                            <Plus size={12} /> Adicionar prova
                          </button>
                        )}
                      </div>

                      {prova ? (
                        <div style={{ padding: '1rem', border: `1px solid ${C.goldBorder}`, background: C.goldBg, borderRadius: '0.625rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: C.gold, fontSize: '0.8125rem' }}>{prova.titulo}</div>
                              <div style={{ fontSize: '0.6875rem', color: C.muted, fontFamily: 'DM Mono, monospace' }}>Nota mínima: {prova.nota_minima}%</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button style={{ ...btnGhost, padding: '0.3rem 0.625rem', fontSize: '0.6875rem' }} onClick={() => setModal({ isOpen: true, type: 'createQuestaoProva', payload: { prova_id: prova.id } })}>+ Questão</button>
                              <button style={iconBtnDanger} onClick={() => {
                                if (confirm('Excluir prova?')) handleAction(() => deleteProvaAction(prova.id))
                              }} aria-label="Excluir prova"><Trash2 size={13} /></button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {initialQuestoesProva.filter(qp => qp.prova_id === prova.id).map(qp => (
                              <div key={qp.id} style={{ fontSize: '0.75rem', background: C.surface, padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qp.pergunta}</span>
                                <button style={{ ...iconBtnDanger, width: '1.375rem', height: '1.375rem', flexShrink: 0 }} onClick={() => handleAction(() => deleteQuestaoProvaAction(qp.id))} aria-label="Excluir questão"><Trash2 size={11} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: C.muted, fontStyle: 'italic' }}>Módulo sem prova.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {modulosDaTrilha.length === 0 && (
            <div style={{ fontSize: '0.8125rem', color: C.muted, textAlign: 'center', padding: '2rem' }}>Nenhum módulo nesta trilha ainda.</div>
          )}
        </div>
      </div>
    )
  }

  // ── Modal genérico ───────────────────────────────────────
  const renderModal = () => {
    if (!modal.isOpen) return null
    const close = () => setModal({ isOpen: false, type: '' })

    const modalCard: React.CSSProperties = {
      background: C.elevated, border: `1px solid ${C.borderStrong}`, borderRadius: '0.875rem',
      boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6)', width: '100%', maxWidth: '28rem',
      padding: '1.5rem', overflowY: 'auto', maxHeight: '90vh',
    }
    const modalTitle: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.0625rem', color: C.text, marginBottom: '1.25rem' }
    const formGap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' }
    const footer: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={modalCard}>

          {modal.type === 'createTrilha' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createTrilhaAction({
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ativa: fd.get('ativa') === 'true',
                icon: fd.get('icon') as string,
                cor: fd.get('cor') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
                publico_alvo: fd.get('publico_alvo') as string,
                is_global: fd.get('is_global') === 'on',
              }))
            }}>
              <h3 style={modalTitle}>Nova Trilha</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required style={inputStyle} /></Field>
                <Field label="Descrição"><textarea name="descricao" rows={3} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ícone (emoji)"><input name="icon" placeholder="🎯" style={inputStyle} /></Field>
                  <Field label="Cor (hex)"><input name="cor" placeholder="#C9933A" style={inputStyle} /></Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={0} style={inputStyle} /></Field>
                  <Field label="Status">
                    <select name="ativa" style={inputStyle} defaultValue="true">
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </Field>
                </div>
                <Field label="Público-alvo"><input name="publico_alvo" placeholder="Ex: vendedores novatos" style={inputStyle} /></Field>
                {isSuperAdmin && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: C.text }}>
                    <input type="checkbox" name="is_global" />
                    Trilha global (visível para todos os tenants)
                  </label>
                )}
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'editTrilha' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => updateTrilhaAction(modal.payload.id, {
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ativa: fd.get('ativa') === 'true',
                icon: fd.get('icon') as string,
                cor: fd.get('cor') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
                publico_alvo: fd.get('publico_alvo') as string,
              }))
            }}>
              <h3 style={modalTitle}>Editar Trilha</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required defaultValue={modal.payload.titulo} style={inputStyle} /></Field>
                <Field label="Descrição"><textarea name="descricao" rows={3} defaultValue={modal.payload.descricao ?? ''} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ícone (emoji)"><input name="icon" defaultValue={modal.payload.icon ?? ''} style={inputStyle} /></Field>
                  <Field label="Cor (hex)"><input name="cor" defaultValue={modal.payload.cor ?? ''} style={inputStyle} /></Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={modal.payload.ordem} style={inputStyle} /></Field>
                  <Field label="Status">
                    <select name="ativa" style={inputStyle} defaultValue={String(modal.payload.ativa)}>
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </Field>
                </div>
                <Field label="Público-alvo"><input name="publico_alvo" defaultValue={modal.payload.publico_alvo ?? ''} style={inputStyle} /></Field>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'createModulo' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createModuloAction({
                trilha_id: modal.payload.trilha_id,
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
                xp_reward: parseInt(fd.get('xp_reward') as string) || 50,
                aprovacao_minima: parseInt(fd.get('aprovacao_minima') as string) || 70,
              }))
            }}>
              <h3 style={modalTitle}>Novo Módulo</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required style={inputStyle} /></Field>
                <Field label="Descrição"><textarea name="descricao" rows={2} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={0} style={inputStyle} /></Field>
                  <Field label="XP"><input name="xp_reward" type="number" defaultValue={50} style={inputStyle} /></Field>
                  <Field label="Aprovação %"><input name="aprovacao_minima" type="number" defaultValue={70} style={inputStyle} /></Field>
                </div>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'editModulo' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => updateModuloAction(modal.payload.id, {
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
                xp_reward: parseInt(fd.get('xp_reward') as string) || 0,
                aprovacao_minima: parseInt(fd.get('aprovacao_minima') as string) || 0,
              }))
            }}>
              <h3 style={modalTitle}>Editar Módulo</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required defaultValue={modal.payload.titulo} style={inputStyle} /></Field>
                <Field label="Descrição"><textarea name="descricao" rows={2} defaultValue={modal.payload.descricao ?? ''} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={modal.payload.ordem} style={inputStyle} /></Field>
                  <Field label="XP"><input name="xp_reward" type="number" defaultValue={modal.payload.xp_reward} style={inputStyle} /></Field>
                  <Field label="Aprovação %"><input name="aprovacao_minima" type="number" defaultValue={modal.payload.aprovacao_minima} style={inputStyle} /></Field>
                </div>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'createAula' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createAulaAction({
                modulo_id: modal.payload.modulo_id,
                titulo: fd.get('titulo') as string,
                tipo_conteudo: fd.get('tipo_conteudo') as string,
                url_midia: fd.get('url_midia') as string,
                conteudo_texto: fd.get('conteudo_texto') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
              }))
            }}>
              <h3 style={modalTitle}>Nova Aula</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Tipo de conteúdo">
                    <select name="tipo_conteudo" style={inputStyle} defaultValue="video">
                      <option value="video">Vídeo</option>
                      <option value="pdf">PDF</option>
                      <option value="slide">Slide</option>
                      <option value="texto">Texto rico</option>
                    </select>
                  </Field>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={0} style={inputStyle} /></Field>
                </div>
                <Field label="URL (mídia/vídeo)"><input name="url_midia" placeholder="https://" style={inputStyle} /></Field>
                <Field label="Conteúdo (texto)"><textarea name="conteudo_texto" rows={3} style={inputStyle} /></Field>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'editAula' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => updateAulaAction(modal.payload.id, {
                titulo: fd.get('titulo') as string,
                tipo_conteudo: fd.get('tipo_conteudo') as string,
                url_midia: fd.get('url_midia') as string,
                conteudo_texto: fd.get('conteudo_texto') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0,
              }))
            }}>
              <h3 style={modalTitle}>Editar Aula</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" required defaultValue={modal.payload.titulo} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Tipo de conteúdo">
                    <select name="tipo_conteudo" style={inputStyle} defaultValue={modal.payload.tipo_conteudo}>
                      <option value="video">Vídeo</option>
                      <option value="pdf">PDF</option>
                      <option value="slide">Slide</option>
                      <option value="texto">Texto rico</option>
                    </select>
                  </Field>
                  <Field label="Ordem"><input name="ordem" type="number" defaultValue={modal.payload.ordem} style={inputStyle} /></Field>
                </div>
                <Field label="URL (mídia/vídeo)"><input name="url_midia" defaultValue={modal.payload.url_midia ?? ''} style={inputStyle} /></Field>
                <Field label="Conteúdo (texto)"><textarea name="conteudo_texto" rows={3} defaultValue={modal.payload.conteudo_texto ?? ''} style={inputStyle} /></Field>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'createProva' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createProvaAction({
                modulo_id: modal.payload.modulo_id,
                titulo: fd.get('titulo') as string,
                nota_minima: parseInt(fd.get('nota_minima') as string) || 70,
              }))
            }}>
              <h3 style={modalTitle}>Nova Prova</h3>
              <div style={formGap}>
                <Field label="Título"><input name="titulo" defaultValue="Prova Final" required style={inputStyle} /></Field>
                <Field label="Nota mínima (%)"><input type="number" name="nota_minima" defaultValue={70} required style={inputStyle} /></Field>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'createQuestaoProva' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const opcoes = [fd.get('opt0') as string, fd.get('opt1') as string, fd.get('opt2') as string, fd.get('opt3') as string]
              handleAction(() => createQuestaoProvaAction({
                prova_id: modal.payload.prova_id,
                pergunta: fd.get('pergunta') as string,
                opcoes,
                indice_correta: parseInt(fd.get('indice_correta') as string),
                explicacao: fd.get('explicacao') as string,
              }))
            }}>
              <h3 style={modalTitle}>Nova Questão</h3>
              <div style={formGap}>
                <Field label="Pergunta"><textarea name="pergunta" required rows={2} style={inputStyle} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <Field label="Opção 0"><input name="opt0" required style={inputStyle} /></Field>
                  <Field label="Opção 1"><input name="opt1" required style={inputStyle} /></Field>
                  <Field label="Opção 2"><input name="opt2" required style={inputStyle} /></Field>
                  <Field label="Opção 3"><input name="opt3" required style={inputStyle} /></Field>
                </div>
                <Field label="Índice da correta (0 a 3)">
                  <select name="indice_correta" style={inputStyle} defaultValue="0">
                    <option value="0">Opção 0</option>
                    <option value="1">Opção 1</option>
                    <option value="2">Opção 2</option>
                    <option value="3">Opção 3</option>
                  </select>
                </Field>
                <Field label="Explicação (mostrada após a resposta)"><textarea name="explicacao" rows={2} style={inputStyle} /></Field>
              </div>
              <div style={footer}>
                <button type="button" onClick={close} style={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 5rem)', width: '100%', position: 'relative' }}>
      {renderSidebar()}
      {renderContent()}
      {renderModal()}
    </div>
  )
}
```

- [ ] Commit:

```bash
git add src/app/dashboard/treinamentos/AdminLmsClient.tsx
git commit -m "feat(lms): restyle AdminLmsClient ouro/preto, edicao, toggle global, remove quiz

- Tema ouro/preto via LMS theme tokens (era Material-3/tailwind)
- Campos novos: trilha (icon/cor/ordem/publico_alvo/is_global), modulo (xp_reward/aprovacao_minima), aula (ordem), questao (explicacao)
- Modais de edicao para trilha/modulo/aula (update actions ja existiam)
- Toggle Global no criar trilha, visivel so para super_admin
- Remove form morto de quiz por-aula (tabela quizzes aposentada)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: `page.tsx` — 2 abas, busca DB real, monta `AdminLmsClient`

**Files:**
- Modify: `src/app/dashboard/treinamentos/page.tsx`

- [ ] Substituir todo o conteúdo pelo seguinte:

```tsx
import { getTenantContext } from '@/lib/auth/tenant'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LMS as C } from '@/lib/lms/theme'
import Link from 'next/link'
import AdminLmsClient from './AdminLmsClient'

export const dynamic = 'force-dynamic'

export default async function TreinamentosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  const role = profile.role || 'vendedor'
  if (role === 'vendedor') redirect('/vendedor/treinamentos')

  const { tab } = await searchParams
  const activeTab = tab === 'progresso' ? 'progresso' : 'conteudo'

  const supabase = await createClient()

  const [
    { data: trilhas },
    { data: modulos },
    { data: aulas },
    { data: provas },
    { data: questoesProva },
    { data: vendedores },
    { data: gamificacao },
  ] = await Promise.all([
    supabase.from('trilhas').select('*').order('ordem', { ascending: true }),
    supabase.from('modulos').select('*').order('ordem', { ascending: true }),
    supabase.from('aulas').select('*').order('ordem', { ascending: true }),
    supabase.from('provas').select('*'),
    supabase.from('questoes_prova').select('*'),
    supabase.from('profiles').select('id, name, vendor_id').eq('role', 'vendedor').order('name'),
    supabase.from('gamificacao').select('usuario_id, xp_total, nivel'),
  ])

  const xpMap: Record<string, { xp: number; nivel: number }> = {}
  for (const g of gamificacao || []) {
    xpMap[g.usuario_id] = { xp: g.xp_total, nivel: g.nivel }
  }

  const totalModulos = (modulos || []).length
  const totalXP = (modulos || []).reduce((acc, m) => acc + (m.xp_reward ?? 0), 0)

  const tabLink = (t: string) => `/dashboard/treinamentos${t === 'conteudo' ? '' : `?tab=${t}`}`
  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700,
    fontFamily: 'Syne, sans-serif', textDecoration: 'none', cursor: 'pointer',
    background: activeTab === t ? C.gold : 'transparent',
    color: activeTab === t ? C.bg : C.muted,
    border: `1px solid ${activeTab === t ? C.gold : C.border}`,
  })

  return (
    <div style={{ minHeight: '100vh', background: C.deep, color: C.text }}>

      {/* Header + tabs */}
      <div style={{ padding: '1.5rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
              Treinamentos — Visão Gerencial
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6875rem', color: C.muted, marginTop: 3 }}>
              {(trilhas || []).length} trilhas · {totalModulos} módulos · {totalXP} XP total disponível
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={tabLink('conteudo')} style={tabStyle('conteudo')}>Conteúdo</Link>
            <Link href={tabLink('progresso')} style={tabStyle('progresso')}>Progresso</Link>
          </div>
        </div>
      </div>

      {activeTab === 'conteudo' ? (
        <AdminLmsClient
          initialTrilhas={trilhas || []}
          initialModulos={modulos || []}
          initialAulas={aulas || []}
          initialProvas={provas || []}
          initialQuestoesProva={(questoesProva || []).map(q => ({ ...q, opcoes: Array.isArray(q.opcoes) ? q.opcoes : [] }))}
          isSuperAdmin={profile.role === 'super_admin'}
        />
      ) : (
        <div style={{ padding: '1.5rem 2rem' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Trilhas', value: (trilhas || []).length, color: C.gold },
              { label: 'Módulos', value: totalModulos, color: C.amber },
              { label: 'XP disponível', value: totalXP, color: C.blue },
              { label: 'Vendedores', value: vendedores?.length ?? 0, color: C.green },
            ].map(k => (
              <div key={k.label} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'DM Mono, monospace', color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Trilhas overview */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>Conteúdo disponível</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(trilhas || []).map((trilha, i) => {
                  const modCount = (modulos || []).filter(m => m.trilha_id === trilha.id).length
                  const xp = (modulos || []).filter(m => m.trilha_id === trilha.id).reduce((a, m) => a + (m.xp_reward ?? 0), 0)
                  return (
                    <div key={trilha.id} style={{
                      padding: '0.625rem 1rem',
                      borderBottom: i < (trilhas || []).length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        {trilha.icon && <span style={{ fontSize: '1rem' }}>{trilha.icon}</span>}
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>{trilha.titulo}</div>
                          <div style={{ fontSize: '0.625rem', color: C.muted, fontFamily: 'DM Mono, monospace' }}>{modCount} módulos</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.amber, fontWeight: 700 }}>+{xp} XP</span>
                        <Link href={`/vendedor/treinamentos/${trilha.id}`} className="lms-chip" style={{
                          fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted,
                          textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: '0.375rem',
                          padding: '0.25rem 0.5rem',
                        }}>Ver →</Link>
                      </div>
                    </div>
                  )
                })}
                {(trilhas || []).length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'DM Mono, monospace' }}>Nenhuma trilha cadastrada ainda.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progresso dos vendedores */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted, fontWeight: 600 }}>XP por vendedor</span>
              </div>
              {(!vendedores || vendedores.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: C.muted, fontSize: '0.75rem', fontFamily: 'DM Mono, monospace' }}>Nenhum vendedor cadastrado.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {vendedores
                    .map(v => ({ ...v, xp: xpMap[v.id]?.xp ?? 0, nivel: xpMap[v.id]?.nivel ?? 0 }))
                    .sort((a, b) => b.xp - a.xp)
                    .map((v, i) => {
                      const pct = totalXP > 0 ? Math.round((v.xp / totalXP) * 100) : 0
                      return (
                        <div key={v.id} style={{
                          padding: '0.625rem 1rem',
                          borderBottom: i < vendedores.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '0.75rem', color: C.text, fontWeight: v.xp > 0 ? 600 : 400 }}>{v.name}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              {v.nivel > 0 && (
                                <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted }}>Nv {v.nivel}</span>
                              )}
                              <span style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: v.xp > 0 ? C.amber : C.muted, fontWeight: 700 }}>{v.xp} XP</span>
                            </div>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: 3, width: `${pct}%`, background: C.amber, borderRadius: 2, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
              {(!gamificacao || gamificacao.length === 0) && vendedores && vendedores.length > 0 && (
                <div style={{ padding: '0.5rem 1rem', borderTop: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: '0.625rem', fontFamily: 'DM Mono, monospace', color: C.muted, margin: 0 }}>
                    Progresso zerado — vendedores ainda não iniciaram os treinamentos.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] `npx tsc --noEmit` — zero erros.
- [ ] `npm run build` — build de produção passa.
- [ ] Commit:

```bash
git add src/app/dashboard/treinamentos/page.tsx
git commit -m "feat(lms): page com 2 abas (Conteudo/Progresso), monta AdminLmsClient com dados reais

- Aba Conteudo (padrao) monta AdminLmsClient com trilhas/modulos/aulas/provas/questoes do DB
- Aba Progresso reaproveita os mesmos dados para KPIs reais (sem mais LMS_TRILHAS estatico)
- isSuperAdmin passado para liberar toggle Global no editor

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Verificação funcional mínima

- [ ] Logar como `adm`/`gerente`, acessar `/dashboard/treinamentos` — aba Conteúdo mostra trilhas reais do DB (Demo tenant), criar/editar/excluir trilha/módulo/aula/prova/questão funciona.
- [ ] Logar como `super_admin` com tenant ativo — checkbox "Trilha global" aparece no criar trilha; criar uma trilha global e confirmar que aparece para vendedores de outro tenant (RLS Fase 1 já cobre a leitura).
- [ ] Aba Progresso mostra XP real por vendedor, sem usar `LMS_TRILHAS`/`SKINCARE_TRILHAS`.
