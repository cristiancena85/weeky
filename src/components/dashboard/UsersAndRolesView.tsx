'use client'

import { useState } from 'react'
import { Users, Shield } from 'lucide-react'
import UsersTable from '@/components/dashboard/UsersTable'
import RolesTable from '@/components/dashboard/RolesTable'
import { UserProfile } from '@/app/actions/users'
import { RoleItem } from '@/app/actions/roles'

type Tab = 'users' | 'roles'

type UsersAndRolesViewProps = {
  initialUsers: UserProfile[]
  initialRoles: RoleItem[]
}

export default function UsersAndRolesView({ initialUsers, initialRoles }: UsersAndRolesViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('users')

  return (
    <div className="space-y-6">
      {/* Tabs Menu */}
      <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1 w-fit max-w-full overflow-x-auto shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Gestión de Usuarios
        </button>
        <button
          onClick={() => setActiveTab('roles')}
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

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'users' ? (
          <UsersTable initialUsers={initialUsers} roles={initialRoles} />
        ) : (
          <RolesTable initialRoles={initialRoles} />
        )}
      </div>
    </div>
  )
}
