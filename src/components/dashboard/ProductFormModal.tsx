'use client'

import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Layers, Tag, Asterisk } from 'lucide-react'
import { Product, ProductCategory, ProductUnit, createProduct, updateProduct, getCategories } from '@/app/actions/products'
import { toast } from 'sonner'

type ProductFormModalProps = {
  product?: Product
  onClose: () => void
  onSuccess: () => void
}

export default function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  
  // Basic Fields
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [baseUnit, setBaseUnit] = useState(product?.base_unit || 'unidades')
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [brand, setBrand] = useState(product?.brand || '')
  const [variant, setVariant] = useState(product?.variant || '')
  const [shield, setShield] = useState(product?.shield || '')
  const [type, setType] = useState(product?.type || '')

  // Units
  const [units, setUnits] = useState<ProductUnit[]>(
    product?.units?.length ? product.units : []
  )

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats)
        if (!product?.category_id && cats.length > 0) {
          setCategoryId(cats[0].id)
        }
      } catch (err) {
        console.error("Error cargando categorías:", err)
      }
    }
    loadCategories()
  }, [product])

  const handleAddUnit = () => {
    setUnits([
      ...units, 
      { unit_name: '', conversion_factor: 1, is_base_unit: false, hierarchy_level: units.length }
    ])
  }

  const handleUpdateUnit = (index: number, field: keyof ProductUnit, value: any) => {
    const newUnits = [...units]
    newUnits[index] = { ...newUnits[index], [field]: value }
    setUnits(newUnits)
  }

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const applyTemplate = (templateType: 'cigarrillos' | 'papeles') => {
    if (templateType === 'cigarrillos') {
      setBaseUnit('cigarrillo')
      setUnits([
        { unit_name: 'Pallet', conversion_factor: 300000, is_base_unit: false, hierarchy_level: 0 },
        { unit_name: 'Caja', conversion_factor: 5000, is_base_unit: false, hierarchy_level: 1 },
        { unit_name: 'Cartón', conversion_factor: 200, is_base_unit: false, hierarchy_level: 2 },
        { unit_name: 'Unidad (Atado)', conversion_factor: 20, is_base_unit: false, hierarchy_level: 3 }
      ])
    } else {
      setBaseUnit('hoja')
      setUnits([
        { unit_name: 'Caja', conversion_factor: 125000, is_base_unit: false, hierarchy_level: 0 },
        { unit_name: 'Blister', conversion_factor: 1250, is_base_unit: false, hierarchy_level: 1 },
        { unit_name: 'Libro', conversion_factor: 50, is_base_unit: false, hierarchy_level: 2 }
      ])
    }
    toast.success('Plantilla de unidades aplicada')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = { 
        name, 
        sku: sku || null, 
        base_unit: baseUnit, 
        category_id: categoryId || null,
        brand: brand || null,
        variant: variant || null,
        shield: shield || null,
        type: type || null
      }

      if (product) {
        await updateProduct(product.id, productData, units)
        toast.success('Producto actualizado')
      } else {
        await createProduct(productData, units)
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col scale-in-center transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Categoría y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Categoría</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre Descriptivo</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Cigarrillos Marlb. Box 20"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Atributos del Producto */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-purple-500" /> Atributos Específicos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Marca</label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej. Marlboro"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Variante</label>
                  <input
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    placeholder="Ej. Gold"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Escudo</label>
                  <input
                    value={shield}
                    onChange={(e) => setShield(e.target.value)}
                    placeholder="Ej. Sin escudo"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo</label>
                  <input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="Ej. Box 20"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Unidades Comerciales */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" /> Unidades Comerciales
                </h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => applyTemplate('cigarrillos')} className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white px-2 py-1 rounded">
                    Plantilla Cigarrillos
                  </button>
                  <button type="button" onClick={() => applyTemplate('papeles')} className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white px-2 py-1 rounded">
                    Plantilla Papeles
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">SKU</label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-001"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1 flex items-center gap-1">Unidad Mínima Base <Asterisk className="w-2 h-2 text-red-500" /></label>
                  <input
                    required
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    placeholder="ej. cigarrillo, hoja, unidad"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none font-bold text-purple-600 dark:text-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="col-span-5">Nombre Unidad</div>
                  <div className="col-span-6">Equivale a (Cant. de {baseUnit}s)</div>
                  <div className="col-span-1"></div>
                </div>
                {units.map((unit, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center bg-white dark:bg-black/20 p-2 sm:p-0 rounded-lg border sm:border-0 border-slate-200 dark:border-white/5">
                    <div className="w-full sm:col-span-5 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx}</span>
                      <input
                        required
                        placeholder="Ej. Pallet, Caja..."
                        value={unit.unit_name}
                        onChange={(e) => handleUpdateUnit(idx, 'unit_name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="w-full sm:col-span-6 flex items-center gap-2">
                      <span className="text-xs text-slate-500">=</span>
                      <input
                        required
                        type="number"
                        min="1"
                        value={unit.conversion_factor || ''}
                        onChange={(e) => handleUpdateUnit(idx, 'conversion_factor', Number(e.target.value))}
                        className="w-24 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 text-sm font-mono text-purple-600 dark:text-purple-400 focus:outline-none focus:border-purple-500 text-right"
                      />
                      <span className="text-xs text-slate-500 truncate max-w-[80px]">{baseUnit}s</span>
                    </div>
                    <div className="col-span-1 flex justify-end w-full sm:w-auto">
                      <button type="button" onClick={() => handleRemoveUnit(idx)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 dark:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddUnit}
                  className="w-full mt-2 py-2 border-2 border-dashed border-purple-200 dark:border-purple-900/50 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Unidad Comercial
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : product ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
