import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client para uso en el BROWSER (Client Components).
 * Instanciar por llamada o usar un singleton ligero.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
