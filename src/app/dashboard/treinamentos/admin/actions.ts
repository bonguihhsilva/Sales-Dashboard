'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single()
  if (profile?.role !== 'adm' && profile?.role !== 'gerente') {
    throw new Error('Acesso negado')
  }
  if (!profile?.tenant_id) {
    throw new Error('Tenant não encontrado')
  }
  return { user, profile }
}

// --- TRILHAS ---
export async function createTrilhaAction(data: { titulo: string; descricao: string; ativo: boolean }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  
  const { data: maxOrdemData } = await adminDb
    .from('trilhas')
    .select('ordem')
    .eq('tenant_id', profile.tenant_id)
    .order('ordem', { ascending: false })
    .limit(1)
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { error } = await adminDb
    .from('trilhas')
    .insert({ ...data, ordem, tenant_id: profile.tenant_id })
    
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function updateTrilhaAction(id: number, data: { titulo: string; descricao: string; ativo: boolean }) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('trilhas')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function deleteTrilhaAction(id: number) {
  const { profile } = await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('trilhas')
    .delete()
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

// --- MÓDULOS ---
export async function createModuloAction(data: { trilha_id: number; titulo: string; descricao: string; xp_reward: number }) {
  await checkAuth()
  const adminDb = createAdminClient()
  
  const { data: maxOrdemData } = await adminDb
    .from('modulos')
    .select('ordem')
    .eq('trilha_id', data.trilha_id)
    .order('ordem', { ascending: false })
    .limit(1)
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { error } = await adminDb
    .from('modulos')
    .insert({ ...data, ordem })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function updateModuloAction(id: number, data: { titulo: string; descricao: string; xp_reward: number }) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('modulos').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function deleteModuloAction(id: number) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('modulos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

// --- LIÇÕES ---
export async function createLicaoAction(data: { modulo_id: number; titulo: string; conteudo: string; video_url: string }) {
  await checkAuth()
  const adminDb = createAdminClient()
  
  const { data: maxOrdemData } = await adminDb
    .from('licoes')
    .select('ordem')
    .eq('modulo_id', data.modulo_id)
    .order('ordem', { ascending: false })
    .limit(1)
  const ordem = maxOrdemData && maxOrdemData.length > 0 ? maxOrdemData[0].ordem + 1 : 1

  const { error } = await adminDb
    .from('licoes')
    .insert({ ...data, ordem })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function updateLicaoAction(id: number, data: { titulo: string; conteudo: string; video_url: string }) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('licoes').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function deleteLicaoAction(id: number) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('licoes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

// --- QUESTÕES ---
export async function createQuestaoAction(data: { modulo_id: number; pergunta: string; opcao_a: string; opcao_b: string; opcao_c: string; opcao_d: string; resposta_correta: string; explicacao: string }) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('quiz_questoes')
    .insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function updateQuestaoAction(id: number, data: { pergunta: string; opcao_a: string; opcao_b: string; opcao_c: string; opcao_d: string; resposta_correta: string; explicacao: string }) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('quiz_questoes').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}

export async function deleteQuestaoAction(id: number) {
  await checkAuth()
  const adminDb = createAdminClient()
  const { error } = await adminDb.from('quiz_questoes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/treinamentos/admin')
}
