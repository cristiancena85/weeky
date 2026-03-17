'use client'

import { useState, useEffect } from 'react'
import { Users, Shield } from 'lucide-react'
import UsersTable from '@/components/dashboard/UsersTable'
import RolesTable from '@/components/dashboard/RolesTable'
import { UserProfile } from '@/app/actions/users'
import { RoleItem } from '@/app/actions/roles'

type Tab = 'management' | 'roles'

type UsersAndRolesViewProps = {
  initialUsers: UserProfile[]
  initialRoles: RoleItem[]
  initialTab?: string
}

export default function UsersAndRolesView({ initialUsers, initialRoles, initialTab }: UsersAndRolesViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'management')

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    window.history.pushState(null, '', `/dashboard/users/${tab}`)
  }

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path.includes('/roles')) setActiveTab('roles')
      else setActiveTab('management')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1 w-fit max-w-full overflow-x-auto shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <button
          onClick={() => handleTabChange('management')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'management'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Gestión de Usuarios
        </button>
        <button
          onClick={() => handleTabChange('roles')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'roles'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Shield className="w-5 h-5" />
          Puestos Operacionales
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'management' ? (
          <UsersTable initialUsers={initialUsers} roles={initialRoles} />
        ) : (
          <RolesTable initialRoles={initialRoles} />
        )}
      </div>
    </div>
  )
}
