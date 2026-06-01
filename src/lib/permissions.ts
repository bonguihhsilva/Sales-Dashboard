export const PERMISSION_KEYS = [
  'ver_comissoes',
  'aprovar_comissoes',
  'ver_rh',
  'importar_dados',
  'ver_relatorios',
  'gerenciar_usuarios',
] as const

export type PermissionKey = typeof PERMISSION_KEYS[number]
