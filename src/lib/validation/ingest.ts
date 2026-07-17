import { z } from 'zod'

export const saleItemSchema = z.object({
  product_code: z.string().min(1).max(120).optional(),
  qty: z.number().positive().optional(),
  unit_price: z.number().nonnegative().optional(),
})

export const saleSchema = z.object({
  order_id: z.string().min(1).max(120),
  vendor_id: z.string().min(1).max(120),
  vendor_name: z.string().max(200).optional(),
  store: z.string().max(120).optional(),
  client_id: z.string().max(120).optional(),
  client_name: z.string().max(200).optional(),
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  total: z.number().nonnegative(),
  items: z.array(saleItemSchema).optional(),
})

export const stockItemSchema = z.object({
  product_code: z.string().min(1).max(120),
  quantity: z.number().nonnegative(),
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type SaleInput = z.infer<typeof saleSchema>
export type StockItemInput = z.infer<typeof stockItemSchema>
