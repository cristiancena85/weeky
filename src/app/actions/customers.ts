'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Customer = {
  id: string
  name: string
  cuit: string | null
  address: string | null
  phone: string | null
  type: 'cliente' | 'vendedor'
  branch_id: string | null
  branch?: { name: string }
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

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*, branch:branches(name)')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createCustomer(data: Omit<Customer, 'id' | 'created_at'>) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('customers').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/personal-comercial')
  return { success: true }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('customers').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/personal-comercial')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}
