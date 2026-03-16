'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Filter, ArrowRight } from 'lucide-react';

interface Deposito {
  id: string;
  nombre: string;
  tipo: string;
  vendedor?: { full_name: string };
  sucursal?: { name: string };
}

interface StockItem {
  producto_id: string;
  deposito_id: string;
  cantidad: number;
  producto?: { name: string; sku: string | null };
}

export default function TablaStock({ 
  depositos, 
  stockInicial 
}: { 
  depositos: Deposito[], 
  stockInicial: StockItem[] 
}) {
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<string>('todos');

  const filteredStock = stockInicial.filter(item => {
    const matchesSearch = item.producto?.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.producto?.sku?.toLowerCase().includes(search.toLowerCase());
    
    const deposito = depositos.find(d => d.id === item.deposito_id);
    const matchesTipo = filtroTipo === 'todos' || deposito?.tipo === filtroTipo;
    const matchesDeposito = depositoSeleccionado === 'todos' || item.deposito_id === depositoSeleccionado;

    return matchesSearch && matchesTipo && matchesDeposito;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[300px] space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar Producto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="w-48 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo Depósito</label>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setDepositoSeleccionado('todos');
            }}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="todos">Todos</option>
            <option value="central">Centrales</option>
            <option value="vendedor">Vendedores</option>
          </select>
        </div>

        <div className="w-64 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Depósito Específico</label>
          <select
            value={depositoSeleccionado}
            onChange={(e) => setDepositoSeleccionado(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="todos">Todos los depósitos</option>
            {depositos
              .filter(d => filtroTipo === 'todos' || d.tipo === filtroTipo)
              .map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest bg-slate-50 dark:bg-black/10">
              <th className="px-6 py-4 font-bold">Producto</th>
              <th className="px-6 py-4 font-bold">Depósito</th>
              <th className="px-6 py-4 font-bold text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredStock.map((item) => {
              const dep = depositos.find(d => d.id === item.deposito_id);
              return (
                <tr key={`${item.deposito_id}-${item.producto_id}`} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold">{item.producto?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.producto?.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        dep?.tipo === 'central' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {dep?.tipo === 'central' ? 'CENTRAL' : 'VENDEDOR'}
                      </span>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {dep?.nombre}
                      </div>
                    </div>
                    {dep?.vendedor && (
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <ArrowRight className="w-2 h-2" /> {dep.vendedor.full_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-lg font-black ${
                      item.cantidad <= 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.cantidad}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-bold">U.</span>
                  </td>
                </tr>
              );
            })}
            {filteredStock.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">
                  No hay stock registrado para los criterios seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
