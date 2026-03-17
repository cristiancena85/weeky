import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CatalogView from '@/components/dashboard/CatalogView'
import { getProducts, getTemplates } from '@/app/actions/products'
import { getCustomers } from '@/app/actions/customers'
import { getBranches } from '@/app/actions/branches'

export default async function CatalogCatchAllPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>
}) {
  const { tab } = await params
  const currentTab = tab?.[0] || 'products'

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

  // CARGA MASIVA EN PARALELO: Traemos TODO de una sola vez para que el resto sea instantáneo
  const [products, customers, templates, branches] = await Promise.all([
    getProducts(),
    getCustomers(),
    getTemplates(),
    getBranches()
  ])

  return (
    <div className="p-6">
      <CatalogView 
        initialProducts={products} 
        initialTemplates={templates} 
        initialTab={currentTab}
      />
    </div>
  )
}
