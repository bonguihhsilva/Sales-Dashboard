import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

// Roles que podem criar convites (D-02)
export const INVITE_ALLOWED_ROLES: UserRole[] = ['adm', 'gerente', 'super_admin']

// Roles que um gerente/adm pode atribuir a um novo usuario via convite ou edicao.
// super_admin nao e atribuivel pela UI — so existe via configuracao direta.
export const ASSIGNABLE_ROLES: UserRole[] = ['vendedor', 'gerente', 'adm']

// Verifica se um valor de role e um dos 4 roles validos
export function isValidRole(value: unknown): value is UserRole {
  return value === 'vendedor' || value === 'adm'
    || value === 'gerente' || value === 'super_admin'
}

// Verifica se o role do caller pode criar convites
export function canInvite(role: string | undefined): boolean {
  return !!role && (INVITE_ALLOWED_ROLES as string[]).includes(role)
}

// Hierarquia de atribuicao de role (C-05): gerente so atribui vendedor,
// adm atribui vendedor/gerente, super_admin atribui qualquer role (unico
// nivel que pode atribuir seu proprio role a outra pessoa). Isso evita
// escalada lateral — a auto-promocao em si e bloqueada separadamente no
// caller pela checagem userId === user.id, independente desta hierarquia.
const ROLE_ASSIGNMENT_HIERARCHY: Record<UserRole, UserRole[]> = {
  vendedor: [],
  gerente: ['vendedor'],
  adm: ['vendedor', 'gerente'],
  super_admin: ['vendedor', 'gerente', 'adm', 'super_admin'],
}

// Verifica se callerRole pode atribuir targetRole a um usuario, segundo a
// hierarquia acima. Funcao pura — nao consulta banco nem sessao.
export function canAssignRole(
  callerRole: string | undefined,
  targetRole: UserRole,
): boolean {
  if (!callerRole) return false
  const allowed = ROLE_ASSIGNMENT_HIERARCHY[callerRole as UserRole]
  return !!allowed && allowed.includes(targetRole)
}

// C-05: ninguem pode alterar a propria role, mesmo super_admin — evita
// auto-promocao e evita que um admin se tranque fora sem querer. So bloqueia
// quando o body realmente contem uma role (editar outros campos do proprio
// usuario continua permitido). Funcao pura — nao consulta banco nem sessao.
export function isSelfRolePromotion(
  callerId: string,
  targetUserId: string,
  roleInBody: string | undefined,
): boolean {
  return targetUserId === callerId && roleInBody !== undefined
}

// D-04: toda mutacao de role deve atualizar app_metadata (fonte de verdade
// do middleware) E profiles.role (fonte de verdade das queries de UI).
// `admin` deve ser um SupabaseClient criado com a service role key.
// A mudanca de app_metadata so reflete no middleware apos logout/login.
export async function setUserRole(
  admin: SupabaseClient,
  userId: string,
  role: UserRole,
): Promise<{ error: string | null }> {
  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  })
  if (metaError) return { error: metaError.message }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (profileError) return { error: profileError.message }

  return { error: null }
}
