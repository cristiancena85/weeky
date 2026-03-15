import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Bell, User, ShieldCheck, Users, Package, ArrowLeft, ShoppingCart } from 'lucide-react'
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
              <div className="flex gap-1 sm:gap-2">
                <Link 
                  href="/dashboard/catalog"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  title="Catálogo"
                >
                  <Package className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Catálogo</span>
                </Link>
                <Link 
                  href="/dashboard/users"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  title="Usuarios"
                >
                  <Users className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Usuarios</span>
                </Link>
                <Link 
                  href="/dashboard/orders"
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  title="Pedidos Semanales"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  <span className="hidden sm:inline">Pedidos</span>
                </Link>
              </div>
            )}

            {!profile?.user_type && (
              <Link 
                href="/dashboard/orders"
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Pedidos Semanales"
              >
                <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Pedidos Semanales</span>
              </Link>
            )}

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            
            <UserMenu user={user} profile={profile} />
          </div>
        </div>
      </nav>

      {/* Pending Modules Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Faltan los módulos: <span className="font-bold underline decoration-amber-500/30">stock</span>, <span className="font-bold underline decoration-amber-500/30">depósitos</span> y <span className="font-bold underline decoration-amber-500/30">órdenes de compra</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10 transition-colors">
        {/* Action Cards */}

        {/* Realtime hub (Feed + Presence) */}
        <div className="mt-8">
          <NotificationsHub userId={user.id} />
        </div>
      </main>
    </div>
  )
}

