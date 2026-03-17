'use client';

import { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Loader2,
  Trash2,
  PackagePlus,
  FileText,
  Building2
} from 'lucide-react';
import { PurchaseOrder, createOrdenCompra, recibirOrdenCompra, cancelarOrdenCompra } from '@/app/actions/purchases';
import { toast } from 'sonner';

type GestionComprasProps = {
  ordenes: PurchaseOrder[];
  proveedores: any[];
  depositos: any[];
  productos: any[];
};

export default function GestionCompras({ ordenes: initialOrdenes, proveedores, depositos, productos }: GestionComprasProps) {
  const [ordenes, setOrdenes] = useState(initialOrdenes);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Estados para nueva OC
  const [formData, setFormData] = useState({
    proveedor_id: '',
    deposito_id: depositos[0]?.id || '',
    notas: '',
    items: [] as { producto_id: string; cantidad: number }[]
  });

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { producto_id: productos[0]?.id || '', cantidad: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Agregá al menos un producto');
      return;
    }
    setLoading(true);
    try {
      await createOrdenCompra(formData);
      toast.success('Orden de Compra creada correctamente');
      setIsAdding(false);
      window.location.reload(); // Recarga simple para esta demo
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecibir = async (id: string) => {
    const numRemito = prompt('Ingrese el número de remito del proveedor:');
    if (!numRemito) return;

    setLoading(true);
    try {
      await recibirOrdenCompra(id, numRemito);
      toast.success('Mercadería recibida y stock actualizado');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ordenes.filter(o => 
    o.proveedor?.nombre.toLowerCase().includes(search.toLowerCase()) ||
    o.id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar órdenes por proveedor..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-5 h-5" />
            Nueva Orden de Compra
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-purple-600" />
              Solicitud de Reposición
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Proveedor</label>
                <select
                  required
                  value={formData.proveedor_id}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                >
                  <option value="">Seleccionar Proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Destino (Depósito Central)</label>
                <select
                  required
                  value={formData.deposito_id}
                  onChange={(e) => setFormData({ ...formData, deposito_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                >
                  {depositos.filter(d => d.tipo === 'central').map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Items de la Orden</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-purple-600 hover:text-purple-500 underline"
                >
                  + Agregar Producto
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 animate-in fade-in slide-in-from-right-2">
                  <select
                    required
                    value={item.producto_id}
                    onChange={(e) => updateItem(index, 'producto_id', e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
                  >
                    {productos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Cant."
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value))}
                    className="w-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Orden'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 border-dashed rounded-3xl text-slate-400">
              <ShoppingBag className="w-8 h-8 mb-2 opacity-50" />
              <p className="font-medium">No hay órdenes de compra registradas</p>
            </div>
          ) : (
            filtered.map((oc) => (
              <div 
                key={oc.id}
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      oc.estado === 'pendiente' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' :
                      oc.estado === 'recibida' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                      'bg-red-100 dark:bg-red-500/20 text-red-600'
                    }`}>
                      {oc.estado === 'pendiente' ? <Clock className="w-6 h-6" /> :
                       oc.estado === 'recibida' ? <CheckCircle2 className="w-6 h-6" /> :
                       <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">#{oc.id.slice(0, 8)}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          oc.estado === 'pendiente' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                          oc.estado === 'recibida' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                          'bg-red-50 dark:bg-red-500/10 text-red-600'
                        }`}>
                          {oc.estado}
                        </span>
                      </div>
                      <div className="text-lg font-bold mt-1">{oc.proveedor?.nombre}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3" /> {oc.deposito?.nombre}</span>
                        <span className="flex items-center gap-1.5"><FileText className="w-3" /> {oc.items?.length} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-6 shrink-0">
                    {oc.estado === 'pendiente' && (
                      <button
                        onClick={() => handleRecibir(oc.id)}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Recibir Mercadería
                      </button>
                    )}
                    <button className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 rounded-xl transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/[0.02] flex flex-wrap gap-2 text-[10px]">
                  {oc.items?.slice(0, 3).map((item, i) => (
                    <span key={i} className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg font-bold text-slate-500">
                      {item.cantidad}x {item.producto?.name}
                    </span>
                  ))}
                  {oc.items && oc.items.length > 3 && (
                    <span className="text-slate-400 font-bold px-2 py-1">+{oc.items.length - 3} más</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
