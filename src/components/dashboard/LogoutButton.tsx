'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'
import { logUserActivity } from '@/app/actions/activity'

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    console.log('[LogoutButton] Instant logout triggered')

    try {
      // Registrar actividad antes de salir
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await logUserActivity(user.id, user.email || '', 'logout')
      }

      // 1. Cierre de sesión técnico (rápido y local)
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('[LogoutButton] SignOut error:', err)
    }

    // 2. Redirección dura. Esto limpia todo el estado de React y el router.
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isLoggingOut ? 'Saliendo...' : 'Salir'}
      </span>
    </button>
  )
}
