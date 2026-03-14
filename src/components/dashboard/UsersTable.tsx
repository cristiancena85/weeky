'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react'
import { UserProfile, deleteUser } from '@/app/actions/users'
import UserFormModal from './UserFormModal'

export default function UsersTable({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(term) ||
      (u.full_name && u.full_name.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term)) ||
      u.user_type.toLowerCase().includes(term)
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar permanentemente a este usuario?')) return

    setIsDeleting(id)
    try {
      await deleteUser(id)
      setUsers(users.filter((u) => u.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleOpenCreate = () => {
    setUserToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: UserProfile) => {
    setUserToEdit(user)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuario por email, nombre o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Usuario</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Rol</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Tipo</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        {user.user_type === 'administrador' ? (
                          <ShieldCheck className="w-5 h-5 text-purple-400" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.full_name || 'Sin Nombre'}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 capitalize">{user.role || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.user_type === 'administrador'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}
                    >
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar usuario"
                      >
                        {isDeleting === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal
          user={userToEdit}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(updatedUser: UserProfile, isEdit: boolean) => {
            if (isEdit) {
              setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
            } else {
              setUsers([updatedUser, ...users])
            }
          }}
        />
      )}
    </div>
  )
}
