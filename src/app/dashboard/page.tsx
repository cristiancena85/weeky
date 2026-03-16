import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Bell, User, ShieldCheck, Users, Package, ArrowLeft, ShoppingCart, Building2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Pending Modules Banner */}
      <div className="pt-8">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Faltan los módulos: <span className="font-bold underline decoration-amber-500/30">stock</span> y <span className="font-bold underline decoration-amber-500/30">órdenes de compra</span>
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

