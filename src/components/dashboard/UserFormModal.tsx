'use client'

import { useState } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { UserProfile, createUser, updateUser } from '@/app/actions/users'

type UserFormModalProps = {
  user: UserProfile | null
  onClose: () => void
  onSuccess: (user: UserProfile, isEdit: boolean) => void
}

export default function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = !!user
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    full_name: user?.full_name || '',
    user_type: user?.user_type || 'usuario',
    role: user?.role || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit) {
        await updateUser(user.id, formData)
        // Actualización optimista local
        onSuccess({ ...user, ...formData } as UserProfile, true)
      } else {
        if (!formData.password) throw new Error('La contraseña es requerida para nuevos usuarios.')
        await createUser(formData)
        // Para simplificar, forzamos recarga en vez de hacer el objeto falso si no tenemos el ID
        window.location.reload()
      }
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
              <input
                type="email"
                required
                disabled={isEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {!isEdit && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Contraseña Temporal</label>
                <input
                  type="password"
                  required={!isEdit}
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Tipo de Usuario</label>
              <select
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 [&>option]:bg-slate-900"
              >
                <option value="usuario">Usuario Regular</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Rol / Puesto</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 [&>option]:bg-slate-900"
              >
                <option value="">Ninguno</option>
                <option value="jefe de deposito">Jefe de Depósito</option>
                <option value="jefe de ventas">Jefe de Ventas</option>
                <option value="supervisor">Supervisor</option>
                <option value="administrativo">Administrativo</option>
                <option value="tesorero">Tesorero</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
