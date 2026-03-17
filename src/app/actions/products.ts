'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ProductCategory = {
  id: string
  name: string
}

export type TemplateUnit = {
  id: string
  template_id: string
  unit_name: string
  conversion_factor: number
  hierarchy_level: number
  description?: string | null
}

export type UnitTemplate = {
  id: string
  name: string
  base_unit: string
  created_at?: string
  units?: TemplateUnit[]
}

export type Product = {
  id: string
  name: string
  sku: string | null
  unit_template_id: string | null
  category_id: string | null
  brand: string | null
  variant: string | null
  shield: string | null
  type: string | null
  proveedor_id: string
  created_at: string
  category?: ProductCategory
  template?: UnitTemplate
  proveedor?: { id: string, nombre: string }
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

export async function getTemplates(): Promise<UnitTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('unit_templates')
    .select(`
      *,
      units:template_units(*)
    `)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  // Ordenar unidades por jerarquía
  return (data || []).map(t => ({
    ...t,
    units: t.units?.sort((a: TemplateUnit, b: TemplateUnit) => a.hierarchy_level - b.hierarchy_level) || []
  }))
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      template:unit_templates(
        *,
        units:template_units(*)
      ),
      proveedor:proveedores(id, nombre)
    `)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  
  // Ordenar unidades por jerarquía dentro del template
  return (data || []).map(p => {
    if (p.template && p.template.units) {
      p.template.units.sort((a: TemplateUnit, b: TemplateUnit) => a.hierarchy_level - b.hierarchy_level)
    }
    return p
  })
}

export async function createProduct(
  productData: Omit<Product, 'id' | 'created_at' | 'category' | 'template' | 'proveedor'>
) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('products').insert(productData)
    
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function updateProduct(
  id: string, 
  productData: Partial<Product>
) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    
  if (error) throw new Error(error.message)


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

export async function createTemplate(
  templateData: { name: string, base_unit: string },
  unitsData: TemplateUnit[]
) {
  await requireAdmin()
  const supabase = await createAdminClient()
  
  const { data: newTemplate, error: templateError } = await supabase
    .from('unit_templates')
    .insert(templateData)
    .select()
    .single()
    
  if (templateError) throw new Error(templateError.message)

  if (unitsData.length > 0) {
    const unitsToInsert = unitsData.map(u => {
      const { id, ...rest } = u
      return {
        ...rest,
        template_id: newTemplate.id
      }
    })
    
    const { error: unitsError } = await supabase
      .from('template_units')
      .insert(unitsToInsert)
      
    if (unitsError) throw new Error(unitsError.message)
  }

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function updateTemplate(
  id: string, 
  templateData: { name: string, base_unit: string },
  unitsData: TemplateUnit[]
) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error: templateError } = await supabase
    .from('unit_templates')
    .update(templateData)
    .eq('id', id)
    
  if (templateError) throw new Error(templateError.message)

  await supabase.from('template_units').delete().eq('template_id', id)
  if (unitsData.length > 0) {
    const unitsToInsert = unitsData.map(u => {
      const { id: unitId, ...rest } = u
      return {
        ...rest,
        template_id: id
      }
    })
    const { error: unitsError } = await supabase.from('template_units').insert(unitsToInsert)
    if (unitsError) throw new Error(unitsError.message)
  }

  revalidatePath('/dashboard/catalog')
  return { success: true }
}

export async function deleteTemplate(id: string) {
  await requireAdmin()
  const supabase = await createAdminClient()

  const { error } = await supabase.from('unit_templates').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/catalog')
  return { success: true }
}
