'use client'

import { useState } from 'react'
import { RoleItem, deleteRole, getRoles } from '@/app/actions/roles'
import { MoreVertical, Edit2, ShieldAlert, Trash2, Plus, Search } from 'lucide-react'
import RoleFormModal from './RoleFormModal'

export default function RolesTable({ initialRoles }: { initialRoles: RoleItem[] }) {
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles)
  const [search, setSearch] = useState('')
  
  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleItem | null>(null)
  
  // Estado para Dropdowns (menú de 3 puntos)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setRoleToEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (role: RoleItem) => {
    setRoleToEdit(role)
    setIsModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleDelete = async (id: string, name: string) => {
    setOpenDropdownId(null)
    if (confirm(`¿Estás seguro que deseas ELIMINAR el rol "${name}"?
Cualquier usuario que tenga este rol pasará a no tener rol y deberá asignársele uno nuevo.`)) {
      try {
        await deleteRole(id)
        setRoles(roles.filter(r => r.id !== id))
      } catch (error: any) {
        alert(error.message || "No se pudo eliminar el rol")
      }
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar roles por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>
        
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex flex-shrink-0 items-center justify-center gap-2 bg-green-600 hover:bg-green-500 transition-colors text-white px-4 py-2 rounded-lg shadow-lg shadow-green-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Rol</span>
        </button>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 text-sm bg-black/10">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Puesto / Oficio</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider w-20 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No se encontraron roles.</p>
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-white capitalize font-medium">{role.name}</span>
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === role.id ? null : role.id)}
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Popover actions */}
                    {openDropdownId === role.id && (
                      <div className="absolute right-8 top-10 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1 z-10 overflow-hidden">
                        <button
                          onClick={() => handleEdit(role)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invisible overlay for closing dropdown */}
      {openDropdownId && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => setOpenDropdownId(null)}
        />
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <RoleFormModal
          role={roleToEdit}
          onClose={() => setIsModalOpen(false)}
          onSuccess={async (updatedRole, isEdit) => {
            // Recargar silenciosamente la lista verdadera desde el servidor para corregir su ID real
            const serverRoles = await getRoles()
            setRoles(serverRoles)
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
