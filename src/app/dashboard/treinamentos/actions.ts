'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getTenantContext } from '@/lib/auth/tenant'

async function checkAuth() {
  const { user, profile } = await getTenantContext()
  if (!user) redirect('/login')

  if (!['adm', 'gerente', 'super_admin'].includes(profile.role || '')) {
    throw new Error('Acesso negado')
  }
  
  // Se for super_admin e não tiver tenant ativo no cookie de masquerade, pega o primeiro tenant disponível
  let finalTenantId = profile.tenant_id ?? profile.original_tenant_id
  if (!finalTenantId) {
     throw new Error('Ação negada: Como Super Administrador, selecione uma organização (tenant) ativa no painel antes de gerenciar os treinamentos.')
  }

  return { user, profile: { ...profile, tenant_id: finalTenantId } }
}


// --- TRILHAS ---
export async function createTrilhaAction(data: { titulo: string; descricao: string; ativa: boolean }) {
  try {
    const { profile } = await checkAuth()
    const adminDb = createAdminClient()

    const { error } = await adminDb
      .from('trilhas')
      .insert({ ...data, tenant_id: profile.tenant_id })
      
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/treinamentos')
    return { success: true }
  } catch (e: any) {
    console.error('Error in createTrilhaAction:', e)
    return { success: false, error: e.message }
  }
}

export async function updateTrilhaAction(id: string, data: { titulo?: string; descricao?: string; ativa?: boolean }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('trilhas')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteTrilhaAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('trilhas')
    .delete()
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

// --- MÓDULOS ---
export async function createModuloAction(data: { trilha_id: string; titulo: string; descricao: string; ordem: number }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  
  const { error } = await adminDb
    .from('modulos')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function updateModuloAction(id: string, data: { titulo?: string; descricao?: string; ordem?: number }) {
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
export async function createAulaAction(data: { modulo_id: string; titulo: string; tipo_conteudo: string; url_midia: string; conteudo_texto: string; ordem: number }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()

  const { error } = await adminDb
    .from('aulas')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function updateAulaAction(id: string, data: { titulo?: string; tipo_conteudo?: string; url_midia?: string; conteudo_texto?: string; ordem?: number }) {
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

// --- QUIZZES ---
export async function createQuizAction(data: { aula_id: string; pergunta: string; opcoes: string[]; indice_correta: number }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('quizzes')
    .insert({ ...data, tenant_id: profile.tenant_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos')
}

export async function deleteQuizAction(id: string) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('quizzes').delete().eq('id', id).eq('tenant_id', profile.tenant_id)
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

export async function createQuestaoProvaAction(data: { prova_id: string; pergunta: string; opcoes: string[]; indice_correta: number }) {
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
