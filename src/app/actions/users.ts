'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  user_type: 'administrador' | 'usuario'
  role: 'jefe de deposito' | 'jefe de ventas' | 'supervisor' | 'administrativo' | 'tesorero' | null
  created_at: string
}

export async function getUsers(): Promise<UserProfile[]> {
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
  const supabase = await createAdminClient()
  
  // 1. Crear el usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // Auto confirmar
    user_metadata: {
      full_name: data.full_name
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
      full_name: data.full_name 
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
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      user_type: data.user_type,
      role: data.role,
      full_name: data.full_name
    })
    .eq('id', id)

  if (error) {
    throw new Error('Error al actualizar el usuario: ' + error.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const supabase = await createAdminClient()

  // Al borrar de auth.users, se debe borrar en cascada de la tabla perfiles gracias a "ON DELETE CASCADE"
  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw new Error('Error al eliminar el usuario: ' + error.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
