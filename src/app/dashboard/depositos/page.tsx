import { getDepositos, getProveedores } from '@/app/actions/deposits';
import { getProducts } from '@/app/actions/products';
import { getUsers } from '@/app/actions/users';
import { getBranches } from '@/app/actions/branches';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Package, Truck, Building2, Users, ClipboardList, History, ArrowRightLeft, UserCircle, Settings2 } from 'lucide-react';
import GestionProveedores from '@/components/depositos/GestionProveedores';
import FormularioRemito from '@/components/depositos/FormularioRemito';
import FormularioENS from '@/components/depositos/FormularioENS';
import TablaStock from '@/components/depositos/TablaStock';
import GestionDepositos from '@/components/depositos/GestionDepositos';

export default async function DepositosPage() {
  const supabase = await createClient();
  
  // Obtener todos los datos necesarios en paralelo
  const [depositos, proveedores, productos, usuarios, branches, { data: stockRaw }] = await Promise.all([
    getDepositos(),
    getProveedores(),
    getProducts(),
    getUsers(),
    getBranches(),
    supabase.from('stock_deposito').select(`
      *,
      producto:products(name, sku)
    `)
  ]);

  const vendedores = usuarios.filter(u => u.user_type === 'usuario' || u.role === 'vendedor');

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
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            {depositos.filter(d => d.tipo === 'vendedor').length}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sub-depósitos (Camiones)</div>
        </div>

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
              <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {stockRaw?.length || 0}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Registros de Stock</div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-sm">
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="flex flex-wrap p-1 bg-slate-100/50 dark:bg-black/20 rounded-2xl mb-4 gap-1">
            <TabsTrigger value="stock" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Package className="w-4 h-4" /> Stock Actual
            </TabsTrigger>
            <TabsTrigger value="remitos" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <ClipboardList className="w-4 h-4" /> Remitos Proveedor
            </TabsTrigger>
            <TabsTrigger value="ens" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <ArrowRightLeft className="w-4 h-4" /> Cargas ENS
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <Settings2 className="w-4 h-4" /> Depósitos
            </TabsTrigger>
            <TabsTrigger value="proveedores" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <UserCircle className="w-4 h-4" /> Proveedores
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all text-xs font-black uppercase">
              <History className="w-4 h-4" /> Historial
            </TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="stock" className="animate-in fade-in slide-in-from-bottom-2">
              <TablaStock 
                depositos={depositos} 
                stockInicial={stockRaw as any || []} 
              />
            </TabsContent>

            <TabsContent value="remitos" className="animate-in fade-in slide-in-from-bottom-2">
              <Card>
                <CardHeader>
                  <CardTitle>Entrada de Mercadería</CardTitle>
                  <CardDescription>Cargar remito físico del proveedor al depósito central.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormularioRemito 
                    productos={productos} 
                    depositos={depositos.filter(d => d.activo && d.tipo === 'central')} 
                    proveedores={proveedores.filter(p => p.activo)} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ens" className="animate-in fade-in slide-in-from-bottom-2">
              <Card>
                <CardHeader>
                  <CardTitle>Logística ENS</CardTitle>
                  <CardDescription>Asignar mercadería del depósito central a la unidad del vendedor.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormularioENS 
                    productos={productos} 
                    depositos={depositos.filter(d => d.activo)} 
                    vendedores={vendedores as any} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-2">
              <GestionDepositos 
                depositos={depositos} 
                branches={branches} 
                users={usuarios as any} 
              />
            </TabsContent>

            <TabsContent value="proveedores" className="animate-in fade-in slide-in-from-bottom-2">
              <GestionProveedores proveedores={proveedores} />
            </TabsContent>
            
            <TabsContent value="historial" className="animate-in fade-in slide-in-from-bottom-2">
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 font-medium">
                Registro histórico de movimientos (Próximamente)...
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
