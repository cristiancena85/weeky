import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Package, ArrowLeft, PlusCircle, AlertCircle, Calendar, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { getCurrentCycle, openNewCycle, closeCycle, getStockReport } from '@/app/actions/inventory'
import { getProducts } from '@/app/actions/products'
import { getCustomers } from '@/app/actions/customers'
import { getOrdersWithItems } from '@/app/actions/orders'
import InitialStockLoader from '@/components/dashboard/InitialStockLoader'
import CollaborativeOrderSheet from '@/components/dashboard/CollaborativeOrderSheet'
import StockReport from '@/components/dashboard/StockReport'
import { UserMenu } from '@/components/dashboard/UserMenu'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const cycle = await getCurrentCycle()
  const products = await getProducts()
  const customers = await getCustomers()
  const initialOrders = cycle ? await getOrdersWithItems(cycle.id) : []
  const reportData = cycle?.status === 'cerrado' ? await getStockReport(cycle.id) : []

  const handleStartWeek = async () => {
    'use server'
    await openNewCycle()
    redirect('/dashboard/orders')
  }

  const handleCloseWeek = async () => {
    'use server'
    if (!cycle) return
    // Para simplificar, asumiremos que el stock final es cargado o calculado
    // En una versión final, añadiríamos un modal para cargar el stock físico final
    await closeCycle(cycle.id, []) 
    redirect('/dashboard/orders')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 pb-10 transition-colors">
      <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
              </Link>
              <Link 
                href="/dashboard/orders"
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 bg-purple-50 dark:bg-purple-900/10"
                title="Pedidos Semanales"
              >
                <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline font-bold">Pedidos</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm sm:text-lg italic">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Semana Actual:</span> <span className="text-purple-600 dark:text-purple-400">
                  {cycle ? new Date(cycle.start_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : 'Sin iniciar'}
                </span>
                {cycle?.status === 'activo' && (
                  <span className="ml-2 text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse">En curso</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {cycle?.status === 'activo' && (profile?.user_type === 'administrador' || profile?.role === 'jefe de deposito') && (
                <form action={handleCloseWeek}>
                  <button className="bg-red-500 hover:bg-red-400 text-white text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20 font-bold">
                    Cerrar Semana
                  </button>
                </form>
              )}
              <UserMenu user={user} profile={profile} />
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 transition-colors">
        {!cycle ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl animate-in fade-in zoom-in duration-500 shadow-xl shadow-purple-500/5">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-6 ring-8 ring-purple-50 dark:ring-purple-950/10">
              <Package className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 italic">No hay una semana activa</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center font-medium">Inicia una nueva semana para cargar stock e indicar a los vendedores que pueden empezar a cargar pedidos.</p>
            
            {profile?.user_type === 'administrador' || profile?.role === 'jefe de deposito' ? (
               <form action={handleStartWeek}>
                 <button className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 shadow-2xl shadow-purple-600/40 transition-all hover:scale-105 active:scale-95 group">
                  <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" /> Iniciar Nueva Semana
                </button>
               </form>
            ) : (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Solo el Jefe de Depósito puede iniciar la semana.</span>
              </div>
            )}
          </div>
        ) : cycle.status === 'abierto' ? (
          <InitialStockLoader cycleId={cycle.id} products={products} />
        ) : cycle.status === 'activo' ? (
          <CollaborativeOrderSheet 
            cycleId={cycle.id} 
            products={products} 
            customers={customers} 
            initialOrders={initialOrders} 
          />
        ) : (
          <StockReport data={reportData as any} />
        )}
      </main>
    </div>
  )
}
