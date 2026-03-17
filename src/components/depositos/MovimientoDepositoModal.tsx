'use client';

import { useState } from 'react';
import { crearMovimientoDeposito } from '@/app/actions/movements';
import { 
  Plus, 
  Minus, 
  ArrowRightLeft, 
  Package, 
  Search, 
  Loader2,
  Trash2,
  Warehouse
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  base_unit: string | null;
}

interface Deposito {
  id: string;
  nombre: string;
}

export default function MovimientoDepositoModal({ 
  productos, 
  depositos,
  onClose,
  onSuccess
}: { 
  productos: Product[], 
  depositos: Deposito[],
  onClose: () => void,
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false);
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<{ producto_id: string; cantidad: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const productosFiltrados = productos.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (producto: Product) => {
    if (items.some(i => i.producto_id === producto.id)) {
      toast.error('Este producto ya fue agregado');
      return;
    }
    setItems([...items, { producto_id: producto.id, cantidad: 1 }]);
    setSearchTerm('');
  };

  const updateItemQuantity = (productoId: string, cantidad: number) => {
    setItems(items.map(i => 
      i.producto_id === productoId ? { ...i, cantidad: Math.max(1, cantidad) } : i
    ));
  };

  const removeItem = (productoId: string) => {
    setItems(items.filter(i => i.producto_id !== productoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origenId || !destinoId) {
      toast.error('Debes seleccionar depósitos de origen y destino');
      return;
    }
    if (origenId === destinoId) {
      toast.error('El depósito de origen y destino no pueden ser el mismo');
      return;
    }
    if (items.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    setLoading(true);
    try {
      await crearMovimientoDeposito({
        deposito_origen_id: origenId,
        deposito_destino_id: destinoId,
        observaciones,
        items
      });

      toast.success('Movimiento registrado con éxito');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f0f13] w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-purple-600" /> Nuevo Movimiento de Stock
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
              Transfiera mercadería entre depósitos de forma segura.
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 scrollbar-hide">
          {/* Configuración */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Depósito Origen</label>
                <select
                  required
                  value={origenId}
                  onChange={(e) => setOrigenId(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                >
                  <option value="">Seleccione origen...</option>
                  {depositos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-3">
                <div className="p-2 bg-purple-600 rounded-full text-white shadow-lg ring-4 ring-white dark:ring-[#0f0f13] z-10">
                  <ArrowRightLeft className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Depósito Destino</label>
                <select
                  required
                  value={destinoId}
                  onChange={(e) => setDestinoId(e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                >
                  <option value="">Seleccione destino...</option>
                  {depositos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones (Opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Chofer Juan Perez..."
                  rows={3}
                  className="w-full bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium resize-none"
                />
              </div>
            </div>

            {/* Selector de Productos */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buscador de Productos</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                />
                
                {searchTerm.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-white/5 animate-in slide-in-from-top-2">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addItem(p)}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-left group"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.sku} | {p.base_unit}</div>
                          </div>
                          <Plus className="w-5 h-5 text-slate-300 group-hover:text-purple-600" />
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm italic font-medium">No se encontraron productos</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Items */}
          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/20">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Package className="w-4 h-4" /> Detalle del Movimiento ({items.length})
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                  <Package className="w-20 h-20 text-slate-400" />
                  <p className="font-bold text-slate-600 uppercase tracking-widest text-xs mt-4">Lista vacía</p>
                </div>
              ) : (
                items.map(item => {
                  const p = productos.find(prod => prod.id === item.producto_id);
                  return (
                    <div key={item.producto_id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between animate-in slide-in-from-right-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-bold text-slate-800 dark:text-white truncate text-sm">{p?.name}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">{p?.sku}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 p-1">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.producto_id, item.cantidad - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/10 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => updateItemQuantity(item.producto_id, parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent text-center font-bold text-sm outline-none text-purple-600 dark:text-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.producto_id, item.cantidad + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/10 text-slate-500 hover:text-green-500 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.producto_id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-white/10 space-y-4">
              <button
                onClick={handleSubmit}
                disabled={loading || items.length === 0 || !origenId || !destinoId}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                ) : (
                  <><ArrowRightLeft className="w-5 h-5" /> Registrar Movimiento</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
