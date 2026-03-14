'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type UserProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  alias: string
  user_type: 'administrador' | 'usuario'
  role: string | null
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

export async function getUsers(): Promise<UserProfile[]> {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  // Obtenemos todos los perfiles directamente
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Error al obtener usuarios: ' + error.message)
  }

  return profiles as UserProfile[]
}

export async function createUser(data: any) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  // 1. Crear el usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // Auto confirmar
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
      alias: data.alias
    }
  })

  if (authError) {
    throw new Error('Error al crear credenciales de usuario: ' + authError.message)
  }

  const userId = authData.user.id

  // 2. Por el trigger (handle_new_user), el perfil ya se creó con 'usuario' por defecto.
  // Solo la primera vez lo actualizamos con los roles deseados usando su ID.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      user_type: data.user_type, 
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      alias: data.alias
    })
    .eq('id', userId)

  if (profileError) {
    // Revertir creación si falla la actualización del rol
    await supabase.auth.admin.deleteUser(userId)
    throw new Error('Error al asignar el rol al nuevo usuario: ' + profileError.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function updateUser(id: string, data: any) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      user_type: data.user_type,
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      alias: data.alias
    })
    .eq('id', id)

  if (error) {
    throw new Error('Error al actualizar el usuario: ' + error.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  // Al borrar de auth.users, se debe borrar en cascada de la tabla perfiles gracias a "ON DELETE CASCADE"
  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw new Error('Error al eliminar el usuario: ' + error.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
