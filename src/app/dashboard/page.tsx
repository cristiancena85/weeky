import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Bell, User, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'
import NotificationsDemo from '@/components/dashboard/NotificationsDemo'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil del usuario
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabaseServer = await createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/30 border border-purple-200 dark:border-purple-500/50 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-300 font-bold text-sm">W</span>
            </div>
            <span className="text-slate-900 dark:text-white font-semibold text-lg">Weeky</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{user.email}</span>
              {profile?.user_type === 'administrador' && (
                <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            {profile?.user_type === 'administrador' && (
              <div className="flex gap-2">
                <Link 
                  href="/dashboard/users"
                  className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-500 transition-colors px-3 py-1.5 rounded-lg shadow-lg shadow-purple-500/20"
                >
                  <Users className="w-4 h-4" />
                  Usuarios y Roles
                </Link>
              </div>
            )}

            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 transition-colors">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Bienvenido{profile?.full_name ? `, ${profile.full_name}` : ''}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Tu rol actual:{' '}
            <span className="text-purple-600 dark:text-purple-400 font-medium">{(profile?.role || profile?.user_type) ?? 'usuario'}</span>
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Mi Perfil</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Email: {user.email}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Tipo: {profile?.user_type ?? 'usuario'}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Rol: {profile?.role ?? 'Sin Rol'}</p>
          </div>

          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Notificaciones Realtime</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Escuchando cambios en la tabla{' '}
              <code className="text-purple-600 dark:text-purple-300 bg-slate-100 dark:bg-white/5 px-1 rounded border border-slate-200 dark:border-none">notifications</code> en
              tiempo real via WebSockets.
            </p>
          </div>
        </div>

        {/* Realtime demo */}
        <NotificationsDemo userId={user.id} />
      </main>
    </div>
  )
}
