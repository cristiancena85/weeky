'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ProductCategory = {
  id: string
  name: string
}

export type ProductUnit = {
  id?: string
  product_id?: string
  unit_name: string
  conversion_factor: number
  is_base_unit: boolean
  hierarchy_level: number
}

export type Product = {
  id: string
  name: string
  sku: string | null
  base_unit: string
  category_id: string | null
  brand: string | null
  variant: string | null
  shield: string | null
  type: string | null
  created_at: string
  category?: ProductCategory
  units?: ProductUnit[]
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'administrador') {
    throw new Error('Permisos insuficientes.')
  }
}

export async function getCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      units:product_units(*)
    `)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  
  // Ordenar unidades por jerarquía
  return (data || []).map(p => ({
    ...p,
    units: p.units?.sort((a: ProductUnit, b: ProductUnit) => a.hierarchy_level - b.hierarchy_level) || []
  }))
}

export async function createProduct(
  productData: Omit<Product, 'id' | 'created_at' | 'category' | 'units'>,
  unitsData: ProductUnit[]
) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  // 1. Insertar el producto
  const { data: newProduct, error: productError } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
    
  if (productError) throw new Error(productError.message)

  // 2. Insertar las unidades asociadas
  if (unitsData.length > 0) {
    const unitsToInsert = unitsData.map(u => ({
      ...u,
      product_id: newProduct.id
    }))
    
    const { error: unitsError } = await supabase
      .from('product_units')
      .insert(unitsToInsert)
      
    if (unitsError) throw new Error(unitsError.message)
  }

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function updateProduct(
  id: string, 
  productData: Partial<Product>,
  unitsData?: ProductUnit[]
) {
  await requireAdmin()
  const supabase = await createAdminClient()

  // 1. Actualizar producto
  const { error: productError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    
  if (productError) throw new Error(productError.message)

  // 2. Actualizar unidades (si se proporcionan)
  if (unitsData) {
    // Para simplificar: borramos las actuales y creamos las nuevas
    await supabase.from('product_units').delete().eq('product_id', id)
    
    if (unitsData.length > 0) {
      const unitsToInsert = unitsData.map(u => ({
        ...u,
        product_id: id,
        id: undefined // Evitar intentar insertar el ID viejo si existe
      }))
      const { error: unitsError } = await supabase.from('product_units').insert(unitsToInsert)
      if (unitsError) throw new Error(unitsError.message)
    }
  }

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}
