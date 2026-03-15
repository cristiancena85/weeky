'use client'

import { useState } from 'react'
import { Product } from '@/app/actions/products'
import { setInitialStock, activateCycle } from '@/app/actions/inventory'
import { Save, Play, Package, ArrowRight, Layers } from 'lucide-react'
import { toast } from 'sonner'

type InitialStockLoaderProps = {
  cycleId: string
  products: Product[]
}

export default function InitialStockLoader({ cycleId, products }: InitialStockLoaderProps) {
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, { val: number, unit: string }>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: { val: 0, unit: p.template?.base_unit || 'unidades' } }), {})
  )

  const handleUpdate = (productId: string, val: number, unit: string) => {
    setQuantities({ ...quantities, [productId]: { val, unit } })
  }

  const handleSave = async (activate = false) => {
    setLoading(true)
    try {
      // Convertir todo a unidades base
      const stockEntries = products.map(p => {
        const entry = quantities[p.id]
        let totalUnits = entry.val
        const baseUnit = p.template?.base_unit || 'unidades'
        if (entry.unit !== baseUnit) {
          const unitData = p.template?.units?.find(u => u.unit_name === entry.unit)
          const factor = unitData?.conversion_factor || 1
          totalUnits = entry.val * factor
        }
        return { productId: p.id, quantity: totalUnits }
      })

      await setInitialStock(cycleId, stockEntries)
      
      if (activate) {
        await activateCycle(cycleId)
        toast.success('¡Semana activada! Los vendedores ya pueden cargar pedidos.')
      } else {
        toast.success('Stock guardado borradores')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 italic">Carga de Stock Inicial</h2>
          <p className="text-purple-700 dark:text-purple-400 text-sm">Ingresa las cantidades físicas disponibles en depósito para esta semana.</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-white dark:bg-white/5 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar Borrador
          </button>
          <button 
            disabled={loading}
            onClick={() => handleSave(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/30 flex items-center gap-2 font-bold"
          >
            <Play className="w-4 h-4" /> ACTIVAR SEMANA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const baseUnit = p.template?.base_unit || 'unidades'
          return (
          <div key={p.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                <Package className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-purple-600" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
            </div>
            
            <div className="flex gap-2 items-center bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-100 dark:border-white/5">
              <input 
                type="number"
                min="0"
                value={quantities[p.id].val}
                onChange={(e) => handleUpdate(p.id, Number(e.target.value), quantities[p.id].unit)}
                className="flex-1 bg-transparent border-none text-right font-bold text-slate-900 dark:text-white focus:ring-0 text-xl"
              />
              <select 
                value={quantities[p.id].unit}
                onChange={(e) => handleUpdate(p.id, quantities[p.id].val, e.target.value)}
                className="bg-white dark:bg-white/10 border-none rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 focus:ring-0 cursor-pointer"
              >
                <option value={baseUnit} className="bg-white dark:bg-slate-900">{baseUnit}</option>
                {p.template?.units?.map(unit => (
                  <option key={unit.id || unit.unit_name} value={unit.unit_name} className="bg-white dark:bg-slate-900">{unit.unit_name}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-2 flex items-center justify-between px-1">
               <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Equivale a:</span>
               <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                 {quantities[p.id].unit !== baseUnit ? (
                  <>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {quantities[p.id].val * (p.template?.units?.find(u => u.unit_name === quantities[p.id].unit)?.conversion_factor || 1)}
                    </span>
                    <span>{baseUnit}</span>
                  </>
                 ) : (
                  <span>---</span>
                 )}
               </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}
