import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Supabase client para uso en el BROWSER (Client Components).
 * Retorna un singleton para evitar múltiples conexiones simultáneas.
 */
export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return client
}
