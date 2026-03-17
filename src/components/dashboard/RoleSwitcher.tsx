'use client';

import { use, useState, useTransition } from 'react';
import { ChevronDown, Check, Loader2, Sparkles, UserCircle } from 'lucide-react';
import { switchActiveRole } from '@/app/actions/users';
import { toast } from 'sonner';

export function RoleSwitcher({ profilePromise }: { profilePromise: Promise<any> }) {
  const profile = use(profilePromise);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  if (!profile || !profile.roles || profile.roles.length <= 1) return null;

  const currentRole = profile.roles.find((r: any) => r.role_id === profile.active_role_id) || profile.roles[0];
  const currentRoleName = currentRole.roles.name;

  const handleSwitch = (roleId: string) => {
    startTransition(async () => {
      try {
        await switchActiveRole(roleId);
        toast.success(`Modo cambiado a: ${currentRoleName}`);
        setIsOpen(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Modo: {currentRoleName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cambiar Función Especial</span>
            </div>
            <div className="p-2 space-y-1">
              {profile.roles.map((r: any) => (
                <button
                  key={r.role_id}
                  onClick={() => handleSwitch(r.role_id)}
                  disabled={isPending}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    r.role_id === profile.active_role_id
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${r.role_id === profile.active_role_id ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-slate-100 dark:bg-white/5'}`}>
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm capitalize">{r.roles.name}</span>
                  </div>
                  {r.role_id === profile.active_role_id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            {isPending && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
