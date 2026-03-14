'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function PresenceHandler() {
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const setupPresence = async () => {
      // 1. Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2. Suscribirse al canal de presencia
      const channel = supabase.channel('online-users', {
        config: {
          presence: {
            key: user.id,
          },
        },
      })

      channelRef.current = channel

      channel
        .on('presence', { event: 'sync' }, () => {
          // Sync se dispara al inicio o cuando cambia algo globalmente
          // console.log('Synced presence:', channel.presenceState())
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Evitar notificarse a uno mismo
          if (key === user.id) return
          
          const newUser = newPresences[0]
          toast.success(`${newUser.email || 'Un usuario'} se ha conectado`, {
            description: 'Ahora está en línea',
            duration: 4000,
          })
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (key === user.id) return

          const leftUser = leftPresences[0]
          toast.info(`${leftUser.email || 'Un usuario'} se ha desconectado`, {
            description: 'Ha salido de la plataforma',
            duration: 4000,
          })
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track al usuario actual con su email para que otros lo vean
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString(),
            })
          }
        })
    }

    setupPresence()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return null // Este componente no renderiza nada visualmente, solo maneja lógica
}
