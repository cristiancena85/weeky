'use client';

import { useState } from 'react';
import { 
  Package, 
  Search, 
  ArrowRight, 
  Save, 
  RefreshCcw, 
  Plus, 
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ajustarStockDeposito } from '@/app/actions/deposits';
import { toast } from 'sonner';

interface Deposito {
  id: string;
  nombre: string;
  tipo: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  base_unit?: string | null;
}

interface StockItem {
  producto_id: string;
  deposito_id: string;
  cantidad: number;
}

export default function AjusteStock({ 
  depositos, 
  productos,
  stockActual 
}: { 
  depositos: Deposito[], 
  productos: Product[],
  stockActual: StockItem[]
}) {
  const [depositoId, setDepositoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ajustes, setAjustes] = useState<{ producto_id: string; nueva_cantidad: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const productosFiltrados = productos.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductoParaAjuste = (producto: Product) => {
    if (ajustes.some(a => a.producto_id === producto.id)) {
      toast.error('Este producto ya está en la lista de ajuste');
      return;
    }
    const stockExistente = stockActual.find(s => s.producto_id === producto.id && s.deposito_id === depositoId)?.cantidad || 0;
    setAjustes([...ajustes, { producto_id: producto.id, nueva_cantidad: stockExistente }]);
    setSearchTerm('');
  };

  const updateAjusteCantidad = (productoId: string, cantidad: number) => {
    setAjustes(ajustes.map(a => 
      a.producto_id === productoId ? { ...a, nueva_cantidad: Math.max(0, cantidad) } : a
    ));
  };

  const removeAjuste = (productoId: string) => {
    setAjustes(ajustes.filter(a => a.producto_id !== productoId));
  };

  const handleSave = async () => {
    if (!depositoId) {
      toast.error('Selecciona un depósito primero');
      return;
    }
    if (ajustes.length === 0) {
      toast.error('No hay ajustes para guardar');
      return;
    }

    setLoading(true);
    try {
      await ajustarStockDeposito({
        deposito_id: depositoId,
        items: ajustes.map(a => ({ producto_id: a.producto_id, cantidad: a.nueva_cantidad }))
      });
      toast.success('Ajuste de stock guardado con éxito');
      setAjustes([]);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el ajuste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
              <RefreshCcw className="w-3 h-3" /> 1. Seleccionar Depósito
            </label>
            <select
              value={depositoId}
              onChange={(e) => {
                setDepositoId(e.target.value);
                setAjustes([]); // Limpiar ajustes al cambiar de depósito
              }}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-700 dark:text-white"
            >
              <option value="">Seleccione depósito...</option>
              {depositos.map(d => (
                <option key={d.id} value={d.id}>{d.nombre} ({d.tipo.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 relative">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
              <Search className="w-3 h-3" /> 2. Buscar Productos
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                disabled={!depositoId}
                type="text"
                placeholder={depositoId ? "Nombre o SKU..." : "Selecciona un depósito primero"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium disabled:opacity-50"
              />
            </div>

            {searchTerm.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-white/5 animate-in slide-in-from-top-2">
                {productosFiltrados.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addProductoParaAjuste(p)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-left group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.sku}</div>
                    </div>
                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-purple-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {ajustes.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Productos en Ajuste ({ajustes.length})
            </h4>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-tighter">
              <AlertCircle className="w-4 h-4" /> Valores finales sobrescribirán el stock actual
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                  <th className="px-8 py-4">Producto</th>
                  <th className="px-8 py-4 text-center">Stock Sistema</th>
                  <th className="px-8 py-4 text-center text-purple-600">Stock Físico (Nuevo)</th>
                  <th className="px-8 py-4 text-center">Diferencia</th>
                  <th className="px-8 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {ajustes.map(a => {
                  const p = productos.find(prod => prod.id === a.producto_id);
                  const stockSys = stockActual.find(s => s.producto_id === a.producto_id && s.deposito_id === depositoId)?.cantidad || 0;
                  const diff = a.nueva_cantidad - stockSys;

                  return (
                    <tr key={a.producto_id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800 dark:text-white uppercase text-sm">{p?.name}</div>
                        <div className="text-[10px] text-slate-400 font-black tracking-tighter">{p?.sku}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-black text-slate-400">{stockSys}</span>
                        <span className="text-[8px] ml-1 uppercase font-bold text-slate-300">{p?.base_unit}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <input
                            type="number"
                            value={a.nueva_cantidad}
                            onChange={(e) => updateAjusteCantidad(a.producto_id, parseInt(e.target.value) || 0)}
                            className="w-24 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl px-3 py-2 text-center font-black text-purple-600 dark:text-purple-400 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                          />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className={`text-sm font-black ${diff === 0 ? 'text-slate-300' : diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => removeAjuste(a.producto_id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
            <button
              disabled={loading}
              onClick={handleSave}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
              ) : (
                <><Save className="w-5 h-5" /> Aplicar Ajustes de Stock</>
              )}
            </button>
          </div>
        </div>
      )}

      {ajustes.length === 0 && (
        <div className="p-20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
          <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
            <Package className="w-12 h-12 text-slate-400" />
          </div>
          <div>
            <h4 className="font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-sm">Lista de ajustes vacía</h4>
            <p className="text-xs text-slate-400 mt-2 font-medium">Usa el buscador para agregar productos y corregir su stock manual.</p>
          </div>
        </div>
      )}
    </div>
  );
}
