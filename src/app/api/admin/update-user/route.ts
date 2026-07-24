import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTenantContext } from '@/lib/auth/tenant'
import { canInvite, isValidRole, setUserRole, assertRoleAssignable, isSelfRolePromotion } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'

// A-05: valida em vez de transformar — name/store nunca sao reescritos com
// entidades HTML (o antigo sanitizeString corrompia nomes com apostrofo,
// ex: "O'Brien" -> "O&#x27;Brien"). React ja escapa na renderizacao, entao
// nao ha XSS a prevenir aqui — so garantir tamanho razoavel.
const nameSchema = z.string().trim().min(1).max(200)
const storeSchema = z.string().trim().min(1).max(120)

export async function POST(req: NextRequest) {
  const { user, profile } = await getTenantContext()

  if (!user) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  const callerRole = profile.role
  if (!canInvite(callerRole)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const userId = body.userId

  let name: string | undefined
  if (body.name) {
    const parsed = nameSchema.safeParse(body.name)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Nome invalido (1-200 caracteres)' }, { status: 400 })
    }
    name = parsed.data
  }

  let store: string | undefined
  if (body.store) {
    const parsed = storeSchema.safeParse(body.store)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Loja invalida (1-120 caracteres)' }, { status: 400 })
    }
    store = parsed.data
  }

  const role = body.role ? body.role : undefined
  const ativo = body.ativo
  const vendor_id = body.vendor_id !== undefined
    ? (body.vendor_id ? body.vendor_id : null)
    : undefined

  if (!userId) {
    return NextResponse.json({ error: 'userId obrigatorio' }, { status: 400 })
  }
  if (role !== undefined) {
    // C-05: ninguem pode alterar a propria role, mesmo super_admin —
    // evita auto-promocao e evita que um admin se tranque fora sem querer.
    if (isSelfRolePromotion(user.id, userId, role)) {
      return NextResponse.json({ error: 'Não é possível alterar a própria role' }, { status: 403 })
    }
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
    }
    // Hierarquia de atribuicao (C-05): gerente so atribui vendedor, adm
    // atribui vendedor/gerente, super_admin atribui qualquer role.
    const denialMessage = assertRoleAssignable(profile.role, role as UserRole, {
      superAdminOnly: 'Acesso negado: Apenas super administradores podem atribuir esta role.',
      notAssignable: 'Acesso negado: Esta role não é atribuível via interface.',
    })
    if (denialMessage) {
      return NextResponse.json({ error: denialMessage }, { status: 403 })
    }
  }

  const admin = createAdminClient()

  // Prevent updating users outside caller's tenant
  if (profile.role !== 'super_admin') {
    const { data: targetUser } = await admin.from('profiles').select('tenant_id').eq('id', userId).single()
    if (!targetUser || targetUser.tenant_id !== profile.tenant_id) {
       return NextResponse.json({ error: 'Usuario nao pertence a esta empresa' }, { status: 403 })
    }
  }

  // Se o role mudou, usar setUserRole (atualiza app_metadata + profiles juntos)
  if (role !== undefined) {
    const roleResult = await setUserRole(admin, userId, role as UserRole)
    if (roleResult.error) {
      return NextResponse.json({ error: roleResult.error }, { status: 400 })
    }
    // Força invalidação dos JWTs e refresh tokens antigos para o middleware pegar a nova role
    await admin.auth.admin.signOut(userId, 'others')
  }

  // Demais campos (name, store, ativo) — update direto no profile
  const patch: Record<string, unknown> = {}
  if (name !== undefined) patch.name = name
  if (store !== undefined) patch.store = store
  if (ativo !== undefined) patch.ativo = ativo
  if (vendor_id !== undefined) patch.vendor_id = vendor_id
  if (Object.keys(patch).length > 0) {
    const { error: profError } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', userId)
    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
}
