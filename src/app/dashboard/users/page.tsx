import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import UsersAndRolesView from '@/components/dashboard/UsersAndRolesView'
import { getUsers } from '@/app/actions/users'
import { getRoles } from '@/app/actions/roles'

export default async function UsersManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-6">
        <div className="text-center bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-400 mb-6">No tenés permisos de administrador para ver esta página.</p>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const users = await getUsers()
  const roles = await getRoles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-10">
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <ArrowLeft className="w-4 h-4" /> Volver
              </Link>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <Users className="w-5 h-5 text-purple-400" />
                Gestión de Usuarios y Roles
              </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <UsersAndRolesView initialUsers={users} initialRoles={roles} />
      </main>
    </div>
  )
}
