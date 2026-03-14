'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type StockCycle = {
  id: string
  start_date: string
  end_date: string | null
  status: 'abierto' | 'activo' | 'cerrado'
}

export async function getCurrentCycle(): Promise<StockCycle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stock_cycles')
    .select('*')
    .in('status', ['abierto', 'activo', 'cerrado'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') return null
  return data
}

export async function openNewCycle() {
  const supabase = await createAdminClient()
  
  // Cerrar ciclos anteriores si los hay
  await supabase.from('stock_cycles').update({ status: 'cerrado', end_date: new Date().toISOString() }).neq('status', 'cerrado')

  const { data, error } = await supabase
    .from('stock_cycles')
    .insert({ status: 'abierto' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/orders')
  return data
}

export async function setInitialStock(cycleId: string, stocks: { productId: string, quantity: number }[]) {
  const supabase = await createAdminClient()

  const entries = stocks.map(s => ({
    cycle_id: cycleId,
    product_id: s.productId,
    initial_quantity: s.quantity
  }))

  const { error } = await supabase
    .from('product_stock')
    .upsert(entries, { onConflict: 'cycle_id, product_id' })

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function activateCycle(cycleId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('stock_cycles')
    .update({ status: 'activo' })
    .eq('id', cycleId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function closeCycle(cycleId: string, finalStocks: { productId: string, quantity: number }[]) {
  const supabase = await createAdminClient()

  // 1. Guardar stock final (si se provee)
  if (finalStocks.length > 0) {
    for (const s of finalStocks) {
      await supabase
        .from('product_stock')
        .update({ final_quantity: s.quantity })
        .eq('cycle_id', cycleId)
        .eq('product_id', s.productId)
    }
  }

  // 2. Cerrar ciclo
  const { error } = await supabase
    .from('stock_cycles')
    .update({ status: 'cerrado', end_date: new Date().toISOString() })
    .eq('id', cycleId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function getStockReport(cycleId: string) {
  const supabase = await createClient()

  // 1. Obtener stock inicial y final
  const { data: stockData } = await supabase
    .from('product_stock')
    .select('*, products(*)')
    .eq('cycle_id', cycleId)

  // 2. Obtener ventas vendidas (items de pedidos entregados)
  const { data: salesData } = await supabase
    .from('order_items')
    .select('quantity, product_id, orders!inner(cycle_id, status)')
    .eq('orders.cycle_id', cycleId)
    .eq('orders.status', 'entregado')

  const report = stockData?.map(s => {
    const sold = salesData?.filter(item => item.product_id === s.product_id)
      .reduce((sum, item) => sum + item.quantity, 0) || 0
    
    return {
      product: s.products.name,
      base_unit: s.products.base_unit,
      initial: s.initial_quantity,
      sold: sold,
      expected: s.initial_quantity - sold,
      final: s.final_quantity || 0,
      diff: (s.final_quantity || 0) - (s.initial_quantity - sold)
    }
  })

  return report || []
}
