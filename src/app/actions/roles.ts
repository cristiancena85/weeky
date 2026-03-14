'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type RoleItem = {
  id: string
  name: string
  created_at: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No estás autenticado.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    throw new Error('Permisos insuficientes: Se requiere rol de administrador.')
  }
}

export async function getRoles(): Promise<RoleItem[]> {
  const supabase = await createClient()
  
  // Todos pueden leer roles (es necesario para el modal de usuario)
  const { data: roles, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error('Error al obtener la lista de roles: ' + error.message)
  }

  return roles as RoleItem[]
}

export async function createRole(name: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  // Guardamos en minúsculas para mantener consistencia
  const cleanName = name.trim().toLowerCase()

  const { error } = await supabase
    .from('roles')
    .insert({ name: cleanName })

  if (error) {
    throw new Error('Error al crear el rol: ' + error.message)
  }

  revalidatePath('/dashboard/roles')
  revalidatePath('/dashboard/users') // También se usan al editar usuarios
  return { success: true }
}

export async function updateRole(id: string, newName: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const cleanName = newName.trim().toLowerCase()

  const { error } = await supabase
    .from('roles')
    .update({ name: cleanName })
    .eq('id', id)

  if (error) {
    throw new Error('Error al modificar el rol: ' + error.message)
  }

  // IMPORTANTE: Al cambiar el nombre de un rol, la Foreign Key de `profiles` 
  // que usa ON UPDATE CASCADE, actualizará automáticamente a todos los usuarios
  // que estuvieran usando ese rol, ahorrándonos tener que hacerlo a mano!
  
  revalidatePath('/dashboard/roles')
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteRole(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Error al eliminar el rol: ' + error.message)
  }

  revalidatePath('/dashboard/roles')
  revalidatePath('/dashboard/users')
  return { success: true }
}
