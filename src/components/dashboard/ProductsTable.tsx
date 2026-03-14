'use client'

import { useState } from 'react'
import { Product, deleteProduct, getProducts } from '@/app/actions/products'
import { MoreVertical, Edit2, Trash2, Plus, Search, Package, Layers } from 'lucide-react'
import { toast } from 'sonner'
import ProductFormModal from './ProductFormModal'

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const refreshProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err: any) {
      toast.error('Error al recargar productos')
    }
  }

  const handleEdit = (p: Product) => {
    setEditingProduct(p)
    setShowModal(true)
    setOpenDropdownId(null)
  }

  const handleAdd = () => {
    setEditingProduct(undefined)
    setShowModal(true)
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar producto "${name}"?`)) {
      try {
        await deleteProduct(id)
        setProducts(products.filter(p => p.id !== id))
        toast.success('Producto eliminado')
      } catch (err: any) {
        toast.error(err.message)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-black/20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
          />
        </div>
        <button 
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 transition-colors text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-black/10">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Unidades / Conversión</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider w-20 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">{p.name}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-tighter">SKU: {p.sku || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span>1 {Object.keys(p.conversions)[0] || 'Unidad'} = </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {Object.values(p.conversions)[0] || 1} {p.base_unit}s
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Object.entries(p.conversions).length > 1 && `+ ${Object.entries(p.conversions).length - 1} más`}
                  </div>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openDropdownId === p.id && (
                    <div className="absolute right-8 top-10 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-10 overflow-hidden">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id, p.name)}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            refreshProducts()
          }}
        />
      )}
      {openDropdownId && <div className="fixed inset-0 z-[5]" onClick={() => setOpenDropdownId(null)} />}
    </div>
  )
}
