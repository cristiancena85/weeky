'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function logUserActivity(userId: string, email: string, activity: 'login' | 'logout') {
  const supabase = await createAdminClient()
  
  const message = activity === 'login' 
    ? `${email} ha iniciado sesión` 
    : `${email} ha cerrado la sesión`

  console.log(`[ActivityLog] Intentando registrar: ${message} para ${userId}`)

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
