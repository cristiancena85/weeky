'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMovimientosDeposito() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('movimientos_deposito')
    .select(`
      *,
      origen:depositos!deposito_origen_id(nombre),
      destino:depositos!deposito_destino_id(nombre),
      creador:profiles(alias, first_name, last_name),
      items:items_movimiento_deposito(
        *,
        producto:products(name, sku, base_unit)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function crearMovimientoDeposito(movimiento: {
  deposito_origen_id: string;
  deposito_destino_id: string;
  observaciones?: string;
  items: { producto_id: string; cantidad: number }[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  // 1. Insertar cabecera del movimiento
  const { data: movData, error: movError } = await supabase
    .from('movimientos_deposito')
    .insert([{
      deposito_origen_id: movimiento.deposito_origen_id,
      deposito_destino_id: movimiento.deposito_destino_id,
      observaciones: movimiento.observaciones,
      creado_por: user.id
    }])
    .select()
    .single();

  if (movError) throw new Error(movError.message);

  // 2. Insertar items
  const itemsToInsert = movimiento.items.map(item => ({
    movimiento_id: movData.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad
  }));

  const { error: itemsError } = await supabase
    .from('items_movimiento_deposito')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  // 3. Actualizar stock en ambos depósitos
  for (const item of movimiento.items) {
    // a. Descontar del origen
    const { data: stockOrigen } = await supabase
      .from('stock_deposito')
      .select('cantidad')
      .eq('deposito_id', movimiento.deposito_origen_id)
      .eq('producto_id', item.producto_id)
      .single();

    const nuevaCantOrigen = (stockOrigen?.cantidad || 0) - item.cantidad;

    await supabase
      .from('stock_deposito')
      .upsert({
        deposito_id: movimiento.deposito_origen_id,
        producto_id: item.producto_id,
        cantidad: nuevaCantOrigen,
        updated_at: new Date().toISOString()
      });

    // b. Sumar al destino
    const { data: stockDestino } = await supabase
      .from('stock_deposito')
      .select('cantidad')
      .eq('deposito_id', movimiento.deposito_destino_id)
      .eq('producto_id', item.producto_id)
      .single();

    const nuevaCantDestino = (stockDestino?.cantidad || 0) + item.cantidad;

    await supabase
      .from('stock_deposito')
      .upsert({
        deposito_id: movimiento.deposito_destino_id,
        producto_id: item.producto_id,
        cantidad: nuevaCantDestino,
        updated_at: new Date().toISOString()
      });
  }

  revalidatePath('/dashboard/depositos');
  return { success: true };
}
