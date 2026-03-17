import { getDepositos, getProveedores } from '@/app/actions/deposits';
import { getMovimientosDeposito } from '@/app/actions/movements';
import { getProducts } from '@/app/actions/products';
import { getUsers } from '@/app/actions/users';
import { getBranches } from '@/app/actions/branches';
import { getCustomers } from '@/app/actions/customers';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Truck, 
  Warehouse, 
  Users, 
  ClipboardList, 
  ArrowRightLeft, 
  UserCircle, 
  Settings2,
  ShoppingBag, 
  LogIn, 
  MapPin,
  Building2
} from 'lucide-react';
import TablaStock from '@/components/depositos/TablaStock';
import GestionDepositos from '@/components/depositos/GestionDepositos';
import IngresoMercaderia from '@/components/depositos/IngresoMercaderia';
import MovimientosView from '../../../components/depositos/MovimientosView';
import AjusteStock from '@/components/depositos/AjusteStock';
import BranchesTable from '@/components/dashboard/BranchesTable';

export default async function DepositosPage() {
  const [
    depositos, 
    productos, 
    usuarios, 
    branches, 
    customers, 
    proveedores,
    movimientos,
    { data: stockRaw }
  ] = await Promise.all([
    getDepositos(),
    getProducts(),
    getUsers(),
    getBranches(),
    getCustomers(),
    getProveedores(),
    getMovimientosDeposito(),
    (async () => {
      const supabase = await createClient();
      return supabase.from('stock_actual').select('*');
    })()
  ]);



  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Módulo de Depósitos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Control de inventario centralizado y logística ENS para vendedores.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {depositos.filter(d => d.tipo === 'central').length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Depósitos Centrales</div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Truck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {customers.filter(c => c.type === 'vendedor').length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sub-depósitos (Camiones)</div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {stockRaw?.length || 0}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Registros de Stock</div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-sm">
        <Tabs defaultValue="stock" syncWithUrl className="w-full">
          <TabsList className="flex flex-wrap p-1 bg-slate-100/50 dark:bg-black/20 rounded-2xl mb-4 gap-1">
            <TabsTrigger value="stock" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Package className="w-4 h-4" /> Stock Actual
            </TabsTrigger>
            <TabsTrigger value="ingreso" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <LogIn className="w-4 h-4" /> Ingreso Mercadería
            </TabsTrigger>

            <TabsTrigger value="movimientos" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <ArrowRightLeft className="w-4 h-4" /> Movimientos
            </TabsTrigger>

            <TabsTrigger value="config" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Warehouse className="w-4 h-4" /> Depósitos
            </TabsTrigger>

            <TabsTrigger value="ajuste" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Settings2 className="w-4 h-4" /> Ajuste Stock
            </TabsTrigger>

            <TabsTrigger value="sucursales" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Building2 className="w-4 h-4" /> Sucursales
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="stock" className="animate-in fade-in slide-in-from-bottom-2">
              <TablaStock 
                depositos={depositos} 
                stockInicial={stockRaw as any || []} 
              />
            </TabsContent>

            <TabsContent value="ingreso" className="animate-in fade-in slide-in-from-bottom-2">
              <IngresoMercaderia 
                productos={productos} 
                depositos={depositos} 
                proveedores={proveedores as any || []} 
              />
            </TabsContent>

            <TabsContent value="movimientos" className="animate-in fade-in slide-in-from-bottom-2">
              <MovimientosView 
                movimientos={movimientos} 
                productos={productos} 
                depositos={depositos} 
              />
            </TabsContent>



            <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-2">
              <GestionDepositos 
                depositos={depositos} 
                branches={branches} 
                users={usuarios as any} 
              />
            </TabsContent>
            

            <TabsContent value="ajuste" className="animate-in fade-in slide-in-from-bottom-2">
              <AjusteStock 
                productos={productos} 
                depositos={depositos} 
                stockActual={stockRaw as any || []} 
              />
            </TabsContent>

            <TabsContent value="sucursales" className="animate-in fade-in slide-in-from-bottom-2">
              <BranchesTable initialBranches={branches} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
