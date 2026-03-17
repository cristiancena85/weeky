-- ============================================================
-- MIGRACIÓN: Relación 1:1 Sucursal - Depósito
-- ============================================================

-- Asegurar que sucursal_id sea único en depósitos.
-- Esto permite múltiples NULL (vendedores) pero solo una fila por sucursal_id.
ALTER TABLE public.depositos
ADD CONSTRAINT deposits_sucursal_id_key UNIQUE (sucursal_id);
