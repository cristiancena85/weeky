'use client';

import { useState } from 'react';
import { cargarRemitoProveedor } from '@/app/actions/deposits';
import { Plus, Trash2, ClipboardList, Package, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string | null;
}

interface Deposito {
  id: string;
  nombre: string;
  tipo: string;
}

interface Proveedor {
  id: string;
  nombre: string;
}

export default function FormularioRemito({ 
  productos, 
  depositos, 
  proveedores 
}: { 
  productos: Product[], 
  depositos: Deposito[], 
  proveedores: Proveedor[] 
}) {
  const [loading, setLoading] = useState(false);
  const [depositoId, setDepositoId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [numeroRemito, setNumeroRemito] = useState('');
  const [items, setItems] = useState<{ producto_id: string; cantidad: number }[]>([]);

  const agregarItem = () => {
    setItems([...items, { producto_id: '', cantidad: 1 }]);
  };

  const quitarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Registra al menos un producto');
      return;
    }
    setLoading(true);
    try {
      await cargarRemitoProveedor({
        proveedor_id: proveedorId,
        numero_remito: numeroRemito,
        deposito_id: depositoId,
        items
      });
      toast.success('Remito cargado y stock actualizado');
      setProveedorId('');
      setNumeroRemito('');
      setItems([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const depCentrales = depositos.filter(d => d.tipo === 'central');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" /> Proveedor
          </label>
          <select
            required
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-purple-500" /> Número de Remito
          </label>
          <input
            required
            type="text"
            placeholder="Ej: 0001-00001234"
            value={numeroRemito}
            onChange={(e) => setNumeroRemito(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" /> Depósito de Destino
          </label>
          <select
            required
            value={depositoId}
            onChange={(e) => setDepositoId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
          >
            <option value="">Seleccionar depósito...</option>
            {depCentrales.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" /> Productos en Remito
          </h3>
          <button
            type="button"
            onClick={agregarItem}
            className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 font-medium"
          >
            <Plus className="w-4 h-4" /> Agregar Producto
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex-1">
                <select
                  required
                  value={item.producto_id}
                  onChange={(e) => actualizarItem(index, 'producto_id', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Cant."
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => quitarItem(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 text-sm">
              No has agregado productos al remito todavía.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          disabled={loading || items.length === 0}
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando...' : 'Confirmar y Cargar Remito'}
        </button>
      </div>
    </form>
  );
}
