import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomersTable from '@/components/dashboard/CustomersTable'
import { getCustomers } from '@/app/actions/customers'
import { getBranches } from '@/app/actions/branches'
import { Users } from 'lucide-react'

export default async function PersonalComercialPage() {
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

  const [customers, branches] = await Promise.all([
    getCustomers(),
    getBranches()
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Personal Comercial</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Organización y operadores comerciales.</p>
        </div>
      </div>

      <main>
        <CustomersTable initialCustomers={customers} initialBranches={branches} />
      </main>
    </div>
  )
}
