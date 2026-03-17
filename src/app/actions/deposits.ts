'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Package,
  Truck,
  Building2,
  Users,
  ClipboardList,
  History,
  ArrowRightLeft,
  UserCircle,
  Settings2,
  UserSquare2
} from 'lucide-react';

/**
 * Gestión de Proveedores
 */
export async function getProveedores() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data;
}

export async function createProveedor(formData: { nombre: string; cuit?: string; direccion?: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proveedores')
    .insert([formData]);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

export async function updateProveedor(id: string, formData: { nombre: string; cuit?: string; direccion?: string; activo?: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proveedores')
    .update(formData)
    .eq('id', id);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

export async function deleteProveedor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

/**
 * Gestión de Depósitos
 */
export async function getDepositos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('depositos')
    .select(`
      *,
      sucursal:branches(name),
      vendedor:profiles(alias, first_name, last_name)
    `)
    .order('nombre');
  
  if (error) throw new Error(error.message);
  
  // Mapear para facilitar el uso de un nombre legible
  return data.map((d: any) => ({
    ...d,
    vendedor: d.vendedor ? {
      ...d.vendedor,
      full_name: d.vendedor.alias || `${d.vendedor.first_name || ''} ${d.vendedor.last_name || ''}`.trim() || 'Sin nombre'
    } : null
  }));
}

export async function createDeposito(formData: { 
  nombre: string; 
  tipo: 'central' | 'vendedor'; 
  sucursal_id?: string | null; 
  usuario_id?: string | null;
  direccion?: string;
  localidad?: string;
  activo?: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('depositos')
    .insert([formData]);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

export async function updateDeposito(id: string, formData: { 
  nombre?: string; 
  tipo?: 'central' | 'vendedor'; 
  sucursal_id?: string | null; 
  usuario_id?: string | null;
  direccion?: string;
  localidad?: string;
  activo?: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('depositos')
    .update(formData)
    .eq('id', id);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

export async function deleteDeposito(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('depositos')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
}

/**
 * Carga de Remito de Proveedor (Entrada de mercadería al depósito central)
 */
export async function cargarRemitoProveedor(remito: {
  proveedor_id: string;
  numero_remito: string;
  deposito_id: string;
  items: { producto_id: string; cantidad: number }[];
  foto_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  // 1. Insertar cabecera del remito
  const { data: remitoData, error: remitoError } = await supabase
    .from('remitos_proveedor')
    .insert([{
      proveedor_id: remito.proveedor_id,
      numero_remito: remito.numero_remito,
      deposito_id: remito.deposito_id,
      creado_por: user.id,
      foto_url: remito.foto_url
    }])
    .select()
    .single();

  if (remitoError) throw new Error(remitoError.message);

  // 2. Insertar items
  const itemsToInsert = remito.items.map(item => ({
    remito_id: remitoData.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad
  }));

  const { error: itemsError } = await supabase
    .from('items_remito_proveedor')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  // 3. Actualizar stock del depósito
  for (const item of remito.items) {
    // Intentar upsert del stock
    const { data: currentStock } = await supabase
      .from('stock_deposito')
      .select('cantidad')
      .eq('deposito_id', remito.deposito_id)
      .eq('producto_id', item.producto_id)
      .single();

    const nuevaCantidad = (currentStock?.cantidad || 0) + item.cantidad;

    const { error: stockError } = await supabase
      .from('stock_deposito')
      .upsert({
        deposito_id: remito.deposito_id,
        producto_id: item.producto_id,
        cantidad: nuevaCantidad,
        updated_at: new Date().toISOString()
      });

    if (stockError) throw new Error(stockError.message);
  }

  revalidatePath('/dashboard/depositos');
  return { success: true };
}

/**
 * Obtener historial de remitos del proveedor
 */
export async function getRemitosProveedor() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('remitos_proveedor')
    .select(`
      *,
      proveedor:proveedores(nombre),
      deposito:depositos(nombre),
      creador:profiles(alias, first_name, last_name),
      items:items_remito_proveedor(
        *,
        producto:products(name, sku)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((r: any) => ({
    ...r,
    creador_nombre: r.creador?.alias || `${r.creador?.first_name || ''} ${r.creador?.last_name || ''}`.trim() || 'Desconocido'
  }));
}


/**
 * Ajuste manual de stock (Carga inicial o inventario físico)
 */
export async function ajustarStockDeposito(ajuste: {
  deposito_id: string;
  items: { producto_id: string; cantidad: number }[];
  observaciones?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  // 1. Opcional: Registrar el ajuste en una tabla de auditoría si existiera
  // Por ahora actualizamos directamente la tabla stock_deposito

  for (const item of ajuste.items) {
    const { error: stockError } = await supabase
      .from('stock_deposito')
      .upsert({
        deposito_id: ajuste.deposito_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        updated_at: new Date().toISOString()
      });

    if (stockError) throw new Error(stockError.message);
  }

  // Podríamos registrar la actividad
  // await logActivity({ ... });

  revalidatePath('/dashboard/depositos');
  return { success: true };
}
