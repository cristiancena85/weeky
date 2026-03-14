import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, ShieldAlert, ArrowLeft } from 'lucide-react'
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
      <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 pb-10 transition-colors">
        <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                  <ArrowLeft className="w-4 h-4" /> Volver
                </Link>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Usuarios y Roles
                </div>
              </div>
              <UserMenu user={user} profile={profile} />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <UsersAndRolesView initialUsers={users} initialRoles={roles} />
        </main>
      </div>
    )
  } catch (err: any) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-xl w-full">
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
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }
}
