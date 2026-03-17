'use client'

import { useState } from 'react'
import { X, Save, UserCircle, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Customer, createCustomer, updateCustomer } from '@/app/actions/customers'
import { Branch } from '@/app/actions/branches'
import { toast } from 'sonner'

type CustomerFormModalProps = {
  customer?: Customer
  branches: Branch[]
  onClose: () => void
  onSuccess: () => void
}

export default function CustomerFormModal({ customer, branches, onClose, onSuccess }: CustomerFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(customer?.name || '')
  const [cuit, setCuit] = useState(customer?.cuit || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [type, setType] = useState<'cliente' | 'vendedor'>(customer?.type || 'cliente')
  const [branchId, setBranchId] = useState(customer?.branch_id || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!branchId) {
        toast.error('Debes seleccionar una sucursal')
        setLoading(false)
        return
      }
      const data = { name, cuit, address, phone, type, branch_id: branchId }
      if (customer) {
        await updateCustomer(customer.id, data)
        toast.success(type === 'cliente' ? 'Cliente actualizado' : 'Vendedor actualizado')
      } else {
        await createCustomer(data)
        toast.success(type === 'cliente' ? 'Cliente creado' : 'Vendedor creado')
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            {customer ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Nombre Completo / Razón Social
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez o Distribuidora X"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              CUIL / CUIT
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="Ej. 20-12345678-9"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Dirección de Entrega
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Calle 123, Ciudad"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Tipo de Registro
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'cliente' | 'vendedor')}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold text-purple-600 dark:text-purple-400"
            >
              <option value="cliente">Cliente (Preventa)</option>
              <option value="vendedor">Vendedor (Distribución/Stock)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Sucursal Obligatoria
            </label>
            <select
              required
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
            >
              <option value="">Selecciona una sucursal...</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +54 9 11 ..."
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
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
              {loading ? 'Guardando...' : customer ? 'Actualizar' : (type === 'cliente' ? 'Crear Cliente' : 'Crear Vendedor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
