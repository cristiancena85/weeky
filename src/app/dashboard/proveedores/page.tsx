import { getProveedores, getDepositos, getRemitosProveedor } from '@/app/actions/deposits';
import { getProducts } from '@/app/actions/products';
import { getOrdenesCompra } from '@/app/actions/purchases';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Users, 
  ClipboardList, 
  ShoppingBag,
  Truck
} from 'lucide-react';
import GestionProveedores from '@/components/depositos/GestionProveedores';
import ListadoRemitos from '@/components/depositos/ListadoRemitos';
import GestionCompras from '@/components/depositos/GestionCompras';

export default async function ProveedoresPage() {
  const supabase = await createClient();
  
  // Obtener todos los datos necesarios en paralelo
  const [proveedores, productos, depositos, ordenes, remitos] = await Promise.all([
    getProveedores(),
    getProducts(),
    getDepositos(),
    getOrdenesCompra(),
    getRemitosProveedor(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Gestión de Proveedores
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Administración de proveedores, órdenes de compra e historial de recepción.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {proveedores.filter(p => p.activo).length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Proveedores Activos</div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {ordenes.length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Órdenes de Compra</div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {remitos.length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Remitos Recibidos</div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-sm">
        <Tabs defaultValue="proveedores" syncWithUrl className="w-full">
          <TabsList className="flex flex-wrap p-1 bg-slate-100/50 dark:bg-black/20 rounded-2xl mb-4 gap-1">
            <TabsTrigger value="proveedores" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Users className="w-4 h-4" /> Mis Proveedores
            </TabsTrigger>
            <TabsTrigger value="compras" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <ShoppingBag className="w-4 h-4" /> Órdenes de Compra
            </TabsTrigger>
            <TabsTrigger value="remitos" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <ClipboardList className="w-4 h-4" /> Historial de Remitos
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="proveedores" className="animate-in fade-in slide-in-from-bottom-2">
              <GestionProveedores proveedores={proveedores} />
            </TabsContent>

            <TabsContent value="compras" className="animate-in fade-in slide-in-from-bottom-2">
              <GestionCompras 
                ordenes={ordenes} 
                proveedores={proveedores} 
                depositos={depositos} 
                productos={productos} 
              />
            </TabsContent>

            <TabsContent value="remitos" className="animate-in fade-in slide-in-from-bottom-2">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Recepción</CardTitle>
                  <CardDescription>Consulta los remitos físicos cargados desde la sección de mercadería.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ListadoRemitos remitos={remitos} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
