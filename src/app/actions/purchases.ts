'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cargarRemitoProveedor } from './deposits';

export type PurchaseOrderItem = {
  id?: string;
  producto_id: string;
  cantidad: number;
  precio_estimado?: number;
  producto?: {
    name: string;
  };
};

export type PurchaseOrder = {
  id: string;
  proveedor_id: string;
  deposito_id: string;
  estado: 'pendiente' | 'recibida' | 'cancelada';
  creado_por: string;
  notas?: string;
  created_at: string;
  proveedor?: { nombre: string };
  deposito?: { nombre: string };
  creador?: { alias: string };
  items?: PurchaseOrderItem[];
};

export async function getOrdenesCompra() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select(`
      *,
      proveedor:proveedores(nombre),
      deposito:depositos(nombre),
      creador:profiles(alias),
      items:items_orden_compra(
        *,
        producto:products(name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as PurchaseOrder[];
}

export async function createOrdenCompra(data: {
  proveedor_id: string;
  deposito_id: string;
  notas?: string;
  items: { producto_id: string; cantidad: number; precio_estimado?: number }[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  // 1. Insertar cabecera
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .insert([{
      proveedor_id: data.proveedor_id,
      deposito_id: data.deposito_id,
      notas: data.notas,
      creado_por: user.id
    }])
    .select()
    .single();

  if (ocError) throw new Error(ocError.message);

  // 2. Insertar items
  const itemsToInsert = data.items.map(item => ({
    orden_id: oc.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_estimado: item.precio_estimado
  }));

  const { error: itemsError } = await supabase
    .from('items_orden_compra')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath('/dashboard/depositos');
  return { success: true };
}

export async function recibirOrdenCompra(id: string, numeroRemito: string) {
  const supabase = await createClient();
  
  // 1. Obtener la OC con sus items
  const { data: oc, error: ocError } = await supabase
    .from('ordenes_compra')
    .select('*, items:items_orden_compra(*)')
    .eq('id', id)
    .single();

  if (ocError || !oc) throw new Error('No se encontró la orden de compra');
  if (oc.estado !== 'pendiente') throw new Error('Esta orden ya fue procesada');

  // 2. Crear Remito de Proveedor usando la acción existente
  // (Transformamos los items de la OC al formato del remito)
  try {
    await cargarRemitoProveedor({
      proveedor_id: oc.proveedor_id,
      numero_remito: numeroRemito,
      deposito_id: oc.deposito_id,
      items: oc.items.map((item: any) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad
      }))
    });

    // 3. Actualizar estado de la OC
    const { error: updateError } = await supabase
      .from('ordenes_compra')
      .update({ estado: 'recibida' })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    revalidatePath('/dashboard/depositos');
    return { success: true };
  } catch (error: any) {
    throw new Error('Error al generar remito desde OC: ' + error.message);
  }
}

export async function cancelarOrdenCompra(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('ordenes_compra')
    .update({ estado: 'cancelada' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/depositos');
  return { success: true };
}
