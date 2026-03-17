'use client'

import { ArrowRight, AlertTriangle, CheckCircle2, Package, Receipt } from 'lucide-react'

type ReportEntry = {
  product: string
  base_unit: string
  initial: number
  sold: number
  expected: number
  final: number
  diff: number
}

export default function StockReport({ data }: { data: ReportEntry[] }) {
  const totalVendidos = data.reduce((acc, curr) => acc + curr.sold, 0);
  const totalDiferencias = data.reduce((acc, curr) => acc + Math.abs(curr.diff), 0);
  const tieneAlertas = data.some(d => d.diff !== 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Receipt className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black italic tracking-tight">Reporte de Finalización</h2>
            <p className="text-purple-100 font-medium opacity-80 mt-1">Resumen del ciclo de preventa finalizado.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">Total Vendidos</p>
              <p className="text-2xl font-black">{totalVendidos}</p>
            </div>
            <div className={`backdrop-blur-md px-6 py-4 rounded-2xl border ${tieneAlertas ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Ajustes de Stock</p>
              <p className="text-2xl font-black">{totalDiferencias}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-[3rem] flex flex-col items-center justify-center">
            <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 italic">Sin registros de stock</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center font-medium">No se detectaron movimientos o diferencias significativas de stock en este período.</p>
          </div>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${item.diff === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                {item.product}
                {item.diff === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                )}
              </h3>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Stock Inicial</p>
                  <p className="text-slate-900 dark:text-white font-black">{item.initial} {item.base_unit}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Ventas (Entregado)</p>
                  <p className="text-purple-600 dark:text-purple-400 font-black">-{item.sold} {item.base_unit}</p>
                </div>
                <div className="col-span-2 h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Stock Esperado</p>
                  <p className="text-slate-900 dark:text-white font-black">{item.expected} {item.base_unit}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Stock Físico Final</p>
                  <p className="text-slate-900 dark:text-white font-black">{item.final} {item.base_unit}</p>
                </div>
              </div>

              <div className={`mt-6 p-3 rounded-2xl flex items-center justify-between font-black ${item.diff === 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                <span className="text-xs uppercase">Diferencia:</span>
                <span className="text-lg">
                  {item.diff > 0 ? `+${item.diff}` : item.diff} {item.base_unit}
                </span>
              </div>
              
              {item.diff !== 0 && (
                <p className="mt-2 text-[10px] text-center text-red-400 font-bold uppercase tracking-tighter">
                  ¡Atención! Diferencia detectada en stock físico.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
