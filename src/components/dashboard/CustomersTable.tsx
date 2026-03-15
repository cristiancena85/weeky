'use client'

import { useState } from 'react'
import { Customer, deleteCustomer, getCustomers } from '@/app/actions/customers'
import { MoreVertical, Edit2, Trash2, Plus, Search, UserCircle, Truck, Store } from 'lucide-react'
import { toast } from 'sonner'
import CustomerFormModal from './CustomerFormModal'

export default function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'cliente' | 'vendedor'>('all')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const refreshCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err: any) {
      toast.error('Error al recargar clientes')
    }
  }

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c)
    setShowModal(true)
    setOpenDropdownId(null)
  }

  const handleAdd = () => {
    setEditingCustomer(undefined)
    setShowModal(true)
  }

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.address?.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || c.type === filterType
    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar cliente "${name}"?`)) {
      try {
        await deleteCustomer(id)
        setCustomers(customers.filter(c => c.id !== id))
        toast.success('Cliente eliminado')
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
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
          />
        </div>
        
        <div className="flex bg-slate-100 dark:bg-black/30 p-1 rounded-xl border border-slate-200 dark:border-white/5 w-full sm:w-auto">
          <button 
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-white/10 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterType('cliente')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'cliente' ? 'bg-white dark:bg-white/10 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Clientes
          </button>
          <button 
            onClick={() => setFilterType('vendedor')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'vendedor' ? 'bg-white dark:bg-white/10 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Vendedores
          </button>
        </div>
        <button 
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 transition-colors text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Cliente</span>
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-black/10">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Dirección / Tel</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider w-20 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${c.type === 'vendedor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                      {c.type === 'vendedor' ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                    </div>
                    <span className="text-slate-900 dark:text-white font-bold">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                     c.type === 'vendedor' 
                     ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-400/10 dark:border-blue-400/20' 
                     : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-400/10 dark:border-green-400/20'
                   }`}>
                     {c.type}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">{c.address || 'Sin dirección'}</div>
                  <div className="text-xs text-slate-400">{c.phone || 'Sin teléfono'}</div>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openDropdownId === c.id && (
                    <div className="absolute right-8 top-10 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-10 overflow-hidden">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id, c.name)}
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
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            refreshCustomers()
          }}
        />
      )}
      {openDropdownId && <div className="fixed inset-0 z-[5]" onClick={() => setOpenDropdownId(null)} />}
    </div>
  )
}
