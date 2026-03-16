'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Building2, 
  Menu
} from 'lucide-react';

const mobileItems = [
  { name: 'Inicio', href: '/dashboard', icon: BarChart3 },
  { name: 'Catálogo', href: '/dashboard/catalog', icon: Package },
  { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Depósitos', href: '/dashboard/depositos', icon: Building2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 h-24 pointer-events-none">
      <nav className="max-w-md mx-auto h-full flex items-center justify-around bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl pointer-events-auto px-6 overflow-hidden">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 relative py-2 transition-all ${
                isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-purple-600 dark:bg-purple-500 rounded-full animate-in fade-in slide-in-from-top-1" />
              )}
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? 'scale-110' : 'hover:scale-105'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
