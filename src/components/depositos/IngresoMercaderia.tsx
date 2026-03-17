'use client';

import { useState, useRef, useEffect } from 'react';
import { cargarRemitoProveedor } from '@/app/actions/deposits';
import { Plus as LucidePlus, Minus as LucideMinus, ClipboardList as LucideClipboard, Package as LucidePackage, Camera as LucideCamera, ImageIcon as LucideImage, X as LucideX, Loader2 as LucideLoader, Search as LucideSearch } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  proveedor_id: string | null;
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

export default function IngresoMercaderia({ 
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
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrar productos por proveedor seleccionado
  const productosFiltrados = productos.filter(p => p.proveedor_id === proveedorId && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [productId]: newValue };
    });
  };

  const handleManualQuantity = (productId: string, value: string) => {
    const num = parseInt(value) || 0;
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, num) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `remitos/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('remitos').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('remitos').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemsParaCargar = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ producto_id: id, cantidad: qty }));

    if (itemsParaCargar.length === 0) {
      toast.error('Debes cargar al menos un producto con cantidad mayor a cero');
      return;
    }
    if (!imageFile) {
      toast.error('La foto del remito es obligatoria');
      return;
    }

    setLoading(true);
    try {
      const foto_url = await uploadImage(imageFile);
      await cargarRemitoProveedor({
        proveedor_id: proveedorId,
        numero_remito: numeroRemito,
        deposito_id: depositoId,
        items: itemsParaCargar,
        foto_url
      });

      toast.success('Ingreso de mercadería registrado con éxito');
      setProveedorId('');
      setNumeroRemito('');
      setQuantities({});
      removeImage();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const depCentrales = depositos.filter(d => d.tipo === 'central');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} id="ingreso-form" className="space-y-6">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
              <LucideClipboard className="w-5 h-5 text-purple-500" /> Datos del Remito
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Proveedor</label>
                <select
                  required
                  value={proveedorId}
                  onChange={(e) => {
                    setProveedorId(e.target.value);
                    setQuantities({});
                  }}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all font-bold"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Número de Remito</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 0001-00001234"
                  value={numeroRemito}
                  onChange={(e) => setNumeroRemito(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Depósito de Recepción</label>
                <select
                  required
                  value={depositoId}
                  onChange={(e) => setDepositoId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all font-bold"
                >
                  <option value="">Seleccionar depósito central...</option>
                  {depCentrales.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-800 dark:text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <LucidePackage className="w-5 h-5 text-purple-500" /> Catálogo del Proveedor
              </h3>
              {proveedorId && (
                <div className="relative w-full md:w-64">
                  <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {!proveedorId ? (
                <div className="py-20 text-center text-slate-400">
                  <LucidePackage className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold">Seleccioná un proveedor para ver su catálogo</p>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="py-20 text-center text-slate-400 px-6">
                  <p className="font-bold">No hay productos vinculados a este proveedor</p>
                  <p className="text-xs uppercase mt-2 italic">Vinculalos desde la sección de Catálogo</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {productosFiltrados.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">SKU: {p.sku || 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-100 dark:bg-black/40 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, -1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-all shadow-sm active:scale-90"
                        >
                          <LucideMinus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={quantities[p.id] || 0}
                          onChange={(e) => handleManualQuantity(p.id, e.target.value)}
                          className="w-16 bg-transparent text-center font-black text-lg text-purple-600 dark:text-purple-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-500/20 dark:hover:text-green-400 transition-all shadow-sm active:scale-90"
                        >
                          <LucidePlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm sticky top-24">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <LucideCamera className="w-5 h-5 text-purple-500" /> Evidencia: Foto Remito
          </h3>
          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
            >
              <div className="p-5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform ring-8 ring-purple-50 dark:ring-purple-900/10">
                <LucideCamera className="w-8 h-8" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-slate-700 dark:text-slate-200">Tomar foto o subir</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-black">Obligatorio</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl group">
              <img src={imagePreview} alt="Vista previa remito" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/20"><LucideImage className="w-6 h-6" /></button>
                <button onClick={removeImage} className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all border border-red-400/20"><LucideX className="w-6 h-6" /></button>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <div className="mt-8 space-y-4">
            <button
              form="ingreso-form"
              disabled={loading || !proveedorId || !imageFile}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${loading || !proveedorId || !imageFile 
                  ? 'bg-slate-300 dark:bg-white/10 cursor-not-allowed text-slate-500' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95 shadow-purple-500/20'}`}
            >
              {loading ? (
                <><LucideLoader className="w-5 h-5 animate-spin" /><span>Procesando...</span></>
              ) : (
                <><LucidePackage className="w-5 h-5 group-hover:rotate-12 transition-transform" /><span>REGISTRAR INGRESO</span></>
              )}
            </button>
            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4 italic">
              Se guardarán solo los productos con cantidad mayor a cero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
