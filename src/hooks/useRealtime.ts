'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  /** Nombre del schema. Default: 'public' */
  schema?: string
  /** Nombre de la tabla a escuchar */
  table: string
  /** Evento a escuchar. Default: '*' */
  event?: ChangeEvent
  /** Filtro opcional, ej: 'user_id=eq.123' */
  filter?: string
  /** Callback que recibe el payload del cambio */
  onchange: (payload: RealtimePostgresChangesPayload<T>) => void
}

/**
 * Hook personalizado para escuchar cambios en tiempo real de una tabla Supabase.
 *
 * @example
 * useRealtime({
 *   table: 'notifications',
 *   event: 'INSERT',
 *   onchange: (payload) => console.log('Nueva notificación:', payload.new),
 * })
 */
export function useRealtime<T extends Record<string, unknown>>({
  schema = 'public',
  table,
  event = '*',
  filter,
  onchange,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Guardamos el callback en un ref para evitar re-suscripciones por cambio de referencia
  const callbackRef = useRef(onchange)
  callbackRef.current = onchange

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime:${schema}:${table}`)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          callbackRef.current(payload as RealtimePostgresChangesPayload<T>)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [schema, table, event, filter])
}
