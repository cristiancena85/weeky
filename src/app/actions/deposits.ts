'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
  sucursal_id?: string; 
  usuario_id?: string;
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
      creado_por: user.id
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
 * Carga ENS (Transferencia Depósito Central -> Vendedor)
 */
export async function crearCargaENS(carga: {
  vendedor_id: string;
  deposito_origen_id: string;
  deposito_destino_id: string;
  items: { producto_id: string; cantidad: number }[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  // 1. Insertar cabecera ENS
  const { data: ensData, error: ensError } = await supabase
    .from('cargas_ens')
    .insert([{
      vendedor_id: carga.vendedor_id,
      deposito_origen_id: carga.deposito_origen_id,
      deposito_destino_id: carga.deposito_destino_id,
      creado_por: user.id,
      estado: 'completado'
    }])
    .select()
    .single();

  if (ensError) throw new Error(ensError.message);

  // 2. Insertar items
  const itemsToInsert = carga.items.map(item => ({
    carga_id: ensData.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad
  }));

  const { error: itemsError } = await supabase
    .from('items_carga_ens')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  // 3. Actualizar stocks (Restar origen, Sumar destino)
  for (const item of carga.items) {
    // Restar del origen
    const { data: stockOrigen } = await supabase
      .from('stock_deposito')
      .select('cantidad')
      .eq('deposito_id', carga.deposito_origen_id)
      .eq('producto_id', item.producto_id)
      .single();

    if (!stockOrigen || stockOrigen.cantidad < item.cantidad) {
      throw new Error(`Stock insuficiente en origen para el producto ${item.producto_id}`);
    }

    await supabase
      .from('stock_deposito')
      .update({ cantidad: stockOrigen.cantidad - item.cantidad })
      .eq('deposito_id', carga.deposito_origen_id)
      .eq('producto_id', item.producto_id);

    // Sumar al destino
    const { data: stockDestino } = await supabase
      .from('stock_deposito')
      .select('cantidad')
      .eq('deposito_id', carga.deposito_destino_id)
      .eq('producto_id', item.producto_id)
      .single();

    const nuevaCantDestino = (stockDestino?.cantidad || 0) + item.cantidad;

    await supabase
      .from('stock_deposito')
      .upsert({
        deposito_id: carga.deposito_destino_id,
        producto_id: item.producto_id,
        cantidad: nuevaCantDestino,
        updated_at: new Date().toISOString()
      });
  }

  revalidatePath('/dashboard/depositos');
  return { success: true };
}
