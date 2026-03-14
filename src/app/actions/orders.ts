'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type OrderItem = {
  product_id: string
  quantity: number
  display_quantity: number
  display_unit: string
}

export async function createOrder(cycleId: string, customerId: string, items: OrderItem[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const adminSupabase = await createAdminClient()

  // 1. Crear el pedido
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      cycle_id: cycleId,
      customer_id: customerId,
      salesman_id: user.id,
      status: 'pendiente'
    })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  // 2. Insertar items
  const itemsToInsert = items.map(item => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await adminSupabase
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/dashboard/orders')
  return order
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function getOrdersWithItems(cycleId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name),
      profiles (full_name),
      order_items (
        *,
        products (name, base_unit)
      )
    `)
    .eq('cycle_id', cycleId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
