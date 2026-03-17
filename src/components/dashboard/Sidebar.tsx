'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3,
  Package, 
  Users,
  UserSquare2,
  Receipt, 
  Warehouse, 
  ChevronRight,
  Factory,
  RefreshCw
} from 'lucide-react';

import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Catálogo', href: '/dashboard/catalog', icon: Package },
  { name: 'Ciclo Semanal', href: '/dashboard/orders', icon: RefreshCw },
  { name: 'Proveedores', href: '/dashboard/proveedores', icon: Factory, roles: ['administrador', 'jefe de deposito'] },
  { name: 'Depósitos', href: '/dashboard/depositos', icon: Warehouse, roles: ['administrador', 'jefe de deposito'] },
  { name: 'Personal Comercial', href: '/dashboard/personal-comercial', icon: Users, roles: ['administrador'] },
  { name: 'Usuarios', href: '/dashboard/users', icon: UserSquare2, adminOnly: true },
];

export function Sidebar({ profilePromise }: { profilePromise?: Promise<any> }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (profilePromise) {
      profilePromise.then(setProfile);
    }
  }, [profilePromise]);

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#0f0f13] border-r border-slate-200 dark:border-white/10 h-screen sticky top-0 transition-colors">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-black text-xl leading-none">W</span>
          </div>
          <div>
            <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight leading-none block">Weeky</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Logística & Stock</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
        {navItems.map((item) => {
          // Si el item es solo admin y el usuario no es admin global, ocultar
          if (item.adminOnly && profile?.user_type !== 'administrador') return null;
          
          // Lógica de Modos/Roles Especiales
          if (item.roles && profile?.user_type !== 'administrador') {
            const activeRoleName = profile?.roles?.find((r: any) => r.role_id === profile?.active_role_id)?.roles?.name?.toLowerCase();
            if (!activeRoleName || !item.roles.includes(activeRoleName)) return null;
          }
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-500 shadow-sm" />}
              {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-slate-50 dark:bg-white/[0.03] rounded-3xl p-5 border border-slate-100 dark:border-white/5">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Versión</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white mt-2">2.4.0 Alpha</p>
          <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-purple-500 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
