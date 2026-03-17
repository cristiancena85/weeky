'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react'
import { UserProfile, deleteUser } from '@/app/actions/users'
import { RoleItem } from '@/app/actions/roles'
import UserFormModal from './UserFormModal'

export default function UsersTable({ initialUsers, roles }: { initialUsers: UserProfile[], roles: RoleItem[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase()
    const rolesLower = u.roles?.map(r => r.roles.name.toLowerCase()).join(' ') || ''
    return (
      u.email.toLowerCase().includes(term) ||
      (u.alias && u.alias.toLowerCase().includes(term)) ||
      (u.first_name && u.first_name.toLowerCase().includes(term)) ||
      (u.last_name && u.last_name.toLowerCase().includes(term)) ||
      rolesLower.includes(term) ||
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
    <>
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuario por email, nombre o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
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
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 transition-colors">
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuario</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Rol</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0">
                        {user.user_type === 'administrador' ? (
                          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.alias}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {user.first_name} {user.last_name} • {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((r, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 transition-colors">
                            {r.roles.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.user_type === 'administrador'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30'
                          : 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30'
                      }`}
                    >
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
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

    </div>
    {isModalOpen && (
      <UserFormModal
        user={userToEdit}
        roles={roles}
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
  </>
  )
}
