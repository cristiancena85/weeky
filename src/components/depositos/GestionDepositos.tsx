'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Truck, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Warehouse,
  User
} from 'lucide-react';
import { createDeposito, updateDeposito, deleteDeposito } from '@/app/actions/deposits';
import { toast } from 'sonner';

interface Deposito {
  id: string;
  nombre: string;
  tipo: 'central' | 'vendedor';
  sucursal_id?: string;
  usuario_id?: string;
  activo: boolean;
  sucursal?: { name: string };
  vendedor?: { full_name: string };
}

interface GestionDepositosProps {
  depositos: Deposito[];
  branches: any[];
  users: any[];
}

export default function GestionDepositos({ depositos, branches, users }: GestionDepositosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState<Deposito | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'central' as 'central' | 'vendedor',
    sucursal_id: '',
    usuario_id: '',
    activo: true
  });

  const handleOpenModal = (deposito?: Deposito) => {
    if (deposito) {
      setEditingDeposito(deposito);
      setFormData({
        nombre: deposito.nombre,
        tipo: deposito.tipo,
        sucursal_id: deposito.sucursal_id || '',
        usuario_id: deposito.usuario_id || '',
        activo: deposito.activo
      });
    } else {
      setEditingDeposito(null);
      setFormData({
        nombre: '',
        tipo: 'central',
        sucursal_id: '',
        usuario_id: '',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDeposito) {
        await updateDeposito(editingDeposito.id, {
          ...formData,
          sucursal_id: formData.tipo === 'central' ? formData.sucursal_id : null,
          usuario_id: formData.tipo === 'vendedor' ? formData.usuario_id : null,
        });
        toast.success('Depósito actualizado correctamente');
      } else {
        await createDeposito(formData);
        toast.success('Depósito creado correctamente');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este depósito? Se perderá el historial de stock asociado.')) return;
    try {
      await deleteDeposito(id);
      toast.success('Depósito eliminado');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredDepositos = depositos.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.sucursal?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vendedor?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, sucursal o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Depósito
        </button>
      </div>

      {/* Tabla de Depósitos */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Depósito</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Vinculación</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredDepositos.map((deposito) => (
                <tr key={deposito.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        deposito.tipo === 'central' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
                      }`}>
                        {deposito.tipo === 'central' ? <Warehouse className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{deposito.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      deposito.tipo === 'central' 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {deposito.tipo === 'central' ? 'Central' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {deposito.tipo === 'central' ? (
                        <>
                          <Building2 className="w-4 h-4 opacity-50" />
                          {deposito.sucursal?.name || 'Sin sucursal'}
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 opacity-50" />
                          {deposito.vendedor?.full_name || 'Sin vendedor'}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {deposito.activo ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <XCircle className="w-4 h-4" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(deposito)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/20 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(deposito.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f0f13] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingDeposito ? 'Editar Depósito' : 'Nuevo Depósito'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                Configure un punto de almacenamiento físico o móvil.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Depósito</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Depósito Central Norte"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                  />
                </div>

                {/* Tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'central' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                      formData.tipo === 'central'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-500/10 text-purple-600'
                        : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <Warehouse className="w-5 h-5" /> Físico / Central
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'vendedor' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                      formData.tipo === 'vendedor'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-500/10 text-purple-600'
                        : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Vendedor / Camión
                  </button>
                </div>

                {/* Sucursal (Si es Central) */}
                {formData.tipo === 'central' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sucursal Asociada</label>
                    <select
                      required
                      value={formData.sucursal_id}
                      onChange={(e) => setFormData({ ...formData, sucursal_id: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold appearance-none"
                    >
                      <option value="">Seleccione una sucursal...</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Usuario (Si es Vendedor) */}
                {formData.tipo === 'vendedor' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendedor / Chofér</label>
                    <select
                      required
                      value={formData.usuario_id}
                      onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold appearance-none"
                    >
                      <option value="">Seleccione al responsable...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name || u.alias || u.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Switch Activo */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">Depósito Activo</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">Habilita este depósito para movimientos de stock.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.activo ? 'bg-purple-600' : 'bg-slate-300 dark:bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      formData.activo ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'Guardando...' : editingDeposito ? 'Actualizar' : 'Crear Depósito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
