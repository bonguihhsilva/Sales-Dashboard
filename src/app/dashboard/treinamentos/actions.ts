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
