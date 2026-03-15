import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Package, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import CatalogView from '@/components/dashboard/CatalogView'
import { getProducts, getTemplates } from '@/app/actions/products'
import { getCustomers } from '@/app/actions/customers'
import { getBranches } from '@/app/actions/branches'
import { UserMenu } from '@/components/dashboard/UserMenu'

export default async function CatalogPage() {
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
          <p className="text-slate-500 dark:text-slate-400 mb-6">Se requieren permisos de administrador para gestionar el catálogo.</p>
          <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const products = await getProducts()
  const customers = await getCustomers()
  const templates = await getTemplates()
  const branches = await getBranches()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 pb-10 transition-colors">
      <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Catálogo
              </div>
            </div>
            <UserMenu user={user} profile={profile} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <CatalogView 
          initialProducts={products} 
          initialCustomers={customers} 
          initialTemplates={templates} 
          initialBranches={branches}
        />
      </main>
    </div>
  )
}
