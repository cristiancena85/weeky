'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRealtime } from '@/hooks/useRealtime'
import { createClient } from '@/lib/supabase/client'
import { useOnlineUsers } from '@/contexts/RealtimeContext'
import { Bell, Wifi, Users } from 'lucide-react'

interface AppNotification {
  id: string
  user_id: string
  message: string
  [key: string]: any
  created_at: string
}

interface Props {
  userId: string
}

export default function NotificationsHub({ userId }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const { onlineUsers, connected: globalConnected } = useOnlineUsers()
  const supabase = createClient()

  useEffect(() => {
    console.log('[NotificationsHub] Online Users Updated:', onlineUsers.length)
  }, [onlineUsers])

  // Cargar notificaciones históricas
  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)
      
      if (data) setNotifications(data)
    }
    fetchInitial()
  }, [])

  const handleChange = useCallback((payload: { new: unknown }) => {
    const newItem = payload.new as AppNotification
    setNotifications((prev) => [newItem, ...prev].slice(0, 15))
  }, [])

  useRealtime<AppNotification>({
    table: 'notifications',
    event: 'INSERT',
    onchange: handleChange,
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Usuarios Online (usando Contexto Global) */}
      <div className="lg:col-span-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-slate-900 dark:text-white font-bold text-sm">Online</h2>
        </div>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {onlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-[10px] text-slate-400 font-medium px-4">Buscando colaboradores...</p>
            </div>
          ) : (
            onlineUsers.map(u => (
              <div key={u.user_id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-white/10 shadow-sm">
                    {u.alias.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#020205] shadow-sm"></div>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs text-slate-900 dark:text-white truncate font-bold leading-tight">{u.alias}</span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{u.email}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Feed de Actividad */}
      <div className="lg:col-span-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Actividad</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200/50 dark:border-white/5">
            <Wifi className={`w-3 h-3 ${globalConnected ? 'text-green-500 animate-pulse' : 'text-slate-400'}`} />
            <span className={globalConnected ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}>En Vivo</span>
          </div>
        </div>

        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.04] rounded-2xl p-4 border border-slate-100 dark:border-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bell className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-2">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{new Date(n.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>{new Date(n.created_at).toLocaleDateString('es-AR')}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
