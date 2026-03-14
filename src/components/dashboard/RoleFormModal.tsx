'use client'

import { useState } from 'react'
import { RoleItem, createRole, updateRole } from '@/app/actions/roles'
import { X, Save, Shield } from 'lucide-react'

type RoleFormModalProps = {
  role?: RoleItem | null
  onClose: () => void
  onSuccess: (updatedRole: RoleItem, isEdit: boolean) => void
}

export default function RoleFormModal({ role, onClose, onSuccess }: RoleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState(role?.name || '')

  const isEdit = !!role

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isEdit) {
        await updateRole(role.id, name)
        onSuccess({ ...role, name }, true)
      } else {
        await createRole(name)
        // Como no tenemos el ID generado aquí sin recargar, el componente padre
        // puede refrescar los roles llamando a getRoles de nuevo o usando router.refresh().
        onSuccess({ id: 'new', name, created_at: new Date().toISOString() }, false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el rol')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pr-8 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          {isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre o Título del Puesto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vendedor senior"
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? 'Guardar Cambios' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
