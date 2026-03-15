'use client'

import { useState } from 'react'
import { Package, Users, Tag, MapPin, Layers } from 'lucide-react'
import { Product, UnitTemplate } from '@/app/actions/products'
import { Customer } from '@/app/actions/customers'
import { Branch } from '@/app/actions/branches'
import ProductsTable from './ProductsTable'
import CustomersTable from './CustomersTable'
import TemplatesTable from './TemplatesTable'
import BranchesTable from './BranchesTable'

type Tab = 'products' | 'templates' | 'customers' | 'branches'

type CatalogViewProps = {
  initialProducts: Product[]
  initialCustomers: Customer[]
  initialTemplates: UnitTemplate[]
  initialBranches: Branch[]
}

export default function CatalogView({ 
  initialProducts, 
  initialCustomers, 
  initialTemplates,
  initialBranches 
}: CatalogViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <div className="space-y-6">
      <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1 w-fit max-w-full overflow-x-auto shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Package className="w-5 h-5" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'templates'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-5 h-5" />
          Unidades comerciales
        </button>

        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2 self-center" />

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'customers'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          <div className="flex flex-col items-start leading-tight">
            <span>Cuentas</span>
            <span className="text-[10px] opacity-70 font-normal">operadores</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'branches'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <MapPin className="w-5 h-5" />
          Sucursales
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'products' ? (
          <ProductsTable initialProducts={initialProducts} initialTemplates={initialTemplates} />
        ) : activeTab === 'templates' ? (
          <TemplatesTable initialTemplates={initialTemplates} />
        ) : activeTab === 'branches' ? (
          <BranchesTable initialBranches={initialBranches} />
        ) : (
          <CustomersTable initialCustomers={initialCustomers} initialBranches={initialBranches} />
        )}
      </div>
    </div>
  )
}
