'use server'

import { getTenantContext } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const CAN_EDIT_COST = ['compras', 'adm', 'gerente', 'super_admin']

export type UpdateCostResult = { ok: true; unit_cost: number | null } | { ok: false; error: string }

/**
 * Grava o custo vigente de um produto com source='manual'.
 *
 * source='manual' e deliberado: a RPC upsert_product_costs (D-03) nunca
 * sobrescreve uma linha manual num upload de catalogo. Uma correcao feita
 * aqui sobrevive ao proximo import.
 *
 * O trigger trg_audit_product_costs registra quem mudou, quando e de/para
 * em audit_logs — custo altera margem, que alimenta comissao por lucro.
 */
export async function updateProductCost(
  productCode: string,
  rawCost: string
): Promise<UpdateCostResult> {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) return { ok: false, error: 'Nao autenticado' }
  if (!CAN_EDIT_COST.includes(profile.role)) return { ok: false, error: 'Acesso negado' }
  if (!profile.tenant_id) return { ok: false, error: 'Perfil sem tenant' }

  const code = productCode.trim()
  if (!code) return { ok: false, error: 'Codigo do produto obrigatorio' }

  // String vazia = "custo desconhecido" (NULL), que e semanticamente
  // diferente de zero (D-18). Nao colapsar os dois.
  const trimmed = rawCost.trim()
  let unitCost: number | null = null
  if (trimmed !== '') {
    const parsed = Number(trimmed.replace(',', '.'))
    if (!Number.isFinite(parsed)) return { ok: false, error: 'Custo invalido' }
    if (parsed < 0) return { ok: false, error: 'Custo nao pode ser negativo' }
    unitCost = parsed
  }

  const adminDb = createAdminClient()

  // Service-role bypassa RLS: o filtro por tenant_id e obrigatorio aqui.
  const { error } = await adminDb
    .from('product_costs')
    .update({ unit_cost: unitCost, source: 'manual', updated_at: new Date().toISOString() })
    .eq('tenant_id', profile.tenant_id)
    .eq('product_code', code)

  if (error) {
    console.error('updateProductCost falhou:', error.message)
    return { ok: false, error: 'Falha ao salvar o custo' }
  }

  revalidatePath('/dashboard/compras')
  return { ok: true, unit_cost: unitCost }
}

export type UpdateAttrsResult = { ok: true } | { ok: false; error: string }

export type ProductAttrs = {
  brand: string | null
  category: string | null
  model: string | null
  color: string | null
}

/**
 * Grava marca/categoria/modelo/cor manuais do produto (não vêm do catálogo).
 * Reusa product_costs como overlay por SKU — upsert com apenas estas colunas
 * não toca unit_cost/source/name em linha existente (semântica de
 * ON CONFLICT DO UPDATE SET só nas colunas do payload).
 */
export async function updateProductAttributes(
  productCode: string,
  attrs: ProductAttrs
): Promise<UpdateAttrsResult> {
  const { user, profile } = await getTenantContext()
  if (!user || !profile) return { ok: false, error: 'Nao autenticado' }
  if (!CAN_EDIT_COST.includes(profile.role)) return { ok: false, error: 'Acesso negado' }
  if (!profile.tenant_id) return { ok: false, error: 'Perfil sem tenant' }

  const code = productCode.trim()
  if (!code) return { ok: false, error: 'Codigo do produto obrigatorio' }

  const clean = (v: string | null) => (v && v.trim() !== '' ? v.trim() : null)

  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('product_costs')
    .upsert(
      {
        tenant_id: profile.tenant_id,
        product_code: code,
        brand: clean(attrs.brand),
        category: clean(attrs.category),
        model: clean(attrs.model),
        color: clean(attrs.color),
      },
      { onConflict: 'tenant_id,product_code' }
    )

  if (error) {
    console.error('updateProductAttributes falhou:', error.message)
    return { ok: false, error: 'Falha ao salvar atributos' }
  }

  revalidatePath('/dashboard/compras')
  return { ok: true }
}
