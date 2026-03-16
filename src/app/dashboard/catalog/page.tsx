import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Package, ArrowLeft, ShieldAlert, ShoppingCart } from 'lucide-react'
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
    <div className="p-6">
      <CatalogView 
        initialProducts={products} 
        initialCustomers={customers} 
        initialTemplates={templates} 
        initialBranches={branches}
      />
    </div>
  )
}
