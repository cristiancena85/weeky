'use client'

import { useState, useCallback } from 'react'
import { useRealtime } from '@/hooks/useRealtime'
import { Bell, Wifi } from 'lucide-react'

interface AppNotification {
  id: string
  user_id: string
  message: string
  created_at: string
}

interface Props {
  userId: string
}

/**
 * Componente demo que muestra el hook useRealtime en acción.
 * Escucha inserciones en la tabla `notifications` filtradas por el usuario actual.
 */
export default function NotificationsDemo({ userId }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [connected, setConnected] = useState(false)

  const handleChange = useCallback(
    (payload: { new: unknown }) => {
      const newItem = payload.new as AppNotification
      setNotifications((prev) => [newItem, ...prev].slice(0, 20))
      setConnected(true)
    },
    []
  )

  useRealtime<AppNotification>({
    table: 'notifications',
    event: 'INSERT',
    filter: `user_id=eq.${userId}`,
    onchange: handleChange,
  })

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Feed de Notificaciones (Realtime)</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Wifi className={`w-4 h-4 ${connected ? 'text-green-400' : 'text-slate-500'}`} />
          <span className={connected ? 'text-green-400' : 'text-slate-500'}>
            {connected ? 'Conectado' : 'Esperando...'}
          </span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Sin notificaciones aún. Insertá una fila en la tabla{' '}
            <code className="text-purple-400">notifications</code> para verla aparecer aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5 animate-in slide-in-from-top-2 duration-300"
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm">{n.message}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {new Date(n.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
