import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 transition-colors">
        <div className="text-center py-20">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Bienvenido al Panel de Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-medium max-w-2xl mx-auto">
            Selecciona una opción en el menú lateral para comenzar a gestionar tu operativa.
          </p>
        </div>
      </main>
    </div>
  )
}
