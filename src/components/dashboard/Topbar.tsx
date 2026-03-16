'use client';

import { UserMenu } from './UserMenu';

export function Topbar({ user, profile }: { user: any; profile: any }) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#020205]/40 backdrop-blur-xl sticky top-0 z-40 px-6 transition-colors">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="lg:hidden flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center transform hover:rotate-12 transition-transform">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-slate-900 dark:text-white font-black text-lg tracking-tight">Weeky</span>
        </div>
        
        {/* Espaciador para empujar el menú de usuario a la derecha en desktop */}
        <div className="hidden lg:block"></div>
        
        <div className="flex items-center gap-4">
          <UserMenu user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}
