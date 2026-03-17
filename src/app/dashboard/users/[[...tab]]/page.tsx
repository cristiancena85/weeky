import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsersAndRolesView from '@/components/dashboard/UsersAndRolesView'
import { getUsers } from '@/app/actions/users'
import { getRoles } from '@/app/actions/roles'
import NotificationsHub from '@/components/dashboard/NotificationsHub'

export default async function UsersCatchAllPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>
}) {
  const { tab } = await params
  const currentTab = tab?.[0] || 'management'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    redirect('/dashboard')
  }

  // Traemos todo el módulo de usuarios en paralelo
  const [users, roles] = await Promise.all([
    getUsers(),
    getRoles()
  ])

  return (
    <div className="p-6 space-y-8">
      <UsersAndRolesView initialUsers={users} initialRoles={roles} initialTab={currentTab} />
      
      <div className="pt-8 border-t border-slate-200 dark:border-white/10">
        <NotificationsHub userId={user.id} />
      </div>
    </div>
  )
}
