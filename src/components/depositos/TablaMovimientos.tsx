'use client';

import { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Package,
  Search,
  MessageSquare
} from 'lucide-react';

interface Movimiento {
  id: string;
  deposito_origen_id: string;
  deposito_destino_id: string;
  fecha: string;
  observaciones: string | null;
  creado_por: string | null;
  estado: string;
  created_at: string;
  origen: { nombre: string };
  destino: { nombre: string };
  creador_nombre: string;
  items: {
    id: string;
    cantidad: number;
    producto: {
      name: string;
      sku: string | null;
      base_unit: string | null;
    }
  }[];
}

export default function TablaMovimientos({ movimientos }: { movimientos: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = movimientos.filter(m => 
    m.origen?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.destino?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar movimientos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
        />
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4 text-center">Transferencia</th>
                <th className="px-6 py-4">Destino</th>
                <th className="px-6 py-4">Responsable</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                    No se encontraron movimientos registrados
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <>
                    <tr 
                      key={m.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group cursor-pointer ${expandedId === m.id ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
                      onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{m.origen?.nombre}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 transition-transform ${expandedId === m.id ? 'rotate-90' : ''}`}>
                          <ArrowRightLeft className="w-5 h-5" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{m.destino?.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-300">{m.creador_nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <div className="text-xs font-black text-purple-600 uppercase tracking-tighter">{m.items?.length || 0} ITEMS</div>
                          {expandedId === m.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Section */}
                    {expandedId === m.id && (
                      <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Package className="w-4 h-4" /> Mercadería Transportada
                              </h5>
                              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                                {m.items?.map((item: any) => (
                                  <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.producto?.name}</span>
                                      <span className="text-[10px] text-slate-400 font-black uppercase">{item.producto?.sku}</span>
                                    </div>
                                    <div className="font-black text-purple-600 dark:text-purple-400">
                                      x{item.cantidad} {item.producto?.base_unit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Observaciones del Movimiento
                              </h5>
                              <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm italic text-slate-500 dark:text-slate-400 h-full">
                                {m.observaciones || 'Sin observaciones adicionales registradas.'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
