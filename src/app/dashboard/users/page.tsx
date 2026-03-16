import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, ShieldAlert, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import UsersAndRolesView from '@/components/dashboard/UsersAndRolesView'
import { getUsers } from '@/app/actions/users'
import { getRoles } from '@/app/actions/roles'
import { UserMenu } from '@/components/dashboard/UserMenu'

export default async function UsersManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 px-6 transition-colors">
        <div className="text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-2xl max-w-md shadow-sm dark:shadow-none">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">No tenés permisos de administrador para ver esta página.</p>
          <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  try {
    const users = await getUsers()
    const roles = await getRoles()

    return (
      <div className="p-6">
        <UsersAndRolesView initialUsers={users} initialRoles={roles} />
      </div>
    )
  } catch (err: any) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-xl">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Error en el Servidor
          </h2>
          <pre className="text-sm bg-black/40 p-4 rounded-xl overflow-x-auto text-red-200/80 mb-6">
            {err.message || 'Error desconocido al cargar datos'}
          </pre>
          <div className="flex gap-4">
            <Link href="/dashboard" className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-sm">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
