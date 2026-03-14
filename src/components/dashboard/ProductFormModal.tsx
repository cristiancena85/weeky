'use client'

import { useState } from 'react'
import { X, Save, Plus, Trash2, Layers } from 'lucide-react'
import { Product, createProduct, updateProduct } from '@/app/actions/products'
import { toast } from 'sonner'

type ProductFormModalProps = {
  product?: Product
  onClose: () => void
  onSuccess: () => void
}

export default function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [baseUnit, setBaseUnit] = useState(product?.base_unit || 'unidades')
  const [conversions, setConversions] = useState<Record<string, number>>(product?.conversions || {})

  const handleAddConversion = () => {
    setConversions({ ...conversions, '': 1 })
  }

  const handleUpdateConversionName = (oldKey: string, newKey: string) => {
    const val = conversions[oldKey]
    const updated = { ...conversions }
    delete updated[oldKey]
    updated[newKey] = val
    setConversions(updated)
  }

  const handleUpdateConversionValue = (key: string, value: number) => {
    setConversions({ ...conversions, [key]: value })
  }

  const handleRemoveConversion = (key: string) => {
    const updated = { ...conversions }
    delete updated[key]
    setConversions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = { name, sku, base_unit: baseUnit, conversions }
      if (product) {
        await updateProduct(product.id, data)
        toast.success('Producto actualizado')
      } else {
        await createProduct(data)
        toast.success('Producto creado')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden scale-in-center transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Nombre del Producto
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Cigarrillos Marlb."
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                SKU / Código
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-001"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Unidad Base (mínima)
            </label>
            <input
              required
              value={baseUnit}
              onChange={(e) => setBaseUnit(e.target.value)}
              placeholder="unidades, gramos, etc."
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>

          <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversiones de Unidades</h3>
              <button 
                type="button" 
                onClick={handleAddConversion}
                className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(conversions).map(([unit, factor], idx) => (
                <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right-2 duration-300">
                  <span className="text-sm font-medium text-slate-400">1</span>
                  <input
                    placeholder="Unidad (ej. Caja)"
                    value={unit}
                    onChange={(e) => handleUpdateConversionName(unit, e.target.value)}
                    className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm dark:text-white focus:outline-none"
                  />
                  <span className="text-sm font-medium text-slate-400">=</span>
                  <input
                    type="number"
                    value={factor}
                    onChange={(e) => handleUpdateConversionValue(unit, Number(e.target.value))}
                    className="w-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm dark:text-white focus:outline-none"
                  />
                  <span className="text-sm font-medium text-slate-400">{baseUnit}s</span>
                  <button onClick={() => handleRemoveConversion(unit)} className="text-red-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {Object.keys(conversions).length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">Sin conversiones configuradas</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
