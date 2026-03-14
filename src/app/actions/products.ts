'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Product = {
  id: string
  name: string
  sku: string | null
  base_unit: string
  conversions: Record<string, number>
  created_at: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    throw new Error('Permisos insuficientes.')
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at'>) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('products').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}
