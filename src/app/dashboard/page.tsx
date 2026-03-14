import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Bell, User, ShieldCheck, Users, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import NotificationsHub from '@/components/dashboard/NotificationsHub'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { UserMenu } from '@/components/dashboard/UserMenu'
import { logUserActivity } from '@/app/actions/activity'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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

          <div className="flex items-center gap-2 sm:gap-4">
            {profile?.user_type === 'administrador' && (
              <div className="hidden md:flex gap-2">
                <Link 
                  href="/dashboard/catalog"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Package className="w-4 h-4" />
                  Catálogo
                </Link>
                <Link 
                  href="/dashboard/users"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Users className="w-4 h-4" />
                  Usuarios
                </Link>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            
            <UserMenu user={user} profile={profile} />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 transition-colors">
        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-12">
          {/* Módulo: Pedidos de la Semana */}
          <Link 
            href="/dashboard/orders" 
            className="bg-purple-600 hover:bg-purple-500 rounded-[2.5rem] p-10 shadow-2xl shadow-purple-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="w-32 h-32 text-white" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-black text-white text-3xl uppercase italic tracking-tighter">Pedidos Semanales</h2>
                </div>
                <p className="text-purple-100 text-lg font-medium leading-relaxed">
                  Gestiona el stock semanal y procesa pedidos de clientes en tiempo real. 
                  Colabora con tu equipo de manera eficiente.
                </p>
              </div>
              
              <div className="flex items-center text-white text-sm font-black gap-3 uppercase tracking-widest bg-white/10 px-6 py-3 rounded-2xl border border-white/20 group-hover:bg-white/20 transition-all whitespace-nowrap self-start md:self-center">
                Entrar al panel <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            </div>
          </Link>
        </div>

        {/* Realtime hub (Feed + Presence) */}
        <div className="mt-8">
          <NotificationsHub userId={user.id} />
        </div>
      </main>
    </div>
  )
}

