'use client'

import { useState } from 'react'
import { X, Save, Plus, Trash2, Layers, Asterisk } from 'lucide-react'
import { UnitTemplate, TemplateUnit, createTemplate, updateTemplate } from '@/app/actions/products'
import { toast } from 'sonner'

type TemplateFormModalProps = {
  template?: UnitTemplate
  onClose: () => void
  onSuccess: () => void
}

export default function TemplateFormModal({ template, onClose, onSuccess }: TemplateFormModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(template?.name || '')
  const [baseUnit, setBaseUnit] = useState(template?.base_unit || 'unidades')

  // Units
  const [units, setUnits] = useState<TemplateUnit[]>(
    template?.units?.length ? template.units : []
  )

  const handleAddUnit = () => {
    setUnits([
      ...units, 
      { template_id: template?.id || '', unit_name: '', conversion_factor: 1, hierarchy_level: units.length, id: '' }
    ])
  }

  const handleUpdateUnit = (index: number, field: keyof TemplateUnit, value: any) => {
    const newUnits = [...units]
    newUnits[index] = { ...newUnits[index], [field]: value }
    setUnits(newUnits)
  }

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const templateData = { 
        name, 
        base_unit: baseUnit
      }

      if (template) {
        await updateTemplate(template.id, templateData, units)
        toast.success('Plantilla actualizada')
      } else {
        await createTemplate(templateData, units)
        toast.success('Plantilla creada')
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col scale-in-center transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre de la Plantilla</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Cigarrillos Box 20"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">Unidad Mínima Base <Asterisk className="w-2 h-2 text-red-500" /></label>
                <input
                  required
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  placeholder="ej. cigarrillo, hoja, unidad"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-bold text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-purple-500" /> Jerarquía de Unidades
              </h3>

              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-2 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="col-span-4">Nombre Unidad</div>
                  <div className="col-span-3">Equivale a</div>
                  <div className="col-span-4">Descripción</div>
                  <div className="col-span-1"></div>
                </div>
                {units.map((unit, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center bg-white dark:bg-black/20 p-2 sm:p-0 rounded-lg border sm:border-0 border-slate-200 dark:border-white/5">
                    <div className="w-full sm:col-span-4 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx}</span>
                      <input
                        required
                        placeholder="Ej. Pallet..."
                        value={unit.unit_name}
                        onChange={(e) => handleUpdateUnit(idx, 'unit_name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="w-full sm:col-span-3 flex items-center gap-1">
                      <span className="text-xs text-slate-500">=</span>
                      <input
                        required
                        type="number"
                        min="1"
                        value={unit.conversion_factor || ''}
                        onChange={(e) => handleUpdateUnit(idx, 'conversion_factor', Number(e.target.value))}
                        className="w-16 sm:w-20 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-1 py-1 text-sm font-mono text-purple-600 dark:text-purple-400 focus:outline-none focus:border-purple-500 text-right"
                      />
                      <span className="text-xs text-slate-500 truncate">{baseUnit}s</span>
                    </div>
                    <div className="w-full sm:col-span-4 flex items-center">
                      <input
                        placeholder="Ej. 60 cajas..."
                        value={unit.description || ''}
                        onChange={(e) => handleUpdateUnit(idx, 'description', e.target.value)}
                        className="w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end w-full sm:w-auto">
                      <button type="button" onClick={() => handleRemoveUnit(idx)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 dark:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                
                <button 
                  type="button" 
                  onClick={handleAddUnit}
                  className="w-full mt-2 py-2 border-2 border-dashed border-purple-200 dark:border-purple-900/50 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Unidad
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="template-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : template ? 'Guardar Cambios' : 'Crear Plantilla'}
          </button>
        </div>
      </div>
    </div>
  )
}
