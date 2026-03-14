'use client'

import { ArrowRight, AlertTriangle, CheckCircle2, Package } from 'lucide-react'

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
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reporte de Cierre de Semana</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, idx) => (
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
        ))}
      </div>
    </div>
  )
}
