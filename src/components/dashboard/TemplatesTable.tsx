'use client'

import { useState } from 'react'
import { UnitTemplate, deleteTemplate, getTemplates } from '@/app/actions/products'
import { MoreVertical, Edit2, Trash2, Plus, Search, Layers } from 'lucide-react'
import { toast } from 'sonner'
import TemplateFormModal from './TemplateFormModal'

export default function TemplatesTable({ initialTemplates }: { initialTemplates: UnitTemplate[] }) {
  const [templates, setTemplates] = useState<UnitTemplate[]>(initialTemplates)
  const [search, setSearch] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<UnitTemplate | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const refreshTemplates = async () => {
    try {
      const data = await getTemplates()
      setTemplates(data)
    } catch (err: any) {
      toast.error('Error al recargar unidades comerciales')
    }
  }

  const handleEdit = (t: UnitTemplate) => {
    setEditingTemplate(t)
    setShowModal(true)
    setOpenDropdownId(null)
  }

  const handleAdd = () => {
    setEditingTemplate(undefined)
    setShowModal(true)
  }

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar unidad comercial "${name}"? Esto podría afectar a los productos asociados si cascade delete está habilitado.`)) {
      try {
        await deleteTemplate(id)
        setTemplates(templates.filter(t => t.id !== id))
        toast.success('Unidad comercial eliminada')
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
            placeholder="Buscar unidades comerciales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
          />
        </div>
        <button 
          onClick={handleAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 transition-colors text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Unidad Comercial</span>
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-black/10">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Unidad Comercial</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Detalle</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider w-20 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white font-medium">{t.name}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-tighter">Base: {t.base_unit}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      {t.units && t.units.length > 0 ? (
                        <>
                          <span className="font-medium text-slate-900 dark:text-white">{t.units[0].unit_name}</span>
                          <span className="text-slate-400">=</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {t.units[0].conversion_factor} {t.base_unit}s
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Sin unidades configuradas</span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {t.units && t.units.length > 1 && `+ ${t.units.length - 1} sub-unidades`}
                  </div>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === t.id ? null : t.id)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openDropdownId === t.id && (
                    <div className="absolute right-8 top-10 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-10 overflow-hidden">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id, t.name)}
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
        <TemplateFormModal
          template={editingTemplate}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            refreshTemplates()
          }}
        />
      )}
      {openDropdownId && <div className="fixed inset-0 z-[5]" onClick={() => setOpenDropdownId(null)} />}
    </div>
  )
}
