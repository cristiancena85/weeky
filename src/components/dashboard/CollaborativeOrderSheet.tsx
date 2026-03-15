'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/app/actions/products'
import { Customer } from '@/app/actions/customers'
import { createOrder, getOrdersWithItems, updateOrderStatus } from '@/app/actions/orders'
import { ShoppingCart, Plus, User, Package, Clock, CheckCircle2, Truck, XCircle, Search, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

type OrderSheetProps = {
  cycleId: string
  products: Product[]
  customers: Customer[]
  initialOrders: any[]
}

export default function CollaborativeOrderSheet({ cycleId, products, customers, initialOrders }: OrderSheetProps) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Estado para un nuevo pedido en construcción
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [cart, setCart] = useState<Record<string, { val: number, unit: string }>>({})

  useEffect(() => {
    // Suscripción Realtime a pedidos e items
    const channel = supabase
      .channel('orders-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `cycle_id=eq.${cycleId}` }, async () => {
        const freshOrders = await getOrdersWithItems(cycleId)
        setOrders(freshOrders)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, async () => {
         // Re-fetch orders to get updated items
         const freshOrders = await getOrdersWithItems(cycleId)
         setOrders(freshOrders)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cycleId])

  const handleAddToCart = (productId: string, val: number, unit: string) => {
    setCart(prev => ({ ...prev, [productId]: { val, unit } }))
  }

  const handleCreateOrder = async () => {
    if (!selectedCustomerId) return toast.error('Selecciona un cliente')
    
    const items = Object.entries(cart)
      .filter(([_, data]) => data.val > 0)
      .map(([productId, data]) => {
        const p = products.find(prod => prod.id === productId)!
        let totalUnits = data.val
        const baseUnit = p.template?.base_unit || 'unidades'
        if (data.unit !== baseUnit) {
          const unitData = p.template?.units?.find(u => u.unit_name === data.unit)
          totalUnits = data.val * (unitData?.conversion_factor || 1)
        }
        return {
          product_id: productId,
          quantity: totalUnits,
          display_quantity: data.val,
          display_unit: data.unit
        }
      })

    if (items.length === 0) return toast.error('El carrito está vacío')

    setLoading(true)
    try {
      await createOrder(cycleId, selectedCustomerId, items)
      toast.success('Pedido cargado con éxito')
      setCart({})
      setSelectedCustomerId('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Estado actualizado a ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return <Clock className="w-4 h-4 text-amber-500" />
      case 'picking': return <Package className="w-4 h-4 text-blue-500" />
      case 'entregado': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      default: return <XCircle className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Carga de Pedido */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-xl sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-xl font-bold italic underline decoration-purple-500/30 underline-offset-4">Nuevo Pedido</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Cliente</label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/20 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white"
              >
                <option value="">Selecciona un cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {products.map(p => {
                const baseUnit = p.template?.base_unit || 'unidades'
                return (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-purple-500/30 transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 italic">Unidad: {baseUnit}</p>
                  </div>
                  <div className="flex gap-2 items-center bg-white dark:bg-black/40 rounded-lg p-1 border dark:border-white/10 shadow-sm">
                    <input 
                      type="number"
                      min="0"
                      placeholder="0"
                      value={cart[p.id]?.val || ''}
                      onChange={(e) => handleAddToCart(p.id, Number(e.target.value), cart[p.id]?.unit || baseUnit)}
                      className="w-14 bg-transparent border-none text-right font-bold text-slate-900 dark:text-white p-0 focus:ring-0 text-sm"
                    />
                    <select 
                      value={cart[p.id]?.unit || baseUnit}
                      onChange={(e) => handleAddToCart(p.id, cart[p.id]?.val || 0, e.target.value)}
                      className="bg-purple-100 dark:bg-purple-900/30 border-none rounded text-[10px] font-black text-purple-700 dark:text-purple-300 p-1 focus:ring-0 cursor-pointer"
                    >
                      <option value={baseUnit}>{baseUnit[0].toUpperCase()}</option>
                      {p.template?.units?.map(u => (
                        <option key={u.id || u.unit_name} value={u.unit_name}>{u.unit_name[0].toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )})}
            </div>

            <button 
              disabled={loading || !selectedCustomerId}
              onClick={handleCreateOrder}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 transition-all text-white rounded-2xl font-black shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? 'Cargando...' : 'CONFIRMAR PEDIDO'}
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Listado de Pedidos Actuales */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-4 h-4" /> Actividad Reciente
          </h2>
          <div className="flex -space-x-2">
             {/* Aquí podríamos mostrar burbujas de quién está online editando la hoja */}
          </div>
        </div>

        {orders.length === 0 && (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-transparent transition-colors">
            No hay pedidos cargados todavía. ¡Sé el primero!
          </div>
        )}

        {orders.map((o: any) => (
          <div key={o.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-white/10">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{o.customers?.name}</p>
                  <p className="text-[10px] text-slate-400">Vendedor: {o.profiles?.alias || 'Desconocido'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-black/40 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 group-hover:border-purple-500/30 transition-all">
                  <button 
                    onClick={() => handleStatusUpdate(o.id, 'picking')}
                    className={`p-1 rounded-md transition-colors ${o.status === 'picking' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
                    title="En Picking"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(o.id, 'entregado')}
                    className={`p-1 rounded-md transition-colors ${o.status === 'entregado' ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
                    title="Entregado"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-black/40 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
                  {getStatusIcon(o.status)}
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-wider transition-colors">{o.status}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {o.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                    {item.products?.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.display_quantity} {item.display_unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
