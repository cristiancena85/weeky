import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase con permisos de administrador (Service Role Key).
 * Permite saltarse las restricciones de Row Level Security (RLS) y gestionar 
 * usuarios directamente en la tabla auth.users usando la Admin API.
 * Nunca enviar la Service Role Key al frontend.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { }
        }
      },
    }
  )
}
