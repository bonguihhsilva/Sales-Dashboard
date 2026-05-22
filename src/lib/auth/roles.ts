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
