'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createDeposito } from './deposits'

export type UserProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  alias: string
  user_type: 'administrador' | 'usuario'
  role: string | null
  active_role_id: string | null
  created_at: string
  roles?: { role_id: string, roles: { name: string } }[]
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
  
  // Obtenemos todos los perfiles con sus roles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      roles:user_roles(
        role_id,
        roles(name)
      )
    `)
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

  // 3. Asignar múltiples roles en la tabla intermedia
  if (data.role_ids && data.role_ids.length > 0) {
    const rolesToInsert = data.role_ids.map((roleId: string) => ({
      user_id: userId,
      role_id: roleId
    }))
    
    await supabase.from('user_roles').insert(rolesToInsert)

    // Establecer el primero como activo por defecto
    await supabase.from('profiles').update({ active_role_id: data.role_ids[0] }).eq('id', userId)
  }

  // 4. Si uno de los roles es 'vendedor', crear automáticamente un sub-depósito
  // (Buscamos si 'vendedor' está en la lista de nombres de roles asignados)
  const { data: selectedRoles } = await supabase.from('roles').select('name').in('id', data.role_ids || [])
  const isVendedor = selectedRoles?.some(r => r.name.toLowerCase() === 'vendedor')

  if (isVendedor) {
    try {
      await createDeposito({
        nombre: data.alias || `${data.first_name} ${data.last_name}`,
        tipo: 'vendedor',
        usuario_id: userId,
        activo: true
      });
    } catch (depError: any) {
      console.error('Error al crear depósito automático:', depError);
    }
  }

  revalidatePath('/dashboard/users')
  revalidatePath('/dashboard/depositos')
  return { success: true }
}

export async function updateUser(id: string, data: any) {
  await requireAdmin()
  const supabase = await createAdminClient()

  // 1. Actualizar perfil básico
  const { error } = await supabase
    .from('profiles')
    .update({
      user_type: data.user_type,
      first_name: data.first_name,
      last_name: data.last_name,
      alias: data.alias
    })
    .eq('id', id)

  if (error) throw new Error('Error al actualizar el usuario: ' + error.message)

  // 2. Actualizar roles
  if (data.role_ids) {
    // Eliminar viejos y poner nuevos
    await supabase.from('user_roles').delete().eq('user_id', id)
    
    if (data.role_ids.length > 0) {
      const rolesToInsert = data.role_ids.map((roleId: string) => ({
        user_id: id,
        role_id: roleId
      }))
      await supabase.from('user_roles').insert(rolesToInsert)

      // Si el rol activo ya no está en la lista, poner el primero
      const { data: profile } = await supabase.from('profiles').select('active_role_id').eq('id', id).single()
      if (!data.role_ids.includes(profile?.active_role_id)) {
        await supabase.from('profiles').update({ active_role_id: data.role_ids[0] }).eq('id', id)
      }
    } else {
      await supabase.from('profiles').update({ active_role_id: null }).eq('id', id)
    }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function switchActiveRole(roleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('profiles')
    .update({ active_role_id: roleId })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
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
