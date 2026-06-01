'use server'

import { createClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/auth/tenant'

export async function fetchClientHistory(clientId: string) {
  const supabase = await createClient()
  const { user, profile } = await getTenantContext()
  if (!user) throw new Error('Unauthorized')

  if (!profile?.tenant_id) throw new Error('Tenant não encontrado')

  const { data, error } = await supabase
    .from('sales_records')
    .select('id, sale_date, sale_time, vendor_name, store, product_code, quantity, valor, nota_fiscal')
    .eq('client_id', clientId)
    .eq('tenant_id', profile.tenant_id)
    .order('sale_date', { ascending: false })
    .order('sale_time', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return data
}
