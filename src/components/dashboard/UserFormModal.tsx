'use client'

import { useState } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { UserProfile, createUser, updateUser } from '@/app/actions/users'
import { RoleItem } from '@/app/actions/roles'

type UserFormModalProps = {
  user: UserProfile | null
  roles: RoleItem[]
  onClose: () => void
  onSuccess: (user: UserProfile, isEdit: boolean) => void
}

export default function UserFormModal({ user, roles, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = !!user
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    alias: user?.alias || '',
    user_type: user?.user_type || 'usuario',
    role_ids: user?.roles?.map(r => r.role_id) || [] as string[]
  })

  const toggleRole = (roleId: string) => {
    setFormData(prev => {
      const exists = prev.role_ids.includes(roleId)
      if (exists) {
        return { ...prev, role_ids: prev.role_ids.filter(id => id !== roleId) }
      } else {
        return { ...prev, role_ids: [...prev.role_ids, roleId] }
      }
    })
  }

  const selectAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      role_ids: roles.map(r => r.id)
    }))
  }

  const clearAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      role_ids: []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit) {
        await updateUser(user.id, formData)
        
        // Reconstruimos el objeto roles para la actualización optimista en la tabla
        const rolesDeUsuario = roles
          .filter(r => formData.role_ids.includes(r.id))
          .map(r => ({ role_id: r.id, roles: { name: r.name } }))

        onSuccess({ ...user, ...formData, roles: rolesDeUsuario } as UserProfile, true)
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[calc(100vh-2rem)] transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
              <input
                type="email"
                required
                disabled={isEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
                placeholder="Ej: Juan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
                placeholder="Ej: Pérez"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Alias (Obligatorio)</label>
              <input
                type="text"
                required
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
                placeholder="Ej: juanp"
              />
              <p className="text-[10px] text-slate-400">Este será el nombre visible para otros colaboradores.</p>
            </div>

            {!isEdit && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña Temporal</label>
                <input
                  type="password"
                  required={!isEdit}
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Usuario</label>
              <select
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 [&>option]:bg-white dark:[&>option]:bg-slate-900 transition-colors"
              >
                <option value="usuario">Usuario Regular</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Roles / Funciones</label>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={selectAllRoles}
                    className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Seleccionar Todos
                  </button>
                  <button 
                    type="button"
                    onClick={clearAllRoles}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Quitar Todos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <label 
                    key={role.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.role_ids.includes(role.id)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.role_ids.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      formData.role_ids.includes(role.id) 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'border-slate-300 dark:border-white/20'
                    }`}>
                      {formData.role_ids.includes(role.id) && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <span className={`text-sm font-bold ${formData.role_ids.includes(role.id) ? 'text-purple-900 dark:text-purple-100' : 'text-slate-600 dark:text-slate-400'}`}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-slate-900 transition-colors">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
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
