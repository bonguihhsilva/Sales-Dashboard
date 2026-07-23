/**
 * Filtra fora linhas cujo vendedor já tem comissão aprovada no período —
 * elas não devem ser reenviadas ao upsert (C-04). O trigger
 * protect_approved_commission é a garantia de último recurso no banco;
 * este filtro é o caminho normal, silencioso, no nível da rota.
 */
export function filterUnapproved<T extends { vendedor_id: string }>(
  rows: T[],
  approvedMap: Map<string, unknown>
): T[] {
  return rows.filter(row => !approvedMap.has(row.vendedor_id))
}
