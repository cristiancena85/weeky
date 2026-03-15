'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type Branch = {
  id: string
  name: string
  address: string | null
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

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createBranch(data: Omit<Branch, 'id' | 'created_at'>) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('branches').insert(data)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function updateBranch(id: string, data: Partial<Branch>) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('branches').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function deleteBranch(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('branches').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}
