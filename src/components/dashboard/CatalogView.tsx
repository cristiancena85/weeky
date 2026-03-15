'use client'

import { useState } from 'react'
import { Package, Users, Tag, MapPin, Layers } from 'lucide-react'
import { Product, UnitTemplate } from '@/app/actions/products'
import { Customer } from '@/app/actions/customers'
import ProductsTable from './ProductsTable'
import CustomersTable from './CustomersTable'
import TemplatesTable from './TemplatesTable'

type Tab = 'products' | 'customers' | 'templates'

type CatalogViewProps = {
  initialProducts: Product[]
  initialCustomers: Customer[]
  initialTemplates: UnitTemplate[]
}

export default function CatalogView({ initialProducts, initialCustomers, initialTemplates }: CatalogViewProps) {
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
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'customers'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Clientes
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
          Plantillas
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'products' ? (
          <ProductsTable initialProducts={initialProducts} initialTemplates={initialTemplates} />
        ) : activeTab === 'templates' ? (
          <TemplatesTable initialTemplates={initialTemplates} />
        ) : (
          <CustomersTable initialCustomers={initialCustomers} />
        )}
      </div>
    </div>
  )
}
