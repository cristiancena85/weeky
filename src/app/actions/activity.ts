'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function logUserActivity(userId: string, email: string, activity: 'login' | 'logout' | 'disconnect' | 'connect') {
  const supabase = await createAdminClient()
  
  const message = activity === 'login' 
    ? `${email} ha iniciado sesión` 
    : activity === 'logout'
    ? `${email} ha cerrado la sesión`
    : activity === 'connect'
    ? `${email} se ha conectado`
    : `${email} se ha desconectado`

  console.log(`[ActivityLog] Intentando registrar: ${message} para ${userId}`)
  
  // Anti-duplicados: Verificar si ya se registró el mismo mensaje en los últimos 10 segundos
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString()
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('message', message)
    .gt('created_at', tenSecondsAgo)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log(`[ActivityLog] Mensaje duplicado omitido: ${message}`)
    return { success: true }
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message: message,
      type: 'system'
    })
    .select()

  if (error) {
    console.error('[ActivityLog] Error:', error)
  } else {
    console.log('[ActivityLog] Éxito:', data)
  }
  return { success: !error }
}
