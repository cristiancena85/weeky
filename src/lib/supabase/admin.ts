import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con permisos de administrador (Service Role Key).
 * Utiliza la librería base para asegurar el bypass de RLS.
 */
export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
