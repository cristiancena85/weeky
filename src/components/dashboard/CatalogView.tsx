'use client'

import { useState, useEffect } from 'react'
import { Package, Layers } from 'lucide-react'
import { Product, UnitTemplate } from '@/app/actions/products'
import ProductsTable from './ProductsTable'
import TemplatesTable from './TemplatesTable'

type Tab = 'products' | 'templates'

type CatalogViewProps = {
  initialProducts: Product[]
  initialTemplates: UnitTemplate[]
  initialTab?: string
}

export default function CatalogView({ 
  initialProducts, 
  initialTemplates,
  initialTab
}: CatalogViewProps) {
  // Determinamos el tab inicial basado en la URL (segmento)
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'products')

  // Manejar navegación instantánea + Actualización de URL (Friendly URL)
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    const newUrl = `/dashboard/catalog/${tab === 'products' ? '' : tab}`.replace(/\/$/, '')
    window.history.pushState(null, '', newUrl || '/dashboard/catalog/products')
  }

  // Sincronizar si el usuario navega con atrás/adelante en el navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path.includes('/templates')) setActiveTab('templates')
      else setActiveTab('products')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1 w-fit max-w-full overflow-x-auto shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <button
          onClick={() => handleTabChange('products')}
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
          onClick={() => handleTabChange('templates')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'templates'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-5 h-5" />
          Unidades comerciales
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'products' ? (
          <ProductsTable initialProducts={initialProducts} initialTemplates={initialTemplates} />
        ) : (
          <TemplatesTable initialTemplates={initialTemplates} />
        )}
      </div>
    </div>
  )
}
