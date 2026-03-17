'use client';

import { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  Calendar, 
  User, 
  Building2, 
  FileText,
  Package,
  ExternalLink,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RemitoItem {
  id: string;
  cantidad: number;
  producto: {
    name: string;
    sku: string | null;
  };
}

interface Remito {
  id: string;
  numero_remito: string;
  proveedor: { nombre: string };
  deposito: { nombre: string };
  creador_nombre: string;
  foto_url: string | null;
  created_at: string;
  items: RemitoItem[];
}

export default function ListadoRemitos({ remitos: initialRemitos }: { remitos: any[] }) {
  const [remitos] = useState<Remito[]>(initialRemitos);
  const [search, setSearch] = useState('');
  const [selectedRemito, setSelectedRemito] = useState<Remito | null>(null);

  const filtered = remitos.filter(r => 
    r.numero_remito.toLowerCase().includes(search.toLowerCase()) ||
    r.proveedor?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-black/10 uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Fecha</th>
                <th className="px-6 py-4 font-black">Número / Proveedor</th>
                <th className="px-6 py-4 font-black">Depósito Destino</th>
                <th className="px-6 py-4 font-black">Cargado por</th>
                <th className="px-6 py-4 font-black text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-purple-500/50" />
                      {format(new Date(r.created_at), "dd MMM yyyy", { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        {r.numero_remito}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{r.proveedor?.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {r.deposito?.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <User className="w-4 h-4" />
                      {r.creador_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedRemito(r)}
                      className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all active:scale-95"
                      title="Ver Detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No se encontraron remitos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedRemito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col scale-in-center overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">Remito {selectedRemito.numero_remito}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{selectedRemito.proveedor?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRemito(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tabla de Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Detalle de Mercadería
                  </h3>
                  <div className="bg-slate-50 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-3">Producto</th>
                          <th className="px-4 py-3 text-center">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {selectedRemito.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{item.producto.name}</div>
                              <div className="text-[10px] text-slate-400 font-black uppercase">SKU: {item.producto.sku || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 text-center font-black text-purple-600 dark:text-purple-400 text-lg">
                              {item.cantidad}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Evidencia Fotográfica */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Comprobante Escaneado
                    </h3>
                    {selectedRemito.foto_url && (
                      <a 
                        href={selectedRemito.foto_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Ampliar
                      </a>
                    )}
                  </div>
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-black/40 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center">
                    {selectedRemito.foto_url ? (
                      <img src={selectedRemito.foto_url} alt="Remito" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-8">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 font-medium">No se cargó imagen para este remito</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-end">
              <button
                onClick={() => setSelectedRemito(null)}
                className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
