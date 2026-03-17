-- ============================================================
-- MIGRACIÓN: Añadir campo de dirección a Depósitos
-- ============================================================

-- 1. Añadir columna direccion
ALTER TABLE public.depositos 
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- 2. (Opcional) Migrar datos existentes
-- Si los depósitos existentes tienen la dirección en el campo 'nombre', podemos copiarla.
UPDATE public.depositos SET direccion = nombre WHERE direccion IS NULL;
