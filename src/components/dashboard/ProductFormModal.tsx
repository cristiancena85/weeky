'use client'

import { useState, useEffect } from 'react'
import { X, Save, Tag, Layers } from 'lucide-react'
import { Product, ProductCategory, UnitTemplate, createProduct, updateProduct, getCategories } from '@/app/actions/products'
import { getProveedores } from '@/app/actions/deposits'
import { toast } from 'sonner'

interface Proveedor {
  id: string;
  nombre: string;
}

type ProductFormModalProps = {
  product?: Product
  templates: UnitTemplate[]
  onClose: () => void
  onSuccess: () => void
}

export default function ProductFormModal({ product, templates, onClose, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  
  // Basic Fields
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [unitTemplateId, setUnitTemplateId] = useState(product?.unit_template_id || '')
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [brand, setBrand] = useState(product?.brand || '')
  const [variant, setVariant] = useState(product?.variant || '')
  const [shield, setShield] = useState(product?.shield || '')
  const [type, setType] = useState(product?.type || '')
  const [proveedorId, setProveedorId] = useState(product?.proveedor_id || '')

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, provs] = await Promise.all([
          getCategories(),
          getProveedores()
        ])
        setCategories(cats)
        setProveedores(provs)
        if (!product?.category_id && cats.length > 0) {
          setCategoryId(cats[0].id)
        }
      } catch (err) {
        console.error("Error cargando datos del formulario:", err)
      }
    }
    loadData()
  }, [product])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = { 
        name, 
        sku: sku || null, 
        unit_template_id: unitTemplateId || null, 
        category_id: categoryId || null,
        brand: brand || null,
        variant: variant || null,
        shield: shield || null,
        type: type || null,
        proveedor_id: proveedorId
      }

      if (!productData.proveedor_id) {
        toast.error('Debes seleccionar un proveedor')
        setLoading(false)
        return
      }

      if (product) {
        await updateProduct(product.id, productData)
        toast.success('Producto actualizado')
      } else {
        await createProduct(productData)
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
                  placeholder="Ej. Cigarrillos Dolch. Box 20"
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
                    placeholder="Ej. Dolchester"
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Acrónimo</label>
                  <input
                    value={shield}
                    onChange={(e) => setShield(e.target.value)}
                    placeholder="Ej. DCH"
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
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Proveedor Principal</label>
                  <select
                    required
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="" disabled>Seleccionar proveedor...</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Unidades Comerciales */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-purple-500" /> Unidad comercial (conversión)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">SKU</label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-001"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Tipo de Unidad</label>
                  <select
                    required
                    value={unitTemplateId}
                    onChange={(e) => setUnitTemplateId(e.target.value)}
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none font-bold text-purple-600 dark:text-purple-400"
                  >
                    <option value="">Selecciona tipo de unidad...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Base: {t.base_unit})</option>
                    ))}
                  </select>
                </div>
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
