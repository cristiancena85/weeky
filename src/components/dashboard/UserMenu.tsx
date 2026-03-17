'use client'

import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, BadgeCheck, ChevronDown, Moon } from 'lucide-react'
import { LogoutButton } from './LogoutButton'
import { ThemeToggle } from '../ThemeToggle'

interface UserMenuProps {
  user: {
    email?: string
  }
  profilePromise?: Promise<{
    alias?: string
    user_type?: string
    role?: string
  } | null>
}

export function UserMenu({ user, profilePromise }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profilePromise) {
      profilePromise.then(setProfile)
    }
  }, [profilePromise])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alias = profile?.alias || user.email?.split('@')[0] || 'Usuario'
  const initial = alias.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
      >
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-white/10 shadow-sm">
            {initial}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#020205] shadow-sm"></div>
        </div>
        <div className="hidden md:flex flex-col items-start text-left mr-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{alias}</span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">Mi Cuenta</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{alias}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">{user.email}</p>
          </div>

          <div className="p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Puesto</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{profile?.role || profile?.user_type || 'Estándar'}</span>
              </div>
            </div>
          </div>

          <div className="px-3 py-4 border-t border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-xl">
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Modo Oscuro</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="p-3">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}

