'use client';

// Vista de movimientos de stock
import { useState } from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import TablaMovimientos from './TablaMovimientos';
import MovimientoDepositoModal from './MovimientoDepositoModal';
import { useRouter } from 'next/navigation';

export default function MovimientosView({ 
  movimientos, 
  productos, 
  depositos 
}: { 
  movimientos: any[], 
  productos: any[], 
  depositos: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-purple-600" /> Historial de Movimientos
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nuevo Movimiento
        </button>
      </div>

      <TablaMovimientos movimientos={movimientos} />

      {isModalOpen && (
        <MovimientoDepositoModal
          productos={productos}
          depositos={depositos}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
