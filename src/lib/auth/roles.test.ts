import { describe, it, expect } from 'vitest'
import { canAssignRole, isSelfRolePromotion } from '@/lib/auth/roles'

describe('canAssignRole', () => {
  it('gerente pode atribuir vendedor', () => {
    expect(canAssignRole('gerente', 'vendedor')).toBe(true)
  })

  it('gerente nao pode atribuir adm', () => {
    expect(canAssignRole('gerente', 'adm')).toBe(false)
  })

  it('gerente nao pode atribuir gerente', () => {
    expect(canAssignRole('gerente', 'gerente')).toBe(false)
  })

  it('gerente nao pode atribuir super_admin', () => {
    expect(canAssignRole('gerente', 'super_admin')).toBe(false)
  })

  it('adm pode atribuir gerente', () => {
    expect(canAssignRole('adm', 'gerente')).toBe(true)
  })

  it('adm pode atribuir vendedor', () => {
    expect(canAssignRole('adm', 'vendedor')).toBe(true)
  })

  it('adm nao pode atribuir super_admin', () => {
    expect(canAssignRole('adm', 'super_admin')).toBe(false)
  })

  it('adm nao pode atribuir adm', () => {
    expect(canAssignRole('adm', 'adm')).toBe(false)
  })

  it('super_admin pode atribuir vendedor', () => {
    expect(canAssignRole('super_admin', 'vendedor')).toBe(true)
  })

  it('super_admin pode atribuir gerente', () => {
    expect(canAssignRole('super_admin', 'gerente')).toBe(true)
  })

  it('super_admin pode atribuir adm', () => {
    expect(canAssignRole('super_admin', 'adm')).toBe(true)
  })

  it('super_admin pode atribuir super_admin', () => {
    expect(canAssignRole('super_admin', 'super_admin')).toBe(true)
  })

  it('vendedor nao pode atribuir nenhuma role', () => {
    expect(canAssignRole('vendedor', 'vendedor')).toBe(false)
  })

  it('role indefinida nao pode atribuir nada', () => {
    expect(canAssignRole(undefined, 'vendedor')).toBe(false)
  })
})

describe('isSelfRolePromotion', () => {
  it('bloqueia quando o mesmo usuario tenta alterar a propria role', () => {
    expect(isSelfRolePromotion('user-1', 'user-1', 'adm')).toBe(true)
  })

  it('permite quando o mesmo usuario edita outros campos (role ausente do body)', () => {
    expect(isSelfRolePromotion('user-1', 'user-1', undefined)).toBe(false)
  })

  it('permite quando o caller altera a role de outro usuario', () => {
    expect(isSelfRolePromotion('user-1', 'user-2', 'adm')).toBe(false)
  })
})
