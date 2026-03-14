'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OnlineUser {
  user_id: string
  email: string
  alias: string
  online_at: string
}

interface RealtimeContextType {
  onlineUsers: OnlineUser[]
  connected: boolean
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [connected, setConnected] = useState(false)
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  // 1. Escuchar cambios de sesión y guardarlos en el estado local
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // 2. Manejar la conexión de presencia basada en la sesión
  useEffect(() => {
    if (!session?.user) {
      setOnlineUsers([])
      setConnected(false)
      return
    }

    const { user } = session
    console.log('[RealtimeProvider] Iniciando presencia para:', user.email)

    const initChannel = async () => {
      let alias = user.email || 'Usuario'
      // Obtener perfil (opcional)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('alias')
          .eq('id', user.id)
          .single()
        if (profile?.alias) alias = profile.alias
      } catch (e) {
        console.warn('[RealtimeProvider] Error al cargar perfil:', e)
      }

      // Limpiar canal previo si existe
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current)
      }

      const channel = supabase.channel('presence-global', {
        config: { presence: { key: user.id } }
      })

      const syncUsers = () => {
        const state = channel.presenceState()
        const users: OnlineUser[] = []

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any
          if (presences?.length > 0) {
            const p = presences[0]
            users.push({
              user_id: key,
              email: p.email || 'Desconocido',
              alias: p.alias || p.email || 'Usuario',
              online_at: p.online_at || new Date().toISOString(),
            })
          }
        })

        console.log(`[RealtimeProvider] Sincronizados ${users.length} colaboradores.`)
        setOnlineUsers(users.sort((a, b) => new Date(b.online_at).getTime() - new Date(a.online_at).getTime()))
      }

      channel
        .on('presence', { event: 'sync' }, syncUsers)
        .on('presence', { event: 'join' }, syncUsers)
        .on('presence', { event: 'leave' }, syncUsers)
        .subscribe(async (status) => {
          console.log(`[RealtimeProvider] Estado del canal: ${status}`)
          if (status === 'SUBSCRIBED') {
            setConnected(true)
            await channel.track({
              user_id: user.id,
              email: user.email,
              alias: alias,
              online_at: new Date().toISOString(),
            })
          } else {
            setConnected(false)
          }
        })

      channelRef.current = channel
    }

    initChannel()

    return () => {
      if (channelRef.current) {
        console.log('[RealtimeProvider] Limpiando canal al desmontar/cambiar sesión.')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [session, supabase])

  return (
    <RealtimeContext.Provider value={{ onlineUsers, connected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useOnlineUsers() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useOnlineUsers debe usarse dentro de un RealtimeProvider')
  }
  return context
}
