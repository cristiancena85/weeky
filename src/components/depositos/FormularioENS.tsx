'use client';

import { useState } from 'react';
import { crearCargaENS } from '@/app/actions/deposits';
import { Plus, Trash2, ArrowRightLeft, Package, UserCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string | null;
}

interface Profile {
  id: string;
  full_name: string;
}

interface Deposito {
  id: string;
  nombre: string;
  tipo: string;
  usuario_id: string | null;
}

export default function FormularioENS({ 
  productos, 
  depositos, 
  vendedores 
}: { 
  productos: Product[], 
  depositos: Deposito[], 
  vendedores: Profile[] 
}) {
  const [loading, setLoading] = useState(false);
  const [vendedorId, setVendedorId] = useState('');
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

    // Buscar depósitos
    const depOrigen = depositos.find(d => d.tipo === 'central'); // Simplificado para este flujo
    const depDestino = depositos.find(d => d.tipo === 'vendedor' && d.usuario_id === vendedorId);

    if (!depOrigen) {
      toast.error('No se encontró depósito central de origen');
      return;
    }
    if (!depDestino) {
      toast.error('El vendedor no tiene un sub-depósito (camioneta) asignado');
      return;
    }

    setLoading(true);
    try {
      await crearCargaENS({
        vendedor_id: vendedorId,
        deposito_origen_id: depOrigen.id,
        deposito_destino_id: depDestino.id,
        items
      });
      toast.success('Carga ENS completada con éxito');
      setVendedorId('');
      setItems([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex items-center gap-3">
        <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          El proceso <strong>ENS</strong> transfiere mercadería del Depósito Central al sub-depósito del vendedor seleccionado.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-purple-500" /> Vendedor / Operador
        </label>
        <select
          required
          value={vendedorId}
          onChange={(e) => setVendedorId(e.target.value)}
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
        >
          <option value="">Seleccionar vendedor...</option>
          {vendedores.map(v => (
            <option key={v.id} value={v.id}>{v.full_name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" /> Detalle de Mercadería
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
            <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
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
        </div>
      </div>

      <div className="pt-4">
        <button
          disabled={loading || items.length === 0}
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando ENS...' : 'Finalizar Carga ENS'}
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
